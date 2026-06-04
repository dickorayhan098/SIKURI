---
name: Hook call signatures
description: Generated React Query hooks have different arities depending on whether the endpoint has path/query params
---

Generated hooks from Orval follow these patterns:

- `useListXxx(options?)` — **1 arg** — for list endpoints with no URL params (e.g. `useListCpl`)
- `useListXxx(params?, options?)` — **2 args** — for list endpoints with query params (e.g. `useListCpmk`)
- `useGetXxx(id, options?)` — **2 args** — for get-by-id endpoints
- `useCreateXxx` / `useUpdateXxx` / `useDeleteXxx` — mutation hooks, no query params

When passing `UseQueryOptions` directly (e.g. `{ query: { enabled: ... } }`), `queryKey` is **required** by the strict TypeScript type. The easiest approach is to call hooks with **no extra options** and let the generated defaults handle queryKey and caching.

**Why:** Orval generates hooks with a different number of parameters based on the OpenAPI spec. Using a cast like `as Parameters<typeof useGetXxx>[1]` breaks TypeScript's return type inference, making `data` resolve to `{}`.

**How to apply:** Always check `lib/api-client-react/dist/generated/api.d.ts` for the exact signature before calling a hook. If you need `enabled`, pass only `{ query: { enabled: !!id } }` — omit `queryKey` unless the type explicitly allows it as optional.
