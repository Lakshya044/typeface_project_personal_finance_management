
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { budgetSchema } from "@/lib/validation";
import { withAuth } from "@/lib/withAuth";


export const POST = withAuth(async (user, req) => {
  const body = await req.json();
  const parsed = budgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
  }

  const { month, category, amount } = parsed.data;
  const db = await getDb();
  await db.collection("budgets").updateOne(
    { uid: user.uid, month, category },        
    { $set: { amount } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true }, { status: 201 });
});


export const GET = withAuth(async (user, req) => {
  const month = new URL(req.url).searchParams.get("month"); 
  const query = month
    ? { uid: user.uid, month }
    : { uid: user.uid };

  const db = await getDb();
  const list = await db.collection("budgets").find(query).toArray();

  return NextResponse.json(list);
});
