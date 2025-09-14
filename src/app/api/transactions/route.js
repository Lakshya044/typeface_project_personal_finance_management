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
  const db = await getDb();
  const collection = db.collection("transactions");

  const url = new URL(req.url);
  const sp = url.searchParams;

  
  const startDateParam = sp.get("startDate");
  const endDateParam = sp.get("endDate");

  function normalizeDate(input) {
    if (!input) return null;
    
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    const [_, y, mo, d] = m;
    if (+mo < 1 || +mo > 12 || +d < 1 || +d > 31) return null;
    return `${y}-${mo}-${d}`;
  }

  const startDateNorm = normalizeDate(startDateParam);
  const endDateNorm = normalizeDate(endDateParam);

  if (startDateParam && !startDateNorm) {
    return NextResponse.json({ errors: ["Invalid startDate format (use YYYY-MM-DD)"] }, { status: 400 });
  }
  if (endDateParam && !endDateNorm) {
    return NextResponse.json({ errors: ["Invalid endDate format (use YYYY-MM-DD)"] }, { status: 400 });
  }
  if (startDateNorm && endDateNorm && startDateNorm > endDateNorm) {
    return NextResponse.json({ errors: ["startDate cannot be after endDate"] }, { status: 400 });
  }

  const hasPagination = sp.has("page") || sp.has("limit");
  const hasDateFilter = !!(startDateNorm || endDateNorm);


  const query = { uid: user.uid };


  if (hasDateFilter) {
    query.date = {};
    if (startDateNorm) query.date.$gte = startDateNorm;
    if (endDateNorm) query.date.$lte = endDateNorm;
  }

  if (hasPagination) {
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
    const limitRaw = parseInt(sp.get("limit") || "5", 10); // Changed default to 5
    const limit = Math.min(100, Math.max(1, isNaN(limitRaw) ? 5 : limitRaw)); // Changed default and max
    const skip = (page - 1) * limit;

    const totalCount = await collection.countDocuments(query);

    const items = await collection
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      items,
      totalCount,
      page,
      limit,
      // optional echo of applied filters
      startDate: startDateNorm || null,
      endDate: endDateNorm || null,
    });
  }

  // Legacy full list (still respects date filter if provided)
  const list = await collection
    .find(query)
    .sort({ date: -1 })
    .toArray();

  return NextResponse.json(list);
});
