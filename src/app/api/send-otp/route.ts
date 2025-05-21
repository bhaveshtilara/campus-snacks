import { NextResponse } from 'next/server';
import otpStore from '../../lib/otpStore';

export async function POST(request: Request) {
  const { email } = await request.json();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore.set(email, otp);
  console.log(`OTP for ${email}: ${otp}`);
  return NextResponse.json({ success: true }, { status: 200 });
}