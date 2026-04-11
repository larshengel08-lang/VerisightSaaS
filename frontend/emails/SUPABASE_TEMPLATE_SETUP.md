# Supabase invite-template voor dashboardtoegang

Dit bestand hoort bij:

- [supabase-dashboard-invite-template.html](C:/Users/larsh/Desktop/Business/Verisight/frontend/emails/supabase-dashboard-invite-template.html)

## Wat dit template doet

- Verisight-styling in plaats van een generieke Supabase-mail
- duidelijke CTA om het account te activeren
- optionele personalisatie met:
  - `{{ .Data.full_name }}`
  - `{{ .Data.organization_name }}`

## Waar dit ingesteld moet worden

In Supabase Dashboard:

1. `Authentication`
2. `Email Templates`
3. Open het template voor de e-mail die door `signInWithOtp` wordt gebruikt
4. Vervang de HTML door de inhoud van `supabase-dashboard-invite-template.html`

## Belangrijke placeholders

- `{{ .ConfirmationURL }}` moet blijven staan
- `{{ .Data.full_name }}` en `{{ .Data.organization_name }}` zijn optioneel

## Belangrijke nuance

Deze repo kan het template hier voorbereiden, maar niet zelfstandig live in Supabase zetten zonder:

- dashboardtoegang
- of een Supabase management token / API-token

De inhoud staat dus klaar, maar het laatste stapje moet in Supabase zelf gebeuren.
