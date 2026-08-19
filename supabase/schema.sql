create extension if not exists "pgcrypto";

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(), name text not null, company_name text, email text not null,
  phone text, country text, service text not null, budget text, timeline text, project_description text not null,
  attachment_url text, source text, status text not null default 'New', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), title text not null, description text not null, category text,
  technologies text[] default '{}', image_url text, featured boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(), name text not null, description text not null, icon text, created_at timestamptz not null default now()
);
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text, message text not null, created_at timestamptz not null default now()
);
create table if not exists public.website_statistics (
  id uuid primary key default gen_random_uuid(), stat_key text not null unique, stat_value text not null,
  stat_label text not null, display_order integer not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

insert into public.website_statistics (stat_key, stat_value, stat_label, display_order) values
  ('projects_shipped', '50+', 'PROJECTS SHIPPED', 1),
  ('business_partners', '20+', 'BUSINESS PARTNERS', 2),
  ('countries_reached', '10+', 'COUNTRIES REACHED', 3),
  ('client_satisfaction', '99%', 'CLIENT SATISFACTION', 4)
on conflict (stat_key) do nothing;

alter table public.enquiries enable row level security;
alter table public.projects enable row level security;
alter table public.services enable row level security;
alter table public.contacts enable row level security;
alter table public.website_statistics enable row level security;

drop policy if exists "Public can create enquiries" on public.enquiries;
create policy "Public can create enquiries" on public.enquiries for insert to anon, authenticated with check (true);
drop policy if exists "Public can view projects" on public.projects;
drop policy if exists "Public can view services" on public.services;
drop policy if exists "Public can create contacts" on public.contacts;
create policy "Public can create contacts" on public.contacts for insert to anon, authenticated with check (true);
drop policy if exists "Public can read website statistics" on public.website_statistics;
create policy "Public can read website statistics" on public.website_statistics for select to anon, authenticated using (true);

-- Admin policies should be tightened to an allow-listed admin role before production.
drop policy if exists "Admins manage enquiries" on public.enquiries;
create policy "Admins manage enquiries" on public.enquiries for all to authenticated using (lower(auth.email()) = 'sanjaygowdaca5@gmail.com') with check (lower(auth.email()) = 'sanjaygowdaca5@gmail.com');
drop policy if exists "Admins manage projects" on public.projects;
create policy "Admins manage projects" on public.projects for all to authenticated using (lower(auth.email()) = 'sanjaygowdaca5@gmail.com') with check (lower(auth.email()) = 'sanjaygowdaca5@gmail.com');
drop policy if exists "Admins view contacts" on public.contacts;
create policy "Admins view contacts" on public.contacts for select to authenticated using (lower(auth.email()) = 'sanjaygowdaca5@gmail.com');
drop policy if exists "Admins manage services" on public.services;
create policy "Admins manage services" on public.services for all to authenticated using (lower(auth.email()) = 'sanjaygowdaca5@gmail.com') with check (lower(auth.email()) = 'sanjaygowdaca5@gmail.com');
drop policy if exists "Admins manage website statistics" on public.website_statistics;
create policy "Admins manage website statistics" on public.website_statistics for all to authenticated using (lower(auth.email()) = 'sanjaygowdaca5@gmail.com') with check (lower(auth.email()) = 'sanjaygowdaca5@gmail.com');

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists enquiries_updated_at on public.enquiries;
create trigger enquiries_updated_at before update on public.enquiries for each row execute procedure public.set_updated_at();
drop trigger if exists website_statistics_updated_at on public.website_statistics;
create trigger website_statistics_updated_at before update on public.website_statistics for each row execute procedure public.set_updated_at();

insert into storage.buckets (id, name, public) values ('enquiry-attachments', 'enquiry-attachments', true)
on conflict (id) do nothing;
update storage.buckets set public = false where id = 'enquiry-attachments';
drop policy if exists "Public can upload enquiry attachments" on storage.objects;
create policy "Public can upload enquiry attachments" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'enquiry-attachments');
drop policy if exists "Public can read enquiry attachments" on storage.objects;
drop policy if exists "Admins can read enquiry attachments" on storage.objects;
create policy "Admins can read enquiry attachments" on storage.objects for select to authenticated
using (bucket_id = 'enquiry-attachments' and lower(auth.email()) = 'sanjaygowdaca5@gmail.com');
