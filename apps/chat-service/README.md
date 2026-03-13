# chat-service

NestJS 10 backend for Chat Diagram Generator. Exposes `POST /chat`, manages conversation history in memory keyed by `chatId`, and routes requests through a stub model provider.

---

## Dev

Run from this directory:

```bash
npm run dev
```

Or from the repo root:

```bash
npm run dev:service
```

Listens on http://localhost:3001 (hot-reload via `nest start --watch`).

---

## Build

```bash
npm run build
```

Output goes to `dist/`.

---

## Start (production)

```bash
npm run start
```

Runs the compiled output from `dist/main.js`.

---

## Test

```bash
npm test
```

18 tests across 6 suites (Jest):

| Suite                                       | Tests                                           |
| ------------------------------------------- | ----------------------------------------------- |
| `app.controller.spec.ts`                    | Hello World GET /                               |
| `chat/chat.controller.spec.ts`              | POST /chat integration (201, 400 validation)    |
| `chat/chat.service.spec.ts`                 | History lookup, provider call, turn appending   |
| `history/in-memory-history.adapter.spec.ts` | Isolation, append order, empty init             |
| `providers/provider.factory.spec.ts`        | MODEL_PROVIDER env var routing                  |
| `providers/stubs/default.stub.spec.ts`      | Stub logic: "create" → diagram, plain → message |

---

## Environment Variables

| Variable         | Values                           | Default   | Description                |
| ---------------- | -------------------------------- | --------- | -------------------------- |
| `MODEL_PROVIDER` | `openai`, `anthropic`, _(unset)_ | `default` | Stub provider to use       |
| `PORT`           | any port number                  | `3001`    | Port the server listens on |

---

## API

### `POST /chat`

**Request body:**

```json
{
  "chatId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Create a simple flowchart"
}
```

**Response body:**

```json
{
  "type": "diagram",
  "content": "Here is your diagram.",
  "diagram": "flowchart TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Result A]\n  B -->|No| D[Result B]"
}
```

`type` is `"diagram"` when a Mermaid definition is returned, `"message"` for plain replies. `diagram` is only present when `type` is `"diagram"`.

---

## Key Files

```
src/
  main.ts                        Bootstrap — listens on PORT (default 3001)
  app.module.ts                  Root module — imports ChatModule
  chat/
    chat.controller.ts           POST /chat route
    chat.service.ts              Orchestrates history lookup + provider call
    chat.module.ts
    dto/
      chat-request.dto.ts        { chatId, message } with class-validator
      chat-response.dto.ts       { type, content, diagram? }
  providers/
    db-providers/
      in-memory-db/
        in-memory-db.adapter.interface.ts IInMemoryDbAdapter + IN_MEMORY_DB_ADAPTER token
        in-memory-db.adapter.ts           Map<chatId, Turn[]> implementation
        in-memory-db.module.ts            Exposes IN_MEMORY_DB_ADAPTER for injection
        turn.type.ts                      { role, content, diagram? }
  providers/
    model-provider.interface.ts  IModelProvider + MODEL_PROVIDER_TOKEN
    ai-providers/
      ai-provider.factory.ts     Reads MODEL_PROVIDER env var, returns stub
      default.stub.ts
      openai.stub.ts
      anthropic.stub.ts
    providers.module.ts
```

---

## Adding a Real Provider

1. Create `src/providers/real/your-provider.ts` implementing `IModelProvider`:
   ```ts
   async chat(history: Turn[], message: string): Promise<ChatResponseDto>
   ```
2. Register it in `provider.factory.ts` under a new `MODEL_PROVIDER` value.
3. Add the provider's SDK to `dependencies` in `package.json`.
