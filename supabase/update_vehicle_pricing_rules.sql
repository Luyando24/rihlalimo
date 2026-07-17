-- Adds explicit metered-trip fields without changing hourly-service pricing.
begin;

alter table public.vehicle_types
  add column if not exists price_per_mile_usd decimal(10,2),
  add column if not exists price_per_minute_usd decimal(10,2) not null default 0,
  add column if not exists minimum_fare_usd decimal(10,2) not null default 0,
  add column if not exists wait_rate_per_minute_usd decimal(10,2) not null default 0,
  add column if not exists complimentary_wait_minutes integer not null default 10;

alter table public.vehicle_types
  drop constraint if exists vehicle_types_metered_rates_nonnegative;

alter table public.vehicle_types
  add constraint vehicle_types_metered_rates_nonnegative check (
    base_fare_usd >= 0
    and price_per_distance_usd >= 0
    and price_per_minute_usd >= 0
    and minimum_fare_usd >= 0
    and wait_rate_per_minute_usd >= 0
    and complimentary_wait_minutes >= 0
  ) not valid;

-- Uber Black-equivalent Sedan rate card.
update public.vehicle_types
set
  base_fare_usd = 12.00,
  price_per_distance_usd = 3.40,
  price_per_mile_usd = 3.40,
  distance_unit = 'mile',
  price_per_minute_usd = 0.55,
  minimum_fare_usd = 35.00,
  wait_rate_per_minute_usd = 1.25,
  complimentary_wait_minutes = 10
where name ilike '%sedan%';

-- Uber Black SUV-equivalent rate card.
update public.vehicle_types
set
  base_fare_usd = 22.00,
  price_per_distance_usd = 4.80,
  price_per_mile_usd = 4.80,
  distance_unit = 'mile',
  price_per_minute_usd = 0.75,
  minimum_fare_usd = 60.00,
  wait_rate_per_minute_usd = 1.75,
  complimentary_wait_minutes = 10
where name ilike '%suv%';

commit;
