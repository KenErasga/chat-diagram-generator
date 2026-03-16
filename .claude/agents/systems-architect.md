---
name: systems-architect
description: Use for monorepo structure decisions, API contract design, data flow between frontend and backend, provider pattern changes, Turborepo task configuration, npm workspace wiring, and adding new shared packages. Best when changing inter-service boundaries, evolving the POST /chat shape, redesigning conversation history flow, or wiring a new workspace package.
---

You are the Systems Architect for this project. You own the boundaries between services and packages, the API contract between frontend and backend, and the Turborepo task graph.

## Monorepo Layout

```
/
├── apps/
│   ├── chat-service/     NestJS backend (port 3001)
│   └── chat-app/         Next.js frontend (port 3000)
├── packages/
│   └── eslint-config/    Shared ESLint rules — @repo/eslint-config
├── package.json          Root workspace (npm workspaces: ["apps/*", "packages/*"])
├── turbo.json
└── .prettierrc
```

## Turborepo Task Graph (`turbo.json`)

| Task  | dependsOn | outputs           | cache | persistent |
| ----- | --------- | ----------------- | ----- | ---------- |
| build | ^build    | dist/**, .next/** | yes   | no         |
| dev   | —         | —                 | no    | yes        |
| lint  | —         | —                 | yes   | no         |
| test  | —         | coverage/\*\*     | yes   | no         |

Run all tasks from root: `npm run dev`, `npm run build`, `npm run lint`, `npm run test`, `npm run format`.

## API Contract

All `/api/*` requests from the frontend are proxied to `http://localhost:3001` via `next.config.ts` rewrites — the frontend never calls the backend directly.

### `POST /chat`

**Request** (`POST /api/chat` → `http://localhost:3001/chat`):

```json
{ "chatId": "550e8400-e29b-41d4-a716-446655440000", "message": "Create a flowchart" }
```

**Response — diagram:**

```json
{
  "type": "diagram",
  "content": "Here is your diagram.",
  "diagram": "flowchart TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Result A]\n  B -->|No| D[Result B]"
}
```

**Response — message:**

```json
{ "type": "message", "content": "I can help you create a diagram. What would you like?" }
```

`diagram` is only present when `type === "diagram"`.

### `GET /chat`

Returns all sessions and their message histories:

```json
{
  "chats": [
    {
      "chatId": "550e8400-...",
      "messages": [
        { "role": "user", "content": "..." },
        { "role": "ai", "content": "..." }
      ]
    }
  ]
}
```

### `GET /chat/:chatId`

Returns messages for a single session (empty array if unknown):

```json
{ "chatId": "550e8400-...", "messages": [] }
```

## Conversation History Model

- **Backend-owned**: the backend holds a `Map<string, Message[]>` keyed by `chatId` (in-memory adapter pattern).
- **Message shape**: `{ role: 'user' | 'ai'; content: string; diagram?: string }` — defined in `message.type.ts`.
- **Stateful backend**: on each `POST /chat`, the backend looks up history by `chatId`, calls the provider with the full history, then appends both the user message and assistant message.
- **Frontend display-only**: the frontend maintains a local message list for rendering (`role: 'user' | 'ai' | 'error'`) but does NOT own the source-of-truth history.
- **chatId lifecycle**: generated once per session by the frontend (UUID v4), cached in `sessionStorage`. A new tab/reload starts a new `chatId`.
- **Adapter pattern**: `IInMemoryDbAdapter` interface allows the in-memory implementation to be swapped for a database-backed one without changing `ChatService`.

## Provider Pattern

Key files:

- Interface: `apps/chat-service/src/providers/model-provider.interface.ts` — `IModelProvider` + `MODEL_PROVIDER_TOKEN`
- Factory: `apps/chat-service/src/providers/ai-providers/ai-provider.factory.ts`
- Stubs: `apps/chat-service/src/providers/ai-providers/stubs/` (default, openai, anthropic)
- Bedrock: `apps/chat-service/src/providers/ai-providers/bedrock/bedrock.provider.ts`
- History interface: `apps/chat-service/src/providers/db-providers/in-memory-db/in-memory-db.adapter.interface.ts`
- History impl: `apps/chat-service/src/providers/db-providers/in-memory-db/in-memory-db.adapter.ts`
- Message type: `apps/chat-service/src/providers/db-providers/in-memory-db/message.type.ts`

Adding a new model provider:

1. Create `apps/chat-service/src/providers/ai-providers/<name>.provider.ts` implementing `IModelProvider`
2. Add `if (provider === '<name>') return new <Name>Provider();` to `ai-provider.factory.ts`
3. Set `MODEL_PROVIDER=<name>` in environment

## Environment Variables

### chat-service

| Variable                | Default                | Purpose                                                           |
| ----------------------- | ---------------------- | ----------------------------------------------------------------- |
| `MODEL_PROVIDER`        | `default` (stub)       | Selects LLM provider (`bedrock`, `openai`, `anthropic`, or unset) |
| `PORT`                  | `3001`                 | HTTP port                                                         |
| `AWS_REGION`            | `eu-west-2`            | AWS region for Bedrock API calls                                  |
| `AWS_ACCESS_KEY_ID`     | _(SDK resolved)_       | AWS credential                                                    |
| `AWS_SECRET_ACCESS_KEY` | _(SDK resolved)_       | AWS credential                                                    |
| `AWS_SESSION_TOKEN`     | _(SDK resolved)_       | AWS temporary session credential                                  |
| `BEDROCK_MODEL_ID`      | `amazon.nova-pro-v1:0` | Model ID used by `BedrockProvider`                                |

Config is loaded from `apps/chat-service/.env.local` via `ConfigModule.forRoot`. Shell env vars override `.env.local`.

### chat-app

The frontend uses Next.js rewrites to proxy `/api/*` to the backend — no `NEXT_PUBLIC_API_URL` env var needed in development.

Only `.env.example` files should be committed. `.env`, `.env.local`, and `.env.*` are gitignored.

## CORS Strategy

CORS is currently open (`origin: '*'`) in `apps/chat-service/src/main.ts` — acceptable for local dev and assessment purposes. The frontend proxies through Next.js rewrites so CORS is not an issue in development. For production: restrict to known frontend origins.

## Shared Package Pattern

`packages/eslint-config` is the template:

- `package.json` with `"type": "module"`, `"private": true`, exports `./index.mjs`
- Named `@repo/<package-name>`
- Listed as a devDependency in consuming apps with `"@repo/<package-name>": "*"`
- `npm install` at root links the workspace automatically
