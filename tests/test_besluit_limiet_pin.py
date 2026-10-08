"""Pint dat de dashboardlimiet voor de lange besluitvelden (DECISION_LIMITS.action
en .text in frontend/lib/dashboard/campaign-decision.ts) gelijk is aan de grens
waarop de besluitpagina van het rapport afkapt (BESLUIT_TEKST_MAX in
backend/report_html.py). Taak 10, plan "Vervolgronde vertrekmaand en zes
keuzes", owner-besluit par. 6: dezelfde grens, uit één bron.

Losse regex (zoals _limieten() in scripts/render_besluit_max.py:52-61): zoekt
alleen de inhoud tussen de accolades van DECISION_LIMITS en dan los elk
"sleutel: getal"-paar, zonder de exacte spatiëring of volgorde van de
declaratie vast te leggen. Een reformat van de regel (prettier, extra
komma's) laat deze test slagen; alleen een echt gewijzigde waarde laat hem
falen.
"""
import re
from pathlib import Path

from backend.report_html import BESLUIT_TEKST_MAX

ROOT = Path(__file__).resolve().parents[1]


def test_dashboardlimiet_gelijk_aan_pdf():
    src = (ROOT / "frontend" / "lib" / "dashboard" / "campaign-decision.ts").read_text(encoding="utf-8")
    m = re.search(r"DECISION_LIMITS\s*=\s*\{([^}]*)\}", src)
    assert m, "DECISION_LIMITS niet gevonden in frontend/lib/dashboard/campaign-decision.ts"
    limieten = {k: int(v) for k, v in re.findall(r"(\w+)\s*:\s*(\d+)", m.group(1))}
    assert limieten.get("action") == BESLUIT_TEKST_MAX
    assert limieten.get("text") == BESLUIT_TEKST_MAX
