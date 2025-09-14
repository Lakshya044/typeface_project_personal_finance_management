import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { transactionSchema } from "@/lib/validation";
import { withAuth } from "@/lib/withAuth";

// --- helper (extracted for reuse) ---
function normalizeDate(input) {
  if (!input || typeof input !== 'string') return null;
  const m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  if (+mo < 1 || +mo > 12 || +d < 1 || +d > 31) return null;
  return `${y}-${mo}-${d}`;
}

// POST (unchanged logic, added safe JSON parse + explicit createdAt)
export const POST = withAuth(async (user, req) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ errors: ["Invalid JSON body"] }, { status: 400 });
  }
  const parsed = transactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
  }
  const db = await getDb();
  const doc = { ...parsed.data, uid: user.uid, createdAt: new Date() };
  const { insertedId } = await db.collection("transactions").insertOne(doc);
  return NextResponse.json({ _id: insertedId }, { status: 201 });
});

// GET (extended: summary mode + small refactor)
export const GET = withAuth(async (user, req) => {
  const db = await getDb();
  const collection = db.collection("transactions");
  const url = new URL(req.url);
  const sp = url.searchParams;

  const startDateNorm = normalizeDate(sp.get("startDate"));
  const endDateNorm = normalizeDate(sp.get("endDate"));

  if (sp.get("startDate") && !startDateNorm) {
    return NextResponse.json({ errors: ["Invalid startDate format (use YYYY-MM-DD)"] }, { status: 400 });
  }
  if (sp.get("endDate") && !endDateNorm) {
    return NextResponse.json({ errors: ["Invalid endDate format (use YYYY-MM-DD)"] }, { status: 400 });
  }
  if (startDateNorm && endDateNorm && startDateNorm > endDateNorm) {
    return NextResponse.json({ errors: ["startDate cannot be after endDate"] }, { status: 400 });
  }

  const query = { uid: user.uid };
  if (startDateNorm || endDateNorm) {
    query.date = {};
    if (startDateNorm) query.date.$gte = startDateNorm;
    if (endDateNorm) query.date.$lte = endDateNorm;
  }

  // NEW: summary=1 -> aggregated totals (no pagination, lightweight)
  if (sp.get("summary") === "1") {
    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: { $cond: [{ $lt: ["$amount", 0] }, "$amount", 0] } },
          totalIncome: { $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] } },
          count: { $count: {} }
        }
      },
      {
        $project: {
          _id: 0,
          totalExpense: 1,
            totalIncome: 1,
          net: { $add: ["$totalExpense", "$totalIncome"] },
          count: 1
        }
      }
    ];
    const [agg] = await collection.aggregate(pipeline).toArray();
    return NextResponse.json({
      summary: {
        totalExpense: Number((agg?.totalExpense || 0).toFixed(2)),
        totalIncome: Number((agg?.totalIncome || 0).toFixed(2)),
        net: Number((agg?.net || 0).toFixed(2)),
        count: agg?.count || 0
      },
      startDate: startDateNorm || null,
      endDate: endDateNorm || null
    });
  }

  const hasPagination = sp.has("page") || sp.has("limit");
  if (hasPagination) {
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
    const limitRaw = parseInt(sp.get("limit") || "5", 10);
    const limit = Math.min(100, Math.max(1, isNaN(limitRaw) ? 5 : limitRaw));
    const skip = (page - 1) * limit;

    const totalCount = await collection.countDocuments(query);
    const items = await collection
      .find(query)
      .sort({ date: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      items,
      totalCount,
      page,
      limit,
      startDate: startDateNorm || null,
      endDate: endDateNorm || null,
    });
  }

  // Non‑paginated list (legacy)
  const list = await collection
    .find(query)
    .sort({ date: -1, _id: -1 })
    .toArray();
  return NextResponse.json(list);
});
