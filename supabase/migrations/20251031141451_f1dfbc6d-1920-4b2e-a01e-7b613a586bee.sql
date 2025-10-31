-- Create countdown_events table for admin-managed countdown events
create table public.countdown_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_date date not null,
  description text,
  is_active boolean default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.countdown_events enable row level security;

-- Everyone can view active countdown events
create policy "Anyone can view active countdown events"
on public.countdown_events
for select
using (is_active = true);

-- Only admins can insert countdown events
create policy "Admins can insert countdown events"
on public.countdown_events
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

-- Only admins can update countdown events
create policy "Admins can update countdown events"
on public.countdown_events
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete countdown events
create policy "Admins can delete countdown events"
on public.countdown_events
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
create trigger update_countdown_events_updated_at
before update on public.countdown_events
for each row
execute function public.update_updated_at_column();