from __future__ import annotations

from typing import Literal


DatasetOrigin = Literal["real", "synthetic", "dummy", "unknown"]

DATASET_ORIGIN_CHOICES: tuple[DatasetOrigin, ...] = (
    "real",
    "synthetic",
    "dummy",
    "unknown",
)

_SYNTHETIC_HINTS = (
    "synthetic",
    "demo",
    "validation_demo",
    "generated",
    "seeded_validation",
)
_DUMMY_HINTS = (
    "dummy",
    "test",
    "fixture",
    "pilot_dummy",
)


def normalize_dataset_origin(value: str | None) -> DatasetOrigin:
    normalized = (value or "").strip().lower()
    if normalized in DATASET_ORIGIN_CHOICES:
        return normalized  # type: ignore[return-value]
    return "unknown"


def infer_dataset_origin(*hints: object) -> DatasetOrigin:
    for hint in hints:
        if hint is None:
            continue
        text = str(hint).strip().lower()
        if not text:
            continue
        if any(token in text for token in _SYNTHETIC_HINTS):
            return "synthetic"
        if any(token in text for token in _DUMMY_HINTS):
            return "dummy"
    return "unknown"


def resolve_dataset_origin(explicit: str | None, *hints: object) -> DatasetOrigin:
    normalized = normalize_dataset_origin(explicit)
    if normalized != "unknown":
        return normalized
    return infer_dataset_origin(*hints)


def assess_validation_evidence(
    *,
    responses_origin: DatasetOrigin,
    outcomes_origin: DatasetOrigin | None = None,
) -> dict[str, object]:
    warnings: list[str] = []
    allowed_uses: list[str] = []
    prohibited_uses: list[str] = []

    counts_as_statistical_validation = responses_origin == "real"
    counts_as_market_evidence = responses_origin == "real"
    counts_as_pragmatic_validation = (
        outcomes_origin is not None and responses_origin == "real" and outcomes_origin == "real"
    )

    if responses_origin == "synthetic":
        summary = (
            "Deze dataset is synthetisch of demo-gegenereerd. Gebruik de uitkomst om de "
            "validatiepipeline, metriekdefinities en eerste statistische diagnostics te testen, "
            "niet als product- of marktbewijs."
        )
        warnings.append(
            "Synthetische of demo-data tellen niet als empirisch bewijs voor RetentieScan v1.1."
        )
        allowed_uses.extend(
            [
                "Pipeline- en scriptvalidatie",
                "Controle op reliability-, factor- en correlatie-output",
                "Interne sanity checks op rapportage en templates",
            ]
        )
        prohibited_uses.extend(
            [
                "Buyer-facing validatieclaims",
                "Claims over voorspellende of pragmatische waarde",
                "Drempel- of profile-herijking alsof echte klantdata is gebruikt",
            ]
        )
    elif responses_origin == "dummy":
        summary = (
            "Deze dataset is dummy-, fixture- of testdata. Gebruik de uitkomst om workflow, "
            "templates en acceptatiepaden te testen, niet als empirische validatie."
        )
        warnings.append(
            "Dummy- of fixturedata tellen niet als statistische of pragmatische validatiebasis."
        )
        allowed_uses.extend(
            [
                "Workflow- en regressietesten",
                "Controle op exports, templates en rapportgeneratie",
                "Handmatige QA van interpretatie- en acceptatieflow",
            ]
        )
        prohibited_uses.extend(
            [
                "Statistische onderbouwing voor v1.1-claims",
                "Claims over samenhang met echte follow-up uitkomsten",
                "Commerciele bewijsvoering",
            ]
        )
    elif responses_origin == "real":
        summary = (
            "Deze dataset bevat echte RetentieScan-responses. Gebruik de uitkomst voor interne "
            "statistische validatie en productbeslissingen, maar claim pragmatische validatie "
            "pas zodra ook echte follow-up uitkomsten zijn gekoppeld."
        )
        allowed_uses.extend(
            [
                "Interne statistische validatie van schalen en signaalrelaties",
                "Beslissingen over copygrenzen en interpretatiekaders",
                "Voorwaardelijke productaanscherping op basis van echte observaties",
            ]
        )
        prohibited_uses.extend(
            [
                "Pragmatische of outcome-based claim zonder echte follow-up uitkomsten",
                "Buyer-facing causaliteitsclaims",
                "Individuele predictieclaims",
            ]
        )
        if outcomes_origin is None:
            warnings.append(
                "Pragmatische validatie blijft open totdat echte follow-up uitkomsten zijn gekoppeld."
            )
        elif outcomes_origin != "real":
            warnings.append(
                "Follow-up uitkomsten zijn nog niet als echt gemarkeerd; behandel pragmatische uitkomsten niet als marktbewijs."
            )
    else:
        summary = (
            "De herkomst van deze dataset is onbekend. Behandel de output als interne werkoutput "
            "totdat provenance expliciet is bevestigd."
        )
        warnings.append(
            "Dataset provenance onbekend: geen buyer-facing of harde validatieclaims doen."
        )
        allowed_uses.extend(
            [
                "Interne verkenning",
                "Technische controle van outputs",
            ]
        )
        prohibited_uses.extend(
            [
                "Marktbewijs of externe validatieclaim",
                "Definitieve herijking van thresholds of playbooks",
            ]
        )

    if outcomes_origin is not None and outcomes_origin != "real":
        counts_as_pragmatic_validation = False
    if responses_origin != "real":
        counts_as_market_evidence = False
        counts_as_statistical_validation = False

    return {
        "responses_origin": responses_origin,
        "outcomes_origin": outcomes_origin,
        "counts_as_market_evidence": counts_as_market_evidence,
        "counts_as_statistical_validation": counts_as_statistical_validation,
        "counts_as_pragmatic_validation": counts_as_pragmatic_validation,
        "summary": summary,
        "warnings": warnings,
        "allowed_uses": allowed_uses,
        "prohibited_uses": prohibited_uses,
    }
