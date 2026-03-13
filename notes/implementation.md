# Implementation Plan: Chat Diagram Generator

This document is the step-by-step guide to build the monorepo from scratch, following the design in `notes/design.md`.

---

## Repository layout

```
/
├── apps/
│   ├── chat-app/          Next.js 14 (App Router)
│   └── chat-service/      NestJS 10
├── packages/
│   └── eslint-config/     shared ESLint config
├── package.json           root workspace
├── turbo.json
├── tsconfig.base.json
├── .prettierrc
└── .gitignore
```

---

## Phase 1 — Root monorepo scaffold

### Step 1 — Root `package.json`

- Set `"private": true`
- `"workspaces": ["apps/*", "packages/*"]`
- Scripts:
  - `"dev"` → `turbo run dev`
  - `"build"` → `turbo run build`
  - `"test"` → `turbo run test`
  - `"lint"` → `turbo run lint`
  - `"format"` → `prettier --write .`
- `devDependencies`: `turbo`, `typescript`, `prettier`, `eslint`

### Step 2 — `turbo.json`

Define four pipeline tasks:

- `build` — `dependsOn: ["^build"]`, outputs `[".next/**", "dist/**"]`
- `dev` — `cache: false`, `persistent: true`
- `test` — `dependsOn: ["^build"]`
- `lint` — no dependsOn, no outputs

### Step 3 — `.prettierrc`

```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "none",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Step 4 — `.gitignore`

Include: `node_modules`, `dist`, `.next`, `.turbo`, `*.env.local`, `.env`, `coverage`

### Step 5 — `tsconfig.base.json`

Strict base shared across all packages:
- `"strict": true`
- `"target": "ES2022"`
- `"moduleResolution": "bundler"`
- `"esModuleInterop": true`
- `"skipLibCheck": true`
- Do not set `paths` here — each app extends this and adds its own

---

## Phase 2 — Shared ESLint config

### Step 6 — `packages/eslint-config/package.json`

- `"name": "@repo/eslint-config"`
- `"main": "index.js"`
- `"peerDependencies"`: `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`

### Step 7 — `packages/eslint-config/index.js`

Export a config object with:
- `extends`: `["eslint:recommended", "plugin:@typescript-eslint/recommended"]`
- `parser`: `@typescript-eslint/parser`
- `rules`:
  - `no-magic-numbers`: `["error", { ignore: [0, 1, -1], ignoreArrayIndexes: true, ignoreDefaultValues: true }]`
  - `padding-line-between-statements`: `["error", { blankLine: "always", prev: ["const","let","var"], next: "*" }, { blankLine: "any", prev: ["const","let","var"], next: ["const","let","var"] }]`

---

## Phase 3 — `apps/chat-service` Hello World

### Step 8 — `apps/chat-service/package.json`

- `"name": "chat-service"`
- Scripts: `"dev"` → `nest start --watch`, `"build"` → `nest build`, `"test"` → `jest`
- `dependencies`: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `reflect-metadata`, `rxjs`
- `devDependencies`: `@nestjs/cli`, `@nestjs/testing`, `jest`, `ts-jest`, `@repo/eslint-config`

### Step 9 — `apps/chat-service/tsconfig.json` and `nest-cli.json`

- `tsconfig.json` extends `../../tsconfig.base.json`, adds `"experimentalDecorators": true`, `"emitDecoratorMetadata": true`
- `nest-cli.json`: `{ "sourceRoot": "src" }`

### Step 10 — Minimal Hello World app

- `src/main.ts` — `NestFactory.create(AppModule)`, listen on port `3001`
- `src/app.module.ts` — imports `AppController`, provides nothing else
- `src/app.controller.ts` — `@Get('/')` returns `"Hello World"`

**Verify:** `turbo run dev --filter=chat-service` → `curl localhost:3001` returns `Hello World`

---

## Phase 4 — `apps/chat-app` Hello World

### Step 11 — `apps/chat-app/package.json`

- `"name": "chat-app"`
- Scripts: `"dev"` → `next dev`, `"build"` → `next build`, `"test"` → `jest`
- `dependencies`: `next`, `react`, `react-dom`
- `devDependencies`: `@types/react`, `@types/react-dom`, `@repo/eslint-config`

### Step 12 — `apps/chat-app/tsconfig.json` and `next.config.ts`

- `tsconfig.json` extends `../../tsconfig.base.json`, adds `"jsx": "preserve"`, `"lib": ["dom", "ES2022"]`
- `next.config.ts`: minimal config, no rewrites yet (added in Phase 6)

### Step 13 — Minimal Hello World app

- `src/app/page.tsx` — renders `<h1>Hello World</h1>`
- `src/app/layout.tsx` — minimal root layout

**Verify:** `turbo run dev --filter=chat-app` → `localhost:3000` shows Hello World

---

## Phase 5 — `apps/chat-service` full implementation

### Step 14 — Chat module

Files: `src/chat/`

- `chat.module.ts` — imports `HistoryModule`, provides `ChatService`
- `chat.controller.ts` — `@Post('chat')`, delegates to `ChatService.handleMessage(dto)`
- `chat.service.ts` — injects `HistoryAdapter` + `ModelProvider`; gets history by chatId, calls provider, appends turn, returns response
- `dto/chat-request.dto.ts` — `{ chatId: string; message: string }`
- `dto/chat-response.dto.ts` — `{ type: 'diagram' | 'message'; content: string; diagram?: string }`

### Step 15 — History adapter

Files: `src/history/`

- `turn.type.ts` — `{ role: 'user' | 'assistant'; content: string; diagram?: string }`
- `history.adapter.interface.ts` — `IHistoryAdapter`:
  - `get(chatId: string): Turn[]`
  - `append(chatId: string, turn: Turn): void`
- `in-memory-history.adapter.ts` — implements `IHistoryAdapter` using `Map<string, Turn[]>`; creates empty array for unknown `chatId`
- `history.module.ts` — provides `InMemoryHistoryAdapter` under the token `HISTORY_ADAPTER`, exports it

### Step 16 — Provider stubs

Files: `src/providers/`

- `model-provider.interface.ts` — `IModelProvider`:
  - `chat(history: Turn[], message: string): Promise<ChatResponseDto>`
- `stubs/default.stub.ts` — if `message.toLowerCase().includes('create')` → return diagram with hardcoded Mermaid flowchart; else → plain reply
- `stubs/openai.stub.ts` — same stub logic, different class name
- `stubs/anthropic.stub.ts` — same stub logic, different class name
- `provider.factory.ts` — reads `process.env.MODEL_PROVIDER`; returns matching stub; registered as NestJS provider

Environment variable:
- `MODEL_PROVIDER=openai` → `OpenAIStub`
- `MODEL_PROVIDER=anthropic` → `AnthropicStub`
- unset or anything else → `DefaultStub`

### Step 17 — Backend tests

Files: `src/**/*.spec.ts` + `jest.config.ts`

- `jest.config.ts`: use `ts-jest`, `testRegex: '.*\\.spec\\.ts$'`
- `default.stub.spec.ts` — message with "create" → type `'diagram'`; plain message → type `'message'`
- `provider.factory.spec.ts` — `MODEL_PROVIDER=openai` → `OpenAIStub`; unset → `DefaultStub`
- `in-memory-history.adapter.spec.ts` — new chatId → `[]`; after `append` → turn present; multiple turns accumulate in order
- `chat.controller.spec.ts` — integration via `@nestjs/testing`; `POST /chat` returns `200` with correct shape; two calls with same `chatId` show accumulated history

---

## Phase 6 — `apps/chat-app` full implementation

### Step 18 — Add remaining deps and proxy

- Add to `apps/chat-app/package.json`: `mermaid`, `uuid`, `@types/uuid`
- Update `next.config.ts`: add `rewrites` so `/api/:path*` → `http://localhost:3001/:path*` (eliminates CORS in dev)

### Step 19 — `src/app/page.tsx` — split-screen layout

- Client component (`'use client'`)
- Flex row layout, full viewport height
- Left 50%: `<ChatPanel onDiagram={setCurrentDiagram} />`
- Right 50%: `<DiagramPanel diagram={currentDiagram} />`
- `currentDiagram: string | null` state lives here

### Step 20 — `src/components/ChatPanel`

- Props: `onDiagram: (mermaidDef: string) => void`
- Local state: `messages: DisplayMessage[]`, `input: string`, `loading: boolean`
- `DisplayMessage`: `{ role: 'user' | 'assistant'; content: string }`
- On submit:
  1. Append user message to display list
  2. Call `postChat({ chatId: getChatId(), message: input })`
  3. Append assistant message to display list
  4. If `response.type === 'diagram'`, call `onDiagram(response.diagram)`
  5. On error: append error message to display list
- Render: scrollable message list + textarea + submit button; disable input while `loading`

### Step 21 — `src/components/DiagramPanel`

- Props: `diagram: string | null`
- Uses `useEffect` triggered on `diagram` change
- Mermaid is **dynamically imported** (`import('mermaid')`) — required for Next.js SSR compatibility
- Three states:
  - `diagram === null` → placeholder text ("Submit a message to generate a diagram")
  - diagram set → call `mermaid.render()`, display returned SVG
  - `mermaid.render()` throws → show error message in panel

### Step 22 — `src/lib/` and frontend tests

**Lib files:**
- `api.ts` — typed `postChat(req: ChatRequest): Promise<ChatResponse>` using `fetch('/api/chat', { method: 'POST', ... })`; throws on non-2xx
- `chat-id.ts` — `getChatId()`: reads `sessionStorage.getItem('chatId')`; if missing, generates a UUID v4, stores and returns it

**Jest config:** `jest.config.ts` with `testEnvironment: 'jsdom'`, `setupFilesAfterFramework: ['@testing-library/jest-dom']`

**Tests:**
- `ChatPanel.test.tsx` — submit message → appears in list; `'message'` response → assistant reply shown; `'diagram'` response → `onDiagram` called; fetch error → error message shown
- `DiagramPanel.test.tsx` — `null` → placeholder; diagram set → `mermaid.render` called (mock module); render throws → error state shown
- `api.test.ts` — `fetch` 200 → resolves typed response; `fetch` 500 → throws

---

## Phase 7 — Final verification

### Step 23 — Install dependencies

```bash
npm install
```

Run from repo root. npm resolves all workspace packages including `@repo/eslint-config`.

### Step 24 — Run and smoke test

```bash
turbo run dev
```

- `chat-service` on `http://localhost:3001`
- `chat-app` on `http://localhost:3000`

Manual steps:
1. Open `http://localhost:3000`
2. Submit `"Create a simple flowchart"` → diagram panel renders Mermaid flowchart
3. Submit `"What does this show?"` → plain reply in chat, diagram unchanged
4. Refresh → chat clears, diagram panel shows placeholder

Optional — run with a specific provider:
```bash
MODEL_PROVIDER=openai turbo run dev
```

### Step 25 — Run tests

```bash
turbo run test
```

All unit and integration tests should pass.
