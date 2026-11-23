# prebuilt-engine

Core modules built before the hackathon. Used by engine-app on the hackathon day.

## Structure
- contracts/: shared types and function signatures (CONTRACTS-V2). Frozen.
- modules/: one folder per module. Each has README.md, tests/, and a contract test.
- modules/adapters/: one adapter per language (typescript, python, go).
- sample-repos/: small multi-file projects used for demo and tests.
- docs/BUILD_PLAN.md: the task order and gates.
- .kilocode/rules/rules.md: standing rules for Kilo Code.

## Setup
1. Install Node 20 or newer.
2. `npm install` at the repo root.
3. `npx tsc --noEmit` should pass on contracts/.
4. For Python and Go checks, install Python 3 and Go on your machine. Tests for those adapters need them.

## Limits
- TypeScript dependency map uses the TypeScript compiler, so its relationships are type-resolved.
- Python and Go use syntax-level extraction, so relationships are less precise. Shown as resolved: false in the graph.
- Verifier runs need the language toolchain installed locally. The deployed demo runs checks only on the sample repo.
