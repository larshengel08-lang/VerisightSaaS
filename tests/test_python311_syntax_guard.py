"""Railway draait Python 3.11; lokaal staat 3.14. F-string-syntax die pas sinds
3.12 bestaat (PEP 701: een backslash of het hergebruik van het omsluitende
aanhalingsteken binnen een replacement field) slaagt lokaal en crasht live bij
import. Gevonden op 2026-09-13: backend/report_html.py brak elke rapportdownload
met een SyntaxError terwijl de volledige testsuite groen was.

`ast.parse(feature_version=(3, 11))` vangt dit NIET (de tokenizer van 3.12+
accepteert PEP 701 ongeacht feature_version), dus deze guard leest de tokens
zelf: binnen een f-string mag een replacement field geen backslash bevatten en
geen string-literal met hetzelfde aanhalingsteken als de f-string zelf.
"""
from __future__ import annotations

import io
import tokenize
from pathlib import Path

import pytest

BACKEND_ROOT = Path(__file__).resolve().parent.parent / "backend"
SOURCES = sorted(p for p in BACKEND_ROOT.rglob("*.py") if ".venv" not in p.parts)


def find_py312_only_fstrings(source: str) -> list[tuple[int, str]]:
    """Geeft (regel, reden) voor elk replacement field dat Python 3.11 weigert."""
    problems: list[tuple[int, str]] = []
    tokens = list(tokenize.generate_tokens(io.StringIO(source).readline))
    quote_stack: list[str] = []  # omsluitend aanhalingsteken per open f-string
    depth_stack: list[int] = []  # accolade-diepte binnen de huidige f-string

    for tok in tokens:
        if tok.type == tokenize.FSTRING_START:
            quote = tok.string.lstrip("rRbBfFtT")
            quote_stack.append(quote)
            depth_stack.append(0)
            continue
        if tok.type == tokenize.FSTRING_END:
            quote_stack.pop()
            depth_stack.pop()
            continue
        if not quote_stack:
            continue
        if tok.type == tokenize.OP and tok.string == "{":
            depth_stack[-1] += 1
            continue
        if tok.type == tokenize.OP and tok.string == "}":
            depth_stack[-1] = max(0, depth_stack[-1] - 1)
            continue
        if depth_stack[-1] == 0:
            continue  # literaal tekstdeel van de f-string, daar mag alles
        # Binnen een replacement field:
        if "\\" in tok.string and tok.type != tokenize.FSTRING_MIDDLE:
            problems.append((tok.start[0], f"backslash in f-string-expressie: {tok.string!r}"))
        outer = quote_stack[-1]
        if tok.type == tokenize.STRING and tok.string.lstrip("rRbBuU").startswith(outer):
            problems.append(
                (tok.start[0], f"zelfde aanhalingsteken {outer!r} binnen f-string-expressie: {tok.string!r}")
            )
    return problems


def test_detector_flags_the_pattern_that_broke_railway() -> None:
    bad = '''x = f'<td{" style=\\"font-weight:700;\\"" if flag else ""}>'\n'''
    assert find_py312_only_fstrings(bad), "de guard moet het patroon van 2026-09-13 herkennen"
    bad_quote = "y = f'{d['k']}'\n"
    assert find_py312_only_fstrings(bad_quote)


def test_detector_accepts_311_safe_fstrings() -> None:
    good = 'x = f"<td>{_h(q)}</td>" + (\' style="a"\' if flag else "")\n'
    assert find_py312_only_fstrings(good) == []
    nested_ok = "z = f'{d[\"k\"]}'\n"  # ander aanhalingsteken: al geldig in 3.11
    assert find_py312_only_fstrings(nested_ok) == []


@pytest.mark.parametrize("path", SOURCES, ids=lambda p: str(p.relative_to(BACKEND_ROOT)))
def test_backend_module_is_python_311_compatible(path: Path) -> None:
    problems = find_py312_only_fstrings(path.read_text(encoding="utf-8"))
    assert not problems, "\n".join(
        f"{path.relative_to(BACKEND_ROOT)}:{line}: {reason} (Railway draait Python 3.11)"
        for line, reason in problems
    )
