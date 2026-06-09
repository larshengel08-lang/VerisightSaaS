# External Review Prompt

Review this pack as if you are doing a combined:
- senior code review
- product-governance review
- launch-readiness review

Context:
- Product: `Loep Culture Assessment / Loep Cultuurbeeld`
- Canonical route id: `culture_assessment`
- Goal: a new primary route for a heavy annual culture and engagement baseline
- V1 is baseline-only

This route is explicitly:
- not RetentieScan
- not Pulse runtime
- not TeamScan runtime
- not a manager ranking tool
- not a self-serve survey platform
- not benchmark-first
- not an individual monitoring or prediction product

Please review for:

1. Product correctness
- Does the implementation still match the locked product identity and boundaries?
- Does anything accidentally make this feel like Pulse, RetentieScan, TeamScan, benchmark, self-serve, or manager ranking?

2. Runtime and governance correctness
- Are baseline-only constraints consistently enforced?
- Are result release rules, minimum-n thresholds, segment suppression, manager lock, open-text safety, and no-individual-export boundaries implemented coherently?
- Is the governed segment summary export safely bounded?

3. Result environment correctness
- Does the dashboard/report layer preserve the canonical executive reading order?
- Is the Culture Index kept as a navigational signal instead of a health verdict?
- Are there places where wording or UI still drifts toward ranking, benchmark, causal diagnosis, or score overinterpretation?

4. Premium delivery package correctness
- Do board PDF, HR appendix logic, sample pack, board-read artifacts, and delivery metadata feel like one coherent premium product?
- Does the output suite support both enterprise and MKB through deployment profiles without separate product logic?

5. Commercial launch readiness
- Does this feel commercially demoable and operationally executable?
- Are standard outputs vs optional/governed outputs clear?
- Are there missing pieces that would still block a serious pilot or first commercial delivery?

6. Technical risks
- Identify likely bugs, weak spots, regressions, dead fields, mismatched tests, unsafe exports, brittle logic, or inconsistent copy.
- Pay special attention to:
  - backend/frontend contract alignment
  - report/export gating
  - sample/demo asset truth
  - launch-status and deployment-profile metadata

Output format:

1. Findings
- List concrete findings first, ordered by severity.
- For each finding include:
  - severity
  - file(s)
  - what is wrong
  - why it matters
  - recommended fix

2. Open questions
- Only if something is ambiguous or materially underdefined.

3. Overall verdict
- Is this V1 scope:
  - not ready
  - materially ready with a few fixes
  - or ready for commit / PR review

Review discipline:
- Prefer real bugs and product-governance risks over stylistic commentary.
- Do not suggest expanding scope beyond V1 unless a missing piece is truly required for current launch-readiness.
