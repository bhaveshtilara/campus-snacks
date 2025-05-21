import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';

export async function POST(req: NextRequest) {
  const orderData = await req.json();
  const { db } = await connectToDatabase();

  const result = await db.collection('orders').insertOne(orderData);
  return NextResponse.json(result, { status: 200 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mobileNumber = searchParams.get('mobileNumber');
  const date = searchParams.get('date');
  const { db } = await connectToDatabase();

  let query: any = {};
  if (mobileNumber) {
    query.mobileNumber = mobileNumber;
  }
  if (date) {
    query.orderTime = { $gte: `${date}T00:00:00.000Z`, $lte: `${date}T23:59:59.999Z` };
  }

  const orders = await db.collection('orders').find(query).toArray();
  return NextResponse.json(orders);
}