from __future__ import annotations

from typing import Any

GUARDRAIL_REPLACEMENTS = [
    ("zal leiden tot", "kan helpen bij"),
    ("garandeert", "ondersteunt"),
    ("garanderen", "ondersteunen"),
    ("bewijst", "onderbouwt"),
    ("bewijs", "onderbouwing"),
    ("oorzaak", "spoor"),
    ("oorzaken", "sporen"),
    ("oplossen", "gericht opvolgen"),
]


def _dedupe_strings(items: list[str], *, limit: int) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        normalized = " ".join((item or "").split()).strip()
        if not normalized:
            continue
        key = normalized.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(normalized)
        if len(result) >= limit:
            break
    return result


def _soften_copy(text: str) -> str:
    softened = " ".join((text or "").split()).strip()
    for source, target in GUARDRAIL_REPLACEMENTS:
        softened = softened.replace(source, target)
        softened = softened.replace(source.capitalize(), target.capitalize())
    return softened


def _format_focus_text(top_focus_labels: list[str]) -> str:
    usable = [label for label in top_focus_labels[:2] if label]
    if not usable:
        return "dit spoor"
    if len(usable) == 1:
        return usable[0]
    return f"{usable[0]} en {usable[1]}"


def _extract_card_body(session_cards: list[dict[str, Any]], title: str, fallback: str) -> str:
    for card in session_cards:
        if card.get("title") == title and card.get("body"):
            return str(card["body"])
    return fallback


def _ensure_question(text: str) -> str:
    normalized = " ".join((text or "").split()).strip()
    if not normalized:
        return ""
    if normalized.endswith("?"):
        return normalized
    return f"{normalized.rstrip('.')}?"


def _fallback_questions(*, scan_type: str, focus_text: str, first_decision: str, review_moment: str) -> list[str]:
    if scan_type == "retention":
        return [
            f"Welk deel van {focus_text.lower()} vraagt nu eerst verificatie voordat opvolging breder wordt gemaakt?",
            "Welke teams of contexten vragen nu als eerste een begrensde verificatie?",
            _ensure_question(first_decision),
            "Welke eerste signalen moeten we binnen 60 dagen terugzien voordat we dit spoor zwaarder maken?",
            _ensure_question(f"Wanneer herwegen we of {focus_text.lower()} een vervolgmeting of andere route vraagt"),
        ]
    return [
        f"Welk deel van {focus_text.lower()} moeten we nu eerst toetsen voordat dit spoor breder wordt gemaakt?",
        "Welke team- of managementcontext vraagt nu als eerste een gerichte verificatie?",
        _ensure_question(first_decision),
        "Welke eerste signalen moeten we binnen 60 dagen terugzien voordat we dit als breder vertrekpatroon lezen?",
        _ensure_question(f"Wanneer herijken we of {focus_text.lower()} verdere verdieping of juist begrenzing vraagt"),
    ]


def _fallback_actions(*, scan_type: str, focus_text: str, first_action: str, first_owner: str) -> list[str]:
    base = [
        first_action,
        f"Beleg {first_owner.lower()} als eerste eigenaar van {focus_text.lower()} en maak de eerstvolgende managementsessie expliciet.",
    ]
    if scan_type == "retention":
        base.append(
            f"Plan een beperkte verificatie of interventiestap rond {focus_text.lower()} en leg direct vast wanneer je terugkijkt."
        )
    else:
        base.append(
            f"Kies een kleine verbeterstap rond {focus_text.lower()} en spreek direct af wanneer je terugkijkt op uitvoering en signalen."
        )
    return base


def _build_follow_up(*, scan_type: str, focus_text: str, first_owner: str, first_action: str, review_moment: str) -> list[dict[str, str]]:
    if scan_type == "retention":
        return [
            {
                "window": "30 dagen",
                "title": "Maak verificatie en eigenaar expliciet",
                "body": _soften_copy(f"Bevestig welk deel van {focus_text.lower()} nu eerst verificatie vraagt, beleg {first_owner.lower()} en maak de eerste stap concreet."),
            },
            {
                "window": "60 dagen",
                "title": "Review de eerste stap",
                "body": _soften_copy(f"Toets of {first_action.lower()} zichtbaar loopt en welke eerste groepssignalen of werkritmes nu al verschuiven."),
            },
            {
                "window": "90 dagen",
                "title": "Herweeg vervolgroute",
                "body": _soften_copy(f"Gebruik {review_moment.lower()} om bewust te kiezen: doorgaan op hetzelfde spoor, beperkt verbreden, vervolgmeten of stoppen."),
            },
        ]
    return [
        {
            "window": "30 dagen",
            "title": "Maak route en eigenaar expliciet",
            "body": _soften_copy(f"Bevestig welk deel van {focus_text.lower()} nu eerst bestuurlijke opvolging vraagt, beleg {first_owner.lower()} en maak de eerste stap concreet."),
        },
        {
            "window": "60 dagen",
            "title": "Review de eerste verbeterstap",
            "body": _soften_copy(f"Toets of {first_action.lower()} zichtbaar loopt en welke eerste signalen uit gesprek, context of nieuwe exitinput terugkomen."),
        },
        {
            "window": "90 dagen",
            "title": "Herweeg vervolgstap",
            "body": _soften_copy(f"Gebruik {review_moment.lower()} om bewust te kiezen: verdiepen, begrenzen, vervolgmeten of stoppen."),
        },
    ]


def build_report_insight_to_action(
    *,
    scan_type: str,
    top_focus_labels: list[str],
    next_steps_payload: dict[str, Any],
    action_hypotheses: list[dict[str, Any]],
    has_pattern: bool,
) -> dict[str, Any]:
    focus_text = _format_focus_text(top_focus_labels)
    session_cards = next_steps_payload.get("session_cards", [])
    first_decision = str(next_steps_payload.get("first_decision") or f"Beslis eerst welk deel van {focus_text.lower()} nu als eerste telt.")
    first_owner = str(next_steps_payload.get("first_owner") or "de eerste eigenaar")
    first_action = str(next_steps_payload.get("first_action") or f"Maak een eerste stap rond {focus_text.lower()} expliciet.")
    review_moment = str(next_steps_payload.get("review_moment") or "plan een bewust reviewmoment")
    priority_now = _extract_card_body(
        session_cards,
        "Prioriteit nu",
        f"{focus_text} vormen nu het eerste spoor om bestuurlijk te wegen.",
    )
    owner_body = _extract_card_body(session_cards, "Eerste eigenaar", first_owner)
    action_body = _extract_card_body(session_cards, "Eerste stap", first_action)
    review_body = _extract_card_body(session_cards, "Reviewmoment", review_moment)

    management_priorities = [
        {
            "title": "Prioriteit 1",
            "body": _soften_copy(priority_now),
        },
        {
            "title": "Eerst afbakenen",
            "body": (
                _soften_copy(
                    f"Houd verificatie eerst bounded: {first_decision} Maak dit spoor niet groter voordat je het scherper hebt getoetst."
                )
                if scan_type == "retention" or not has_pattern
                else _soften_copy(f"{first_decision} Houd dit spoor bounded en toets eerst waar de meeste managementwaarde zit.")
            ),
        },
        {
            "title": "Beleg eigenaar en review",
            "body": _soften_copy(f"{owner_body}. Maak daarnaast expliciet dat je {review_body.lower()}"),
        },
    ]

    source_questions = [str(item.get("question") or "") for item in action_hypotheses]
    questions = _dedupe_strings(
        [_soften_copy(question) for question in source_questions + _fallback_questions(
            scan_type=scan_type,
            focus_text=focus_text,
            first_decision=first_decision,
            review_moment=review_moment,
        )],
        limit=5,
    )

    source_actions = [first_action] + [str(item.get("action") or "") for item in action_hypotheses]
    action_bodies = _dedupe_strings(
        [_soften_copy(action) for action in source_actions + _fallback_actions(
            scan_type=scan_type,
            focus_text=focus_text,
            first_action=first_action,
            first_owner=first_owner,
        )],
        limit=3,
    )
    possible_first_actions = [
        {
            "title": f"Mogelijke eerste actie {index}",
            "body": _soften_copy(body),
        }
        for index, body in enumerate(action_bodies, start=1)
    ]

    guardrail_note = str(
        next_steps_payload.get("session_watchout")
        or (
            "Gebruik dit als verificatie- en opvolgroute, niet als individuele predictor of bewijs van causaliteit."
            if scan_type == "retention"
            else "Gebruik dit als managementinput, niet als diagnose of causale zekerheid."
        )
    )

    return {
        "title": "Van inzicht naar eerste opvolging",
        "intro": "Gebruik deze compacte bridge om bestaand rapportmateriaal te vertalen naar een eerste managementroute.",
        "management_priorities": management_priorities,
        "verification_questions": questions,
        "possible_first_actions": possible_first_actions,
        "follow_up_30_60_90": _build_follow_up(
            scan_type=scan_type,
            focus_text=focus_text,
            first_owner=first_owner,
            first_action=action_body,
            review_moment=review_moment,
        ),
        "guardrail_note": guardrail_note,
    }
