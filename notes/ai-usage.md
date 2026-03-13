# AI Usage

This document describes how AI tooling was used during the development.

## How AI Was Used

### Design Phase

- Claude Code was given the assessment brief and asked to produce a design document (design.md) covering domain model, API surface, lifecycle model, approach, trade-offs, and test plan.
- The output was reviewed and used as the implementation blueprint.

### Implementation Phase

- Claude Code scaffolded the NestJS and NextJS project structure, and implemented business logic following the agreed design.
- All generated code was reviewed before being committed. Logic that diverged from the design or introduced unnecessary complexity was corrected.

## Prompts and Output Tracks

| Date       | Prompt                                                                                                         | Implementation                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 2026-03-13 | Design plan from CLAUDE.md brief (architecture, API, context, stubs, Mermaid, test plan, README structure)     | `notes/design.md` — full design document covering all 12 brief points                                    |
| 2026-03-13 | Create lean AI usage tracker at notes/ai-usage.md                                                              | This file                                                                                                |
| 2026-03-13 | Update design.md to reflect backend-owned conversation history with chatId adapter pattern                     | Updated sections 1–6, 9–12 in `notes/design.md`                                                          |
| 2026-03-13 | Step-by-step implementation plan for Turborepo monorepo (NextJS + NestJS, ESLint, Prettier)                    | `notes/implementation.md` — 25-step plan across 5 phases                                                 |
| 2026-03-13 | Reorder implementation phases: Hello World scaffolds for chat-service then chat-app before full implementation | Updated `notes/implementation.md` — 25-step plan across 7 phases                                         |
| 2026-03-13 | Implement Phase 1: root monorepo scaffold                                                                      | `package.json`, `turbo.json`, `.prettierrc`, `.gitignore`, `tsconfig.base.json`                          |
| 2026-03-13 | Implement Phases 2–4: eslint-config package, NestJS Hello World, Next.js Hello World                           | `packages/eslint-config`, `apps/chat-service` (NestJS), `apps/chat-app` (Next.js 14)                     |
| 2026-03-13 | Upgrade Next.js to latest                                                                                      | `apps/chat-app/package.json` next 14→16.1.6; `next.config.mjs`→`next.config.ts`                          |
| 2026-03-13 | Add 1 simple test for chat-service                                                                             | `apps/chat-service/src/app.controller.spec.ts` — 1 test for Hello World GET /                            |
| 2026-03-13 | Double-check Claude agents and settings.json; update agents to match current codebase                          | `.claude/agents/*.md` — corrected NestJS 10, React 18, chatId API contract, backend-owned history        |
| 2026-03-13 | Implement Phase 5: apps/chat-service full implementation                                                       | `src/history/`, `src/providers/`, `src/chat/` — 11 source files, 5 spec files, 18 tests                  |
| 2026-03-13 | Implement Phase 6: apps/chat-app full implementation                                                           | `src/lib/api.ts`, `src/lib/chat-id.ts`, `ChatPanel.tsx`, `DiagramPanel.tsx`, `page.tsx` — 27 tests total |
| 2026-03-13 | Update ai-usage.md at every prompt and output                                                                  | Saved feedback memory; ai-usage.md updated going forward after every interaction                         |
| 2026-03-13 | Phase 7: final verification                                                                                    | `npm install` clean, `turbo run test` 27/27, `turbo run build` both apps compile                         |
| 2026-03-13 | Write READMEs for root, chat-app, chat-service; add dev:app and dev:service scripts to root                    | `README.md`, `apps/chat-app/README.md`, `apps/chat-service/README.md`; `package.json` scripts updated    |
