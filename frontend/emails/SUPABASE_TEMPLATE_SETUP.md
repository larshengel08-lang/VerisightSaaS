# Supabase e-mailtemplates voor Verisight

Deze bestanden horen erbij:

- [supabase-magic-link-template.html](C:/Users/larsh/Desktop/Business/Verisight/frontend/emails/supabase-magic-link-template.html)
- [supabase-reset-password-template.html](C:/Users/larsh/Desktop/Business/Verisight/frontend/emails/supabase-reset-password-template.html)

## Welke template hoort waar

- `Magic link`
  - gebruik: `supabase-magic-link-template.html`
  - voor de huidige klantuitnodigingsflow / accountactivatie
- `Reset password`
  - gebruik: `supabase-reset-password-template.html`
  - voor wachtwoordherstel door bestaande gebruikers

## Waar dit ingesteld moet worden

In Supabase Dashboard:

1. `Authentication`
2. `Email Templates`
3. Open `Magic link` en plak de inhoud van `supabase-magic-link-template.html`
4. Open `Reset password` en plak de inhoud van `supabase-reset-password-template.html`

## Belangrijke placeholders

- `{{ .ConfirmationURL }}` moet blijven staan
- `{{ .Data.full_name }}` en `{{ .Data.organization_name }}` zijn optioneel in de magic-linktemplate

## Belangrijke nuance

Deze repo kan het template hier voorbereiden, maar niet zelfstandig live in Supabase zetten zonder:

- dashboardtoegang
- of een Supabase management token / API-token

De inhoud staat dus klaar, maar het laatste stapje moet in Supabase zelf gebeuren.
