---
inclusion: manual
---
# Releasing to npm

Manual release, only when the user asks. There is no CI. Publishing is irreversible
(npm blocks republishing a version, and unpublishing is restricted), so ask for
confirmation before the final `npm publish`.

1. Start on `main`, up to date with origin, with a clean working tree
   (`git status`, `git pull --ff-only`).
2. Run `npm ci && npm run build`. `dist/` is gitignored; `prepublishOnly` also rebuilds it on publish.
3. Check what will ship: `npm pack --dry-run`. Expect `dist/`, package.json and
   README. There must be no `.env`, no `test.*`, and no credentials.
4. Bump the version: `npm version patch|minor|major`. This commits as "X.Y.Z" and
   creates the `vX.Y.Z` tag, matching previous releases.
   - patch: fixes. minor: new methods or optional params. major: breaking changes.
5. Confirm you are logged in with `npm whoami`. If not, the maintainer runs
   `npm login`. An agent must never handle OTPs or tokens.
6. Publish: `npm publish` (`publishConfig.access` is already `public`).
7. Push the commit and tag: `git push origin main --follow-tags`.
8. Verify: `npm view @caction/sdk version` returns the new version.

If a release is wrong, publish a new patch version and run `npm deprecate` on the
bad one. Do not unpublish.
