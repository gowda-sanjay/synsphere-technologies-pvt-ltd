# Synsphere Technologies

Premium B2B technology website for Synsphere Technologies Pvt Ltd. Built with React, Vite, Framer Motion, React Router, Lucide React and Supabase.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

The site also runs without Supabase credentials in demo mode. Add `VITE_SUPABASE_URL` and the browser-safe `VITE_SUPABASE_ANON_KEY` to enable public Supabase queries and inserts. `VITE_SUPABASE_PUBLISHABLE_KEY` is supported as a fallback. Never expose a `service_role` key in frontend or Netlify environment variables.

## Supabase

Run `supabase/schema.sql` in the Supabase SQL editor. It creates `enquiries`, `projects`, `services` and `contacts`, enables RLS, provisions the enquiry attachment bucket, and allows public enquiry/contact inserts without exposing private data. The current admin policy allow-lists the authenticated email `sanjaygowdaca5@gmail.com`; it does not use a custom admin table or `app_metadata.role`.

`/admin/login` uses `supabase.auth.signInWithPassword`. `/admin/dashboard` loads enquiries and projects, filters/searches enquiries, updates statuses, and supports project create/edit/delete through authenticated Supabase queries.

## Production

```bash
npm run lint
npm run build
```

Netlify is configured through `netlify.toml` with SPA fallback routing. Replace placeholder contact details, legal copy, domain metadata, and the text logo with the supplied brand asset before publication.
