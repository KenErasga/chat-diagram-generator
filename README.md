# Chat Diagram Generator

A split-screen web app where you describe a diagram in a chat interface and it renders live as a Mermaid.js diagram. The backend supports multiple LLM providers, selectable via environment variable — real Amazon Nova (via AWS Bedrock) or stub responses for local development.

See [`notes/design.md`](notes/design.md) for the full architecture and design decisions, [`notes/implementation.md`](notes/implementation.md) for the step-by-step build plan, and [`notes/ai-usage.md`](notes/ai-usage.md) for the AI usage log.

---

## Architecture

```
apps/
  chat-app/       Next.js 16 frontend — chat panel + Mermaid diagram panel
  chat-service/   NestJS 10 backend  — POST /chat, in-memory history, stub + Bedrock/Nova providers
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

| Variable                | Values                                      | Default                | Description                                             |
| ----------------------- | ------------------------------------------- | ---------------------- | ------------------------------------------------------- |
| `MODEL_PROVIDER`        | `bedrock`, `openai`, `anthropic`, _(unset)_ | `default`              | Provider to use (`bedrock` = real Bedrock)              |
| `PORT`                  | any port number                             | `3001`                 | Port the chat-service listens on                        |
| `AWS_REGION`            | any AWS region                              | `eu-west-2`            | AWS region for Bedrock API calls (`bedrock` only)       |
| `AWS_ACCESS_KEY_ID`     | AWS access key ID                           | _(SDK default chain)_  | AWS credential — env, `~/.aws/credentials`, or IAM role |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key                       | _(SDK default chain)_  | AWS credential — env, `~/.aws/credentials`, or IAM role |
| `BEDROCK_MODEL_ID`      | any Bedrock model ID                        | `amazon.nova-pro-v1:0` | Model used when `MODEL_PROVIDER=bedrock`                |

Example — run with Amazon Nova (requires AWS credentials):

```bash
MODEL_PROVIDER=bedrock AWS_REGION=eu-west-2 npm run dev:service
```

Example — run with the OpenAI stub (no credentials needed):

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
- **Model providers** — `BedrockProvider` (`MODEL_PROVIDER=bedrock`) is a real Amazon Nova integration using the AWS Bedrock ConverseCommand API; it selects from 7 Mermaid diagram types via tool use. `DefaultStub`, `OpenAIStub`, and `AnthropicStub` share the same stub logic: messages containing "create" return a hardcoded flowchart. All providers implement `IModelProvider`, so swapping is a one-line factory change.
- **Mermaid dynamic import** — `mermaid` is imported inside a `useEffect` to avoid SSR issues with Next.js.

---

## Future Improvements

- Streaming responses (WebSocket)
- Persistent conversation history (database-backed adapter)
- Authentication
- Diagram export (PNG / SVG)
- Real OpenAI and Anthropic provider integrations
