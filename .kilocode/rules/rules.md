# Rules for this project (read before every task)

## Contracts
- contracts/types.ts and contracts/index.ts are the source of truth. Do not change them.
- Build against these signatures. If a type or function you need is missing, stop and ask.

## Modules
- Never rewrite, copy, or re-implement a file inside modules/. Import it.
- If a required module is not present, output exactly `NEED_MODULE: <name>` and stop.
- If a module's contract test fails, report the failing test name and output, then stop. Do not patch the module.

## Ledger and verification
- Never set a requirement to "verified" except through the verifier path (actor "verifier").
- Never claim a feature works unless its check passed in this session. Show the test output.
- Never invent API names, file paths, or function parameters. Check contracts/ and the module README first.

## Work style
- One small change per task. Run the checks. Then commit with the task ID in the message, for example `TASK-H3: extract route`.
- If a change breaks an earlier passing check, revert to the last commit instead of stacking patches.
- Keep secrets out of code. Read keys from environment variable names only. Never print a key.

## Honesty in the UI and docs
- Do not write "guaranteed", "flawless", "zero errors", or "no one else can do this".
- Mark anything mocked or limited as such in the UI and README.
