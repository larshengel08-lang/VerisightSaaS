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
    "ink": colors.HexColor("#132033"),
    "navy": colors.HexColor("#132033"),
    "petrol": colors.HexColor("#3C8D8A"),
    "teal": colors.HexColor("#3C8D8A"),
    "teal_light": colors.HexColor("#DCEFEA"),
    "teal_soft": colors.HexColor("#FBFAF7"),
    "cream": colors.HexColor("#F7F5F1"),
    "bg": colors.HexColor("#F7F5F1"),
    "surface": colors.HexColor("#FFFFFF"),
    "border": colors.HexColor("#E5E0D6"),
    "text": colors.HexColor("#4A5563"),
    "muted": colors.HexColor("#9CA3AF"),
    "cover_muted": colors.HexColor("#D5D9E0"),
    "risk_high_bg": colors.HexColor("#FBE4E4"),
    "risk_med_bg": colors.HexColor("#F6ECD5"),
    "risk_low_bg": colors.HexColor("#DCEFEA"),
    "danger": colors.HexColor("#B91C1C"),
    "warning": colors.HexColor("#C17C00"),
    "success": colors.HexColor("#3C8D8A"),
}

MPL_TOKENS = {
    "ink": "#132033",
    "navy": "#132033",
    "petrol": "#3C8D8A",
    "teal": "#3C8D8A",
    "teal_light": "#DCEFEA",
    "teal_soft": "#FBFAF7",
    "cream": "#F7F5F1",
    "bg": "#F7F5F1",
    "surface": "#FFFFFF",
    "border": "#E5E0D6",
    "text": "#4A5563",
    "muted": "#9CA3AF",
    "cover_muted": "#D5D9E0",
    "risk_high_bg": "#FBE4E4",
    "risk_med_bg": "#F6ECD5",
    "risk_low_bg": "#DCEFEA",
    "danger": "#B91C1C",
    "warning": "#C17C00",
    "success": "#3C8D8A",
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
        "accent_dark": TOKENS["navy"],
        "accent_light": TOKENS["teal_light"],
        "bg": TOKENS["cream"],
        "surface": TOKENS["surface"],
        "soft": TOKENS["cream"],
        "text": TOKENS["text"],
        "muted": TOKENS["muted"],
        "border": TOKENS["border"],
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
            fontName=REPORT_FONTS["light"],
            fontSize=28,
            leading=36,
            textColor=TOKENS["cream"],
            alignment=TA_LEFT,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            fontName=REPORT_FONTS["regular"],
            fontSize=11,
            leading=16,
            textColor=TOKENS["cover_muted"],
            alignment=TA_LEFT,
        ),
        "cover_meta": ParagraphStyle(
            "cover_meta",
            fontName=REPORT_FONTS["regular"],
            fontSize=8,
            leading=12,
            textColor=TOKENS["cover_muted"],
            alignment=TA_LEFT,
        ),
        "eyebrow": ParagraphStyle(
            "eyebrow",
            fontName=REPORT_FONTS["medium"],
            fontSize=7,
            leading=9,
            textColor=TOKENS["teal"],
            alignment=TA_LEFT,
            spaceAfter=4,
        ),
        "section_title": ParagraphStyle(
            "section_title",
            fontName=REPORT_FONTS["medium"],
            fontSize=15,
            leading=20,
            textColor=TOKENS["ink"],
            spaceAfter=5,
        ),
        "sub_title": ParagraphStyle(
            "sub_title",
            fontName=REPORT_FONTS["medium"],
            fontSize=11,
            leading=15,
            textColor=TOKENS["ink"],
            spaceBefore=3,
            spaceAfter=3,
        ),
        "body": ParagraphStyle(
            "body",
            fontName=REPORT_FONTS["regular"],
            fontSize=8.7,
            leading=12.3,
            textColor=TOKENS["text"],
            spaceAfter=4,
        ),
        "body_bold": ParagraphStyle(
            "body_bold",
            fontName=REPORT_FONTS["semibold"],
            fontSize=8.7,
            leading=12.3,
            textColor=TOKENS["ink"],
        ),
        "label": ParagraphStyle(
            "label",
            fontName=REPORT_FONTS["regular"],
            fontSize=7.4,
            leading=10.2,
            textColor=TOKENS["muted"],
        ),
        "caption": ParagraphStyle(
            "caption",
            fontName=REPORT_FONTS["italic"],
            fontSize=7.4,
            leading=10.2,
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
        canvas.setStrokeColor(colors.Color(theme["cream"].red, theme["cream"].green, theme["cream"].blue, alpha=0.18) if is_cover else theme["border"])
        canvas.setLineWidth(0.5)
        canvas.line(PAGE_MARGINS["left"], FOOTER_Y + FOOTER_RULE_GAP, PAGE_W - PAGE_MARGINS["right"], FOOTER_Y + FOOTER_RULE_GAP)
        canvas.setFont(REPORT_FONTS["regular"], 7.5)
        canvas.setFillColor(colors.Color(theme["cream"].red, theme["cream"].green, theme["cream"].blue, alpha=0.72) if is_cover else theme["muted"])
        canvas.drawString(PAGE_MARGINS["left"], FOOTER_Y, footer_label)
        canvas.drawRightString(PAGE_W - PAGE_MARGINS["right"], FOOTER_Y, generated)

    def _later_pages(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(theme["surface"])
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

        header_y = PAGE_H - PAGE_MARGINS["top"]
        canvas.setFillColor(theme["navy"])
        canvas.rect(PAGE_MARGINS["left"], header_y - HEADER_HEIGHT, CONTENT_WIDTH, HEADER_HEIGHT, fill=1, stroke=0)
        canvas.setFont(REPORT_FONTS["medium"], 7.5)
        canvas.setFillColor(theme["cream"])
        canvas.drawString(PAGE_MARGINS["left"] + HEADER_WORDMARK_PADDING, header_y - 8.5 * mm, product_name.upper())
        _draw_wordmark(
            canvas,
            x=PAGE_W - PAGE_MARGINS["right"] - HEADER_WORDMARK_PADDING,
            y=header_y - 10.2 * mm,
            fill=theme["surface"],
            muted_fill=colors.Color(theme["cream"].red, theme["cream"].green, theme["cream"].blue, alpha=0.72),
            align="right",
            scale=0.36,
            include_tagline=False,
        )

        canvas.setFont(REPORT_FONTS["regular"], 7.5)
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
        canvas.setFillColor(theme["navy"])
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        _draw_wordmark(
            canvas,
            x=PAGE_W / 2,
            y=PAGE_H - 78 * mm,
            fill=theme["surface"],
            muted_fill=colors.Color(theme["cream"].red, theme["cream"].green, theme["cream"].blue, alpha=0.72),
            align="center",
            scale=0.78,
            include_tagline=True,
        )
        _draw_footer(canvas, is_cover=True)
        canvas.restoreState()

    return _first_page, _later_pages
