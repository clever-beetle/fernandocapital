# Financial Data Provider Matrix & Licensing Governance
**Project:** Fernando Capital (`https://fernandocapital.web.id`)  
**Phase:** Phase 3C-2 — Provider Adapter Foundation  
**Target Environment:** Development (`fc-phase2-dev` / `neondb`)

---

## 1. Executive Summary & Governance Principles

Fernando Capital enforces an institutional **Provenance-First, License-Verified** policy for all market and macroeconomic data adapters:

1. **No Unlicensed Commercial Redistribution:** Availability of a technical HTTP endpoint or free developer tier does **not** grant permission to display or redistribute raw market data on a public financial platform. Any provider whose free tier prohibits commercial/public display remains **`DISABLED`** or **`PENDING_LICENSE_REVIEW`** in code until an appropriate commercial tier or license is verified.
2. **No Fabricated Identifiers or Dummy Data:** Where an official provider requires authenticated catalog lookup to confirm internal variable/period codes (such as BPS WebAPI dynamic variable IDs for `ID_CPI_YOY` and `ID_GDP`), the indicator is marked **`BLOCKED`** rather than guessing variable IDs or returning mock values.
3. **Strict Server-Only Execution & Credential Redaction:** All provider adapters execute exclusively on the server (`server-only` boundary), read API keys only from `process.env`, redact credentials from every log/error/URL trace, and never perform network requests on module import.
4. **Series & Frequency Alignment:** Every indicator's `update_frequency` and `freshness_sla_seconds` in `public.market_indicators` must match the exact publication cadence of the mapped upstream series.

---

## 2. Master Indicator & Equity Provider Matrix

| Indicator / Asset Code | Source Name | Provider & Official Endpoint | Provider Series ID / Symbol | Native Frequency (`update_frequency`) | Unit / Currency / Timezone | Auth Method & API Key Env Var | Quota & Rate Limits | Commercial Usage & Public Display Rights | Integration Readiness Status | Permitted Fallback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`USD_IDR`** | European Central Bank (ECB) Reference Rate via Frankfurter | **Frankfurter API v2** (`GET https://api.frankfurter.dev/v2/rate/usd/idr`) | `base=USD`, `quote=IDR` (`usd/idr`) | Daily working-day reference (`daily_eod`) | `IDR` / `IDR` / `Asia/Jakarta` (ECB cut ~16:00 CET) | Keyless Public REST (`FRANKFURTER_API_BASE_URL` optional override) | Fair-use rate limit; no hard daily/monthly cap (updates once per business day) | **Permitted.** Open-source service over public ECB reference rates; commercial use allowed. Must be labeled as **Daily Reference Exchange Rate** (not official Bank Indonesia JISDOR). | **`READY`** (`frankfurter` adapter enabled) | Preserve last verified DB observation (`is_stale_fallback = true`); manual editor override in `/studio`. |
| **`FED_FUNDS`** | Board of Governors of the Federal Reserve System (H.15 Release) | **FRED API** (`GET https://api.stlouisfed.org/fred/series/observations`) | **`DFF`** *(Daily Effective Federal Funds Rate)* — see Section 3.B for `DFF` vs `FEDFUNDS` resolution | Daily business-day release (`daily_eod`) | `PERCENT` / `USD` / `America/New_York` | Query param `api_key` via `FRED_API_KEY` | ~120 requests/min (free registered API key) | **Public Domain: Citation Required** (17 U.S.C. § 105 U.S. Government work). Requires FRED citation and non-endorsement disclaimer. | **`READY_WITH_KEY`** (`fred` adapter enabled when `FRED_API_KEY` is set) | Preserve last verified DB observation; manual editor verification from Federal Reserve H.15 release. |
| **`US_10Y`** | Board of Governors of the Federal Reserve System (H.15 Release) | **FRED API** (`GET https://api.stlouisfed.org/fred/series/observations`) | **`DGS10`** *(10-Year Treasury Constant Maturity Rate)* | Daily business-day release (`daily_eod`) | `PERCENT` / `USD` / `America/New_York` | Query param `api_key` via `FRED_API_KEY` | ~120 requests/min (free registered API key) | **Public Domain: Citation Required** (17 U.S.C. § 105 U.S. Government work). Requires FRED citation and non-endorsement disclaimer. | **`READY_WITH_KEY`** (`fred` adapter enabled when `FRED_API_KEY` is set) | Preserve last verified DB observation; manual editor verification from Federal Reserve H.15 release. |
| **`ID_CPI_YOY`** | Badan Pusat Statistik (BPS RI) | **BPS WebAPI** (`GET https://webapi.bps.go.id/v1/api/list/model/data/lang/ind/domain/0000/var/{var_id}/key/{key}/`) | **Unverified** (`var_id`, `turvar`, `th` require authenticated catalog query) | Monthly release (`monthly`) | `PERCENT` / `NONE` / `Asia/Jakarta` | Path/query parameter via `BPS_API_KEY` | Free government developer portal key; rate-limited per account | Official Republic of Indonesia open statistical data; commercial/editorial display permitted with attribution to *Badan Pusat Statistik (BPS RI)*. | **`BLOCKED`** (`bps` adapter blocked until `BPS_API_KEY` is provisioned and exact `var_id`/`turvar` codes are verified against BPS catalog) | Editor-verified input in `/studio` sourced from official monthly BPS *Berita Resmi Statistik (BRS)* PDF/release. |
| **`ID_GDP`** | Badan Pusat Statistik (BPS RI) | **BPS WebAPI** (`GET https://webapi.bps.go.id/v1/api/list/model/data/lang/ind/domain/0000/var/{var_id}/key/{key}/`) | **Unverified** (`var_id`, `turvar`, `th` require authenticated catalog query) | Quarterly release (`quarterly`) | `PERCENT` / `NONE` / `Asia/Jakarta` | Path/query parameter via `BPS_API_KEY` | Free government developer portal key; rate-limited per account | Official Republic of Indonesia open statistical data; commercial/editorial display permitted with attribution to *Badan Pusat Statistik (BPS RI)*. | **`BLOCKED`** (`bps` adapter blocked until `BPS_API_KEY` is provisioned and exact `var_id`/`turvar` codes are verified against BPS catalog) | Editor-verified input in `/studio` sourced from official quarterly BPS *Berita Resmi Statistik (BRS)* PDB release. |
| **`XAU_USD`** | Global Spot Bullion Market (evaluated via Twelve Data) | **Twelve Data API** (`GET https://api.twelvedata.com/time_series` or `/price`) | `symbol=XAU/USD` | Daily EOD / Intraday (`daily_eod` in registry) | `USD_PER_OZ` / `USD` / `UTC` | Header `Authorization: apikey` or query `apikey` via `TWELVE_DATA_API_KEY` | Free Basic tier: 800 credits/day, 8 credits/min | **Restricted on Free Tier.** Twelve Data Basic (free) plan is restricted to personal/non-commercial evaluation and does not grant public redistribution rights without a commercial agreement. | **`DISABLED`** (`twelve_data` adapter hard-disabled in config until commercial display license & API key are approved) | Editor-verified spot bullion observation or licensed commodity data feed. |
| **`IHSG`** & Tracked IDX Equities (`BBCA`, `ANTM`, `BMRI`, `TLKM`, `ASII`) | Bursa Efek Indonesia (BEI / IDX) | Evaluated: Sectors.app, EODHD (`.JK`), GoAPI.io | `IHSG` (`^JKSE` / `JKSE.INDX`), `BBCA`, `ANTM`, `BMRI`, `TLKM`, `ASII` | Daily EOD closing (`daily_eod`) | `INDEX_PTS` (IHSG) & `IDR` (Equities) / `IDR` / `Asia/Jakarta` | N/A (No active automated provider enabled) | Varies by vendor ($19.99–$53/mo personal/developer tiers) | **Exchange Licensing Restriction.** IDX market data policies distinguish personal API usage from public display/redistribution on a web platform. Unofficial scraping is prohibited. | **`PENDING_LICENSE_REVIEW`** (no automated IDX price scraper or unlicensed third-party feed enabled) | Editor-verified EOD closing prices & quarterly audited BEI financial filings (`idx.co.id`) entered via `/studio`. |
| **`BI_RATE`** | Bank Indonesia (Rapat Dewan Gubernur / RDG) | Official Bank Indonesia Monetary Policy Release (`https://www.bi.go.id`) | N/A (`editor_verified`) | Monthly RDG decision (`monthly`) | `PERCENT` / `NONE` / `Asia/Jakarta` | Server-authenticated `/studio` Editor Session (30% Human Oversight) | N/A (12 RDG meetings per year) | Public central bank policy fact; cite *Bank Indonesia (RDG)*. | **`EDITOR_VERIFIED`** (by design — no automated scraping) | Existing last-known-good verified record in `market_indicators`. |
| **`SBN_10Y`** | Penilai Harga Efek Indonesia (PHEI / IBPA) | Official PHEI / IBPA Benchmark Yield Release (`https://www.phei.co.id`) | N/A (`editor_verified`) | Daily EOD (`daily_eod`) | `PERCENT` / `IDR` / `Asia/Jakarta` | Server-authenticated `/studio` Editor Session (30% Human Oversight) | N/A | Public benchmark yield reference; cite *PHEI / IBPA*. | **`EDITOR_VERIFIED`** (by design — no automated scraping) | Existing last-known-good verified record in `market_indicators`. |
| **`ANTAM_1G_IDR`** | Derived Physical Gold Parity Engine | Internal Deterministic Formula (`src/lib/gold-pricing.ts`) | Derived from `XAU_USD` & `USD_IDR` (`derived_code`) | Daily EOD (`daily_eod`) | `IDR_PER_GRAM` / `IDR` / `Asia/Jakarta` | Internal deterministic engine | N/A | Proprietary deterministic estimate. **Must never be labeled as official PT Antam Tbk / Logam Mulia retail price** unless explicitly overridden by an Editor-verified Logam Mulia quote. | **`DERIVED_CODE`** (awaiting verified `XAU_USD` and `USD_IDR` inputs; no new formula added in Phase 3C-2) | Existing `gold_prices` baseline / Editor-verified quote. |

---

## 3. Detailed Provider Evaluations & Metadata Decisions

### A. `USD_IDR` — Frankfurter API v2 (`api.frankfurter.dev`)
- **Official Endpoint:** `GET https://api.frankfurter.dev/v2/rate/USD/IDR` (or configurable base URL via `FRANKFURTER_API_BASE_URL`, defaulting to `https://api.frankfurter.dev/v2`).
- **Response Schema (v2):**
  ```json
  {
    "date": "2026-11-23",
    "base": "USD",
    "quote": "IDR",
    "rate": 15845.5
  }
  ```
- **Underlying Data & Provenance Rule:** Frankfurter tracks daily institutional reference exchange rates published by the European Central Bank (ECB) around 16:00 CET on working days.
  - It is a **daily reference exchange rate**, **not** Bank Indonesia's official JISDOR or Kurs Transaksi BI.
  - The adapter records `observedAt` strictly from the `date` field returned by the provider (`YYYY-MM-DDT00:00:00.000Z`), never substituting `Date.now()` as the observation timestamp.
- **Commercial & Public Display Terms:** Frankfurter is open-source (MIT) and explicitly allows commercial use without an API key or mandatory backlink. Fernando Capital attributes the rate as: `"European Central Bank (ECB) Reference Rate via Frankfurter (Daily Reference, non-JISDOR)"`.

---

### B. `FED_FUNDS` and `US_10Y` — FRED API (`api.stlouisfed.org`)
- **Official Endpoint:** `GET https://api.stlouisfed.org/fred/series/observations?series_id={SERIES_ID}&api_key={FRED_API_KEY}&file_type=json&sort_order=desc&limit=10`
- **Series Comparison & Registry Alignment (`DFF` vs `FEDFUNDS`):**
  - `FEDFUNDS` (*Federal Funds Effective Rate*): Published with **Monthly** frequency (monthly average of daily rates).
  - `DFF` (*Federal Funds Effective Rate*): Published with **Daily** frequency (7-day/daily observations from Federal Reserve Statistical Release H.15).
  - `DGS10` (*Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity*): Published with **Daily** frequency (business days from Federal Reserve Statistical Release H.15).
- **Explicit Metadata Correction Made in Phase 3C-2:**
  - In Phase 3C-1, `market_indicators` registered `FED_FUNDS` with `update_frequency = 'daily_eod'` and `freshness_sla_seconds = 259200` (72 hours), but its `source_url` referenced `https://fred.stlouisfed.org/series/FEDFUNDS` (which is a monthly series).
  - **Resolution:** To keep `FED_FUNDS` aligned with its registered `daily_eod` frequency and match `US_10Y` (`DGS10`), Fernando Capital maps indicator code `FED_FUNDS` to FRED series **`DFF`** (*Daily Effective Federal Funds Rate, H.15 Release*).
  - `INITIAL_MARKET_INDICATOR_REGISTRY` and the development database `fc-phase2-dev` have been updated via a safe, non-destructive metadata synchronization (`syncIndicatorRegistryMetadata()`) so `FED_FUNDS.source_url` is `"https://fred.stlouisfed.org/series/DFF"` and `attribution_text` explicitly cites `"Board of Governors of the Federal Reserve System (US), H.15 Selected Interest Rates via FRED (Series: DFF)"`.
- **Handling Missing / Holiday Values (`"."`):**
  - On weekends and U.S. federal holidays, FRED returns `"value": "."` for daily series. The `fred` adapter skips `"."` rows and normalizes the most recent valid numeric observation within the recent window, or returns `NO_RECENT_OBSERVATION` if all returned observations are `"."` or empty.
- **Copyright, Attribution & Required Disclaimer:**
  - Both `DFF` and `DGS10` are U.S. Government works from the H.15 release (**Public Domain: Citation Required** under 17 U.S.C. § 105).
  - **Required Attribution:** *"Source: Board of Governors of the Federal Reserve System (US), H.15 Selected Interest Rates, retrieved from FRED, Federal Reserve Bank of St. Louis."*
  - **Required FRED API Disclaimer:** *"This product uses the FRED® API but is not endorsed or certified by the Federal Reserve Bank of St. Louis."*

---

### C. `ID_CPI_YOY` and `ID_GDP` — BPS WebAPI (`webapi.bps.go.id`)
- **Official Endpoint Structure:** `https://webapi.bps.go.id/v1/api/list/model/data/lang/ind/domain/0000/var/{var_id}/key/{BPS_API_KEY}/`
- **Why Status is `BLOCKED`:**
  1. BPS WebAPI requires a registered developer key (`BPS_API_KEY`) to query its dynamic table catalog (`/v1/api/list/model/var/domain/0000/key/{key}/`).
  2. BPS stores dynamic tables using internal numeric IDs for `var` (variable ID), `turvar` (derived variable, e.g., month-to-month vs. calendar-year vs. year-on-year), `vervar` (vertical classification), and `th` (BPS internal year index, e.g., `124` for 2024, `125` for 2025, `126` for 2026).
  3. **Governance Rule:** Per project policy, we **never invent or guess** BPS `var`, `turvar`, or `th` IDs. Until `BPS_API_KEY` is configured and an authenticated catalog query verifies the exact numeric variable IDs and period codes for headline YoY CPI inflation (`ID_CPI_YOY`) and YoY real GDP growth (`ID_GDP`), the BPS adapter (`src/lib/market-data/providers/bps.ts`) is marked **`BLOCKED`** (`status: "blocked"`).

---

### D. `XAU_USD` — Twelve Data (`api.twelvedata.com`)
- **Evaluated Endpoint:** `GET https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=1day&outputsize=5`
- **Why Status is `DISABLED`:**
  - Twelve Data's free Basic plan (800 credits/day, 8 requests/min) is governed by terms restricting usage to personal/internal evaluation and non-commercial use. It cannot be assumed to grant public display or redistribution rights for a commercial financial intelligence platform.
  - Therefore, `twelve-data.ts` is explicitly configured with `enabled: false` and `readinessStatus: "disabled"` (`reason: "Disabled pending verification of commercial public display license and TWELVE_DATA_API_KEY"`). Any attempt to call `fetchIndicator` on the Twelve Data adapter fails closed with error code `PROVIDER_DISABLED` before initiating any HTTP request.

---

### E. `IHSG` and IDX Equities (`BBCA`, `ANTM`, `BMRI`, `TLKM`, `ASII`)
- **Why Status is `PENDING_LICENSE_REVIEW`:**
  - Displaying Indonesia Stock Exchange (IDX / BEI) composite index values (`IHSG`) and individual equity prices publicly requires compliance with IDX market data licensing tiers (even for End-of-Day or delayed feeds through redistributors like Sectors.app, EODHD, or GoAPI.io).
  - Unofficial scraping of exchange or portal pages is strictly prohibited.
  - Status is set to `pending_license_review`; no automated IDX scraper or unlicensed equity feed is enabled.

---

### F. `BI_RATE` and `SBN_10Y` — Editor-Verified (`editor_verified`)
- Maintained via authenticated 30% Human Oversight editorial workflow in `/studio` from official Bank Indonesia RDG announcements (`https://www.bi.go.id`) and PHEI/IBPA daily benchmark releases (`https://www.phei.co.id`). No automated provider adapter is created.

---

### G. `ANTAM_1G_IDR` — Derived Indicator (`derived_code`)
- Treated strictly as an internal synthetic parity indicator derived from verified `XAU_USD` and `USD_IDR` observations—never labeled as official PT Antam Tbk / Logam Mulia retail pricing. No new calculation is introduced in Phase 3C-2.
