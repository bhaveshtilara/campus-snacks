"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

interface FoodItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
}

interface Order {
  id: string;
  userId: string;
  foodItemId: number;
  quantity: number;
  totalPrice: number;
  orderDate: string;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showSidebar, setShowSidebar] = useState(false);
  const [isSignupForm, setIsSignupForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setEmail(user.email || '');
        setUserId(user.uid);
        try {
          const res = await fetch(`/api/orders?userId=${user.uid}`);
          if (res.ok) {
            const data = await res.json();
            setOrders(data);
          } else {
            console.error('Failed to fetch orders:', res.statusText);
            setOrders([]);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
          setOrders([]);
        }
      } else {
        setIsLoggedIn(false);
        setEmail('');
        setUserId(null);
        setOrders([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchFoodItems() {
      const res = await fetch('/api/foods');
      const data = await res.json();
      console.log('Fetched food items:', data); // Debug log
      setFoodItems(data);
    }
    fetchFoodItems();
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setShowSidebar(false);
      setIsSignupForm(false);
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setShowSidebar(false);
      setIsSignupForm(false);
    }
  }, []);

  useEffect(() => {
    if (showSidebar) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSidebar, handleClickOutside, handleKeyDown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowSidebar(false);
      setPassword('');
    } catch (error: any) {
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (name.trim() === '' || !emailRegex.test(email)) {
      alert('Please enter a valid name and email address');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Signup successful! Please log in.');
      setIsSignupForm(false);
      setName('');
      setEmail('');
      setPassword('');
    } catch (error: any) {
      alert(`Signup failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setEmail('');
      setUserId(null);
      setOrders([]);
    } catch (error: any) {
      alert(`Logout failed: ${error.message}`);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === '') return;

    const res = await fetch(`/api/foods?search=${searchQuery}`);
    const data = await res.json();
    setFoodItems(data);
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const handleOrderClick = (id: number) => {
    if (!isLoggedIn) {
      alert('Please log in to place an order.');
      setShowSidebar(true);
      return;
    }
    router.push(`/orders/${id}`);
  };

  const handleOrderHistoryClick = () => {
    if (!isLoggedIn) {
      alert('Please log in to view order history.');
      setShowSidebar(true);
      return;
    }
    router.push('/history');
  };

  const filteredItems = selectedCategory === 'All'
    ? foodItems
    : foodItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Campus Canteen</h1>
          </div>
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="Search food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 p-2 rounded-l-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="p-2 bg-blue-500 rounded-r-lg hover:bg-blue-600"
              >
                Search
              </button>
            </form>
            <button
              onClick={handleOrderHistoryClick}
              className={`px-3 py-2 rounded-lg hover:bg-blue-500 ${
                !isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!isLoggedIn}
            >
              Order History
            </button>
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span>Welcome, {email}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg hover:bg-blue-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSidebar(true)}
                className="px-3 py-2 rounded-lg hover:bg-blue-600"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar for Login/Signup */}
      {showSidebar && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => { setShowSidebar(false); setIsSignupForm(false); }} />
          <div
            ref={sidebarRef}
            className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
              showSidebar ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-6 flex flex-col h-full">
              <button
                onClick={() => { setShowSidebar(false); setIsSignupForm(false); }}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                aria-label="Close sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  CC
                </div>
              </div>

              {isSignupForm ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Sign Up for Campus Canteen</h2>
                  <form onSubmit={handleSignup} className="space-y-4 flex-grow">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Enter Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        id="email-signup"
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      />
                    </div>
                    <div>
                      <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        id="password-signup"
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                    >
                      Sign Up
                    </button>
                  </form>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        onClick={() => setIsSignupForm(false)}
                        className="text-blue-500 hover:underline"
                      >
                        Login
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Login to Campus Canteen</h2>
                  <form onSubmit={handleLogin} className="space-y-4 flex-grow">
                    <div>
                      <label htmlFor="email-login" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        id="email-login"
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label htmlFor="password-login" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        id="password-login"
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                    >
                      Login
                    </button>
                  </form>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Don’t have an account?{' '}
                      <button
                        onClick={() => setIsSignupForm(true)}
                        className="text-blue-500 hover:underline"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Main Content: Category Buttons and Food Items Grid */}
      <div className="container mx-auto p-6">
        <div className="flex flex-wrap justify-center space-x-4 mb-6">
          {['All', 'Snacks', 'Chinese', 'Main Course', 'Desserts'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                selectedCategory === category ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'
              } transition-colors`}
            >
              {category}
            </button>
          ))}
        </div>
        {foodItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item: FoodItem, index: number) => (
              <div
                key={item.id ?? `food-item-${index}`} // Fallback to index if item.id is undefined
                onClick={() => handleOrderClick(item.id)}
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  isLoggedIn ? 'cursor-pointer hover:shadow-lg transition-shadow' : 'cursor-not-allowed opacity-90'
                }`}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={150}
                  height={150}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">₹{item.price}</p>
                  <p className="text-sm text-gray-500">{item.category}</p>
                  {!isLoggedIn && (
                    <p className="text-sm text-red-500 mt-2">
                      Log in to order
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome to Campus Canteen
            </h2>
            <p className="text-gray-600 mb-6">
              No food items available at the moment. Please check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}