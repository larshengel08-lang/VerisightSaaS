-- Migration: sta 'owner' toe in org_invites.role
-- Datum: 2026-07-11
-- Uitvoeren in: Supabase Dashboard -> SQL Editor
-- Additief en idempotent.
--
-- org_invites.role had een check-constraint die alleen 'member' en 'viewer'
-- toestond. org_members.role (het lidmaatschap dat hieruit ontstaat via
-- accept_org_invites_for_current_user) staat 'owner' wel al toe. Zonder deze
-- fix faalt elke uitnodiging met role: 'owner' met een 500
-- ("Uitnodiging kon niet worden opgeslagen").

do $$ begin
  alter table public.org_invites
    drop constraint if exists org_invites_role_check;
  alter table public.org_invites
    add constraint org_invites_role_check
    check (role in ('owner', 'member', 'viewer'));
exception when others then null;
end $$;
