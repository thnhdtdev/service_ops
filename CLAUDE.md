# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Working style, scope rules, and security rules live in AGENTS.md and apply here:

@AGENTS.md

## Commands

Run from the repository root. Backend dependencies live in the root `package.json`; the frontend has its own (`npm install && npm --prefix frontend install`).

```bash
npm run dev:backend            # tsx watch, http://localhost:3001 (GET /health)
npm run dev:frontend           # Next.js dev server, http://localhost:3000
npm run typecheck:backend      # tsc --noEmit
npm run test:backend           # node:test via tsx (backend/src/app.test.ts)
npm run lint:frontend          # eslint
npm run format:check:frontend  # prettier (frontend only; backend has no formatter)
npm run build:backend && npm run start:backend
npm run build:frontend         # output: standalone
```

Run a single backend test by name:

```bash
npx tsx --test --test-name-pattern="health" backend/src/app.test.ts
```

Backend tests import `buildApp()`, which loads `backend/src/config/env.ts`; that file Zod-parses env at import time, so tests and the server fail immediately if `backend/.env` is missing or its Supabase values are empty.

## Environment

- `backend/.env`: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `FRONTEND_URL` (CORS origin, must match the frontend's actual URL), optional `PORT` (default 3001).
- `frontend/.env`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_API_URL` (base URL only, e.g. `http://localhost:3001`; request paths already start with `/api`).
- Only publishable/anon keys are used anywhere. There is no service-role client.

## Architecture

Two independent apps sharing one Supabase project. The base schema (tables `profiles`, `customers`, `services`, `orders`, `order_items`, `payments`, `daily_order_counters`; RLS policies; RPCs `create_order_transaction`, `add_order_payment_transaction`, `next_order_code`) exists only in Supabase and is not in the repo. Later changes are saved in `supabase/migrations/`, but the repo is not linked to the Supabase CLI: migrations are applied manually in the Supabase SQL Editor.

Writes to `customers`, `orders`, `order_items`, and `payments` have no RLS insert/update policies; they go through the `SECURITY DEFINER` RPCs, which recompute prices from `services` and lock the order row for payments. Users can only write `full_name` on their own profile; `role` is changed from the dashboard.

### Request and auth flow

1. Frontend signs in with Supabase Auth directly (`features/auth`), and `@supabase/ssr` stores the session in cookies.
2. `frontend/src/proxy.ts` (Next.js 16 "proxy", formerly middleware) refreshes the session and redirects unauthenticated users to `/login`. It must stay in `src/`, next to `app/`, or Next.js silently ignores it. After moving it, delete `frontend/.next` if Turbopack reports a stale path.
3. Frontend calls the backend with `Authorization: Bearer <supabase access token>`:
   - `lib/api/server.ts` → `serverApiFetch` for Server Components (verifies the user with `getUser()` first)
   - `lib/api/client.ts` → `apiFetch` for client components
4. Backend `requireAuth` (`middleware/auth/auth.middleware.ts`) validates the token with Supabase, loads `profiles.role` (`admin` | `staff`), and sets `request.user`, `request.accessToken`, `request.role` (typed in `types/fastify.d.ts`). `requireRole(...)` is available for role checks.
5. Services call `createUserSupabase(request.accessToken)` (`lib/supabase.ts`), so every query runs **as the user and is subject to RLS**. Authorization therefore depends on both backend checks and Supabase RLS policies.

### Backend (`backend/src`)

- `app.ts` builds the Fastify instance (CORS, global error handler that hides 5xx details, route registration under `/api/...`). `server.ts` only starts it. Tests use `app.inject()`.
- Each module in `modules/<name>/` follows `*.routes.ts` (handler: Zod `safeParse` → 400, then call service) → `*.service.ts` (Supabase queries / RPCs) → `*.schema.ts` (Zod). Pure calculations go in `*.utils.ts` (e.g. `orders/order-payment.utils.ts` centralizes paid/remaining amounts).
- Module system is NodeNext ESM-style: relative imports use `.js` extensions.

### Frontend (`frontend/src`)

- Next.js App Router. Authenticated pages live under `app/(dashboard)/`; `app/login` is public.
- Feature folders in `features/<name>/` hold `api/` or `services/` (backend calls), `components/`, `hooks/`, types, and utils. Shared UI is shadcn/ui in `components/ui`.
- Shared enums and labels (order/payment status, routes, units) are in `constants/`. Reuse them instead of hard-coding Vietnamese labels.
- User-facing text is Vietnamese.

## Repo notes

- Commit messages follow gitmoji format: `<emoji>  <type>: <description>` (two spaces after the emoji), e.g. `🐛  fix: ...`, `♻️  refactor: ...`.
- `.agents/skills/design-taste-frontend` is a third-party design skill (see `skills-lock.json`) aimed at landing pages, not dashboard UI.
