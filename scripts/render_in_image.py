"""Render alle rapport-HTML in het productie-image en controleer de PDF's.

Draait BINNEN het image `loep-backend:test` (zie plan 3b, "PDF's renderen in
het productie-image"). /repo is de read-only gemounte worktree, /out de
uitvoermap. Lokaal op Windows werkt dit niet: WeasyPrint heeft daar geen GTK.

Wat het meet per bestand:
  warnings   WARNING/ERROR-records op de `weasyprint`-logger tijdens de render
  streepjes  em-dashes en en-dashes in de tekstlaag van de PDF
  check      scripts/check_pdf_report.py, alle regels

Exitcode 0 als elk bestand schoon is, anders 1. Het script verzint niets: kan
een bestand niet gerenderd worden, dan telt dat als een bevinding.
"""
from __future__ import annotations

import logging
import sys
from pathlib import Path

REPO = Path("/repo")
OUT = Path("/out")
sys.path.insert(0, str(REPO))

import pymupdf  # noqa: E402
from weasyprint import HTML  # noqa: E402

from scripts import check_pdf_report as cpr  # noqa: E402

# De drie voorbeeldrapporten die de site linkt, plus alle scenario's.
VOORBEELDEN = ("voorbeeldrapport_loep.html", "voorbeeldrapport_retentiescan.html",
               "voorbeeldrapport_onboarding.html")


class _Teller(logging.Handler):
    def __init__(self) -> None:
        super().__init__(level=logging.WARNING)
        self.regels: list[str] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.regels.append(record.getMessage())


def _bronnen(selectie: list[str]) -> list[Path]:
    bronnen = sorted((REPO / "docs" / "stresstest").glob("*.html"))
    bronnen += [REPO / "docs" / "examples" / naam for naam in VOORBEELDEN]
    bronnen = [b for b in bronnen if b.exists()]
    if selectie:
        bronnen = [b for b in bronnen if any(b.name.startswith(s) for s in selectie)]
    return bronnen


def main() -> int:
    bronnen = _bronnen(sys.argv[1:])
    if not bronnen:
        print("GEEN BRONNEN: draai eerst scripts/stresstest_report.py in de worktree")
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    met_bevindingen = 0
    for bron in bronnen:
        teller = _Teller()
        log = logging.getLogger("weasyprint")
        log.addHandler(teller)
        pdf = OUT / (bron.stem + ".pdf")
        try:
            HTML(filename=str(bron)).write_pdf(str(pdf))
        except Exception as exc:  # een render die omvalt is zelf de bevinding
            print("FOUT " + bron.name + " render mislukt: " + type(exc).__name__ + ": " + str(exc))
            met_bevindingen += 1
            continue
        finally:
            log.removeHandler(teller)
        doc = pymupdf.open(str(pdf))
        tekst = "".join(p.get_text() for p in doc)
        paginas = doc.page_count
        doc.close()
        streepjes = tekst.count("—") + tekst.count("–")
        bevindingen = cpr.check(str(pdf))
        schoon = not teller.regels and not streepjes and not bevindingen
        print(("OK " if schoon else "NIET OK ") + bron.stem
              + " paginas=" + str(paginas)
              + " warnings=" + str(len(teller.regels))
              + " emdash=" + str(streepjes)
              + " check=" + ("OK" if not bevindingen else str(len(bevindingen))))
        for regel in teller.regels:
            print("   warning: " + regel)
        for b in bevindingen:
            print("   " + str(b))
        if not schoon:
            met_bevindingen += 1
    print("TOTAAL " + str(len(bronnen)) + " bestanden, " + str(met_bevindingen) + " met bevindingen")
    return 1 if met_bevindingen else 0


if __name__ == "__main__":
    sys.exit(main())
