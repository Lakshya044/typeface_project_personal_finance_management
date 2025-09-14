
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


export const GET = withAuth(async (user) => {
  const db = await getDb();
  const list = await db
    .collection("transactions")
    .find({ uid: user.uid })                         
    .sort({ date: -1 })
    .toArray();

  return NextResponse.json(list);
});
