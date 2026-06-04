---
name: Express early return pattern
description: TypeScript strict mode rejects `return toast(...)` in async functions — use the two-statement pattern instead
---

In Express async route handlers and async React callbacks, TypeScript TS7030 ("Not all code paths return a value") fires when you write:

```ts
if (!form.value) return toast({ title: "Error", variant: "destructive" });
```

Because `toast()` returns `void` and the function is `async () => Promise<void>`, the early-return pattern is technically valid but TypeScript's strict control-flow analysis flags it.

**Fix:** Use the two-statement pattern:
```ts
if (!form.value) { toast({ title: "Error", variant: "destructive" }); return; }
```

**Why:** Express 5 + TypeScript strict mode requires `return` to be clearly typed as `void` or a specific value. The `return someVoidFn()` shorthand confuses the checker in async contexts.

**How to apply:** Any time an async function has an early-return guard that calls a side-effectful function (toast, console.log, etc.), split into two statements.
