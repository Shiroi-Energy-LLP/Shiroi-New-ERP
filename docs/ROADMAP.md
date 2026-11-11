# Shiroi Solar ERP — Roadmap

> One platform for Rooftop & Ground Mount solar project management.
> Source: the master prompt (2026-11-09). This file is the build plan; update the status column as modules ship.

## Product rules

- **Two business divisions**: Rooftop and Ground Mount. The user picks one on the landing screen and the whole app
  scopes to it (URL: `/rooftop/...` or `/ground-mount/...`). Most modules are shared; project templates, BOQs,
  workflows and reports differ per division. Division-specific tables carry a `division` column.
- Minimal, fast, few clicks, works well on a phone. Feel: Linear / Notion, simplified for solar EPC.
- Single company (Shiroi only): no multi-tenant columns.

## Lifecycle

Lead → Site Visit → Proposal → Negotiation → Sales Order → Project Creation → Engineering → Bill of Materials →
Purchase → Inventory Allocation → Installation → Testing → Commissioning → CEIG → Net Meter → Handover →
Invoice → Payment Collection → Warranty → AMC

## Roles

Super Admin, Director, Sales Manager, Sales Engineer, Project Manager, Project Engineer, Purchase, Accounts, HR,
Store Manager, Technician. Customer and Vendor (portal users) arrive with the Phase 4 customer portal.

## Phases

| Phase | Modules | Status |
|---|---|---|
| 1 (MVP) | Login, User Roles, Division selector, Dashboard, **CRM** | In progress |
| 1 (MVP) | Sales (quotation, proposal, solar calc, ROI, pricing, discount approval, versions, convert to project) | Next |
| 1 (MVP) | Projects (stages, tasks, milestones, daily updates, photos, documents, team) | Planned |
| 1 (MVP) | Finance (customer payments, invoices, GST, expenses, receivables) | Planned |
| 2 | Procurement, Inventory, BOQ / material master, Purchase, Vendors | Planned |
| 3 | HR, Attendance, Payroll, Expense claims | Planned |
| 4 | Service, AMC, Warranty, Customer portal | Planned |
| 5 | Reports, Mobile app, Notifications, WhatsApp, AI assistant | Planned |

## Module checklist (from the master prompt)

- **Dashboard**: today's follow-ups, new leads, quotations pending, projects in progress/completed, POs pending,
  material shortage, today's expenses, outstanding payments, upcoming installations, attendance, revenue, profit.
  Quick actions: add lead, create proposal, new project, generate invoice, create PO, record expense.
  Cards light up as their module ships.
- **CRM**: sources (website, manual, WhatsApp, referral, IndiaMart, Facebook, Google); stages (new, contacted,
  site visit, proposal sent, negotiation, won, lost); customer, address, map, phone, email, load requirement,
  monthly EB bill, roof type, photos, documents, assigned engineer, activity timeline, tasks, follow-ups, site visits.
- **Sales**: quotation, proposal, solar calculation, ROI, generation estimate, system design, component selection,
  pricing, discount approval, proposal versioning, customer approval, digital signature, convert to project.
- **Projects**: site survey, engineering, structure design, BOM, installation, testing, commissioning, net meter,
  CEIG, documentation, handover, warranty; timeline, tasks, milestones, progress %, daily updates, photos,
  documents, team, expenses, issues, approvals.
- **BOM / materials**: master materials (panels, inverters, structures, AC/DC cable, MC4, earthing, LA,
  consumables), vendor mapping, price history, stock availability, project BOQ, revisions.
- **Procurement**: purchase request, RFQ, vendor comparison, PO, dispatch, received, QC, vendor payments, pending orders.
- **Inventory**: warehouse, project stock, transfers, stock in/out, minimum stock alert, serial tracking
  (inverters, modules), returns, damages.
- **Finance**: customer payments, invoices, GST, vendor/purchase bills, expenses, daily cash, bank transactions,
  employee claims, project profit, receivables, payables, TDS, GST reports, cash flow.
- **HR**: employee master, attendance, leave, payroll, salary, daily work report, field engineers, technicians,
  vehicle allocation, performance, ID cards.
- **Service & AMC**: complaints, tickets, warranty, AMC, site visits, replacements, service history,
  generation report, customer feedback.
- **Reports**: sales, leads, projects, finance, purchase, inventory, P&L, employees, site progress, cash flow, analytics.
- **Settings**: users, roles, permissions, masters, company details, GST, banks, approval workflow,
  email / WhatsApp / SMS, backup, audit log.

## Stack decisions

| Area | Choice | Note |
|---|---|---|
| App | Next.js 16 + React 19 + TypeScript + Tailwind 4 | "React + TS + Tailwind" from the brief |
| UI kit | Hand-built shadcn-style components in `src/components/ui` | Same look and API style; no registry download needed |
| Backend | Supabase (Auth, Postgres, Storage, RLS) | Access control lives in RLS policies |
| ORM | **None (Prisma skipped)** | Supabase client + generated types; Prisma can't connect from cloud sessions and would duplicate RLS |
| Charts | Recharts | When Reports land |
| Maps | Google Maps API | Needs an API key (Phase 1 uses map links only) |
| PDF | React PDF | Proposals and invoices |
| Hosting | Vercel (Mumbai) + Supabase (Mumbai) | |
