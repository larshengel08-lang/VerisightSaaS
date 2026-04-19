# CLIENT_FIRST_VALUE_FLOW

Last updated: 2026-04-18  
Status: active  
Source of truth: client onboarding flow system, onboarding playbook and current delivery defaults.

## Titel

Commercial Architecture And Onboarding Flow Refinement - Client first-value flow

## Korte samenvatting

Deze flow zet de stap van routekeuze naar eerste bruikbare managementwaarde strak neer. De kern is dat first value pas telt als intake, setup, activatie en eerste leeslijn op elkaar aansluiten.

## Wat is geaudit

- [CLIENT_ONBOARDING_FLOW_SYSTEM.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_FLOW_SYSTEM.md)
- [CLIENT_ONBOARDING_PLAYBOOK.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_ONBOARDING_PLAYBOOK.md)
- [REPORT_TO_ACTION_PROGRAM_PLAN.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/REPORT_TO_ACTION_PROGRAM_PLAN.md)
- [PACKAGING_AND_ROUTE_LOGIC.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/active/PACKAGING_AND_ROUTE_LOGIC.md)

## Belangrijkste bevindingen

- De canonieke eerste-waarderoute staat inhoudelijk al, maar lag nog te verspreid over playbook en flowsysteem.
- First value is pas geloofwaardig als de klant weet wat al leesbaar is, wat nog indicatief is en welke eerste managementvraag volgt.
- De managed deliverydefault blijft belangrijk: Verisight bewaakt setup, importdiscipline en activatie voordat de klant waarde kan zien.

## Belangrijkste inconsistenties of risico's

- Zonder intake- en importdiscipline kan een te vroege first-value claim ontstaan op een te zwakke responsbasis.
- Zonder expliciete drempels kunnen dashboard en rapport te definitief gelezen worden terwijl de respons nog indicatief is.

## Beslissingen / canonvoorstellen

- First value begint na routekeuze met implementation intake, niet pas bij het eerste dashboardscherm.
- De canonieke volgorde is: intake -> campaign setup -> respondentimport QA -> uitnodiging/activatie -> eerste dashboardread -> rapportuitleg.
- Geen first-value claim zonder bruikbare responsbasis en expliciete duiding van indicatief versus steviger patroonbeeld.
- Dashboard en rapport moeten bij first value dezelfde leeslijn volgen.

## Concrete wijzigingen

- Nieuw bestand aangemaakt: [CLIENT_FIRST_VALUE_FLOW.md](/C:/Users/larsh/Desktop/Business/Verisight/docs/ops/CLIENT_FIRST_VALUE_FLOW.md)

## Flow

1. Rond implementation intake volledig af.
2. Bevestig scanmodus, scanperiode, doelgroep, metadata en eerste managementdoel.
3. Richt campaign en respondentimport gecontroleerd in.
4. Activeer klanttoegang en start de uitnodigingsroute.
5. Toets of de responsbasis veilig leesbaar is.
6. Begeleid de eerste dashboardread.
7. Leg de rapportuitleg op dezelfde managementleeslijn.
8. Markeer first value pas wanneer de klant de eerste managementvraag echt kan openen.

## Acceptance

- De klant kan inloggen en landt in de juiste route.
- Dashboard en rapport zijn bruikbaar binnen de geldende responsdrempels.
- De klant begrijpt wat nu leesbaar is, wat nog indicatief is en wat de eerste managementvraag wordt.

## Validatie

- De flow volgt de bestaande deliveryrealiteit in de onboardingplaybook.
- De flow maakt geen nieuwe self-service- of redesignveronderstellingen.

## Assumptions / defaults

- 0-4 responses = geen veilige detailweergave.
- 5-9 responses = indicatief beeld.
- 10+ responses = steviger patroonbeeld voor eerste managementduiding.
- De app-deliverylaag blijft leidend voor actieve trajecten; workbooks zijn spiegel, niet sturing.

## Next gate

Client report-to-action flow expliciteren van eerste read naar eigenaar, actie en reviewmoment.
