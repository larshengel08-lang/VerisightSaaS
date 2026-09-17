"""Controle op een gerenderde rapport-PDF (WeasyPrint-Docker), zie plan 3a.

Regels (elke bevinding draagt de regelnaam, zodat een test of een taak er één
kan uitkiezen zonder de andere te hoeven halen):

  p02-op-een-a4     pagina 2 eindigt met de meetgegevens en pagina 3 begint met
                    hoofdstuk "02" (H16);
  paginavulling     geen pagina onder MIN_FILL gevuld, behalve de cover en de
                    laatste pagina (B9, taak 8);
  paginaverwijzing  elke "pagina N"-verwijzing op pagina 2 wijst binnen het
                    document naar een pagina die met een hoofdstukkop begint
                    (H4). Let op: niet elk hoofdstuk begint op een eigen
                    pagina. De segmentanalyse loopt door op de pagina ervoor
                    (geen `pb sec`), dus een verwijzing daarnaartoe kan hier
                    opduiken zonder dat de verwijzing fout is. Alleen op een
                    echte render te zien; weeg zo'n regel af tegen de pagina
                    zelf voordat je hem als fout aanneemt;
  tabelkop          alleen met --thead: die tabelkop staat op meer dan één
                    pagina, dus hij herhaalt op de vervolgpagina (ronde 2
                    punt c, taak 11).

Gebruik:
  python scripts/check_pdf_report.py docs/examples/voorbeeldrapport_retentiescan.pdf
  python scripts/check_pdf_report.py out.pdf --thead "Onderwerp Score"
  python scripts/check_pdf_report.py out.pdf --regel p02-op-een-a4

Exit 0 als alles klopt, 1 met een regel per overtreding, 2 als er niets te
meten valt (bestand onleesbaar). Het script meet en verzint niets: kan een
regel niet gemeten worden, dan zegt het dat in plaats van te zwijgen.
"""
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass

import pymupdf  # PyMuPDF; `fitz` is dezelfde bibliotheek onder een verouderde naam

MIN_FILL = 0.40
TOP_PT, BOTTOM_PT = 51.0, 57.0      # @page margins 18mm / 20mm in punten
FOOTER_PT = 40.0                    # onderste strook met paginanummer

REGEL_P02 = "p02-op-een-a4"
REGEL_VULLING = "paginavulling"
REGEL_VERWIJZING = "paginaverwijzing"
REGEL_THEAD = "tabelkop"
ALLE_REGELS = (REGEL_P02, REGEL_VULLING, REGEL_VERWIJZING, REGEL_THEAD)


@dataclass(frozen=True)
class Bevinding:
    regel: str
    melding: str

    def __str__(self) -> str:  # pragma: no cover - alleen voor de CLI-uitvoer
        return f"[{self.regel}] {self.melding}"


def _tekstblokken(page: pymupdf.Page) -> list[tuple[float, float, float, float, str]]:
    """Tekstblokken in leesvolgorde (van boven naar onder, dan van links naar
    rechts). `get_text("blocks")` geeft ze in de volgorde waarin ze in de
    contentstream staan; die is voor een WeasyPrint-PDF meestal al goed, maar
    niet gegarandeerd, en `first_text` hangt ervan af."""
    blokken = [(b[0], b[1], b[2], b[3], b[4]) for b in page.get_text("blocks") if b[4].strip()]
    return sorted(blokken, key=lambda b: (round(b[1], 1), round(b[0], 1)))


def page_fill(page: pymupdf.Page) -> float:
    """Aandeel van de tekstkolom dat tekst draagt, de voetregel niet meegerekend.

    Dit meet de afstand tussen de bovenste en de onderste tekstregel, niet de
    dekking: een pagina met een grote witruimte in het midden heet hier dus
    gevuld. Dat is bewust, want de klacht die deze meting moet vangen is een
    pagina die na een paar regels ophoudt (B9/H16)."""
    blokken = [b for b in _tekstblokken(page) if b[3] < page.rect.height - FOOTER_PT]
    if not blokken:
        return 0.0
    top = min(b[1] for b in blokken)
    bottom = max(b[3] for b in blokken)
    return (bottom - top) / (page.rect.height - TOP_PT - BOTTOM_PT)


def first_text(page: pymupdf.Page) -> str:
    blokken = _tekstblokken(page)
    return re.sub(r"\s+", " ", blokken[0][4]).strip() if blokken else ""


def _pagina_tekst(page: pymupdf.Page) -> str:
    """Genormaliseerd: de tekstlaag breekt regels waar de lay-out dat doet, ook
    tussen "pagina" en het nummer dat `target-counter` erachter zet."""
    return re.sub(r"\s+", " ", page.get_text())


def check(path: str, thead: str | None = None,
          regels: tuple[str, ...] = ALLE_REGELS) -> list[Bevinding]:
    doc = pymupdf.open(path)
    try:
        return _check_doc(doc, thead, regels)
    finally:
        doc.close()


def _check_doc(doc: pymupdf.Document, thead: str | None,
               regels: tuple[str, ...]) -> list[Bevinding]:
    bevindingen: list[Bevinding] = []
    n = doc.page_count

    if n < 3:
        # Fail loud: zonder pagina 3 is er niets te meten, en dat is zelf al fout
        # voor een rapport dat cover + pagina twee + hoofdstuk 02 hoort te hebben.
        # Deze melding komt er ook als de regelselectie hem niet vraagt: zwijgen
        # zou lezen als "gemeten en goed".
        return [Bevinding(
            REGEL_P02, f"het document heeft {n} pagina('s); pagina 2 en 3 zijn niet te meten")]

    p2 = _pagina_tekst(doc[1])
    p3_eerste = first_text(doc[2])

    if REGEL_P02 in regels:
        if "Meetgegevens" not in p2:
            bevindingen.append(Bevinding(
                REGEL_P02, "pagina 2 bevat de meetgegevens niet (loopt p.02 over?)"))
        if not re.match(r"^0?2\b", p3_eerste):
            bevindingen.append(Bevinding(
                REGEL_P02, f"pagina 3 begint niet met hoofdstuk 02 maar met: {p3_eerste[:60]!r}"))

    if REGEL_VULLING in regels:
        for i in range(1, n - 1):
            f = page_fill(doc[i])
            if f < MIN_FILL:
                bevindingen.append(Bevinding(
                    REGEL_VULLING,
                    f"pagina {i + 1} is {f:.0%} gevuld (< {MIN_FILL:.0%}); "
                    f"begint met {first_text(doc[i])[:50]!r}"))

    if REGEL_VERWIJZING in regels:
        verwijzingen = sorted({int(m) for m in re.findall(r"pagina (\d+)", p2)})
        for ref in verwijzingen:
            if not 1 <= ref <= n:
                bevindingen.append(Bevinding(
                    REGEL_VERWIJZING,
                    f"verwijzing naar pagina {ref} buiten het document ({n} pagina's)"))
                continue
            kop = first_text(doc[ref - 1])
            if not re.match(r"^\d{2}\b", kop):
                bevindingen.append(Bevinding(
                    REGEL_VERWIJZING,
                    f"pagina {ref} begint niet met een hoofdstukkop: {kop[:50]!r}"))

    if thead and REGEL_THEAD in regels:
        pages_with = [i + 1 for i in range(n) if thead in _pagina_tekst(doc[i])]
        if len(pages_with) < 2:
            bevindingen.append(Bevinding(
                REGEL_THEAD,
                f"tabelkop {thead!r} staat op {pages_with}, niet op twee pagina's"))

    return bevindingen


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pdf")
    ap.add_argument("--thead", default=None,
                    help="tabelkop die op de vervolgpagina moet herhalen")
    ap.add_argument("--regel", action="append", choices=list(ALLE_REGELS), default=None,
                    help="beperk de controle tot deze regel (mag meerdere keren)")
    args = ap.parse_args()

    regels = tuple(args.regel) if args.regel else ALLE_REGELS
    try:
        bevindingen = check(args.pdf, args.thead, regels)
    except Exception as exc:                       # bestand weg, geen PDF, kapot
        print(f"NIET GEMETEN {args.pdf}: {type(exc).__name__}: {exc}")
        sys.exit(2)

    for b in bevindingen:
        print(f"FOUT {args.pdf}: {b}")
    gemeten = ", ".join(regels)
    print(f"{'OK' if not bevindingen else 'NIET OK'} {args.pdf} (gemeten: {gemeten})")
    sys.exit(1 if bevindingen else 0)


if __name__ == "__main__":
    main()
