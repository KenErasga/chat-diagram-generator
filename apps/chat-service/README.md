# chat-service

NestJS 10 backend for Chat Diagram Generator. Exposes `POST /chat`, manages conversation history in memory keyed by `chatId`, and routes requests through a configured model provider (stubs or real Amazon Nova via Bedrock).

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

25 tests across 7 suites (Jest):

| Suite                                                              | Tests                                                      |
| ------------------------------------------------------------------ | ---------------------------------------------------------- |
| `app.controller.spec.ts`                                           | Hello World GET /                                          |
| `chat/chat.controller.spec.ts`                                     | POST /chat integration (201, 400 validation)               |
| `chat/chat.service.spec.ts`                                        | History lookup, provider call, turn appending              |
| `providers/db-providers/in-memory-db/in-memory-db.adapter.spec.ts` | Isolation, append order, empty init                        |
| `providers/ai-providers/provider.factory.spec.ts`                  | MODEL_PROVIDER env var routing                             |
| `providers/ai-providers/default.stub.spec.ts`                      | Stub logic: "create" → diagram, plain → message            |
| `providers/ai-providers/bedrock.provider.spec.ts`                  | BedrockProvider: tool use, text, history, model ID, errors |

---

## Environment Variables

| Variable         | Values                                   | Default   | Description                |
| ---------------- | ---------------------------------------- | --------- | -------------------------- |
| `MODEL_PROVIDER` | `nova`, `openai`, `anthropic`, _(unset)_ | `default` | Provider to use            |
| `PORT`           | any port number                          | `3001`    | Port the server listens on |

The service uses Nest’s `ConfigModule.forRoot({ envFilePath: '.env.local', isGlobal: true })`, so environment variables are automatically loaded from `apps/chat-service/.env.local` on startup (and can still be overridden by shell env vars).

Example `apps/chat-service/.env.local`:

```bash
MODEL_PROVIDER=nova
```

### Bedrock / Nova provider

When `MODEL_PROVIDER=nova`, the service uses `BedrockProvider` which calls the AWS Bedrock ConverseCommand API via `@aws-sdk/client-bedrock-runtime`. Standard AWS credential resolution applies (environment variables, `~/.aws/credentials`, instance profile, etc.).

| Variable                | Description                                     | Default                |
| ----------------------- | ----------------------------------------------- | ---------------------- |
| `AWS_REGION`            | AWS region for Bedrock API calls                | `eu-west-2`            |
| `AWS_ACCESS_KEY_ID`     | AWS access key ID (standard SDK credential)     | _(resolved by SDK)_    |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key (standard SDK credential) | _(resolved by SDK)_    |
| `AWS_SESSION_TOKEN`     | AWS session token for temporary credentials     | _(resolved by SDK)_    |
| `BEDROCK_MODEL_ID`      | Model ID used by `BedrockProvider`              | `amazon.nova-pro-v1:0` |

The IAM principal used must have `bedrock:InvokeModel` permission on the target model ARN (e.g. `arn:aws:bedrock:eu-west-2::foundation-model/amazon.nova-pro-v1:0`).

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
      ai-provider.factory.ts     Reads MODEL_PROVIDER env var, returns BedrockProvider or stub
      config.ts                  Shared AI config (region, model IDs)
      stubs/
        base.stub.ts             Shared stub implementation
        default.stub.ts          Default stub provider
        openai.stub.ts           OpenAI stub provider
        anthropic.stub.ts        Anthropic stub provider
      bedrock/
        base-bedrock.provider.ts Abstract base: ConverseCommand, tool config, history mapping
        bedrock.provider.ts      BedrockProvider — Amazon Nova via Bedrock (MODEL_PROVIDER=nova)
    providers.module.ts
```
