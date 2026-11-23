# DATA_MODEL: ledger schema (SQLite)

Use this schema in modules/ledger. Create it on first open. The database is local per project.

```sql
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- stores ('project_id', '<id>') and ('schema_version', '1')

CREATE TABLE IF NOT EXISTS requirements (
  id               TEXT PRIMARY KEY,               -- REQ-001
  text             TEXT NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('proposed','accepted','implemented','verified')),
  acceptance_tests TEXT NOT NULL DEFAULT '[]'      -- JSON array of strings
);

CREATE TABLE IF NOT EXISTS decisions (
  id              TEXT PRIMARY KEY,                -- DEC-001
  chosen          TEXT NOT NULL,
  rejected        TEXT NOT NULL DEFAULT '[]',      -- JSON array of strings
  reason          TEXT NOT NULL,
  requirement_ids TEXT NOT NULL DEFAULT '[]',      -- JSON array of REQ ids
  created_at      TEXT NOT NULL                    -- ISO 8601
);

CREATE TABLE IF NOT EXISTS constraints (
  id   TEXT PRIMARY KEY,                           -- CON-001
  text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id      TEXT PRIMARY KEY,
  at      TEXT NOT NULL,
  actor   TEXT NOT NULL CHECK (actor IN ('user','verifier','model','system')),
  type    TEXT NOT NULL,
  payload TEXT NOT NULL                            -- JSON
);

-- Append-only: the database itself refuses edits and deletes of events.
CREATE TRIGGER IF NOT EXISTS events_no_update BEFORE UPDATE ON events
BEGIN SELECT RAISE(ABORT, 'events are append-only'); END;
CREATE TRIGGER IF NOT EXISTS events_no_delete BEFORE DELETE ON events
BEGIN SELECT RAISE(ABORT, 'events are append-only'); END;
```

## Rules enforced in code (not in SQL)
- Allowed status order: proposed to accepted to implemented to verified. Skipping a step throws LedgerError.
- Only actor "verifier" may set status "verified". Any other actor throws LedgerError.
- Every status change and every new record appends one event.
- IDs are sequential per table: REQ-001, DEC-001, CON-001.
