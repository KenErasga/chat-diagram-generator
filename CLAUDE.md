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