# BUILD PLAN (contracts-v2)

Two repos:
- prebuilt-engine: built BEFORE the hackathon. Contains contracts and modules.
- engine-app: built ON the hackathon day with Kilo Code. Contains the web app. Pastes in modules from prebuilt-engine.

Gate rule: if a task needs a module that is not in modules/, output exactly
`NEED_MODULE: <name>` and stop. Do not write the module yourself.

---

## PART A: prebuilt-engine (before the hackathon)

Done means: `npx tsc --noEmit` passes on contracts, and every module's tests pass.

| Task | Module folder | Depends on | Done when |
|---|---|---|---|
| P0 | contracts/ | none | tsc passes, tag `contracts-v2` |
| P1 | modules/stack | P0 | detectStack finds TS, Python, Go from manifests in sample repos |
| P2 | modules/adapters/typescript | P0 | extract() returns functions, classes, imports, calls for ts-checkout sample |
| P3 | modules/adapters/python | P0 | extract() works on py-checkout sample; checks() returns pytest and mypy |
| P4 | modules/adapters/go | P0 | extract() works on go-checkout sample; checks() returns go vet, go test, go build |
| P5 | modules/adapters/index.ts | P2, P3, P4 | getAdapter(id) returns the right adapter |
| P6 | modules/selector | P0 | selectContext returns callers and callees for `calculateTotal` |
| P7 | modules/ledger | P0 | Only actor "verifier" can set "verified"; invalid transitions throw |
| P8 | modules/context | P0, P6 | compilePack respects budget; doNotRePropose lists rejected options |
| P9 | modules/model | P0 | complete() falls back from provider A to B on quota error (mock server test) |
| P10 | modules/verifier | P0 | applyPatches copies project; verify() runs checks; secretScan finds planted key |
| P11 | sample-repos/ts-checkout, py-checkout, go-checkout | none | Each has calculateTotal and two callers, and passes its own checks |

Order to build: P0, P11 (ts-checkout only), P2, P6, P7, P8, P9, P10, P1, P5, then P3, P4, P11 (py and go samples).

Each module folder must contain: README.md (inputs, outputs, limits), a tests/ folder, and a contract test that imports from contracts/index.ts.

Tag each module when it is done: `module-<name>-v1`.

---

## PART B: engine-app (hackathon day, Kilo Code)

Time budget: about 3 hours total. Keep to this order. If behind schedule, use the cut list at the end.

### H0. Setup (15 min)
- `npx create-next-app@latest engine-app` (TypeScript, Tailwind, App Router, ESLint, src/ directory).
- git init, first commit.
- Copy contracts/, modules/, docs/, .kilocode/rules/, .env.example into the repo.
- Gate: `npm run build` passes on the empty app.

### H1. Pages shell (40 min)
- Layout: header, footer, navigation.
- Landing page (/): headline, pitch, three feature cards, "Try the demo" button.
- About page (/about): problem, approach, honest limits, roadmap link.
- Roadmap page (/roadmap): deferred features, clearly marked as future.
- Gate: all three pages render on `npm run dev`.

### H2. Projects and workspace shell (40 min)
- /projects: list, "Open demo" button.
- /projects/[id]: three columns (file and map list, task panel, diff and checks and ledger).
- Gate: workspace renders with placeholder data.

### H3. Stack and extract (20 min)
- Route POST /api/projects/demo: loads ts-checkout sample.
- Route POST /api/projects/[id]/extract: calls detectStack, getAdapter, extract.
- Gate: needs modules/stack, modules/adapters. If missing, stop with NEED_MODULE.
- Done: map shows symbols and edges for ts-checkout.

### H4. Context (20 min)
- Route POST /api/projects/[id]/context: calls selectContext, compilePack.
- Gate: needs modules/selector, modules/context.
- Done: task panel shows selected symbols, reasons, and the pack.

### H5. Ledger (20 min)
- Route GET /api/projects/[id]/ledger. Ledger panel shows requirements, status, decisions with rejected options.
- Gate: needs modules/ledger.
- Done: a seeded requirement and decision display.

### H6. Run the model (25 min)
- Route POST /api/projects/[id]/run: calls complete(pack, task, providers).
- Providers come from env var names in .env.local, never hardcoded keys.
- Gate: needs modules/model.
- Done: a proposed patch appears, or a clear error is shown.

### H7. Verify and approve (25 min)
- Route POST /api/projects/[id]/verify: applyPatches to a copy, then verify().
- Route POST /api/projects/[id]/approve: only if passed, setRequirementStatus(..., "verified", "verifier"), and apply the patch to the real project.
- Gate: needs modules/verifier, modules/ledger.
- Done: a failing patch shows red; a passing patch turns the requirement green.

### H8. Diff and checks panels (15 min)
- Diff viewer per file. Checks panel with pass, fail, or skipped and reason.

### H9. Model-switch demo (15 min)
- Configure two providers. Force a quota error with a low budget, confirm fallback continues from the same ledger state.
- If live keys fail, use the mocked fallback and say so in the demo script.

### H10. Deploy and submit (20 min)
- `npm run build` locally, push to GitHub, import into Vercel, add env vars from .env.example.
- Vercel note: run the verifier only on the fixed sample repo with a timeout. Keep the ledger in a JSON file with a "Reset demo" button.
- Record a backup video. Write README (what it does, live link, how to run, limits, roadmap).

### Cut list (cut in this order if behind)
1. Visual dependency graph (keep the list).
2. Ledger history (keep current status).
3. Live second provider (keep the mocked fallback).
4. Roadmap page styling.
Never cut: the verifier result, the diff, the ledger status change. These are the proof.

---

## Rules for every Kilo session
- One task per prompt. Name the task ID.
- Start each session by naming the modules that are pasted.
- Run tests after each change and show the output.
- Commit after each green step.
- If code disagrees with contracts/, stop and point to the file.
