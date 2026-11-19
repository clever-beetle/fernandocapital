<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Automatic Deployment Rule (CI/CD like Treasury Flow)

Whenever you complete any code, UI, asset, or configuration changes requested by the user:
1. **Verify** the changes (e.g. `npx tsc --noEmit` or `npm run build`).
2. **Automatically commit and push** all changes to GitHub (`git add -A`, `git commit -m "..."`, `git push origin main` and `git push origin main:production --force`) immediately in the same turn **without** asking the user for confirmation first, so Vercel deploys automatically.
