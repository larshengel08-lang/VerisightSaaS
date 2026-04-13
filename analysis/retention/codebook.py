from __future__ import annotations

from dataclasses import dataclass

from backend.products.retention.definition import SCAN_DEFINITION
from backend.scoring_config import SDT_DIMENSION_ITEMS, SDT_REVERSE_ITEMS


@dataclass(frozen=True)
class CodebookItem:
    item_id: str
    scale: str
    block: str
    prompt: str
    response_min: int
    response_max: int
    reversed: bool = False
    derived: bool = False
    notes: str = ""


def build_retention_codebook() -> list[CodebookItem]:
    items: list[CodebookItem] = []

    for item_id, prompt in SCAN_DEFINITION["sdt_items"]:
        dimension = next(
            (name for name, dimension_items in SDT_DIMENSION_ITEMS.items() if item_id in dimension_items),
            "sdt",
        )
        items.append(
            CodebookItem(
                item_id=item_id,
                scale=dimension,
                block="sdt",
                prompt=prompt,
                response_min=1,
                response_max=5,
                reversed=item_id in SDT_REVERSE_ITEMS,
                notes="SDT-geinspireerd item; reverse-code indien van toepassing.",
            )
        )

    for section in SCAN_DEFINITION["org_sections"]:
        for item_id, prompt in section["items"]:
            items.append(
                CodebookItem(
                    item_id=item_id,
                    scale=section["key"],
                    block="org",
                    prompt=prompt,
                    response_min=1,
                    response_max=5,
                    notes=f"Onderdeel van {section['title']}.",
                )
            )

    for item_id, prompt in SCAN_DEFINITION["uwes_items"]:
        items.append(
            CodebookItem(
                item_id=item_id,
                scale="engagement",
                block="uwes",
                prompt=prompt,
                response_min=1,
                response_max=5,
                notes="UWES-3 item; hogere score = meer bevlogenheid.",
            )
        )

    for item_id, prompt in SCAN_DEFINITION["turnover_items"]:
        items.append(
            CodebookItem(
                item_id=item_id,
                scale="turnover_intention",
                block="turnover_intention",
                prompt=prompt,
                response_min=1,
                response_max=5,
                notes="Hogere score = sterkere vertrekintentie.",
            )
        )

    items.append(
        CodebookItem(
            item_id="stay_intent_score",
            scale="stay_intent",
            block="stay_intent",
            prompt=SCAN_DEFINITION["stay_item"][1],
            response_min=1,
            response_max=5,
            notes="Hogere score = sterkere expliciete bereidheid om te blijven.",
        )
    )

    items.extend(
        [
            CodebookItem(
                item_id="retention_signal_score",
                scale="retention_signal",
                block="derived",
                prompt="Afgeleide samenvattende score van SDT + organisatiefactoren.",
                response_min=1,
                response_max=10,
                derived=True,
                notes="Gelijkgewogen signaalmaat; geen voorspeller.",
            ),
            CodebookItem(
                item_id="engagement_score",
                scale="engagement",
                block="derived",
                prompt="Genormaliseerde UWES-3 score.",
                response_min=1,
                response_max=10,
                derived=True,
                notes="Afgeleide schaal; hogere score = meer bevlogenheid.",
            ),
            CodebookItem(
                item_id="turnover_intention_score",
                scale="turnover_intention",
                block="derived",
                prompt="Genormaliseerde vertrekintentiescore.",
                response_min=1,
                response_max=10,
                derived=True,
                notes="Afgeleide schaal; hogere score = meer vertrekdenken.",
            ),
            CodebookItem(
                item_id="stay_intent_score_norm",
                scale="stay_intent",
                block="derived",
                prompt="Genormaliseerde stay-intent score.",
                response_min=1,
                response_max=10,
                derived=True,
                notes="Afgeleide schaal; hogere score = sterkere bereidheid om te blijven.",
            ),
        ]
    )

    return items


RETENTION_CODEBOOK = build_retention_codebook()


def codebook_as_dicts() -> list[dict[str, object]]:
    return [
        {
            "item_id": item.item_id,
            "scale": item.scale,
            "block": item.block,
            "prompt": item.prompt,
            "response_min": item.response_min,
            "response_max": item.response_max,
            "reversed": item.reversed,
            "derived": item.derived,
            "notes": item.notes,
        }
        for item in RETENTION_CODEBOOK
    ]
