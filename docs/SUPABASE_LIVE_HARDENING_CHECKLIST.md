# Supabase Live Hardening Checklist

Gebruik deze checklist om de security- en schemafixes uit de laatste audit echt live te zetten.

## 1. SQL patch uitvoeren

Voer in `Supabase Dashboard -> SQL Editor` het bestand uit:

- [live_hardening_patch.sql](/C:/Users/larsh/Desktop/Business/Verisight/supabase/live_hardening_patch.sql)

Dit doet onder meer:
- `organization_secrets` toevoegen voor server-only API keys
- oude `organizations.api_key` migreren en verwijderen
- `delivery_mode` toevoegen aan `campaigns`
- organisatie-insert beperken tot Verisight-admins
- nieuwe organisaties automatisch een secret en owner-membership geven

## 2. Verificatiequeries

Run daarna deze checks:

```sql
select count(*) as organizations from public.organizations;
select count(*) as organization_secrets from public.organization_secrets;

select o.id, o.name
from public.organizations o
left join public.organization_secrets s on s.org_id = o.id
where s.org_id is null;
```

Verwachte uitkomst:
- `organization_secrets` is gelijk aan het aantal organisaties
- de laatste query geeft `0 rows`

## 3. RLS-verificatie

Controleer daarna handmatig:
- een normale klantgebruiker kan geen organisatie aanmaken
- een normale klantgebruiker kan geen `api_key` meer uitlezen via de `organizations` tabel
- bestaande dashboardflow werkt nog voor:
  - rapportdownload
  - respondentimport
  - uitnodigingen versturen

## 4. Env-check

Controleer dat deze envs gezet zijn:

### Backend
- `DATABASE_URL`
- `FRONTEND_URL`
- `BACKEND_URL`
- `RESEND_API_KEY`
- `BACKEND_ADMIN_TOKEN`

### Frontend
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 5. Redeploy

Na de SQL patch:
1. backend redeployen
2. frontend redeployen
3. daarna smoke test doen

## 6. Smoke test

Test minimaal:
1. admin maakt organisatie aan
2. admin maakt campaign aan
3. respondentimport werkt
4. survey submit werkt
5. dashboard stats werken
6. PDF-rapport werkt
7. klantinvite werkt

