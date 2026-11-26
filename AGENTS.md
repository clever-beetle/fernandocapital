<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Automatic Deployment Rule (CI/CD like Treasury Flow)

Whenever you complete any code, UI, asset, or configuration changes requested by the user:
1. **Verify** the changes (e.g. `npx tsc --noEmit` or `npm run build`).
2. **Automatically commit and push** all changes to GitHub (`git add -A`, `git commit -m "..."`, `git push origin main` and `git push origin main:production --force`) immediately in the same turn **without** asking the user for confirmation first, so Vercel deploys automatically.


# AUTONOMOUS DEVELOPMENT & RELEASE PROTOCOL

Every user request for code, UI, content, configuration, or bug-fix changes in **Fernando Capital** (`https://fernandocapital.web.id`, Vercel project `prj_cZm08gBFOdgj0FkBXXA9yG1hINQl`) automatically activates this end-to-end autonomous engineering, self-healing QA, release, and post-deployment verification protocol. Do not wait for the user to ask you to test, commit, push, or deploy.

## 1. DEVELOPMENT RULES

- **Inspect First:** Always inspect `git status --short` and the existing implementation before editing any file.
- **Preserve Existing Functionality:** Preserve all Phase 1A, 1B, Phase 2 (Research CMS & 70/30 Human Oversight Gate), Phase 3 (Deterministic Financial Engine, Provider Adapters, Frankfurter `USD_IDR` Ingestion & Cron, Database-Driven Dashboard), and Prompt 19 compliance disclosures unless explicitly requested to change them.
- **Minimal Targeted Changes:** Implement only the requested scope and necessary supporting fixes. Avoid unnecessary architectural rewrites and never overwrite unrelated user changes.
- **Zero Fabricated Financial Data:** Never invent stock prices, yields, exchange rates, gold prices, or financial ratios. Unpopulated database indicators must display honest unavailable states (`BELUM TERSEDIA`).
- **Strict Secret & Database Isolation:**
  - Never inspect, print, log, commit, or expose `.env*` secret values, database passwords, API keys, `ADMIN_PASSWORD`, `SESSION_SECRET`, or `CRON_SECRET`.
  - Local automated database tests must connect **only** to the Neon development branch `fc-phase2-dev` (`ep-polished-hall-azz9lc5a`), never to `production` (`ep-calm-mode-azwgjnqv`) or `backup-prelaunch-20261125`.
  - Keep `drizzle/*.sql` migration files in `LF` line-ending format so SHA-256 migration hashes never drift.

## 2. AUTOMATED QA GATE

After implementing any change, automatically run the applicable verification checks before committing:

1. **Automated QA Suite & Static Compliance Gate:** `npm run qa` (runs `node scripts/qa-gate.mjs` covering static security/compliance assertions, secret-leak scanning, deterministic auth/gold/financial-engine unit tests, Drizzle migration hash integrity, and `fc-phase2-dev` development database integration checks when `.env.local` is present).
2. **TypeScript Compiler Gate:** `npx tsc --noEmit` (clean `.next/dev` beforehand if a dev server was stopped).
3. **ESLint Gate:** `npm run lint`.
4. **Production Build Gate:** `npm run build` (triggers `prebuild` -> `node scripts/sync-version.mjs` and Next.js production compilation).
5. **HTTP & CMS Regression Gate (when auth, middleware, headers, API routes, or CMS code changes):** Run local production server verification (`npm run verify:local` or `scripts/verify-post-deploy.mjs` against a local `next start` instance).
6. **Browser UI Gate (when UI, layout, navigation, styling, or calculator interactions change):** Verify in the built-in browser subagent across all required viewports.

Never silently skip a failed or unavailable test.

## 3. SELF-HEALING REPAIR LOOP (UP TO 5 CYCLES)

Whenever any check in the Automated QA Gate or Browser QA fails:

1. Identify the root cause from the compiler, test, server, or browser output.
2. Inspect the related files and dependencies.
3. Implement a targeted, minimal fix.
4. Re-run the failed check and related regression checks.
5. Repeat until all required checks return exit code `0` (up to **5 controlled repair cycles**).

**Strict Prohibitions:**
- Never disable or delete a failing test to obtain a green result.
- Never remove assertions to hide a regression.
- Never suppress TypeScript or ESLint errors without technical justification.
- Never replace a failing test with a weaker fake test.
- Never claim success without actual execution.
- If **5 repair cycles** fail to resolve the issue, **STOP IMMEDIATELY** — do not commit, push, or deploy, and report the exact unresolved failure to the user.

## 4. BROWSER QUALITY ASSURANCE (FOR UI CHANGES)

For any UI, layout, component, theme, or interactive change, verify using the Antigravity `browser` subagent against a local server before releasing:

- **Routes to Inspect:** Homepage (`/`), Calculator (`/calculator` & `/calculator?tab=gold`), Research directory (`/research`) & article 404 handling (`/research/<non-existent-slug>`), Studio login gate (`/studio`), Settings authorization (`/settings`), and Header/navigation/theme toggle.
- **Required Viewport Widths (7 widths):** `320`, `360`, `390`, `430`, `768`, `1024`, and `1440` pixels.
- **Pass Criteria:**
  - Zero horizontal overflow (`scrollWidth <= innerWidth` / zero horizontal scroll).
  - Zero React hydration errors.
  - Zero unexpected browser console errors.
  - Sticky header remains pinned on vertical scroll; mobile drawer and desktop pillar links work cleanly.
  - All deterministic calculator inputs (`.auto-ribuan`, gold simulator 1g reference price, stock valuation inputs) immediately recalculate on input change.

Do not deploy if any required browser check fails.

## 5. AUTOMATIC GIT OPERATIONS & SINGLE AUTHORITATIVE DEPLOYMENT

Once all required QA checks pass with exit code `0`:

1. **Sync Release Version Metadata:** Run `npm run sync:version` (`node scripts/sync-version.mjs`, equivalent to Treasury Flow's `sync_version.py`) so `src/lib/version.ts` reflects the latest release history.
2. **Diff & Secret Audit:** Inspect `git status --short` and `git diff --stat` to confirm only intended files are staged, no unrelated user work is overwritten, `drizzle/*.sql` hashes remain intact, and zero secrets or `.env*` files are included.
3. **Commit:** Create a descriptive commit on `main` (`git add -A && git commit -m "Release vX.Y.Z: <concise summary>"`).
4. **Safe Push & Authoritative Deployment:**
   - Push to GitHub using fast-forward pushes only:
     - `git push origin main`
     - If `origin/production` is tracked by the repository and can be fast-forwarded cleanly without force: `git push origin main:production` (never use `--force` unless explicitly instructed by the operator; never overwrite remote history).
   - GitHub Actions CI (`.github/workflows/ci.yml`) runs read-only verification (`permissions: contents: read`) with **no** duplicate `git push --force` step, so Vercel's GitHub integration is the single authoritative deployment mechanism for project `fernando-capital` (`prj_cZm08gBFOdgj0FkBXXA9yG1hINQl`).

## 6. POST-DEPLOYMENT VALIDATION & ROLLBACK PROCEDURE

After pushing a release to GitHub:

1. Run `npm run verify:deploy` (`node scripts/verify-post-deploy.mjs`) against `https://fernandocapital.web.id` to verify:
   - `/` (HTTP `200`, canonical metadata, security headers)
   - `/calculator` (HTTP `200`)
   - `/research` (HTTP `200`) and `/research/non-existent-slug-check` (HTTP `404`)
   - `/studio` authorization gate (HTTP `200` login gate; `GET /api/admin/articles` returns HTTP `401`)
   - `/settings` authorization boundary (HTTP `200`; `GET /api/version?mode=admin` returns HTTP `401`)
   - `/robots.txt` (HTTP `200`, disallows `/studio`, `/settings`, `/api/`)
   - `/sitemap.xml` (HTTP `200`, includes public routes, excludes `/studio` and `/settings`)
   - `/api/cron/market-data` authentication (`GET` without Bearer token returns HTTP `401`)
   - `/api/version?mode=public` (HTTP `200`, returns JSON version metadata)
2. **Rollback on Confirmed Production Regression:**
   - Never roll back due to a transient network timeout; re-verify first.
   - If a confirmed production regression occurs:
     1. Preserve error logs and deployment details.
     2. Revert the offending commit cleanly on `main` (`git revert --no-edit HEAD`) or restore via Vercel Instant Rollback (`npx vercel rollback` when authenticated), run the QA gate, and push the clean revert commit so Vercel automatically restores the last known-good state.
     3. Diagnose and repair the root cause locally, re-run the full QA gate, and re-deploy only after all checks pass.

## 7. DATABASE & SECURITY BOUNDARIES (EXPLICIT APPROVAL REQUIRED)

Autonomous deployment applies to normal additive UI, feature, bug-fix, and content code changes. **STOP and require explicit user approval before:**

- Executing any schema migration (`npx drizzle-kit migrate`) against the Neon `production` database.
- Executing destructive SQL (`DROP`, `TRUNCATE`, `DELETE`, or column type alteration) on any database.
- Deleting production records or modifying `backup-prelaunch-20261125`.
- Rotating production credentials (`DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `CRON_SECRET`).
- Modifying authentication/session cryptography (`src/lib/auth.ts`) or security headers.
- Activating external data providers that are compliance-blocked or require paid commercial redistribution licenses (`yahoo-finance2`, FRED API, BPS, IDX real-time feed, Twelve Data).
