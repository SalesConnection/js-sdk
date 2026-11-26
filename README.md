![NPM Version](https://img.shields.io/npm/v/%40caction%2Fsdk)
![NPM Downloads](https://img.shields.io/npm/dm/%40caction%2Fsdk)
![GitHub last commit](https://img.shields.io/github/last-commit/SalesConnection/js-sdk)

# @caction/sdk

TypeScript/JavaScript client for the Caction external API.

## Install

```
npm install @caction/sdk
```

## Quick start

```ts
import SDK from '@caction/sdk';

const sdk = new SDK(
    'https://<your-instance>/ext/api', // base URL; the SDK appends /v1/<path>
    process.env.CACTION_API_KEY!,
    process.env.CACTION_API_SECRET!,
);

const assets = await sdk.getAssets();
console.log(assets.data);
```

The key and secret are sent as `key` and `secret` headers on every request. Load them from environment variables; never commit them.

## Responses and errors

Methods return `Response<T>` or `PaginatedResponse<T>` (see exported types). Most methods accept a generic to type the payload, e.g. `sdk.getDetail<MyShape>(type, refId)`.

On failure, methods log the error with `console.error` and rethrow the underlying axios error, so wrap calls in `try/catch`.

## API

| Area | Methods |
| --- | --- |
| Templates | `getCategory`, `getStatus`, `getTemplate` |
| Data | `search`, `getDetail`, `createData`, `updateData`, `getRelatedIdsFromMainId`, `resolveHiddenDeal` |
| Status | `updateStatus`, `statusLogData`, `allStatusLog` |
| Assets | `getAssets`, `getAssetMapping`, `syncAttachAssetList` |
| Products | `getProducts`, `getAttachedProducts`, `attachProduct` |
| Attachments | `getAttachments`, `uploadAttachment`, `resolveAttachmentUrl` |
| Permissions | `getPermissions`, `savePermissions` |
| Comments | `saveComment`, `getCommentList`, `forwardComments` |
| Checklists | `getChecklistListing`, `getChecklistTemplate`, `getChecklistDetails`, `saveChecklist`, `deleteChecklist` |
| Users | `getUsers`, `getUserList`, `getDepartments` |
| Travel | `getJobTravelList` |
| Raw | `call(path, axiosOptions, version = 'v1')` for endpoints without a wrapper |

Helper classes for working with field values (`FieldHelper`, `ChecklistHelper` and related) are also exported.

## Development

```
npm ci
npm run build   # tsc -> dist/
```

Contributor and AI-agent conventions are in [.kiro/steering/](./.kiro/steering/) (indexed by [AGENTS.md](./AGENTS.md)).

## Release

Maintainers only. The full checklist is in [.kiro/steering/release.md](./.kiro/steering/release.md).

```
git checkout main && git pull --ff-only
npm ci
npm version <patch|minor|major>   # commits "X.Y.Z" and tags vX.Y.Z
npm publish                       # prepublishOnly runs the build
git push origin main --follow-tags
```

## License

ISC
