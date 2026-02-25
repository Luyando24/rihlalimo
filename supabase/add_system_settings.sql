-- Create System Settings Table
create table if not exists public.system_settings (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  value jsonb not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.system_settings enable row level security;

-- Drop existing policy if it exists to avoid errors
drop policy if exists "Admins can manage system settings" on system_settings;
create policy "Admins can manage system settings" on system_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Settings are viewable by everyone" on system_settings;
create policy "Settings are viewable by everyone" on system_settings for select using (true);

-- Insert default SMTP settings if not exists
insert into system_settings (key, value, description)
values ('smtp_settings', '{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "user": "",
  "pass": "",
  "from_email": "noreply@rihlalimo.com",
  "from_name": "Rihla Limo"
}', 'SMTP configuration for sending emails')
on conflict (key) do nothing;
