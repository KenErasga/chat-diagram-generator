# AI Usage

This document describes how AI tooling was used during the development.

## How AI Was Used

### Design Phase

- Claude Code was given the assessment brief and asked to produce a design document (design.md) covering domain model, API surface, lifecycle model, approach, trade-offs, and test plan.
- The output was reviewed and used as the implementation blueprint.

### Implementation Phase

- Claude Code scaffolded the NestJS and NextJS project structure, and implemented business logic following the agreed design.
- All generated code was reviewed before being committed. Logic that diverged from the design or introduced unnecessary complexity was corrected.

Claude was used as a structured assistant during development to help plan, validate, and refine the implementation.  
The workflow followed an iterative loop:

1. **Plan**
   - Describe the problem and proposed solution.
   - Ask Claude to help structure the approach and identify edge cases.

2. **Verify the Plan**
   - Review the proposed plan with Claude.
   - Check assumptions, logic, and potential issues before implementation.

3. **Update the Plan**
   - Refine the plan based on feedback.
   - Clarify steps, improve structure, and address any gaps.

4. **Implement**
   - Write the implementation based on the agreed plan.

5. **Verify the Implementation**
   - Review the implemented code with Claude.
   - Validate correctness, identify bugs, and confirm the implementation matches the original plan.

This iterative approach helped reduce implementation errors, clarify complex logic before coding, and ensure the final solution matched the intended design.

## Prompts and Output Tracks

| Date       | Prompt                                                                                                         | Implementation                                                                                                                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-13 | Design plan from CLAUDE.md brief (architecture, API, context, stubs, Mermaid, test plan, README structure)     | `notes/design.md` — full design document covering all 12 brief points                                                                                                                                                           |
| 2026-03-13 | Create lean AI usage tracker at notes/ai-usage.md                                                              | This file                                                                                                                                                                                                                       |
| 2026-03-13 | Update design.md to reflect backend-owned conversation history with chatId adapter pattern                     | Updated sections 1–6, 9–12 in `notes/design.md`                                                                                                                                                                                 |
| 2026-03-13 | Step-by-step implementation plan for Turborepo monorepo (NextJS + NestJS, ESLint, Prettier)                    | `notes/implementation.md` — 25-step plan across 5 phases                                                                                                                                                                        |
| 2026-03-13 | Reorder implementation phases: Hello World scaffolds for chat-service then chat-app before full implementation | Updated `notes/implementation.md` — 25-step plan across 7 phases                                                                                                                                                                |
| 2026-03-13 | Implement Phase 1: root monorepo scaffold                                                                      | `package.json`, `turbo.json`, `.prettierrc`, `.gitignore`, `tsconfig.base.json`                                                                                                                                                 |
| 2026-03-13 | Implement Phases 2–4: eslint-config package, NestJS Hello World, Next.js Hello World                           | `packages/eslint-config`, `apps/chat-service` (NestJS), `apps/chat-app` (Next.js 14)                                                                                                                                            |
| 2026-03-13 | Upgrade Next.js to latest                                                                                      | `apps/chat-app/package.json` next 14→16.1.6; `next.config.mjs`→`next.config.ts`                                                                                                                                                 |
| 2026-03-13 | Add 1 simple test for chat-service                                                                             | `apps/chat-service/src/app.controller.spec.ts` — 1 test for Hello World GET /                                                                                                                                                   |
| 2026-03-13 | Double-check Claude agents and settings.json; update agents to match current codebase                          | `.claude/agents/*.md` — corrected NestJS 10, React 18, chatId API contract, backend-owned history                                                                                                                               |
| 2026-03-13 | Implement Phase 5: apps/chat-service full implementation                                                       | `src/history/`, `src/providers/`, `src/chat/` — 11 source files, 5 spec files, 18 tests                                                                                                                                         |
| 2026-03-13 | Implement Phase 6: apps/chat-app full implementation                                                           | `src/lib/api.ts`, `src/lib/chat-id.ts`, `ChatPanel.tsx`, `DiagramPanel.tsx`, `page.tsx` — 27 tests total                                                                                                                        |
| 2026-03-13 | Update ai-usage.md at every prompt and output                                                                  | Saved feedback memory; ai-usage.md updated going forward after every interaction                                                                                                                                                |
| 2026-03-13 | Phase 7: final verification                                                                                    | `npm install` clean, `turbo run test` 27/27, `turbo run build` both apps compile                                                                                                                                                |
| 2026-03-13 | Write READMEs for root, chat-app, chat-service; add dev:app and dev:service scripts to root                    | `README.md`, `apps/chat-app/README.md`, `apps/chat-service/README.md`; `package.json` scripts updated                                                                                                                           |
| 2026-03-13 | Fix lint/format/test after chat-service refactor (moved stubs to ai-providers/, history to db-providers/)      | Deleted 8 dead stub/history files; removed debug console.log; fixed chat-app lint (eslint direct); extracted HTTP_CREATED, HTTP_BAD_REQUEST, SECOND_CALL constants to resolve no-magic-numbers violations; 27/27 tests pass     |
| 2026-03-13 | Code review of chat-service; apply all findings                                                                | Added @HttpCode(201), global ValidationPipe+CORS in main.ts, @MaxLength to DTO, BaseStub+stub-fixtures dedup, health route, unknown-provider warning, moved orphaned specs, removed empty stubs/ and history/ dirs; 28/28 tests |
| 2026-03-13 | Add NestJS Logger to chat-service                                                                              | Logger added to main.ts (startup), ChatService (entry/response/error), ai-provider.factory.ts (selection/warn), BaseStub (debug); 28/28 tests pass                                                                              |
| 2026-03-13 | Implement AWS Bedrock AI providers (BedrockProvider, NovaProvider) with ConverseCommand API and shared base    | `base-bedrock.provider.ts`, `bedrock.provider.ts`, `nova.provider.ts`, `bedrock-test-fixtures.ts`, `bedrock.provider.spec.ts`, `nova.provider.spec.ts`; updated factory, factory spec, README; 31/31 tests pass                 |
| 2026-03-13 | Remove BedrockProvider (Claude on Bedrock); keep only NovaProvider for real Bedrock calls                      | Deleted `bedrock.provider.ts` (Claude variant), removed `bedrock` factory case; 25/25 tests pass                                                                                                                                |
| 2026-03-13 | Rename NovaProvider to BedrockProvider; use Nova as model ID                                                   | `nova.provider.ts` → `bedrock.provider.ts`, class `NovaProvider`→`BedrockProvider`, env var `NOVA_MODEL_ID`→`BEDROCK_MODEL_ID`; factory + spec updated; 25/25 tests pass                                                        |
| 2026-03-13 | Add scrolling to diagram panel for large diagrams                                                              | `DiagramPanel.tsx` container style changed to `overflow: auto`; 9/9 tests pass                                                                                                                                                  |
| 2026-03-13 | Update READMEs, CLAUDE.md, design.md, ai-usage.md to reflect current codebase                                  | All 6 doc files updated: root README, chat-service README, chat-app README, CLAUDE.md, notes/design.md, notes/ai-usage.md                                                                                                       |
| 2026-03-13 | Rename MODEL_PROVIDER value from `nova` to `bedrock`                                                           | `ai-provider.factory.ts`, `provider.factory.spec.ts`; root README, chat-service README, CLAUDE.md, notes/design.md, notes/ai-usage.md; 25/25 tests pass                                                                         |
