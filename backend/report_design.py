from __future__ import annotations

from pathlib import Path

import matplotlib
from matplotlib import font_manager
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

PAGE_W, PAGE_H = A4

PAGE_MARGINS = {
    "left": 22 * mm,
    "right": 22 * mm,
    "top": 18 * mm,
    "bottom": 16 * mm,
}
CONTENT_WIDTH = PAGE_W - PAGE_MARGINS["left"] - PAGE_MARGINS["right"]
HEADER_HEIGHT = 14 * mm
FOOTER_Y = PAGE_MARGINS["bottom"] - 1.5 * mm
BODY_FRAME_GAP = 8 * mm
COVER_FRAME_INSET = 10 * mm
HEADER_WORDMARK_PADDING = 5 * mm
HEADER_META_GAP = 4.5 * mm
FOOTER_RULE_GAP = 5 * mm

CONFIDENTIAL_FOOTER_LABEL = "Vertrouwelijk - Verisight"
PAGE_LABEL_TEMPLATE = "{campaign} | Pagina {page}"

TOKENS = {
    "ink": colors.HexColor("#14161A"),
    "navy": colors.HexColor("#14161A"),
    "petrol": colors.HexColor("#2F5BEA"),
    "teal": colors.HexColor("#2F5BEA"),
    "teal_light": colors.HexColor("#EEF2FE"),
    "teal_soft": colors.HexColor("#F2F1EC"),
    "cream": colors.HexColor("#FAFAF7"),
    "bg": colors.HexColor("#FAFAF7"),
    "surface": colors.HexColor("#FFFFFF"),
    "paper_shade": colors.HexColor("#F2F1EC"),
    "paper_edge": colors.HexColor("#E8E7E1"),
    "border": colors.HexColor("#D9DBDE"),
    "text": colors.HexColor("#30343B"),
    "muted": colors.HexColor("#9099A3"),
    "cover_muted": colors.HexColor("#5E636D"),
    "accent_ink": colors.HexColor("#1E3FB3"),
    "accent_wash": colors.HexColor("#EEF2FE"),
    "accent_line": colors.HexColor("#C6D3FB"),
    "risk_high_bg": colors.HexColor("#F8E6DE"),
    "risk_med_bg": colors.HexColor("#FAF0DC"),
    "risk_low_bg": colors.HexColor("#E6F4EF"),
    "danger": colors.HexColor("#C24A2B"),
    "warning": colors.HexColor("#B4770E"),
    "success": colors.HexColor("#0E8F6E"),
}

MPL_TOKENS = {
    "ink": "#14161A",
    "navy": "#14161A",
    "petrol": "#2F5BEA",
    "teal": "#2F5BEA",
    "teal_light": "#EEF2FE",
    "teal_soft": "#F2F1EC",
    "cream": "#FAFAF7",
    "bg": "#FAFAF7",
    "surface": "#FFFFFF",
    "paper_shade": "#F2F1EC",
    "paper_edge": "#E8E7E1",
    "border": "#D9DBDE",
    "text": "#30343B",
    "muted": "#9099A3",
    "cover_muted": "#5E636D",
    "accent_ink": "#1E3FB3",
    "accent_wash": "#EEF2FE",
    "accent_line": "#C6D3FB",
    "risk_high_bg": "#F8E6DE",
    "risk_med_bg": "#FAF0DC",
    "risk_low_bg": "#E6F4EF",
    "danger": "#C24A2B",
    "warning": "#B4770E",
    "success": "#0E8F6E",
}

FONT_DIR = Path(__file__).resolve().parent / "assets" / "fonts"
FONT_FILES = {
    "regular": FONT_DIR / "IBMPlexSans-Regular.ttf",
    "medium": FONT_DIR / "IBMPlexSans-Medium.ttf",
    "semibold": FONT_DIR / "IBMPlexSans-SemiBold.ttf",
    "bold": FONT_DIR / "IBMPlexSans-Bold.ttf",
    "italic": FONT_DIR / "IBMPlexSans-Italic.ttf",
}
OPTIONAL_FONT_FILES = {
    "light": FONT_DIR / "IBMPlexSans-Light.ttf",
}
REPORT_FONTS = {
    "light": "IBM Plex Sans",
    "regular": "IBM Plex Sans",
    "medium": "IBM Plex Sans Medium",
    "semibold": "IBM Plex Sans SemiBold",
    "bold": "IBM Plex Sans Bold",
    "italic": "IBM Plex Sans Italic",
}


def ensure_report_fonts() -> None:
    if getattr(ensure_report_fonts, "_done", False):
        return

    for key, path in FONT_FILES.items():
        if not path.exists():
            raise FileNotFoundError(f"Missing report font: {path}")
        font_name = REPORT_FONTS[key]
        if font_name not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont(font_name, str(path)))
        font_manager.fontManager.addfont(str(path))

    for key, path in OPTIONAL_FONT_FILES.items():
        if not path.exists():
            REPORT_FONTS[key] = REPORT_FONTS["regular"]
            continue
        font_name = "IBM Plex Sans Light"
        REPORT_FONTS[key] = font_name
        if font_name not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont(font_name, str(path)))
        font_manager.fontManager.addfont(str(path))

    matplotlib.rcParams["font.family"] = REPORT_FONTS["regular"]
    matplotlib.rcParams["font.sans-serif"] = [REPORT_FONTS["regular"], "DejaVu Sans", "Arial", "sans-serif"]
    matplotlib.rcParams["text.color"] = MPL_TOKENS["text"]
    matplotlib.rcParams["axes.labelcolor"] = MPL_TOKENS["text"]
    matplotlib.rcParams["axes.edgecolor"] = MPL_TOKENS["border"]
    matplotlib.rcParams["xtick.color"] = MPL_TOKENS["text"]
    matplotlib.rcParams["ytick.color"] = MPL_TOKENS["text"]
    matplotlib.rcParams["axes.facecolor"] = MPL_TOKENS["surface"]
    matplotlib.rcParams["figure.facecolor"] = MPL_TOKENS["surface"]
    ensure_report_fonts._done = True


def get_report_theme(scan_type: str) -> dict[str, colors.Color]:
    product_label = "ExitScan" if scan_type == "exit" else "RetentieScan" if scan_type == "retention" else "Verisight"
    return {
        "product_label": product_label,
        "ink": TOKENS["ink"],
        "navy": TOKENS["navy"],
        "accent": TOKENS["teal"],
        "accent_dark": TOKENS["accent_ink"],
        "accent_light": TOKENS["accent_wash"],
        "accent_line": TOKENS["accent_line"],
        "bg": TOKENS["cream"],
        "surface": TOKENS["surface"],
        "soft": TOKENS["paper_shade"],
        "text": TOKENS["text"],
        "muted": TOKENS["muted"],
        "cover_muted": TOKENS["cover_muted"],
        "border": TOKENS["border"],
        "paper_edge": TOKENS["paper_edge"],
        "success": TOKENS["success"],
        "warning": TOKENS["warning"],
        "danger": TOKENS["danger"],
        "cream": TOKENS["cream"],
        "white": TOKENS["surface"],
    }


def build_report_styles() -> dict[str, ParagraphStyle]:
    return {
        "cover_title": ParagraphStyle(
            "cover_title",
            fontName=REPORT_FONTS["bold"],
            fontSize=30,
            leading=35,
            textColor=TOKENS["ink"],
            alignment=TA_LEFT,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            fontName=REPORT_FONTS["regular"],
            fontSize=10.5,
            leading=15,
            textColor=TOKENS["cover_muted"],
            alignment=TA_LEFT,
        ),
        "cover_meta": ParagraphStyle(
            "cover_meta",
            fontName=REPORT_FONTS["regular"],
            fontSize=7.7,
            leading=11.2,
            textColor=TOKENS["cover_muted"],
            alignment=TA_LEFT,
        ),
        "eyebrow": ParagraphStyle(
            "eyebrow",
            fontName=REPORT_FONTS["semibold"],
            fontSize=7.6,
            leading=10.0,
            textColor=TOKENS["teal"],
            alignment=TA_LEFT,
            spaceAfter=5,
        ),
        "section_title": ParagraphStyle(
            "section_title",
            fontName=REPORT_FONTS["semibold"],
            fontSize=18,
            leading=23,
            textColor=TOKENS["ink"],
            spaceAfter=6,
        ),
        "sub_title": ParagraphStyle(
            "sub_title",
            fontName=REPORT_FONTS["semibold"],
            fontSize=9.8,
            leading=13,
            textColor=TOKENS["cover_muted"],
            spaceBefore=4,
            spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "body",
            fontName=REPORT_FONTS["regular"],
            fontSize=8.8,
            leading=12.8,
            textColor=TOKENS["text"],
            spaceAfter=5,
        ),
        "body_bold": ParagraphStyle(
            "body_bold",
            fontName=REPORT_FONTS["semibold"],
            fontSize=8.8,
            leading=12.8,
            textColor=TOKENS["ink"],
        ),
        "label": ParagraphStyle(
            "label",
            fontName=REPORT_FONTS["semibold"],
            fontSize=7.1,
            leading=9.4,
            textColor=TOKENS["muted"],
        ),
        "caption": ParagraphStyle(
            "caption",
            fontName=REPORT_FONTS["italic"],
            fontSize=7.4,
            leading=10.4,
            textColor=TOKENS["muted"],
            alignment=TA_LEFT,
        ),
        "footer": ParagraphStyle(
            "footer",
            fontName=REPORT_FONTS["regular"],
            fontSize=7.5,
            leading=11,
            textColor=TOKENS["muted"],
            alignment=TA_RIGHT,
        ),
        "badge_high": ParagraphStyle(
            "badge_high",
            fontName=REPORT_FONTS["semibold"],
            fontSize=8.2,
            textColor=TOKENS["danger"],
        ),
        "badge_med": ParagraphStyle(
            "badge_med",
            fontName=REPORT_FONTS["semibold"],
            fontSize=8.2,
            textColor=TOKENS["warning"],
        ),
        "badge_low": ParagraphStyle(
            "badge_low",
            fontName=REPORT_FONTS["semibold"],
            fontSize=8.2,
            textColor=TOKENS["success"],
        ),
    }


def _draw_wordmark(canvas, *, x: float, y: float, fill: colors.Color, muted_fill: colors.Color, align: str = "left", scale: float = 1.0, include_tagline: bool = True) -> None:
    word = "Verisight"
    word_size = 26 * scale
    tag_size = 6.5 * scale
    word_width = pdfmetrics.stringWidth(word, REPORT_FONTS["bold"], word_size)
    tag = "PEOPLE, PATTERNS, PRIORITIES"
    tag_width = pdfmetrics.stringWidth(tag, REPORT_FONTS["semibold"], tag_size)
    max_width = max(word_width, tag_width)

    start_x = x
    if align == "center":
        start_x = x - (max_width / 2)
    elif align == "right":
        start_x = x - max_width

    text = canvas.beginText()
    text.setTextOrigin(start_x, y)
    text.setFont(REPORT_FONTS["bold"], word_size)
    text.setFillColor(fill)
    text.textLine(word)
    if include_tagline:
        text.setFont(REPORT_FONTS["semibold"], tag_size)
        text.setFillColor(muted_fill)
        text.setCharSpace(0.9 * scale)
        text.textLine(tag)
    canvas.drawText(text)


def make_page_callbacks(
    *,
    org_name: str,
    camp_name: str,
    generated: str,
    product_name: str,
    scan_type: str,
    footer_label: str = CONFIDENTIAL_FOOTER_LABEL,
):
    theme = get_report_theme(scan_type)

    def _draw_footer(canvas, *, is_cover: bool) -> None:
        footer_rule = theme["paper_edge"] if is_cover else theme["border"]
        footer_fill = theme["cover_muted"] if is_cover else theme["muted"]
        canvas.setStrokeColor(footer_rule)
        canvas.setLineWidth(0.5)
        canvas.line(PAGE_MARGINS["left"], FOOTER_Y + FOOTER_RULE_GAP, PAGE_W - PAGE_MARGINS["right"], FOOTER_Y + FOOTER_RULE_GAP)
        canvas.setFont(REPORT_FONTS["regular"], 7.5)
        canvas.setFillColor(footer_fill)
        canvas.drawString(PAGE_MARGINS["left"], FOOTER_Y, footer_label)
        canvas.drawRightString(PAGE_W - PAGE_MARGINS["right"], FOOTER_Y, generated)

    def _later_pages(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(theme["bg"])
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

        header_y = PAGE_H - PAGE_MARGINS["top"]
        chrome_y = header_y - 6.2 * mm
        canvas.setFillColor(theme["accent"])
        canvas.roundRect(PAGE_MARGINS["left"], chrome_y - 1.2 * mm, 3.2 * mm, 3.2 * mm, 0.8 * mm, fill=1, stroke=0)
        canvas.setFont(REPORT_FONTS["semibold"], 8.2)
        canvas.setFillColor(theme["ink"])
        canvas.drawString(PAGE_MARGINS["left"] + 5.0 * mm, chrome_y, "Verisight")
        canvas.setFont(REPORT_FONTS["regular"], 7.5)
        canvas.setFillColor(theme["cover_muted"])
        canvas.drawString(PAGE_MARGINS["left"] + 26 * mm, chrome_y, product_name)
        canvas.setStrokeColor(theme["paper_edge"])
        canvas.setLineWidth(0.5)
        canvas.line(PAGE_MARGINS["left"], header_y - HEADER_HEIGHT + 1.0 * mm, PAGE_W - PAGE_MARGINS["right"], header_y - HEADER_HEIGHT + 1.0 * mm)
        canvas.setFont(REPORT_FONTS["regular"], 7.3)
        canvas.setFillColor(theme["muted"])
        canvas.drawString(PAGE_MARGINS["left"], header_y - HEADER_HEIGHT - HEADER_META_GAP, org_name)
        canvas.drawRightString(
            PAGE_W - PAGE_MARGINS["right"],
            header_y - HEADER_HEIGHT - HEADER_META_GAP,
            PAGE_LABEL_TEMPLATE.format(campaign=camp_name, page=doc.page),
        )

        _draw_footer(canvas, is_cover=False)
        canvas.restoreState()

    def _first_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(theme["bg"])
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        header_y = PAGE_H - PAGE_MARGINS["top"]
        canvas.setFillColor(theme["accent"])
        canvas.roundRect(PAGE_MARGINS["left"], header_y - 5.7 * mm, 4.0 * mm, 4.0 * mm, 0.9 * mm, fill=1, stroke=0)
        canvas.setFont(REPORT_FONTS["bold"], 10.5)
        canvas.setFillColor(theme["ink"])
        canvas.drawString(PAGE_MARGINS["left"] + 6.0 * mm, header_y - 3.7 * mm, "Verisight")
        canvas.setFont(REPORT_FONTS["regular"], 8.0)
        canvas.setFillColor(theme["cover_muted"])
        canvas.drawRightString(PAGE_W - PAGE_MARGINS["right"], header_y - 3.7 * mm, product_name)
        canvas.setStrokeColor(theme["paper_edge"])
        canvas.setLineWidth(0.5)
        canvas.line(PAGE_MARGINS["left"], header_y - HEADER_HEIGHT + 1.0 * mm, PAGE_W - PAGE_MARGINS["right"], header_y - HEADER_HEIGHT + 1.0 * mm)
        _draw_footer(canvas, is_cover=True)
        canvas.restoreState()

    return _first_page, _later_pages
