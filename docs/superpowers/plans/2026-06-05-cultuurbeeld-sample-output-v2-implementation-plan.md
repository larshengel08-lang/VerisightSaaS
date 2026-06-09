# Cultuurbeeld Sample Output v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a stronger, boardroom-ready `Loep Culture Assessment / Loep Cultuurbeeld` Sample Output v2 for the fictive organization `Noordhaven Industrie Groep`, using the existing output pipeline where feasible and without adding new product features.

**Architecture:** Treat the uplift as one bounded artifact family pass: first lock the fictive sample scenario and wording constraints, then rebuild the board report through the existing runtime/report pipeline, then rebuild the deck and governed companion artifacts as sample/reference outputs, and finally refresh showcase metadata and pilot-delivery verification so the sample family is coherent end-to-end.

**Tech Stack:** Python, ReportLab, markdown reference artifacts, optional PDF export tooling, TypeScript metadata, pytest, Vitest

---

## 1. File Structure Map

### Runtime report and sample generation

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\backend\report.py`
  - board-report sequencing, premium page composition, segment suppression state, and sample-safe wording
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\backend\products\culture_assessment\report_content.py`
  - Culture Assessment page labels, governance copy, follow-on language, and board-output framing
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\generate_voorbeeldrapport.py`
  - stable generation path for the fictive `Noordhaven Industrie Groep` sample
- Regenerate: `C:\Users\larsh\Desktop\Business\Verisight\docs\examples\voorbeeldrapport_cultuurbeeld.pdf`

### Reference and sample artifacts

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_BOARDROOM_DECK.md`
  - canonical deck source for the 13-slide v1 sample
- Create: `C:\Users\larsh\Desktop\Business\Verisight\docs\examples\voorbeelddeck_cultuurbeeld.pdf`
  - PDF deck sample for fictive organization
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_HR_APPENDIX.md`
  - governed appendix outline aligned to the sample scenario
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_HR_DEEPENING_HANDOUT.md`
  - governed sample-page candidate for HR use
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_MANAGER_CASCADE_HANDOUT.md`
  - cascade-safe sample-page candidate
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_WHAT_YOU_RECEIVE.md`
  - buyer-facing “what you receive after completion” page

### Showcase metadata

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\sample-showcase-assets.ts`
  - sample family descriptions, readiness text, and docs paths

### Tests

- Modify: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_report_generation_smoke.py`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_sample_generator.py`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_culture_assessment_report_contract.py`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\sample-showcase-assets.test.ts`

---

### Task 1: Lock the Sample Output v2 scenario and wording constraints

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\backend\products\culture_assessment\report_content.py`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_culture_assessment_report_contract.py`

- [ ] **Step 1: Write the failing scenario contract test**

Add a focused test that asserts the sample-facing output contract keeps the bounded scenario and wording:

```python
def test_culture_assessment_sample_output_contract_stays_bounded():
    module = get_product_module("culture_assessment")
    definition = module.get_definition()
    summary = module.get_management_summary_payload()

    payload_text = " ".join(
        [
            str(definition),
            str(summary),
        ]
    ).lower()

    assert "pulse" in payload_text
    assert "conditional" in payload_text or "voorwaardelijk" in payload_text
    assert "benchmark" not in payload_text
    assert "manager score" not in payload_text
    assert "pass/fail" not in payload_text
```

- [ ] **Step 2: Run the focused contract test to verify current behavior**

Run:

```powershell
py -m pytest tests\test_culture_assessment_report_contract.py::test_culture_assessment_sample_output_contract_stays_bounded -q
```

Expected:

- `FAIL` if bounded wording is still inconsistent
- or `PASS` if part of the contract is already true, revealing what still needs tightening

- [ ] **Step 3: Tighten the sample-facing output language**

Update `report_content.py` so the sample-facing board-output contract explicitly supports:

- moderate / nuanced signal framing
- conditional Pulse follow-on only
- no benchmark or ranking language
- no causal or prediction claims

Use or tighten wording like:

```python
"sample_output_note": (
    "Voorbeeldoutput gebruikt fictieve data, toont een genuanceerd signaal, "
    "houdt Pulse voorwaardelijk, en vermijdt benchmark-, ranking-, causaliteits- "
    "en predictietaal."
)
```

- [ ] **Step 4: Re-run the focused contract test**

Run:

```powershell
py -m pytest tests\test_culture_assessment_report_contract.py::test_culture_assessment_sample_output_contract_stays_bounded -q
```

Expected:

- `PASS`

- [ ] **Step 5: Commit**

```powershell
git add backend/products/culture_assessment/report_content.py tests/test_culture_assessment_report_contract.py
git commit -m "docs: lock cultuurbeeld sample output bounds"
```

---

### Task 2: Rebuild the board report PDF through the existing output pipeline

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\backend\report.py`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\backend\products\culture_assessment\report_content.py`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_report_generation_smoke.py`

- [ ] **Step 1: Write the failing smoke assertions for the v2 board report**

Extend the culture-assessment smoke test so it checks the required sample scenario and output structure:

```python
def test_generate_culture_assessment_report_smoke_with_governed_drilldown(db_session: Session):
    pdf_bytes = generate_campaign_report(campaign.id, db_session)
    pages = _extract_pdf_pages(pdf_bytes)
    joined = " ".join(pages)

    assert len(pages) == 10
    assert "Noordhaven Industrie Groep" in joined
    assert "Board attention points" in joined
    assert "Patronen in samenhang" in joined
    assert "Wat je hier niet uit mag concluderen" in joined
    assert "Vervolgroutes" in joined or "Vervolgrichting" in joined
    assert "benchmark" not in joined.lower()
    assert "manager score" not in joined.lower()
```

- [ ] **Step 2: Run the culture report smoke tests**

Run:

```powershell
py -m pytest tests\test_report_generation_smoke.py -q -k "culture_assessment"
```

Expected:

- `FAIL`
- current sample pages, labels, or sample organization text do not yet match the new v2 brief

- [ ] **Step 3: Rework the report sequence and sample-state rendering**

Update `backend/report.py` and `report_content.py` so the generated report now reflects:

- fictive sample organization `Noordhaven Industrie Groep`
- a moderate / nuanced Culture Index
- 10 domain scores in bestuurlijke leesvolgorde
- 3 board attention points
- 2 recurring theme pairs
- 2 released safe segment contrasts
- 1 hidden/suppressed segment shown as governance state
- safe text cluster summary or explicitly disabled text layer
- conditional Pulse follow-on only

Use sections shaped like:

```python
sample_sections = [
    "Cover",
    "Responsbasis en governancekader",
    "Executive culture read",
    "Loep Culture Index",
    "Board attention points",
    "Domeinbeeld",
    "Patronen in samenhang",
    "Segmentcontrasten",
    "Wat je hier niet uit mag concluderen",
    "Vervolgrichting na de baseline",
]
```

- [ ] **Step 4: Re-run the culture report smoke tests**

Run:

```powershell
py -m pytest tests\test_report_generation_smoke.py -q -k "culture_assessment"
```

Expected:

- `PASS`
- all Culture Assessment smoke assertions pass

- [ ] **Step 5: Commit**

```powershell
git add backend/report.py backend/products/culture_assessment/report_content.py tests/test_report_generation_smoke.py
git commit -m "feat: uplift cultuurbeeld board report sample"
```

---

### Task 3: Regenerate the Sample Output v2 board report artifact

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\generate_voorbeeldrapport.py`
- Regenerate: `C:\Users\larsh\Desktop\Business\Verisight\docs\examples\voorbeeldrapport_cultuurbeeld.pdf`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_sample_generator.py`

- [ ] **Step 1: Write the failing generator-path expectation**

Add a generator test that locks the culture sample as docs-side output:

```python
def test_culture_assessment_sample_output_path_stays_docs_only():
    paths = sample_generator._resolved_output_paths(sample_generator.CULTURE_CONFIG)
    normalized_paths = [str(path).replace("\\\\", "/") for path in paths]

    assert len(normalized_paths) == 1
    assert normalized_paths[0].endswith("/docs/examples/voorbeeldrapport_cultuurbeeld.pdf")
```

- [ ] **Step 2: Run the focused generator test**

Run:

```powershell
py -m pytest tests\test_sample_generator.py::test_culture_assessment_sample_output_path_stays_docs_only -q
```

Expected:

- `PASS` or a small `FAIL` if the current path behavior drifted

- [ ] **Step 3: Update the sample generator to seed `Noordhaven Industrie Groep`**

Adjust `generate_voorbeeldrapport.py` so the culture sample uses:

- fictive organization `Noordhaven Industrie Groep`
- moderate index values
- 3 attention points
- 2 recurring pairs
- governed segment contrast state

Use a sample config block like:

```python
CULTURE_CONFIG = {
    "organization_name": "Noordhaven Industrie Groep",
    "campaign_name": "Loep Cultuurbeeld 2026",
    "scan_type": "culture_assessment",
}
```

- [ ] **Step 4: Regenerate the sample report**

Run:

```powershell
py generate_voorbeeldrapport.py culture_assessment
```

Expected:

- the script completes without traceback
- `docs/examples/voorbeeldrapport_cultuurbeeld.pdf` is overwritten with the v2 sample

- [ ] **Step 5: Re-run generator verification and commit**

Run:

```powershell
py -m pytest tests\test_sample_generator.py -q
```

Expected:

- `PASS`

Commit:

```powershell
git add generate_voorbeeldrapport.py docs/examples/voorbeeldrapport_cultuurbeeld.pdf tests/test_sample_generator.py
git commit -m "feat: regenerate cultuurbeeld sample output v2"
```

---

### Task 4: Rebuild the boardroom deck and buyer-facing companion artifacts

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_BOARDROOM_DECK.md`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\docs\examples\voorbeelddeck_cultuurbeeld.pdf`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_WHAT_YOU_RECEIVE.md`

- [ ] **Step 1: Rewrite the boardroom deck reference around the 13-slide v1 sequence**

Ensure the deck reference explicitly covers:

```md
1. Opening / purpose
2. What was measured and what was not
3. Response and governance
4. Executive read
5. Culture Index as navigation signal
6. Domain picture
7. Board attention point 1
8. Board attention point 2
9. Board attention point 3
10. Segment contrast if released
11. What not to conclude
12. Decision questions
13. Follow-on route options
```

- [ ] **Step 2: Create the PDF sample deck**

Build a static or generated PDF deck sample for `Noordhaven Industrie Groep` using the reference deck as source truth.

Minimum acceptance for the sample deck:

- 13 slides
- one visual center per slide
- no gauge-like Culture Index
- no dashboard-export aesthetics
- Pulse remains conditional

- [ ] **Step 3: Tighten the buyer-facing “what you receive” page**

Update `CULTURE_ASSESSMENT_WHAT_YOU_RECEIVE.md` so it clearly distinguishes:

- standard board report PDF
- standard guided boardroom deck
- governed HR appendix
- governed manager cascade handout
- later executive one-pager

Use direct wording like:

```md
Na afronding ontvangt de opdrachtgever standaard het board report PDF en de guided boardroom deck.
De HR appendix en manager cascade handout blijven governed en worden niet automatisch meegeleverd.
```

- [ ] **Step 4: Manually review report and deck together**

Check that:

- the report is more compact and self-readable
- the deck is more spacious and presentational
- the two artifacts feel like one family rather than two unrelated outputs

- [ ] **Step 5: Commit**

```powershell
git add docs/reference/CULTURE_ASSESSMENT_BOARDROOM_DECK.md docs/examples/voorbeelddeck_cultuurbeeld.pdf docs/reference/CULTURE_ASSESSMENT_WHAT_YOU_RECEIVE.md
git commit -m "docs: rebuild cultuurbeeld board deck family"
```

---

### Task 5: Add governed HR appendix and manager cascade sample pages

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_HR_APPENDIX.md`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_HR_DEEPENING_HANDOUT.md`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTURE_ASSESSMENT_MANAGER_CASCADE_HANDOUT.md`

- [ ] **Step 1: Rewrite the HR appendix outline around governed depth**

The appendix outline should clearly separate:

```md
- Wat HR extra mag zien
- Welke segmenten zijn vrijgegeven
- Welke lagen verborgen blijven
- Hoe tekst alleen veilig samengevat wordt
- Welke vervolgvragen bestuurlijk relevant zijn
```

- [ ] **Step 2: Add at least one designed governed-detail sample page**

Use `CULTURE_ASSESSMENT_HR_DEEPENING_HANDOUT.md` to model one realistic governed detail page for the fictive sample. It must show:

- safe segment depth
- one governance note
- no hidden segment leakage
- no ranking language

- [ ] **Step 3: Add at least one cascade-safe sample page**

Use `CULTURE_ASSESSMENT_MANAGER_CASCADE_HANDOUT.md` to model one manager-safe handout page that supports communication only:

```md
- wat managers wel mogen bespreken
- wat managers niet hoeven te verdedigen
- geen teamrangorde
- geen manager score
```

- [ ] **Step 4: Review the governed companions against the uplift brief**

Check that:

- HR appendix is clearly governed
- manager handout supports communication, not analysis
- no page leaks hidden segments or asks managers to explain scores

- [ ] **Step 5: Commit**

```powershell
git add docs/reference/CULTURE_ASSESSMENT_HR_APPENDIX.md docs/reference/CULTURE_ASSESSMENT_HR_DEEPENING_HANDOUT.md docs/reference/CULTURE_ASSESSMENT_MANAGER_CASCADE_HANDOUT.md
git commit -m "docs: add cultuurbeeld governed companion samples"
```

---

### Task 6: Refresh sample-showcase metadata and pass the pilot-delivery gate

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\sample-showcase-assets.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\sample-showcase-assets.test.ts`

- [ ] **Step 1: Write the failing showcase-asset assertions**

Add a test that locks the sample family paths and guarded descriptions:

```ts
it("keeps cultuurbeeld sample family bounded and present", () => {
  const boardReport = SAMPLE_SHOWCASE_ASSETS["culture-assessment-sample-report"];
  expect(boardReport.docsPath).toContain("voorbeeldrapport_cultuurbeeld.pdf");
  expect(boardReport.trustFrame.toLowerCase()).not.toContain("benchmark");
  expect(boardReport.trustFrame.toLowerCase()).not.toContain("manager ranking");
});
```

- [ ] **Step 2: Run the focused showcase test**

Run:

```powershell
cmd /c npx vitest run --config vitest.config.ts lib/sample-showcase-assets.test.ts
```

Expected:

- `FAIL` if the sample family metadata is still incomplete or drifts in wording

- [ ] **Step 3: Update the sample-showcase metadata**

Add or tighten references for:

- `voorbeeldrapport_cultuurbeeld.pdf`
- `voorbeelddeck_cultuurbeeld.pdf`
- governed HR appendix / handout references if present
- direct, calm, buyer-facing trust copy

Use wording like:

```ts
trustFrame:
  "Premium board-first sample family met board report, guided deck en governed verdiepingslagen zonder benchmark-, ranking- of causaliteitstaal."
```

- [ ] **Step 4: Re-run showcase verification**

Run:

```powershell
cmd /c npx vitest run --config vitest.config.ts lib/sample-showcase-assets.test.ts
```

Expected:

- `PASS`

- [ ] **Step 5: Commit**

```powershell
git add frontend/lib/sample-showcase-assets.ts frontend/lib/sample-showcase-assets.test.ts
git commit -m "docs: align cultuurbeeld sample showcase family"
```

---

### Task 7: Run the full synthetic pilot-delivery check

**Files:**
- Review/Use: `C:\Users\larsh\Desktop\Business\Verisight\docs\reference\CULTUURBEELD_BOARD_OUTPUT_UPLIFT_BRIEF.md`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_report_generation_smoke.py`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\tests\test_sample_generator.py`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\frontend\lib\sample-showcase-assets.test.ts`

- [ ] **Step 1: Run backend verification**

Run:

```powershell
py -m pytest tests\test_culture_assessment_report_contract.py tests\test_report_generation_smoke.py tests\test_sample_generator.py -q -k "culture_assessment or sample"
```

Expected:

- `PASS`

- [ ] **Step 2: Run frontend sample verification**

Run:

```powershell
cmd /c npx vitest run --config vitest.config.ts lib/sample-showcase-assets.test.ts
```

Expected:

- `PASS`

- [ ] **Step 3: Perform a synthetic live-path review against the uplift brief**

Confirm manually or via existing smoke evidence that:

- a synthetic campaign can complete end-to-end
- report downloads only after release
- `segment_deep_dive` stays closed unless manually/admin enabled
- no raw or sensitive text appears
- follow-on remains bounded

- [ ] **Step 4: Record the pass result in a short note**

Add a short pass/fail section to an existing readiness or handoff note with this structure:

```md
- synthetic campaign completed end-to-end
- board report downloaded after release
- segment deep dive remained governed
- sample output was sales-call legible without extra explanation
- no raw or sensitive text appeared
- follow-on stayed bounded
```

- [ ] **Step 5: Commit**

```powershell
git add tests/test_culture_assessment_report_contract.py tests/test_report_generation_smoke.py tests/test_sample_generator.py frontend/lib/sample-showcase-assets.test.ts
git commit -m "test: verify cultuurbeeld sample output v2 gate"
```

---

## 2. Spec Coverage Self-Review

This plan covers the uplift brief as follows:

- primary next deliverable and production target: Tasks 2-6
- sample scenario: Tasks 1-3
- board report blueprint execution: Task 2
- boardroom deck blueprint execution: Task 4
- HR appendix and manager cascade sample pages: Task 5
- copy tone and bounded follow-on truth: Tasks 1, 4, and 6
- likely file impact: File Structure Map and all tasks
- pilot delivery pass criteria: Task 7
- authorization boundary: preserved across all tasks

This plan does **not** introduce:

- new runtime features
- app redesign
- measurement changes
- benchmark logic
- self-serve reporting

---

## 3. Done-When

This plan is complete only when:

1. `voorbeeldrapport_cultuurbeeld.pdf` is regenerated as Sample Output v2 for `Noordhaven Industrie Groep`
2. the board report reflects the 10-page uplift structure and bounded wording
3. a `voorbeelddeck_cultuurbeeld.pdf` sample exists and follows the 13-slide structure
4. the HR appendix and manager cascade handout each contain at least one realistic governed sample page if feasible
5. the “what you receive after completion” page reflects the real sample family truth
6. showcase metadata references the new sample family accurately
7. the synthetic pilot-delivery gate passes end-to-end
