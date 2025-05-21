"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

interface FoodItem {
  _id: number;
  name: string;
  category: string;
  price: number;
  image: string;
}

interface Order {
  userName: string;
  mobileNumber: string;
  foodItemName: string;
  quantity: number;
  price: number;
  total: number;
  deliveryStatus: string;
  orderTime: string;
}

export default function OrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function fetchFoodItem() {
      const res = await fetch(`/api/foods?id=${id}`);
      const data = await res.json();
      setFoodItem(data);
    }
    fetchFoodItem();
  }, [id]);

  const handleOrder = async () => {
    if (!foodItem) return;
    const mobileNumber = localStorage.getItem('mobileNumber') || '';
    const orderData = {
      userName: 'User', // Replace with actual user name if available
      mobileNumber,
      foodItemName: foodItem.name,
      quantity,
      price: foodItem.price,
      total: foodItem.price * quantity,
      deliveryStatus: 'Incomplete',
      orderTime: new Date().toISOString(),
    };
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (res.ok) {
      setOrder(orderData);
    } else {
      alert('Failed to place order');
    }
  };

  if (!foodItem) return <div>Loading...</div>;

  if (order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Order Receipt</h1>
          <p><strong>User Name:</strong> {order.userName}</p>
          <p><strong>Mobile Number:</strong> {order.mobileNumber}</p>
          <p><strong>Food Item:</strong> {order.foodItemName}</p>
          <p><strong>Quantity:</strong> {order.quantity}</p>
          <p><strong>Price per Item:</strong> ₹{order.price}</p>
          <p><strong>Total Bill:</strong> ₹{order.total}</p>
          <p><strong>Delivery Status:</strong> {order.deliveryStatus}</p>
          <p><strong>Order Time:</strong> {new Date(order.orderTime).toLocaleString()}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Place Order</h1>
        <div className="flex justify-center mb-4">
          <Image src={foodItem.image} alt={foodItem.name} width={150} height={150} className="rounded-lg" />
        </div>
        <h2 className="text-lg font-semibold">{foodItem.name}</h2>
        <p className="text-gray-600">₹{foodItem.price}</p>
        <p className="text-sm text-gray-500">{foodItem.category}</p>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full p-3 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleOrder}
          className="mt-6 w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}