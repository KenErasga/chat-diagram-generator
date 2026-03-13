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

## Phase 3 — `apps/chat-service` (NestJS backend)

### Step 8 — `apps/chat-service/package.json`

- `"name": "chat-service"`
- Scripts: `"dev"` → `nest start --watch`, `"build"` → `nest build`, `"test"` → `jest`
- `dependencies`: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `reflect-metadata`, `rxjs`
- `devDependencies`: `@nestjs/cli`, `@nestjs/testing`, `jest`, `ts-jest`, `supertest`, `@types/supertest`, `@repo/eslint-config`
- `"eslintConfig"` or separate `.eslintrc.js` extending `@repo/eslint-config`

### Step 9 — `apps/chat-service/tsconfig.json` and `nest-cli.json`

- `tsconfig.json` extends `../../tsconfig.base.json`, adds `"experimentalDecorators": true`, `"emitDecoratorMetadata": true`
- `nest-cli.json`: `{ "sourceRoot": "src" }`

### Step 10 — Entry point

- `src/main.ts` — `NestFactory.create(AppModule)`, listen on port `3001` (or `process.env.PORT`)
- `src/app.module.ts` — imports `ChatModule`

### Step 11 — Chat module

Files: `src/chat/`

- `chat.module.ts` — imports `HistoryModule`, provides `ChatService`, exports nothing
- `chat.controller.ts` — `@Post('chat')`, calls `ChatService.handleMessage(dto)`
- `chat.service.ts` — injects `HistoryAdapter` + `ModelProvider`; gets history by chatId, calls provider, appends turn, returns response
- `dto/chat-request.dto.ts` — `{ chatId: string; message: string }`
- `dto/chat-response.dto.ts` — `{ type: 'diagram' | 'message'; content: string; diagram?: string }`

### Step 12 — History adapter

Files: `src/history/`

- `history.adapter.interface.ts` — `IHistoryAdapter` interface:
  - `get(chatId: string): Turn[]`
  - `append(chatId: string, turn: Turn): void`
- `in-memory-history.adapter.ts` — implements `IHistoryAdapter` using `Map<string, Turn[]>`; creates empty array for unknown `chatId`
- `history.module.ts` — provides `InMemoryHistoryAdapter` under the token `HISTORY_ADAPTER`, exports it
- `turn.type.ts` — `{ role: 'user' | 'assistant'; content: string; diagram?: string }`

### Step 13 — Provider stubs

Files: `src/providers/`

- `model-provider.interface.ts` — `IModelProvider`:
  - `chat(history: Turn[], message: string): Promise<ChatResponseDto>`
- `stubs/default.stub.ts` — implements `IModelProvider`; if `message.toLowerCase().includes('create')` → return diagram with a hardcoded Mermaid flowchart; else → return plain reply
- `stubs/openai.stub.ts` — same stub logic, different class name (simulates OpenAI provider shape)
- `stubs/anthropic.stub.ts` — same stub logic, different class name (simulates Anthropic provider shape)
- `provider.factory.ts` — `ModelProviderFactory` reads `process.env.MODEL_PROVIDER`; returns the matching stub (`openai` → `OpenAIStub`, `anthropic` → `AnthropicStub`, default → `DefaultStub`); registered as a NestJS provider

### Step 14 — Backend tests

Files: `src/**/*.spec.ts` + `jest.config.ts`

- `jest.config.ts`: use `ts-jest`, `testRegex: '.*\\.spec\\.ts$'`
- `default.stub.spec.ts` — given message with "create" → type is `'diagram'`; given plain message → type is `'message'`
- `provider.factory.spec.ts` — `MODEL_PROVIDER=openai` → returns `OpenAIStub`; unset → returns `DefaultStub`
- `in-memory-history.adapter.spec.ts` — new chatId returns `[]`; after `append` returns the turn; multiple turns accumulate
- `chat.controller.spec.ts` — integration test via `@nestjs/testing`; `POST /chat` with valid body returns `200` with correct shape

---

## Phase 4 — `apps/chat-app` (Next.js frontend)

### Step 15 — `apps/chat-app/package.json`

- `"name": "chat-app"`
- Scripts: `"dev"` → `next dev`, `"build"` → `next build`, `"test"` → `jest`
- `dependencies`: `next`, `react`, `react-dom`, `mermaid`, `uuid`
- `devDependencies`: `@types/react`, `@types/uuid`, `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@repo/eslint-config`

### Step 16 — `apps/chat-app/tsconfig.json` and `next.config.ts`

- `tsconfig.json` extends `../../tsconfig.base.json`, adds `"jsx": "preserve"`, `"lib": ["dom", "ES2022"]`
- `next.config.ts`: configure `rewrites` so `/api/:path*` proxies to `http://localhost:3001/:path*` — eliminates CORS in dev

### Step 17 — `src/app/page.tsx`

- Client component (`'use client'`)
- Flex row layout, full viewport height
- Left 50%: `<ChatPanel />`
- Right 50%: `<DiagramPanel diagram={currentDiagram} />`
- `currentDiagram` state lives here; `ChatPanel` calls up via callback when a diagram response arrives

### Step 18 — `src/components/ChatPanel`

- Props: `onDiagram: (mermaidDef: string) => void`
- Local state: `messages: DisplayMessage[]`, `input: string`, `loading: boolean`
- `DisplayMessage`: `{ role: 'user' | 'assistant'; content: string }`
- On submit:
  1. Append user message to display list
  2. Call `postChat({ chatId: getChatId(), message: input })`
  3. Append assistant message to display list
  4. If response type is `'diagram'`, call `onDiagram(response.diagram)`
  5. Handle errors: append an error message to display list
- Render: scrollable message list + textarea + submit button; disable input while loading

### Step 19 — `src/components/DiagramPanel`

- Props: `diagram: string | null`
- Uses `useEffect` to call `mermaid.render()` when `diagram` changes
- Mermaid is **dynamically imported** (`import('mermaid')`) to avoid Next.js SSR issues
- Three states: no diagram → placeholder text; diagram → rendered SVG; parse error → error message in the panel

### Step 20 — `src/lib/`

- `api.ts` — typed `postChat(req: ChatRequest): Promise<ChatResponse>` using `fetch('/api/chat', { method: 'POST', ... })`; throws on non-2xx
- `chat-id.ts` — `getChatId()`: reads `sessionStorage.getItem('chatId')`; if missing, generates a UUID v4, stores it, returns it

### Step 21 — Frontend tests

Files: `src/**/*.test.tsx` + `jest.config.ts`

- `jest.config.ts`: `testEnvironment: 'jsdom'`, `setupFilesAfterFramework: ['@testing-library/jest-dom']`
- `ChatPanel.test.tsx`:
  - User types a message and submits → message appears in the list
  - Mock `postChat` returns a `'message'` response → assistant reply appears
  - Mock `postChat` returns a `'diagram'` response → `onDiagram` callback is called
  - Mock `postChat` throws → error message appears in the list
- `DiagramPanel.test.tsx`:
  - `diagram=null` → renders placeholder text
  - `diagram` set → mermaid.render is called (mock mermaid module)
  - mermaid.render throws → error state shown
- `api.test.ts`:
  - Mock `fetch` returns 200 → resolves correctly typed response
  - Mock `fetch` returns 500 → throws

---

## Phase 5 — Verification

### Step 22 — Install dependencies

```bash
npm install
```

Run from repo root. npm resolves all workspace packages including `@repo/eslint-config`.

### Step 23 — Start both services

```bash
turbo run dev
```

- `chat-service` starts on `http://localhost:3001`
- `chat-app` starts on `http://localhost:3000`

Environment variable for provider (optional, defaults to `default` stub):

```bash
MODEL_PROVIDER=openai turbo run dev
```

### Step 24 — Manual smoke test

1. Open `http://localhost:3000`
2. Submit: `"Create a simple flowchart"` → diagram panel renders a Mermaid flowchart
3. Submit: `"What does this show?"` → plain reply in chat, diagram panel unchanged
4. Refresh the page → chat clears (sessionStorage chatId resets), diagram panel shows placeholder

### Step 25 — Run tests

```bash
turbo run test
```

All unit and integration tests should pass.
