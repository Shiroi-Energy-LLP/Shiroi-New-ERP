# Shiroi Energy ERP2 — Claude Code Startup Brief

> Always loaded. Keep it short. Setup and infrastructure details live in `docs/SETUP.md`.

@AGENTS.md

## IDENTITY

**Shiroi Energy LLP**: solar EPC, Chennai, Tamil Nadu. Rooftop solar (residential, commercial, industrial).
ERP2 is a rebuild of ERP1 (https://github.com/Shiroi-Energy-LLP/shiroi-erp). It is **single-tenant**:
no `company_id` on any table, ever.

Developer: Manivel, who works mostly **from a phone** through Claude Code cloud sessions. Owner/approvals: Vivek.

## THIS REPO IS PUBLIC

- Never commit secrets: `.env*`, the handover doc, the DB password, `sb_secret_*` keys or connection strings.
  Git history is permanent. If a secret leaks, tell the user so Vivek can rotate it.
- Never commit real customer, price-list, employee or salary data. `supabase/seed.sql` holds **fake data only**.
- Before every commit, grep the staged diff for `sb_secret`, `postgresql://` and passwords.

## HOW WORK HAPPENS (phone-first)

| Task | How |
|---|---|
| Inspect the DB, run SQL, apply migrations, generate types, read logs | **Supabase connector** (`mcp__Supabase__*`), project `qrwoywmvdesvwsskxben` only |
| Deploy status, build logs, env vars, domains | **Vercel connector** (`mcp__Vercel__*`), project `shiroi-erp2` |
| Code | Branch → PR → Vercel preview URL (the user tests on the phone) → merge to `main` = live |

The cloud container cannot open Postgres connections (HTTPS only), so never use `supabase db push` / `psql` from a session.
No secret is needed in the session: the connectors use the user's own logins, and Vercel holds runtime keys.

## DATABASE CHANGES (strict order)

1. Read the current schema first (`list_tables`, existing files in `supabase/migrations/`).
2. Write the migration, including RLS policies (auto-RLS is ON, so no policy means zero rows) and an index for every
   filtered/sorted/joined column.
3. Apply it with `mcp__Supabase__apply_migration` (snake_case `name`).
4. Run `list_migrations` and save the **exact same SQL** as `supabase/migrations/<version>_<name>.sql`, using the
   version it returned. The file and the DB must match, or the `Database` GitHub workflow will see drift.
5. Run `get_advisors` (security + performance) and fix anything it flags.
6. Regenerate types with `generate_typescript_types` → `src/types/database.ts` (never edit by hand). Commit together with the migration.
7. Take a backup before destructive changes (free plan has no backups). While the DB holds only dummy data,
   apply-then-merge is fine. Once real data exists, migrations go through PR review first.

Dummy data: put it in `supabase/seed.sql` (idempotent: `ON CONFLICT DO NOTHING`) and load it with `execute_sql`.

## APP (Next.js 16, App Router, single app at repo root)

- Stack: Next.js 16.4 + React 19 + TypeScript + Tailwind 4, npm. **Next 16 differs from older docs**: read
  `node_modules/next/dist/docs/` before using an unfamiliar API (see AGENTS.md).
  - `middleware.ts` is now `proxy.ts` (export `proxy`, Node runtime only).
  - `cacheComponents` is ON: anything reading cookies/headers or doing an uncached fetch must sit inside `<Suspense>`
    (use `await connection()` for per-request work); otherwise the build fails.
- Supabase clients: `src/lib/supabase/{client,server,admin}.ts`. Env access via `src/lib/env.ts`.
- Layout: `src/app/` routes, `src/lib/<domain>/<domain>-queries.ts` / `-actions.ts`, `src/types/database.ts`.
- Brand tokens (Solar Gold) are Tailwind theme colours in `src/app/globals.css`.
- Before every push: `npm run lint && npm run build` must pass.
- Running the app **inside a cloud session**: `NODE_USE_ENV_PROXY=1 npx next start` (or `next dev`). The container
  only reaches the internet through a proxy that Node ignores without this flag. Not needed on Vercel.

## GIT

- Never push to `main` unless the user explicitly says so: every push to `main` goes live at https://erp2.shiroienergy.com.
- Work on a branch and open a PR so Vercel posts a preview URL.
- New env var? Add it to `.env.example` (name only) and to Vercel (Settings → Environment Variables, or the Vercel connector).
  A missing var breaks the deploy.
- Keep Vercel functions in `bom1` (Mumbai). Any `vercel.json` keeps `"regions": ["bom1"]`.

## CODING STANDARDS (from ERP1, non-negotiable)

- **Supabase keys:** new style only (`sb_publishable_` / `sb_secret_`). Never legacy `anon` / `service_role`.
- **Auth:** `@supabase/ssr` with separate browser / server / admin / middleware client factories.
- **Error handling:** `const op = '[functionName]';` at the top; log with the `op` prefix; include `{ ...context, error, timestamp }`.
- **Supabase queries:** handle `error` and null `data` separately.
- **Money:** `decimal.js` on the client, `NUMERIC(14,2)` in SQL. Never floats. Aggregate money in SQL RPCs, never `.reduce()` in JS.
- **Indian formatting:** `formatINR(amt)` → `₹1,23,456`; `shortINR(amt)` → `₹1.2Cr` / `₹5.0L` / `₹50K`.
- **Dates:** store UTC, display IST (`Asia/Kolkata`). Date-only fields as `'YYYY-MM-DD'`.
- **UUIDs:** client-generated with `crypto.randomUUID()`.
- **Row types:** `Database['public']['Tables']['x']['Row']`. No `any`; regenerate types instead.
- **Server actions:** return `ActionResult<T>`; never throw across the RSC boundary.
- **File split:** reads in `*-queries.ts`, mutations in `*-actions.ts` (`'use server'`). No Supabase calls inline in pages/components.
- **Files:** Supabase Storage; the DB stores only the path.
- **Sensitive fields never in logs:** bank account, Aadhaar, PAN, salary/CTC/take-home, commission, PF.

## NEVER DO

1. Never hardcode env values or API keys.
2. Never bypass RLS with the secret key except for clearly labelled admin/system operations.
3. Never use `count: 'exact'` on tables over ~1,000 rows; use `'estimated'`.
4. Never use a bare `.limit(N)` on a list that can exceed N; paginate with `.range()`.
5. Never ship `ILIKE '%term%'` search without a `pg_trgm` GIN index.
6. Never write to the DB during a page/server-component render.
7. Never cache auth identity/role outside a request-scoped React `cache()`; re-resolve identity in every server action.
8. Never import runtime values from `-queries.ts` into a `'use client'` component (`import type` only).
9. Never queue background work (>5 s, polling, retries) inside a server action.
10. Never store time-series data in a plain table; use declarative partitioning + rollups.
11. Never write a form component over 500 lines.
12. Never click-create tables in the dashboard: the repo's migrations are the source of truth.

## REFERENCE (ERP1, read when designing a module)

- Business rules, roles, CEIG/IR/MSME gotchas: `docs/SHIROI_MASTER_REFERENCE.md` in ERP1
- Per-module workflows: `docs/modules/*.md` in ERP1
- Design system / brand: `docs/design/design-system.md` + `packages/ui` in ERP1
