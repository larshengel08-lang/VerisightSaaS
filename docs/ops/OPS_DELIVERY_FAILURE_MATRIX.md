# Ops Delivery Failure Matrix

Last updated: 2026-04-15
Status: active

## Purpose

Dit document maakt de huidige failure- en recoverylogica expliciet voor assisted delivery. Gebruik het naast de persistente delivery control op campagneniveau.

Belangrijke defaults:

- eerst signaleren in repo-surfaces, daarna pas in losse notities of klantcommunicatie
- gebruik `exception_status` op lead-, deliveryrecord- of checkpointniveau zodra recovery of escalatie nodig is
- houd manual-first recovery acceptabel, maar maak hem wel persistent zichtbaar
- verkoop geen "gladde" flow wanneer delivery of recovery feitelijk nog handmatig is

## Current failure modes

### 1. Lead notification failure

- Detectie:
  lead staat in `contact_requests` met `notification_sent = false` of fouttekst in `notification_error`
- Operator-signaal:
  zichtbaar in `/beheer/contact-aanvragen`
- Safe fallback:
  lead is al opgeslagen; delivery of learning hoeft niet te wachten op mailsucces
- Recovery:
  lead triageren, owner zetten, volgende stap noteren en waar nodig handmatig opvolgen
- Klantcommunicatie:
  alleen nodig als de inbound lead actief terugverwachting heeft

### 2. Import preview of import QA issues

- Detectie:
  importpreview geeft fouten, dubbelen of metadata-gaten
- Operator-signaal:
  upload preview in `/beheer` plus checkpoint `import_qa`
- Safe fallback:
  nog niet definitief importeren
- Recovery:
  corrigeer bestand, bevestig preview opnieuw en zet operator-note of checkpoint-note als er nuance nodig is
- Klantcommunicatie:
  nodig wanneer klantbestand inhoudelijk onbruikbaar is of extra metadata moet aanleveren

### 2A. Scan period mismatch

- Detectie:
  klant verwacht retrospectieve nulmeting terwijl campaign feitelijk live vanaf start is ingericht, of andersom
- Operator-signaal:
  intake, proposal of campaigninstellingen spreken elkaar tegen
- Safe fallback:
  geen impliciete aannames doen; eerst expliciet resetten wat de scanperiode is
- Recovery:
  scanperiode en route opnieuw bevestigen, eventuele deliveryverwachting corrigeren en zo nodig campagne-opzet aanpassen
- Klantcommunicatie:
  ja, direct; dit raakt de verwachting van uitkomst en timing

### 2B. Client input spec mismatch

- Detectie:
  klantbestand wijkt structureel af van de afgesproken kolommen, formaten of mappings
- Operator-signaal:
  preview klopt niet, import QA blijft hangen of `segment_deep_dive` is inhoudelijk niet veilig
- Safe fallback:
  niet importeren en niet "half goed" live zetten
- Recovery:
  klantaanlevering terugleggen op de vaste inputspecificatie, mapping expliciteren of scope terugschalen
- Klantcommunicatie:
  ja, wanneer extra metadata of bestandsherstel nodig is

### 3. Invite send gaps

- Detectie:
  respondenten zonder `sent_at`, of checkpoint `invite_readiness` nog niet bevestigd
- Operator-signaal:
  campaign health, delivery warnings en pending checkpoint op `/campaigns/[id]`
- Safe fallback:
  links bestaan pas echt na juiste import en bewuste invite-actie
- Recovery:
  invites opnieuw versturen of deliveryrecord op exception zetten
- Klantcommunicatie:
  nodig wanneer timing of livegangverwachting geraakt wordt

### 4. Client activation gaps

- Detectie:
  open `org_invites`, geen actieve klanttoegang of checkpoint `client_activation` blijft pending
- Operator-signaal:
  `/beheer`, `ClientAccessList` en delivery checkpoint
- Safe fallback:
  campaign kan inhoudelijk al opbouwen, maar klantactivatie telt nog niet als afgerond
- Recovery:
  activatiemail opnieuw sturen, exception noteren of expliciet wachten op klantinput
- Klantcommunicatie:
  ja, wanneer toegang of timing direct moet worden afgestemd

### 5. Report delivery gaps

- Detectie:
  first value is inhoudelijk dichtbij of bereikt, maar checkpoint `report_delivery` blijft pending
- Operator-signaal:
  delivery control op campaign en command-center signalen op `/beheer`
- Safe fallback:
  inhoudelijk beeld kan bestaan zonder dat delivery al als opgeleverd geldt
- Recovery:
  rapport handmatig controleren, operator-note zetten en delivery pas bevestigen na echte oplevering
- Klantcommunicatie:
  ja, als rapport of walkthrough later komt dan verwacht

### 6. First management use not yet confirmed

- Detectie:
  klanttoegang actief, maar checkpoint `first_management_use` nog pending
- Operator-signaal:
  adoptionstatus en checkpoint op `/campaigns/[id]`
- Safe fallback:
  first value mag al bereikt zijn, maar adoption is nog niet bewezen
- Recovery:
  bevestig eerste managementsessie, leg eerste eigenaar/vervolgstap vast of zet follow-up open
- Klantcommunicatie:
  ja, wanneer Verisight actief de eerste read of walkthrough begeleidt

## Exception language

Gebruik consequent:

- `none`: geen open recovery of escalatie
- `blocked`: delivery staat echt stil
- `needs_operator_recovery`: Verisight moet actief herstellen
- `awaiting_client_input`: klant moet eerst iets bevestigen of aanleveren
- `awaiting_external_delivery`: afhankelijk van mail, rapport, tool of andere externe laag

## Minimum operating rhythm

Controleer minimaal:

- open leads zonder duidelijke eigenaar of volgende stap
- deliveryrecords met `exception_status != none`
- pending checkpoints voor `client_activation`
- pending checkpoints voor `report_delivery`
- campaigns zonder bevestigde `first_management_use`
- follow-up die nog niet op `follow_up_decided` of `learning_closed` staat

## Source of truth

- leadniveau: `contact_requests`
- campaignniveau: `campaign_delivery_records`
- acceptance- en recoverycheckpoints: `campaign_delivery_checkpoints`
- learning en vervolguitkomst: `pilot_learning_dossiers` en `pilot_learning_checkpoints`
- actieve tranche: `docs/active/OPS_AND_DELIVERY_SYSTEM_PLAN.md`
