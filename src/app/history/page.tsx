"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface Order {
  _id: string;
  userId: string;
  foodItemId: number;
  quantity: number;
  totalPrice: number;
  orderDate: string;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch orders for the logged-in user
        try {
          const res = await fetch(`/api/orders?userId=${user.uid}`);
          if (res.ok) {
            const data = await res.json();
            setOrders(data);
            setError(null);
          } else {
            setError('Failed to fetch order history');
            setOrders([]);
          }
        } catch (err) {
          setError('Error fetching order history');
          setOrders([]);
        } finally {
          setLoading(false);
        }
      } else {
        // Redirect to login if not authenticated
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Order History</h1>
      {orders.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-4">
              <p className="text-lg font-semibold">Order ID: {order._id}</p>
              <p>Food Item ID: {order.foodItemId}</p>
              <p>Quantity: {order.quantity}</p>
              <p>Total Price: ₹{order.totalPrice}</p>
              <p>Order Date: {new Date(order.orderDate).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No orders found.</p>
      )}
    </div>
  );
}