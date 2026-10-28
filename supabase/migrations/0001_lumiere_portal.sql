-- Lumière Internal Portal: initial schema
-- Clients, projects, documents (agreements, quotes, invoices), activity history.
-- Access is restricted to staff via row level security. Documents live in a private storage bucket.

create extension if not exists pgcrypto;

-- ---------- Staff allowlist ----------
create table if not exists public.staff (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

-- ---------- Types ----------
do $$ begin
  create type public.project_stage as enum ('lead','quoted','deposit_paid','building','review','live','care_plan','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.document_kind as enum ('agreement','quote','invoice','brief','other');
exception when duplicate_object then null; end $$;

-- ---------- Tables ----------
create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name  text,
  email         text,
  phone         text,
  website       text,
  address       text,
  abn           text,
  industry      text,
  source        text,
  status        text not null default 'prospect' check (status in ('prospect','active','past')),
  notes         text,
  created_by    uuid default auth.uid() references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null references public.clients(id) on delete cascade,
  name              text not null,
  package           text check (package in ('essential','bookings','custom','care_plan_only')),
  stage             public.project_stage not null default 'lead',
  quote_amount      numeric(10,2),
  deposit_amount    numeric(10,2),
  deposit_paid_on   date,
  balance_paid_on   date,
  start_date        date,
  target_launch     date,
  launched_on       date,
  domain            text,
  hosting           text,
  booking_platform  text,
  care_plan_monthly numeric(10,2),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  project_id   uuid references public.projects(id) on delete set null,
  title        text not null,
  kind         public.document_kind not null default 'other',
  signed_on    date,
  storage_path text not null unique,
  file_name    text,
  file_size    bigint,
  mime_type    text,
  uploaded_by  uuid default auth.uid() references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

create table if not exists public.activity (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  kind       text not null check (kind in ('note','created','stage_change','document','payment')),
  body       text not null,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists projects_client_idx  on public.projects(client_id);
create index if not exists projects_stage_idx   on public.projects(stage);
create index if not exists documents_client_idx on public.documents(client_id);
create index if not exists documents_project_idx on public.documents(project_id);
create index if not exists activity_client_idx  on public.activity(client_id, created_at desc);
create index if not exists activity_project_idx on public.activity(project_id, created_at desc);

-- ---------- updated_at ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists clients_touch on public.clients;
create trigger clients_touch before update on public.clients for each row execute function public.touch_updated_at();
drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();

-- ---------- Automatic history ----------
create or replace function public.stage_label(s public.project_stage)
returns text language sql immutable as $$
  select case s
    when 'lead' then 'Lead' when 'quoted' then 'Quoted' when 'deposit_paid' then 'Deposit paid'
    when 'building' then 'Building' when 'review' then 'Client review' when 'live' then 'Live'
    when 'care_plan' then 'Care plan' when 'closed' then 'Closed' end;
$$;

create or replace function public.log_client_created()
returns trigger language plpgsql as $$
begin
  insert into public.activity(client_id, kind, body) values (new.id, 'created', 'Client record created');
  return new;
end $$;

create or replace function public.log_project_change()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity(client_id, project_id, kind, body)
    values (new.client_id, new.id, 'created', 'Project "' || new.name || '" created at stage ' || public.stage_label(new.stage));
  else
    if new.stage is distinct from old.stage then
      insert into public.activity(client_id, project_id, kind, body)
      values (new.client_id, new.id, 'stage_change', '"' || new.name || '" moved from ' || public.stage_label(old.stage) || ' to ' || public.stage_label(new.stage));
    end if;
    if new.deposit_paid_on is not null and old.deposit_paid_on is null then
      insert into public.activity(client_id, project_id, kind, body)
      values (new.client_id, new.id, 'payment', 'Deposit received for "' || new.name || '"');
    end if;
    if new.balance_paid_on is not null and old.balance_paid_on is null then
      insert into public.activity(client_id, project_id, kind, body)
      values (new.client_id, new.id, 'payment', 'Balance received for "' || new.name || '"');
    end if;
  end if;
  return new;
end $$;

create or replace function public.log_document_added()
returns trigger language plpgsql as $$
begin
  insert into public.activity(client_id, project_id, kind, body)
  values (new.client_id, new.project_id, 'document', 'Document added: ' || new.title);
  return new;
end $$;

drop trigger if exists clients_log on public.clients;
create trigger clients_log after insert on public.clients for each row execute function public.log_client_created();
drop trigger if exists projects_log on public.projects;
create trigger projects_log after insert or update on public.projects for each row execute function public.log_project_change();
drop trigger if exists documents_log on public.documents;
create trigger documents_log after insert on public.documents for each row execute function public.log_document_added();

-- ---------- Row level security: staff only ----------
alter table public.staff     enable row level security;
alter table public.clients   enable row level security;
alter table public.projects  enable row level security;
alter table public.documents enable row level security;
alter table public.activity  enable row level security;

drop policy if exists staff_read on public.staff;
create policy staff_read on public.staff for select to authenticated using (public.is_staff());

drop policy if exists clients_staff on public.clients;
create policy clients_staff on public.clients for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists projects_staff on public.projects;
create policy projects_staff on public.projects for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists documents_staff on public.documents;
create policy documents_staff on public.documents for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists activity_staff on public.activity;
create policy activity_staff on public.activity for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------- Private document storage ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('documents', 'documents', false, 26214400)
on conflict (id) do nothing;

drop policy if exists documents_bucket_read on storage.objects;
create policy documents_bucket_read on storage.objects for select to authenticated
  using (bucket_id = 'documents' and public.is_staff());
drop policy if exists documents_bucket_insert on storage.objects;
create policy documents_bucket_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and public.is_staff());
drop policy if exists documents_bucket_update on storage.objects;
create policy documents_bucket_update on storage.objects for update to authenticated
  using (bucket_id = 'documents' and public.is_staff());
drop policy if exists documents_bucket_delete on storage.objects;
create policy documents_bucket_delete on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and public.is_staff());
