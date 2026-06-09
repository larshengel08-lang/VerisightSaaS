# LOEP_CORE_MATURITY_ROADMAP

Last updated: 2026-05-26  
Status: active  
Primary source of truth: this document for core maturity sequencing and stream governance.

## 1. Summary

Loep wordt niet volwassen door meer features toe te voegen.

Loep wordt volwassen door een klein commercieel oppervlak diep, rustig, coherent en herhaalbaar te maken.

De kern van die volwassenheid is nu:

- ExitScan
- RetentieScan
- dashboard
- PDF / formele output
- Action Center
- de setup/adminlaag die nodig is om deze keten herhaalbaar te laten werken

## 2. Core maturity thesis

Voor nu is Loep geen breed people platform.

Voor nu moet Loep voelen als:

- scherp
- compleet op klein oppervlak
- visueel rustig
- methodisch geloofwaardig
- bounded in opvolging
- herhaalbaar zonder founder-memory

Dat is de volwassenheidslat.

## 3. Stream governance

### Stream A - commercial core

Stream A bevat:

- ExitScan
- RetentieScan
- dashboard
- PDF / output
- Action Center
- admin/onboarding voor deze kern

### Stream B - background R&D

Stream B bevat:

- Engagement / MTO
- latere enterprise-architectuur
- bredere benchmark- of lifecyclelagen
- toekomstige productverbreding

### Hard rule

Stream A wint altijd van Stream B totdat de kern commercieel robuust is.

Dat betekent:

- Stream B mag Stream A niet blokkeren
- Stream B mag Stream A niet verbreden
- nieuwe productbreedte is geen excuus om kernruwheid te laten bestaan

## 4. Commercial truth to preserve

De kern moet binnen het bestaande commerciële model blijven:

- `ExitScan Baseline` en `RetentieScan Baseline` zijn de twee hoofdinstappen
- `Onboarding 30-60-90 Baseline` blijft secondary first-buy
- `Action Center Start` blijft bounded en optioneel
- `Pulse`, `Leadership`, `Combinatie` en andere vervolgroutes blijven secundair of later

Dus:

- geen nieuwe hoofdproducten
- geen brede suiteframing
- geen workflowplatformverhaal

## 5. Maturity layers

### Layer 1 - Product truth

ExitScan en RetentieScan moeten elk een harde, consistente productwaarheid hebben over:

- positionering
- methodiek
- survey
- scoring
- dashboard
- rapport
- commerciële taal

### Layer 2 - Core flow robustness

De kernflow mag geen halve states of uitleg-schuld meer hebben.

Gebruiker moet steeds begrijpen:

- waar ben ik
- wat zie ik
- wat betekent dit
- wat is nu de bounded volgende stap

### Layer 3 - Output trust

Dashboard en PDF moeten professioneel, consistent en deelbaar voelen.

Niet:

- theoretisch goed
- visueel rommelig
- inhoudelijk driftend

Wel:

- bestuurlijk bruikbaar
- visueel coherent
- claimsmatig geloofwaardig

### Layer 4 - Follow-through maturity

Action Center moet volwassen zijn als bounded management-opvolglaag.

Dat betekent:

- eigenaar
- eerste stap
- reviewmoment
- uitkomst
- closeout
- vervolgdiscipline

Later hoort hier ook outcome-linkage bij:

- thema -> actie -> volgende meting -> uitkomstduiding

### Layer 5 - Operational repeatability

Loep is pas echt commercieel robuust als:

- nieuwe klantopstart niet op Lars-geheugen leunt
- admin/setupflows herhaalbaar zijn
- acceptance-runs bestaan
- livegangsupport niet ad hoc voelt

## 6. Maturity phases

## Phase 0 - Canon lock

Doel:
stoppen met ad hoc verfijnen zonder vaste waarheid.

Definition of done:

- primary source set is vastgelegd
- stream governance is hard
- huidige maturity gaps zijn zichtbaar geordend

## Phase 1 - ExitScan and RetentieScan truth hardening

Doel:
beide producten inhoudelijk en commercieel strak trekken.

Focus:

- productbelofte
- claimsgrenzen
- survey/scoring/logica
- dashboardtaal
- rapporttaal
- buyer-facing consistentie

Definition of done:

- ExitScan leest als scherpe vertrekduiding
- RetentieScan leest als vroegsignaal op behoud
- geen drift naar brede survey, diagnose of predictor

## Phase 2 - Dashboard maturity

Doel:
dashboard laten voelen als professioneel managementinstrument.

Focus:

- informatiehierarchie
- visual quality
- lege states
- indicatief versus decision-ready verschil
- copy rust
- modulecoherentie

Definition of done:

- dashboard is in 30-60 seconden leesbaar
- geen zichtbare broken of half-af componenten
- geen technische of interne taal op de verkeerde plek

## Phase 3 - PDF and formal output maturity

Doel:
rapporten moeten deelbaar en geloofwaardig zijn zonder excuses.

Focus:

- rapportstructuur
- parity met dashboard
- executive readability
- branded proof
- claimsdiscipline

Definition of done:

- PDF voelt als echt managementdocument
- copy, structuur en methodiek zijn consistent
- output kan buyer-facing of intern gedeeld worden zonder schaamte

## Phase 4 - Action Center maturity

Doel:
bounded follow-through echt volwassen maken.

Focus:

- eigenaar
- eerste actie
- reviewmoment
- uitkomst
- closeout
- reopen / vervolgdiscipline

Later:

- outcome-linkage tussen acties en volgende meting

Definition of done:

- Action Center is geen taaklaagje, maar een echte bounded opvolgstructuur
- review en outcome zijn zichtbaar
- de laag blijft rustig en niet platformmatig

## Phase 5 - Admin and onboarding productization

Doel:
de kern herhaalbaar live kunnen zetten zonder heroics.

Focus:

- setup-hub
- admin clarity
- acceptance-rail
- smoke lanes
- klantflow
- respondentflow
- adminflow

Definition of done:

- nieuwe kernklant is herhaalbaar op te zetten
- operator burden is lager
- belangrijkste live-paden zijn auditbaar

## 7. Current gate

Huidige hoofdvraag:

**Is de kern al sterk genoeg om zonder voortdurende verfijning de eerste echte klanten te dragen?**

Voor nu is het antwoord:

- nog niet volledig
- maar ook niet meer een ideefase

Dus de actuele gate is:

**core maturity before controlled commercial rollout**

## 8. Current blocker classes

Gebruik deze classificatie in alle core reviews:

### Blocker

Breekt vertrouwen of livebruikbaarheid direct.

Voorbeelden:

- broken dashboardvisual
- incoherente output
- onduidelijke route of state
- Action Center dat follow-through niet echt vasthoudt

### High risk

Voelt te dun, te rommelig of te founder-dependent voor commerciële livegang.

### Medium risk

Werkt functioneel, maar oogt nog niet senior of coherent genoeg.

### Polish

Fijnslijpen zonder directe commerciële blokkade.

## 9. Acceptance criteria

De kern is commercieel robuust genoeg wanneer:

- ExitScan en RetentieScan inhoudelijk scherp en onderling duidelijk verschillend zijn
- dashboard geen ruwe randen of verwarrende states meer heeft
- PDF en dashboard elkaar inhoudelijk versterken
- Action Center bounded follow-through echt zichtbaar maakt
- setup/admin niet meer volledig op Lars-geheugen leunt
- er production-like smoke- of acceptance-checks zijn voor de kernflow

## 10. What not to do now

- geen nieuwe productverbreding als oplossing voor kernonvolwassenheid
- geen brede enterprise-integratiedromen als excuus om de kern niet af te maken
- geen workflowplatform bouwen onder de noemer Action Center
- geen nieuwe buyer-facing routes toevoegen die de kernwedge vertroebelen

## 11. Review rule for other threads

Elke thread die aan de kern werkt moet eerst teruggeven:

1. huidige staat
2. grootste maturity gap
3. waarom dat commercieel telt
4. wat geraakt wordt
5. wat expliciet niet geraakt wordt

Geen implementatie zonder die korte maturity-analyse.

## 12. Next three priorities

De eerstvolgende kernprioriteiten zijn:

1. de grootste dashboard- en outputgaten rangschikken op commerciële schade
2. ExitScan en RetentieScan productparity verder hard maken
3. Action Center naar zichtbare outcome- en reviewvolwassenheid brengen zonder platformdrift

## 13. Final principle

Loep wordt niet volwassen door eindeloos verfijnen.

Loep wordt volwassen door:

- één harde lat te kiezen
- scope te begrenzen
- zichtbare kernoppervlakken echt af te maken
- en alleen datgene te bouwen wat de commerciële kern sterker maakt
