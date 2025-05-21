import { NextResponse } from 'next/server';

// Sample in-memory data with updated category
const foodItems = [
  { _id: 1, name: 'Samosa', category: 'Snacks', price: 20, image: '/images/samosa.jpg' },
  { _id: 2, name: 'Spring Roll', category: 'Chinese', price: 30, image: '/images/spring-roll.jpg' },
  { _id: 3, name: 'Biryani', category: 'Main Course', price: 100, image: '/images/biryani.jpg' },
  { _id: 4, name: 'Gulab Jamun', category: 'Desserts', price: 40, image: '/images/gulab-jamun.jpg' },
  { _id: 5, name: 'Chowmein', category: 'Chinese', price: 50, image: '/images/chowmein.jpg' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('search')?.toLowerCase();

  if (searchQuery) {
    const filteredItems = foodItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery) ||
      item.category.toLowerCase().includes(searchQuery)
    );
    return NextResponse.json(filteredItems);
  }

  return NextResponse.json(foodItems);
}