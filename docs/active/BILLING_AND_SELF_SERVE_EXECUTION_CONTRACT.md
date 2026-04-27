# BILLING_AND_SELF_SERVE_EXECUTION_CONTRACT.md

Last updated: 2026-04-27  
Status: active

## Summary

Verisight bouwt de billing- en self-serve laag in deze tranche bewust bounded en assisted:

- organization-first
- admin-only billing registry
- assisted payment and contract reality
- customer-facing readiness signal

Dit betekent:

- de organisatie blijft de huidige account- en tenantgrens
- `org_members` blijven accessrollen
- campaigns blijven fulfilmenteenheden
- billing-waarheid wordt zichtbaar gemaakt zonder checkout-first gedrag te faken

## Niet toegestaan in deze tranche

- geen Stripe
- geen plans of seats
- geen public checkout
- geen self-serve org creation
- geen subscription- of invoice-runtime

## Runtime truth

- billing blijft intern en admin-first zichtbaar
- launch readiness mag pas groen zijn als contract en betaalmethode expliciet bevestigd zijn
- klantcopy mag alleen een customer-facing readiness signal tonen
- de publieke ervaring blijft assisted, niet transactioneel
