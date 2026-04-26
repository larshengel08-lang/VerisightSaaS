# SUITE_PACKAGING_AND_ROLLOUT_LOGIC.md

Last updated: 2026-04-26
Status: active
Source of truth: pricing and packaging plan, product family model, operations contract and commercial closeout.

## 1. Summary

Dit document legt de suitebrede regels vast voor packaging, activatie en rollout van productlijnen en modules.

## 2. Packaging rules

### Kernroutes

First-buy packaging mag nu alleen kerngewicht geven aan:

- ExitScan
- RetentieScan

### Bounded peers and vervolgroutes

Onboarding 30-60-90, Pulse en Leadership krijgen:

- bounded vervolggewicht
- geen peerstatus met de kernroutes

### Action Center

Action Center is:

- embedded suitewaarde
- geen los prijsanker
- geen third product package
- geen upsellmodule met eigen planlogica

## 3. Rollout rules

### Nieuwe route activeren

Pas activeren als:

- runtime bestaat
- opsmodel het draagt
- taalcontract klopt
- commerciële claims bounded zijn

### Nieuwe module claimen

Pas publiek claimen als:

- de module op `main` staat
- de shell/gating klopt
- denied states en role truth helder zijn

### Combinatieroute

Blijft:

- routebesluit
- geen bundel
- geen discount story

## 4. Activation logic

Packaging en rollout volgen:

- organization-first
- campaign-first activation
- owner-governed access
- manager-only Action Center as bounded capability

Niet volgen:

- self-serve checkout
- plan upgrades
- seat unlocks

## 5. Validation

- Sluit aan op current operations truth.
- Houdt commerciële track en productfamilie consistent.
- Voorkomt dat packaging harder groeit dan runtime of ops.

## 6. Next step

Gebruik dit document als input voor release en change governance.
