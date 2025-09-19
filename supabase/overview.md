# Supabase Migration Overview

This document provides an overview of the strategy for migrating the Bloom Library database from Parse Server to Supabase.

## 1. Introduction

The goal of this migration is to move our backend database from Parse Server to Supabase, which is built on PostgreSQL.

## 2. Parse Server Schema Analysis

The current Parse Server schema is defined in `cloud/main.js` within the `setupTables` cloud function. The schema consists of several classes (which will become tables) with various field types.

### Key Data Types in Parse and Supabase Equivalents:

| Parse Type            | Supabase/PostgreSQL Type                   | Notes -                                                                                                                                                     |
| --------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| String                | `TEXT`                                     | For general purpose strings. -                                                                                                                              |
| Number                | `INTEGER` or `NUMERIC`                     | `INTEGER` for whole numbers, `NUMERIC` or `FLOAT` for decimals. -                                                                                           |
| Boolean               | `BOOLEAN`                                  | Direct mapping. -                                                                                                                                           |
| Date                  | `TIMESTAMP WITH TIME ZONE` (`timestamptz`) | Supabase uses `timestamptz` by default for `created_at` fields. This is the best practice. -                                                                |
| Array                 | `TEXT[]` or `JSONB`                        | `TEXT[]` is suitable for simple arrays of strings. `JSONB` is more flexible if arrays contain objects or mixed types. For `tags`, `TEXT[]` is perfect. -    |
| Object                | `JSONB`                                    | `JSONB` is the standard and most efficient way to store JSON objects in PostgreSQL. -                                                                       |
| Pointer<`ClassName`>  | `UUID` with a Foreign Key Constraint       | A Pointer is a one-to-one or many-to-one relationship. This is modeled with a foreign key. The column will store the `id` (a UUID) of the related record. - |
| Relation<`ClassName`> | Junction Table (Many-to-Many)              | A Relation is a many-to-many relationship. This requires a separate "join" or "junction" table that links records from two other tables.                    |

### Special Parse Fields:

- `objectId`: Will be replaced by Supabase's primary key `id` (`UUID`).
- `createdAt`: Will be replaced by Supabase's `created_at` (`timestamptz`).
- `updatedAt`: Will be replaced by a custom `updated_at` field with a trigger to auto-update.
- `ACL`: Access Control Lists will be replaced by Supabase's Row Level Security (RLS) policies.

## 5. Application Code Changes

The application code will need to be updated to use the Supabase client SDKs instead of the Parse SDK.

- Replace `Parse.Query` with Supabase's query syntax (`supabase.from('table').select('*')`).
- Update authentication logic to use Supabase Auth. See `auth-plan.md` for the full discussion.
- Rewrite Cloud Code functions (`Parse.Cloud.define`, `Parse.Cloud.job`, `beforeSave`, `afterSave`) as Supabase Edge Functions or database functions/triggers.

## 6. Testing

- Thoroughly test the new implementation in a staging environment.
- Verify data integrity by comparing record counts and spot-checking data between the old and new databases.
- Test all application functionality, including user authentication, data creation/updates, and security policies (RLS).

## Migrating Functions

- Use **database triggers** for deterministic, synchronous, data-in/data-out mutations that (a) derive/normalize columns (e.g., building `search`, `book_lineage_array`, setting `has_bloom_pub`, enforcing tag normalization) and (b) light bookkeeping (timestamps, counters) that must succeed or fail with the transaction.
- Use **Edge Functions** (or an external worker) for side‑effects that can fail independently or need external APIs: sending new‑book emails, calling analytics APIs, long-running harvest/update jobs, batch recomputation tasks (`updateBookAnalytics`, `updateLanguageRecords`, `removeUnusedTags`). These map closely to your existing `Parse.Cloud.job` background jobs.
- Use **scheduled Edge Functions** (Supabase Scheduled Functions / external cron hitting an Edge endpoint) for the daily jobs now run in Azure: language usage counts, analytics refresh, tag cleanup.
- Avoid putting complex business logic that calls external HTTP services inside DB triggers; instead, have the trigger write a row to an "events" table (e.g., `book_events(type, book_id, payload, processed_at)`) and have an Edge Function (cron or realtime listener) process and mark them done. This preserves reliability and retry semantics.
- The former `beforeSave` / `afterSave` division becomes: (a) BEFORE/AFTER ROW triggers for pure data shaping; (b) Edge Function or event consumer for asynchronous effects.
- Authorization: rely on RLS policies; avoid embedding auth checks in triggers unless absolutely required (RLS runs first and is clearer).

Mapping example:
| Parse Construct | Supabase Replacement |
| --------------- | -------------------- |
| beforeSave books (normalize tags, lineage) | BEFORE ROW trigger on `books` |
| afterSave books (send email) | Event row + Edge Function worker |
| Cloud job updateBookAnalytics | Scheduled Edge Function + batched SQL updates |
| Cloud job updateLanguageRecords | Scheduled Edge Function (may call SQL functions) |
| setupTables | SQL migrations / migration scripts (Sqitch/Flyway/Supabase migrations) |
