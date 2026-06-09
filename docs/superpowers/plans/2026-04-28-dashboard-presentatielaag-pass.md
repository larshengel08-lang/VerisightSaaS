# Dashboard Presentatielaag Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Maak het dashboard begrijpelijker en rustiger op de presentatielaag, op basis van de redlines in `tmp/reviews`, zonder logica, datamodellen, rechten of berekeningen te wijzigen.

**Architecture:** Deze pass blijft volledig in de UI-laag. We wijzigen alleen shellcopy, labels, heading-hiërarchie, volgorde van contentblokken, secundaire/tertiaire nadruk en een paar compacte view-model-teksten die al door helperfuncties of report-library builders worden gevoed. We laten tabs, dataqueries, thresholds en routes intact.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, Tailwind utility classes, Vitest string guardrail tests.

---

### Task 1: Shell en navigatietaal

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\components\dashboard\dashboard-shell.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\dashboard\shell-navigation.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\dashboard\shell-navigation.test.ts`

- [ ] Vervang interne shelltaal zoals `People Suite`, `Reports`, `Reports & exports`, `Campagneread`, `routeomgeving` en `suite-shell` door eenvoudiger dashboardtaal.
- [ ] Houd de navigatie-informatie intact, maar maak labels consistenter met de marketinglaag en de reviewbestanden.
- [ ] Werk stringtests bij zodat de nieuwe taal bewaakt blijft.

### Task 2: Dashboard-home

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\dashboard\page.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\components\dashboard\customer-launch-control.tsx`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\dashboard\page.test.ts`

- [ ] Breng de kop en introductieregel terug naar een rustiger werkoverzicht.
- [ ] Verlaag systeemmatige taal en maak duidelijker wat hoofdzaak is, wat context is en wat later kan.
- [ ] Houd statcards en portfolio-opbouw intact, maar versober CTA- en begeleidende copy.

### Task 3: Scan-detail

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\page.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\page-helpers.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\products\exit\dashboard.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\products\retention\dashboard.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\campaigns\[id]\page.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\products\exit\dashboard.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\products\retention\dashboard.test.ts`

- [ ] Maak de first read neutraler en minder sturend.
- [ ] Snijd en hernoem ExitScan- en RetentieScan-overzichtsteksten volgens de redlines.
- [ ] Maak uitvoerings- en handoffcopy secundairer zonder contentstructuur of tabs technisch om te gooien.
- [ ] Bundel adviesachtige kaartkoppen en vervang interpretatieve labels door nuchtere, cijfergerichte termen.

### Task 4: Rapportenoverzicht

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\app\(dashboard)\reports\page.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\dashboard\report-library.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\dashboard\report-library.test.ts`

- [ ] Zet het scherm terug naar bibliotheek-first gedrag: rapport selecteren, openen, downloaden.
- [ ] Maak featured report, bibliotheekintro en rapportkaartbeschrijvingen veel functioneler.
- [ ] Degradeer of verplaats handoffcopy, en verwijder overbodige productuitleg onderaan.

### Task 5: Verificatie

**Files:**
- Test: bestaande dashboardtests die geraakt zijn

- [ ] Run gerichte Vitest-bestanden voor shell, dashboard-home, scan-detail en report-library.
- [ ] Run lint op alle geraakte bestanden.
- [ ] Noteer eventuele residuale risico’s waar de reviews verder gaan dan deze pass.
