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

Run `supabase/schema.sql` in the Supabase SQL editor. It creates `enquiries`, `projects`, `services`, `contacts` and `website_statistics`, enables RLS, provisions the enquiry attachment bucket, allows public enquiry/contact inserts, and allows public reads of projects, services and website statistics. The current admin policies allow-list the authenticated email `sanjaygowdaca5@gmail.com`; they do not use a custom admin table or `app_metadata.role`.

`/login` and `/signup` use Supabase email/password authentication. `/dashboard` shows the signed-in user's own account details. No user profile database table is required. `/admin/login` uses the existing admin-only sign-in and `/admin/dashboard` loads enquiries and projects, filters/searches enquiries, updates statuses, and supports project create/edit/delete through authenticated Supabase queries.

Configure Supabase Auth's site URL and redirect allow-list for both the local development origin and the production domain. Public signup and contact submissions require the Supabase project to be configured and the schema/policies above to be applied.

## Production

```bash
npm run lint
npm run build
```

Netlify is the configured hosting platform (`netlify.toml` sets `npm run build`, publishes `dist`, and provides SPA fallback routing). Set `VITE_SUPABASE_URL` and either `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` in the Netlify site environment before deploying; these are public browser credentials protected by Supabase RLS, not secret service-role credentials. `VITE_COMPANY_EMAIL` and `VITE_COMPANY_PHONE` are optional. Never add a Supabase `service_role` key to frontend code or Netlify client build variables.

For deployment, configure the Supabase Auth site URL and redirect allow-list for the local origin and production domain, ensure email/password sign-up and email confirmation settings match the intended onboarding, apply the current `supabase/schema.sql`, and provision the allow-listed admin account. After deploying, add the production URL to Supabase Auth redirects and test sign-up, sign-in, contact submissions, public content reads, and admin access.

This JavaScript project has no standalone type-check script. Before publication, replace and review placeholder legal content, confirm the official domain/metadata and brand assets, and verify Supabase Auth redirects, database schema/policies, and admin access in the production Supabase project.
