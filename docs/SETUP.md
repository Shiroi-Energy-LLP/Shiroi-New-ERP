# ERP2 — Environment & Setup

> This repo is **public**. No secrets live here. Real keys, the DB password and connection
> strings are in the private handover doc (ask Vivek) and go in your local `.env.local`.

## Infrastructure

| Item | Value |
|---|---|
| Live URL | https://erp2.shiroienergy.com |
| Hosting | Vercel project `shiroi-erp2`, functions in Mumbai (`bom1`) |
| Production branch | `main` — every push auto-deploys. Other branches/PRs get preview URLs. |
| Database | Supabase project `shiroi-erp2`, Postgres 17, Mumbai (`ap-south-1`), Free plan |
| Supabase dashboard | https://supabase.com/dashboard/project/qrwoywmvdesvwsskxben |

## Where everything lives

| Thing | Where | In git? |
|---|---|---|
| App code, SQL migrations, dummy seed data | This repo | Yes |
| Schema changes | `supabase/migrations/NNN_name.sql` | Yes |
| Dummy/test data | `supabase/seed.sql` (fake data only) | Yes |
| Runtime keys for the live site and previews | Vercel env vars (already set by Vivek) | No |
| DB connection string for migrations | GitHub repo secret `SUPABASE_DB_URL` | No |
| Keys for Claude Code cloud sessions | Claude cloud environment "Shiroi New ERP" settings | No |
| Full handover doc (password, secret key) | Password manager / private vault | **Never** |
| Real customer/price/salary data, imports | Supabase Storage, or gitignored `data/` on a laptop | **Never** |

## Working from a phone (primary workflow)

Nothing runs on the phone itself. Claude Code cloud sessions edit the code, and GitHub, Vercel and Supabase run it:

1. **Change code or schema** in a Claude Code cloud session on this repo, on a branch, and open a PR.
2. **See it running**: Vercel builds every branch/PR and posts a **preview URL** on the PR. Open it in the phone browser.
   Previews use the same `shiroi-erp2` database.
3. **Schema changes**: the PR runs the `Database` workflow as a **dry run**, so the PR checks show which migrations would apply.
   Merging to `main` applies them for real. `main` also deploys to https://erp2.shiroienergy.com.
4. **Dummy data**: GitHub → Actions → **Database** → Run workflow → tick *Load seed data*.
   (GitHub mobile app or mobile browser.)

The cloud session container can't reach Postgres directly (HTTPS only), so migrations always go through the
`Database` workflow, never `supabase db push` from a session.

### One-time setup

- **GitHub secret**: repo → Settings → Secrets and variables → Actions → New repository secret:
  `SUPABASE_DB_URL` = the **Session pooler (port 5432)** string from the handover doc.
  Repo admin rights are needed, so ask Vivek if Settings isn't visible.
- **Claude cloud environment** (only to run the app/tests inside a session): environment menu in the session's title bar →
  Edit. Allow host `qrwoywmvdesvwsskxben.supabase.co`, and add the `NEXT_PUBLIC_*` variables from `.env.example`.
  Add `SUPABASE_SECRET_KEY` there yourself only when server-side admin code needs it. Never paste it into chat.

## Laptop setup (optional)

1. `cp .env.example .env.local` and fill in the values from the handover doc.
2. Supabase CLI:
   ```bash
   npx supabase login
   npx supabase link --project-ref qrwoywmvdesvwsskxben
   npx supabase gen types typescript --project-id qrwoywmvdesvwsskxben > types/database.ts
   ```
3. Auth redirects allowed: `https://erp2.shiroienergy.com/**` and `http://localhost:3000/**`.

## Environment variables

See `.env.example` for the full list. Vercel already has `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_ERP_URL`.
**Adding a new env var?** Send Vivek its name and value so it's added in Vercel, otherwise the deploy breaks.

## Supabase configuration

- Extensions: `pg_trgm`, `pg_cron`, `pg_net`, `vector`, `pgcrypto`, `uuid-ossp`, `supabase_vault`, `pg_stat_statements`.
- **Automatic RLS is ON**: every new `public` table gets RLS. No policy = zero rows returned.
- Use the new-style keys (publishable / secret), not legacy `anon` / `service_role`.
- Connections: transaction pooler (port 6543) for runtime/serverless (Prisma: add `?pgbouncer=true`);
  session pooler (port 5432) for migrations and `pg_dump`. Direct connection is IPv6-only.

## Free-plan limits

| Limit | Value |
|---|---|
| Database size | 500 MB |
| File storage | 1 GB (50 MB per file) |
| Egress | 5 GB / month |
| Backups | **None automatic** — run `npx supabase db dump -f backup.sql` (gitignored) before risky migrations |
| Inactivity | Pauses after 7 days idle; resume from the dashboard |

## Rules

1. Never commit `.env*`, keys, passwords, customer data, price lists or salary data. Git history is permanent;
   if a secret leaks, tell Vivek immediately so it can be rotated.
2. Secret key and DB password are server-only. Anything `NEXT_PUBLIC_*` ships to the browser.
3. RLS on every table, with an explicit policy written in the same migration.
4. Money: `NUMERIC(14,2)`, never float.
5. Store dates in UTC; display in IST (`Asia/Kolkata`).
6. Files go in Supabase Storage; the DB stores only the path.
7. Schema changes = numbered SQL files in `supabase/migrations/`, applied by the `Database` workflow.
   Never click-create tables in the dashboard. Regenerate and commit types with each migration.
   `supabase/seed.sql` holds fake data only, written idempotently (`ON CONFLICT DO NOTHING`).
8. Index every column you filter, sort or join on.
9. Use `@supabase/ssr` for Next.js auth.
10. If you add `vercel.json`, keep `"regions": ["bom1"]`.

## Reference

ERP1 (https://github.com/Shiroi-Energy-LLP/shiroi-erp): `CLAUDE.md`, `docs/SHIROI_MASTER_REFERENCE.md`,
`docs/modules/*.md`, `docs/design/design-system.md`, `packages/ui`.

Contacts: Vivek — owner, approvals, Vercel, DNS, billing, GitHub org admin.
