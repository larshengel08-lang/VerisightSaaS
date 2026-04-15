# LIVE_RELEASE_CHECKLIST

Standaard checklist voor Verisight-releases.

Doel:
- onderscheiden tussen `naar main gepusht` en `echt live bevestigd`
- livegang minder afhankelijk maken van geheugen of improvisatie
- voorkomen dat `PROMPT_CHECKLIST.xlsx` te vroeg als "live" wordt gemarkeerd

Gebruik deze checklist voor:
- website- en pricingwijzigingen
- productcopy en sales-copy releases
- dashboard- en rapportwijzigingen
- releases met frontend-only of frontend + backend impact

## 1. Release Type

Vink vooraf aan wat deze release raakt.

- [ ] Frontend only
- [ ] Backend only
- [ ] Frontend + backend
- [ ] Docs/admin only, geen live-impact

## 2. Pre-Release

- [ ] Relevante tests zijn lokaal gedraaid
- [ ] Relevante lint-checks zijn lokaal gedraaid
- [ ] Relevante build(s) zijn lokaal gedraaid
- [ ] Copy/trust/pricing parity checks zijn gedaan waar passend
- [ ] Scope is bewust beperkt gehouden tot het bedoelde traject
- [ ] `main` bevat de bedoelde wijziging
- [ ] `origin/main` is bijgewerkt

## 3. Deploy Verwachting

Gebruik de repo-architectuur als standaard:
- frontend -> Vercel
- backend -> Railway

- [ ] Bevestigd welke live-omgeving deze wijziging moet uitrollen
- [ ] Bevestigd of deploy automatisch hoort te starten na push naar `main`
- [ ] Eventuele handmatige redeploystap uitgevoerd als dat voor deze release nodig is

## 4. Deploy Status

### Frontend

- [ ] Vercel production deploy gestart
- [ ] Vercel production deploy geslaagd

### Backend

- [ ] Railway deploy gestart
- [ ] Railway deploy geslaagd

## 5. Live Smoke Check

Controleer altijd de echte productie-URL, niet alleen preview of localhost.

### Algemene bereikbaarheid

- [ ] `https://www.verisight.nl/` geeft correct response
- [ ] Relevante doelpagina('s) geven correct response
- [ ] Geen zichtbare 404/500/regressie op de geraakte routes

### Bewijsstrings

Controleer minimaal 3 tot 5 concrete strings die bewijzen dat juist deze release live staat.

Voorbeeld bij pricing/package-releases:
- [ ] nieuwe pricingheading zichtbaar
- [ ] nieuwe route-/packagewoorden zichtbaar
- [ ] oude vervangen copy niet meer zichtbaar
- [ ] CTA of choice-guide weerspiegelt de nieuwe structuur

Noteer hier de exacte strings of elementen:

- [ ] bewijs 1:
- [ ] bewijs 2:
- [ ] bewijs 3:
- [ ] bewijs 4:
- [ ] bewijs 5:

## 6. Functionele Validatie

Alleen invullen voor wat deze release echt raakt.

### Marketing / website

- [ ] homepage klopt live
- [ ] tarievenpagina klopt live
- [ ] aanpakpagina klopt live
- [ ] relevante productpagina('s) kloppen live

### Dashboard / app

- [ ] loginflow werkt nog
- [ ] dashboardroute rendert correct
- [ ] relevante campaign- of rapportroute werkt nog

### Backend / API

- [ ] healthcheck is groen
- [ ] relevante endpoint(s) reageren zonder regressie

## 7. Evidence

- [ ] link(s) naar gecontroleerde live URL's genoteerd
- [ ] korte notitie van wat live is bevestigd
- [ ] eventueel screenshot of deploy-link opgeslagen waar nuttig

Gebruik dit formaat:

- Datum:
- Release/traject:
- URL's gecontroleerd:
- Live bewijs:
- Opmerkingen:

## 8. Checklist Update

Pas `docs/prompts/PROMPT_CHECKLIST.xlsx` pas aan nadat livevalidatie echt rond is.

- [ ] statuskolom klopt
- [ ] live-kolom noemt expliciet:
  - gepusht naar `main`
  - datum
  - commit hash
  - of live wel of niet bevestigd is

Aanbevolen formuleringen:

- Repo-only afgerond:
  `Naar main gepusht op YYYY-MM-DD (commit); live-status niet lokaal geverifieerd.`
- Live bevestigd:
  `Live bevestigd op YYYY-MM-DD via productie-URL('s'); commit <hash>.`

## 9. Als Het Nog Niet Live Is

- [ ] controleer of production deploy nog loopt
- [ ] controleer of production wel van `main` deployt
- [ ] controleer deploy logs
- [ ] controleer caching/CDN
- [ ] bepaal of handmatige redeploy nodig is
- [ ] update checklist niet als "live bevestigd" zolang productie de oude versie toont

## 10. Definition Of Done

Een release is pas volledig live afgerond wanneer:

- [ ] code op `main` staat
- [ ] relevante deploy(s) geslaagd zijn
- [ ] productie-URL's de nieuwe wijziging aantoonbaar tonen
- [ ] `PROMPT_CHECKLIST.xlsx` correct onderscheid maakt tussen repo-afronding en live-bevestiging
