# Case Proof Capture Playbook

Last updated: 2026-04-15
Status: active

## Purpose

Dit document beschrijft hoe Verisight internal-only learnings doorzet naar case-candidates, approved case-proof en reference-ready gebruik zonder sample-output, demo of validatie-output als marktbewijs te verkopen.

Belangrijke defaults:

- ExitScan blijft de primaire eerste case-proofroute.
- RetentieScan blijft complementair en verification-first.
- Anonieme of minimaal herleidbare proof komt eerder dan named proof.
- Sample-output blijft deliverable-proof en trustproof, geen case-proof.
- Geen buyer-facing claim zonder approval en provenance.

## Canonieke workflow

### 1. Start altijd in de learninglaag

- Gebruik `docs/ops/PILOT_LEARNING_PLAYBOOK.md` en `/beheer/klantlearnings` als bronlaag.
- Een klanttraject wordt pas case-relevant zodra meer vastligt dan een losse anekdote.
- Zonder dossier geen case-candidate.

### 2. Capture de minimale case-readiness velden

Leg minimaal vast:

- quote-potentie
- referentiepotentie
- outcome-kwaliteit
- toestemmingstatus
- approvalstatus
- claimbare observaties
- supporting artifacts
- eerste managementwaarde
- eerste actie
- reviewmoment
- vervolguitkomst

### 3. Kies een closure-status

- `lesson_only`: waardevol als interne les, niet als bewijs
- `internal_proof_only`: bruikbaar voor interne salesvoorbereiding, nog niet buyer-facing
- `sales_usable`: buyer-safe voor directe salescontext na claimcheck
- `public_usable`: geschikt voor buyer-facing inzet na volledige approval
- `rejected`: niet bruikbaar als case-proof

### 4. Gebruik de approvalflow expliciet

1. `draft`
2. `internal_review`
3. `claim_check`
4. `customer_permission`
5. `approved`

Pas buyer-facing gebruik toe vanaf `approved`.

### 5. Kies het juiste format

- mini-case: compacte salesproof met beperkte claimscope
- anonieme case: eerste publieke vorm wanneer named proof nog niet kan
- quote card: alleen bij expliciete quote-toestemming
- reference note: alleen voor warme dealcontext
- outcome summary: samenvatting van concrete uitkomsten binnen claimgrens
- objection-proof snippet: kort, herbruikbaar bewijsblok voor salesvragen

### 6. Houd surface-discipline vast

- Site, trust en pricing blijven sample-first totdat approved case-proof bestaat.
- Sales mag approved case-proof gebruiken binnen de vastgelegde claim boundary.
- Demo en showcase blijven illustratief en worden nooit geupgraded tot klantbewijs.

## Governance

- Eerst de learning capture op orde brengen.
- Daarna format en approvalstatus vastleggen.
- Daarna docs en buyer-facing surfaces aanpassen.
- Daarna tests draaien.
- Daarna `PROMPT_CHECKLIST.xlsx` bijwerken als administratieve sluiting.
