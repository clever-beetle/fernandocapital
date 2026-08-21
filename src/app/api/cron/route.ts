import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { db } from '@/db';
import { goldPrices } from '@/db/schema';

// Vercel Cron will hit this URL every 10 minutes
export async function GET(request: Request) {
  // --- KEAMANAN TINGKAT TINGGI (CRON SECRET) ---
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch live Gold Futures (GC=F) from Yahoo Finance
    const quote = await yahooFinance.quote('GC=F');
    const currentPrice = quote.regularMarketPrice;

    if (!currentPrice) {
      throw new Error("Could not fetch gold price");
    }

    // 2. Save it to Neon Database
    await db.insert(goldPrices).values({
      priceUsd: currentPrice.toString(),
      source: 'Yahoo Finance',
    });

    return NextResponse.json({ success: true, price: currentPrice, time: new Date().toISOString() });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
