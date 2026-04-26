# Action Center Operating Model

Last updated: 2026-04-26
Status: active

## Purpose

Dit document legt vast hoe Verisight Action Center operationeel gebruikt als bounded follow-throughlaag naast dashboard en customer ops.

Gebruik altijd samen met:

- [ACTION_CENTER_CANON.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/ACTION_CENTER_CANON.md)
- [SOURCE_OF_TRUTH_CHARTER.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/SOURCE_OF_TRUTH_CHARTER.md)
- [CLIENT_OWNERSHIP_AND_FOLLOW_UP_CADENCE.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_OWNERSHIP_AND_FOLLOW_UP_CADENCE.md)
- [CLIENT_ONBOARDING_FLOW_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_FLOW_SYSTEM.md)
- [PILOT_LEARNING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/PILOT_LEARNING_PLAYBOOK.md)

## Core operating rule

Gebruik Action Center zodra een live route een expliciet dossier nodig heeft voor:

- eerste bounded stap
- expliciete eigenaar
- reviewmoment
- follow-upbesluit
- closeout of handoff

Gebruik Action Center niet voor:

- setup
- launch
- respondentimport
- klantactivatie
- generieke takenbakken
- brede projectsturing

## Welke laag gebruik je wanneer?

### Dashboard

Gebruik dashboard voor:

- campaignkeuze
- eerste managementread
- portfolio-overzicht
- rapport- en dashboardgebruik door klant of management

### Customer ops

Gebruik customer ops voor:

- organisatie- en campaignsetup
- delivery lifecycle en exceptions
- import-QA
- activatie en toegangsbevestiging
- operator next steps in uitvoering

### Action Center

Gebruik Action Center voor:

- dossier-first follow-through
- eigenaar-, review- en closurediscipline
- bounded vervolg per route
- learning handoff zodra een traject managementgebruik heeft geraakt

## Dossier opening triggers

Open of houd een Action Center-dossier actief als minimaal een van deze situaties geldt:

- first management use heeft een eerste stap opgeleverd
- er is reviewdruk zonder geplande reviewdatum
- er ontbreekt een expliciete eigenaar
- een bounded vervolgroute moet worden vastgelegd
- een closeoutbesluit ontbreekt nog
- een confirmed learning anders in losse notities zou blijven hangen

## Assignment rules

- Elk open dossier heeft maximaal een eerstvolgende bounded assignment als hoofdactie.
- Een assignmenttitel beschrijft een kleine, concrete vervolgstap en geen breed project.
- Zonder eerste stap blijft het dossier zichtbaar als `blocked_assignment`.
- Assignments horen alleen de states `queued`, `active`, `blocked`, `waiting`, `completed` of `cancelled` te gebruiken.
- Een assignment wordt `handoff` of `closure` zodra het dossier niet meer om analyse vraagt maar om expliciete afronding of routekeuze.

## Review rules

- Elk open dossier krijgt een expliciet reviewmoment.
- Default: binnen 10 werkdagen of eerder in een bestaand managementoverleg.
- Zonder reviewmoment blijft `review_due` open.
- Geparkeerde of verworpen dossiers annuleren reviewdruk expliciet; review verdwijnt niet stilzwijgend.
- De 30-90 dagen review blijft een aparte learninglaag en vervangt de eerste follow-upreview niet.

## Follow-up and closure rules

Een dossier mag pas dicht wanneer:

- managementactie-uitkomst, bounded next route of stopreden expliciet is vastgelegd
- learning handoff is bijgewerkt
- open eigenaar- of reviewsignalen zijn opgelost of bewust gesloten

Follow-up blijft dus open zolang:

- geen eigenaar vastligt
- geen eerste stap vastligt
- geen reviewmoment vastligt
- geen vervolguitkomst vastligt

## Governance and permissions

- Action Center blijft admin-first en owner-governed.
- `owner` mag assignments, reviewmomenten, signalen en closure bijwerken.
- `member` of `viewer` mag de follow-through lezen maar opent geen nieuwe productadapter.
- De permission envelope blijft bounded: geen generic planning, geen advisoryrechten en geen adapter-opening vanuit deze laag.

Nieuwe live consumers zijn alleen toegestaan wanneer:

1. de route al echt live in de runtime bestaat
2. de route een expliciete carriercontractlaag heeft
3. dit document en de canon bewust zijn bijgewerkt
4. andere toekomstige adapters expliciet inactief blijven

## Weekly cadence

Toets Action Center minimaal wekelijks op:

- `owner_missing`
- `blocked_assignment`
- `review_due`
- `decision_due`
- dossiers die al follow-up hebben maar nog geen closeout tonen

Werk daarna alleen de samenvatting door naar week- of maandreview. De Action Center-surface blijft primair.

## Cross-document handoff

- Trek terugkerende patronen door naar [MONTHLY_PHASE_REVIEW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/MONTHLY_PHASE_REVIEW.md).
- Trek casewaardige output pas door naar [CASE_PROOF_CAPTURE_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CASE_PROOF_CAPTURE_PLAYBOOK.md) als bewijsruimte echt hard genoeg is.
- Gebruik dashboard of customer ops niet als vervanging voor open Action Center-follow-through.
