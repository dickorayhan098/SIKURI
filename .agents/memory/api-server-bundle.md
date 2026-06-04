---
name: API server bundle staleness
description: esbuild bundles all routes at build time; new route files won't appear in the running server until a rebuild
---

When new route files are added to `artifacts/api-server/src/routes/` and registered in `routes/index.ts`, the running server won't serve them until the bundle is rebuilt. The dev workflow script runs `pnpm run build && pnpm run start`, so restarting the workflow triggers a rebuild and picks up new routes.

**Why:** esbuild produces a single `dist/index.mjs` that bundles everything at compile time. If the dist is stale (from a previous workflow run), new routes simply aren't in it.

**How to apply:** After adding new route files, always restart the `artifacts/api-server: API Server` workflow. If routes still return 404, check the bundle size — a stale 1.4MB bundle vs the expected 2.2MB+ means routes weren't included.
