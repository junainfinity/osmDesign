# osmDesign Quick Start

## 1. Install

```bash
corepack enable
pnpm install
```

## 2. Run The App

```bash
pnpm tools-dev start web
```

Open the URL printed by the command. The launcher starts both the local daemon and the web workspace.

## 3. Configure AI

Open Settings and choose one of:

- **osmAPI.com** - paste your osmAPI key and enter a model your account can use.
- **Local AI server** - point osmDesign at a local OpenAI-compatible endpoint such as Ollama or LM Studio.

No session login is required.

## 4. Create Work

Use the new-project panel to create:

- Prototype
- Slide deck
- From template

Projects are stored in `.od/` by default. Set `OD_DATA_DIR` to relocate local runtime data.

## 5. Package Desktop

```bash
pnpm tools-pack mac build --to all
```

The same web, daemon, and sidecar boundaries are used by the Electron runtime.
