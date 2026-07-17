-- Apply this migration before deploying the server-authoritative Stripe flow.
-- Only the service-role backend may create bookings or update payment fields.
begin;

-- Guest checkout stores contact details directly on the booking.
alter table public.bookings
  alter column customer_id drop not null;

alter table public.bookings
  add column if not exists started_at timestamp with time zone,
  add column if not exists completed_at timestamp with time zone;

alter table public.bookings
  alter column payment_status set default 'unpaid';

alter table public.bookings
  drop constraint if exists bookings_payment_status_check;

alter table public.bookings
  add constraint bookings_payment_status_check
  check (payment_status in ('unpaid', 'paid', 'failed', 'cancelled', 'refunded'))
  not valid;

-- One Stripe PaymentIntent can represent only one booking and one payment row.
create unique index if not exists bookings_stripe_payment_intent_unique
  on public.bookings (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create unique index if not exists payments_stripe_payment_intent_unique
  on public.payments (stripe_payment_intent_id);

-- Out-of-order failure events must not overwrite a successful payment record.
create or replace function public.preserve_succeeded_payment_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.status = 'succeeded' and new.status <> 'succeeded' then
    new.status := old.status;
    new.amount := old.amount;
    new.currency := old.currency;
    new.booking_id := old.booking_id;
  end if;
  return new;
end;
$$;

drop trigger if exists preserve_succeeded_payment_status on public.payments;
create trigger preserve_succeeded_payment_status
before update on public.payments
for each row execute function public.preserve_succeeded_payment_status();

-- Client sessions must use server actions; they cannot choose protected booking
-- fields such as payment_status, price, or Stripe identifiers.
drop policy if exists "Customers can insert own bookings" on public.bookings;
revoke insert on public.bookings from anon, authenticated;
revoke update on public.bookings from anon, authenticated;

-- Drivers only need lifecycle timestamps/status, and only for paid assignments.
grant update (status, started_at, completed_at) on public.bookings to authenticated;

drop policy if exists "Drivers can view assigned bookings" on public.bookings;
create policy "Drivers can view paid assigned bookings"
on public.bookings
for select
to authenticated
using (
  driver_id = auth.uid()
  and payment_status = 'paid'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'driver'
  )
);

drop policy if exists "Drivers can update assigned bookings" on public.bookings;
create policy "Drivers can update paid assigned bookings"
on public.bookings
for update
to authenticated
using (
  driver_id = auth.uid()
  and payment_status = 'paid'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'driver'
  )
)
with check (
  driver_id = auth.uid()
  and payment_status = 'paid'
);

-- Discount usage is consumed only after the signed payment-success webhook.
create or replace function public.increment_discount_usage(discount_uuid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.discounts
  set current_uses = current_uses + 1
  where id = discount_uuid;
$$;

revoke all on function public.increment_discount_usage(uuid) from public, anon, authenticated;
grant execute on function public.increment_discount_usage(uuid) to service_role;

commit;
