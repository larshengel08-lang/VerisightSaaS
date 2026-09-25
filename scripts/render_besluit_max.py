"""Stresstest-renders met een maximaal ingevuld besluit (fixronde leesronde 24-9, Taak 11).

NIET-PRODUCTIE. Schrijft docs/stresstest/zz_besluitmax_<variant>_<scenario>.html
(gitignored); scripts/render_in_image.py neemt die vanzelf mee, de regel
`besluit-op-een-a4` meet ze.

Elk tekstveld van het besluit staat op zijn frontendlimiet (DECISION_LIMITS in
frontend/lib/dashboard/campaign-decision.ts, hier uit dat bestand gelezen, niet
overgetypt): onderwerpen en eigenaar 120 tekens, "Wat precies", terugkoppeling
en succes 600. De besluitpagina kort de lange velden af op BESLUIT_TEKST_MAX en
meldt dat; onderwerpen en eigenaar kort ze niet af.

Scenario's:
  06  Loep Behoud met een aangewezen afdeling (blok "Afspraak per afdeling").
  08  Loep Vertrek (langste terugkoppelhint), zonder aangewezen afdeling.
  vx  Loep Vertrek MET een aangewezen afdeling. Geen stresstest-scenario doet
      dat (07 en 08 hebben te weinig antwoorden per afdeling), dus dit script
      voegt het slechtste geval zelf toe; het zit niet in de vaste matrix.

Varianten:
  max    elk veld op zijn limiet, ook het tweede onderwerp (120 tekens).
  samen  alleen bij een aangewezen afdeling: gelijk aan max, maar het tweede
         onderwerp is het onderwerp van die afdeling. Dan staat er in het
         afdelingsblok een extra zin (BESLUIT_AFDELING_SAMEN). Welke van de twee
         de pagina langer maakt, hangt van het afbreken af; daarom beide.

Gebruik: python scripts/render_besluit_max.py
"""
from __future__ import annotations

import html
import re
import shutil
import sys
import tempfile
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from scripts import stresstest_report as st  # noqa: E402

LIMIETBRON = ROOT / "frontend" / "lib" / "dashboard" / "campaign-decision.ts"


def _limieten() -> dict[str, int]:
    """DECISION_LIMITS uit de frontend; faalt hard als de vorm verandert."""
    bron = LIMIETBRON.read_text(encoding="utf-8")
    m = re.search(r"DECISION_LIMITS\s*=\s*\{([^}]*)\}", bron)
    if not m:
        raise SystemExit("DECISION_LIMITS niet gevonden in " + str(LIMIETBRON))
    limieten = {k: int(v) for k, v in re.findall(r"(\w+)\s*:\s*(\d+)", m.group(1))}
    if set(limieten) != {"topic", "owner", "action", "text"}:
        raise SystemExit("onverwachte sleutels in DECISION_LIMITS: " + str(sorted(limieten)))
    return limieten


LIMIET = _limieten()

_ZIN = ("Elke leidinggevende voert voor de zomer met iedere medewerker een gesprek over de "
        "volgende stap in het werk, en legt de afspraak vast. ")
_ONDERWERP = ("Werkdruk en herstelruimte in de teams met de meeste klantcontacten en de "
              "langste diensten in de drukke maanden van het jaar ")
_EIGENAAR = ("Sanne de Vries-Bakker, teamleider Operations, samen met de HR-manager en de "
             "directeur bedrijfsvoering van de vestiging ")


def _vul(basis: str, n: int) -> str:
    tekst = (basis * (n // len(basis) + 1))[:n]
    if len(tekst) != n:
        raise SystemExit("vulling mislukt")
    return tekst


def _besluit(tweede_onderwerp: str | None = None) -> dict:
    return {
        # september: de langste maandnaam in de datumvelden.
        "decided_at": date(2026, 9, 28),
        "primary_topic": _vul(_ONDERWERP, LIMIET["topic"]),
        "primary_action": _vul(_ZIN, LIMIET["action"]),
        "owner": _vul(_EIGENAAR, LIMIET["owner"]),
        "follow_up_date": date(2026, 11, 30),
        "secondary_topic": tweede_onderwerp or _vul(_ONDERWERP, LIMIET["topic"]),
        "secondary_action": _vul(_ZIN, LIMIET["action"]),
        "feedback_plan": _vul(_ZIN, LIMIET["text"]),
        "success_criterion": _vul(_ZIN, LIMIET["text"]),
        "updated_at": datetime(2026, 9, 29, 9, 30, tzinfo=timezone.utc),
    }


VERTREK_AFDELING = st.Scenario(
    "vx_vertrek_afdeling", "Vertrek met een aangewezen afdeling (n=45)",
    "Alleen voor de besluitpaginameting: Loep Vertrek waarin een afdeling eruit springt.",
    scan_type="exit", n=45, invited=60, factors=st.flat(7.3, 0.8),
    depts=[("Operations", 14), ("Sales", 9), ("Finance", 7), ("IT", 6),
           ("Customer Success", 5), ("Marketing", 4)],
    dept_shift={"Operations": -2.8},
)

_AFDELING_RE = re.compile(r'Afspraak per afdeling</div><div class="bl-vast">([^<]*)</div>')


def _afdelingsonderwerp(pad: Path) -> str | None:
    """Het onderwerp in het afdelingsblok ("Operations: <onderwerp>"), of None."""
    m = _AFDELING_RE.search(pad.read_text(encoding="utf-8"))
    if not m:
        return None
    vast = html.unescape(m.group(1))
    return vast.split(": ", 1)[1] if ": " in vast else None


def main() -> int:
    doelmap = st.OUT_DIR
    echte = st.build_report_data
    besluit: dict = {}

    def met_besluit(campaign_id, db):
        data = echte(campaign_id, db)
        data["decision"] = dict(besluit)
        data["decision_unavailable"] = False
        return data

    scenarios = [next(s for s in st.SCENARIOS if s.num == num) for num in ("06", "08")]
    scenarios.append(VERTREK_AFDELING)

    with tempfile.TemporaryDirectory() as tmp:
        st.OUT_DIR = Path(tmp)
        st.build_report_data = met_besluit
        try:
            doelmap.mkdir(parents=True, exist_ok=True)
            for sc in scenarios:
                besluit.clear()
                besluit.update(_besluit())
                bron = Path(st.run_scenario(sc)["html"])
                doel = doelmap / ("zz_besluitmax_max_" + bron.name)
                shutil.copyfile(bron, doel)
                print("geschreven: " + str(doel.relative_to(ROOT)))

                onderwerp = _afdelingsonderwerp(bron)
                if onderwerp is None:
                    print("  geen aangewezen afdeling in " + sc.key + ": geen variant samen")
                    continue
                besluit.clear()
                besluit.update(_besluit(tweede_onderwerp=onderwerp))
                bron = Path(st.run_scenario(sc)["html"])
                doel = doelmap / ("zz_besluitmax_samen_" + bron.name)
                shutil.copyfile(bron, doel)
                print("geschreven: " + str(doel.relative_to(ROOT)) + " (tweede onderwerp: "
                      + onderwerp + ")")
        finally:
            st.OUT_DIR = doelmap
            st.build_report_data = echte
    return 0


if __name__ == "__main__":
    sys.exit(main())
