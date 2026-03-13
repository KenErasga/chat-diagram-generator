# AI Usage

This document describes how AI tooling was used during the development.

## How AI Was Used

### Design Phase
- Claude Code was given the assessment brief and asked to produce a design document (design.md) covering domain model, API surface, lifecycle model, approach, trade-offs, and test plan.
- The output was reviewed and used as the implementation blueprint.

## Tracks

| Date | Prompt | Implementation |
|------|--------|----------------|
| 2026-03-13 | Design plan from CLAUDE.md brief (architecture, API, context, stubs, Mermaid, test plan, README structure) | `notes/design.md` — full design document covering all 12 brief points |
| 2026-03-13 | Create lean AI usage tracker at notes/ai-usage.md | This file |
| 2026-03-13 | Update design.md to reflect backend-owned conversation history with chatId adapter pattern | Updated sections 1–6, 9–12 in `notes/design.md` |
| 2026-03-13 | Step-by-step implementation plan for Turborepo monorepo (NextJS + NestJS, ESLint, Prettier) | `notes/implementation.md` — 25-step plan across 5 phases |
