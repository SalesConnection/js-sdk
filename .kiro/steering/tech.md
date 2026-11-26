---
inclusion: always
---
# Tech

## Commands
- Build: `npm run build` (tsc -> `dist/`). There are no tests or linter yet.
- Verify every change with a clean `npm run build`.

## Layout
- `src/index.ts`: `SDK` class (one method per endpoint), helper classes, default export.
- `src/types/index.ts`: all request/response types, re-exported from index.
- `src/test.ts`: local scratch file, gitignored. Never commit it.
- `dist/`: build output, gitignored. Do not edit.

## Conventions
- A new endpoint is one `async` method on `SDK`, built on `this.call<T>(path, opts)`.
- Return `Response<T>` or `PaginatedResponse<T>`. Method generics default to the common type, as in `getAssets<T = BaseAsset[]>`.
- Catch, `console.error` with context, then rethrow.
- Match the existing style: 4-space indent, aligned `=` and `:`.

## Rules
- This is a published library: do not break public method signatures or exports. Add optional params instead.
- Bump the version only as part of a release, and only when asked.
- Do not commit `.env`, `dist/` or `src/test.ts`.
