# Insights Qualification Rewrite Design

## Goal
Make the three `/inzichten/[slug]` pages better at filtering out vrijblijvende demo requests without turning the section into a broad blog, homepage redesign, or sitewide funnel refactor.

## Scope
- In scope:
  - Exact copy rewrites for the three insight detail pages
  - Stronger qualification around the inline contact panel
  - A small content-model expansion in the insights registry
  - Regression tests for the new qualification contract
- Out of scope:
  - Homepage changes
  - New routes beyond the existing `/inzichten` overview and three detail pages
  - Contact form schema changes
  - Broader SEO or conversion rewrites outside the insights section

## Recommended Approach
Use the existing repo-first insights registry as the source of truth and add a small set of qualification-focused fields that each detail page renders in a fixed template.

Why this approach:
- It keeps the current bounded architecture intact
- It avoids introducing MDX, CMS, or page-specific one-off markup
- It lets copy, CTA framing, and qualification logic stay testable

Alternatives considered:
- Page-specific hardcoded rewrites in the route file
  - Faster once, but weaker as a maintained content system
- Heavier contact-form changes
  - Higher risk and wider scope than needed for this iteration

## Content Strategy
Each insight detail page should shift from "interesting management article" to "decision content":
- State who the page is for
- State who it is not for
- Make the product handoff feel like the logical next step
- Make the CTA feel like a route-fit conversation, not a vrijblijvende demo

The section should still feel buyer-facing, but more selective.

## Exact Page-by-Page Rewrite

### 1. `waarom-medewerkers-vertrekken`
- Hero intent:
  - For organizations that want to understand the recurring departure pattern, not just count leavers
- Product handoff:
  - If this question is active now, the next step is usually an ExitScan route, not more generic content
- Qualification:
  - `Wanneer dit past`
    - There is a clear management question around recurring departure
    - The team wants a first bestuurlijke read, not more loose anecdotes
    - There is willingness to test a serious first route
  - `Niet voor`
    - Broad people-strategy orientation without a clear departure question
    - A general MTO or engagement exploration
    - Individual case handling or exit coaching
- CTA:
  - Title: `Toets of ExitScan nu jullie juiste eerste route is`
  - Body: ask for the current management question, visible signals, and why it matters now

### 2. `welke-signalen-gaan-aan-verloop-vooraf`
- Hero intent:
  - For teams that want to interpret earlier work-friction signals without turning them into a broad culture program
- Product handoff:
  - If exit input already exists, the next step is usually ExitScan, not more thought leadership
- Qualification:
  - `Wanneer dit past`
    - Early signals are already visible but interpretation diverges
    - The organization wants a management read instead of more open exploration
    - There is a concrete follow-up need around departure interpretation
  - `Niet voor`
    - General inspiration around culture or employer branding
    - A broad wellbeing or engagement initiative without a departure lens
    - Curiosity about predictors at individual level
- CTA:
  - Title: `Bespreek of ExitScan deze signalen echt bestuurlijk kan duiden`
  - Body: ask for the early signals, where interpretation diverges, and why a sharper management read is needed

### 3. `waar-staat-behoud-onder-druk`
- Hero intent:
  - For organizations with a concrete retention question at group level, without sliding into MTO or individual predictor framing
- Product handoff:
  - If the active retention question is real now, the next step is usually RetentieScan
- Qualification:
  - `Wanneer dit past`
    - There is a current management question about retention pressure
    - The organization wants a first group-level read, not a broad satisfaction survey
    - There is readiness to test a serious retention route
  - `Niet voor`
    - A broad MTO refresh
    - Individual retention monitoring or person-level follow-up
    - General orientation without a clear retention pressure question
- CTA:
  - Title: `Toets of RetentieScan nu echt de juiste eerste stap is`
  - Body: ask where retention seems under pressure, why now, and which group context matters

## Component Changes
Extend the insights registry with:
- `heroBody`
- `productHandoffTitle`
- `productHandoffBody`
- `whenThisFits`
- `notFor`
- `cta.title`
- `cta.body`
- `qualificationIntro`

Update the detail route template to render:
1. Hero
2. Problem framing
3. Management insight + product handoff
4. A new qualification section with:
   - `Wanneer dit past`
   - `Niet voor`
   - `Wanneer een gesprek zinvol is`
5. Trust/proof references
6. Inline contact panel with the rewritten CTA copy

## Test Plan
- Extend the insights registry test to require:
  - `whenThisFits` length 3 for all pages
  - `notFor` length 3 for all pages
  - a non-empty CTA title/body per page
- Extend the page contract test to ensure the detail route renders:
  - `Wanneer dit past`
  - `Niet voor`
  - `Wanneer een gesprek zinvol is`
- Keep existing route, metadata, sitemap, and contact wiring tests intact

## Risks
- If the copy becomes too strict, total demo volume may dip even if quality improves
- If the copy becomes too editorial, the page will drift back toward blog behavior
- If we change the contact form itself, scope will expand too far for this iteration

## Implementation Order
1. Add tests for the new registry and template contract
2. Expand the insights registry with qualification-focused fields and rewritten page copy
3. Update the detail page template to render the new qualification blocks and CTA copy
4. Re-run focused tests
5. Commit and push the worktree branch
