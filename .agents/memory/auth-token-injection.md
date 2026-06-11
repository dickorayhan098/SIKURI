---
name: Auth token injection
description: setAuthTokenGetter must be called at module load to attach Bearer token to all API requests
---

The generated `customFetch` in `@workspace/api-client-react` supports a token getter hook via `setAuthTokenGetter`. Without calling it, every authenticated API request (including `/api/auth/me`) returns 401 even though the token is stored in localStorage.

**Fix:** Call `setAuthTokenGetter(() => localStorage.getItem("token"))` at module level in `useAuth.ts`. Reading from localStorage (not a closure over a Zustand value) ensures the getter is always current — no need to re-register when the token changes.

**Why:** `setAuthTokenGetter` is a module-level singleton. It's only registered once at import time, but since the getter reads `localStorage.getItem("token")` on every request, it always reflects the latest token regardless of React state lifecycle.

**How to apply:** In `artifacts/sikuri-si/src/hooks/useAuth.ts`, add this line before the Zustand store definition:
```ts
setAuthTokenGetter(() => localStorage.getItem("token"));
```
Import `setAuthTokenGetter` from `@workspace/api-client-react` (already re-exported from `custom-fetch.ts`).
