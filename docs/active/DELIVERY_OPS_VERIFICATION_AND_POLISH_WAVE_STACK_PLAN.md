# DELIVERY_OPS_VERIFICATION_AND_POLISH_WAVE_STACK_PLAN.md

## 1. Summary

Dit document zet de toegestane wave-volgorde vast voor de smalle vervolgtrack `delivery / ops verification and polish`.

De intentie is expliciet:

- niet opnieuw het deliverymodel uitvinden
- niet opnieuw een grote hardening-track openen
- maar de al gebouwde assisted deliverylaag handmatig verifieren en klein polijsten totdat die betrouwbaar genoeg voelt voor dagelijks gebruik

Status:

- Plan status: completed
- Active source of truth after approval: dit document
- Build permission: allowed for wave 1 only
- Next allowed step: `WAVE_01_DELIVERY_OPERATOR_FLOW_VERIFICATION.md`

---

## 2. Wave Order

De enige toegestane volgorde is:

1. `WAVE_01_DELIVERY_OPERATOR_FLOW_VERIFICATION.md`
2. `WAVE_02_DELIVERY_EDGE_STATE_AND_SIGNALING_POLISH.md`
3. `WAVE_03_DELIVERY_CLOSEOUT_AND_DAILY_USE_BASELINE.md`

Er mogen geen extra waves tussen worden geschoven zonder nieuw plandocument.

---

## 3. Wave Intent

### Wave 1

Doel:

- de bestaande operatorflow daadwerkelijk nalopen
- bevestigen wat lokaal handmatig goed werkt
- scherp vastleggen waar de echte UX- of signalingfrictie nog zit

Belangrijk:

- dit is eerst een verification-wave
- alleen kleine correcties of polish met directe operatorreden zijn toegestaan

### Wave 2

Doel:

- de in wave 1 gevonden edge-state-, copy- en signalingproblemen klein maar expliciet gladtrekken

Belangrijk:

- geen nieuw model
- geen nieuwe platformlaag
- alleen polish binnen bestaande delivery / ops surfaces

### Wave 3

Doel:

- de dagelijkse gebruiksbaseline formeel sluiten
- de handmatige verification, polish-uitkomsten en resterende grenzen expliciet vastleggen

---

## 4. Allowed Surfaces

Deze track mag zich alleen richten op:

- [ops-delivery.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.ts)
- [ops-delivery.test.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/lib/ops-delivery.test.ts)
- [preflight-checklist.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/components/dashboard/preflight-checklist.tsx)
- [page.tsx](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/(dashboard)/campaigns/[id]/page.tsx)
- [route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/campaign-delivery/[id]/route.ts)
- [route.ts](/C:/Users/larsh/Desktop/Business/Verisight/frontend/app/api/campaign-delivery-checkpoints/[id]/route.ts)
- direct gekoppelde tests en kleine verification-supportbestanden

Niet toegestaan:

- brede dashboardrefactors
- marketing- of pricingwijzigingen
- nieuwe adminsystemen
- self-serve delivery-uitbouw

---

## 5. Verification Rules

De hele track moet expliciet aan deze regels voldoen:

- handmatige verificatie krijgt voorrang op alleen testgroen
- auth-protected operatorflows mogen niet als "geverifieerd" worden geclaimd zonder echte browser- of routecheck
- als volledige browserverificatie lokaal blokkeert op auth of omgeving, moet dat expliciet als resterende grens worden vastgelegd
- tests blijven ondersteunend, niet vervangend voor de verification-intentie

---

## 6. Acceptance Gates

Voor elke wave geldt:

- docs bijgewerkt
- code alleen gewijzigd als daar directe wave-reden voor is
- relevante tests groen
- relevante build/typecheck groen
- handmatige verificatie of expliciet vastgelegde verificatiegrens gedocumenteerd

Daarnaast geldt voor de track als geheel:

- geen scope-uitbreiding naar nieuwe producten of platformlagen
- assisted delivery blijft de operating truth
- daily-use betrouwbaarheid moet stijgen zonder meer conceptuele complexiteit

---

## 7. Next Allowed Step

Na dit document mag nu openen:

- `WAVE_01_DELIVERY_OPERATOR_FLOW_VERIFICATION.md`
