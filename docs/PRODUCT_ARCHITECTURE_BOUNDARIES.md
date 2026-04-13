# Product Architecture Boundaries

## Doel

Deze notitie legt vast welke delen van Verisight gedeeld platform zijn en welke delen exclusief horen bij `ExitScan` of `RetentieScan`.

Doel van deze scheiding:

- wijzigingen in productinhoud van RetentieScan mogen ExitScan niet onbedoeld veranderen
- wijzigingen in productinhoud van ExitScan mogen RetentieScan niet onbedoeld veranderen
- gedeelde infrastructuur blijft bewust centraal beheerd

## Architectuurprincipe

Verisight is:

- een gedeeld platform
- met twee productspecifieke modules
- binnen dezelfde repo, deployment en tenantarchitectuur

Dat betekent:

- `ExitScan` en `RetentieScan` zijn geen aparte apps of aparte codebases
- `ExitScan` en `RetentieScan` hebben wel eigen inhoudelijke productlogica

## Gedeelde platformlaag

Deze onderdelen zijn bewust gedeeld en mogen door beide producten gebruikt worden:

- authenticatie en sessiebeheer
- organisaties, campaigns, respondents en survey_responses datamodel
- API-routing en orchestration
- e-mail delivery infrastructuur
- PDF-render engine en layouthelpers
- dashboard shell en generieke UI-bouwstenen
- middleware, navigatie en algemene marketing-shell
- generieke privacy- en segmentdrempels

Belangrijke gedeelde bestanden en mappen:

- [backend/main.py](C:\Users\larsh\Desktop\Business\Verisight\backend\main.py:1)
- [backend/report.py](C:\Users\larsh\Desktop\Business\Verisight\backend\report.py:1)
- [backend/scoring.py](C:\Users\larsh\Desktop\Business\Verisight\backend\scoring.py:1)
- [backend/products/shared](C:\Users\larsh\Desktop\Business\Verisight\backend\products\shared:1)
- [frontend/app/(dashboard)](<C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard):1>)
- [frontend/lib/products/shared](C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\products\shared:1)
- [templates/survey.html](C:\Users\larsh\Desktop\Business\Verisight\templates\survey.html:1)

## ExitScan-exclusieve laag

Deze onderdelen horen inhoudelijk alleen bij ExitScan:

- exit surveycopy en exitcontext
- exit scoring en interpretatie
- preventability-logica
- replacement-cost logica
- exit reasons, exit managementduiding en exit aanbevelingen
- exit rapportcopy en exit signalering

Belangrijke mappen:

- [backend/products/exit](C:\Users\larsh\Desktop\Business\Verisight\backend\products\exit:1)
- [frontend/lib/products/exit](C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\products\exit:1)
- [templates/survey/exit-context.html](C:\Users\larsh\Desktop\Business\Verisight\templates\survey\exit-context.html:1)

## RetentieScan-exclusieve laag

Deze onderdelen horen inhoudelijk alleen bij RetentieScan:

- retention surveycopy
- SDT-gebaseerd retentiesignaal
- bevlogenheid, vertrekintentie en stay-intent duiding
- retention signal profile
- retention rapportcopy en managementduiding
- retention dashboardcards en focusvragen

Belangrijke mappen:

- [backend/products/retention](C:\Users\larsh\Desktop\Business\Verisight\backend\products\retention:1)
- [frontend/lib/products/retention](C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\products\retention:1)
- [templates/survey/retention-signals.html](C:\Users\larsh\Desktop\Business\Verisight\templates\survey\retention-signals.html:1)

## Registry en routering

Productkeuze loopt centraal via registry-bestanden:

- backend: [backend/products/shared/registry.py](C:\Users\larsh\Desktop\Business\Verisight\backend\products\shared\registry.py:1)
- frontend: [frontend/lib/products/shared/registry.ts](C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\products\shared\registry.ts:1)

Regel:

- orchestration code routeert op `scan_type`
- orchestration code bevat geen productspecifieke methodiek of copy

## Compatibiliteitslaag

De volgende bestanden bestaan nog deels als facade voor achterwaartse compatibiliteit:

- [backend/scoring.py](C:\Users\larsh\Desktop\Business\Verisight\backend\scoring.py:1)
- [backend/scan_definitions.py](C:\Users\larsh\Desktop\Business\Verisight\backend\scan_definitions.py:1)
- [frontend/lib/scan-definitions.ts](C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\scan-definitions.ts:1)

Deze laag mag:

- doorverwijzen
- gedeelde constants exporteren
- oude imports compatibel houden

Deze laag mag niet:

- nieuwe productmethodiek huisvesten
- nieuwe productcopy introduceren
- nieuwe branchlogica verzamelen die eigenlijk in `exit` of `retention` thuishoort

## Wijzigingsregels

Gebruik deze regels bij toekomstige wijzigingen:

1. Nieuwe surveyvraag voor alleen RetentieScan:
   wijzig alleen retention-definitie en retention survey-partial.

2. Nieuwe exitrapportduiding:
   wijzig alleen `backend/products/exit/report_content.py`.

3. Nieuwe gedeelde schaal- of utilityfunctie:
   plaats in `backend/products/shared` of `frontend/lib/products/shared`.

4. Nieuwe dashboard-KPI voor slechts één product:
   voeg toe in de productspecifieke dashboardmodule, niet in de gedeelde page.

5. Nieuwe marketingcopy voor slechts één product:
   plaats in de productspecifieke definitie of contentbron, niet in generieke shared tekst zonder scan-context.

## Definitie van veilig gescheiden

De architectuur geldt als veilig gescheiden wanneer:

- ExitScan scoring kan wijzigen zonder RetentieScan scoringbestand aan te raken
- RetentieScan rapportcopy kan wijzigen zonder ExitScan rapportbestand aan te raken
- dashboardduiding per product uit een aparte adapter komt
- surveyblokken per product apart onderhoudbaar zijn
- gedeelde bestanden alleen infrastructuur of compatibiliteit bevatten

## Huidige eerlijke status

De huidige situatie is:

- modulair gescheiden op productlogica
- gedeeld op platforminfrastructuur
- geschikt voor verder doorontwikkelen binnen één repo

Nog steeds gedeeld en dus potentieel impactvol voor beide producten:

- database- en API-basis
- orchestration
- report rendering engine
- algemene dashboard shell
- middleware en deployment

Conclusie:

- productwijzigingen zijn nu grotendeels per productmodule af te bakenen
- platformwijzigingen kunnen nog steeds beide producten raken, en dat is bewust
