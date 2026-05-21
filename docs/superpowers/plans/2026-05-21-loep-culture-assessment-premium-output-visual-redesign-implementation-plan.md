# Loep Culture Assessment Premium Output Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `culture_assessment` board report PDF sample and boardroom PDF deck family so the premium visual redesign becomes true in runtime output, reference artifacts, and sample proof assets.

**Architecture:** Treat the runtime board report, the boardroom deck reference artifact, and the sample-proof surface as one bounded output family. Implement the visual redesign in the live culture report generator first, then regenerate the sample PDF, then align the deck and derivative reference artifacts so readiness, copy, and buyer proof all tell the same truth.

**Tech Stack:** Python, ReportLab, matplotlib, TypeScript, markdown reference artifacts, pytest, Vitest

---

## 1. File Structure Map

### Runtime report and product contracts

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\backend\report.py`
  - Culture Assessment board report structure, section order, module styling, and page copy
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\backend\products\culture_assessment\report_content.py`
  - board-read framing, output sequence note, and premium-output runtime truth
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\backend\products\culture_assessment\definition.py`
  - output-family readiness and narrative parity if runtime-facing strings must change

### Sample proof generation

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\generate_voorbeeldrapport.py`
  - keep the culture sample generation path stable and regenerate the new premium sample output
- Regenerate: `C:\Users\larsh\Desktop\Business\Verisight\docs\examples\voorbeeldrapport_cultuurbeeld.pdf`
- Regenerate: `C:\Users\larsh\Desktop\Business\Verisight\frontend\public\examples\voorbeeldrapport_cultuurbeeld.pdf`

### Reference artifacts

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_BOARDROOM_DECK.md`
  - slide-by-slide canonical deck artifact
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_BOARD_READ_AGENDA.md`
  - board-read pacing aligned to the redesigned deck
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_BOARD_READ_FACILITATOR_SCRIPT.md`
  - guided presenter rhythm aligned to the redesigned deck
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_EXECUTIVE_ONE_PAGER.md`
  - derivative visual grammar cues only, not a full redesign
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_WHAT_YOU_RECEIVE.md`
  - premium-output truth aligned to the rebuilt report/deck family

### Frontend sample-proof metadata

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\sample-showcase-assets.ts`
  - sample proof readiness and trust-frame copy if needed after artifact rebuild

### Tests

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_culture_assessment_report_contract.py`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_report_generation_smoke.py`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_sample_generator.py`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\sample-showcase-assets.test.ts`

---

### Task 1: Lock the premium-output execution contract

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\backend\products\culture_assessment\report_content.py`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\backend\products\culture_assessment\definition.py`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_culture_assessment_report_contract.py`

- [ ] **Step 1: Write the failing backend contract assertions**

```python
def test_culture_assessment_module_exposes_definition_and_report_payloads():
    module = get_product_module("culture_assessment")

    assert "compacte executive read" in module.get_definition()["output_sequence_note"]
    assert "premium board artifact" in module.get_management_summary_payload()["output_sequence_note"]
    assert module.get_definition()["output_readiness"]["board_report_pdf"] == "pilot_delivery_ready"
    assert module.get_definition()["output_readiness"]["boardroom_deck"] == "pilot_delivery_ready"
```

- [ ] **Step 2: Run the focused backend test to verify it fails**

Run:

```powershell
py -m pytest tests\test_culture_assessment_report_contract.py::test_culture_assessment_module_exposes_definition_and_report_payloads -q
```

Expected:

- `FAIL`
- the new premium-output wording is not present yet

- [ ] **Step 3: Update the runtime copy contract with redesign truth**

Add or tighten the Culture Assessment output-family wording in `report_content.py` and `definition.py` so it explicitly distinguishes:

- compact self-readable board report PDF
- guided spacious boardroom PDF deck
- derivative executive one-pager grammar

Use a block like:

```python
"output_sequence_note": (
    "Het board report pdf is in v1 een compacte executive read en premium board artifact. "
    "Het boardroom pdf deck is de ruimere, guided zusterlaag voor facilitated board-read; "
    "de executive one-pager blijft een afgeleide van dezelfde visuele grammatica."
)
```

- [ ] **Step 4: Re-run the focused backend contract test**

Run:

```powershell
py -m pytest tests\test_culture_assessment_report_contract.py::test_culture_assessment_module_exposes_definition_and_report_payloads -q
```

Expected:

- `PASS`

- [ ] **Step 5: Commit**

```powershell
git add backend/products/culture_assessment/report_content.py backend/products/culture_assessment/definition.py tests/test_culture_assessment_report_contract.py
git commit -m "docs: lock culture assessment premium output contract"
```

---

### Task 2: Rebuild the runtime board report PDF to match the redesign blueprint

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\backend\report.py`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\backend\products\culture_assessment\report_content.py`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_report_generation_smoke.py`

- [ ] **Step 1: Write the failing report-structure smoke assertions**

Extend the culture report smoke test so it checks the redesigned executive sequence rather than only the older compact headings:

```python
def test_generate_culture_assessment_report_smoke_with_governed_drilldown(db_session: Session):
    pdf_bytes = generate_campaign_report(campaign.id, db_session)
    text = _extract_pdf_text(pdf_bytes)

    assert "Executive culture read" in text
    assert "Responsbasis en governancekader" in text
    assert "Loep Culture Index" in text
    assert "Board attention points" in text
    assert "Vervolgrichting na de baseline" in text
    assert "Methodiek en begrenzingen" in text
```

- [ ] **Step 2: Run the culture report smoke test to verify it fails**

Run:

```powershell
py -m pytest tests\test_report_generation_smoke.py -q -k "generate_culture_assessment_report_smoke"
```

Expected:

- `FAIL`
- one or more redesigned headings are still missing from the generated PDF text

- [ ] **Step 3: Implement the new ten-page report sequence in `backend/report.py`**

Refactor `_generate_culture_assessment_report(...)` so the section order and page framing match the board report blueprint:

```python
culture_sections = [
    ("Cover", "Loep Culture Assessment - Board Baseline"),
    ("Executive opener", "Executive culture read"),
    ("Response and governance", "Responsbasis en governancekader"),
    ("Index hero", "Loep Culture Index"),
    ("Attention", "Board attention points"),
    ("Domain profile", "Domeinbeeld"),
    ("Pattern logic", "Patronen in samenhang"),
    ("Segment contrast", "Segmentcontrasten"),
    ("Follow-on", "Vervolgrichting na de baseline"),
    ("Method", "Methodiek en begrenzingen"),
]
```

When implementing, enforce these runtime rules:

- the first pages feel editorial rather than widget-like
- the Culture Index remains non-gauge
- the domain page uses reading-sequence language
- segment contrast remains gated behind `segment_deep_dive`
- hidden layers render as governance state, not silence

- [ ] **Step 4: Re-run the culture report smoke tests**

Run:

```powershell
py -m pytest tests\test_report_generation_smoke.py -q -k "culture_assessment"
```

Expected:

- `PASS`
- culture report still generates PDF bytes
- governed and non-governed segment states still behave correctly

- [ ] **Step 5: Commit**

```powershell
git add backend/report.py backend/products/culture_assessment/report_content.py tests/test_report_generation_smoke.py
git commit -m "feat: redesign culture assessment board report pdf"
```

---

### Task 3: Regenerate and verify the premium sample report PDF

**Files:**
- Use: `C:\Users\larsh\Desktop\Business\Verisight\generate_voorbeeldrapport.py`
- Regenerate: `C:\Users\larsh\Desktop\Business\Verisight\docs\examples\voorbeeldrapport_cultuurbeeld.pdf`
- Regenerate: `C:\Users\larsh\Desktop\Business\Verisight\frontend\public\examples\voorbeeldrapport_cultuurbeeld.pdf`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_sample_generator.py`

- [ ] **Step 1: Extend the generator test with a culture sample regeneration expectation**

Add a focused assertion that the culture sample path remains stable:

```python
def test_resolved_output_paths_support_culture_assessment_sample():
    paths = sample_generator._resolved_output_paths(sample_generator.CULTURE_CONFIG)

    normalized_paths = [str(path).replace("\\\\", "/") for path in paths]
    assert normalized_paths[0].endswith("/docs/examples/voorbeeldrapport_cultuurbeeld.pdf")
    assert normalized_paths[1].endswith("/frontend/public/examples/voorbeeldrapport_cultuurbeeld.pdf")
```

- [ ] **Step 2: Run the generator-path test**

Run:

```powershell
py -m pytest tests\test_sample_generator.py::test_resolved_output_paths_support_culture_assessment_sample -q
```

Expected:

- `PASS`

- [ ] **Step 3: Regenerate the culture sample PDF using the existing generator**

Run:

```powershell
py generate_voorbeeldrapport.py culture_assessment
```

Expected:

- the script completes without traceback
- both PDF files are overwritten with the redesigned board report output

- [ ] **Step 4: Verify the regenerated artifacts and smoke path**

Run:

```powershell
py -m pytest tests\test_sample_generator.py -q
```

Expected:

- `PASS`
- culture sample paths remain correct after regeneration

- [ ] **Step 5: Commit**

```powershell
git add generate_voorbeeldrapport.py docs/examples/voorbeeldrapport_cultuurbeeld.pdf frontend/public/examples/voorbeeldrapport_cultuurbeeld.pdf tests/test_sample_generator.py
git commit -m "feat: regenerate culture assessment premium sample report"
```

---

### Task 4: Rebuild the boardroom PDF deck reference artifact from the new blueprint

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_BOARDROOM_DECK.md`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_BOARD_READ_AGENDA.md`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_BOARD_READ_FACILITATOR_SCRIPT.md`

- [ ] **Step 1: Rewrite the canonical deck reference artifact around the 13-slide sequence**

Replace the current shorter structure with the full slide family:

```md
1. Opening / purpose
2. What was measured
3. Response and governance
4. Executive read
5. Culture Index hero
6. Domain picture
7. Board attention point 1
8. Board attention point 2
9. Board attention point 3
10. Segment contrast, if released
11. What not to conclude
12. Decision questions
13. Follow-on route options
```

- [ ] **Step 2: Align the board-read agenda to the redesigned pacing**

Update the agenda so it tracks the new deck flow:

```md
- Opening and purpose
- Method scope
- Response and governance
- Executive read
- Culture Index and domain picture
- Three board attention points
- Governed segment contrast if released
- What not to conclude
- Decision questions
- Follow-on route options
```

- [ ] **Step 3: Align the facilitator script to the same slide order**

Add presenter guidance that mirrors the new deck grammar:

```md
- keep each attention point as a separate discussion moment
- present governance as quality control, not caution tape
- use the decision-questions slide to open discussion, not to prescribe action
```

- [ ] **Step 4: Manually review the three reference artifacts together**

Check that all three files agree on:

- 13-slide order
- deck is guided, spacious, and board-read paced
- no benchmark, ranking, or self-serve drift

- [ ] **Step 5: Commit**

```powershell
git add docs/reference/CULTURE_ASSESSMENT_BOARDROOM_DECK.md docs/reference/CULTURE_ASSESSMENT_BOARD_READ_AGENDA.md docs/reference/CULTURE_ASSESSMENT_BOARD_READ_FACILITATOR_SCRIPT.md
git commit -m "docs: rebuild culture assessment boardroom deck family"
```

---

### Task 5: Align derivative one-pager and buyer-facing output truth

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_EXECUTIVE_ONE_PAGER.md`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_WHAT_YOU_RECEIVE.md`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\sample-showcase-assets.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\sample-showcase-assets.test.ts`

- [ ] **Step 1: Tighten one-pager grammar as a derivative, not a separate style world**

Update the one-pager reference so it explicitly inherits:

- Culture Index hero language
- board attention framing
- governance-first reading rule

Use wording like:

```md
The executive one-pager is a derivative of the same premium report+deck family and may not introduce benchmark, ranking or intervention logic that the core artifacts do not carry.
```

- [ ] **Step 2: Update the “what you receive” artifact to reflect the redesigned family**

Ensure the output list names:

- board report PDF
- guided board-read / boardroom PDF deck
- executive one-pager

without making optional or governed outputs appear standard.

- [ ] **Step 3: Update sample-showcase trust framing only if the rebuilt artifacts changed truth**

Use a bounded change like:

```ts
trustFrame:
  'Premium board-first output family with redesigned report rhythm, guided boardroom deck, and governance-safe reading order.'
```

- [ ] **Step 4: Run the showcase asset verification**

Run:

```powershell
cmd /c npx vitest run --config vitest.config.ts lib/sample-showcase-assets.test.ts
```

Expected:

- `PASS`
- all Culture Assessment docsPath references still exist

- [ ] **Step 5: Commit**

```powershell
git add docs/reference/CULTURE_ASSESSMENT_EXECUTIVE_ONE_PAGER.md docs/reference/CULTURE_ASSESSMENT_WHAT_YOU_RECEIVE.md frontend/lib/sample-showcase-assets.ts frontend/lib/sample-showcase-assets.test.ts
git commit -m "docs: align culture assessment premium output truth"
```

---

### Task 6: Run full scoped verification and refresh readiness artifacts

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\output\culture_assessment_board_pack_readiness.md`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\superpowers\plans\2026-05-20-loep-culture-assessment-current-state-handoff.md`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_culture_assessment_report_contract.py`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_report_generation_smoke.py`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_sample_generator.py`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\sample-showcase-assets.test.ts`

- [ ] **Step 1: Update board-pack readiness to reflect the redesigned report/deck family**

Add or tighten readiness statements such as:

```md
- board report now matches the premium visual redesign blueprint
- boardroom deck reference artifact matches the 13-slide guided board-read sequence
- executive one-pager remains derivative and bounded
```

- [ ] **Step 2: Run backend scoped verification**

Run:

```powershell
py -m pytest tests\test_culture_assessment_report_contract.py tests\test_report_generation_smoke.py tests\test_sample_generator.py -q -k "culture_assessment or sample"
```

Expected:

- `PASS`

- [ ] **Step 3: Run frontend scoped verification**

Run:

```powershell
cmd /c npx vitest run --config vitest.config.ts lib/sample-showcase-assets.test.ts
```

Expected:

- `PASS`

- [ ] **Step 4: Refresh the current-state handoff with the redesign outcome**

Add a compact note that:

- premium-output redesign spec exists
- board report blueprint exists
- boardroom deck blueprint exists
- runtime report and sample artifact were rebuilt

- [ ] **Step 5: Commit**

```powershell
git add docs/superpowers/output/culture_assessment_board_pack_readiness.md docs/superpowers/plans/2026-05-20-loep-culture-assessment-current-state-handoff.md
git commit -m "docs: refresh culture assessment redesign readiness"
```

---

## 2. Spec Coverage Self-Review

This plan covers the redesign spec as follows:

- visual system + premium-output truth: Task 1
- board report PDF v1 sequence: Task 2
- sample proof artifact rebuild: Task 3
- boardroom PDF deck v1 sequence: Task 4
- derivative executive one-pager grammar: Task 5
- acceptance/readiness closure: Task 6

No benchmark layer, dashboard workspace, self-serve reporting, manager-ranking visual, or new measurement logic is introduced by this plan.

---

## 3. Done-When

This plan is complete only when:

1. the runtime Culture Assessment board report matches the redesign blueprint closely enough to pass scoped smoke tests
2. the sample PDF in `docs/examples` and `frontend/public/examples` has been regenerated from the redesigned runtime
3. the boardroom deck reference artifact follows the full 13-slide guided sequence
4. the executive one-pager remains derivative and bounded
5. sample-showcase readiness and trust copy remain truthful
6. scoped backend and frontend verification are green

