import { NextResponse } from 'next/server';

// Simulate a user store (in a real app, use a database)
const users: { name: string; email: string }[] = [];

export async function POST(request: Request) {
  const { name, email } = await request.json();

  // Basic validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Check if user already exists (by email)
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  // Simulate saving the user
  users.push({ name, email });

  return NextResponse.json({ success: true }, { status: 200 });
}