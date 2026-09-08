"""Pariteitstest: computeDirectionFactor (client, templates/survey.html) tegen
compute_direction_factor (server, backend/products/shared/deepening.py).

De client-implementatie is een hand-onderhouden JS-port van de serverregel
(_priority_key). Dat "de twee hetzelfde antwoord geven" was tot nu toe een
feit vastgesteld door wegwerpscripts tijdens code review, niet een eigenschap
van de repo. Deze test maakt het een eigenschap: hij extraheert de JS uit het
template (tussen expliciete <parity-anchor>-markers, niet via
indentatiegevoelige regex -- dat breekt zodra het bestand herformatteerd
wordt) en draait 'm onder node tegen een grote, geseede set gegenereerde
org_raw-vectoren, incl. expliciete randgevallen.
"""
from __future__ import annotations

import json
import random
import shutil
import subprocess
import tempfile
from pathlib import Path

import pytest

from backend.products.shared.deepening import (
    DEEPENING_FACTOR_KEYS,
    compute_direction_factor,
)

REPO_ROOT = Path(__file__).resolve().parent.parent
SURVEY_HTML = REPO_ROOT / "templates" / "survey.html"

START_MARKER = "// <parity-anchor>"
END_MARKER = "// </parity-anchor>"

NODE_BIN = shutil.which("node")


def _node_can_run() -> bool:
    """Doet een echte aanroep, niet alleen een PATH-check.

    Zelfde patroon als requires_weasyprint in conftest.py: een zichtbare skip
    i.p.v. een valse pass (of een harde crash) wanneer node hier ontbreekt of
    kapot is.
    """
    if not NODE_BIN:
        return False
    try:
        subprocess.run(
            [NODE_BIN, "--version"], capture_output=True, check=True, timeout=10
        )
        return True
    except Exception:
        return False


requires_node = pytest.mark.skipif(
    not _node_can_run(),
    reason="node is hier niet beschikbaar -- de pariteitstest tussen de "
           "JS-port in templates/survey.html en compute_direction_factor "
           "kan dan niet draaien.",
)


def _extract_parity_anchor() -> str:
    """Haalt het JS-blok tussen de <parity-anchor>-markers uit survey.html.

    Marker-gebaseerd, niet indentatiegevoelig: als de markers ooit verdwijnen
    (bijv. bij een refactor die vergeet ze mee te nemen) faalt dit hard met
    een duidelijke fout, in plaats van stilzwijgend een lege of verkeerde
    extractie te leveren.
    """
    text = SURVEY_HTML.read_text(encoding="utf-8")
    start = text.find(START_MARKER)
    end = text.find(END_MARKER)
    assert start != -1 and end != -1 and end > start, (
        f"parity-anchor markers niet gevonden in {SURVEY_HTML} "
        f"(verwacht {START_MARKER!r} ... {END_MARKER!r})"
    )
    return text[start + len(START_MARKER):end]


def _raw(**per_factor: list[int]) -> dict[str, int]:
    """per_factor: factor_key -> lijst van stellingscores; default 3x een 4."""
    out: dict[str, int] = {}
    for fk in DEEPENING_FACTOR_KEYS:
        vals = per_factor.get(fk, [4, 4, 4])
        for i, v in enumerate(vals, start=1):
            out[f"{fk}_{i}"] = v
    return out


def _edge_case_vectors() -> list[dict[str, int]]:
    return [
        # Alle factoren volledig gelijk -> vaste factorvolgorde beslist
        # (leadership staat voor de rest).
        _raw(),
        _raw(leadership=[3, 3, 3], culture=[3, 3, 3], growth=[3, 3, 3],
             compensation=[3, 3, 3], workload=[3, 3, 3], role_clarity=[3, 3, 3]),
        # Gelijk gemiddelde (3.0), verschillend aantal stellingen <=2.
        _raw(workload=[2, 2, 5], growth=[1, 4, 4]),
        _raw(workload=[1, 4, 4], growth=[2, 2, 5]),
        # Gelijk gemiddelde, gelijk aantal <=2 -> laagste minimum beslist.
        _raw(workload=[2, 3, 4], growth=[1, 4, 4]),
        _raw(growth=[2, 3, 4], workload=[1, 4, 4]),
        # Eén factor aanwezig (de rest onbeantwoord).
        {"growth_1": 3},
        {"role_clarity_1": 1, "role_clarity_2": 5},
        # Laagste factor triggert geen verdieping (hoge scores), maar levert
        # nog steeds een richtingfactor op -- dat is precies het punt van de
        # richtingstap t.o.v. de verdieping (geen triggerfilter).
        _raw(growth=[4, 4, 3]),
        _raw(leadership=[5, 5, 5], culture=[5, 5, 4]),
        # Helemaal geen org-stellingen beantwoord.
        {},
        {"iets_anders_dan_een_factor": 3},
        # Eén losse lage score verslaat een consequent lage, volledig
        # ingevulde factor (minstens één beantwoorde stelling telt mee).
        {"growth_1": 1, "workload_1": 2, "workload_2": 2, "workload_3": 2},
        # Variërend aantal stellingen per factor (niet elke factor heeft er 3).
        _raw(leadership=[2], culture=[2, 2, 2, 2, 2]),
    ]


def _random_org_raw(rng: random.Random) -> dict[str, int]:
    out: dict[str, int] = {}
    for fk in DEEPENING_FACTOR_KEYS:
        if rng.random() < 0.1:
            continue  # factor helemaal niet beantwoord
        n_items = rng.randint(1, 4)
        for i in range(1, n_items + 1):
            if rng.random() < 0.05:
                continue  # los item overgeslagen
            out[f"{fk}_{i}"] = rng.randint(1, 5)
    return out


def _all_vectors() -> list[dict[str, int]]:
    # Seed vastgezet: een falende run is reproduceerbaar zonder de seed erbij
    # te hoeven plakken (staat hier, niet in een los script).
    rng = random.Random(20260908)
    vectors = _edge_case_vectors()
    while len(vectors) < 300:
        vectors.append(_random_org_raw(rng))
    return vectors


def _run_js_batch(js_block: str, vectors: list[dict[str, int]]) -> list[str | None]:
    harness = f"""
'use strict';
let __ORG_RAW = {{}};
function collectRadioGroup(name) {{ return __ORG_RAW; }}

{js_block}

const fs = require('fs');
const vectors = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const results = vectors.map(v => {{ __ORG_RAW = v; return computeDirectionFactor(); }});
process.stdout.write(JSON.stringify(results));
"""
    with tempfile.TemporaryDirectory() as tmp:
        harness_path = Path(tmp) / "harness.js"
        vectors_path = Path(tmp) / "vectors.json"
        harness_path.write_text(harness, encoding="utf-8")
        vectors_path.write_text(json.dumps(vectors), encoding="utf-8")

        proc = subprocess.run(
            [NODE_BIN, str(harness_path), str(vectors_path)],
            capture_output=True, text=True, timeout=60,
        )
    assert proc.returncode == 0, (
        f"node kon het geëxtraheerde parity-anchor-blok niet uitvoeren "
        f"(exit {proc.returncode}):\nstdout: {proc.stdout}\nstderr: {proc.stderr}"
    )
    return json.loads(proc.stdout)


@requires_node
def test_client_direction_factor_matches_server_port():
    js_block = _extract_parity_anchor()
    vectors = _all_vectors()
    assert len(vectors) >= 300

    js_results = _run_js_batch(js_block, vectors)
    assert len(js_results) == len(vectors)
    py_results = [compute_direction_factor(v) for v in vectors]

    mismatches = [
        (i, vectors[i], py, js)
        for i, (py, js) in enumerate(zip(py_results, js_results))
        if py != js
    ]
    assert not mismatches, (
        f"{len(mismatches)}/{len(vectors)} org_raw-vectoren geven een ander "
        f"resultaat in de JS-port (templates/survey.html) dan in "
        f"compute_direction_factor (backend/products/shared/deepening.py). "
        f"Eerste afwijking (index {mismatches[0][0]}, seed 20260908): "
        f"org_raw={mismatches[0][1]!r} python={mismatches[0][2]!r} "
        f"js={mismatches[0][3]!r}"
    )
