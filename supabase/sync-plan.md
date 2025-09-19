# Data Sync Plan

This document outlines the strategy for synchronizing data from Parse Server to Supabase.

## Data Migration Strategy (Authoritative One-Way Sync Plan)

We will implement a one-way sync tool (Parse → Supabase). This will be a TypeScript command-line tool, run by a developer. Parse remains the system of record until the final switchover. The sync tool is responsible for incrementally populating Supabase and can be run multiple times. Book deletions are propagated via tombstones.

### Preparatory Tasks

- Finalize and apply the Supabase schema, including all necessary triggers (e.g., for `updated_at`) and RLS policies.
- Deploy any Edge Functions that will replace Parse Cloud Code.
- Add the `afterDelete` trigger to the Parse Server (see `parse-server-prep.md`).

### The Sync Process

The sync tool will handle both the initial population of an empty Supabase database and subsequent delta updates. When run, the tool will:

1.  **Query Parse for changes:** For each table, query Parse for rows where `updatedAt` > last watermark OR (`updatedAt` = watermark AND `objectId` > last_object_id), ordered by (`updatedAt`, `objectId`) asc. On the first run against an empty database, this will fetch all records.
2.  **Transform and Upsert:** Transform each record minimally and bulk upsert into Supabase using `INSERT ... ON CONFLICT (id) DO UPDATE`.
3.  **Process Deletions:** Fetch new `bookDeletion` rows from Parse, insert them into the `book_tombstones` table in Supabase, and then soft-delete the corresponding rows in the `books` table.
4.  **Update Watermarks:** After each successful batch, record the highest (`updatedAt`, `objectId`) encountered for each table into the `sync_state` table.
5.  **Emit Metrics:** The tool should output the number of records processed, the time lag behind Parse, and the number of tombstones applied.

### Validation & Monitoring

- **Consistency Job**: A nightly job should sample random book IDs, fetch them from both Parse and Supabase, and log any discrepancies.
- **Aggregate Checks**: Periodically compare counts of non-deleted books, languages, and tags between the two databases.
- **Alerting**: Set up alerts if the sync lag exceeds a certain threshold (e.g., 30 minutes).

### Cutover

1.  Announce a maintenance window and disable book write operations in Parse.
2.  Run a final delta sync.
3.  Execute a validation script to ensure data consistency and that all triggers and RLS policies are working as expected.
4.  Point the application backend to Supabase.
5.  Keep Parse in read-only mode for a rollback window (e.g., 48 hours).

### User Migration Specifics

See `auth-plan.md` for the full discussion. The key takeaway is that we will continue to use Firebase for authentication. For the data sync, this means we will pre-create users in our custom `users` table (not `auth.users`) before running the initial data snapshot. We will need to maintain a mapping between Parse user IDs and the corresponding IDs in our new `users` table if the identifiers change.

### Data Transformation Rules

- Preserve `objectId` → `id` (TEXT).
- Convert Parse Dates to ISO strings.
- `show` object → `JSONB`.

### Error Handling & Idempotency

- Each batch should be wrapped in a transaction.
- Use `UPSERT` and `ON CONFLICT` to ensure idempotent re-runs.

### Performance Considerations

- Tune the batch size for upserts (e.g., 500–1000 rows).
- Use `COPY` for the large initial snapshot.

### Security

- Store API keys and secrets in a secure manner (e.g., Azure Key Vault, GitHub Actions secrets).

### Rollback Plan

- If cutover validation fails, revert the application configuration to point back to Parse and re-enable writes.
