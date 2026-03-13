# Claude

# Context

## Initial Claude Prompt

Use: TypeScript, React (NextJS), Node.js (NestJS)

notes / @Full Stack AI Engineer - Assessment.pdf

Context:

- This is a timeboxed full stack technical assessment for StructureFlow
- The goal is to build a simple split-screen web app that generates diagrams from text prompts
- The frontend must use React
- This solution will use TypeScript
- The backend should support multiple model providers, selected via environment variable
- Real LLM calls are not required; stubbed model responses should be used instead (for now)
- The UI should focus on functional clarity, not pixel-perfect styling
- The final deliverable should be easy to run, test, and review locally

Your role:

- helping design a small but credible solution
- Optimise for clarity, realism, and scope control
- Do not over-engineer
- Prefer decisions that are easy to explain in a README

Task:

1. Restate the problem clearly and identify the actual deliverables.
2. Propose a minimal full stack architecture for the app.
3. Define the core frontend and backend responsibilities.
4. Recommend a simple but clean API contract between frontend and backend.
5. Explain how conversation context should be represented and passed on each turn.
6. Explain how previously generated diagrams should be included in subsequent LLM context.
7. Propose a stubbed multi-provider backend design controlled by environment variable.
8. Recommend a simple approach for diagram rendering, using Mermaid.
9. Identify what should be implemented now vs what should be left as future improvements.
10. List assumptions, constraints, ambiguities, trade-offs, edge cases, and reviewer expectations.
11. Recommend a pragmatic test plan.
12. Recommend a strong README structure.

Functional requirements from brief:

- The user can submit a message in a chat interface to create a diagram
- On subsequent messages, the full conversation context, including previously generated diagrams, should be passed to the LLM
- The currently displayed diagram should be replaced each time a new one is generated
- The backend should support different model providers, configurable via environment variable

Non-functional requirements from brief:

- Use React for the frontend
- Use TypeScript for the backend
- use Mermaid.js flowcharts

Implementation guidance from brief:

- Do not waste time or money on real backend LLM calls
- Use stub responses based on user input
- For example, if input contains "Create", return a tool call to create a diagram (add a few more text not just "Create")
- Otherwise, return a simple stub response such as a normal assistant reply

Optional extensions from brief:

- Streaming LLM outputs to the frontend
- Persistence of conversations
- Integration with a real LLM provider

Evaluation criteria from brief:

- Design
- Code quality
- Testing
- Security
- Error handling

Out of scope / not worth spending time on:

- Pixel-perfect UI styling
- Perfect system or tool prompts
- Manual editing of generated diagrams
- UI features beyond the functional requirements

Design Output format:

- Use headings and bullet points
- No code
- Keep recommendations practical and implementable
- Explicitly call out uncertainty and optional enhancements

---

## Implemented Architecture (Snapshot)

- **Monorepo layout**
  - `apps/chat-app`: Next.js frontend providing a split-screen UI (chat panel + diagram panel).
  - `apps/chat-service`: NestJS backend exposing a `POST /chat` endpoint.
  - `packages/eslint-config`: Shared ESLint configuration.
- **Backend responsibilities**
  - Owns conversation history and message turns.
  - Selects a model provider based on environment (`MODEL_PROVIDER`) and delegates chat completion to that provider.
  - Returns a normalized response indicating whether the result is a plain message or a diagram (plus Mermaid definition when applicable).
- **Frontend responsibilities**
  - Renders a chat interface and sends user messages to `/api/chat` (proxied to the backend).
  - Maintains a per-session `chatId` in browser storage and passes it to the backend with each request.
  - Renders Mermaid diagrams in the right-hand panel when the backend responds with a diagram-type message.

---

## API Contract (Current)

- **Request (frontend → backend)**
  - `POST /chat`
  - Body fields:
    - `chatId`: string — stable identifier for the conversation, generated once per browser session.
    - `message`: string — the latest user message.
- **Response (backend → frontend)**
  - Fields:
    - `type`: `"diagram"` or `"message"`.
    - `content`: string — human-readable assistant content.
    - `diagram` (optional): string — Mermaid flowchart definition when `type === "diagram"`.
- **Behavior**
  - The frontend always sends only the new user message plus `chatId`.
  - The backend reconstructs full conversation context from history and passes it to the provider.
  - When `type === "diagram"`, the frontend both displays the assistant text and updates the diagram panel with the new Mermaid definition (replacing any existing diagram).

---

## Conversation Context & History Representation

- **Turn model**
  - A turn contains:
    - `role`: `"user"` or `"assistant"`.
    - `content`: string — message text.
    - `diagram` (optional): string — Mermaid definition associated with that turn, when present.
- **History storage**
  - In-memory adapter: a map from `chatId` to an ordered array of turns.
  - New conversations start with an empty history; turns are appended after each request/response cycle.
- **Context passed to provider**
  - On each `POST /chat`, the backend:
    - Looks up existing turns for `chatId`.
    - Appends the latest user turn.
    - Sends the full sequence of turns (including prior diagrams) to the provider.
  - This ensures previously generated diagrams are available as part of the LLM context via the `diagram` field on assistant turns.

---

## Multi-Provider Backend Design

- **Provider abstraction**
  - A `ModelProvider` interface defines a single chat method that takes:
    - The full turn history (including any diagram metadata).
    - The latest user message.
  - Returns a normalized response consistent with the API contract above.
- **Real provider**
  - **`BedrockProvider`** (`MODEL_PROVIDER = "nova"`):
    - Calls Amazon Nova via the AWS Bedrock ConverseCommand API.
    - Uses the `create_diagram` tool to detect diagram intent and select the appropriate Mermaid diagram type (flowchart, sequenceDiagram, classDiagram, erDiagram, stateDiagram-v2, gantt, pie).
    - Prior diagrams from assistant turns are embedded as fenced Mermaid code blocks in history, giving the model context to update them.
    - Falls back to plain text when the model returns `stopReason: "end_turn"`.
- **Stub implementations**
  - **Default stub**:
    - If the incoming message text (case-insensitive) contains `"create"`, returns:
      - `type = "diagram"`.
      - `content` explaining that a diagram was created.
      - `diagram` with a fixed, hardcoded Mermaid flowchart snippet.
    - Otherwise returns `type = "message"` with a simple non-diagram reply.
  - **OpenAI stub** and **Anthropic stub**:
    - Share the same control flow and behavior as the default stub, differing only by class name and selection logic.
- **Provider selection via environment**
  - Environment variable: `MODEL_PROVIDER`.
  - Behavior:
    - `MODEL_PROVIDER = "nova"` → use `BedrockProvider` (Amazon Nova via Bedrock).
    - `MODEL_PROVIDER = "openai"` → use OpenAI stub.
    - `MODEL_PROVIDER = "anthropic"` → use Anthropic stub.
    - Any other value or unset → fall back to default stub.
  - A small factory encapsulates this switch and is registered as the NestJS provider.

---

## Diagram Rendering with Mermaid

- **Rendering strategy**
  - The frontend uses Mermaid.js to render diagram responses into SVG in the right-hand panel.
  - Mermaid is dynamically imported on the client side (inside a React effect) to avoid SSR issues with Next.js.
- **Update behavior**
  - When a new response with `type = "diagram"` arrives:
    - The current diagram definition in React state is replaced with the new Mermaid definition.
    - The diagram panel re-renders the SVG accordingly.
  - When responses are non-diagram (`type = "message"`), the existing diagram is left unchanged and only the chat transcript is updated.
- **Error handling**
  - If Mermaid fails to render (e.g., invalid syntax), the UI shows a clear error message in the diagram panel instead of breaking the page.

---

## Implemented vs Future Work

- **Implemented now**
  - Split-screen Next.js frontend with chat and diagram panels; diagram panel scrolls on overflow.
  - NestJS backend with:
    - `POST /chat` controller and service.
    - In-memory history adapter behind a small interface.
    - Multi-provider model layer driven by `MODEL_PROVIDER`.
  - Real LLM integration: `BedrockProvider` using Amazon Nova via AWS Bedrock ConverseCommand API (`MODEL_PROVIDER=nova`).
  - Smart diagram type selection — 7 Mermaid diagram types (flowchart, sequenceDiagram, classDiagram, erDiagram, stateDiagram-v2, gantt, pie) via `create_diagram` tool.
  - End-to-end flow:
    - User sends a message → provider decides whether to return a diagram or plain text → frontend updates transcript and diagram panel accordingly.
  - Basic error handling on both frontend (network and rendering errors) and backend (invalid payloads, provider failures).
- **Deliberately left for future improvements**
  - Streaming responses (server-sent events or WebSockets).
  - Persistent history store (e.g., database-backed adapter implementing the same history interface).
  - Authentication, multi-user support, and authorization.
  - Real OpenAI and Anthropic provider integrations.
  - Diagram export (PNG / SVG).

---

## Test Strategy (Current)

- **Backend tests** (25 tests across 7 suites)
  - Unit tests for:
    - In-memory history adapter (ordering and initialization behavior).
    - Provider factory (correct provider selection based on `MODEL_PROVIDER`).
    - Default stub logic (inputs with/without `"create"`).
    - `BedrockProvider`: tool use → diagram, text → message, diagram history embedding, default model ID, SDK error propagation.
  - Integration-style tests verifying `POST /chat`:
    - Returns the expected shape for both diagram and message responses.
    - Correctly accumulates history across multiple calls with the same `chatId`.
- **Frontend tests**
  - Component tests for chat panel:
    - User messages appear in the transcript.
    - Assistant replies and diagram updates are rendered based on response type.
    - Network failures are surfaced as user-visible errors in the chat.
  - Component tests for diagram panel:
    - Placeholder behavior when no diagram is present.
    - Calls into Mermaid to render diagrams when a definition is provided.
    - Graceful handling when Mermaid throws.
- **Manual verification**
  - Run both apps locally, then:
    - Submit a prompt containing `"create"` and verify the diagram panel updates.
    - Submit follow-up messages without `"create"` and confirm that only the chat transcript changes while the diagram remains.
    - Refresh the page to confirm that history is per-session and resets on reload (new `chatId`).

## AI Usage Tracking

- **Purpose**
  - Keep a lightweight, auditable record of how AI tooling is used during this assessment.
- **Where to track**
  - Use `notes/ai-usage.md` as the single source of truth.
  - Append a new row to the "Prompts and Output Tracks" table for each meaningful AI interaction that changes code, docs, or design.
- **What to record per row**
  - **Date** of the interaction.
  - **Prompt**: a short, human-readable summary (not the full transcript).
  - **Implementation**: concise description of what changed (files, features, or docs touched).
- **Scope and discipline**
  - Do not paste long prompts or raw AI output into the table; link to design docs or READMEs instead.
  - Aim for accuracy and brevity so reviewers can quickly understand how AI assisted the work.
