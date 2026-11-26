# AGENTS.md

TypeScript SDK (`@caction/sdk`) for the Caction REST API. Build with `npm run build`.

Project guidance lives in `.kiro/steering/`. Kiro loads these files automatically;
other agents should read them before working:

- `product.md`: what the SDK is and who uses it.
- `tech.md`: commands, layout, conventions, rules. Read before any change.
- `security.md`: credential handling. Always applies.
- `api-method-pattern.md`: read when adding or changing an endpoint in `src/`.
- `release.md`: read before publishing to npm. Confirm with the user before `npm publish`.
