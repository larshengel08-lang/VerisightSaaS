-- Verisight contact notification diagnostics patch
-- Uitvoeren in Supabase SQL Editor
-- Doel:
-- 1. notification_error opslaan op contact_requests
-- 2. sneller live kunnen zien waarom kennismaakmails niet aankomen

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'contact_requests' and column_name = 'notification_error'
  ) then
    alter table public.contact_requests add column notification_error text;
  end if;
end $$;
