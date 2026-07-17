-- Apply after update_vehicle_pricing_rules.sql.
begin;

-- A stored zero used to display as $0/min while the application silently charged
-- hourly_rate / 60. Persist the effective legacy rate so display and billing agree.
update public.vehicle_types
set price_per_minute_usd = round(price_per_hour_usd / 60.0, 2)
where price_per_minute_usd = 0;

-- Move the existing mislabeled weekday rush global rule to genuine Mon-Fri time
-- windows. This prevents an apparently scheduled rule from applying all day.
with rush_rule as (
  select max(multiplier) as multiplier
  from public.pricing_rules
  where is_active = true
    and lower(name) like '%weekday%rush%'
)
insert into public.time_multipliers (start_time, end_time, multiplier, day_of_week)
select time '06:00', time '10:00', rush_rule.multiplier, weekday.day_number
from rush_rule
cross join generate_series(1, 5) as weekday(day_number)
where rush_rule.multiplier is not null
  and not exists (
    select 1
    from public.time_multipliers existing
    where existing.start_time = time '06:00'
      and existing.end_time = time '10:00'
      and existing.day_of_week = weekday.day_number
      and existing.multiplier = rush_rule.multiplier
  );

update public.pricing_rules
set
  is_active = false,
  description = concat_ws(' ', nullif(description, ''), 'Migrated to Mon-Fri 06:00-10:00 Time Multipliers.')
where is_active = true
  and lower(name) like '%weekday%rush%';

-- A global 1x "normal" rule is mathematically inert and obscures which rules matter.
update public.pricing_rules
set
  is_active = false,
  description = concat_ws(' ', nullif(description, ''), 'Inactive because a 1x rule does not change fares.')
where is_active = true
  and multiplier = 1
  and lower(name) like '%normal%';

alter table public.pricing_rules
  drop constraint if exists pricing_rules_multiplier_positive;
alter table public.pricing_rules
  add constraint pricing_rules_multiplier_positive check (multiplier > 0) not valid;

alter table public.time_multipliers
  drop constraint if exists time_multipliers_multiplier_positive;
alter table public.time_multipliers
  add constraint time_multipliers_multiplier_positive check (multiplier > 0) not valid;

alter table public.time_multipliers
  drop constraint if exists time_multipliers_day_of_week_valid;
alter table public.time_multipliers
  add constraint time_multipliers_day_of_week_valid
  check (day_of_week between 0 and 6) not valid;

commit;
