import { pgTable, serial, numeric, timestamp, varchar } from "drizzle-orm/pg-core";

// Tabel untuk menyimpan riwayat harga emas
export const goldPrices = pgTable("gold_prices", {
  id: serial("id").primaryKey(),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  source: varchar("source", { length: 50 }).notNull(),
});
