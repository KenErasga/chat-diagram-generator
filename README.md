# Chat Diagram Generator

A split-screen web app where you describe a diagram in a chat interface and it renders live as a Mermaid.js diagram. The backend supports multiple model providers, selectable via environment variable — real Amazon Nova (via AWS Bedrock) or stub providers for local development.

See [`notes/design.md`](notes/design.md) for the full architecture and design decisions, [`notes/implementation.md`](notes/implementation.md) for the step-by-step build plan, and [`notes/ai-usage.md`](notes/ai-usage.md) for the AI usage log.

---

## Architecture

```
apps/
  chat-app/       Next.js 16 frontend — chat panel + Mermaid diagram panel
  chat-service/   NestJS 10 backend  — POST /chat, GET /chat, GET /chat/:chatId, in-memory history, stub + Bedrock/Nova providers
packages/
  eslint-config/  Shared ESLint config
notes/
  design.md          Architecture and design decisions
  implementation.md  Step-by-step implementation plan
  ai-usage.md        AI usage log
```

The frontend proxies all `/api/*` requests to the backend (port 3001) via Next.js rewrites — no CORS config needed in development. See `[apps/chat-app/README.md](apps/chat-app/README.md)` and `[apps/chat-service/README.md](apps/chat-service/README.md)` for app-specific details.

---

## Prerequisites

- Node.js >= 20
- npm >= 10

---

## Quick Start

```bash
# Install all workspace dependencies
npm install

# Run both apps together
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## Running Apps Individually

```bash
# Frontend only
npm run dev:app

# Backend only
npm run dev:service
```

---

## Environment Variables (summary)

For full backend configuration, see `[apps/chat-service/README.md](apps/chat-service/README.md)`. The most important variables are:

| Variable           | Values                                      | Default                | Description                                                                  |
| ------------------ | ------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| `MODEL_PROVIDER`   | `bedrock`, `openai`, `anthropic`, _(unset)_ | `default`              | AI provider to use (`bedrock` = real Bedrock/Nova, requires AWS credentials) |
| `PORT`             | any port number                             | `3001`                 | Port the chat-service listens on                                             |
| `BEDROCK_MODEL_ID` | any Bedrock model ID                        | `amazon.nova-pro-v1:0` | Model used when `MODEL_PROVIDER=bedrock` (requires AWS credentials)          |

**Example — run with Amazon Nova (requires AWS credentials):**

```bash
MODEL_PROVIDER=bedrock npm run dev:service
```

**Example — run with the OpenAI stub (no credentials needed):**

```bash
MODEL_PROVIDER=openai npm run dev:service
```

---

## Running Tests

```bash
# All workspaces
npm test

# Frontend only
npm test --workspace=apps/chat-app

# Backend only
npm test --workspace=apps/chat-service
```

---

## Backend API (chat-service)

- **`POST /chat`**: send `{ chatId, message }` and receive a typed response `{ type, content, diagram? }` (and, in future, possibly `chatId` echoed back). The backend looks up and appends conversation history keyed by `chatId`.
- **`GET /chat`**: list all chat sessions and their histories.
- **`GET /chat/:chatId`**: fetch the history for a single session.

The backend is stateless aside from an in-memory history map per process. See `[apps/chat-service/README.md](apps/chat-service/README.md)` for full Swagger-style docs and environment details.

## Frontend UI (chat-app)

- **Split-screen layout** — chat panel on the left, Mermaid diagram panel on the right; each panel is wrapped in an `ErrorBoundary` to isolate render failures.
- **Session handling** — `chatId` is generated once per browser session in the frontend and stored in `sessionStorage`; closing the tab resets the conversation.
- **Diagram behavior** — when the backend returns `type: "diagram"`, the diagram panel updates; plain `message` responses leave the current diagram unchanged.
- **Mermaid integration** — `mermaid` is dynamically imported inside a React `useEffect` to avoid SSR issues in Next.js.
- **Request timeout** — `postChat()` aborts requests that take longer than 30 seconds and surfaces a user-visible error in the chat.

See `[apps/chat-app/README.md](apps/chat-app/README.md)` for key files and testing notes.

## Design Decisions

- **Backend-owned history** — the frontend sends `{ chatId, message }` per request; the backend looks up and appends to the conversation history. `chatId` is a UUID generated once per browser session and stored in `sessionStorage`.
- **In-memory history adapter** — a `Map<chatId, Message[]>` wrapped behind an adapter interface, making it straightforward to swap in a database-backed implementation.
- **Model providers** — `BedrockProvider` (`MODEL_PROVIDER=bedrock`) is a real Amazon Nova integration using the AWS Bedrock ConverseCommand API; stub providers (`DefaultStub`, `OpenAIStub`, `AnthropicStub`) live under `ai-providers/stubs` and share the same logic: messages containing \"create\" return a hardcoded flowchart. All providers implement `IModelProvider`, so swapping is a factory concern.
- **Mermaid dynamic import** — `mermaid` is imported inside a `useEffect` to avoid SSR issues with Next.js.

---

## Future Improvements

- Streaming responses (WebSocket)
- Persistent conversation history (database-backed adapter)
- Authentication
- Diagram export (PNG / SVG)
- Real OpenAI and Anthropic provider integrations

---

## Scaling in Production

The current design trades scalability for local simplicity. Key changes needed for production:

- **Distributed history store** — the in-memory `Map<chatId, Message[]>` prevents horizontal scaling. `IInMemoryDbAdapter` is already an interface; swap in a `RedisDbAdapter` to make `chat-service` stateless behind a load balancer.
- **Streaming responses** — replace the buffered `POST /chat` round-trip with SSE or WebSockets to reduce perceived latency and avoid the 30 s hard timeout.
- **Authentication** — `GET /chat/:chatId` has no ownership check. Bind `chatId` to a signed session token and validate it in a NestJS guard.
- **Rate limiting** — add `ThrottlerModule` guards keyed by `chatId` or IP to cap Bedrock spend and protect against quota exhaustion.
- **Observability** — ship structured logs with `chatId` as a consistent field; add per-provider latency metrics on `POST /chat`.
- **Deployment** — containerise `chat-service` on ECS Fargate behind an ALB; use task-role IAM for Bedrock instead of static credentials; deploy `chat-app` to Vercel or ECS.
