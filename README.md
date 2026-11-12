# Pennypal — Smart Finance Tracker

A personal finance tracker with a warm **"Paper Ledger"** design system — track income and expenses,
set per-category budgets, analyze spending, and export reports. **React + TypeScript** frontend with a
**Supabase** backend (Auth, PostgreSQL, Realtime). Runs in two modes: **live** (real Supabase, per-user
private data) or an **offline demo** (seeded workspace persisted to `localStorage`) when no backend
credentials are present.

## Live demo
- **Hosted fullstack app:** https://jolly-wisp-e62341.netlify.app — real Supabase auth + per-user private Postgres + realtime. Create an account to explore.
- **Offline demo:** building *without* Supabase keys produces a self-contained version that runs from a localStorage seed (the build embedded in the portfolio).

## Features
- **Dashboard** with count-up stat tiles, cash-flow chart, and category donut (Recharts, real computed data)
- **Transactions** CRUD with search, type/category filters, sorting, and pagination
- **Budgets** per category with progress bars and over/near-limit alerts
- **Analytics & Reports** — monthly comparisons, category breakdowns, and **CSV export**
- **Real notifications** — the bell surfaces genuine budget and large-spend alerts derived from your data
- **Real search** — the header search jumps to Transactions and applies the query
- **Skeleton loaders** on view changes and initial load
- **Offline demo mode** — a fully seeded workspace in `localStorage` when no backend is configured
- **Mobile-responsive** — hamburger + slide-in drawer; desktop sidebar collapses
- **Paper Ledger design system** — warm paper surfaces, copper/pine/terracotta semantics, Fraunces display
  numerals, hand-drawn penny logo (no default Tailwind palette)

## Tech stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Context API, Recharts, date-fns, lucide-react, react-hot-toast
- **Backend:** Supabase — Auth, PostgreSQL (per-user Row Level Security), Realtime

## Getting started (demo mode)
```bash
git clone <your-repo-url>
cd pennypal
npm install
npm run dev
```
Open the local URL — it runs in **demo mode** out of the box (seeded data, saved to `localStorage`).

## Going live with Supabase
1. Create a Supabase project.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL Editor (creates `transactions` + `budgets`
   with **per-user private** RLS and realtime).
3. Copy `.env.example` → `.env`; set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
   (the **publishable** key on newer dashboards).
4. `npm run build` → deploy `dist/` to any static host (Netlify Drop / Vercel / GitHub Pages).
   Sign in with a real Supabase account; your data is private to your user.

## Project structure
```
src/
  components/   layout (Sidebar/Header), Skeleton, Logo, dashboard/, transactions/,
                analytics/, reports/, settings/, auth/
  context/      AppContext (data + auth + demo fallback + realtime)
  lib/          supabase.ts (client + isDemoMode), demoStorage.ts (localStorage)
  data/         (seed lives in AppContext demo branch)
  types/        domain models (Transaction, Budget, User)
supabase/
  schema.sql    transactions + budgets, per-user RLS, realtime publication
```

## Scripts
- `npm run dev` — local dev server
- `npm run build` — production build (single file via `vite-plugin-singlefile`)
- `npm run preview` — preview the production build

## Notes
- Finance data is **private per user**: RLS policies scope every row to `auth.uid()`, so one user can never
  read another's transactions/budgets.
- The **publishable/anon** key is safe in the client bundle; RLS protects the data. Never ship a secret key.

## Author
Mitchell Osiago — **CodesBy.Mitch**

## License
MIT
