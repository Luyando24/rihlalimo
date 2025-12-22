-- Helper function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role public.user_role;
begin
  -- Determine role from metadata, default to customer if not valid or missing
  user_role := (new.raw_user_meta_data->>'role')::public.user_role;
  
  if user_role is null then
    user_role := 'customer';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', user_role);
  
  return new;
exception when others then
  -- Fallback in case of enum cast error
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;
