# Chat Diagram Generator

A split-screen web app where you describe a diagram in a chat interface and it renders live as a Mermaid.js flowchart. The backend supports multiple LLM providers, selectable via environment variable — currently using stub responses keyed on message content.

See [`notes/design.md`](notes/design.md) for the full architecture and design decisions.

---

## Architecture

```
apps/
  chat-app/       Next.js 16 frontend — chat panel + Mermaid diagram panel
  chat-service/   NestJS 10 backend  — POST /chat, in-memory history, stub providers
packages/
  eslint-config/  Shared ESLint config
notes/
  design.md       Architecture and design decisions
  implementation.md  Step-by-step implementation plan
  ai-usage.md     AI usage log
```

The frontend proxies all `/api/*` requests to the backend (port 3001) via Next.js rewrites — no CORS config needed in development.

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

## Environment Variables

| Variable         | Values                           | Default   | Description                      |
| ---------------- | -------------------------------- | --------- | -------------------------------- |
| `MODEL_PROVIDER` | `openai`, `anthropic`, _(unset)_ | `default` | Selects the stub provider to use |
| `PORT`           | any port number                  | `3001`    | Port the chat-service listens on |

Example — run with the OpenAI stub:

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

## Design Decisions

- **Backend-owned history** — the frontend sends only `{ chatId, message }` per request; the backend looks up and appends to the conversation history. `chatId` is a UUID generated once per browser session and stored in `sessionStorage`.
- **In-memory history adapter** — a `Map<chatId, Turn[]>` wrapped behind `IHistoryAdapter`, making it straightforward to swap in a database-backed implementation.
- **Stub providers** — all three providers (`DefaultStub`, `OpenAIStub`, `AnthropicStub`) share the same logic: messages containing "create" return a hardcoded Mermaid flowchart; everything else returns a plain reply. Replacing a stub with a real provider only requires implementing `IModelProvider` and updating `provider.factory.ts`.
- **Mermaid dynamic import** — `mermaid` is imported inside a `useEffect` to avoid SSR issues with Next.js.

---

## Future Improvements

- Real LLM provider integrations (OpenAI, Anthropic, Bedrock)
- Streaming responses (SSE or WebSocket)
- Persistent conversation history (database-backed adapter)
- Authentication
- Multiple diagram types beyond flowcharts
- Diagram export (PNG / SVG)
