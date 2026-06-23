# Supabase Setup

This document outlines the schema and initial setup for the Supabase project.

## Supabase Schema Design

Below are the proposed `CREATE TABLE` statements for the Supabase database.

### `users` (Supabase Auth)

Supabase has a built-in `auth.users` table. We will link to this table. We can add a separate `profiles` table for public user data if needed, linked one-to-one with `auth.users`.

### `version`

```sql
CREATE TABLE public.version (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  min_desktop_version TEXT
);
```

### `books`

This is the largest and most complex table.

```sql
CREATE TABLE public.books (
  id TEXT PRIMARY KEY, -- legacy Parse objectId retained
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Foreign Keys
  uploader_id TEXT REFERENCES auth.users(id), -- if Supabase auth uses UUID keep as UUID; otherwise map parse user id -> auth user id

  -- Fields from Parse
  all_titles TEXT,
  authors TEXT[],
  base_url TEXT,
  book_instance_id TEXT UNIQUE,
  book_lineage TEXT,
  book_order TEXT,
  booklet_making_is_appropriate BOOLEAN,
  copyright TEXT,
  credits TEXT,
  current_tool TEXT,
  download_count INTEGER,
  download_source TEXT,
  experimental BOOLEAN,
  folio BOOLEAN,
  format_version TEXT,
  in_circulation BOOLEAN,
  draft BOOLEAN,
  isbn TEXT,
  keywords TEXT[],
  keyword_stems TEXT[],
  lang_pointers TEXT[],
  languages TEXT[],
  librarian_note TEXT,
  license TEXT,
  license_notes TEXT,
  page_count INTEGER,
  reader_tools_available BOOLEAN,
  search TEXT,
  show JSONB,
  has_bloom_pub BOOLEAN,
  suitable_for_making_shells BOOLEAN,
  suitable_for_vernacular_library BOOLEAN,
  summary TEXT,
  tags TEXT[],
  thumbnail TEXT,
  title TEXT,
  original_title TEXT,
  tools TEXT[],
  update_source TEXT,
  last_uploaded TIMESTAMPTZ,
  leveled_reader_level INTEGER,
  country TEXT,
  province TEXT,
  district TEXT,
  features TEXT[],
  publisher TEXT,
  original_publisher TEXT,
  publisher_book_id TEXT,
  phash_of_first_content_image TEXT,
  branding_project_name TEXT,
  book_lineage_array TEXT[],
  harvest_state TEXT,
  harvester_id TEXT,
  harvester_major_version INTEGER,
  harvester_minor_version INTEGER,
  harvest_started_at TIMESTAMPTZ,
  harvest_log TEXT[],
  internet_limits JSONB,
  imported_book_source_url TEXT,
  importer_name TEXT,
  importer_major_version INTEGER,
  importer_minor_version INTEGER,
  rebrand BOOLEAN,
  bloom_pub_version INTEGER,
  book_hash_from_images TEXT,

  -- Analytics Fields
  analytics_start_count INTEGER,
  analytics_finished_count INTEGER,
  analytics_shell_downloads INTEGER,
  analytics_pdf_downloads INTEGER,
  analytics_epub_downloads INTEGER,
  analytics_bloompub_downloads INTEGER,
  analytics_questions_in_book_count INTEGER,
  analytics_quizzes_taken_count INTEGER,
  analytics_mean_questions_correct_pct NUMERIC,
  analytics_median_questions_correct_pct NUMERIC,

  -- Soft-delete columns
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- Index for frequently queried columns
CREATE INDEX idx_books_book_instance_id ON public.books(book_instance_id);
CREATE INDEX idx_books_uploader_id ON public.books(uploader_id);
CREATE INDEX idx_books_tags ON public.books USING GIN(tags);
```

### Other Tables

```sql
CREATE TABLE public.download_history (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  book_id TEXT, -- legacy book objectId or convert to FK if desired
  user_ip TEXT
);

CREATE TABLE public.language (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ethnologue_code TEXT,
  iso_code TEXT UNIQUE,
  name TEXT,
  english_name TEXT,
  usage_count INTEGER
);

CREATE TABLE public.tag (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT UNIQUE
);

CREATE TABLE public.related_books (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  books_ids TEXT[] -- Assuming this stores an array of book objectIds
);

CREATE TABLE public.book_tombstones (
  book_id TEXT PRIMARY KEY,
  deleted_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.sync_state(
  source_table TEXT PRIMARY KEY,
  last_updated_at TIMESTAMPTZ NOT NULL,
  last_object_id TEXT
);
```

### Auto-update `updated_at` Trigger

This function and trigger should be created in Supabase to automatically update the `updated_at` column on any table that has one.

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to the 'books' table
CREATE TRIGGER on_books_updated
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- This trigger would need to be created for any other tables with an `updated_at` column.
```

### Auto-ID Generation for New Rows

To handle new records created directly in Supabase, we will set up automatic ID generation. This can be done as part of the initial table creation, before any data is synced.

A `DEFAULT` value for a column is only used when an `INSERT` statement does not provide a value for that column. Our sync process will always provide the explicit `id` from the Parse Server, so it will not be affected by this default. This approach is safer as it ensures that there is no time gap where new records might be created without an ID.

```sql
-- One-time setup (if not already created)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.generate_legacy_style_id()
RETURNS text LANGUAGE sql AS $$
  SELECT substring(
           regexp_replace(encode(gen_random_bytes(8),'base64'),'[^0-9A-Za-z]','','g')
           FROM 1 FOR 10
         );
$$;

ALTER TABLE public.books ALTER COLUMN id SET DEFAULT public.generate_legacy_style_id();
ALTER TABLE public.language ALTER COLUMN id SET DEFAULT public.generate_legacy_style_id();
ALTER TABLE public.tag ALTER COLUMN id SET DEFAULT public.generate_legacy_style_id();
ALTER TABLE public.related_books ALTER COLUMN id SET DEFAULT public.generate_legacy_style_id();
ALTER TABLE public.download_history ALTER COLUMN id SET DEFAULT public.generate_legacy_style_id();
ALTER TABLE public.version ALTER COLUMN id SET DEFAULT public.generate_legacy_style_id();
```

This default will not interfere with the sync process, which explicitly sets the ID for each record it inserts.

## ID STRATEGY SUMMARY

- **Goal**: Preserve externally referenced Parse `objectId` values and allow the database to generate new opaque short IDs.
- **Approach**:
  - All core tables use `id TEXT PRIMARY KEY`.
  - The `id` column has a `DEFAULT` value to generate new, short, opaque IDs for records created in Supabase.
  - The sync process will override this default by providing the legacy `objectId` from Parse, ensuring data integrity.
  - Supabase Auth users will have their own UUIDs. We will store the original Parse user id in a separate column if needed.
- **Rationale**: Minimizes transformation logic and avoids breaking existing external references.
