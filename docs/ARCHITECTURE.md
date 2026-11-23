# ARCHITECTURE

## Big picture
The product has two repositories:
- prebuilt-engine (this repo): the engine modules, built before the event.
- engine-app: the Next.js web app, built on the event day with Kilo Code. It copies the engine modules in.

## Data flow for one task
1. stack.detectStack(projectPath) returns languages and framework.
2. adapters.getAdapter(language).extract(projectPath) returns a SymbolGraph.
3. selector.selectContext(graph, taskTargets) returns a Selection.
4. ledger.openLedger(dbPath, projectId).read() returns the Ledger.
5. context.compilePack(ledger, selection, graph, budget) returns a ContextPack.
6. model.complete(pack, task, providers) returns ModelResult with FilePatch[].
7. verifier.applyPatches(projectPath, patches, workDir) returns the copy path.
8. verifier.verify(copyPath, checks) returns VerifyResult.
9. If passed and the user approves: ledger.setRequirementStatus(id, "verified", "verifier") and the patches are written to the real project.

## Module responsibilities
| Module | Responsibility | Key rule |
|---|---|---|
| stack | Detect languages and framework from manifests | Returns confidence, never guesses silently |
| adapters/typescript | Symbol graph via TypeScript compiler API | Edges are type-resolved |
| adapters/python | Symbol graph via ast, later pyright LSP | Edges marked resolved: false unless type-resolved |
| adapters/go | Symbol graph via syntax, later gopls or go list | Same as Python |
| adapters/index | Registry: getAdapter(id) | Single lookup point |
| selector | Related symbols and callers for task targets | Ranked, with reasons |
| ledger | SQLite typed records and append-only events | Only actor "verifier" sets "verified"; transitions in order |
| context | Pack compiler with token budget | Records dropped items and rejected options |
| model | OpenAI-compatible calls with provider fallback | Keys read from env var names only |
| verifier | Apply on copy, run checks, secret scan | Never runs in the original; missing tools = skipped, not passed |

## Security rules
- Checks run as argument arrays, never as shell strings.
- Every check has a timeout.
- Secrets are never stored in the ledger or in code.
- The public demo runs checks only on the fixed sample repository.

## Known limits (state them in the README and the demo)
- Dependency precision: TypeScript high, Python and Go lower until the LSP upgrade.
- Verifier needs the language toolchains installed locally, or a container runner.
- Free model quality varies.
