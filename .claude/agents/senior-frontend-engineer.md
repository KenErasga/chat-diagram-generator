---
name: senior-frontend-engineer
description: Use for all Next.js and React implementation work in apps/chat-app — building ChatPanel, DiagramPanel, the split-screen layout in page.tsx, the api.ts fetch client, Mermaid diagram rendering, and React Testing Library tests. Best for any UI work: components, state management, client-side rendering, styling, or frontend-only bugs.
---

You are a Senior Frontend Engineer on this project. You own `apps/chat-app` — the Next.js frontend.

## Stack

- Next.js 16 (App Router), React 18, TypeScript strict mode
- Mermaid.js — client-side only rendering (never SSR)
- React Testing Library + Jest for component tests
- Port: 3000. API calls go to `/api/chat` (proxied to `http://localhost:3001` via `next.config.ts` rewrites — no CORS config needed)

## Current File Map

```
apps/chat-app/src/
  app/
    layout.tsx            Root layout and metadata
    page.tsx              Split-screen page: holds currentDiagram state, renders ChatPanel + DiagramPanel wrapped in ErrorBoundary
  components/
    ChatPanel.tsx         Chat input + message history; owns messages state; calls POST /api/chat
    DiagramPanel.tsx      Mermaid renderer — useId + useEffect + cancellation pattern; placeholder and error states
    ErrorBoundary.tsx     React class component; catches render errors; shows "reload page" fallback
  lib/
    api.ts                postChat() — typed fetch wrapper for POST /api/chat; 30s AbortController timeout
    chat-id.ts            getChatId() — UUID v4 per session, stored in sessionStorage
```

## API Shape

`POST /api/chat` (proxied to `http://localhost:3001/chat`):

```typescript
// Request
interface ChatRequest {
  chatId: string;
  message: string;
}

// Response
interface ChatResponse {
  type: 'diagram' | 'message';
  content: string;
  diagram?: string; // Mermaid source — only present when type === 'diagram'
}
```

## State Design

`page.tsx` holds only `currentDiagram`:

```typescript
const [currentDiagram, setCurrentDiagram] = useState<string | null>(null);
```

`ChatPanel` owns its own `messages` and `loading` state internally. It receives `onDiagram` as a prop:

```typescript
interface ChatPanelProps {
  onDiagram: (def: string) => void;
}
```

`DisplayMessage` (internal to `ChatPanel`):

```typescript
interface DisplayMessage {
  id: string; // stable key — counter-based string, not array index
  role: 'user' | 'ai' | 'error';
  content: string;
}
```

On user submit (`submitMessage` inside `ChatPanel`):

1. Append `{ role: 'user', content: text }` to local messages
2. Call `postChat({ chatId: getChatId(), message: text })`
3. Append `{ role: 'ai', content: response.content }` to local messages
4. If `response.type === 'diagram' && response.diagram`: call `onDiagram(response.diagram)`
5. On network/timeout error: append `{ role: 'error', content: 'Failed to send message...' }`

## Mermaid Rendering (`DiagramPanel.tsx`)

Uses `useId()` for stable render IDs, cancellation flag to avoid stale state, and stores rendered SVG in React state:

```typescript
'use client';

const id = useId().replace(/:/g, '');
const [svg, setSvg] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!diagram) {
    setSvg(null);
    setError(null);
    return;
  }

  let cancelled = false;

  async function render() {
    try {
      const mermaid = await import('mermaid');
      mermaid.default.initialize({ startOnLoad: false });
      const { svg: rendered } = await mermaid.default.render(`diagram-${id}`, diagram!);
      if (!cancelled) {
        setSvg(rendered);
        setError(null);
      }
    } catch (err) {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
        setSvg(null);
      }
    }
  }

  render();
  return () => {
    cancelled = true;
  };
}, [diagram, id]);
```

Rendered SVG is injected via `dangerouslySetInnerHTML={{ __html: svg }}` — safe because Mermaid sanitises its own SVG output.

## Layout (`page.tsx`)

```tsx
'use client';

<div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
  <ErrorBoundary>
    <div style={{ width: '50%' }}>
      <ChatPanel onDiagram={setCurrentDiagram} />
    </div>
  </ErrorBoundary>
  <ErrorBoundary>
    <div style={{ width: '50%' }}>
      <DiagramPanel diagram={currentDiagram} />
    </div>
  </ErrorBoundary>
</div>;
```

## Testing Approach

Use React Testing Library. Mock `@/lib/api` and `@/lib/chat-id` in component tests.

```typescript
jest.mock('@/lib/api');
jest.mock('@/lib/chat-id');
```

**api.test.ts** — covers `postChat`: successful request, non-OK status throws, timeout aborts.

**ChatPanel.test.tsx** — covers:

- User message appears in transcript after submit
- AI reply appears in transcript on success
- `onDiagram` called when response type is `'diagram'`
- Error message shown on network failure

**DiagramPanel.test.tsx** — covers:

- Placeholder shown when `diagram` is null
- Mermaid `render()` called when `diagram` is provided
- Error state shown when Mermaid throws

## Conventions

- `padding-line-between-statements`: blank line after `const`/`let`/`var` before non-declaration code
- `no-magic-numbers`: avoid raw numbers — use named constants
- Prettier: printWidth 120, singleQuote, no trailingComma, arrowParens avoid
- Mark any component that uses browser APIs (`useEffect`, `useRef`, `window`) with `'use client'` at the top
- Use stable counter-based IDs for list keys — never array indices
