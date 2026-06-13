from __future__ import annotations

import base64
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

FONT_DIR = Path(__file__).resolve().parent / "assets" / "fonts"


@dataclass(frozen=True)
class FontSpec:
    family: str       # CSS font-family naam
    file: str         # bestandsnaam in FONT_DIR
    weight: int       # font-weight
    style: str = "normal"


FONT_SPECS: list[FontSpec] = [
    FontSpec("Inter", "Inter-Regular.ttf", 400),
    FontSpec("Inter", "Inter-Medium.ttf", 500),
    FontSpec("Inter", "Inter-SemiBold.ttf", 600),
    FontSpec("Inter", "Inter-Bold.ttf", 700),
    FontSpec("Inter Tight", "InterTight-SemiBold.ttf", 600),
    FontSpec("Inter Tight", "InterTight-Bold.ttf", 700),
    FontSpec("Inter Tight", "InterTight-ExtraBold.ttf", 800),
    FontSpec("JetBrains Mono", "JetBrainsMono-Regular.ttf", 400),
    FontSpec("JetBrains Mono", "JetBrainsMono-Medium.ttf", 500),
]


@lru_cache(maxsize=1)
def font_face_css() -> str:
    blocks: list[str] = []
    for spec in FONT_SPECS:
        path = FONT_DIR / spec.file
        if not path.exists():
            raise FileNotFoundError(f"Missing report font: {path}")
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        blocks.append(
            "@font-face{"
            f"font-family: '{spec.family}';"
            f"font-weight: {spec.weight};"
            f"font-style: {spec.style};"
            f"src: url(data:font/ttf;base64,{b64}) format('truetype');"
            "}"
        )
    return "\n".join(blocks)
