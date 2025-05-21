"use client";

import { useState, useEffect } from 'react';

interface Order {
  _id: string;
  userName: string;
  mobileNumber: string;
  foodItemName: string;
  quantity: number;
  price: number;
  total: number;
  deliveryStatus: string;
  orderTime: string;
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchOrders = async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`/api/orders?date=${today}`);
    const data = await res.json();
    setOrders(data.sort((a: Order, b: Order) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime()));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Replace with a secure authentication method
      setIsAdmin(true);
    } else {
      alert('Incorrect password');
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    const res = await fetch('/api/admin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: orderId.toString(), deliveryStatus: status }), // Ensure orderId is a string
    });
    if (res.ok) {
      fetchOrders();
    } else {
      const errorData = await res.json();
      console.error('Failed to update status:', errorData);
      alert('Failed to update status: ' + (errorData.error || 'Unknown error'));
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Today’s Orders</h1>
        {orders.length === 0 ? (
          <p>No orders today.</p>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white p-4 rounded-lg shadow-md">
                <p><strong>User:</strong> {order.userName} ({order.mobileNumber})</p>
                <p><strong>Food Item:</strong> {order.foodItemName}</p>
                <p><strong>Quantity:</strong> {order.quantity}</p>
                <p><strong>Total Bill:</strong> ₹{order.total}</p>
                <p><strong>Order Time:</strong> {new Date(order.orderTime).toLocaleString()}</p>
                <p><strong>Delivery Status:</strong> {order.deliveryStatus}</p>
                {order.deliveryStatus === 'Incomplete' && (
                  <button
                    onClick={() => updateStatus(order._id, 'Complete')}
                    className="mt-2 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}