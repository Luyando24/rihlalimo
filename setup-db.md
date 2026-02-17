# Database Setup Instructions

The application requires the database schema to be set up in Supabase.

1.  **Log in to Supabase Dashboard**: Go to [https://supabase.com/dashboard](https://supabase.com/dashboard).
2.  **Select Project**: Open the `rihla-limo` project.
3.  **Go to SQL Editor**: Click on the SQL icon in the left sidebar.
4.  **New Query**: Create a new query.
5.  **Copy Schema**: Copy the contents of the file `supabase/schema.sql` from this repository.
6.  **Run Query**: Paste the SQL into the editor and click "Run".

## Seeding Data
After setting up the schema, you can seed the database with initial vehicle types:

1.  Open a terminal in the project root.
2.  Run the seed script:
    ```bash
    npx tsx seed-vehicles.ts
    ```
    (Note: Ensure `.env.local` contains `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as needed. The script currently uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS).
