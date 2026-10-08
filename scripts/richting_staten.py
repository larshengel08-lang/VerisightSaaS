"""Richtingstaten per stresstestscenario, voor de vergelijking voor en na een wijziging.

QA-hulpmiddel, niet-productie. Leest docs/stresstest/*.html en, met --voorbeelden,
docs/examples/voorbeeldrapport_*.html. Per bestand de kaarten op de
gespreksagenda in volgorde: rol, onderwerp, staat (klasse dir-<staat>).

    python scripts/richting_staten.py > voor.txt
    python scripts/richting_staten.py --voorbeelden >> voor.txt
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KAART = re.compile(r'<td class="dir-card dir-([a-z_]+)"><div class="dir-role">(.*?)</div>')


def staten(pad: Path) -> list[str]:
    tekst = pad.read_text(encoding="utf-8")
    return [html.unescape(rol) + " = " + staat for staat, rol in KAART.findall(tekst)]


def main(argv: list[str]) -> int:
    paden = sorted((ROOT / "docs" / "stresstest").glob("*.html"))
    if "--voorbeelden" in argv:
        paden = sorted((ROOT / "docs" / "examples").glob("voorbeeldrapport_*.html"))
    for pad in paden:
        regels = staten(pad) or ["(geen richtingkaarten)"]
        for r in regels:
            print(pad.stem + " | " + r)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
