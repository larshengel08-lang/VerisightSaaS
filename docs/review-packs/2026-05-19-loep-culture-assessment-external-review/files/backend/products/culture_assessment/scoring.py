from __future__ import annotations

from collections import Counter, defaultdict
from statistics import mean
from typing import Any

from fastapi import HTTPException

from backend.products.shared.sdt import scale_to_ten
from backend.scoring_config import RISK_HIGH, RISK_MEDIUM, SCORING_VERSION


QUESTIONNAIRE_SCALE: dict[str, Any] = {
    "scale_id": "agreement_5pt",
    "min": 1,
    "max": 5,
    "labels_nl": [
        "Helemaal oneens",
        "Eerder oneens",
        "Neutraal / gemengd",
        "Eerder eens",
        "Helemaal eens",
    ],
}

TARGET_COMPLETION: dict[str, int] = {
    "target_minutes": 12,
    "max_minutes": 14,
}

MIN_VALID_RESPONSE_RULES: dict[str, Any] = {
    "minimum_closed_items_answered": 32,
    "minimum_answered_items_per_domain": 3,
    "minimum_valid_domains": 8,
    "open_text_optional": True,
}

QUESTIONNAIRE_ITEMS: list[dict[str, Any]] = [
    {"id": "CA01", "domain_id": "engagement_involvement", "prompt_nl": "Ik zet mij actief in om mijn werk goed en zorgvuldig te doen.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA02", "domain_id": "engagement_involvement", "prompt_nl": "Mijn werk geeft mij meestal energie om betrokken te blijven.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA03", "domain_id": "engagement_involvement", "prompt_nl": "Ik voel mij verantwoordelijk voor het gezamenlijke resultaat.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA04", "domain_id": "engagement_involvement", "prompt_nl": "Ik zie in mijn werk weinig reden om extra inzet te tonen.", "scale_id": "agreement_5pt", "reverse_scored": True},
    {"id": "CA05", "domain_id": "trust_psychological_safety", "prompt_nl": "Ik kan zorgen of fouten hier bespreekbaar maken zonder onnodig risico te voelen.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA06", "domain_id": "trust_psychological_safety", "prompt_nl": "Mensen luisteren hier serieus naar een afwijkend geluid.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA07", "domain_id": "trust_psychological_safety", "prompt_nl": "Ik ervaar voldoende vertrouwen tussen collega's en leiding.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA08", "domain_id": "trust_psychological_safety", "prompt_nl": "Ik houd belangrijke zorgen hier liever voor mezelf.", "scale_id": "agreement_5pt", "reverse_scored": True},
    {"id": "CA09", "domain_id": "leadership_direction", "prompt_nl": "De organisatie geeft mij voldoende duidelijke richting over wat nu belangrijk is.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA10", "domain_id": "leadership_direction", "prompt_nl": "Besluiten van leiding of directie zijn voor mij meestal goed te volgen.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA11", "domain_id": "leadership_direction", "prompt_nl": "Ik weet voldoende waar de organisatie naartoe wil bewegen.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA12", "domain_id": "leadership_direction", "prompt_nl": "Besluiten van bovenaf voelen voor mij vaak onduidelijk of tegenstrijdig.", "scale_id": "agreement_5pt", "reverse_scored": True},
    {"id": "CA13", "domain_id": "collaboration_alignment", "prompt_nl": "Samenwerking tussen teams of onderdelen werkt voor mijn werk meestal goed.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA14", "domain_id": "collaboration_alignment", "prompt_nl": "Afspraken tussen teams worden meestal nagekomen.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA15", "domain_id": "collaboration_alignment", "prompt_nl": "Ik ervaar voldoende afstemming tussen wat verschillende onderdelen van elkaar vragen.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA16", "domain_id": "collaboration_alignment", "prompt_nl": "Samenwerking tussen teams kost ons onnodig veel energie.", "scale_id": "agreement_5pt", "reverse_scored": True},
    {"id": "CA17", "domain_id": "workload_capacity", "prompt_nl": "Mijn werk is in de praktijk meestal goed vol te houden.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA18", "domain_id": "workload_capacity", "prompt_nl": "Ik heb meestal genoeg ruimte om mijn werk goed af te ronden.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA19", "domain_id": "workload_capacity", "prompt_nl": "Ik kan mijn werk meestal doen zonder dat herstel structureel in de knel komt.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA20", "domain_id": "workload_capacity", "prompt_nl": "Mijn werkdruk is meestal niet lang vol te houden.", "scale_id": "agreement_5pt", "reverse_scored": True},
    {"id": "CA21", "domain_id": "autonomy_role_clarity", "prompt_nl": "Ik weet goed wat er in mijn rol van mij verwacht wordt.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA22", "domain_id": "autonomy_role_clarity", "prompt_nl": "Ik heb voldoende ruimte om mijn werk op een passende manier uit te voeren.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA23", "domain_id": "autonomy_role_clarity", "prompt_nl": "Taken, verantwoordelijkheden en beslissingsruimte zijn voor mij meestal helder.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA24", "domain_id": "autonomy_role_clarity", "prompt_nl": "Ik moet te vaak zelf uitzoeken wat precies van mij verwacht wordt.", "scale_id": "agreement_5pt", "reverse_scored": True},
    {"id": "CA25", "domain_id": "growth_development", "prompt_nl": "Ik zie voldoende mogelijkheden om mij in mijn werk verder te ontwikkelen.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA26", "domain_id": "growth_development", "prompt_nl": "Ik krijg feedback die mij helpt beter te worden in mijn werk.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA27", "domain_id": "growth_development", "prompt_nl": "Ik ervaar voldoende perspectief om in deze organisatie te groeien.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA28", "domain_id": "growth_development", "prompt_nl": "Ik zie voor mezelf weinig ontwikkelperspectief binnen deze organisatie.", "scale_id": "agreement_5pt", "reverse_scored": True},
    {"id": "CA29", "domain_id": "change_readiness", "prompt_nl": "De organisatie kan veranderingen meestal werkbaar vertalen naar de praktijk.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA30", "domain_id": "change_readiness", "prompt_nl": "Ik ervaar voldoende ruimte om mee te bewegen met verandering.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA31", "domain_id": "change_readiness", "prompt_nl": "Veranderingen worden meestal duidelijk genoeg uitgelegd om ermee te kunnen werken.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA32", "domain_id": "change_readiness", "prompt_nl": "Veranderingen voelen hier vaak als extra last zonder duidelijke richting.", "scale_id": "agreement_5pt", "reverse_scored": True},
    {"id": "CA33", "domain_id": "reward_conditions", "prompt_nl": "De voorwaarden om mijn werk goed te doen zijn meestal op orde.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA34", "domain_id": "reward_conditions", "prompt_nl": "Beloning en waardering voelen voor mij in hoofdlijnen eerlijk.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA35", "domain_id": "reward_conditions", "prompt_nl": "De organisatie biedt mij voorwaarden die passen bij wat het werk vraagt.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA36", "domain_id": "reward_conditions", "prompt_nl": "Beloning en voorwaarden voelen voor mij niet in verhouding tot wat er gevraagd wordt.", "scale_id": "agreement_5pt", "reverse_scored": True},
    {"id": "CA37", "domain_id": "organizational_connection_intent", "prompt_nl": "Ik voel mij verbonden met deze organisatie.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA38", "domain_id": "organizational_connection_intent", "prompt_nl": "Ik ben er trots op om voor deze organisatie te werken.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA39", "domain_id": "organizational_connection_intent", "prompt_nl": "Ik kan mij goed vinden in waar deze organisatie voor staat.", "scale_id": "agreement_5pt", "reverse_scored": False},
    {"id": "CA40", "domain_id": "organizational_connection_intent", "prompt_nl": "Ik kan me moeilijk voorstellen dat ik hier over een jaar nog graag werk.", "scale_id": "agreement_5pt", "reverse_scored": True},
]

BOARD_ATTENTION_LOGIC: dict[str, Any] = {
    "inputs": [
        "domain_scores",
        "segment_spread",
        "response_coverage",
        "contrast_strength",
        "recurring_theme_pairs",
        "safe_open_text_clusters",
    ],
    "output_limit": 5,
    "priority_reasons": [
        "laag domeinbeeld op organisatieniveau",
        "groot verschil tussen onderdelen",
        "patroon komt op meerdere thema's tegelijk terug",
        "veilig open-tekstsignaal bevestigt het patroon",
        "responsbasis is sterk genoeg voor bestuurlijke aandacht",
    ],
    "confidence_labels": ["hoog", "midden", "voorzichtig"],
    "verify_next_templates": [
        "Controleer of het patroon breed organisatiebreed zichtbaar blijft.",
        "Controleer of het patroon vooral in een beperkt aantal onderdelen geconcentreerd is.",
        "Controleer of het patroon terugkomt in een tweede aangrenzend domein.",
    ],
    "forbidden_outputs": [
        "causal_diagnosis",
        "automatic_intervention_advice",
        "manager_blame",
    ],
}

SCORING_LOCK: dict[str, Any] = {
    "normalized_output_scale": "0_to_10",
    "domain_score_method": "mean_of_answered_items_after_reverse_scoring",
    "culture_index_method": "mean_of_valid_domain_scores",
    "reverse_scoring_method": "agreement_5pt_inversion",
    "requires_minimum_valid_rules": True,
}

SPLIT_INDEX = 20
QUESTIONNAIRE_ITEM_IDS = [item["id"] for item in QUESTIONNAIRE_ITEMS]
QUESTIONNAIRE_ITEMS_BY_ID = {item["id"]: item for item in QUESTIONNAIRE_ITEMS}
QUESTIONNAIRE_DOMAIN_ORDER: list[str] = []
DOMAIN_ITEM_IDS: dict[str, list[str]] = defaultdict(list)
for item in QUESTIONNAIRE_ITEMS:
    if item["domain_id"] not in QUESTIONNAIRE_DOMAIN_ORDER:
        QUESTIONNAIRE_DOMAIN_ORDER.append(item["domain_id"])
    DOMAIN_ITEM_IDS[item["domain_id"]].append(item["id"])


def _validate_questionnaire_lock() -> None:
    item_ids = [item["id"] for item in QUESTIONNAIRE_ITEMS]
    if len(item_ids) != len(set(item_ids)):
        raise ValueError("Culture Assessment questionnaire lock bevat dubbele item ids.")

    domain_counts = Counter(item["domain_id"] for item in QUESTIONNAIRE_ITEMS)
    if len(domain_counts) != 10:
        raise ValueError("Culture Assessment questionnaire lock moet precies 10 domeinen bevatten.")
    if any(count < 4 for count in domain_counts.values()):
        raise ValueError("Culture Assessment questionnaire lock vereist minimaal 4 items per domein.")

    if any(item["scale_id"] != QUESTIONNAIRE_SCALE["scale_id"] for item in QUESTIONNAIRE_ITEMS):
        raise ValueError("Culture Assessment questionnaire lock vereist een consistente antwoordscale.")

    reverse_count = sum(1 for item in QUESTIONNAIRE_ITEMS if item["reverse_scored"])
    if reverse_count < 10:
        raise ValueError("Culture Assessment questionnaire lock vereist voldoende reverse scored items.")


_validate_questionnaire_lock()


def get_questionnaire_lock_payload() -> dict[str, Any]:
    return {
        "item_count": len(QUESTIONNAIRE_ITEMS),
        "domain_count": len({item["domain_id"] for item in QUESTIONNAIRE_ITEMS}),
        "scale": QUESTIONNAIRE_SCALE,
        "target_completion": TARGET_COMPLETION,
        "min_valid_response_rules": MIN_VALID_RESPONSE_RULES,
        "scoring_lock": SCORING_LOCK,
        "board_attention_logic": BOARD_ATTENTION_LOGIC,
    }


def _scale_answer(value: int, *, reverse_scored: bool) -> float:
    raw = float(value)
    if reverse_scored:
        raw = 6.0 - raw
    return round(scale_to_ten(raw), 2)


def _mean_or_none(values: list[float]) -> float | None:
    if not values:
        return None
    return round(mean(values), 2)


def _compute_domain_scores(answer_map: dict[str, int]) -> tuple[dict[str, float], dict[str, int], list[str]]:
    domain_scores: dict[str, float] = {}
    answered_items_per_domain: dict[str, int] = {}
    valid_domains: list[str] = []

    for domain_id in QUESTIONNAIRE_DOMAIN_ORDER:
        scaled_values: list[float] = []
        for item_id in DOMAIN_ITEM_IDS[domain_id]:
            value = answer_map.get(item_id)
            if value is None:
                continue
            item = QUESTIONNAIRE_ITEMS_BY_ID[item_id]
            scaled_values.append(_scale_answer(value, reverse_scored=bool(item["reverse_scored"])))

        answered_items_per_domain[domain_id] = len(scaled_values)
        domain_score = _mean_or_none(scaled_values)
        if domain_score is not None:
            domain_scores[domain_id] = domain_score
        if len(scaled_values) >= MIN_VALID_RESPONSE_RULES["minimum_answered_items_per_domain"]:
            valid_domains.append(domain_id)

    return domain_scores, answered_items_per_domain, valid_domains


def _build_board_attention_points(
    *,
    domain_scores: dict[str, float],
    open_text: str | None,
) -> list[dict[str, str]]:
    lowest_domains = sorted(domain_scores.items(), key=lambda item: item[1])[: BOARD_ATTENTION_LOGIC["output_limit"]]
    recurring_theme_pairs = [
        ("trust_psychological_safety", "leadership_direction"),
        ("collaboration_alignment", "change_readiness"),
        ("workload_capacity", "autonomy_role_clarity"),
        ("growth_development", "organizational_connection_intent"),
    ]

    paired_domains = {
        domain_id
        for left, right in recurring_theme_pairs
        if left in domain_scores and right in domain_scores and abs(domain_scores[left] - domain_scores[right]) <= 0.6
        for domain_id in (left, right)
    }
    open_text_enabled = bool(open_text and open_text.strip())

    points: list[dict[str, str]] = []
    for index, (domain_id, score) in enumerate(lowest_domains, start=1):
        if score <= 5.2:
            priority_reason = "laag domeinbeeld op organisatieniveau"
            confidence = "hoog"
        elif domain_id in paired_domains:
            priority_reason = "patroon komt op meerdere thema's tegelijk terug"
            confidence = "midden"
        elif open_text_enabled:
            priority_reason = "veilig open-tekstsignaal bevestigt het patroon"
            confidence = "midden"
        else:
            priority_reason = "responsbasis is sterk genoeg voor bestuurlijke aandacht"
            confidence = "voorzichtig"

        verify_next = BOARD_ATTENTION_LOGIC["verify_next_templates"][min(index - 1, len(BOARD_ATTENTION_LOGIC["verify_next_templates"]) - 1)]
        points.append(
            {
                "domain_id": domain_id,
                "priority_reason": priority_reason,
                "confidence_label": confidence,
                "what_to_verify_next": verify_next,
            }
        )

    return points


def validate_submission(payload: Any) -> None:
    combined_keys = set(payload.sdt_raw.keys()) | set(payload.org_raw.keys())
    missing = [item_id for item_id in QUESTIONNAIRE_ITEM_IDS if item_id not in combined_keys]
    extra = sorted(combined_keys - set(QUESTIONNAIRE_ITEM_IDS))

    if missing:
        raise HTTPException(
            status_code=422,
            detail="Loep Culture Assessment vereist de vaste 40-item baseline-vragenlijst.",
        )
    if extra:
        raise HTTPException(
            status_code=422,
            detail="Loep Culture Assessment accepteert alleen de vaste Culture Assessment-items.",
        )
    if payload.stay_intent_score is not None or payload.signal_visibility_score is not None:
        raise HTTPException(
            status_code=422,
            detail="Loep Culture Assessment gebruikt in deze baseline geen extra richting- of zichtbaarheidsvraag.",
        )
    if payload.uwes_raw or payload.turnover_intention_raw:
        raise HTTPException(
            status_code=422,
            detail="Loep Culture Assessment gebruikt in deze baseline geen retention- of pulse-signalen.",
        )
    if payload.pull_factors_raw:
        raise HTTPException(
            status_code=422,
            detail="Loep Culture Assessment gebruikt in deze baseline geen aanvullende vertrekredenen.",
        )

    answer_map = {**payload.sdt_raw, **payload.org_raw}
    answered_count = len(answer_map)
    if answered_count < MIN_VALID_RESPONSE_RULES["minimum_closed_items_answered"]:
        raise HTTPException(
            status_code=422,
            detail="Loep Culture Assessment vereist voldoende beantwoorde items voor een geldige baseline-read.",
        )

    _domain_scores, answered_items_per_domain, valid_domains = _compute_domain_scores(answer_map)
    if len(valid_domains) < MIN_VALID_RESPONSE_RULES["minimum_valid_domains"]:
        raise HTTPException(
            status_code=422,
            detail="Loep Culture Assessment vereist voldoende valide domeinen voor vrijgave van de baseline-read.",
        )

    weak_domains = [
        domain_id
        for domain_id, count in answered_items_per_domain.items()
        if 0 < count < MIN_VALID_RESPONSE_RULES["minimum_answered_items_per_domain"]
    ]
    if weak_domains:
        raise HTTPException(
            status_code=422,
            detail="Loep Culture Assessment vereist minimaal 3 beantwoorde items per meegenomen domein.",
        )


def score_submission(
    *,
    payload: Any,
    campaign: Any,
    respondent: Any,
    exit_reason_code: str | None = None,
    contributing_reason_codes: list[str],
) -> dict[str, Any]:
    del campaign, respondent, exit_reason_code, contributing_reason_codes

    answer_map = {**payload.sdt_raw, **payload.org_raw}
    domain_scores, answered_items_per_domain, valid_domains = _compute_domain_scores(answer_map)
    valid_domain_scores = [domain_scores[domain_id] for domain_id in valid_domains if domain_id in domain_scores]
    culture_index = round(mean(valid_domain_scores), 2)

    if culture_index >= RISK_HIGH:
        risk_band = "HOOG"
    elif culture_index >= RISK_MEDIUM:
        risk_band = "MIDDEN"
    else:
        risk_band = "LAAG"

    first_half_scores = [domain_scores[domain_id] for domain_id in QUESTIONNAIRE_DOMAIN_ORDER[:5] if domain_id in domain_scores]
    second_half_scores = [domain_scores[domain_id] for domain_id in QUESTIONNAIRE_DOMAIN_ORDER[5:] if domain_id in domain_scores]
    sdt_scores = {
        "culture_wave_1": round(mean(first_half_scores), 2) if first_half_scores else None,
        "culture_wave_2": round(mean(second_half_scores), 2) if second_half_scores else None,
        "culture_index": culture_index,
        "answered_items": len(answer_map),
    }

    board_attention_points = _build_board_attention_points(
        domain_scores=domain_scores,
        open_text=payload.open_text,
    )
    risk_result = {
        "risk_score": culture_index,
        "risk_band": risk_band,
        "factor_risks": domain_scores,
        "factor_weights": {domain_id: 1.0 for domain_id in domain_scores},
        "weighted_factors": domain_scores,
        "active_factors": list(domain_scores.keys()),
    }

    full_result = {
        "culture_index": culture_index,
        "domain_scores": domain_scores,
        "answered_items_per_domain": answered_items_per_domain,
        "valid_domains": valid_domains,
        "board_attention_points": board_attention_points,
        "response_basis": {
            "answered_closed_items": len(answer_map),
            "minimum_closed_items_answered": MIN_VALID_RESPONSE_RULES["minimum_closed_items_answered"],
            "minimum_valid_domains": MIN_VALID_RESPONSE_RULES["minimum_valid_domains"],
        },
        "method_guardrails": {
            "no_causal_claims": True,
            "no_individual_predictions": True,
            "no_manager_ranking_logic": True,
        },
    }

    return {
        "sdt_scores": sdt_scores,
        "org_scores": domain_scores,
        "risk_result": risk_result,
        "preventability_result": {},
        "replacement_cost_eur": None,
        "recommendations": [],
        "uwes_score": None,
        "turnover_intention_score": None,
        "retention_summary": None,
        "full_result": full_result,
        "scoring_version": SCORING_VERSION,
    }
