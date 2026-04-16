# REMOTE_PLATFORM_BACKUP_CHECKLIST

Praktische remote backup- en herstelchecklist voor Verisight.

Laatste update: 2026-04-16

Gebruik deze checklist naast de lokale baseline-backup uit:

- [BACKUP_AND_RECOVERY_BASELINE.md](C:\Users\larsh\Desktop\Business\Verisight\docs\ops\BACKUP_AND_RECOVERY_BASELINE.md)

## 1. Supabase

Doel:
- data
- schema
- auth-context
- storage of relevante configuratie niet alleen impliciet in productie laten bestaan

### Minimaal vastleggen

- [ ] projectnaam en project-id
- [ ] database host / project reference
- [ ] schema-migraties in repo zijn up-to-date
- [ ] laatste bruikbare database-export of backupdatum
- [ ] relevante storage buckets indien gebruikt
- [ ] auth/provider-config die niet volledig in code leeft

### Concreet controleren

- [ ] [supabase](C:\Users\larsh\Desktop\Business\Verisight\supabase) map is actueel
- [ ] migraties in [migrations](C:\Users\larsh\Desktop\Business\Verisight\migrations) zijn in lijn met live schema
- [ ] service role key en URL zijn veilig buiten de repo beheerd
- [ ] er is een actuele export of platform-backup beschikbaar

### Herstelminimum

- [ ] repo-migraties kunnen een schone omgeving opnieuw opbouwen
- [ ] laatste exportlocatie is bekend
- [ ] secrets zijn herstelbaar vanuit een veilige bron

## 2. Railway

Doel:
- backend deploycontext
- serviceconfig
- environment variables

### Minimaal vastleggen

- [ ] project/service naam
- [ ] welke service de backend draait
- [ ] welke branch of source deployed wordt
- [ ] actuele environment variables zijn gedocumenteerd of exporteerbaar
- [ ] redeploy-procedure is bekend

### Concreet controleren

- [ ] [railway.toml](C:\Users\larsh\Desktop\Business\Verisight\railway.toml) klopt nog met de live service
- [ ] backend env vars zijn bekend voor:
  - database
  - mail
  - admin token
  - OpenAI / externe providers waar relevant
- [ ] laatste geslaagde deploy is zichtbaar
- [ ] rollbackpad is bekend

### Herstelminimum

- [ ] je weet hoe je de backend opnieuw deployt vanaf `main`
- [ ] je weet welke env vars minimaal nodig zijn
- [ ] je weet hoe je backend logs en deploystatus terugvindt

## 3. Vercel

Doel:
- frontend projectcontext
- production deploypad
- env vars
- domein- en aliascontext

### Minimaal vastleggen

- [ ] projectnaam en team/context
- [ ] production deployt vanaf `main`
- [ ] relevante env vars zijn bekend
- [ ] custom domains en primaire URL zijn bekend
- [ ] preview versus production gedrag is duidelijk

### Concreet controleren

- [ ] [frontend/vercel.json](C:\Users\larsh\Desktop\Business\Verisight\frontend\vercel.json) klopt nog
- [ ] `.vercel` linkcontext is niet je enige bron van waarheid
- [ ] productie-URL's zijn bevestigd:
  - [www.verisight.nl](https://www.verisight.nl)
  - relevante subroutes
- [ ] laatste production deployment is bekend

### Herstelminimum

- [ ] je weet hoe je production deploystatus controleert
- [ ] je weet welke env vars nodig zijn voor frontend en interne admin-routes
- [ ] je weet hoe je een mislukte of oude deploy herstelt

## 4. Resend / Mail / Domein

Doel:
- contact- en notificatieflow herstelbaar houden

### Minimaal vastleggen

- [ ] welk afzenddomein is geverifieerd
- [ ] welke from-address actief hoort te zijn
- [ ] welke API key waar gebruikt wordt
- [ ] welk inbox-adres de leads of notificaties ontvangt

### Concreet controleren

- [ ] `EMAIL_FROM` en `CONTACT_EMAIL` zijn bekend
- [ ] verified domain in Resend klopt met de gebruikte afzender
- [ ] contactflow werkt of faalt in elk geval uitlegbaar
- [ ] belangrijke mailinstellingen zijn niet alleen in iemands hoofd bekend

### Herstelminimum

- [ ] je weet hoe je mailproblemen terugleidt naar:
  - verified domain
  - env vars
  - backendlogs
  - opgeslagen contactrequests

## 5. Remote Baseline Note

Leg per remote baseline minimaal vast:

- Datum:
- Verantwoordelijke:
- Supabase status:
- Railway status:
- Vercel status:
- Resend/mail status:
- Open punten:

## 6. Best Practice

- doe remote checks na grote checklistmijlpalen
- leg niet alleen secrets vast, maar vooral het herstelpad
- houd repo-backup en remote-checklist gescheiden
- beschouw een lokale backup pas als volledig wanneer ook deze remote checklist is nagelopen
