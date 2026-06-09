# SEGMENTREAD_CORE_ROUTE_CANON

Last updated: 2026-04-30
Status: active
Source of truth: READ_ROUTE_COMMITMENT_CANON, PRODUCT_LANGUAGE_CANON, REPORT_STRUCTURE_CANON, METHOD_SIGNOFF and QUESTION_TO_SIGNAL_MAP.

## Title

Segmentread core route canon

## Summary

Segmentread is a conditional core layer inside `ExitScan` and `RetentieScan`.

It is:

- not an upsell
- not a separate commitment layer
- not an automatic local action trigger

It helps the read layer show where local relevance becomes visible and where route-opening may be justified.

## Canonical term

- `segmentread` is the active term
- `afdelingsread` is allowed when scope is explicitly department-first
- `segment_deep_dive` is only a historical or technical runtime term

## Core truth by route

### ExitScan

- segmentread is part of the core read when n, deviation and method boundaries support it
- it remains descriptive and hypothesis-open
- it may show where departure friction looks locally sharper

### RetentieScan

- segmentread is part of the core read when n, deviation and method boundaries support it
- it remains verification-first
- it may show where retention pressure looks locally more relevant

### Other routes

- `TeamScan` remains a separate local verification route
- `Onboarding 30-60-90`, `Pulse` and `Leadership Scan` do not get automatic segmentread by default

## Three segment states

### 1. Hidden

Segmentread is not shown when n, privacy or relevance do not support it.

### 2. Visible read

Segmentread is shown as context in dashboard, report and management summary.

This means:

- management may see a local deviation
- geen lokale `eigenaar`, `eerste stap` of `reviewmoment` wordt daarmee impliciet ingevuld

### 3. Route-open worthy

Segmentread is shown as a local deviation strong enough to justify follow-up.

This means:

- dashboard or report may say a local route looks justified
- Action Center may then open local commitment

## Boundary with Action Center

Segmentread does not itself create commitment.

Only after route-opening may Action Center record:

- lokale `eigenaar`
- lokale `eerste stap`
- `reviewmoment`
- `vervolgbesluit`
- `afsluiting`

Segmentread must never be used for:

- automatic blame assignment
- causal overclaiming
- local workflow opening based on small or flat differences alone

## Sales and portfolio implication

Commercially, segmentread belongs to the credibility of the core read.

That means:

- do say that the core route can reveal where local deviation becomes relevant
- do not sell segmentread as the extra layer required to get the real story

Premium or upsell logic belongs above the read, for example:

- guided interpretation
- local workshop
- implementation support
- extra follow-through support

## Implementation note

Legacy runtime keys may still use `segment_deep_dive`. This is a technical migration concern, not live product truth.
