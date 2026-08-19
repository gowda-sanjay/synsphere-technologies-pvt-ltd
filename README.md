# Synsphere Technologies

Premium B2B technology website for Synsphere Technologies Pvt Ltd. Built with React, Vite, Framer Motion, React Router, Lucide React and Supabase.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

The site also runs without Supabase credentials in demo mode. The enquiry form validates locally and shows the success state. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to enable public Supabase queries and inserts. `VITE_SUPABASE_ANON_KEY` remains supported as a legacy fallback.

## Supabase

Run `supabase/schema.sql` in the Supabase SQL editor. It creates `enquiries`, `projects`, `services` and `contacts`, enables RLS, provisions the enquiry attachment bucket, and allows public enquiry/contact inserts without exposing private data. Set the authenticated user's `app_metadata.role` to `admin` before using the dashboard policies.

`/admin/login` uses `supabase.auth.signInWithPassword`. `/admin/dashboard` loads enquiries and projects, filters/searches enquiries, updates statuses, and supports project create/edit/delete through authenticated Supabase queries.

## Production

```bash
npm run lint
npm run build
```

Netlify is configured through `netlify.toml` with SPA fallback routing. Replace placeholder contact details, legal copy, domain metadata, and the text logo with the supplied brand asset before publication.
