# Homepage Hero Action Center Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the homepage hero visual composition so the three existing product visuals read as one guided stage with Action Center as the primary USP.

**Architecture:** Keep the existing 2-column hero and current left-side copy intact while rebuilding only the right-side visual cluster into one layered stage inside the existing homepage marketing component. Reuse the current dashboard, report and Action Center fragments that already live in the file. No new product copy, no new sample cards, no new product claims.

**Tech Stack:** Next.js App Router, React, inline style objects in TSX, existing marketing components.

**Codex run scope:** exactly one file in the existing worktree: `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/homepage-hero-actioncenter-preview/frontend/components/marketing/home-page-content.tsx`.

---

## Product- en scopegrenzen

- Stitch/Loveable zijn hier **alleen visuele referentie**. De bestaande Verisight-copy en componentinhoud blijven productwaarheid.
- Pas alleen de hero-compositie rechts aan. Geen wijzigingen aan routing, data, CTA-logica, pricing, andere homepage-secties of gedeelde marketingcomponenten.
- Gebruik alleen bestaande teksten, labels en productshots die al in `home-page-content.tsx` staan. Voeg geen mockdata, nieuwe samplemetrics of nieuwe claims toe.
- Houd de linker tekstkolom en CTA-logica inhoudelijk ongewijzigd. Alleen minimale spacing-aanpassingen zijn toegestaan.

---

### Task 1: Recompose homepage hero stage

**Files:**
- Modify: `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/homepage-hero-actioncenter-preview/frontend/components/marketing/home-page-content.tsx`
- Verify: `C:/Users/larsh/Desktop/Business/Verisight/.worktrees/homepage-hero-actioncenter-preview/frontend/components/marketing/home-page-content.tsx`

- [ ] Inspecteer eerst welke bestaande dashboard-, report- en Action Center-fragmenten al in `home-page-content.tsx` aanwezig zijn. Hergebruik alleen die inhoud.
- [ ] Rework alleen de homepage hero stage zodat de dashboard preview de rustige achtergrondlaag wordt, de report card de secundaire overlaplaag, en de Action Center card de hoogste contrastlaag.
- [ ] Houd bestaande left-side hero copy en CTA logic intact, behalve minimale spacing om de tekstkolom visueel dominant te houden.
- [ ] Verminder visuele ruis binnen de drie kaarten door niet-essentiële micro-elementen te verwijderen, zonder nieuwe copy of nieuwe productlogica toe te voegen.
- [ ] Verifieer in de browser op desktop en mobile dat de hero leest als één gecomponeerd cluster en dat Action Center het duidelijke USP-object is.

---

## Acceptatiecriteria

- Alleen `home-page-content.tsx` is gewijzigd.
- Geen nieuwe samplecopy, mockdata of nieuwe productclaims toegevoegd.
- De bestaande linker hero-copy en CTA-actie zijn inhoudelijk ongewijzigd.
- De rechter hero-cluster leest als `insight -> priority -> action`.
- Action Center is visueel de voorgrondlaag, zonder dat dashboard en rapport verdwijnen.
