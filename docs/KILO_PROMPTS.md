# KILO_PROMPTS: copy-paste prompts for building the prebuilt modules

How to use: open the prebuilt-engine folder in VS Code, open Kilo Code, and paste the COMMON PREAMBLE once at the start of a session. Then paste one MODULE PROMPT per session. Use Architect mode first for the plan, then Code mode to implement. Commit and tag after each module.

---

## COMMON PREAMBLE (paste first in every session)

```
Read these files before doing anything, in this order:
1. .kilocode/rules/rules.md
2. docs/PRD.md
3. docs/ARCHITECTURE.md
4. docs/DATA_MODEL.md
5. contracts/types.ts and contracts/index.ts

Rules that apply to this session:
- Do not change anything in contracts/. If a type or signature seems wrong, stop and tell me.
- Build only the module named in the task. Do not touch other modules.
- Export exactly the functions and types listed in contracts/index.ts for that module.
- Write tests with vitest in the module's tests/ folder.
- Run "npm run typecheck" and "npm test" and show me the output.
- Do not claim success unless both commands pass.
- Then commit with the message given in the task.
- Keep the module's README.md up to date: inputs, outputs, limits, how to test.
```

---

## MODULE PROMPT: P1 stack (modules/stack)

```
Task P1: build modules/stack.
Export detectStack(projectPath) returning StackInfo (see contracts/types.ts).
Detect from manifest files only:
- package.json => typescript or javascript (typescript if tsconfig.json or any .ts file exists)
- pyproject.toml, requirements.txt or setup.py => python
- go.mod => go
Framework: "nextjs" if package.json depends on "next"; "django" if requirements mention django; "gin" if go.mod mentions gin-gonic/gin; otherwise null.
Confidence: high when a manifest and matching source files exist, medium when only a manifest exists, low otherwise.
Tests: use the sample repos as fixtures under tests/fixtures/ (create small fake folders with just the manifest files).
Commit message: "P1: stack detector". Tag: module-stack-v1.
```

---

## MODULE PROMPT: P2 TypeScript adapter (modules/adapters/typescript)

```
Task P2: build modules/adapters/typescript.
Implement the LanguageAdapter interface from contracts/types.ts with id "typescript".
- detect(projectPath): return StackInfo if tsconfig.json exists, otherwise null.
- extract(projectPath): use the TypeScript compiler API (package "typescript") to create a program from tsconfig.json.
  Create nodes for functions, classes, type aliases, interfaces, variables and exports.
  Create edges: "imports" (resolved), "calls" (resolved via the type checker), "exports".
  Node id format: `${relativeFilePath}#${name}` with forward slashes.
  Count files parsed and skipped in coverage.
- checks(projectPath): return CheckCommand objects for "typecheck" (npx tsc --noEmit) and "test" (npx vitest run), each with a timeoutMs of 120000 and cwd set to the project path. Use argument arrays, never shell strings.
Tests: run extract() on sample-repos/ts-checkout (build that repo first if P11 is not done; if it is not done yet, use a tiny fixture under tests/fixtures/ts-tiny instead).
Commit message: "P2: TypeScript adapter". Tag: module-adapter-typescript-v1.
```

---

## MODULE PROMPT: P3 Python adapter (modules/adapters/python)

```
Task P3: build modules/adapters/python.
Implement LanguageAdapter with id "python".
- detect: return StackInfo if pyproject.toml, requirements.txt or setup.py exists, otherwise null.
- extract: run a small Python script (write it as modules/adapters/python/extract_symbols.py) with the built-in ast module. Call it with child_process.execFile using the argument array ["python3", scriptPath, projectPath] (fall back to "python" on Windows). The script prints JSON with functions, classes, imports and simple name-based calls.
  Edges: imports are resolved only when the target file exists in the project; all calls use resolved: false.
  Set coverage.skippedReasons for any file that fails to parse.
- checks: return "test" (python -m pytest) and "typecheck" (python -m mypy .) commands. Use argument arrays. Timeout 120000.
Tests: a fixture folder under tests/fixtures/py-tiny. If python3 is not installed, the test must be skipped with a clear message, not failed.
Commit message: "P3: Python adapter". Tag: module-adapter-python-v1.
```

---

## MODULE PROMPT: P4 Go adapter (modules/adapters/go)

```
Task P4: build modules/adapters/go.
Implement LanguageAdapter with id "go".
- detect: return StackInfo if go.mod exists, otherwise null.
- extract: parse .go files with a small Go helper program (write modules/adapters/go/helper/main.go) that uses go/parser and go/ast, and prints JSON. Run it with execFile and an argument array: ["go", "run", helperPath, projectPath]. Edges: imports marked resolved only for packages inside the module; calls marked resolved: false.
- checks: "vet" (go vet ./...), "test" (go test ./...), "build" (go build ./...). Argument arrays, timeout 180000.
Tests: fixture under tests/fixtures/go-tiny. If the go command is missing, skip the test with a clear message.
Commit message: "P4: Go adapter". Tag: module-adapter-go-v1.
```

---

## MODULE PROMPT: P5 adapter registry (modules/adapters/index.ts)

```
Task P5: build modules/adapters/index.ts.
Export getAdapter(id) returning the adapter for "typescript", "javascript" (same as typescript), "python" or "go".
Throw an Error with a clear message for any other id.
Also re-export buildGraph from contracts (write its implementation here: it returns { language, ...graph }).
Tests: getAdapter returns the right id for each language; unknown id throws.
Commit message: "P5: adapter registry". Tag: module-adapters-index-v1.
```

---

## MODULE PROMPT: P6 selector (modules/selector)

```
Task P6: build modules/selector.
Export selectContext(graph, taskTargets, maxSymbols = 25).
- taskTargets are file paths or symbol ids.
- Start from target symbols. Collect symbols connected by "calls" or "imports" edges in both directions (callees and callers), ranked: targets first, then direct neighbours, then their neighbours.
- Fill reasons for each included symbol, for example "target", "calls target", "called by target".
- Put anything beyond maxSymbols in dropped, with the id.
- callers = symbols that call or import the targets.
Tests: use a small hand-written SymbolGraph in the test file (no parser needed). Check ranking, reasons, and the maxSymbols cut.
Commit message: "P6: selector". Tag: module-selector-v1.
```

---

## MODULE PROMPT: P7 ledger (modules/ledger)

```
Task P7: build modules/ledger.
Use the schema in docs/DATA_MODEL.md exactly. Use the package "better-sqlite3" (synchronous API).
Export openLedger(dbPath, projectId) returning LedgerStore, and the LedgerError class.
Implement every method on LedgerStore from contracts/index.ts.
Rules to enforce in code:
- Status moves only proposed to accepted to implemented to verified. Any other move throws LedgerError.
- Only actor "verifier" may set "verified". Otherwise throw LedgerError.
- Every write appends an event row.
- IDs: REQ-001, DEC-001, CON-001, sequential.
Tests: use ":memory:" or a temp file. Test every rule above, including that UPDATE and DELETE on events fail.
If better-sqlite3 fails to install on this machine, stop and tell me the error. Do not switch libraries without asking.
Commit message: "P7: ledger". Tag: module-ledger-v1.
```

---

## MODULE PROMPT: P8 context compiler (modules/context)

```
Task P8: build modules/context.
Export compilePack(ledger, selection, graph, budgetTokens = 6000).
- Token estimate: characters divided by 4, rounded up.
- Order of inclusion: active constraints, then requirements not yet verified, then decisions linked to those requirements, then the selected symbols with their code signatures from the graph, in ranked order.
- Always add the "doNotRePropose" list: every rejected option from decisions, with its reason.
- When the budget is reached, stop and add the rest to dropped with reason "budget".
- The output text must start with a short header: contracts version and project id.
Tests: check the budget is never exceeded, dropped items are listed, doNotRePropose is complete.
Commit message: "P8: context compiler". Tag: module-context-v1.
```

---

## MODULE PROMPT: P9 model gateway (modules/model)

```
Task P9: build modules/model.
Export complete(pack, task, providers).
- Use the OpenAI-compatible chat completions format with fetch (Node 20+).
- For each provider in order: read the API key from process.env[provider.apiKeyEnv]. If it is missing, record a network-type error and move on.
- Send the pack text and the task as messages. Ask the model to return JSON: { "patches": [{ "path": string, "newContent": string }] }.
- Parse the JSON. If parsing fails, return error kind "invalid_output" (do not fall back on invalid output).
- On HTTP 429 or a quota message, return kind "quota" and try the next provider.
- On network error, try the next provider, kind "network".
- Never log or return the API key.
Tests: use a local mock server (node:http) that returns 429 for the first provider and a valid JSON patch for the second. Check fallback, invalid JSON, and that no key appears in the result.
Commit message: "P9: model gateway". Tag: module-model-v1.
```

---

## MODULE PROMPT: P10 verifier (modules/verifier)

```
Task P10: build modules/verifier.
Export applyPatches(projectPath, patches, workDir), verify(projectPath, checks), and secretScan(projectPath).
- applyPatches: copy the project into workDir (skip node_modules, .git, dist), write each patch. Reject any patch path that is absolute or contains "..". Return the copy path.
- verify: run each CheckCommand with child_process.execFile using the argument array, the given cwd and timeoutMs. Capture stdout and stderr, truncate output to 4000 characters. If the command is not found, return skipped: true with skipReason "tool not installed: <name>". Skipped checks never count as passed.
  passed = every non-skipped check passed AND at least one check actually ran.
- secretScan: search files for patterns: AWS access key IDs (AKIA followed by 16 uppercase letters or digits), strings like "sk-" followed by 20 or more characters, and assignments of password, secret or token to a quoted string of 8 or more characters. Skip binary files and node_modules. Return a CheckResult; fail if any match, and list file and line numbers but never print the matched value.
Tests: a temp project, a passing check, a failing check, a missing tool (skipped), a path traversal patch (rejected), and a planted fake key (detected, value not printed).
Commit message: "P10: verifier". Tag: module-verifier-v1.
```

---

## MODULE PROMPT: P11 sample repositories

```
Task P11: build three small sample repositories with the same checkout logic.

sample-repos/ts-checkout:
- package.json (scripts: test = vitest run), tsconfig.json, vitest config
- src/pricing.ts: export function calculateTotal(items: {price:number, qty:number}[], discountPct = 0): number
- src/checkout.ts: imports calculateTotal and exports checkout(cart) that calls it
- src/invoice.ts: imports calculateTotal and exports makeInvoice(cart) that calls it
- tests/pricing.test.ts: tests for calculateTotal and checkout
- README.md: the dependency chain, so the demo task is clear

sample-repos/py-checkout:
- pyproject.toml, src/pricing.py, src/checkout.py, src/invoice.py, tests/test_pricing.py
- same functions, same dependency chain

sample-repos/go-checkout:
- go.mod, pricing/pricing.go, checkout/checkout.go, invoice/invoice.go, pricing/pricing_test.go
- same functions, same dependency chain

Each repo must pass its own checks when run locally (npm test, pytest, go test ./...).
Run each repo's checks and show me the output. Commit message: "P11: sample repositories". Tag: samples-v1.
```

---

## FINAL CHECK PROMPT (run after all modules)

```
Run the full prebuilt-engine check:
1. npm run typecheck
2. npm test
3. For each module folder, confirm README.md exists and lists inputs, outputs and limits.
4. List every module with its git tag.
Report results as a table: module, typecheck, tests, tag. Do not claim anything passed that did not run.
```
