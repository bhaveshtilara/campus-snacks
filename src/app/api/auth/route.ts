import { NextResponse } from 'next/server';
import otpStore from '../../lib/otpStore';

export async function POST(request: Request) {
  const { email, otp } = await request.json();
  if (!email || otp.length !== 4) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const storedOtp = otpStore.get(email);
  if (storedOtp && storedOtp === otp) {
    otpStore.delete(email);
    return NextResponse.json({ success: true }, { status: 200 });
  }
  return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
}