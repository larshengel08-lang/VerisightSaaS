"""Maak de hero-afbeelding van de homepage uit het echte voorbeeldrapport.

Niet-productie (QA/marketing). Draait BINNEN het image `loep-backend:test`,
net als scripts/render_in_image.py: /repo is de read-only gemounte worktree,
/out de uitvoermap. Lokaal op Windows werkt dit niet (WeasyPrint mist GTK).

Wat het doet:
  1. rendert docs/examples/voorbeeldrapport_retentiescan.html met WeasyPrint;
  2. knipt op pagina twee (index 1) het blok "Waarom ... bovenaan staat" tot en
     met de regel "Wat er moet gebeuren ..." (besluit Lars 18-10: de hero toont
     waarom een onderwerp bovenaan staat en wat er volgens de mensen moet
     gebeuren, in plaats van de lange kernzin bovenaan de pagina);
  3. rendert die knip op SCHAAL en schrijft /out/hero_p02.png;
  4. zet hem om naar /out/hero_p02.webp (kwaliteit 82).

Fail Loud: het script stopt met een foutcode (en een melding op stderr) als
een van de twee ankers ontbreekt, als een tekstblok door de boven- of
onderknip loopt, of als Pillow of WebP-ondersteuning ontbreekt. Een half
afgesneden regel of een stille PNG-terugval komt zo nooit op de homepage.
De afbeelding verzint niets: alles komt uit de generator.
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path("/repo")
OUT = Path("/out")
BRON = REPO / "docs" / "examples" / "voorbeeldrapport_retentiescan.html"

ANKER_BOVEN = "Waarom "              # blok "Waarom <onderwerp> bovenaan staat"
ANKER_BOVEN_EIND = "bovenaan staat"
ANKER_ONDER = "Wat er moet gebeuren"  # richtingregel onder de gespreksopener
MARGE = 16.0   # pt boven en onder de ankers
ZIJ = 34.0     # pt aan beide zijkanten weg (lege paginamarge)
SCHAAL = 2.5


def _fout(melding: str) -> int:
    print("FOUT: " + melding, file=sys.stderr)
    return 1


def main() -> int:
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
        blokken = [(y0, y1, " ".join(tekst.split()))
                   for _x0, y0, _x1, y1, tekst, *_ in page.get_text("blocks")]
        boven = next((b for b in blokken
                      if b[2].startswith(ANKER_BOVEN) and ANKER_BOVEN_EIND in b[2]), None)
        onder = next((b for b in blokken if b[2].startswith(ANKER_ONDER)), None)
        if boven is None:
            return _fout(f"anker '{ANKER_BOVEN}... {ANKER_BOVEN_EIND}' niet gevonden op pagina twee")
        if onder is None or onder[0] < boven[0]:
            return _fout(f"anker '{ANKER_ONDER}' niet gevonden onder het waarom-blok")
        # Marge rond de ankers, maar nooit in het blok erboven of eronder.
        vorige = max((b[1] for b in blokken if b[1] <= boven[0]), default=0.0)
        volgende = min((b[0] for b in blokken if b[0] >= onder[1]), default=page.rect.height)
        clip = pymupdf.Rect(ZIJ, max(boven[0] - MARGE, vorige + 2.0),
                            page.rect.width - ZIJ, min(onder[1] + MARGE, volgende - 2.0))

        doorsneden = []
        for y0, y1, regel in blokken:
            print(f"BLOK y0={y0:6.1f} y1={y1:6.1f} {regel[:70]}")
            for naam, lijn in (("boven", clip.y0), ("onder", clip.y1)):
                if y0 < lijn < y1:
                    doorsneden.append(f"{naam}knip y={lijn:.1f} loopt door blok "
                                      f"{y0:.1f}-{y1:.1f}: {regel[:70]}")
        print(f"KNIP y={clip.y0:.1f} tot {clip.y1:.1f}, x={clip.x0:.1f} tot {clip.x1:.1f}")
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
