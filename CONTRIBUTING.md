# Contributing to osmDesign

Thanks for helping improve osmDesign. Keep changes focused, test the behavior you touch, and preserve the local-first app boundaries.

## Setup

```bash
corepack enable
pnpm install
pnpm tools-dev start web
```

## Development Notes

- Use `pnpm tools-dev` for local lifecycle commands.
- Keep shared API shapes in `packages/contracts`.
- Keep daemon-only filesystem, process, SQLite, and network code out of web packages.
- Keep app-owned source TypeScript-first unless a file is generated, vendored, or explicitly documented as a compatibility entrypoint.
- Keep desktop runtime changes namespace-aware so multiple local runs can coexist.

## Validation

Run the narrowest relevant checks while iterating, then broaden when a change crosses package boundaries.

```bash
pnpm --filter @osmdesign/web typecheck
pnpm --filter @osmdesign/daemon test
pnpm typecheck
pnpm test
pnpm build
```

## Pull Requests

Before opening a pull request:

- Explain the user-facing behavior or developer workflow that changed.
- Include the checks you ran.
- Avoid unrelated formatting churn.
- Do not add co-author trailers to commits.

Issues and discussions live at [github.com/junainfinity/osmDesign](https://github.com/junainfinity/osmDesign).
