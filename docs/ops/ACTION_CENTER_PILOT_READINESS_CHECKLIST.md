# Action Center Pilot Readiness Checklist

Last updated: 2026-05-02  
Status: active

Gebruik deze checklist als bounded go / no-go gate voor een echte Action Center-pilot.

## 1. Critical browser flows

Moet aantoonbaar werken:

- HR opent een route vanuit post-scan context
- manager ziet de open route
- manager kan de bedoelde bounded eerste stap of actie opslaan
- opgeslagen state blijft zichtbaar na reload
- HR kan een route afsluiten
- HR kan een vervolgroute starten
- HR en manager kunnen directe lineage teruglezen

## 2. Authority-safe writes

Moet aantoonbaar authority-safe en server-validated zijn:

- route opening / manager assignment
- manager response write
- route closeout write
- route reopen write
- follow-up route creation write

## 3. Readback minimum

Moet zonder database-reconstructie leesbaar zijn:

- huidige routestatus
- gesloten versus actieve route
- directe voorganger of opvolger
- voldoende routecontext voor HR om een afdelingstraject uit te leggen

## 4. Support and recovery minimum

Moet bekend en herhaalbaar zijn:

- schema rollout pad
- verificatiepad na rollout
- recoverypad bij mislukte kritieke writes
- browser regressiepad voor de kernflows

## 5. Positioning check

Moet in demo en pilotuitleg helder zijn:

- Action Center start na scantruth
- Action Center is follow-through, niet generieke tasking
- HR en manager hebben elk een bounded rol

## Go / no-go rule

Niet pilot-ready als een van deze punten materieel instabiel is:

- kritieke browserflow
- authority-safe write path
- minimale lineage/readback
- support/recovery helderheid
