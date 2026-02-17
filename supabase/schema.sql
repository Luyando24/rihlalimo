-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles (extends auth.users)
create type user_role as enum ('customer', 'driver', 'admin');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  role user_role default 'customer'::user_role,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- 2. Vehicle Categories / Types
create table public.vehicle_types (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- e.g., 'Premium Economy Sedan', 'Black SUV'
  description text,
  capacity_passengers int not null,
  capacity_luggage int not null,
  image_url text,
  base_fare_usd decimal(10,2) not null, -- Base price
  price_per_distance_usd decimal(10,2) not null,
  distance_unit text default 'km' check (distance_unit in ('mile', 'km')),
  price_per_hour_usd decimal(10,2) not null, -- For hourly services
  min_hours_booking int default 2,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.vehicle_types enable row level security;
create policy "Vehicle types are viewable by everyone" on vehicle_types for select using (true);
create policy "Admins can manage vehicle types" on vehicle_types for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 3. Vehicles (Physical Fleet)
create table public.vehicles (
  id uuid default uuid_generate_v4() primary key,
  vehicle_type_id uuid references public.vehicle_types(id) not null,
  make text not null, -- e.g. Mercedes-Benz
  model text not null, -- e.g. E-Class
  year int not null,
  license_plate text not null,
  color text,
  status text default 'active', -- active, maintenance, inactive
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.vehicles enable row level security;
create policy "Admins can manage vehicles" on vehicles for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Drivers can view vehicles" on vehicles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'driver')
);

-- 4. Drivers
create table public.drivers (
  id uuid references public.profiles(id) primary key, -- Linked to profile
  license_number text,
  status text default 'offline', -- online, offline, busy
  current_vehicle_id uuid references public.vehicles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.drivers enable row level security;
create policy "Admins can manage drivers" on drivers for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Drivers can view own record" on drivers for select using (
  auth.uid() = id
);
create policy "Drivers can update own status" on drivers for update using (
  auth.uid() = id
);

-- 5. Pricing Rules (Global Multipliers & Configs)
create table public.pricing_rules (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- e.g. 'Standard', 'Holiday', 'Rush Hour'
  description text,
  multiplier decimal(3,2) default 1.0,
  is_active boolean default false,
  effective_start timestamp with time zone,
  effective_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pricing_rules enable row level security;
create policy "Pricing rules viewable by everyone" on pricing_rules for select using (true);
create policy "Admins can manage pricing rules" on pricing_rules for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Hourly Rates
create table public.hourly_rates (
    id uuid default uuid_generate_v4() primary key,
    vehicle_type_id uuid references public.vehicle_types(id),
    rate_per_hour decimal(10,2) not null,
    min_hours int default 2,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.hourly_rates enable row level security;
create policy "Hourly rates viewable by everyone" on hourly_rates for select using (true);
create policy "Admins can manage hourly rates" on hourly_rates for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Airport Fees
create table public.airport_fees (
    id uuid default uuid_generate_v4() primary key,
    airport_code text not null, -- LAX, JFK
    fee_type text not null, -- pickup, dropoff
    amount decimal(10,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.airport_fees enable row level security;
create policy "Airport fees viewable by everyone" on airport_fees for select using (true);
create policy "Admins can manage airport fees" on airport_fees for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Time Multipliers
create table public.time_multipliers (
    id uuid default uuid_generate_v4() primary key,
    start_time time not null,
    end_time time not null,
    multiplier decimal(3,2) not null,
    day_of_week int, -- 0-6, null for every day
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.time_multipliers enable row level security;
create policy "Time multipliers viewable by everyone" on time_multipliers for select using (true);
create policy "Admins can manage time multipliers" on time_multipliers for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 6. Bookings
create type booking_status as enum ('pending', 'confirmed', 'assigned', 'en_route', 'in_progress', 'completed', 'cancelled');
create type service_type as enum ('point_to_point', 'hourly', 'airport_pickup', 'airport_dropoff');

create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.profiles(id) not null,
  driver_id uuid references public.drivers(id),
  vehicle_type_id uuid references public.vehicle_types(id) not null,
  
  service_type service_type not null,
  status booking_status default 'pending',
  
  pickup_location_address text not null,
  pickup_location_lat double precision,
  pickup_location_lng double precision,
  
  dropoff_location_address text,
  dropoff_location_lat double precision,
  dropoff_location_lng double precision,
  
  pickup_time timestamp with time zone not null,
  duration_minutes_estimated int,
  distance_km_estimated decimal(10,2),
  
  -- Financials
  total_price_calculated decimal(10,2) not null,
  payment_status text default 'unpaid', -- unpaid, paid, refunded
  stripe_payment_intent_id text,
  
  flight_number text, -- for airport pickup
  passenger_name text,
  passenger_phone text,
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookings enable row level security;

-- Policies for bookings
create policy "Customers can view own bookings" on bookings for select using (
  auth.uid() = customer_id
);
create policy "Customers can insert own bookings" on bookings for insert with check (
  auth.uid() = customer_id
);
create policy "Drivers can view assigned bookings" on bookings for select using (
  driver_id = auth.uid()
);
create policy "Drivers can update assigned bookings" on bookings for update using (
  driver_id = auth.uid()
);
create policy "Admins can view all bookings" on bookings for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update all bookings" on bookings for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);


-- 7. Payments
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) not null,
  amount decimal(10,2) not null,
  currency text default 'usd',
  stripe_payment_intent_id text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payments enable row level security;
create policy "Users can view own payments" on payments for select using (
  exists (select 1 from bookings where bookings.id = payments.booking_id and bookings.customer_id = auth.uid())
);
create policy "Admins can view all payments" on payments for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 8. Stripe Events (Audit Log)
create table public.stripe_events (
  id uuid default uuid_generate_v4() primary key,
  stripe_event_id text unique not null,
  type text not null,
  payload jsonb,
  processed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.stripe_events enable row level security;
create policy "Admins can view stripe events" on stripe_events for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Helper function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
