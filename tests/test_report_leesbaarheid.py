"""Leesbaarheidsronde rapport (spec: 2026-07-13-rapport-leesbaarheidsronde-design.md)."""
from tests.test_report_distribution import _min_retention_data
from backend.report_html import render_retention_report_html


def test_opener_heeft_grote_titel_geen_mono_slabel():
    from backend.report_html import _ChapterCounter
    ch = _ChapterCounter()
    html = ch.opener("Overzichtsprofiel")
    assert '<h2 class="ch-title">Overzichtsprofiel</h2>' in html
    assert 'class="slabel"' not in html


def test_opener_met_kicker():
    from backend.report_html import _ChapterCounter
    ch = _ChapterCounter()
    html = ch.opener("Gespreksagenda", kicker="Eerste managementspoor")
    assert '<span class="ch-kicker">Eerste managementspoor</span>' in html
    assert '<h2 class="ch-title">Gespreksagenda</h2>' in html


def test_vervolg_blijft_klein_mono():
    from backend.report_html import _ChapterCounter
    html = _ChapterCounter.vervolg("Verdieping: Werkdruk")
    assert 'class="slabel"' in html and "vervolg" in html


def test_agenda_na_bewijs_voor_appendix():
    # _min_retention_data() heeft maar 1 factor en n=12 — de appendix wordt pas
    # getoond bij n>20 en >5 factoren (_should_show_appendix); verrijk zodat de
    # appendix daadwerkelijk rendert, anders is de volgordecheck een no-op.
    d = _min_retention_data(n=25)
    d["factor_avgs"] = {
        "leadership": 6.0, "culture": 5.5, "growth": 4.5,
        "compensation": 5.8, "workload": 5.0, "role_clarity": 6.2,
    }
    d["factor_items_map"] = {fk: [(f"{fk}_1", f"Testvraag {fk}")] for fk in d["factor_avgs"]}
    d["org_item_avgs"] = {f"{fk}_1": v for fk, v in d["factor_avgs"].items()}
    html = render_retention_report_html(d)
    # lockstep raster 2026-07-18: agendapagina heet nu "Waar begint het gesprek?"
    # (prioriteringsraster) i.p.v. de oude "Gespreksagenda"-titel.
    agenda = html.find("Waar begint het gesprek?")
    appendix = html.find("Appendix")
    werkbeleving = html.find("Werkbeleving")
    assert -1 not in (agenda, appendix, werkbeleving)
    assert werkbeleving < agenda < appendix, "agenda moet na het bewijs en voor de appendix staan"


def test_geen_erkenning_label_meer():
    # _min_retention_data() heeft maar 1 factor (workload) — verrijk met
    # growth zodat het label daadwerkelijk rendert (zelfde patroon als
    # test_report_design_sprong.py::test_verdieping_vervolg_label).
    d = _min_retention_data()
    d["factor_avgs"] = {"workload": 4.0, "growth": 5.0}
    d["top_fkeys"] = ["growth"]
    d["factor_items_map"] = {
        "workload": [("W1", "Testvraag werkdruk")],
        "growth": [("G1", "Testvraag groei")],
    }
    d["org_item_avgs"] = {"W1": 4.0, "G1": 5.0}
    html = render_retention_report_html(d)
    assert "Groeiperspectief en erkenning" not in html
    assert "Groeiperspectief" in html


def test_page_achtergrond_is_chalk():
    from backend.report_css import build_css, CHALK
    css = build_css("retention")
    import re
    page_rule = re.search(r'@page\s*\{[^}]*\}', css, re.S).group(0)
    assert CHALK in page_rule, "@page moet de chalk-achtergrond dragen (full-bleed)"


def test_sectie_intros_aanwezig():
    # _min_retention_data() heeft open_texts=[] — verrijk lokaal met ≥5
    # niet-lege teksten zodat de Open toelichtingen-sectie (gegated door
    # _should_show_quotes, MIN_QUOTES_N=5) daadwerkelijk rendert (zelfde
    # patroon als test_geen_erkenning_label_meer hierboven).
    # Sinds taak 8 (B9) rendert de werkbelevingssectie alleen met echte
    # dimensiescores -- een lege kaart plus een hoofdstuknummer was precies de
    # halflege pagina die B9 aanpakt. Deze test gaat over de intro's, dus krijgt
    # de fixture ook SDT-data, zoals hij hierboven al open toelichtingen krijgt.
    d = _min_retention_data()
    d["open_texts"] = [
        "Meer ruimte voor overleg met mijn leidinggevende zou helpen.",
        "De werkdruk voelt af en toe te hoog aan.",
        "Ik mis duidelijke doorgroeimogelijkheden.",
        "Communicatie tussen teams kan beter.",
        "Over het algemeen ben ik tevreden over de sfeer.",
    ]
    d["sdt_avgs"] = {"autonomy": 6.1, "competence": 6.4, "relatedness": 6.0}
    d["sdt_item_avgs"] = {"B1": 6.1}
    d["sdt_items"] = [("B1", "Ik bepaal zelf hoe ik mijn werk indeel")]
    html = render_retention_report_html(d)
    for frase in [
        "samenvattende groepsscore",          # behoudscontext: opbouw behoudssignaal
        "drie stellingen over hetzelfde thema", # overzichtsprofiel: wat is een factor
        "basisbehoeften",                       # werkbeleving/SDT: waarom gemeten
        "ontvangstvolgorde",                    # open toelichtingen: selectie
    ]:
        assert frase in html, f"sectie-intro mist: {frase}"


def test_bronregel_managementvraag():
    from backend.report_html import _bestuurlijke_read
    html = _bestuurlijke_read(
        kernzin="K.", primary_label="Groeiperspectief",
        why_cells_html="",
        mgmt_q="Vraag?",
        mgmt_q_source="Gebaseerd op de laagst scorende factor.")
    assert '<span class="mq-source">Gebaseerd op de laagst scorende factor.</span>' in html


def test_leidraad_op_openingspagina():
    # Plan 3a taak 5 (H5): de leidraad vervangt het gebruiksblok, vóór de meetgegevens.
    # Met werkbeleving erin: zonder afdelingen, toelichtingen én werkbeleving
    # heeft regel 4 geen sectie om naar te verwijzen en rendert de leidraad
    # bewust niet (codereview taak 5, minor g).
    data = _min_retention_data()
    data["sdt_avgs"] = {"autonomy": 5.5, "competence": 6.0, "relatedness": 6.5}
    html = render_retention_report_html(data)
    assert "Zo leid je dit gesprek in 45 minuten" in html
    assert html.find("Zo leid je dit gesprek") < html.find("Meetgegevens")


def test_priority_factors_alleen_organisatiefactoren():
    # SDT-dimensies (autonomy e.d.) zitten in scoring.py's factor_averages maar
    # hebben geen verdieping-stellingen: als prioritaire factor renderden ze een
    # lege verdiepingspagina (bug 2026-07-13). De selectie filtert ze nu weg.
    from backend.report_html import _select_priority_factors
    fa = {"workload": 5.0, "growth": 4.0, "autonomy": 3.0,
          "competence": 3.5, "relatedness": 3.2}
    picked = _select_priority_factors(fa, {}, max_n=3)
    assert "autonomy" not in picked and "competence" not in picked
    assert picked[0] == "growth"          # laagste organisatiefactor eerst
