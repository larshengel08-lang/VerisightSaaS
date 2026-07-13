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
    content: "VERTROUWELIJK — LOEP — GROEPSOUTPUT";
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

/* ── Hoofdstuknummering (designsprong §4) ── */
.ch-idx { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 700;
  color: #E8A020; line-height: 1; margin-bottom: 6px; }
.ch-rule { border: none; border-top: 3px solid #0D1B2A; width: 48px;
  margin: 0 0 12px 0; }
.ch-kicker { display: block; font-family: 'JetBrains Mono', monospace; font-size: 9px;
  letter-spacing: 0.14em; text-transform: uppercase; color: """ + STEEL + r"""; margin-bottom: 5px; }
.ch-title { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 21px;
  letter-spacing: -0.03em; color: """ + INK + r"""; line-height: 1.1; margin-bottom: 14px; }

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
.cmeta { position: absolute; left: 56px; right: 56px; bottom: 56px;
  display: table; width: auto; border-top: 1px solid rgba(255,255,255,0.14); padding-top: 22px; }
.cmc { display: table-cell; width: 33%; padding-right: 18px; }
.cml { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 4px; }
.cmv { font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 22px; color: #fff; }

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
.item-tbl td { padding: 7px 8px; vertical-align: middle; font-size: 10px; color: #374151;
  border-bottom: 1px solid """ + HAIRLINE + r"""; }
.item-tbl .iq { width: 56%; }
.item-tbl .is { width: 10%; font-weight: 700; text-align: right; }

/* ── Quote / theme ── */
.theme-card { background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 14px 16px; margin-bottom: 10px; }
.theme-badge { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase; color: """ + accent_lo + r"""; }
.quote-txt { font-size: 11px; color: #374151; font-style: italic; line-height: 1.6;
  margin-top: 8px; padding-left: 12px; border-left: 2px solid """ + accent + r"""; }
.quote-anon { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.1em;
  text-transform: uppercase; color: #94A3B8; margin-top: 5px; }

/* ── Steps ── */
.steps { display: table; width: 100%; border-collapse: separate; border-spacing: 10px 0; }
.step { display: table-cell; background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 14px 16px; vertical-align: top; width: 25%; }
.step-no { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; letter-spacing: 0.1em;
  text-transform: uppercase; color: """ + accent_lo + r"""; margin-bottom: 4px; }
.step-body { font-size: 10px; color: #374151; line-height: 1.55; }

/* ── Invulbaar veld (eigenaarschap wordt in de bespreking bepaald, niet door Loep) ── */
.step-fill { border-bottom: 1px dashed #94A3B8; height: 15px; margin-bottom: 4px; }
.step-fill-hint { font-size: 7.5px; font-style: italic; color: #94A3B8; line-height: 1.4; }

/* ── Navy agenda-anker (designsprong §2a): het hele agendablok als donker vlak ── */
.agenda-dark { background: #0D1B2A; padding: 18px 20px; margin-top: 4px; }
.agenda-dark .step { background: transparent; border: 1px solid #2A3D52; }
.agenda-dark .step-no { color: #E8A020; }
.agenda-dark .step-body { color: #E7E2D6; }
.agenda-dark .step-fill { border-bottom: 1px dashed #5B6B7C; }
.agenda-dark .step-fill-hint { color: #8CA0B3; }
.agenda-why { display: block; font-family: 'JetBrains Mono', monospace; font-size: 8px;
  letter-spacing: 0.04em; color: #9FB0C0; margin-top: 7px; line-height: 1.5; }
.agenda-opener { border-left: 3px solid #E8A020; border-top: 1px solid #2A3D52;
  padding: 14px 0 0 16px; margin-top: 16px; }

/* ── Navy conclusie-anker (designsprong §2b): zelfde taal als .agenda-opener,
   herbruikt buiten de agenda (bijv. segmentconclusie) ── */
.navy-anchor { background: #0D1B2A; border-left: 3px solid #E8A020; padding: 14px 16px; margin-top: 12px; }
.navy-anchor-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.14em;
  text-transform: uppercase; color: #E8A020; margin-bottom: 6px; }
.navy-anchor p { margin: 0; font-size: 11px; line-height: 1.55; color: #F4F1EA; }

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
"""
