from backend.insight_to_action import build_report_insight_to_action


def _build_next_steps_payload() -> dict:
    return {
        "first_decision": "Beslis eerst welk werkspoor nu als eerste verificatie en opvolging vraagt.",
        "first_owner": "HR business partner met betrokken leidinggevende",
        "first_action": "Maak binnen 30 dagen de eerste stap expliciet en begrensd.",
        "review_moment": "Plan binnen 60-90 dagen een review op gekozen spoor en eerste actie.",
        "session_watchout": "Gebruik dit als managementinput, niet als diagnose of causale zekerheid.",
        "session_cards": [
            {"title": "Prioriteit nu", "body": "Werkbelasting is nu het eerste spoor om bestuurlijk te wegen."},
            {"title": "Eerste eigenaar", "body": "HR business partner met betrokken leidinggevende"},
            {"title": "Eerste stap", "body": "Maak binnen 30 dagen de eerste stap expliciet en begrensd."},
            {"title": "Reviewmoment", "body": "Plan binnen 60-90 dagen een review op gekozen spoor en eerste actie."},
        ],
        "steps": [
            {"number": "1", "title": "Kies het eerste managementspoor", "body": "Maak expliciet welk spoor eerst telt."},
            {"number": "2", "title": "Beleg direct een eerste eigenaar", "body": "Leg vast wie dit eerste spoor trekt."},
            {"number": "3", "title": "Vertaal naar beperkte acties", "body": "Kies alleen acties die logisch volgen uit het groepsbeeld."},
        ],
    }


def test_exit_report_insight_to_action_builds_bounded_management_package():
    output = build_report_insight_to_action(
        scan_type="exit",
        top_focus_labels=["Werkbelasting", "Leiderschap"],
        next_steps_payload=_build_next_steps_payload(),
        action_hypotheses=[
            {
                "title": "Werkdruk vraagt verificatie",
                "question": "Waar zet werkdruk vertrek het scherpst onder druk?",
                "action": "Plan binnen 2 weken een gerichte werklastreview in de meest afwijkende teams.",
            },
            {
                "title": "Leiderschap vraagt afbakening",
                "question": "Welke leidinggevende context vraagt hier als eerste verificatie?",
                "action": "Maak binnen 30 dagen expliciet welk leidinggevend ritme aangepast moet worden.",
            },
            {
                "title": "Rolkeuze vraagt begrenzing",
                "question": "Welke keuze voorkomt dat dit spoor te breed of te snel wordt gemaakt?",
                "action": "Beleg een eerste managementsessie met eigenaar, kleine stap en reviewmoment.",
            },
        ],
        has_pattern=True,
    )

    assert output["title"] == "Van inzicht naar eerste opvolging"
    assert len(output["management_priorities"]) == 3
    assert len(output["verification_questions"]) == 5
    assert len(output["possible_first_actions"]) == 3
    assert [item["window"] for item in output["follow_up_30_60_90"]] == ["30 dagen", "60 dagen", "90 dagen"]
    assert "diagnose" in output["guardrail_note"].lower()


def test_retention_report_insight_to_action_keeps_verification_first_language():
    payload = _build_next_steps_payload()
    payload["session_watchout"] = (
        "Gebruik dit als verificatie- en opvolgroute, niet als individuele predictor of bewijs van causaliteit."
    )

    output = build_report_insight_to_action(
        scan_type="retention",
        top_focus_labels=["Werkbelasting", "Cultuur"],
        next_steps_payload=payload,
        action_hypotheses=[
            {
                "title": "Werkdruk vraagt snelle verificatie",
                "question": "Waar zet werkdruk behoud het sterkst onder druk?",
                "action": "Toets binnen 30 dagen waar werkdruk, planning of herstelruimte eerst bijsturing vraagt.",
            },
            {
                "title": "Cultuur vraagt begrenzing",
                "question": "Welke teams vragen eerst een begrensd verificatiespoor rond veiligheid of samenwerking?",
                "action": "Plan een beperkte teamsessie om veiligheid en samenwerking te verifieren.",
            },
        ],
        has_pattern=False,
    )

    assert len(output["management_priorities"]) == 3
    assert len(output["verification_questions"]) == 5
    assert len(output["possible_first_actions"]) == 3
    assert "predictor" in output["guardrail_note"].lower()
    assert any("verificatie" in item["body"].lower() for item in output["management_priorities"])


def test_report_insight_to_action_dedupes_and_softens_overclaiming_language():
    payload = _build_next_steps_payload()
    payload["first_action"] = "Dit oplossen zal leiden tot bewijs van de echte oorzaak."

    output = build_report_insight_to_action(
        scan_type="exit",
        top_focus_labels=["Werkbelasting"],
        next_steps_payload=payload,
        action_hypotheses=[
            {
                "title": "Werkdruk",
                "question": "Welke oorzaak moeten we hier eerst bewijzen?",
                "action": "Dit oplossen zal leiden tot bewijs van de echte oorzaak.",
            },
            {
                "title": "Werkdruk dubbel",
                "question": "Welke oorzaak moeten we hier eerst bewijzen?",
                "action": "Dit oplossen zal leiden tot bewijs van de echte oorzaak.",
            },
        ],
        has_pattern=False,
    )

    assert len(output["verification_questions"]) == 5
    assert len(output["possible_first_actions"]) == 3
    assert all("oorzaak" not in question.lower() for question in output["verification_questions"])
    assert all("oplossen" not in item["body"].lower() for item in output["possible_first_actions"])
    assert all("bewijs" not in item["body"].lower() for item in output["possible_first_actions"])
