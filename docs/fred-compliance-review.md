# FRED® Compliance Remediation & Direct Federal Reserve H.15 Source Evaluation (Phase 3D-2A)

**Platform:** Fernando Capital — Independent Financial Intelligence & Research Platform  
**Phase:** 3D-2A — Compliance Remediation & Direct H.15 Source Evaluation  
**Target Environment:** Development (`fc-phase2-dev` / `neondb`)  
**Current FRED Ingestion Status:** **HARD-DISABLED (`blocked_legal_review`) — Zero Live Requests, Zero Stored FRED Observations**

---

## 1. Executive Summary

During the Phase 3D-2A compliance review of the official **FRED® Services and API Terms of Use** maintained by the Federal Reserve Bank of St. Louis, three material contractual restrictions were identified that conflict with Fernando Capital's current data persistence and AI-assisted research architecture:

1. **Database Storage, Caching, and Archiving Prohibition:** The FRED® Terms of Use prohibit storing, caching, or archiving any portion of FRED® Services or FRED® Content, or incorporating FRED® Content into any database, compilation, archive, cache, or other medium.
2. **AI / ML / LLM Usage Prohibition:** The FRED® Terms of Use prohibit using FRED® Services or FRED® Content in connection with the development, training, or operation of software programs, systems, or machine-learning processes, including large language models (LLMs) and generative AI.
3. **Third-Party Copyright & Multi-User Application Constraints:** While certain series hosted on FRED originate from U.S. Federal agencies, FRED aggregates over 800,000 series from more than 100 public and private sources, many of which carry third-party copyrights, and the FRED® API Terms expect multi-user applications to require end users to supply their own individual FRED API keys rather than redistributing a single server-cached copy.

Because Fernando Capital persists verified market observations in **Neon PostgreSQL** (`public.market_indicators` and `public.market_price_history`) and operates under a **70% AI & Automation / 30% Human Oversight** editorial model, **automated and manual FRED® API ingestion for `FED_FUNDS` (`DFF`) and `US_10Y` (`DGS10`) has been hard-disabled**.

No `FRED_API_KEY` has been configured, no live FRED® API calls have been executed, and zero FRED observations exist in Neon PostgreSQL.

---

## 2. Analysis of Official FRED® Terms of Use

**Reviewed Documents:**
- [FRED® API Terms of Use](https://fred.stlouisfed.org/docs/api/terms_of_use.html)
- [Federal Reserve Bank of St. Louis Legal Terms & Terms of Use](https://fred.stlouisfed.org/legal/terms/)

### 2.1 Restrictions on Persistent Storage, Caching, and Database Compilation
- The St. Louis Fed Legal Terms for FRED® Services explicitly state that users may **not** engage in *"storing, caching, or archiving any portion of FRED® Services or FRED® Content"* or *"incorporating any FRED® Content into any database, compilation, archive, cache, or other medium"*, nor provide stored, cached, or archived portions of FRED® Content to third parties.
- **Architectural Conflict:** Fernando Capital's Financial Data Engine is designed around server-side ingestion into Neon PostgreSQL (`market_indicators` for current snapshots and `market_price_history` for historical series) so that public pages never call external provider APIs during page rendering. Persisting FRED® API JSON responses in Neon directly conflicts with the FRED® API no-caching / no-database-incorporation covenant.

### 2.2 Restrictions on Public Redistribution, Commercial Use, and Multi-User Applications
- The FRED® API Terms require developers building applications used by third parties to obtain a separate API key for each application and state that individual users of an application should use their own FRED® API keys.
- Using a single server-side `FRED_API_KEY` to populate a central PostgreSQL database and serve those cached observations to all public visitors of a commercial financial intelligence platform is not sanctioned under standard self-service FRED® API terms.

### 2.3 Restrictions on AI / ML / LLM Development and Operation
- The St. Louis Fed Legal Terms explicitly prohibit using FRED® Services or FRED® Content (including via the FRED® API) in connection with the development, training, or operation of any software program, system, or machine-learning process, including large language models (LLMs), deep learning, generative artificial intelligence, or any process commonly referred to as AI.
- **Architectural Conflict:** Fernando Capital's **70% AI & Automation / 30% Human Oversight** workflow uses stored macroeconomic indicators as context for AI-assisted research briefs and cross-asset impact analysis. Ingesting data via the FRED® API into a pipeline connected to AI-assisted writing or analysis violates this restriction unless separate written authorization is obtained from the Federal Reserve Bank of St. Louis.

### 2.4 Distinction Between API Service Terms and Dataset Copyright Status
- **Dataset Copyright Layer:** Individual series published by U.S. Federal Government agencies—such as the Board of Governors of the Federal Reserve System's H.15 statistical release—are works of the United States Government under **17 U.S.C. § 105** (cataloged in FRED metadata as *Public Domain: Citation Requested*). Conversely, third-party series hosted on FRED (e.g., ICE BofA, S&P, OECD, commercial survey providers) are copyrighted by their respective owners.
- **API Contractual Layer:** Regardless of whether an underlying dataset is in the U.S. public domain, **accessing that dataset through the FRED® API (`api.stlouisfed.org`) subjects the developer to the Federal Reserve Bank of St. Louis's contractual Terms of Use** governing the FRED® API delivery service. Therefore, public-domain status of the underlying H.15 numbers does **not** override the contractual prohibition against using the FRED® API to populate a commercial database or feed an AI system.

---

## 3. Evaluation of Direct Federal Reserve Board H.15 & Primary Sources

**Evaluated Official Endpoints:**
1. **Current H.15 HTML Release:** `https://www.federalreserve.gov/releases/h15/current/` and `https://www.federalreserve.gov/releases/h15/`
2. **Board Data Download Program (DDP):** `https://www.federalreserve.gov/datadownload/Download.aspx?rel=H15`
3. **Board Website Disclaimer & Terms:** `https://www.federalreserve.gov/disclaimer.htm`
4. **Primary Originator 1 (EFFR):** Federal Reserve Bank of New York (`https://www.newyorkfed.org/markets/reference-rates/effr` and `https://www.newyorkfed.org/privacy/termsofuse`)
5. **Primary Originator 2 (10-Year Treasury Yield):** U.S. Department of the Treasury (`https://home.treasury.gov` / `https://fiscaldata.treasury.gov`)

### 3.1 Availability of Target Indicators in H.15
- **Daily Federal Funds Effective Rate (`FED_FUNDS`):**
  - Published in the H.15 table as *"Federal funds (effective)"*.
  - Footnote provenance in H.15 explicitly states: *"The daily effective federal funds rate is a volume-weighted median of overnight federal funds transactions calculated and published by the Federal Reserve Bank of New York."*
- **Daily 10-Year Treasury Constant Maturity Yield (`US_10Y`):**
  - Published in the H.15 table under *"U.S. government securities — Treasury constant maturities — Nominal — 10-year"*.
  - Footnote provenance in H.15 explicitly states: *"Yields on actively traded non-inflation-indexed issues adjusted to constant maturities. The 30-year Treasury constant maturity series was discontinued on February 18, 2002, and reintroduced on February 9, 2006. Source: U.S. Department of the Treasury."*
- **Publication Schedule & Timestamps:**
  - The H.15 current release is updated daily on business days (Monday–Friday, excluding U.S. Federal holidays) at approximately **4:15 PM Eastern Time (`America/New_York`)**, reporting observations for the preceding business day(s).

### 3.2 Access Methods, Formats, and the DDP Deprecation Risk
| Access Method | URL / Mechanism | Format | Technical & Lifecycle Viability |
| :--- | :--- | :--- | :--- |
| **H.15 Current HTML Page** | `federalreserve.gov/releases/h15/` | Presentation HTML Table (5 recent business days) | **Fragile:** No versioned JSON schema; relies on HTML table scraping that can break on layout changes. |
| **Board Data Download Program (DDP)** | `federalreserve.gov/datadownload/Download.aspx?rel=H15` | Preformatted CSV / SDMX-XML packages | **Deprecating / Retiring:** The Federal Reserve Board retired the *"Build Your Package"* tool in November 2026, is retiring preformatted DDP packages on **March 31, 2027**, and is removing the DDP pages entirely on **July 1, 2027**. |
| **Static H.15 XML Archive** | `H15_data.xml` linked from `/releases/h15/` | Bulk SDMX-ML XML file | **Heavyweight:** Multi-megabyte monolithic XML archive unsuitable for lightweight serverless cron/API polling. |

### 3.3 Direct Source Usage, Storage, Redistribution, and AI Assessment
- **Board of Governors Website (`federalreserve.gov`):**
  - Data authored directly by the Board of Governors of the Federal Reserve System is U.S. Government public-domain information (17 U.S.C. § 105). However, the H.15 release is a **composite statistical release** whose two target series originate from two distinct entities:
    1. **Federal Reserve Bank of New York (FRBNY) for Effective Federal Funds Rate (EFFR):**
       - Unlike the Board of Governors (a federal agency), Reserve Banks (such as the New York Fed and St. Louis Fed) maintain their own corporate website Terms of Use (`https://www.newyorkfed.org/privacy/termsofuse`).
       - The New York Fed Terms of Use generally permit downloading, storing, and redistributing EFFR data for business purposes **subject to strict mandatory conditions**:
         - Mandatory attribution notice: *"The Effective Federal Funds Rate is subject to the Terms of Use posted at newyorkfed.org. The New York Fed is not responsible for any formatting, calculation, or presentation errors in the data introduced by third parties."*
         - Mandatory non-endorsement notice for commercial products/databases: *"Fernando Capital is not affiliated with the New York Fed. The New York Fed does not sanction, endorse, or recommend any products or services offered by Fernando Capital."*
         - Automated extraction must not interfere with website operations, and users assume full indemnification liability for any downstream commercial or AI-generated outputs.
    2. **U.S. Department of the Treasury for 10-Year Constant Maturity Yield:**
       - Originated by the U.S. Department of the Treasury (a U.S. Federal executive department whose works are public domain under 17 U.S.C. § 105) and published via Official Treasury Par Yield Curve tables and `fiscaldata.treasury.gov`.

---

## 4. Comparison: FRED® API vs. Direct Federal Reserve Board H.15 vs. Primary Originators

| Dimension | FRED® API (`api.stlouisfed.org`) | Direct Board H.15 (`federalreserve.gov/releases/h15`) | Primary Originators (U.S. Treasury + New York Fed) |
| :--- | :--- | :--- | :--- |
| **Operator** | Federal Reserve Bank of St. Louis | Board of Governors of the Federal Reserve System | U.S. Dept. of the Treasury (10Y) / FRBNY (EFFR) |
| **Persistent DB Storage Allowed?** | **No** (Prohibited by FRED® Terms of Use) | Unclear for DDP bulk scraping; DDP retiring March–July 2027 | **Yes** for U.S. Treasury public domain; **Conditional** for FRBNY EFFR (requires exact FRBNY legal notices & indemnification) |
| **AI / LLM Workflow Allowed?** | **No** (Explicitly prohibited by FRED® Terms of Use) | Not explicitly prohibited on `federalreserve.gov`, but H.15 incorporates FRBNY data | Subject to FRBNY liability/indemnification rules for EFFR; permitted for U.S. Treasury public-domain data |
| **API Stability** | High (REST JSON v1), but contractually unusable | **Low** (DDP retiring March 31 – July 1, 2027; HTML scraping fragile) | **High** (U.S. Treasury XML/JSON & FRBNY Markets Data REST API) |
| **Phase 3D-2A Decision** | **Hard-Disabled (`blocked_legal_review`)** | **Do Not Build Scraper (Retiring DDP + Composite Terms)** | **Keep Editor-Verified / Disabled Until Written Legal Confirmation** |

---

## 5. Recommended Safe Architecture (Task 4 Decision)

Because:
1. The **FRED® API Terms of Use** prohibit database caching/archiving and AI/LLM usage;
2. The **Federal Reserve Board's H.15 Data Download Program (DDP)** is actively being retired (March 31 – July 1, 2027) and the H.15 HTML release is a composite table whose underlying `FED_FUNDS` series is governed by the **Federal Reserve Bank of New York's Terms of Use**; and
3. Bypassing FRED® API does **not** automatically grant unconditional commercial database or AI-workflow permissions without verifying each primary originator's terms:

### Architectural Remediation Applied in Phase 3D-2A:
1. **Live & Manual FRED Ingestion Hard-Disabled:**
   - `PERMITTED_LIVE_INGESTION_INDICATORS` in `src/lib/market-data/ingestion.ts` is restricted strictly to `["USD_IDR"]`.
   - `ingestSingleIndicator()` immediately returns `status: "skipped"` (`recordsUpdated: 0`) with `FRED_COMPLIANCE_BLOCK_REASON` for `FED_FUNDS`, `US_10Y`, or any indicator mapped to `providerId === "fred"`.
   - `FredProviderAdapter.fetchIndicator()` in `src/lib/market-data/providers/fred.ts` blocks all live external network requests with `PROVIDER_DISABLED` (`retriable: false`), while keeping `FredProviderAdapter` in the codebase as reference code for offline unit tests.
   - `POST /api/admin/sync-market-data` rejects any request for `FED_FUNDS` or `US_10Y` with HTTP `400`.
2. **Honest Admin Studio (`/studio`) & Public Homepage (`/`) States:**
   - `/studio` removes the manual FRED sync trigger button and displays a clear warning banner: `Status Kepatuhan FRED (FED_FUNDS & US_10Y): BLOCKED / LEGAL REVIEW`.
   - The public homepage (`/`) preserves `FED_FUNDS` and `US_10Y` as `NULL` (`Belum Aktif (Ditangguhkan — Review Kepatuhan FRED)`), explaining that automated FRED® API ingestion is disabled due to database-storage and AI-usage restrictions in the FRED® Terms of Use.
3. **Near-Term Alternative Pathway:**
   - Keep `FED_FUNDS` and `US_10Y` disabled for automated provider ingestion (or managed strictly under **30% Human Oversight / Editor-Verified** governance if cited in editorial articles) until:
     - For `US_10Y`: A dedicated U.S. Department of the Treasury direct public-domain adapter (`home.treasury.gov` / `fiscaldata.treasury.gov`) is formally approved in a future phase.
     - For `FED_FUNDS`: Written legal confirmation or formal compliance approval of the Federal Reserve Bank of New York's EFFR Terms of Use (`newyorkfed.org/privacy/termsofuse`) is established.

---

## 6. Outstanding Legal & Compliance Questions

Before activating any automated U.S. interest rate ingestion in a future phase, the following items require explicit compliance sign-off:

1. **St. Louis Fed Written Exemption (If FRED® API Is Ever Reconsidered):**
   - Would the Federal Reserve Bank of St. Louis grant written permission for Fernando Capital to store daily `DFF` and `DGS10` observations in Neon PostgreSQL and reference them in AI-assisted research workflows? *(Until granted in writing, FRED® API must remain disabled.)*
2. **New York Fed EFFR Terms of Use Sign-Off (If Sourcing `FED_FUNDS` Directly from FRBNY or H.15):**
   - Does Fernando Capital accept the indemnification and mandatory disclaimer requirements of the [New York Fed Terms of Use](https://www.newyorkfed.org/privacy/termsofuse) for storing and displaying the Effective Federal Funds Rate in an AI-assisted commercial research platform?
3. **U.S. Department of the Treasury Direct Feed (For `US_10Y`):**
   - Should `US_10Y` be migrated away from FRED/H.15 to the official U.S. Department of the Treasury Daily Treasury Par Yield Curve feed (U.S. Government public domain under 17 U.S.C. § 105)?
