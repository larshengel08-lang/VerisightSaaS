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
@page cover-page { margin: 0; }

* { box-sizing: border-box; margin: 0; padding: 0; border-radius: 0; }

:root { --accent: """ + accent + r"""; --accent-lo: """ + accent_lo + r"""; }

body {
  font-family: 'Inter', Arial, sans-serif;
  font-size: 11px; line-height: 1.6; color: #243247;
  background: """ + CHALK + r""";
}

.pb       { break-before: page; }
.no-break { break-inside: avoid; }

/* ── Eyebrow (mono) ── */
.eyebrow {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 500;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-lo);
}
.eyebrow.on-dark { color: var(--accent); }

/* ── Section label ── */
.slabel {
  display: flex; align-items: center; gap: 12px;
  font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 500;
  letter-spacing: 0.16em; text-transform: uppercase; color: """ + STEEL + r""";
  margin-bottom: 18px;
}
.slabel::after { content: ""; flex: 1; height: 1px; background: """ + HAIRLINE + r"""; }

/* ── Headings ── */
h2 { font-family: 'Inter Tight', sans-serif; font-weight: 800;
     letter-spacing: -0.03em; font-size: 22px; color: """ + INK + r"""; line-height: 1.05; }
h3 { font-family: 'Inter Tight', sans-serif; font-weight: 700;
     font-size: 14px; color: """ + INK + r"""; margin-bottom: 5px; }
p  { margin-bottom: 6px; font-size: 11px; }

/* ── Cover ── */
.cover { page: cover-page; background: """ + NAVY + r"""; min-height: 297mm;
  padding: 64px 56px 48px; position: relative; color: #fff; }
.cover-rings { position: absolute; top: -120px; right: -120px; width: 420px; height: 420px;
  border: 1px solid rgba(232,160,32,0.10); border-radius: 9999px; }
.cover-rings::before { content: ""; position: absolute; inset: 60px;
  border: 1px solid rgba(232,160,32,0.07); border-radius: 9999px; }
.cover-rings::after { content: ""; position: absolute; inset: 130px;
  border: 1px solid rgba(232,160,32,0.05); border-radius: 9999px; }
.cover-top { display: flex; justify-content: space-between; align-items: baseline; }
.cwm { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 17px;
  letter-spacing: -0.02em; color: #fff; }
.cwm .dot { color: var(--accent); }
.cconf { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.16em;
  text-transform: uppercase; color: rgba(255,255,255,0.55); }
.ceyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.20em;
  text-transform: uppercase; color: var(--accent); margin-top: 150px; }
.cbar { width: 56px; height: 3px; background: var(--accent); margin: 22px 0 26px; }
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

/* ── Cards ── */
.card { background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 18px 20px; margin-bottom: 14px; }
.card.accent { border-left: 3px solid var(--accent); }
.card.risk   { border-left: 3px solid """ + RAG_HIGH + r"""; }
.card.strong { border-left: 3px solid """ + RAG_LOW + r"""; }
.card.navy   { border-left: 3px solid """ + NAVY + r"""; }

/* ── Dark anchor block ── */
.why { background: """ + GRAPHITE + r"""; color: #fff; padding: 22px 24px; margin-bottom: 16px; }
.why-title { font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 14px;
  color: #fff; margin-bottom: 16px; line-height: 1.4; }
.why-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 10px 0; margin-bottom: 14px; }
.why-cell { display: table-cell; vertical-align: top; width: 25%;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 12px 13px; }
.why-l { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.12em;
  text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
.why-v { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 22px; line-height: 1.05; }
.why-b { font-size: 9px; color: rgba(255,255,255,0.6); line-height: 1.4; margin-top: 2px; }
.why-quote { font-size: 10px; color: rgba(255,255,255,0.75); font-style: italic; line-height: 1.55;
  border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; }

/* ── Stat grid ── */
.sg { display: table; width: 100%; border-collapse: separate; border-spacing: 10px 0; margin-bottom: 14px; }
.sg td { display: table-cell; background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 13px 15px; vertical-align: top; width: 25%; }
.sc-l { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.1em;
  text-transform: uppercase; color: """ + STEEL + r"""; margin-bottom: 4px; }
.sc-v { font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 24px; color: """ + INK + r"""; line-height: 1.1; }
.sc-b { font-size: 9px; color: """ + STEEL + r"""; margin-top: 2px; line-height: 1.4; }

/* ── Factor bars ── */
.fbar-row { display: table; width: 100%; margin-bottom: 9px; }
.fbar-name { display: table-cell; width: 34%; font-size: 11px; font-weight: 600; color: """ + INK + r"""; vertical-align: middle; padding-right: 10px; }
.fbar-track { display: table-cell; width: 52%; vertical-align: middle; }
.fbar-score { display: table-cell; width: 14%; text-align: right; vertical-align: middle;
  font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 13px; color: """ + INK + r"""; }

/* ── Item table ── */
.item-tbl { width: 100%; border-collapse: collapse; }
.item-tbl td { padding: 7px 8px; vertical-align: middle; font-size: 10px; color: #374151;
  border-bottom: 1px solid """ + HAIRLINE + r"""; }
.item-tbl .iq { width: 56%; }
.item-tbl .is { width: 10%; font-weight: 700; text-align: right; }

/* ── Quote / theme ── */
.theme-card { background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 14px 16px; margin-bottom: 10px; }
.theme-badge { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent-lo); }
.quote-txt { font-size: 11px; color: #374151; font-style: italic; line-height: 1.6;
  margin-top: 8px; padding-left: 12px; border-left: 2px solid var(--accent); }
.quote-anon { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.1em;
  text-transform: uppercase; color: #94A3B8; margin-top: 5px; }

/* ── Steps ── */
.steps { display: table; width: 100%; border-collapse: separate; border-spacing: 10px 0; }
.step { display: table-cell; background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 14px 16px; vertical-align: top; width: 25%; }
.step-no { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--accent-lo); margin-bottom: 4px; }
.step-body { font-size: 10px; color: #374151; line-height: 1.55; }

/* ── Trust / methodiek ── */
.tg { display: table; width: 100%; border-collapse: separate; border-spacing: 10px 0; }
.tc { display: table-cell; background: #fff; border: 1px solid """ + HAIRLINE + r"""; padding: 14px 15px; vertical-align: top; width: 33%; }
.tt { font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 11px; color: """ + INK + r"""; margin-bottom: 4px; }
.tb { font-size: 9px; color: #374151; line-height: 1.55; }

/* ── Two-col / appendix / misc ── */
.tcol { display: table; width: 100%; border-collapse: separate; border-spacing: 14px 0; }
.tc-l { display: table-cell; vertical-align: top; width: 55%; }
.tc-r { display: table-cell; vertical-align: top; width: 45%; }
.app-tbl { width: 100%; border-collapse: collapse; font-size: 9px; }
.app-tbl th { background: #EFE9DD; color: """ + STEEL + r"""; font-weight: 700; padding: 5px 8px;
  text-align: left; border-bottom: 1px solid """ + HAIRLINE + r"""; }
.app-tbl td { padding: 4px 8px; border-bottom: 1px solid """ + HAIRLINE + r"""; }
.sec { margin-bottom: 30px; }
.empty-state { background: #fff; border: 1px dashed """ + HAIRLINE + r"""; padding: 18px;
  text-align: center; color: #94A3B8; font-size: 10px; }
.trustline { font-size: 9.5px; color: """ + STEEL + r"""; font-style: italic; margin-top: 8px; }
"""
