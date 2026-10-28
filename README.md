# Lumière Internal Portal

A private portal for Lumière Digital Co to manage clients, projects, agreements and history. It's built with Next.js and Supabase, and hosted on Vercel.

## What it does
- **Dashboard:** client count, active projects, quoted pipeline, monthly care-plan income, upcoming launches and recent activity.
- **Clients:** contact and business details, status (prospect, active or past), notes, projects, documents and a full history.
- **Projects:** a board by stage (Lead → Quoted → Deposit paid → Building → Client review → Live → Care plan → Closed), with quote, deposit, balance, dates, domain, hosting and booking platform.
- **Documents:** agreements, quotes, invoices and briefs, stored privately (up to 25 MB each) and opened through short-lived secure links.
- **History:** recorded automatically when clients and projects are created, stages change, payments are marked and documents are added, plus your own notes.

## Security
- Only signed-in users listed in the `staff` table can see anything. This is enforced in the database (row level security), not just in the pages.
- Documents sit in a **private** storage bucket and are never publicly reachable.
- Public sign-ups should be turned off (see step 3), so nobody can create an account.
- Pages are marked noindex and can't be embedded in other sites.

## Your Supabase project
Already created and set up: **Lumiere Portal** (Sydney region), project ref `uhopcqdltsncefslslue`. Both migrations in `supabase/migrations` have been applied, and the security advisor shows only the expected staff-check notice.

- `NEXT_PUBLIC_SUPABASE_URL` = `https://uhopcqdltsncefslslue.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_B6H15I5XwG2hrQM3sXc_sw_BhzSXz9h`

These are public, browser-safe values. The secret and service-role keys are never needed by this app.

Remaining steps: 3, 4, 5, 6 and 7 below. Steps 1 and 2 are done.

## Set-up (one time)
1. **Create a Supabase project** just for Lumière, separate from TGS and Terravado, so client data stays isolated.
2. **Run the database set-up:** in Supabase, go to SQL Editor, paste the contents of `supabase/migrations/0001_lumiere_portal.sql` and click Run.
3. **Turn off public sign-ups:** in Authentication → Sign In / Providers, switch off "Allow new users to sign up".
4. **Create your login:** in Authentication → Users → Add user, enter your email and a strong password.
5. **Give yourself access:** in the SQL Editor, run the following with your email:
   ```sql
   insert into public.staff (user_id, full_name)
   select id, 'Kate' from auth.users where email = 'you@example.com';
   ```
6. **Deploy on Vercel:** import the GitHub repo, then add two environment variables from Supabase → Project Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the publishable or anon key, **never** the secret or service-role key)
7. **Turn on two-factor authentication for your Supabase account** (not the portal login), since it controls the data.

## Local development
```
cp .env.example .env.local   # then fill in the two values
npm install
npm run dev
```

## Backups
On Supabase's free plan, take regular exports: Database → Backups, or a scheduled `pg_dump`. Download the `documents` bucket occasionally too.
