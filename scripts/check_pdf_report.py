"""Controle op een gerenderde rapport-PDF (WeasyPrint-Docker), zie plan 3a.

Regels (elke bevinding draagt de regelnaam, zodat een taak of test er een kan
uitkiezen zonder de andere te hoeven halen):

  p02-op-een-a4     pagina 2 draagt het meetgegevensblok (kop en rij, elk als
                    eigen regel, hoofdletterongevoelig) en pagina 3 begint met
                    hoofdstuk "02" (H16);
  paginavulling     geen pagina onder MIN_FILL gevuld, behalve de cover en de
                    laatste pagina (B9, taak 8). Ook uitgezonderd: de laatste
                    vervolgpagina van de appendix (APPENDIX_STAART_UITGEZONDERD,
                    plan 3b). De hoeveelheid data bepaalt hoe vol die staart is;
                    geen lay-outmaat lost dat op;
  besluit-op-een-a4 belooft de gespreksagenda een besluitpagina, dan is er precies
                    één pagina die met de kop "Besluit van het MT" begint, staat
                    de voetregel op diezelfde pagina en begint de pagina erna met
                    een hoofdstukkop (plan 3b; het invulvel moet los te printen
                    zijn);
  paginaverwijzing  pagina 2 draagt gevulde "pagina N"-verwijzingen, geen die
                    leeg renderde, en elke verwijzing wijst binnen het document
                    naar een pagina die met een hoofdstukkop begint (H4). Let
                    op: niet elk hoofdstuk begint op een eigen pagina. De
                    segmentanalyse loopt door op de pagina ervoor (geen
                    `pb sec`), dus een verwijzing daarnaartoe kan hier opduiken
                    zonder dat de verwijzing fout is. Alleen op een echte render
                    te zien; weeg zo'n regel af tegen de pagina zelf voordat je
                    hem als fout aanneemt;
  tabelkop          alleen met --thead: die tabelkop staat op meer dan één
                    pagina, dus hij herhaalt op de vervolgpagina (ronde 2
                    punt c, taak 11); hoofdletterongevoelig, want de kop
                    staat in de tekstlaag zoals text-transform hem toont;
  zijmarge          geen woord staat buiten de linker- of rechtermarge van het
                    vel (16mm), de cover uitgezonderd (die heeft geen marge).
                    Tekst die van het vel loopt, snijdt WeasyPrint stil af;
                    in de HTML is dat niet te zien (stresstest na plan 3a,
                    observatie 8: de werkbeleving in twee kolommen);
  paginaformaat     elke pagina is A4-portret; anders kloppen de marges waarmee
                    de vulling wordt gerekend niet. Deze regel wordt altijd
                    gemeten, ook als de selectie hem niet vraagt: zonder A4 zijn
                    de andere metingen niet te vertrouwen.

Wat dit script NIET doet: het leest een gerenderde PDF en zegt niets over de
waarschuwingen van de renderer zelf. De eis "nul WeasyPrint-warnings" blijft
een aparte controle (de uitvoer van de Docker-image, of de logger-assertie in
tests/test_report_p02_mtvel.py).

Vereist PyMuPDF (`pip install -r requirements-dev.txt`, pakket `pymupdf`).

Gebruik:
  python scripts/check_pdf_report.py docs/examples/voorbeeldrapport_retentiescan.pdf
  python scripts/check_pdf_report.py out.pdf --regel tabelkop --thead "Onderwerp Score"
  python scripts/check_pdf_report.py out.pdf --regel p02-op-een-a4

Exit 0 als alles klopt, 1 met een regel per overtreding, 2 als er niets te
meten valt (bestand onleesbaar, of een regel gevraagd zonder de gegevens die
hij nodig heeft). Het script meet en verzint niets: kan een regel niet gemeten
worden, dan zegt het dat in plaats van te zwijgen.
"""
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass

import pymupdf  # PyMuPDF; `fitz` is dezelfde bibliotheek onder een verouderde naam

# Aandachtspunt voor taak 8: deze grens is ruim. Gemeten op de drie
# voorbeeldrapporten in docs/examples (2026-09-17, nog de render van vóór taak
# 5) haalt de laagste pagina die slaagt 42%, en 38% valt om: de grens ligt dus
# vlak onder een pagina die nog steeds half leeg is. Verhoog MIN_FILL samen met
# de flow-secties van taak 8 en meet opnieuw, anders blijft de grens halflege
# pagina's goedkeuren.
MIN_FILL = 0.40
TOP_PT, BOTTOM_PT = 51.0, 57.0      # @page margins 18mm / 20mm in punten
ZIJMARGE_PT = 45.35                 # @page margin links en rechts, 16mm in punten
ZIJMARGE_TOLERANTIE_PT = 2.0        # afronding van glyphkaders in de tekstlaag
FOOTER_PT = 40.0                    # onderste strook met paginanummer
A4_PT = (595.0, 842.0)              # A4-portret in punten
A4_TOLERANTIE_PT = 3.0

# Aanname plan 3b, door Lars te bevestigen: de laatste vervolgpagina van de
# appendix telt niet mee voor de vullingsregel. Zet op False om dat terug te
# draaien; verder verandert er dan niets.
APPENDIX_STAART_UITGEZONDERD = True

# Markers van de besluitpagina (backend/report_html.py: BESLUIT_TITEL,
# BESLUIT_VOETREGEL en de trustline onder de gespreksagenda). De test
# test_markers_komen_uit_de_renderer bewaakt dat ze gelijk blijven.
BESLUIT_KOP = "Besluit van het MT"
BESLUIT_VOET = "Leg dit besluit ook vast in je dashboard"
BESLUIT_BELOFTE = "Leg het besluit vast op pagina"

# De leidraad op pagina twee draagt vijf tijdvakken met elk een
# paginaverwijzing (backend/report_html.py::_leidraad_block, LEIDRAAD_ANKERS).
# Staat de leidraad op de pagina, dan horen die vijf nummers er gevuld te staan;
# zonder factorprofiel rendert de leidraad bewust niet en hoort p.02 er geen te
# hebben. De marker is de titel van dat blok: wordt die herschreven (taak 13),
# pas hem hier mee aan.
LEIDRAAD_MARKER = "Zo leid je dit gesprek"
LEIDRAAD_MIN_VERWIJZINGEN = 5

# Markers van het meetgegevensblok (backend/report_html.py::_responsbasis):
# de blokkop en het label van de laatste cel in de rij eronder. Elk moet op
# pagina twee als een eigen regel van de tekstlaag staan, hoofdletterongevoelig
# vergeleken. Waarom zo:
#   - hoofdletterongevoelig, want `text-transform: uppercase` zet de tekstlaag in
#     hoofdletters ("MEETGEGEVENS"); hoofdlettergevoelig meldde de regel op elke
#     render een overloop die er niet was (stresstest na plan 3a, observatie 11);
#   - als hele regel, want de leidraad op dezelfde pagina zegt "de meetgegevens
#     op deze pagina"; een losse substring zou dan altijd slagen;
#   - twee markers, want bij de meeste overlopen bleef de kop op pagina twee en
#     schoof alleen de rij naar pagina drie (observatie 9). Alleen de kop meten
#     zou die overloop missen.
# Verandert een van beide labels, dan moet de marker mee; de test
# test_de_markers_van_het_script_komen_uit_de_renderer bewaakt dat.
MEETGEGEVENS_MARKERS = ("Meetgegevens", "Meetperiode")

REGEL_P02 = "p02-op-een-a4"
REGEL_VULLING = "paginavulling"
REGEL_VERWIJZING = "paginaverwijzing"
REGEL_THEAD = "tabelkop"
REGEL_FORMAAT = "paginaformaat"
REGEL_ZIJMARGE = "zijmarge"
REGEL_BESLUIT = "besluit-op-een-a4"
ALLE_REGELS = (REGEL_P02, REGEL_VULLING, REGEL_VERWIJZING, REGEL_THEAD, REGEL_ZIJMARGE,
               REGEL_BESLUIT, REGEL_FORMAAT)

# Een verwijzing waarvan het anker ontbreekt, rendert leeg: WeasyPrint logt
# "Content discarded: target points to undefined anchor" en de tekstlaag houdt
# "op pagina ." of "(pagina )" over. Dat mag nooit als "geen overtreding"
# doorgaan.
#
# Het patroon eist de vorm van een echte verwijzing: elke verwijzing in de copy
# is "(pagina X)" of "op pagina X" (`_leidraad_block`, `_pref`). Zonder die eis
# vangt de regel ook gewone tekst waarin het woord pagina vóór een punt staat,
# en die tekst staat er: "de meetgegevens op deze pagina;", "onderaan deze
# pagina.", "de behoudscontext op de volgende pagina". Dat waren valse
# bevindingen op een correct degraded rapport. Zet de copy een verwijzing in een
# andere vorm, dan hoort die vorm hier ook in.
_LEEGGELOPEN_VERWIJZING = re.compile(r"(?:\(|\bop\s+)pagina\s*(?=[.,;:)\]]|$)")


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


def buiten_de_zijmarge(page: pymupdf.Page) -> list[tuple[float, float, str]]:
    """Woorden die links of rechts buiten de tekstkolom staan, als (x0, x1, woord).

    Gemeten per woord, niet per blok: een blok kan een breed kader beschrijven
    terwijl de tekst erin binnen de kolom blijft. `TEXT_MEDIABOX_CLIP` staat uit,
    anders laat PyMuPDF juist de tekst weg die van het vel loopt en meet deze
    regel minder. Grens van de meting: een woord dat geheel voorbij de
    paginarand begint, levert de tekstlaag ook zo niet op. Een kolom die van
    het vel loopt, heeft altijd woorden die de rand overschrijden; die ziet de
    regel (in de render van observatie 8: "Aandachtsp" tot x=597pt)."""
    flags = pymupdf.TEXTFLAGS_WORDS & ~pymupdf.TEXT_MEDIABOX_CLIP
    links = ZIJMARGE_PT - ZIJMARGE_TOLERANTIE_PT
    rechts = page.rect.width - ZIJMARGE_PT + ZIJMARGE_TOLERANTIE_PT
    return [(w[0], w[2], w[4]) for w in page.get_text("words", flags=flags)
            if w[4].strip() and (w[0] < links or w[2] > rechts)]


def _regels(page: pymupdf.Page) -> set[str]:
    """De regels van de tekstlaag, genormaliseerd en hoofdletterongevoelig."""
    return {re.sub(r"\s+", " ", r).strip().casefold() for r in page.get_text().splitlines()}


def _niet_a4(page: pymupdf.Page) -> bool:
    breedte, hoogte = page.rect.width, page.rect.height
    return (abs(breedte - A4_PT[0]) > A4_TOLERANTIE_PT
            or abs(hoogte - A4_PT[1]) > A4_TOLERANTIE_PT)


def _begint_met_hoofdstukkop(page: pymupdf.Page) -> bool:
    return bool(re.match(r"^\d{2}\b", first_text(page)))


def _appendix_staart(doc: pymupdf.Document) -> int | None:
    """Index van de laatste vervolgpagina van de appendix, of None.

    De appendix begint op de pagina die met "NN Appendix" opent en loopt tot de
    eerstvolgende pagina die met een hoofdstukkop begint. Alleen een
    vervolgpagina telt: de openingspagina zelf is nooit uitgezonderd.
    """
    start = None
    for i in range(doc.page_count):
        kop = first_text(doc[i]).casefold()
        if start is None:
            if re.match(r"^\d{2}\s+appendix\b", kop):
                start = i
        elif re.match(r"^\d{2}\b", kop):
            return i - 1 if i - 1 > start else None
    return None


def _besluit(doc: pymupdf.Document) -> list[Bevinding]:
    n = doc.page_count
    patroon = r"^\d{2}\s+" + re.escape(BESLUIT_KOP.casefold())
    koppen = [i for i in range(n) if re.match(patroon, first_text(doc[i]).casefold())]
    belooft = any(BESLUIT_BELOFTE.casefold() in _pagina_tekst(doc[i]).casefold() for i in range(n))
    if not koppen:
        if belooft:
            return [Bevinding(REGEL_BESLUIT,
                              f"de gespreksagenda belooft een besluitpagina, maar er is geen pagina "
                              f"die met {BESLUIT_KOP!r} begint")]
        return []
    if len(koppen) > 1:
        return [Bevinding(REGEL_BESLUIT,
                          f"{len(koppen)} pagina's beginnen met {BESLUIT_KOP!r} "
                          f"({[i + 1 for i in koppen]}); het moet er precies één zijn")]
    i = koppen[0]
    bevindingen: list[Bevinding] = []
    if BESLUIT_VOET.casefold() not in _pagina_tekst(doc[i]).casefold():
        bevindingen.append(Bevinding(
            REGEL_BESLUIT, f"pagina {i + 1} draagt de besluitpagina maar niet de voetregel; "
                           f"loopt het invulvel over naar een tweede pagina?"))
    if i + 1 < n and not _begint_met_hoofdstukkop(doc[i + 1]):
        bevindingen.append(Bevinding(
            REGEL_BESLUIT, f"pagina {i + 2}, direct na de besluitpagina, begint niet met een "
                           f"hoofdstukkop: {first_text(doc[i + 1])[:50]!r}"))
    return bevindingen


def check(path: str, thead: str | None = None,
          regels: tuple[str, ...] = ALLE_REGELS) -> list[Bevinding]:
    """Meet de gevraagde regels op de PDF in `path`.

    `thead` is nodig voor de regel `tabelkop`; zonder die tekst valt er niets te
    herhalen en wordt die ene regel overgeslagen (de CLI weigert de combinatie
    `--regel tabelkop` zonder `--thead`, zodat niemand denkt dat er gemeten is).
    """
    doc = pymupdf.open(path)
    try:
        return _check_doc(doc, thead, regels)
    finally:
        doc.close()


def _check_doc(doc: pymupdf.Document, thead: str | None,
               regels: tuple[str, ...]) -> list[Bevinding]:
    bevindingen: list[Bevinding] = []
    n = doc.page_count

    # Het paginaformaat en een te kort document worden altijd gemeld, ook als de
    # selectie ze niet vraagt: zwijgen zou lezen als "gemeten en goed", terwijl
    # er dan juist niets te meten valt.
    afwijkend = [i + 1 for i in range(n) if _niet_a4(doc[i])]
    if afwijkend:
        eerste = doc[afwijkend[0] - 1].rect
        bevindingen.append(Bevinding(
            REGEL_FORMAAT,
            f"pagina {afwijkend} is geen A4-portret (pagina {afwijkend[0]} meet "
            f"{eerste.width:.0f}x{eerste.height:.0f}pt, verwacht "
            f"{A4_PT[0]:.0f}x{A4_PT[1]:.0f}pt); de vulling is dan niet te vertrouwen"))

    if n < 3:
        bevindingen.append(Bevinding(
            REGEL_P02, f"het document heeft {n} pagina('s); pagina 2 en 3 zijn niet te meten"))
        return bevindingen

    p2 = _pagina_tekst(doc[1])
    p3_eerste = first_text(doc[2])

    if REGEL_P02 in regels:
        p2_regels = _regels(doc[1])
        ontbreekt = [m for m in MEETGEGEVENS_MARKERS if m.casefold() not in p2_regels]
        if ontbreekt:
            bevindingen.append(Bevinding(
                REGEL_P02, f"pagina 2 bevat het meetgegevensblok niet volledig "
                           f"(ontbreekt als regel: {', '.join(ontbreekt)}); loopt p.02 over?"))
        if not re.match(r"^0?2\b", p3_eerste):
            bevindingen.append(Bevinding(
                REGEL_P02, f"pagina 3 begint niet met hoofdstuk 02 maar met: {p3_eerste[:60]!r}"))

    if REGEL_VULLING in regels:
        staart = _appendix_staart(doc) if APPENDIX_STAART_UITGEZONDERD else None
        for i in range(1, n - 1):
            if i == staart:
                continue
            f = page_fill(doc[i])
            if f < MIN_FILL:
                bevindingen.append(Bevinding(
                    REGEL_VULLING,
                    f"pagina {i + 1} is {f:.0%} gevuld (< {MIN_FILL:.0%}); "
                    f"begint met {first_text(doc[i])[:50]!r}"))

    if REGEL_BESLUIT in regels:
        bevindingen += _besluit(doc)

    if REGEL_VERWIJZING in regels:
        bevindingen += _verwijzingen(doc, p2)

    if REGEL_ZIJMARGE in regels:
        # Vanaf pagina 2: de cover heeft `margin: 0` en loopt bewust tot de rand.
        for i in range(1, n):
            buiten = buiten_de_zijmarge(doc[i])
            if buiten:
                verste = max(buiten, key=lambda w: max(w[1] - doc[i].rect.width + ZIJMARGE_PT,
                                                       ZIJMARGE_PT - w[0]))
                woorden = " ".join(w[2] for w in buiten[:6])
                bevindingen.append(Bevinding(
                    REGEL_ZIJMARGE,
                    f"pagina {i + 1} heeft {len(buiten)} woord(en) buiten de zijmarge "
                    f"(tot x={verste[1]:.0f}pt op een vel van {doc[i].rect.width:.0f}pt, "
                    f"kolom {ZIJMARGE_PT:.0f}-{doc[i].rect.width - ZIJMARGE_PT:.0f}pt): "
                    f"{woorden[:60]!r}"))

    if thead and REGEL_THEAD in regels:
        # Hoofdletterongevoelig: .item-tbl th en .raster-tbl th staan in
        # `text-transform: uppercase`, dus de tekstlaag draagt de kop in
        # hoofdletters (observatie 11).
        kop = re.sub(r"\s+", " ", thead).strip().casefold()
        pages_with = [i + 1 for i in range(n) if kop in _pagina_tekst(doc[i]).casefold()]
        if len(pages_with) < 2:
            bevindingen.append(Bevinding(
                REGEL_THEAD,
                f"tabelkop {thead!r} staat op {pages_with}, niet op twee pagina's"))

    return bevindingen


def _verwijzingen(doc: pymupdf.Document, p2: str) -> list[Bevinding]:
    """De paginaverwijzingen van pagina twee (H4).

    Drie dingen kunnen misgaan, en geen ervan mag als "geen overtreding" langs
    de meting glippen: een verwijzing die leeg renderde (ontbrekend anker), te
    weinig verwijzingen terwijl de leidraad er vijf hoort te leveren, en een
    nummer dat naar de verkeerde of naar geen pagina wijst.
    """
    bevindingen: list[Bevinding] = []
    n = doc.page_count
    # Tellen doet het op verwijzingen, niet op unieke paginanummers: twee
    # verwijzingen naar dezelfde pagina zijn twee verwijzingen. Anders zakt de
    # telling onder het minimum zodra twee regels naar hetzelfde hoofdstuk
    # wijzen (taak 11 zet de drempeltabel op de methodiekpagina, waar regel 1
    # al naar wijst).
    gevuld = [int(m) for m in re.findall(r"pagina (\d+)", p2)]
    leeg = len(_LEEGGELOPEN_VERWIJZING.findall(p2))

    if leeg:
        bevindingen.append(Bevinding(
            REGEL_VERWIJZING,
            f"pagina 2 draagt {leeg} verwijzing(en) zonder nummer (\"pagina .\"); "
            f"het anker bestaat niet of WeasyPrint gooide de verwijzing weg"))

    if LEIDRAAD_MARKER in p2 and len(gevuld) < LEIDRAAD_MIN_VERWIJZINGEN:
        bevindingen.append(Bevinding(
            REGEL_VERWIJZING,
            f"pagina 2 draagt de leidraad maar {len(gevuld)} gevulde verwijzing(en) "
            f"({gevuld}); dat blok levert er minstens {LEIDRAAD_MIN_VERWIJZINGEN}"))

    for ref in sorted(set(gevuld)):
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
    return bevindingen


def main() -> None:
    # Meldingen dragen accenten en aanhalingstekens uit het rapport; een
    # Windows-console met codepage 1252 zou daarop crashen in plaats van de
    # bevinding te tonen.
    try:
        sys.stdout.reconfigure(errors="replace")
    except (AttributeError, OSError):       # pragma: no cover - afwijkende stream
        pass

    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pdf")
    ap.add_argument("--thead", default=None,
                    help="tabelkop die op de vervolgpagina moet herhalen")
    ap.add_argument("--regel", action="append", choices=list(ALLE_REGELS), default=None,
                    help="beperk de controle tot deze regel (mag meerdere keren)")
    args = ap.parse_args()

    gevraagd = tuple(args.regel) if args.regel else None
    if gevraagd and REGEL_THEAD in gevraagd and not args.thead:
        # Anders zou de slotregel "gemeten: tabelkop" zeggen zonder iets te meten.
        ap.error(f"--regel {REGEL_THEAD} vraagt ook --thead \"<tabelkop>\"; "
                 f"zonder die tekst valt er niets te herhalen")
    if gevraagd and args.thead and REGEL_THEAD not in gevraagd:
        ap.error(f"--thead meet alleen de regel {REGEL_THEAD}, en die staat niet in "
                 f"--regel {' '.join(gevraagd)}")

    regels = gevraagd or ALLE_REGELS
    try:
        bevindingen = check(args.pdf, args.thead, regels)
    except Exception as exc:                       # bestand weg, geen PDF, kapot
        print(f"NIET GEMETEN {args.pdf}: {type(exc).__name__}: {exc}")
        sys.exit(2)

    for b in bevindingen:
        print(f"FOUT {args.pdf}: {b}")
    gemeten = ", ".join(regels)
    if REGEL_THEAD in regels and not args.thead:
        gemeten = gemeten.replace(REGEL_THEAD, f"{REGEL_THEAD} (niet gemeten, geen --thead)")
    if REGEL_FORMAAT not in regels:
        # Het formaat wordt altijd gemeten, ook buiten de selectie; de slotregel
        # hoort dat te zeggen, anders lijkt het alsof het overgeslagen is.
        gemeten += f", {REGEL_FORMAAT} (altijd)"
    if REGEL_VULLING in regels and APPENDIX_STAART_UITGEZONDERD:
        try:
            doc = pymupdf.open(args.pdf)
            staart = _appendix_staart(doc)
            if staart is not None:
                print(f"INFO {args.pdf}: pagina {staart + 1} (staart van de appendix, "
                      f"{page_fill(doc[staart]):.0%} gevuld) is uitgezonderd van de vullingsregel")
            doc.close()
        except Exception:                          # de meting zelf is hierboven al gelukt
            pass
    print(f"{'OK' if not bevindingen else 'NIET OK'} {args.pdf} (gemeten: {gemeten})")
    sys.exit(1 if bevindingen else 0)


if __name__ == "__main__":
    main()
