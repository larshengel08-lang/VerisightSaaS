# Supabase Auth setup voor Loep

Deze map bevat de twee templates die passen bij de huidige Loep-authflow:

- `supabase-magic-link-template.html`
- `supabase-reset-password-template.html`

## 1. SMTP settings

In `Supabase Dashboard -> Authentication -> Email -> SMTP settings`:

- `Host`: `smtp.resend.com`
- `Port`: `465`
- `Username`: `resend`
- `Password`: je actieve `RESEND_API_KEY`
- `Minimum interval per user`: `60`

Afzender:

- `Sender name`: `Loep`
- `Sender email`: `hallo@getloep.nl`

getloep.nl is in Resend geverifieerd (SPF/DKIM), dus `hallo@getloep.nl` kan direct als afzender.
Dezelfde afzender staat als vangnet in de code (`backend/email.py`, `frontend/lib/email.ts`,
`frontend/app/api/contact/route.ts`); in productie zetten de env-vars `EMAIL_FROM`
(Vercel en Railway, verpakte vorm `Loep <hallo@getloep.nl>`) en `LOEP_FROM_EMAIL`
(Vercel, kale vorm `hallo@getloep.nl`) de afzender.

## 2. URL configuration

In `Supabase Dashboard -> Authentication -> URL Configuration`:

- `Site URL`: `https://www.getloep.nl`

Gebruik als redirect URLs minimaal:

- `https://www.getloep.nl/**`
- `https://getloep.nl/**`
- `http://localhost:3000/**`

Staat een redirect niet op deze lijst, dan negeert Supabase hem en valt terug op de Site URL;
de link landt dan op de homepage in plaats van in de app.

Dat past bij de huidige codeflow:

- magic link uitnodiging -> `/complete-account`
- reset password -> `/reset-password`

## 3. Email templates

In `Supabase Dashboard -> Authentication -> Email Templates`:

### Magic link

Gebruik:

- `supabase-magic-link-template.html`

Onderwerpregel: `Je activatielink voor Loep`.

Dit template hoort bij de klantuitnodigingsflow vanuit:

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

De reset-passwordflow gebruikt:

- `/reset-password`

en niet meer:

- `/auth/reset-password`

Dat sluit aan op de echte route in de app.

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
