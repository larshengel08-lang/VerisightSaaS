# Supabase Auth setup voor Verisight

Deze map bevat de twee templates die nu passen bij de huidige Verisight-authflow:

- `supabase-magic-link-template.html`
- `supabase-reset-password-template.html`

## 1. SMTP settings

In `Supabase Dashboard -> Authentication -> Email -> SMTP settings`:

- `Host`: `smtp.resend.com`
- `Port`: `465`
- `Username`: `resend`
- `Password`: je actieve `RESEND_API_KEY`
- `Minimum interval per user`: `60`

Aanbevolen afzender:

- `Sender name`: `Verisight`
- `Sender email`: `hallo@verisight.nl`

Als `hallo@verisight.nl` in Resend nog niet als afzender geverifieerd is, gebruik tijdelijk:

- `Sender email`: `noreply@verisight.nl`

## 2. URL configuration

In `Supabase Dashboard -> Authentication -> URL Configuration`:

- `Site URL`: `https://www.verisight.nl`

Gebruik als redirect URLs minimaal:

- `https://www.verisight.nl/**`
- `https://verisight.nl/**`
- `http://localhost:3000/**`

Dat past bij de huidige codeflow:

- magic link uitnodiging -> `/auth/callback?next=/complete-account`
- reset password -> `/reset-password`

## 3. Email templates

In `Supabase Dashboard -> Authentication -> Email Templates`:

### Magic link

Gebruik:

- `supabase-magic-link-template.html`

Dit template hoort bij de huidige klantuitnodigingsflow vanuit:

- `frontend/app/api/org-invites/route.ts`

### Reset password

Gebruik:

- `supabase-reset-password-template.html`

Dit template hoort bij:

- `frontend/app/(auth)/forgot-password/page.tsx`

## 4. Belangrijke placeholders

Laat deze Supabase placeholders intact:

- `{{ .ConfirmationURL }}`
- `{{ .Data.full_name }}`
- `{{ .Data.organization_name }}`

## 5. Wat al in code is rechtgezet

De reset-passwordflow gebruikt nu:

- `/reset-password`

en niet meer:

- `/auth/reset-password`

Dat sluit nu aan op de echte route in de app.

## 6. Wat nog handmatig moet

Deze repo kan de templates en juiste waarden voorbereiden, maar niet zelfstandig live opslaan in Supabase zonder:

- dashboardtoegang
- of een Supabase management token

Dus het laatste stuk blijft:

1. SMTP velden invullen
2. URL configuration controleren
3. beide templates plakken
4. testmail sturen via:
   - klantuitnodiging
   - wachtwoord reset
