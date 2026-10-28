-- Website contact form submissions. Visitors (anon) may only insert the form fields.
create table if not exists public.enquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 200),
  business   text check (char_length(business) <= 200),
  email      text not null check (char_length(email) between 3 and 320 and position('@' in email) > 1),
  phone      text check (char_length(phone) <= 50),
  package    text check (char_length(package) <= 50),
  message    text check (char_length(message) <= 5000),
  source     text not null default 'website',
  status     text not null default 'new' check (status in ('new','contacted','converted','archived')),
  client_id  uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists enquiries_status_idx on public.enquiries(status, created_at desc);

alter table public.enquiries enable row level security;

revoke all on public.enquiries from anon;
grant insert (name, business, email, phone, package, message) on public.enquiries to anon;

drop policy if exists enquiries_public_insert on public.enquiries;
create policy enquiries_public_insert on public.enquiries for insert to anon
  with check (status = 'new' and client_id is null and source = 'website');

drop policy if exists enquiries_staff on public.enquiries;
create policy enquiries_staff on public.enquiries for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
