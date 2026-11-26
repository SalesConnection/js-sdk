---
inclusion: always
---
# Security

- Never put API keys or secrets in code, tests, docs or commit messages. Use placeholders.
- `src/test.ts` is local-only and gitignored. Do not copy values from it.
- Never log the `key` or `secret` headers.
- Never run `npm login` or handle OTPs or tokens on the user's behalf.
