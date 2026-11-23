# PRD: Project Ledger (hackathon scope)

## Problem
People who build software with AI lose project context when they switch AI models or hit quota limits, accept "done" claims without evidence, and skip engineering basics such as input validation, secrets handling and system design.

## Target user
Students, self-taught builders and early founders who build with AI and are not professional engineers. Developers are a secondary audience.

## Product (one sentence)
A web app where a user describes a change to a project, an AI model proposes it, automatic checks verify it, and a structured ledger records the requirements, decisions and rejected options so any model can continue the work.

## Must work in the hackathon demo
1. Load the TypeScript sample project and show its symbol map (functions, imports, calls).
2. Enter a task. Show the selected code and the context pack, including what was dropped and the rejected options.
3. Run one model call. If the first provider is out of quota, fall back to the second provider and continue from the same ledger.
4. Show the proposed change as a diff.
5. Run the verifier on a copy: type check, tests, secret scan. Show each result.
6. Only if all required checks pass, approve the change. The requirement becomes "verified" in the ledger.
7. Deploy the working demo and record a backup video.

## Non-goals for the hackathon
- Production security audit.
- Authentication, billing, team features.
- Full Python and Go precision (shown at the syntax level, labelled as approximate).
- Sandboxed execution of arbitrary user code on the public server.
- Skills, MCP server, CLI.

## Honesty rules
- Never claim zero errors, guaranteed correctness or "nobody else can do this".
- A passing check is strong evidence, not proof.
- Skipped or missing checks are shown as skipped, never as passed.
- Mock or limited features are labelled in the UI and the README.

## Success measures for the demo
- The full flow runs end to end without manual database edits.
- Fallback to a second provider works (live or mocked, labelled).
- The verifier shows a real failure case and a real pass case.
