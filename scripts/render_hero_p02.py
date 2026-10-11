"""Maak de hero-afbeelding van de homepage uit het echte voorbeeldrapport.

Niet-productie (QA/marketing). Draait BINNEN het image `loep-backend:test`,
net als scripts/render_in_image.py: /repo is de read-only gemounte worktree,
/out de uitvoermap. Lokaal op Windows werkt dit niet (WeasyPrint mist GTK).

Wat het doet:
  1. rendert docs/examples/voorbeeldrapport_retentiescan.html met WeasyPrint;
  2. knipt de bovenste KNIP_FACTOR van pagina twee (index 1) met PyMuPDF;
  3. rendert die knip op SCHAAL en schrijft /out/hero_p02.png;
  4. zet hem om naar /out/hero_p02.webp (kwaliteit 82) als Pillow er is.

De afbeelding verzint niets: alles komt uit de generator. Kies KNIP_FACTOR
zo dat de knip na een heel blok valt, nooit door een tekstregel heen.
Draaien: zie plan 2026-10-09-polijstronde, Taak 13b.
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path("/repo")
OUT = Path("/out")
BRON = REPO / "docs" / "examples" / "voorbeeldrapport_retentiescan.html"

KNIP_FACTOR = float(sys.argv[1]) if len(sys.argv) > 1 else 0.54
SCHAAL = 2.5

import pymupdf  # noqa: E402
from weasyprint import HTML  # noqa: E402


def main() -> int:
    if not BRON.exists():
        print("GEEN BRON: draai eerst generate_voorbeeldrapport.py retention")
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    pdf = OUT / "hero_p02_bron.pdf"
    HTML(filename=str(BRON)).write_pdf(str(pdf))

    doc = pymupdf.open(str(pdf))
    page = doc[1]
    clip = pymupdf.Rect(0, 0, page.rect.width, page.rect.height * KNIP_FACTOR)
    pix = page.get_pixmap(matrix=pymupdf.Matrix(SCHAAL, SCHAAL), clip=clip, alpha=False)
    png = OUT / "hero_p02.png"
    pix.save(str(png))
    print(f"PNG {png.name} {pix.width}x{pix.height} {png.stat().st_size} bytes")

    # Tekstblokken met hun onderkant, zodat je ziet waar de knip valt.
    for x0, y0, x1, y1, tekst, *_ in page.get_text("blocks"):
        regel = " ".join(tekst.split())[:70]
        print(f"BLOK y0={y0:6.1f} y1={y1:6.1f} {regel}")
    print(f"KNIP y={clip.y1:6.1f} van {page.rect.height:6.1f}")

    try:
        from PIL import Image
    except ImportError:
        print("GEEN PILLOW: PNG blijft de uitvoer")
        return 0
    webp = OUT / "hero_p02.webp"
    with Image.open(png) as img:
        img.save(webp, "WEBP", quality=82, method=6)
    print(f"WEBP {webp.name} {webp.stat().st_size} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
