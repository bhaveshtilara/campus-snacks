import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId

export async function PUT(req: NextRequest) {
  const { orderId, deliveryStatus } = await req.json();
  const { db } = await connectToDatabase();

  try {
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) }, // Convert orderId to ObjectId
      { $set: { deliveryStatus } }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}