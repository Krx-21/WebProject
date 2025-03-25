import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://backend-delta-tawny-40.vercel.app/api/v1/rentalCarProviders', {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching RCPs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}