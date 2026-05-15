# Admin `/beheer` Setup Hub Design

Date: 2026-05-15
Owner: Codex
Scope: Admin `/beheer` only

## Goal

`/beheer` becomes the compact admin setup hub for:

1. organization creation
2. campaign creation
3. respondent import
4. client access activation

The page should help Verisight set up a new customer and campaign quickly, without turning into a broad operations wall.

## Keep

- direct execution on the page for the core setup flow
- existing admin-only access boundary
- the current underlying setup capabilities:
  - create organization
  - create campaign
  - import respondents
  - invite / activate client users
- access to secondary admin workbenches:
  - `/beheer/contact-aanvragen`
  - `/beheer/klantlearnings`
  - `/beheer/health`
  - `/beheer/billing`
  - `/beheer/proof`

## Change

- make the page setup-first instead of operations-first
- reduce explanatory/admin framing
- remove the feeling of a heavy control tower
- make the core setup flow dominant
- move broader delivery/admin surfaces down into clearly secondary positions

## Do Not Change

- backend behavior
- permissions
- existing forms and APIs unless needed for layout/integration
- the existence of specialized admin workbenches

## Primary Page Role

`/beheer` is not the home for "everything operational".

It is the place where admin primarily:

- creates a customer organization
- creates the first campaign
- imports respondents for that campaign
- activates client access

Secondary delivery/admin work remains reachable, but must not dominate the page.

## Information Architecture

The page should be ordered like this:

1. compact setup header
2. primary setup flow
3. secondary admin workbenches
4. collapsed campaign status overview

## Canonical Setup Context

Steps 3 and 4 depend on one explicit setup context.

The page must define a single active setup target:

- `selected organization`
- `selected campaign`

This pair drives:

- respondent import
- client access activation
- any compact setup status shown for those later steps

Rules:

- Steps 1 and 2 do not depend on an already selected campaign
- Steps 3 and 4 do
- the UI may prefill a sensible default, but the page must still have one explicit setup target state

Recommended rule:

- after creating or selecting an organization, campaign selection becomes explicit
- if a default is needed, use the newest active campaign inside the selected organization
- the page should still make the active campaign context visible to the admin

## Header

Keep the top compact.

Show only:

- page title
- one short setup-focused context line
- compact utility summary

Recommended summary items:

- active organizations
- active campaigns
- respondents linked
- pending client activations

Do not keep:

- long operational framing
- cadence-heavy explanation
- large proof or status storytelling

## Primary Setup Flow

The setup flow becomes the heart of the page.

It contains four steps:

1. `Organisatie`
2. `Campaign`
3. `Respondenten`
4. `Klanttoegang`

### Step 1: Organisatie

Always visible and open.

Should include:

- list of current organizations
- create new organization
- archive/delete controls if they already exist

### Step 2: Campaign

Always visible and open.

Should include:

- create new campaign
- campaign setup directly after organization selection

### Step 3: Respondenten

Only becomes active after a campaign is chosen.

Before campaign selection:

- compact locked state
- one factual line explaining that a campaign must be selected first

After campaign selection:

- open respondent import workspace
- preserve current import capability

### Step 4: Klanttoegang

Klanttoegang remains organization-scoped in capability, but should only open in this setup hub once a real setup context exists.

Before campaign selection:

- compact locked state

After campaign selection:

- invite/activate client users
- show current activation state

Important rule:

- this does **not** mean client access becomes technically campaign-bound
- the underlying capability stays organization-scoped
- the campaign requirement is only a setup-flow gating rule, so admin does not activate client access too early or without a concrete campaign context

## Open vs Locked Behavior

Default visibility:

- `Organisatie`: open
- `Campaign`: open
- `Respondenten`: locked until campaign chosen
- `Klanttoegang`: locked until campaign chosen

This keeps the page executable without showing four large active work blocks at once.

## Secondary Workbenches

Below the main setup flow, show a small secondary row with links to:

- `Contact-aanvragen`
- `Klantlearnings`
- `Health`
- `Billing`
- `Proof`

Rules:

- these are secondary links, not primary blocks
- no long explanation per link
- no heavy operational panels here

## Current Delivery Wall

The current `Open delivery- en activatiewerk` / cadence-heavy surface should not remain above setup.

Decision:

- remove it from the primary `/beheer` surface
- do not keep it as a dominant section above the setup flow
- do not let cadence anchors or operations framing lead the page

If parts of that information still matter:

- fold them into the collapsed campaign status overview
- or keep them in specialized workbenches instead of the setup homepage

### Contact-aanvragen

Important note:

`Contact-aanvragen` is a real admin intake surface, not just a mail side effect.

Website "plan afspraak" requests currently:

- hit `/api/contact`
- create a backend contact-request record
- carry route/timing/source metadata
- appear in `/beheer/contact-aanvragen`

So this surface stays reachable, but only as a secondary workbench from `/beheer`.

## Campaign Status Overview

Keep this page capability, but demote it.

Recommended behavior:

- collapsed by default
- clearly labeled as a control layer, not a setup step

Purpose:

- inspect existing campaign progress when needed
- not required for the primary new-customer setup flow

## Copy Rules

Use short, factual admin language.

Prefer:

- what this step does
- what is available
- what is blocked

Avoid:

- long operational explanation
- broad "delivery cadence" storytelling
- management framing
- proof-style copy

## Acceptance Criteria

The redesign is done when all of the following are true:

- `/beheer` clearly reads as a setup hub first
- one explicit setup context exists for steps 3 and 4
- `Organisatie` and `Campaign` are immediately usable on first load
- `Respondenten` is not fully active before a campaign is chosen
- `Klanttoegang` is not fully active before a campaign is chosen
- secondary admin workbenches are visible but visually smaller than setup
- campaign status overview is still present but collapsed by default
- no large cadence or operations wall appears above the setup flow
- no workbench CTA buttons sit in the hero as primary admin actions
- no cadence anchor appears before setup
- no primary ops section appears above the setup flow
- no core setup capability is removed

## Explicit Non-Goals

This redesign does not yet cover:

- redesign of `/beheer/contact-aanvragen`
- redesign of `/beheer/klantlearnings`
- redesign of `/beheer/health`
- redesign of `/beheer/billing`
- redesign of `/beheer/proof`
- the final cross-page capability parity audit

Those remain follow-up work after this setup-hub change.
