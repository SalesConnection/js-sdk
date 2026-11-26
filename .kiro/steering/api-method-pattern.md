---
inclusion: fileMatch
fileMatchPattern: "src/**/*.ts"
---
# Adding an endpoint

1. Add request/response types to `src/types/index.ts`.
2. Add an `async` method to `SDK` in `src/index.ts` that calls `this.call<T>(path, { method, params | data })`.
3. Default the generic to the usual shape; return `Response<T>` or `PaginatedResponse<T>`.
4. Wrap in try/catch: `console.error` with context, then rethrow.
5. Add the method to the API table in README.md.
6. Run `npm run build`.

Never change existing public signatures; add optional parameters instead.
