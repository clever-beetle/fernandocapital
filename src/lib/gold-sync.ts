/**
 * PROMPT 19 (TASK 1) — YAHOO FINANCE GOLD INGESTION DISABLED FOR COMPLIANCE
 *
 * Automated fetching from Yahoo Finance (`yahoo-finance2`) is hard-disabled
 * because Yahoo's Terms of Service do not grant automated scraping or commercial
 * redistribution rights for public market quotes.
 *
 * - Performs zero external Yahoo Finance HTTP requests.
 * - Performs zero database writes to `public.gold_prices`.
 * - Existing historical rows in `public.gold_prices` remain preserved and untouched.
 */

export const YAHOO_GOLD_SYNC_DISABLED_MESSAGE =
  "DISABLED (Compliance): Sinkronisasi otomatis emas Yahoo Finance dinonaktifkan karena pembatasan lisensi redistribusi komersial. Gunakan kalkulator simulasi referensi internal dengan input harga acuan yang dapat disesuaikan.";

export type GoldSyncResult =
  | {
      ok: false;
      status: "disabled";
      code: "YAHOO_FINANCE_DISABLED";
      error: string;
    }
  | {
      ok: false;
      status: "cooldown";
      retryAfterSeconds: number;
    }
  | {
      ok: false;
      status: "error";
      error: string;
    };

export async function executeGoldSync(_options?: {
  cooldownSeconds?: number;
}): Promise<GoldSyncResult> {
  void _options;
  return {
    ok: false,
    status: "disabled",
    code: "YAHOO_FINANCE_DISABLED",
    error: YAHOO_GOLD_SYNC_DISABLED_MESSAGE,
  };
}
