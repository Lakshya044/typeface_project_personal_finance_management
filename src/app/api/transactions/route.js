import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { transactionSchema } from "@/lib/validation";
import { withAuth } from "@/lib/withAuth";

export const POST = withAuth(async (user, req) => {
  const body = await req.json();
  const parsed = transactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
  }

  const db = await getDb();
  const doc = { ...parsed.data, uid: user.uid };
  const { insertedId } = await db.collection("transactions").insertOne(doc);

  return NextResponse.json({ _id: insertedId }, { status: 201 });
});

export const GET = withAuth(async (user, req) => {
  try {
    const url = new URL(req.url);
    const sp = url.searchParams;
    const debug = sp.get("debug") === "1";

    const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
    const limitRaw = parseInt(sp.get("limit") || "20", 10);
    const limit = Math.min(100, Math.max(1, isNaN(limitRaw) ? 20 : limitRaw));

    const startDateStr = sp.get("startDate");
    const endDateStr = sp.get("endDate");

    const dateField = "date";
    const errors = [];
    let dateFilter = {};

    const parseDate = (value) => {
      if (!value) return null;
      const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? `${value}T00:00:00.000Z`
        : value;
      const d = new Date(normalized);
      return isNaN(d.getTime()) ? null : d;
    };

    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);

    if (startDateStr && !startDate) errors.push("Invalid startDate format");
    if (endDateStr && !endDate) errors.push("Invalid endDate format");
    if (startDate && endDate && startDate > endDate)
      errors.push("startDate cannot be after endDate");

    if (errors.length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    if (startDate || endDate) {
      dateFilter[dateField] = {};
      if (startDate) dateFilter[dateField]["$gte"] = startDate;
      if (endDate) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(endDateStr)) {
          const inclusiveEnd = new Date(endDate);
          inclusiveEnd.setUTCHours(23, 59, 59, 999);
          dateFilter[dateField]["$lte"] = inclusiveEnd;
        } else {
          dateFilter[dateField]["$lte"] = endDate;
        }
      }
    }

    const db = await getDb();

    let storageType = "unknown";
    const sampleDoc = await db
      .collection("transactions")
      .find({ uid: user.uid }, { projection: { [dateField]: 1 }, limit: 1 })
      .toArray()
      .then((arr) => arr[0]);

    if (sampleDoc && sampleDoc[dateField] != null) {
      storageType = Object.prototype.toString
        .call(sampleDoc[dateField])
        .slice(8, -1);
    }

    if (
      storageType === "String" &&
      dateFilter[dateField] &&
      (dateFilter[dateField]["$gte"] || dateFilter[dateField]["$lte"])
    ) {
      const original = dateFilter[dateField];
      const converted = {};
      if (original.$gte instanceof Date) {
        converted.$gte = original.$gte.toISOString().slice(0, 10);
      }
      if (original.$lte instanceof Date) {
        converted.$lte = original.$lte.toISOString().slice(0, 10);
      }
      dateFilter[dateField] = converted;
    }

    const query = { uid: user.uid, ...dateFilter };

    const totalCount = await db
      .collection("transactions")
      .countDocuments(query);

    const skip = (page - 1) * limit;

    const items = await db
      .collection("transactions")
      .find(query)
      .sort({ [dateField]: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const payload = {
      items,
      totalCount,
      page,
      limit,
    };

    if (debug) {
      payload.debug = {
        storageType,
        appliedDateFilter: dateFilter[dateField] || null,
        rawInputs: { startDateStr, endDateStr },
      };
    }

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch transactions", details: err.message },
      { status: 500 }
    );
  }
});
