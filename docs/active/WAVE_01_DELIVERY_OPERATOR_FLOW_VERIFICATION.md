# WAVE_01_DELIVERY_OPERATOR_FLOW_VERIFICATION.md

## 1. Summary

Deze wave is de eerste toegestane uitvoeringsslice binnen `delivery / ops verification and polish`.

De focus ligt bewust niet op nieuwe deliveryfeatures, maar op het expliciet verifieren van de al gebouwde operatorflow.

Dat betekent:

- campaign-level delivery control nalopen
- lifecycle- en checkpointleesbaarheid toetsen
- bepalen welke delen al daily-use ready voelen
- de kleinste directe operatorfricties vastleggen en alleen oplossen als ze echt binnen deze verificatiewave passen

Status:

- Wave status: completed_green
- Scope status: verification
- Build permission: limited, alleen voor directe verification- of mini-polish-wijzigingen
- Next allowed step after green closeout: `WAVE_02_DELIVERY_EDGE_STATE_AND_SIGNALING_POLISH.md`

---

## 2. Verification Goal

Deze wave moet expliciet antwoord geven op:

1. Is de persistente delivery control begrijpelijk genoeg in echte operatorvolgorde?
2. Zijn de governance lanes voor launch, activatie, first value, output/management use en closeout direct leesbaar?
3. Zijn de belangrijkste warnings en blockers compact maar duidelijk genoeg?
4. Zit er UX-frictie in labels, copy of lane-structuur die een operator onnodig laat twijfelen?

---

## 3. Verification Scope

Te verifieren surfaces:

- [preflight-checklist.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/preflight-checklist.tsx)
- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- [route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/campaign-delivery/[id]/route.ts)
- [route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/campaign-delivery-checkpoints/[id]/route.ts)

Verificatievormen:

- code-path review
- test review
- lokale build / type / test gates
- handmatige browser- of routecheck waar lokaal haalbaar

---

## 4. Allowed Changes In This Wave

Wel toegestaan:

- kleine copy-polish
- kleine signal- of label-polish
- kleine ordering- of grouping-polish in bestaande delivery UI
- kleine testtoevoeging of testverscherping
- kleine route- of guardrail-fix als de verificatie daar direct om vraagt

Niet toegestaan:

- nieuw deliverymodel
- nieuwe lifecycle states
- nieuwe platformsurfaces
- brede herstructurering van dashboard of ops-architectuur

---

## 5. Verification Checklist

Deze wave is pas groen als minimaal is bevestigd:

- `npm test`
- `npm run build`
- `npx next typegen`
- `tsc --noEmit`
- handmatige lokale check van de delivery / ops control of een expliciet vastgelegde blocker waarom die lokale browserflow niet volledig haalbaar is

Daarnaast moet expliciet worden vastgelegd:

- wat wél handmatig geverifieerd is
- wat nog niet volledig handmatig geverifieerd kon worden
- welke mini-polish direct uit de verificatie voortkwam

---

## 6. Expected Output

Na deze wave moet duidelijk zijn:

- of de huidige operatorflow inhoudelijk klopt
- waar nog edge-state of signaling-polish nodig is
- of wave 2 echt nodig blijft, en zo ja op welke punten

---

## 7. Verification Result

Handmatig geverifieerd in deze wave:

- lokale homepage laadt op `http://127.0.0.1:3002/`
- loginroute laadt op `http://127.0.0.1:3002/login`
- protected route `/dashboard` redirect naar `/login`, wat de auth-gate bevestigt voor delivery / ops surfaces
- code-path review van de persistente delivery control, checkpointlane en save-routes

Build- en testgates:

- `npm test` -> groen (`115 passed`)
- `npm run build` -> groen
- `npx next typegen` -> groen
- `node node_modules\\typescript\\bin\\tsc --noEmit` -> groen

Directe mini-polish uit de verificatie:

- geen functionele flowfout gevonden in wave 1
- wel bevestigd dat operatorgerichte delivery-verificatie achter auth zit en dus zonder geldige sessie niet volledig browser-end-to-end kon worden afgerond
- wave 2 blijft nodig voor kleine signaling-polish op bestaande delivery / ops surfaces

Niet volledig handmatig geverifieerd:

- de ingelogde operatorflow binnen de auth-protected dashboardcampaignpagina
- echte checkpoint-save interacties in een geldige adminsessie

Waarom dat nog open staat:

- lokale browserverificatie bevestigde dat protected deliveryroutes correct achter login blijven
- er was in deze wave geen geldige lokale adminsessie om de volledige operatorflow eerlijk end-to-end te doorlopen

---

## 8. Closeout Rule

Deze wave mag alleen op `completed_green` als:

- verification werkelijk is uitgevoerd
- eventuele kleine polish-wijzigingen direct uit die verificatie voortkomen
- resterende beperkingen eerlijk zijn vastgelegd
