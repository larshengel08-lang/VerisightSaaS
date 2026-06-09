Gebruik deze prompt in Claude voor een gerichte review van de ExitScan-copylaag.

```text
Lees eerst deze bestanden zorgvuldig:

- C:\Users\larsh\Desktop\Business\Verisight\backend\products\exit\report_content.py
- C:\Users\larsh\Desktop\Business\Verisight\docs\active\EXITSCAN_REPORT_COPY_REVIEW_DIFF_2026-06-07.md
- C:\Users\larsh\Desktop\Business\Verisight\docs\active\REPORT_STRUCTURE_CANON.md
- C:\Users\larsh\Desktop\Business\Verisight\docs\examples\voorbeeldrapport_loep.pdf

Context:
- De ExitScan-structuur is net hersteld naar de canonical P1-P10 + Appendix-flow.
- Die structurele runtime-fix is al gedaan in backend/report.py.
- Ik wil nu nadrukkelijk NIET dat je code implementeert.
- Ik wil alleen een kritische taal-/copyreview van de voorgestelde consolidaties in de Exit copylaag.

Belangrijke grenzen:
- Gebruik REPORT_STRUCTURE_CANON.md als leidende rapportstructuur.
- Behandel backend/products/exit/report_content.py als huidige waarheid.
- Behandel EXITSCAN_REPORT_COPY_REVIEW_DIFF_2026-06-07.md als voorstelset, niet als reeds goedgekeurde copy.
- Doe geen suggesties die ExitScan harder laten claimen dan de huidige methodische grenzen dragen.
- Maak de copy niet consultancy-vaag en ook niet disclaimer-zwaar.

Doel:
Beoordeel of de voorgestelde copywijzigingen in EXITSCAN_REPORT_COPY_REVIEW_DIFF_2026-06-07.md de ExitScan-output:
- rustiger
- directiegeschikter
- minder defensief
- maar nog steeds methodisch eerlijk
maken.

Ik wil dat je per voorgestelde wijziging beoordeelt:
1. Is dit inhoudelijk beter dan de huidige tekst?
2. Wordt de copy hierdoor scherper of juist generieker?
3. Verlies ik hiermee belangrijke claimsgrenzen of trustsignalen?
4. Zou een first-time buyer of directielezer dit beter begrijpen?

Geef je antwoord in deze structuur:

1. Totaaloordeel
- Is de voorgestelde richting beter, slechter, of gemengd?

2. Per wijziging
- Behoud
- Aanscherpen
- Verwerpen
- met korte motivatie

3. Grootste risico’s
- waar de copy te slap, te intern, te generiek of te hard wordt

4. Beste eindrichting
- wat moet de dominante schrijfstijl van ExitScan zijn?
- waar hoort trusttaal wel?
- waar hoort trusttaal juist niet meer?

5. Concrete eindaanbeveling
- welke 3-5 tekstwijzigingen zou jij echt doorvoeren
- en welke juist niet

Belangrijk:
- Geen implementatie
- Geen code diff
- Alleen scherpe inhoudelijke review
- Wees kritisch en precies, niet vriendelijk-afrondend
```
