from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import openpyxl
import yaml


ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "docs" / "strategy" / "ROADMAP_DATA.yaml"
CHECKLIST_PATH = ROOT / "docs" / "prompts" / "PROMPT_CHECKLIST.xlsx"
ROADMAP_PATH = ROOT / "docs" / "strategy" / "ROADMAP.md"


@dataclass
class ChecklistItem:
    prompt_file: str
    deliverable: str
    title: str
    phase: str
    default_note: str


def load_data() -> dict[str, Any]:
    return yaml.safe_load(DATA_PATH.read_text(encoding="utf-8"))


def load_existing_checklist_state() -> dict[str, list[Any]]:
    if not CHECKLIST_PATH.exists():
        return {}

    wb = openpyxl.load_workbook(CHECKLIST_PATH)
    ws = wb.active
    existing: dict[str, list[Any]] = {}
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row and row[0]:
            values = list(row)
            if len(values) < 6:
                values += [None] * (6 - len(values))
            existing[str(values[0])] = values
    return existing


def build_checklist_rows(data: dict[str, Any], existing: dict[str, list[Any]]) -> list[list[Any]]:
    rows: list[list[Any]] = []
    for raw_item in data["checklist"]["items"]:
        item = ChecklistItem(**raw_item)
        old = existing.get(item.prompt_file)
        if old:
            status = old[2] or "Niet voldaan"
            last_updated = old[3]
            notes = old[4]
            live = old[5]
            if status != "Voldaan":
                notes = item.default_note
            rows.append([item.prompt_file, item.deliverable, status, last_updated, notes, live])
        else:
            rows.append([item.prompt_file, item.deliverable, "Niet voldaan", None, item.default_note, None])
    return rows


def save_checklist(data: dict[str, Any], rows: list[list[Any]]) -> None:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Checklist"
    ws.append(data["checklist"]["header"])
    for row in rows:
        ws.append(row)
    wb.save(CHECKLIST_PATH)


def release_status_warnings(rows: list[list[Any]]) -> list[str]:
    warnings: list[str] = []
    legacy_markers = (
        "live via main",
        "live op main",
        "uitgevoerd in repo",
    )
    for row in rows:
        prompt_file = str(row[0])
        status = "" if row[2] is None else str(row[2]).strip().lower()
        release_state = "" if row[5] is None else str(row[5]).strip()
        release_state_lower = release_state.lower()
        if status != "voldaan":
            continue
        if not release_state:
            warnings.append(f"{prompt_file}: status is Voldaan maar repo/main/deploy/live-status ontbreekt.")
            continue
        if any(marker in release_state_lower for marker in legacy_markers):
            warnings.append(
                f"{prompt_file}: gebruikt legacy release-status '{release_state}'. "
                "Vervang door expliciete repo-only of live-bevestigde formulering."
            )
    return warnings


def phase_status(rows_by_prompt: dict[str, list[Any]], items: list[str], current_phase_id: str, phase_id: str) -> list[str]:
    completed = sum(1 for key in items if rows_by_prompt.get(key, [None, None, "Niet voldaan"])[2] == "Voldaan")
    total = len(items)
    lines: list[str] = []
    if total == 0:
        lines.append("- gepland")
        return lines
    if completed == total:
        lines.append("- afgerond")
    elif phase_id == current_phase_id:
        lines.append("- huidige actieve focus")
        if completed > 0:
            lines.append(f"- {completed} van {total} checklist-items afgerond")
    elif completed > 0:
        lines.append(f"- deels uitgevoerd ({completed}/{total})")
    else:
        lines.append("- gepland")
    return lines


def build_roadmap_markdown(data: dict[str, Any], rows: list[list[Any]]) -> str:
    rows_by_prompt = {str(row[0]): row for row in rows}
    phases = data["phases"]

    current_phase_id = next(
        (
            phase["id"]
            for phase in phases
            if any(rows_by_prompt.get(key, [None, None, "Niet voldaan"])[2] != "Voldaan" for key in phase["items"])
        ),
        phases[-1]["id"],
    )

    lines: list[str] = []
    lines.append(f"# {data['metadata']['title']} - Roadmap")
    lines.append("")
    lines.append("Levend document. Dit bestand wordt gegenereerd uit `docs/strategy/ROADMAP_DATA.yaml` en de actuele status in `docs/prompts/PROMPT_CHECKLIST.xlsx`.")
    lines.append(f"Laatst gegenereerd: {datetime.now(timezone.utc).date().isoformat()}")
    lines.append("")
    lines.append("## Gebruik")
    lines.append("")
    lines.append(f"- [PROMPT_CHECKLIST.xlsx]({data['metadata']['tactical_queue_path']}) is de tactische uitvoerqueue.")
    lines.append("- Deze roadmap beschrijft de strategische fases, gates en afhankelijkheden.")
    lines.append(f"- Externe documenten in [{Path(data['metadata']['external_docs_path']).name}]({data['metadata']['external_docs_path']}) zijn waardevolle referentie, maar mogen geen concurrerende roadmap vormen.")
    lines.append("")
    lines.append("## Huidige stand")
    lines.append("")
    for bullet in data["metadata"]["current_state_intro"]:
        lines.append(f"- {bullet}")
    lines.append("")
    saas_readiness = data["metadata"].get("saas_readiness")
    if saas_readiness:
        lines.append(f"## {saas_readiness['title']}")
        lines.append("")
        lines.append("**Al aanwezig**")
        for bullet in saas_readiness.get("present", []):
            lines.append(f"- {bullet}")
        lines.append("")
        lines.append("**Deels aanwezig**")
        for bullet in saas_readiness.get("partial", []):
            lines.append(f"- {bullet}")
        lines.append("")
        lines.append("**Ontbreekt nog**")
        for bullet in saas_readiness.get("missing", []):
            lines.append(f"- {bullet}")
        lines.append("")
        lines.append("**Pas later doen**")
        for bullet in saas_readiness.get("later", []):
            lines.append(f"- {bullet}")
        lines.append("")

    title_by_prompt = {item["prompt_file"]: item["title"] for item in data["checklist"]["items"]}
    for phase in phases:
        lines.append(f"## {phase['title']}")
        lines.append("")
        lines.append("**Doel**")
        lines.append(phase["objective"])
        lines.append("")
        lines.append("**Hoort in deze fase**")
        for key in phase["items"]:
            title = title_by_prompt[key]
            row = rows_by_prompt.get(key)
            if row and row[2] == "Voldaan":
                lines.append(f"- {title} - afgerond")
            else:
                lines.append(f"- {title}")
        lines.append("")
        lines.append("**Status**")
        lines.extend(phase_status(rows_by_prompt, phase["items"], current_phase_id, phase["id"]))
        lines.append("")
        lines.append("**Exit gate**")
        for bullet in phase["exit_gate"]:
            lines.append(f"- {bullet}")
        if phase["waits_until_later"]:
            lines.append("")
            lines.append("**Wacht expliciet tot later**")
            for bullet in phase["waits_until_later"]:
                lines.append(f"- {bullet}")
        lines.append("")

    lines.append("## Externe afhankelijkheden en gates")
    lines.append("")
    for bullet in data["metadata"]["external_dependencies"]:
        lines.append(f"- {bullet}")
    lines.append("")
    lines.append("## Wat we nu bewust niet eerst doen")
    lines.append("")
    for bullet in data["metadata"]["not_now"]:
        lines.append(f"- {bullet}")
    lines.append("")
    lines.append("## Documentregels")
    lines.append("")
    lines.append('- gebruik de checklist voor "wat nu als eerst?"')
    lines.append('- gebruik deze roadmap voor "waarom in deze fase?"')
    lines.append("- gebruik externe documenten als input of referentie, niet als autonome werkvolgorde")
    lines.append("")
    return "\n".join(lines)


def verify_prompt_files(data: dict[str, Any]) -> list[str]:
    prompts_dir = ROOT / "docs" / "prompts"
    missing: list[str] = []
    for item in data["checklist"]["items"]:
        if not (prompts_dir / item["prompt_file"]).exists():
            missing.append(item["prompt_file"])
    return missing


def main() -> None:
    data = load_data()
    existing = load_existing_checklist_state()
    rows = build_checklist_rows(data, existing)
    save_checklist(data, rows)
    ROADMAP_PATH.write_text(build_roadmap_markdown(data, rows), encoding="utf-8")

    missing = verify_prompt_files(data)
    warnings = release_status_warnings(rows)
    print(f"Synced checklist: {CHECKLIST_PATH}")
    print(f"Synced roadmap:   {ROADMAP_PATH}")
    if missing:
        print("Missing prompt files:")
        for item in missing:
            print(f"- {item}")
    else:
        print("All prompt files referenced in the checklist exist.")
    if warnings:
        print("Checklist release-status warnings:")
        for item in warnings:
            print(f"- {item}")


if __name__ == "__main__":
    main()
