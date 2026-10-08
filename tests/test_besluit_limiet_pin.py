"""Pint dat de dashboardlimiet voor de lange besluitvelden (DECISION_LIMITS.action
en .text in frontend/lib/dashboard/campaign-decision.ts) gelijk is aan de grens
waarop de besluitpagina van het rapport afkapt (BESLUIT_TEKST_MAX in
backend/report_html.py). Taak 10, plan "Vervolgronde vertrekmaand en zes
keuzes", owner-besluit par. 6: dezelfde grens, uit één bron.
"""
import re
from pathlib import Path

from backend.report_html import BESLUIT_TEKST_MAX


def test_dashboardlimiet_gelijk_aan_pdf():
    src = Path("frontend/lib/dashboard/campaign-decision.ts").read_text(encoding="utf-8")
    m = re.search(r"DECISION_LIMITS = \{ topic: (\d+), owner: (\d+), action: (\d+), text: (\d+) \}", src)
    assert m, "DECISION_LIMITS niet gevonden in de vaste vorm"
    assert int(m.group(3)) == BESLUIT_TEKST_MAX
    assert int(m.group(4)) == BESLUIT_TEKST_MAX
