import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { db } from '@/db';
import { goldPrices } from '@/db/schema';

// Vercel Cron will hit this URL every 10 minutes
export async function GET(request: Request) {
  // --- KEAMANAN TINGKAT TINGGI (CRON SECRET) ---
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch live Gold Futures (GC=F) from Yahoo Finance
    const quoteGold = await yahooFinance.quote('GC=F');
    const currentPriceUsd = quoteGold.regularMarketPrice;

    // 2. Fetch live USD to IDR exchange rate
    const quoteIdr = await yahooFinance.quote('IDR=X');
    const exchangeRateIdr = quoteIdr.regularMarketPrice;

    if (!currentPriceUsd || !exchangeRateIdr) {
      throw new Error("Could not fetch gold price or exchange rate");
    }

    // 3. Calculate Antam Price in IDR per gram
    // 1 Troy Ounce = 31.1034768 grams
    const rawPricePerGramIdr = (currentPriceUsd / 31.1034768) * exchangeRateIdr;
    
    // Add 5% premium for Antam physical minting (standard retail margin)
    const antamPriceIdr = rawPricePerGramIdr * 1.05;

    // 4. Save to Neon Database
    await db.insert(goldPrices).values({
      priceUsd: currentPriceUsd.toString(),
      antamPriceIdr: antamPriceIdr.toString(),
      source: 'Yahoo Finance',
    });

    return NextResponse.json({ 
      success: true, 
      priceUsd: currentPriceUsd, 
      antamPriceIdr: Math.round(antamPriceIdr), 
      time: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
