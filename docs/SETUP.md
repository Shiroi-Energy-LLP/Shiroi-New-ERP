# ERP2 — Environment & Setup

> This repo is **public**. No secrets live here. Real keys, the DB password and connection
> strings are in the private handover doc (ask Vivek) and go in your local `.env.local`.

## Infrastructure

| Item | Value |
|---|---|
| Live URL | https://erp2.shiroienergy.com |
| Hosting | Vercel project `shiroi-erp2` in Manivel's Vercel account (moves to a Shiroi team before go-live), functions in Mumbai (`bom1`) |
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
| DB access for Claude | Supabase connector (your own login), no password needed | No |
| Deploy access for Claude | Vercel connector (your own login) | No |
| DB connection string for CI (optional, before go-live) | GitHub repo secret `SUPABASE_DB_URL` | No |
| Keys for Claude Code cloud sessions | Claude cloud environment "Shiroi New ERP" settings | No |
| Full handover doc (password, secret key) | Password manager / private vault | **Never** |
| Real customer/price/salary data, imports | Supabase Storage, or gitignored `data/` on a laptop | **Never** |

## Working from a phone (primary workflow)

Nothing runs on the phone itself. Claude Code cloud sessions do the work through the **Supabase** and **Vercel** connectors,
which use your own logins, so no password or secret key is stored in Claude or typed by you.

1. **Code**: Claude works on a branch and opens a PR. Vercel posts a **preview URL**; open it on the phone.
2. **Schema**: Claude applies migrations with the Supabase connector and saves the same SQL in
   `supabase/migrations/<version>_<name>.sql` (rules in `CLAUDE.md`).
3. **Dummy data**: `supabase/seed.sql`, loaded by Claude through the connector.
4. **Go live**: merge the PR to `main` (GitHub app, or tell Claude "push to main").

The `Database` GitHub workflow skips itself until the `SUPABASE_DB_URL` repo secret exists. Before real data goes in,
add that secret (Vivek, as repo admin) and make PR-reviewed migrations the only route.

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
**Adding a new env var?** Add it in Vercel too (Settings → Environment Variables, or ask Claude to use the Vercel connector).
Otherwise the deploy breaks. DNS (`CNAME erp2`) is at GoDaddy and owned by Vivek: send him any DNS change Vercel asks for.

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

Contacts: Vivek — owner, approvals, DNS (GoDaddy), billing, GitHub org admin. Manivel — Vercel project (for now).
