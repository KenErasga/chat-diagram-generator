# chat-app

Next.js 16 frontend for Chat Diagram Generator. Renders a split-screen layout: chat panel on the left, Mermaid diagram panel on the right.

---

## Dev

Run from this directory:

```bash
npm run dev
```

Or from the repo root:

```bash
npm run dev:app
```

Opens at http://localhost:3000. Requires `chat-service` running on port 3001 to handle chat requests.

---

## Build

```bash
npm run build
```

---

## Test

```bash
npm test
```

9 tests across 3 suites (Jest + React Testing Library):

- `src/lib/api.test.ts` — `postChat` fetch wrapper
- `src/components/ChatPanel.test.tsx` — message submission, response handling, error states
- `src/components/DiagramPanel.test.tsx` — placeholder, Mermaid render, render error

---

## Key Files

```
src/
  app/
    layout.tsx            Root layout and metadata
    page.tsx              Split-screen page (ChatPanel + DiagramPanel)
  components/
    ChatPanel.tsx         Chat input, message history, calls POST /api/chat
    DiagramPanel.tsx      Mermaid renderer with placeholder and error states
  lib/
    api.ts                postChat() — typed fetch wrapper for POST /chat
    chat-id.ts            getChatId() — UUID per session, stored in sessionStorage
```

---

## API Proxy

All `/api/*` requests are proxied to `http://localhost:3001` via `next.config.ts` rewrites. No CORS configuration needed in development.

---

## Notes

- `chatId` is generated once per browser session and cached in `sessionStorage`. Closing the tab resets the conversation.
- Mermaid is dynamically imported inside a `useEffect` — never at the module level — to avoid SSR issues.
- The diagram panel retains the last rendered diagram when the backend returns a plain `message` response.
