"""Maak de hero-afbeelding van de homepage uit het echte voorbeeldrapport.

Niet-productie (QA/marketing). Draait BINNEN het image `loep-backend:test`,
net als scripts/render_in_image.py: /repo is de read-only gemounte worktree,
/out de uitvoermap. Lokaal op Windows werkt dit niet (WeasyPrint mist GTK).

Wat het doet:
  1. rendert docs/examples/voorbeeldrapport_retentiescan.html met WeasyPrint;
  2. knipt pagina twee (index 1) van KNIP_BOVEN pt tot KNIP_FACTOR van de
     paginahoogte met PyMuPDF (de lege bovenmarge gaat eraf, zodat de inhoud
     op de homepage groter staat);
  3. rendert die knip op SCHAAL en schrijft /out/hero_p02.png;
  4. zet hem om naar /out/hero_p02.webp (kwaliteit 82).

Fail Loud: het script stopt met een foutcode (en een melding op stderr) als
de factor buiten het bereik valt, als een tekstblok door de boven- of
onderknip loopt, of als Pillow of WebP-ondersteuning ontbreekt. Een half
afgesneden regel of een stille PNG-terugval komt zo nooit op de homepage.
De afbeelding verzint niets: alles komt uit de generator.
Draaien: zie plan 2026-10-09-polijstronde, Taak 13b.
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path("/repo")
OUT = Path("/out")
BRON = REPO / "docs" / "examples" / "voorbeeldrapport_retentiescan.html"

FACTOR_MIN, FACTOR_MAX = 0.45, 0.6
KNIP_FACTOR = 0.54  # onderknip als deel van de paginahoogte
KNIP_BOVEN = 40.0   # pt; de eerste tekst (paginakop) begint rond 53 pt
SCHAAL = 2.5


def _fout(melding: str) -> int:
    print("FOUT: " + melding, file=sys.stderr)
    return 1


def main() -> int:
    factor = KNIP_FACTOR
    if len(sys.argv) > 1:
        try:
            factor = float(sys.argv[1])
        except ValueError:
            return _fout("knipfactor is geen getal: " + repr(sys.argv[1]))
    if not FACTOR_MIN <= factor <= FACTOR_MAX:
        return _fout(f"knipfactor {factor} valt buiten {FACTOR_MIN} tot {FACTOR_MAX}")
    if not BRON.exists():
        return _fout("geen bron: draai eerst generate_voorbeeldrapport.py retention")

    try:
        from PIL import Image, features
    except ImportError:
        return _fout("Pillow ontbreekt in het image; geen stille PNG-terugval")
    if not features.check("webp"):
        return _fout("Pillow heeft geen WebP-ondersteuning; geen stille PNG-terugval")

    import pymupdf
    from weasyprint import HTML

    OUT.mkdir(parents=True, exist_ok=True)
    pdf = OUT / "hero_p02_bron.pdf"
    HTML(filename=str(BRON)).write_pdf(str(pdf))

    with pymupdf.open(str(pdf)) as doc:
        page = doc[1]
        clip = pymupdf.Rect(0, KNIP_BOVEN, page.rect.width, page.rect.height * factor)

        doorsneden = []
        for _x0, y0, _x1, y1, tekst, *_ in page.get_text("blocks"):
            regel = " ".join(tekst.split())[:70]
            print(f"BLOK y0={y0:6.1f} y1={y1:6.1f} {regel}")
            for naam, lijn in (("boven", clip.y0), ("onder", clip.y1)):
                if y0 < lijn < y1:
                    doorsneden.append(f"{naam}knip y={lijn:.1f} loopt door blok "
                                      f"{y0:.1f}-{y1:.1f}: {regel}")
        print(f"KNIP y={clip.y0:.1f} tot {clip.y1:.1f} van {page.rect.height:.1f}")
        if doorsneden:
            for d in doorsneden:
                print("FOUT: " + d, file=sys.stderr)
            return 1

        pix = page.get_pixmap(matrix=pymupdf.Matrix(SCHAAL, SCHAAL), clip=clip, alpha=False)
        png = OUT / "hero_p02.png"
        pix.save(str(png))
        print(f"PNG {png.name} {pix.width}x{pix.height} {png.stat().st_size} bytes")

    webp = OUT / "hero_p02.webp"
    with Image.open(png) as img:
        img.save(webp, "WEBP", quality=82, method=6)
    print(f"WEBP {webp.name} {webp.stat().st_size} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
