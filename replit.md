# SIKURI SI

Sistem Informasi Kurikulum Program Studi S1 Sistem Informasi — manages courses, CPL, CPMK, mapping matrices, and RPS documents for BAN-PT accreditation.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied to `/api`)
- `pnpm --filter @workspace/sikuri-si run dev` — run the frontend (proxied to `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — build libs first (required before leaf package typechecks)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres/Supabase connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + esbuild CJS bundle
- DB: PostgreSQL (Supabase) + Drizzle ORM
- Frontend: React + Vite + Wouter + TanStack Query + Shadcn/UI + Recharts + Zustand
- Validation: Zod (`zod/v4`), `drizzle-zod`, Orval codegen
- Auth: base64 token (userId:role:timestamp), SHA-256 password hash with salt `sikuri_salt_2025`

## Where things live

- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/api-server/src/routes/index.ts` — router registration (all sub-routers)
- `artifacts/sikuri-si/src/pages/` — all frontend pages (17 pages)
- `artifacts/sikuri-si/src/hooks/useAuth.ts` — Zustand auth store
- `lib/db/src/schema/` — Drizzle schema per entity
- `lib/api-spec/openapi.yaml` — source of truth for API contract
- `lib/api-zod/src/generated/` — generated Zod schemas (from Orval)
- `lib/api-client-react/src/generated/` — generated React Query hooks (from Orval)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → Zod validators (server) + React Query hooks (frontend)
- Token-based auth (no sessions): base64-encoded userId:role:timestamp stored in localStorage; server validates by decoding
- Referensi router mounted at `/` before specific routers — unmatched paths fall through to next middleware
- Hook signatures vary: `useListCpl(options?)` vs `useListCpmk(params?, options?)` — always check generated declarations
- `return toast(...)` pattern breaks TS strict return checks — use `{ toast(...); return; }` instead

## Product

- Dashboard: stats summary + SKS per semester chart + RPS completion table
- Mata Kuliah: 66 courses with CRUD, filtering by semester/tipe, CPL/CPMK detail view
- CPL Prodi: 14 CLO entries with CRUD grouped by type
- CPMK: 145 course learning outcomes, grouped by parent CPL
- Sub-CPMK: granular learning indicators linked to CPMK and courses
- Pemetaan: CPL-MK, CPL-CPMK, CPMK-SubCPMK mapping matrices
- RPS: document lifecycle management (DRAFT → REVIEW → FINAL → ARSIP), pertemuan editor
- Referensi: profil lulusan, bahan kajian, CPL SNDIKTI
- Admin: user management with role-based access (ADMIN, KAPRODI, DOSEN, OPERATOR)

## Default credentials

- Email: `admin@sikuri.id`
- Password: `admin123`
- Role: ADMIN

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm run typecheck:libs` before running `pnpm --filter @workspace/sikuri-si run typecheck` — otherwise lib declarations are stale
- API server bundles with esbuild: after adding new route files, the old dist stays stale until the next `pnpm run build` inside api-server. The dev workflow does build first, so a workflow restart picks up new files.
- Hook call signature differs per hook — `useListCpl(options?)` takes 1 arg; `useListCpmk(params?, options?)` takes 2; `useGetXxx(id, options?)` takes 2. When passing `UseQueryOptions` directly, `queryKey` is required — easiest fix is to call hooks with no extra options.
- The `router.use("/", referensiRouter)` in routes/index.ts is before `router.use("/users", usersRouter)` — unmatched paths fall through automatically in Express
- `zustand` must be in `artifacts/sikuri-si/package.json` dependencies (not catalog) — install with `pnpm --filter @workspace/sikuri-si add zustand`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
