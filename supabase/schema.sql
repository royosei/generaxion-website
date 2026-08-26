-- ============================================================
-- CLUB WEBSITE — SUPABASE SCHEMA
-- Run this whole file once in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. PROFILES
-- One row per member, linked 1:1 to Supabase's built-in auth.users table.
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  joined_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by logged-in members"
  on public.profiles for select
  using ( auth.role() = 'authenticated' );

create policy "Members can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'New Member'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. EVENTS
-- Anyone (even signed-out visitors) can see events — good for a public landing page.
-- Only logged-in members can create them (e.g. from a simple admin form later).
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  location text,
  event_date timestamp with time zone not null,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

alter table public.events enable row level security;

create policy "Events are viewable by everyone"
  on public.events for select
  using ( true );

create policy "Logged-in members can create events"
  on public.events for insert
  with check ( auth.uid() = created_by );

create policy "Members can edit their own events"
  on public.events for update
  using ( auth.uid() = created_by );


-- 3. RSVPS
-- Personalized, member-only data: this is what makes the dashboard worth logging into.
create table if not exists public.event_rsvps (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'going' check (status in ('going', 'interested', 'not_going')),
  created_at timestamp with time zone default now(),
  unique (event_id, user_id)
);

alter table public.event_rsvps enable row level security;

create policy "Members can view their own RSVPs"
  on public.event_rsvps for select
  using ( auth.uid() = user_id );

create policy "Members can create their own RSVPs"
  on public.event_rsvps for insert
  with check ( auth.uid() = user_id );

create policy "Members can update their own RSVPs"
  on public.event_rsvps for update
  using ( auth.uid() = user_id );

create policy "Members can delete their own RSVPs"
  on public.event_rsvps for delete
  using ( auth.uid() = user_id );


-- 4. SEED DATA (optional — feel free to delete these two lines later)
insert into public.events (title, description, location, event_date)
values
  ('Monthly Meetup', 'Our regular get-together — bring a friend!', 'Community Hall, Room 2', now() + interval '10 days'),
  ('Volunteer Day', 'Help us clean up the local park.', 'Riverside Park', now() + interval '24 days');
