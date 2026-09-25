from __future__ import annotations

from backend.report_fonts import font_face_css

# Amber is het enige accent (huisaccent, conform homepage-design system).
# Onderscheid tussen producten loopt via de eyebrow-tekst, niet via kleur.
# Beslissing 2026-06-13: "amber overal" gekozen na visuele vergelijking van
# amber/teal/bruin covers — teal/bruin oogden gedempt tegen navy.
_AMBER = {"accent": "#E8A020", "accent_lo": "#B07A10"}
ACCENTS: dict[str, dict[str, str]] = {
    "exit":               dict(_AMBER),
    "retention":          dict(_AMBER),
    "onboarding":         dict(_AMBER),
    "culture_assessment": dict(_AMBER),
}

# Gedeelde merkkleuren (design system)
NAVY     = "#0D1B2A"
GRAPHITE = "#1E2D3D"
STEEL    = "#4A6070"
CHALK    = "#F4F1EA"
INK      = "#0D1B2A"
HAIRLINE = "rgba(13,27,42,0.12)"

# RAG-band (drempelkleuren overzichtsprofiel)
RAG_HIGH = "#C0392B"
RAG_MID  = "#C17C00"
RAG_LOW  = "#3C8D8A"


def build_css(scan_type: str = "exit") -> str:
    acc = ACCENTS.get(scan_type, ACCENTS["exit"])
    accent = acc["accent"]
    accent_lo = acc["accent_lo"]
    return font_face_css() + r"""
@page {
  size: A4;
  margin: 18mm 16mm 20mm 16mm;
  background: """ + CHALK + r""";
  @bottom-left {
    content: "VERTROUWELIJK · LOEP · GROEPSOUTPUT";
    font-family: 'JetBrains Mono', monospace;
    font-size: 7px; letter-spacing: 0.12em; color: """ + STEEL + r""";
  }
  @bottom-right {
    content: counter(page) " / " counter(pages);
    font-family: 'JetBrains Mono', monospace;
    font-size: 7px; letter-spacing: 0.12em; color: """ + STEEL + r""";
  }
}
@page cover-page { margin: 0; background: """ + NAVY + r"""; }

* { box-sizing: border-box; margin: 0; padding: 0; border-radius: 0; }

body {
  font-family: 'Inter', Arial, sans-serif;
  font-size: 11px; line-height: 1.6; color: #243247;
}

.pb       { break-before: page; }
.no-break { break-inside: avoid; }

/* ── Eyebrow (mono) ── */
.eyebrow {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 500;
  letter-spacing: 0.18em; text-transform: uppercase; color: """ + accent_lo + r""";
}
.eyebrow.on-dark { color: """ + accent + r"""; }

/* ── Section label ── */
.slabel {
  display: flex; align-items: center;
  font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase; color: """ + INK + r""";
  margin-bottom: 18px;
}
.slabel::after { content: ""; flex: 1; height: 1px; margin-left: 12px; background: """ + HAIRLINE + r"""; }

/* ── Paginakop (feedback 2026-07-16): nummer + titel op één regel, beide in
   dezelfde amber; de titel is het dominante element, de kicker eronder blijft
   klein. Bewust de donkere amber (accent_lo) i.p.v. #E8A020: het lichte
   merkamber haalt op chalk maar ~2:1 contrast — te zwak voor de hoofdtitel. ── */
.ch-head { margin-bottom: 10px; }
.ch-idx { font-family: 'JetBrains Mono', monospace; font-size: 25px; font-weight: 700;
  color: """ + accent_lo + r"""; margin-right: 12px; vertical-align: baseline; }
.ch-rule { border: none; border-top: 3px solid #0D1B2A; width: 48px;
  margin: 0 0 14px 0; }
.ch-kicker { display: block; font-family: 'JetBrains Mono', monospace; font-size: 9px;
  letter-spacing: 0.14em; text-transform: uppercase; color: """ + STEEL + r"""; margin: -4px 0 14px; }
.ch-title { display: inline; font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 25px;
  letter-spacing: -0.03em; color: """ + accent_lo + r"""; line-height: 1.1; }
.sec-intro { font-size: 10.5px; color: #4A5B6E; line-height: 1.7; max-width: 72ch;
  margin: -4px 0 18px; }
/* Label bij de vetgedrukte (laagst scorende) stelling in de itemtabellen —
   maakt de betekenis van het vet expliciet (feedback 2026-07-16). */
.low-tag { font-family: 'JetBrains Mono', monospace; font-size: 7.5px; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase; color: """ + accent_lo + r"""; margin-left: 7px; }
/* Titel boven een grote spreidingsbalk op de eigen spreidingspagina */
.spread-title { font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 13px;
  color: """ + INK + r"""; margin-bottom: 2px; }
.mq-source { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.04em;
  color: """ + STEEL + r"""; margin-top: 5px; display: block; }
/* Paginaverwijzing (H4): WeasyPrint vult het nummer via target-counter; in
   Chromium (stresstest-harnas) blijft het anker leeg. De tekst ervoor zegt
   "pagina ". Geverifieerd in ghcr.io/weasyprint/weasyprint op 2026-09-16. */
a.pref { text-decoration: none; color: inherit; }
a.pref::after { content: target-counter(attr(href), page); }
/* Leidraad (spec par. 4 blok 5) */
.leidraad { margin-top: 18px; border-top: 1px solid """ + HAIRLINE + r"""; padding-top: 12px; }
.leidraad-title { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 13px; color: """ + INK + r"""; margin-bottom: 6px; }
.leidraad table { width: 100%; border-collapse: collapse; }
.leidraad td { font-size: 10px; color: #374151; padding: 3px 6px 3px 0; vertical-align: top; border-bottom: 1px solid """ + HAIRLINE + r"""; line-height: 1.45; }
.leidraad td.lt { width: 13%; font-family: 'JetBrains Mono', monospace; font-size: 8.5px; color: """ + STEEL + r"""; white-space: nowrap; }
.leidraad td.lw { width: 34%; font-weight: 600; color: """ + INK + r"""; }

/* ── Headings ── */
h2 { font-family: 'Inter Tight', sans-serif; font-weight: 800;
     letter-spacing: -0.03em; font-size: 22px; color: """ + INK + r"""; line-height: 1.05; }
/* h3 — see bottom of file */
p  { margin-bottom: 6px; font-size: 11px; }

/* ── Cover ── */
.cover { page: cover-page; background: """ + NAVY + r"""; height: 297mm; min-height: 297mm;
  padding: 64px 56px 48px; position: relative; color: #fff; overflow: hidden; }
.cover-rings { position: absolute; top: -120px; right: -120px; width: 420px; height: 420px;
  border: 1px solid rgba(232,160,32,0.10); border-radius: 9999px; }
.cover-rings::before { content: ""; position: absolute; top: 60px; right: 60px; bottom: 60px; left: 60px;
  border: 1px solid rgba(232,160,32,0.07); border-radius: 9999px; }
.cover-rings::after { content: ""; position: absolute; top: 130px; right: 130px; bottom: 130px; left: 130px;
  border: 1px solid rgba(232,160,32,0.05); border-radius: 9999px; }
.cover-top { display: flex; justify-content: space-between; align-items: baseline; }
.cwm { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 17px;
  letter-spacing: -0.02em; color: #fff; }
.cwm .dot { color: """ + accent + r"""; }
.cconf { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.16em;
  text-transform: uppercase; color: rgba(255,255,255,0.55); }
.ceyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.20em;
  text-transform: uppercase; color: """ + accent + r"""; margin-top: 150px; }
.cbar { width: 56px; height: 3px; background: """ + accent + r"""; margin: 22px 0 26px; }
.ctitle { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 46px;
  letter-spacing: -0.04em; line-height: 0.98; color: #fff; max-width: 16ch; }
.csub { font-family: 'Inter', sans-serif; font-size: 13px; color: rgba(255,255,255,0.62);
  margin-top: 22px; }
/* H15: wie dit rapport mag zien. Kleiner dan .csub en met een leesbreedte, want
   het is een voorwaarde bij het rapport en geen titelregel. */
.cdist { font-size: 10px; color: rgba(255,255,255,0.55); margin-top: 10px;
  max-width: 60ch; line-height: 1.5; overflow-wrap: break-word; }
/* B10: expliciete breedte + table-layout: fixed, anders laat WeasyPrint de
   auto-width tabel meegroeien met een lange factornaam tot buiten de pagina.
   Geen flex-gap, custom properties of inset-shorthand hier: WeasyPrint
   negeert die stilzwijgend (zie beslissingslog 2026-07-05). */
/* .cmeta is een gewoon blok: met left+right EN een breedte zou de breedte
   winnen en de rechtermarge wegvallen (CSS 2.1 10.3.7), waardoor de tabel
   56px buiten de pagina stak. Als blok lost de breedte op naar de ruimte
   tussen de marges; .cmeta-row rekent zijn 100% daar tegenaf. */
.cmeta { position: absolute; left: 56px; right: 56px; bottom: 56px;
  border-top: 1px solid rgba(255,255,255,0.14); padding-top: 22px; }
.cmeta-row { display: table; width: 100%; table-layout: fixed; }
.cmc { display: table-cell; width: 33.33%; padding-right: 18px; vertical-align: top;
  overflow-wrap: break-word; word-wrap: break-word; }
.cml { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 4px; }
.cmv { font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 22px; color: #fff;
  white-space: normal; line-height: 1.05; }  /* white-space expliciet als guard */
.cmv-long { font-size: 15px; }

/* .card, .why, h3, .slabel — see bottom of file (overrides with more whitespace) */

/* ── Stat grid ── */
.sg { display: table; width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 14px; }
.sg td { display: table-cell; background: transparent; border: none; border-right: 1px solid """ + HAIRLINE + r"""; padding: 0 22px 0 0; margin-right: 22px; vertical-align: top; width: 25%; }
.sg td:last-child { border-right: none; padding-right: 0; }
.sc-l { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.1em;
  text-transform: uppercase; color: """ + STEEL + r"""; margin-bottom: 4px; }
.sc-v { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 24px; color: """ + INK + r"""; line-height: 1.1; }
.sc-b { font-size: 9px; color: """ + STEEL + r"""; margin-top: 2px; line-height: 1.4; }

/* ── Signaalrijen (behoudscontext e.d.): titel -> uitleg -> score, onder elkaar
   i.p.v. naast elkaar, zodat de uitleg niet wegvalt onder de score ── */
.sigrow { border-top: 1px solid """ + HAIRLINE + r"""; padding: 12px 0; }
.sigrow:first-child { border-top: none; padding-top: 0; }
.sigrow-title { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 14px; color: """ + INK + r"""; margin-bottom: 4px; }
.sigrow-body { font-size: 10.5px; color: #374151; line-height: 1.5; margin-bottom: 6px; }
.sigrow-score { font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 15px; }
.sigrow-note { font-size: 9px; color: """ + STEEL + r"""; font-weight: 500; margin-left: 6px; }

/* ── Factor bars ── */
.fbar-row { display: table; width: 100%; margin-bottom: 9px; }
.fbar-name { display: table-cell; width: 32%; font-size: 11px; font-weight: 600; color: """ + INK + r"""; vertical-align: middle; padding-right: 10px; }
.fbar-track { display: table-cell; width: 40%; vertical-align: middle; }
.fbar-score { display: table-cell; width: 10%; text-align: right; vertical-align: middle;
  font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 13px; }

/* ── Item table ── */
.item-tbl { width: 100%; border-collapse: collapse; }
/* overflow-wrap zoals .app-tbl td: in een halve kolom (werkbeleving in twee
   kolommen) moet een lange stelling kunnen afbreken in plaats van de kolom uit
   te duwen. */
.item-tbl td { padding: 7px 8px; vertical-align: middle; font-size: 10px; color: #374151;
  border-bottom: 1px solid """ + HAIRLINE + r"""; overflow-wrap: break-word; }
.item-tbl .iq { width: 56%; }
.item-tbl .is { width: 10%; font-weight: 700; text-align: right; }
/* Kolomkoppen (C9, taak 11): de afdelingstabel en de drempeltabel dragen er een,
   in dezelfde monotypografie als .raster-tbl th. table-header-group laat
   WeasyPrint de kop herhalen op een vervolgpagina. */
.item-tbl th { text-align: left; font-family: 'JetBrains Mono', monospace; font-size: 8px;
  text-transform: uppercase; letter-spacing: 0.08em; color: """ + STEEL + r""";
  border-bottom: 1.5px solid """ + NAVY + r"""; padding: 4px 8px; }
.item-tbl thead { display: table-header-group; }
/* De segmenttabel mag over een paginagrens lopen sinds de rijlimiet verviel
   (ronde 2 par. 3.2). break-inside op de <tr> doet onder border-collapse:
   collapse niets in WeasyPrint, dus staat elke afdeling in haar eigen tbody
   (zelfde patroon als tbody.r-grp in het prioriteringsraster). */
.item-tbl tbody.seg-grp { break-inside: avoid; }
/* Segmentsectie compacter (fixronde na plan 3a, observatie 10): de sectie was
   net iets hoger dan een vel, dus viel de conclusie eronder los op een eigen
   pagina. */
.item-tbl.seg-tbl td { padding: 4px 8px; }
.sub-cols { width: 100%; table-layout: fixed; border-collapse: collapse; }
.sub-cols td { vertical-align: top; width: 50%; padding: 0 10px 0 0; }
.sub-cols td + td { padding: 0 0 0 10px; }
.sub-cols td[colspan] { padding: 0; }
.sub-cols tbody.sub-grp { break-inside: avoid; }
.empty-state.seg-leeg { padding: 8px 14px; }
/* De melding zonder afdelingstabel volgt direct op de werkbeleving (geen eigen
   vel). De negatieve marge verkleint de samengevallen witruimte tussen beide
   van 44px naar 20px, zodat kop en melding samen nog onder een volle
   werkbelevingspagina passen. */
.sec.seg-status { margin-top: -24px; }

/* ── Quote / theme ── */
.theme-card { background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 14px 16px; margin-bottom: 10px; }
.theme-badge { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase; color: """ + accent_lo + r"""; }
.quote-txt { font-size: 11px; color: #374151; font-style: italic; line-height: 1.6;
  margin-top: 8px; padding-left: 12px; border-left: 2px solid """ + accent + r"""; }
.quote-anon { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.1em;
  text-transform: uppercase; color: #94A3B8; margin-top: 5px; }

/* ── B13: "Anders"-toelichtingen onder een verdeling ── */
/* 10px en niet kleiner: de leesbaarheidsronde van 2026-07-09 heeft juist de
   eerlijkheidsregels (staffels, noemers, caveats) naar 10px getild, en dit is
   er een van. overflow-wrap zoals .item-tbl td en .cmc: een toelichting mag
   200 tekens zijn en kan in een halve kolom staan (de twee richtingkaarten
   naast elkaar), dus een lange reeks zonder spatie moet afbreken in plaats van
   de kaart over de marge te duwen. */
.anders-kop { font-size: 10px; color: #374151; margin: 8px 0 0; line-height: 1.5;
  overflow-wrap: break-word; word-wrap: break-word; }
.anders-note { font-size: 10px; color: """ + STEEL + r"""; margin: 2px 0 0; line-height: 1.5; }
/* margin-bottom en line-height iets krapper dan de andere quote-blokken op deze
   pagina (fix scenario 14): dit is de enige lijst die tot MAX_QUOTES items kan
   tellen binnen een kaart die al twee andere blokken (verdeling + tellingen)
   draagt, en bij veel "Anders"-antwoorden werd zij zelf de reden dat de
   eerstvolgende (atomaire) gespreksagenda-sectie niet meer op dezelfde pagina
   paste en alleen op een volgende vel terechtkwam. Blijft ruim leesbaar. */
.anders-list { font-size: 10px; color: #374151; margin: 4px 0 0; padding-left: 16px; }
.anders-list li { margin-bottom: 1px; line-height: 1.35;
  overflow-wrap: break-word; word-wrap: break-word; }
.anders-anon { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.1em;
  text-transform: uppercase; color: #94A3B8; margin: 5px 0 0; }

/* ── Steps ── */
.steps { display: table; width: 100%; border-collapse: separate; border-spacing: 10px 0; }
.step { display: table-cell; background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 14px 16px; vertical-align: top; width: 25%; }
.step-no { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; letter-spacing: 0.1em;
  text-transform: uppercase; color: """ + accent_lo + r"""; margin-bottom: 4px; }
.step-body { font-size: 10px; color: #374151; line-height: 1.55; }

/* ── Invulbaar veld (eigenaarschap wordt in de bespreking bepaald, niet door Loep) ── */
.step-fill { border-bottom: 1px dashed #94A3B8; height: 15px; margin-bottom: 4px; }
.step-fill-hint { font-size: 7.5px; font-style: italic; color: #94A3B8; line-height: 1.4; margin-bottom: 6px; }
/* ── Sub-label boven een invulregel binnen één kaart (bijv. "Uit de bespreking":
   Prioriteit/Eigenaar/Vervolgmoment onder elkaar) ── */
.step-sublbl { font-family: 'JetBrains Mono', monospace; font-size: 7.5px; letter-spacing: 0.06em;
  text-transform: uppercase; color: #64748B; margin: 7px 0 3px; }
.agenda-dark .step-sublbl { color: #9FB0C0; }

/* ── Navy agenda-anker (designsprong §2a): het hele agendablok als donker vlak ──
   break-inside: avoid voorkomt dat het blok halverwege een pagina-einde
   afbreekt (zelfde patroon als .mgmt-anchor/.play hieronder) — zonder deze
   regel splitst WeasyPrint het blok en blijft er op de vorige pagina een
   lege navy vlek achter terwijl de invulregels alleen op de volgende pagina
   verschijnen (gevonden tijdens Taak 9-visuele verificatie, prioriteringsraster). */
.agenda-dark { background: #0D1B2A; padding: 18px 20px; margin-top: 4px; break-inside: avoid; }
.agenda-dark .step { background: transparent; border: 1px solid #2A3D52; }
.agenda-dark .step-no { color: #E8A020; }
.agenda-dark .step-body { color: #E7E2D6; }
.agenda-dark .step-fill { border-bottom: 1px dashed #5B6B7C; }
.agenda-dark .step-fill-hint { color: #8CA0B3; }
.agenda-why { display: block; font-family: 'JetBrains Mono', monospace; font-size: 8px;
  letter-spacing: 0.04em; color: #9FB0C0; margin-top: 7px; line-height: 1.5; }
/* De drie invulregels naast elkaar in plaats van onder elkaar: onder elkaar
   was het navy blok bijna een derde vel hoog en viel het, met de slotregel,
   los op een eigen pagina (30 tot 32%, in 15 alleen de slotregel op 1%;
   fixronde na plan 3a). De slotregel reist mee in .agenda-slot. */
.fill-steps .step { width: 33.3%; padding: 10px 12px; }
.fill-steps .step-sublbl { margin-top: 0; }
.fill-steps .step-fill-hint { margin-bottom: 0; }
.agenda-slot .agenda-dark { padding: 10px 16px; }
.agenda-slot .agenda-opener { margin-top: 0; border-top: none; padding-top: 10px; margin-bottom: 12px; }
.agenda-opener { border-left: 3px solid #E8A020; border-top: 1px solid #2A3D52;
  padding: 14px 0 0 16px; margin-top: 16px; }

/* ── Navy conclusie-anker (designsprong §2b): zelfde taal als .agenda-opener,
   herbruikt buiten de agenda (bijv. segmentconclusie). break-inside: avoid
   zoals .agenda-dark, dat dezelfde navy-vlakken gebruikt: een conclusieblok
   halverwege afgekapt leest als twee losse fragmenten. ── */
.navy-anchor { background: #0D1B2A; border-left: 3px solid #E8A020; padding: 14px 16px; margin-top: 12px; break-inside: avoid; }
.navy-anchor-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.14em;
  text-transform: uppercase; color: #E8A020; margin-bottom: 6px; }
.navy-anchor p { margin: 0; font-size: 11px; line-height: 1.55; color: #F4F1EA; }

/* ── Prioriteringsraster (spec 2026-07-18) ── */
.raster-tbl { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 12px; }
.raster-tbl th { text-align: left; font-family: 'JetBrains Mono', monospace; font-size: 8px;
  text-transform: uppercase; letter-spacing: 0.08em; color: """ + STEEL + r""";
  border-bottom: 1.5px solid """ + NAVY + r"""; padding: 4px 7px; }
/* De kop staat in een <thead> (ronde 2 observatie 4): zonder deze regel herhaalt
   WeasyPrint hem niet en begint een vervolgpagina met kolommen zonder naam. */
.raster-tbl thead { display: table-header-group; }
.raster-tbl td { border-bottom: 1px solid """ + HAIRLINE + r"""; padding: 6px 7px; vertical-align: top; }
.raster-tbl tr.r-top td { background: """ + NAVY + r"""; color: """ + CHALK + r"""; }
.raster-tbl tr.r-top .r-fl { color: """ + accent + r"""; font-weight: 600; }
.r-mono { font-family: 'JetBrains Mono', monospace; font-size: 8px; color: """ + STEEL + r"""; }
.raster-tbl tr.r-top .r-mono { color: #94A3B8; }
.raster-tbl tbody.r-grp { break-inside: avoid; }
.raster-tbl tr.r-has-note td { border-bottom: none; }
.raster-tbl tr.r-note td { padding: 0 8px 8px; font-size: 9.5px;
  line-height: 1.45; color: #4A6070; }
.r-legend { font-size: 10px; color: """ + STEEL + r"""; margin-top: 6px; }
.r-uitleg { font-size: 10px; color: #374151; margin-top: 10px; line-height: 1.5;
  border-left: 3px solid """ + accent + r"""; padding-left: 9px; }
.r-gate { font-size: 10px; color: """ + STEEL + r"""; margin-top: 6px; font-style: italic; }

/* ── Richtingblok "Wat er moet gebeuren" ── */
/* .dir-block zelf is NIET meer break-inside: avoid (fix scenario 14, plan 3b
   regressie): de eyebrow/intro/totaalregel zijn gewone tekst en mogen normaal
   meebreken met de pagina, zoals elke andere alinea in het rapport. Alleen de
   kaartentabel (.dir-grid hieronder) mag niet middenin splitsen. Vóór deze
   wijziging maakte break-inside: avoid op de hele .dir-block het tekstblok
   vóór de tabel net zo onbreekbaar als de tabel zelf, waardoor dat hele blok
   (tekst + tabel) als één stuk een nieuwe pagina moest openen zodra het niet
   meer in de resterende ruimte paste -- en daarmee te weinig ruimte overliet
   voor de agenda-slot erna, die dan alleen en te leeg op de pagina daarna
   belandde (scenario "35% kiest 'Anders'"). Zonder de wrapper-brede regel kan
   de tekst vóór de tabel meestromen met wat er nog past, zodat de tabel (en
   dus ook wat erna komt) eerder ruimte vindt. */
.dir-block { margin-top: 18px; }
/* Raster zonder richtingblok (plan 3b, regressiefix): de regels onder de tabel
   en het agendaslot breken niet los van de laatste rasterrij. Past het slot
   niet meer, dan reizen de laatste rijen mee in plaats van dat het slot alleen
   op een vel belandt. Zie _prioriteringsraster. */
.raster-mee .r-legend, .raster-mee .r-gate, .raster-mee .r-uitleg,
.raster-mee .mq-brug-sec, .raster-mee .agenda-slot { break-before: avoid; }
.dir-intro { font-size: 10px; color: #374151; line-height: 1.5; margin: 4px 0 10px; max-width: 70ch; }
.dir-grid { width: 100%; border-collapse: separate; border-spacing: 12px 0; break-inside: avoid; }
.dir-card { width: 50%; vertical-align: top; background: #FFFFFF; border-left: 3px solid """ + HAIRLINE + r"""; padding: 12px 14px; }
.dir-card.dir-clear { border-left-color: """ + accent + r"""; }
/* De too_few-kaart heeft geen bronregel, tabel of caveat en is dus veel korter dan
   haar buur; de tabelrij dwingt beide cellen op dezelfde hoogte. Verticaal centreren
   haalt de dode witruimte onderin weg. Table-native, geen flex: WeasyPrint. */
.dir-card.dir-too_few { vertical-align: middle; }
.dir-role { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; color: """ + accent_lo + r"""; margin-bottom: 6px; }
.dir-head { font-size: 14px; font-weight: 700; line-height: 1.3; color: """ + NAVY + r"""; margin-bottom: 6px; }
.dir-src { font-size: 10px; color: #374151; margin-bottom: 8px; }
.dir-tbl td { font-size: 9.5px; padding: 5px 6px; }
/* De scorekolom draagt sinds B14 de volle tellingsvorm ("27 van de 62 (44%)",
   ongeveer 91px): in een halve kaart geeft auto-layout die kolom ongeveer 59px,
   waardoor de telling over twee regels viel en niet meer als één getal las.
   Vaste breedtehint plus nowrap; de vraagkolom ernaast breekt wel af
   (.item-tbl td heeft overflow-wrap: break-word). */
.dir-tbl .is { width: 34%; white-space: nowrap; }
.dir-caveat { font-size: 10px; color: #92400E; margin: 4px 0 0; }
.dir-chain { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; color: """ + STEEL + r"""; margin-top: 8px; }
/* De sluitende totaalregel boven de kaarten (B14, H19) verantwoordt álle
   richtingantwoorden en is daarmee een eerlijkheidsregel, niet een voetnoot in
   een kaart: leesbare 10px in de gewone letter, zoals .dir-intro erboven. De
   maat staat hier en niet inline, zodat er één plek is (codereview taak 9). */
.dir-chain.dir-totals { font-family: inherit; font-size: 10px; line-height: 1.5;
  color: #374151; max-width: 70ch; margin: 0 0 10px;
  /* Niet splitsen over een paginagrens: in stresstest 06 liepen twee regels van
     deze noemerzin als wees boven de gespreksagenda door (hoofdsessie 22-9). */
  break-inside: avoid; page-break-inside: avoid; }

/* ── Werkvragen "Zo maak je er een besluit van" (plan 3b) ── */
/* Hefboom E (fixronde leesronde, Taak 10): de weging onder de verdeeld-zin maakte
   het agendaslot (no-break) 31 tot 42pt hoger, en dan verhuisde het slot in
   10, 15 en voorbeeldrapport_loep naar een eigen vel. De marges hier, de
   celpadding en de navy-marges in .agenda-slot zijn daarom krapper; gemeten
   in het productie-image (10 en 15 eindigen op y=781/780 van ongeveer 783). */
.wq-block { margin-top: 10px; break-inside: avoid; }
.wq-card { width: 50%; vertical-align: top; background: #FFFFFF; border-left: 3px solid """ + accent + r"""; padding: 10px 14px; }
.wq-tbl { width: 100%; border-collapse: collapse; }
.wq-tbl td { font-size: 10px; line-height: 1.42; color: #374151; padding: 3px 0; vertical-align: top; border-bottom: 1px solid """ + HAIRLINE + r"""; }
.wq-tbl tr:last-child td { border-bottom: none; }
/* Met td erbij: anders wint .wq-tbl td (klasse + element) en vallen maat,
   kleur en padding-right hier weg; dan liep het label tegen de vraag aan
   ("BESLUITENWat spreken", code review Taak 10). */
.wq-tbl td.wq-stap { width: 22%; font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.1em; text-transform: uppercase; color: """ + accent_lo + r"""; padding-right: 8px; }
.wq-hint { font-size: 8.5px; font-style: italic; color: """ + STEEL + r"""; margin-top: 4px; }
/* De weging onder de verdeeld-zin (R6/V9, fixronde 24-9) is een leesregel, geen
   voetnoot: daarom niet de 8,5px van .wq-hint maar minstens 9,5px. */
.wq-weging { font-size: 9.5px; line-height: 1.4; font-style: italic; color: """ + STEEL + r"""; margin-top: 4px; }

/* ── Besluitpagina "Besluit van het MT" (plan 3b): lijnen voor de pen ── */
/* break-after: de appendix stroomt (.sec zonder .pb) en zou anders onder het
   invulvel beginnen; dat vel moet los te printen zijn. */
.besluit { break-inside: avoid; break-after: page; }
.bl-rij, .bl-drie { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 14px; }
.bl-cel { width: 50%; vertical-align: top; padding-right: 18px; }
.bl-drie td { width: 33.3%; vertical-align: top; padding-right: 14px; }
.bl-drie .bl-lbl { margin-top: 4px; font-size: 7.5px; }
.bl-blok { margin-top: 16px; break-inside: avoid; }
.bl-lbl { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; letter-spacing: 0.12em; text-transform: uppercase; color: """ + accent_lo + r"""; margin: 10px 0 2px; }
.bl-vast { font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 13px; color: """ + INK + r"""; padding: 4px 0 2px; }
.bl-line { border-bottom: 1px solid #94A3B8; height: 24px; }
.bl-hint { font-size: 8.5px; font-style: italic; color: """ + STEEL + r"""; margin-top: 4px; }
.bl-tekst { font-size: 11px; line-height: 1.55; color: """ + INK + r"""; padding: 4px 0 6px; border-bottom: 1px solid """ + HAIRLINE + r"""; }
.bl-status { font-size: 9.5px; color: """ + STEEL + r"""; margin: 8px 0 0; font-style: italic; }
.mq-direction { font-size: 11px; font-weight: 600; color: """ + NAVY + r"""; margin: 8px 0 0; }
.mq-brug { font-size: 10.5px; color: #374151; margin: 8px 0 0; }
/* Dezelfde brugzin op een eigen sectie (gespreksagenda) staat na een tabel en
   krijgt daar iets meer lucht. Als klasse en niet als inline style, zodat de
   maat op één plek staat. */
.mq-brug-sec { margin-top: 10px; }

/* ── Trust / methodiek ── */
.tg { display: table; width: 100%; border-collapse: separate; border-spacing: 10px 0; }
.tc { display: table-cell; background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 14px 15px; vertical-align: top; width: 33%; }
.tc-full { display: table-cell; background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 14px 15px; vertical-align: top; width: 100%; }
.tt { font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 11px; color: """ + INK + r"""; margin-bottom: 4px; }
.tb { font-size: 9px; color: #374151; line-height: 1.55; }

/* ── Two-col / appendix / misc ── */
.tcol { display: table; width: 100%; border-collapse: separate; border-spacing: 14px 0; }
.tc-l { display: table-cell; vertical-align: top; width: 55%; }
.tc-r { display: table-cell; vertical-align: top; width: 45%; }
/* table-layout: fixed + expliciete kolombreedtes: elke factortabel in de
   appendix is een los <table>-element, dus zonder vaste breedtes schuiven
   Gem./Beeld per sectie mee met de langste vraagtekst in díé tabel. */
.app-tbl { width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed; }
.app-tbl th { background: #EFE9DD; color: """ + STEEL + r"""; font-weight: 700; padding: 5px 8px;
  text-align: left; border-bottom: 1px solid """ + HAIRLINE + r"""; }
.app-tbl td { padding: 4px 8px; border-bottom: 1px solid """ + HAIRLINE + r"""; overflow-wrap: break-word; }
.app-tbl .aq { width: 62%; }
.app-tbl .as { width: 10%; }
.app-tbl .ab { width: 28%; }
.sec { margin-bottom: 44px; }
/* Flow-sectie (B9): blijft bij elkaar en opent geen eigen vel. Een sectie die
   niet meer past gaat als geheel naar de volgende pagina, zodat de tweede en
   derde verdiepingspagina de ruimte onder hun voorganger vullen in plaats van
   elk een eigen halflege vel te openen. Geen break-before: auto -- die klasse
   draagt geen .pb, dus er staat niets terug te zetten (codereview taak 8). */
.sec.flow { break-inside: avoid; margin-top: 30px; }
/* Werkbeleving in twee kolommen (B9): 287mm in een kolom werd 233mm, dus een
   pagina minder. Via de bestaande .tcol-tabel (display: table), niet via
   column-count of flex met gap: WeasyPrint kent geen gap op flex en verdeelt
   kolommen van een multicol-blok niet over paginagrenzen. De appendix staat
   bewust NIET in twee kolommen: daar spaarde het geen pagina (360mm werd 303mm,
   beide meer dan een vel) en werd de staartpagina juist leger. */
/* Vaste tabelopmaak: zonder die groeide een cel met zijn breedste inhoud en
   liep de rechterkolom van het vel (stresstest na plan 3a, observatie 8).
   Geen border-spacing maar padding: dan lijnen de kaarten links uit met de
   overzichtskaart erboven. De compactere maten in de kolommen houden de sectie
   op een vel nu de overzichtskaart boven de kolommen staat. */
/* Verdiepingshoofdstuk (fixronde 2 na plan 3a): alle onderwerpen stromen,
   ook het eerste, en tussen twee onderwerpen staat 24px. Met een eigen vel
   voor het eerste onderwerp bleef het laatste alleen op een pagina van 27 tot
   37%. Bewust geen compactere binnenmaten: gemeten op de WeasyPrint-render
   trok dat in 08, 12, 13 en 15 het tweede onderwerp naar voren, waardoor het
   derde juist alleen kwam te staan (23 tot 37%). */
.sec.verd { margin-bottom: 24px; }
.sec.flow.verd { margin-top: 0; }
/* Het eerste onderwerp volgt op het overzichtsprofiel (margin-bottom 44px);
   de negatieve marge brengt de samengevallen witruimte naar 24px, dezelfde
   ruimte als tussen twee onderwerpen. */
.sec.flow.verd.verd-eerste { margin-top: -20px; }
/* Dun verdiepingsblok en zijn voorganger (plan 3b): mogen over een paginagrens
   lopen, zodat het dunne blok niet alleen op een vel belandt. De binnendelen
   blijven heel: een kop staat nooit los onderaan, een kaart en een tabelrij
   breken niet. */
.sec.flow.verd.verd-los { break-inside: auto; }
.verd-los .slabel, .verd-los .ch-head, .verd-los h2, .verd-los .verd-h3 { break-after: avoid; }
.verd-los .card, .verd-los .item-tbl tr { break-inside: avoid; }
.verd-los .card { break-before: avoid; }
/* einde verd-los */
.verd-h3 { margin-top: 16px; }
.verd-compact .slabel { margin-bottom: 10px; }
.verd-compact .verd-h3 { margin-top: 14px; }
.verd-compact .item-tbl td { padding: 5px 8px; }
.verd-compact .card { padding: 10px 0 10px 16px; margin-bottom: 10px; }

.tcol.wb-cols { table-layout: fixed; border-spacing: 0; }
.tcol.wb-cols .tc-l { width: 50%; padding-right: 10px; }
.tcol.wb-cols .tc-r { width: 50%; padding-left: 10px; }
.wb-cols .card { padding: 8px 0 8px 12px; margin-bottom: 8px; }
.wb-cols .item-tbl td { padding: 3px 6px; }
.wb-cols .item-tbl .iq { width: 70%; }
.wb-cols .item-tbl .is { width: 12%; }
.enps-inline { margin-top: 18px; }
.empty-state { background: #fff; border: 1px dashed """ + HAIRLINE + r"""; padding: 18px;
  text-align: center; color: #94A3B8; font-size: 10px; }
.trustline { font-size: 10px; color: """ + STEEL + r"""; font-style: italic; margin-top: 8px; }

/* ── Brand kernzin ── */
.br-kernzin {
  font-family: 'Inter Tight', sans-serif; font-weight: 800;
  font-size: 28px; letter-spacing: -0.035em; line-height: 1.1;
  color: #0D1B2A; max-width: 48ch;
  margin-bottom: 28px; margin-top: 8px;
}

/* ── Factor bar label ── */
.fbar-label {
  display: table-cell; width: 22%; text-align: right; vertical-align: middle;
  font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase; padding-left: 8px;
}

/* ── Management anchor ── */
.mgmt-anchor {
  background: #0D1B2A; color: #fff;
  border-left: 4px solid """ + accent + r""";
  padding: 18px 20px; margin-bottom: 20px; break-inside: avoid;
}
.mgmt-anchor .ma-label {
  font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase; color: """ + accent + r""";
  margin-bottom: 6px;
}
.mgmt-anchor p { font-size: 12px; color: rgba(255,255,255,0.88); margin-bottom: 0; }

/* ── Playbook cards (management section) ── */
.play {
  background: #fff; border: 1px solid """ + HAIRLINE + r""";
  border-left: 4px solid """ + accent + r""";
  padding: 20px 22px; margin-bottom: 16px;
  break-inside: avoid;
}
.play-hdr { display: flex; align-items: baseline; margin-bottom: 14px; }
.play-bdg span {
  font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: #fff; padding: 3px 8px;
}
.play-ttl {
  font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 14px;
  color: """ + INK + r"""; line-height: 1.3;
  margin-left: 10px;
}
.sub-l {
  font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase; color: """ + STEEL + r""";
  margin: 12px 0 4px;
}
.act-lst { margin: 4px 0 0 16px; }
.act-lst li { font-size: 10.5px; color: #374151; line-height: 1.6; margin-bottom: 3px; }

/* ── Anchor block (why / summary) — licht, amber left-border.
   Eén paneel: titel + statistiekenrij + (evt.) sg-rij + eerste managementvraag
   delen allemaal dezelfde padding-context i.p.v. los-uitgelijnde siblings. ── */
.why { background: """ + CHALK + r"""; color: """ + INK + r"""; border-left: 4px solid """ + accent + r""";
  padding: 20px 22px 18px; margin-bottom: 20px; }
.why-title {
  font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 15px;
  color: """ + INK + r"""; margin-bottom: 14px; line-height: 1.35;
}
.why-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 16px; }
.why-cell {
  display: table-cell; vertical-align: top; width: 25%;
  background: transparent; border: none; border-right: 1px solid """ + HAIRLINE + r""";
  padding: 0 20px 0 0;
}
.why-cell:last-child { border-right: none; padding-right: 0; }
.why-l {
  font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.12em;
  text-transform: uppercase; color: """ + STEEL + r"""; margin-bottom: 6px;
}
.why-v {
  font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 24px;
  line-height: 1.0; color: """ + INK + r""";
}
.why-b { font-size: 9px; color: """ + STEEL + r"""; line-height: 1.45; margin-top: 4px; }
.why-quote {
  font-size: 10.5px; color: #374151; font-style: italic; line-height: 1.6;
  border-top: 1px solid """ + HAIRLINE + r"""; padding-top: 12px; margin-top: 4px;
}
/* .sg genest in .why (primaire factor/relatief sterk/responsbasis) deelt de
   paneel-padding; alleen een scheidingslijn, geen eigen inset. */
.why .sg { border-top: 1px solid """ + HAIRLINE + r"""; padding-top: 16px; margin-top: 2px; margin-bottom: 0; }
/* eerste-managementvraag-regel: geen apart kader, alleen scheidingslijn +
   typografisch gewicht (amber eyebrow + vetgedrukte vraag) als afsluitregel
   van hetzelfde paneel. */
.mq-line { border-top: 1px solid """ + HAIRLINE + r"""; padding-top: 14px; margin-top: 16px; }
.mq-line .mq-label {
  font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase; color: """ + accent + r"""; margin-bottom: 6px; display: block;
}
.mq-line p { font-size: 13px; font-weight: 700; color: """ + INK + r"""; margin-bottom: 0; line-height: 1.4; }

/* ── Cards — geen witte vlakken, alleen left-border ── */
.card { background: transparent; border: none; border-left: 2px solid """ + HAIRLINE + r"""; padding: 14px 0 14px 18px; margin-bottom: 16px; }
.card.accent { border-left: 4px solid """ + accent + r"""; }
.card.risk   { border-left: 4px solid """ + RAG_HIGH + r"""; }
.card.strong { border-left: 4px solid """ + RAG_LOW + r"""; }
.card.navy   { border-left: 4px solid """ + NAVY + r"""; }

/* ── Typohiërarchie ── */
h3 { font-family: 'Inter Tight', sans-serif; font-weight: 700;
     font-size: 16px; color: """ + INK + r"""; margin-bottom: 8px; line-height: 1.2; }
.slabel { margin-bottom: 22px; }

/* ── Pagina twee is één A4 (spec par. 4 slot, H16) ──────────────────────────
   Strakkere maten dan de rest van het rapport, zodat kernzin + cijfers +
   waarom + gespreksopener + leidraad + meetgegevens samen op één vel passen en
   hoofdstuk 02 op pagina drie begint; de meting staat in
   scripts/check_pdf_report.py. Deze overrides staan bewust achteraan, ná de
   basisregels die ze aanpassen: ze hangen aan #p02, dus de rest van het
   rapport houdt zijn eigen ruimte.
   Gemeten op de WeasyPrint-render (fixronde na plan 3a, observatie 9): met de
   vorige maten liep p.02 over in tien van de 24 renders, tot ongeveer 110pt in
   scenario 08. Winst zit vooral in de kernzin (20px, volle breedte), de
   leidraad (beschrijving krijgt 67% van de breedte, dus meestal één regel) en
   de witruimte rond het meetgegevensblok. Een kernzin boven KERNZIN_LANG
   tekens (report_html.py) krijgt 18px, zodat een langere kop dan de stresstest
   kent p.02 ook niet laat overlopen.
   Fixronde leesronde 24-9 (Taak 7): de duiding onder de cijfers, de langere
   leidraad en de extra regel in de meetgegevens maakten p.02 weer langer.
   Daarom zijn het waarom-blok, de leidraadregels en het meetgegevensblok
   dichter gezet, en krijgt een lange of gedeelde hoofdreden van vertrek
   (sc-reden-lang, VERTREKREDEN_LANG in report_html.py) 11px, nooit kleiner
   dan de subregel (.sc-b, 9px). Gemeten in het productie-image (WeasyPrint
   70.0) past p.02 in alle 24 renders; krapst is scenario 08 met 10,5pt over.
   Het echte bewijs is de regel p02-op-een-a4 in het productie-image; de test
   op deze maten bewaakt alleen tegen per ongeluk wijzigen. Elke selector
   staat hier één keer: bij gelijke specificiteit wint de latere regel, dus een
   tweede regel voor dezelfde selector maakt de eerste stil dood. */
#p02 .br-kernzin { font-size: 20px; max-width: none; margin-bottom: 14px; }
#p02 .kz-lang .br-kernzin { font-size: 18px; }
#p02 .why { padding: 10px 14px 8px; margin-bottom: 8px; }
#p02 .why-title { margin-bottom: 10px; }
#p02 .why-grid { margin-bottom: 8px; }
#p02 .why-v { font-size: 22px; }
#p02 .mq-line { padding-top: 10px; margin-top: 10px; }
#p02 .sg { margin-bottom: 10px; }
#p02 .sc-v { font-size: 18px; }
#p02 .sc-v.sc-reden { font-size: 14px; }
#p02 .sc-v.sc-reden-lang { font-size: 11px; line-height: 1.2; }
#p02 .p02-duiding { font-size: 9.5px; line-height: 1.4; color: #374151; margin: -6px 0 8px; max-width: none; }
#p02 .leidraad { margin-top: 10px; padding-top: 8px; }
#p02 .leidraad-title { margin-bottom: 4px; }
#p02 .leidraad td { padding: 1px 6px 1px 0; line-height: 1.38; }
#p02 .leidraad td.lt { width: 11%; }
#p02 .leidraad td.lw { width: 22%; }
#p02 .meet-blok { margin-top: 8px; }
#p02 .meet-blok .slabel { margin-bottom: 6px; }
#p02 .meet-blok .sg { margin-bottom: 4px; }
#p02 .meet-blok .sc-b { line-height: 1.3; }
#p02 .meet-blok .trustline { line-height: 1.35; }
"""
