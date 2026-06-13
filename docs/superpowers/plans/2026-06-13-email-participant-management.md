# E-mail & Deelnemerbeheer (self-send mode) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "self-send" delivery mode where the platform stores **no** participant e-mails, tracks response % against a manually-entered invited count, generates copy-paste e-mail templates for HR to send from their own mailbox, and nudges HR (not respondents) on reminder days — coexisting with the existing managed (CSV-import + platform-send) flow.

**Architecture:** A campaign carries a `comms_mode` (`managed` default | `self_send`). For `self_send` campaigns the per-campaign beheer surface shows a new `SelfSendSetupPanel` (a 5-step wizard) instead of `GuidedSelfServePanel`. Setup data lives on the existing `campaign_delivery_records` row (new columns `invited_count`, `self_send_config`, `self_send_reminders`); the survey-taking side reuses the already-present open flow (`public_survey_token` → `/survey/open/{token}`). Single-fill is enforced with a client `localStorage` marker plus a server-side `dedup_key_hash` on `respondents`. Reminder days produce a dashboard banner (computed lazily) and a transactional e-mail to the HR admin via a new idempotent internal dispatch endpoint.

**Tech Stack:** Next.js 15 (App Router, React 19) + Supabase (browser/server SDK, direct table writes from Next API routes) on the HR side; FastAPI + SQLAlchemy + Jinja templates on the survey/email side. Tests: vitest (frontend, colocated `*.test.ts`, pure-function style) and pytest (backend, `tests/`, SQLite in-memory via `Base.metadata.create_all`, FastAPI `TestClient`).

---

## Context the engineer must know before starting

- **Two backends.** Campaign/delivery management is written **directly to Supabase from Next.js API routes** (e.g. [launch-config/route.ts](../../../frontend/app/api/campaigns/[id]/launch-config/route.ts)). The survey intro/start/submit and report generation live in **FastAPI** ([backend/main.py](../../../backend/main.py)). The self-send setup (invited count, config, copy templates, two-step launch) is a Next/Supabase concern; single-fill dedup and the reminder-day e-mail are FastAPI concerns.
- **Do not touch the managed flow.** `GuidedSelfServePanel`, `lib/launch-controls.ts`, `participant_comms_config`, `reminder_config`, `send-invites`, `send_survey_invite/reminder` stay exactly as they are. The new mode is additive.
- **Schema parity is enforced.** [tests/test_delivery_schema_parity.py](../../../tests/test_delivery_schema_parity.py) asserts delivery-record columns appear in **both** `supabase/schema.sql` **and** `backend/models.py`. Any new delivery-record column must be added to both files (and a `migrations/` file for the live DB).
- **`campaign_stats.total_invited` counts respondent rows.** For self-send, respondents are created on "Start", so that count = "people who started", not "people invited". The denominator is the manual `invited_count`; response % is computed in app code (`total_completed / invited_count`), **not** by changing the view.
- **No scheduler exists.** Railway runs only the web process ([railway.toml](../../../railway.toml)). The reminder-day e-mail is sent by an internal endpoint that must be triggered by an external cron/pinger; the dashboard banner is the always-works fallback (disclose this, per the project's "fail loud, disclosed fallback" rule).
- **Frontend test run:** from `Verisight/frontend`, `npx vitest run <relative-path>`. **Backend test run:** from `Verisight`, `.venv/Scripts/python.exe -m pytest <path> -v`.
- **Survey base URL.** The open survey link is `${FRONTEND_URL}/survey/open/{public_survey_token}` (the Next proxy at [survey/open/[token]/route.ts](../../../frontend/app/survey/open/[token]/route.ts) forwards to FastAPI). Templates must use the public token, never `campaign.id`.

## File Structure

**Create:**
- `migrations/2026_06_13_add_self_send_mode.sql` — live-DB migration for all new columns.
- `frontend/lib/self-send-comms.ts` — pure types/helpers: config + reminder shapes, defaults, normalize/validate, response-rate, reminder-date resolution, copy-template builders.
- `frontend/lib/self-send-comms.test.ts` — vitest for the above.
- `frontend/app/api/campaigns/[id]/self-send-config/route.ts` — PATCH endpoint (Supabase write) for invited count, config, reminders, two-step launch.
- `frontend/components/dashboard/self-send-setup-panel.tsx` — the 5-step wizard.
- `backend/self_send.py` — pure helpers: dedup-key hashing, reminder-date resolution, due-reminder selection.
- `templates/emails/reminder_day.html` — HR reminder-day e-mail body.
- `tests/test_self_send.py` — pytest for `backend/self_send.py`, the open-flow dedup, the reminder e-mail, and the dispatch endpoint.

**Modify:**
- `backend/models.py` — add `Campaign.comms_mode`; `CampaignDeliveryRecord.invited_count/self_send_config/self_send_reminders`; `Respondent.dedup_key_hash`.
- `supabase/schema.sql` — mirror the same columns.
- `tests/test_delivery_schema_parity.py` — assert the new delivery-record columns exist in both files.
- `backend/email.py` — add `send_reminder_day_notice(...)`.
- `backend/main.py` — accept `dedup_key` in `open_survey_start`; add `POST /api/internal/reminders/dispatch`.
- `templates/survey-intro.html` — localStorage single-fill guard + `dedup_key` hidden field.
- `frontend/lib/types.ts` — `CommsMode` + `Campaign.comms_mode`.
- `frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts` — read `comms_mode` + self-send fields, expose a `selfSend` block (response rate, due reminder).
- `frontend/app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.tsx` — render `SelfSendSetupPanel` for self-send campaigns.
- `frontend/components/dashboard/new-campaign-form.tsx` — comms-mode choice on create.

---

## Task 1: Schema & models — new columns + parity

**Files:**
- Create: `migrations/2026_06_13_add_self_send_mode.sql`
- Modify: `backend/models.py` (Campaign ~L131-136, CampaignDeliveryRecord ~L377-378, Respondent ~L205)
- Modify: `supabase/schema.sql` (campaigns table, campaign_delivery_records table, respondents table)
- Test: `tests/test_delivery_schema_parity.py`

- [ ] **Step 1: Write the failing parity test**

Add to `tests/test_delivery_schema_parity.py`:

```python
def test_self_send_columns_present_in_schema_and_model():
    schema = _read("supabase/schema.sql")
    models = _read("backend/models.py")

    for token in ("comms_mode", "invited_count", "self_send_config", "self_send_reminders"):
        assert token in schema, f"{token} missing from schema.sql"
        assert token in models, f"{token} missing from models.py"

    assert "dedup_key_hash" in schema
    assert "dedup_key_hash" in models
```

- [ ] **Step 2: Run it to verify it fails**

Run: `.venv/Scripts/python.exe -m pytest tests/test_delivery_schema_parity.py::test_self_send_columns_present_in_schema_and_model -v`
Expected: FAIL (`comms_mode missing from schema.sql`).

- [ ] **Step 3: Add the ORM columns**

In `backend/models.py`, inside `class Campaign`, after the `delivery_mode` line (~L133):

```python
    # Comms mode: "managed" = platform stuurt uitnodigingen/herinneringen (CSV-import flow).
    # "self_send" = HR verstuurt zelf vanuit eigen mailbox; platform slaat geen deelnemer-e-mails op.
    comms_mode: Mapped[str] = mapped_column(String(20), nullable=False, default="managed")
```

In `class CampaignDeliveryRecord`, after the `reminder_config` line (~L378):

```python
    # Self-send mode only — handmatig ingevoerd aantal uitgenodigde deelnemers (de noemer voor respons%).
    invited_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # Self-send communicatie: { senderName, endDate, inviteSubject, inviteBody, reminderSubject, reminderBody }
    self_send_config: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    # Self-send reminders: list of { id, kind, daysBeforeEnd, date, notifiedAt }
    self_send_reminders: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
```

In `class Respondent`, after the `token_expires_at` line (~L205):

```python
    # Self-send single-fill dedup: sha256 van de client-UUID (geen PII). Scoped per campagne.
    dedup_key_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
```

- [ ] **Step 4: Mirror in `supabase/schema.sql`**

In the `campaigns` table definition add (after `delivery_mode`):

```sql
  comms_mode text not null default 'managed',
```

In the `campaign_delivery_records` table definition add (after `reminder_config`):

```sql
  invited_count integer,
  self_send_config jsonb not null default '{}'::jsonb,
  self_send_reminders jsonb not null default '[]'::jsonb,
```

In the `respondents` table definition add (after `token_expires_at`):

```sql
  dedup_key_hash text,
```

- [ ] **Step 5: Write the live migration**

Create `migrations/2026_06_13_add_self_send_mode.sql`:

```sql
-- Migration: self-send deelnemer- en e-mailbeheer (subsysteem 2)
-- Datum: 2026-06-13
-- Uitvoeren in: Supabase Dashboard -> SQL Editor
-- Additief en idempotent. Bestaande campagnes blijven 'managed'.

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS comms_mode text NOT NULL DEFAULT 'managed';

ALTER TABLE public.campaign_delivery_records
  ADD COLUMN IF NOT EXISTS invited_count integer,
  ADD COLUMN IF NOT EXISTS self_send_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS self_send_reminders jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.respondents
  ADD COLUMN IF NOT EXISTS dedup_key_hash text;

CREATE INDEX IF NOT EXISTS idx_respondents_dedup
  ON public.respondents (campaign_id, dedup_key_hash);
```

- [ ] **Step 6: Run parity + existing delivery tests to verify pass**

Run: `.venv/Scripts/python.exe -m pytest tests/test_delivery_schema_parity.py -v`
Expected: PASS (all tests, including the existing launch-control parity tests).

- [ ] **Step 7: Commit**

```bash
git add backend/models.py supabase/schema.sql migrations/2026_06_13_add_self_send_mode.sql tests/test_delivery_schema_parity.py
git commit -m "feat(self-send): add comms_mode, invited_count, self_send config + dedup columns"
```

---

## Task 2: Shared TS types — CommsMode

**Files:**
- Modify: `frontend/lib/types.ts` (~L13 and `interface Campaign` ~L43-53)

- [ ] **Step 1: Add the `CommsMode` type and Campaign field**

In `frontend/lib/types.ts`, after `export type DeliveryMode = 'baseline' | 'live'` (L13):

```typescript
export type CommsMode = 'managed' | 'self_send'
```

In `interface Campaign`, after `delivery_mode: DeliveryMode | null` (L48):

```typescript
  comms_mode: CommsMode
```

- [ ] **Step 2: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: PASS (no new errors introduced by this change; `comms_mode` is additive and existing inserts/selects don't yet reference it).

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/types.ts
git commit -m "feat(self-send): add CommsMode type and Campaign.comms_mode"
```

---

## Task 3: Frontend pure library — self-send-comms

**Files:**
- Create: `frontend/lib/self-send-comms.ts`
- Test: `frontend/lib/self-send-comms.test.ts`

- [ ] **Step 1: Write the failing test**

Create `frontend/lib/self-send-comms.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import {
  MIN_INVITED_COUNT,
  buildSurveyLink,
  buildInviteTemplate,
  buildReminderTemplate,
  computeResponseRatePct,
  createDefaultSelfSendConfig,
  getDueReminders,
  normalizeSelfSendConfig,
  resolveReminderDate,
  validateInvitedCount,
} from './self-send-comms'

describe('self-send-comms', () => {
  it('defaults sender name to empty and has no end date', () => {
    const config = createDefaultSelfSendConfig()
    expect(config.senderName).toBe('')
    expect(config.endDate).toBeNull()
  })

  it('rejects invited counts below the minimum', () => {
    expect(validateInvitedCount(4)).toHaveLength(1)
    expect(validateInvitedCount(MIN_INVITED_COUNT)).toHaveLength(0)
    expect(validateInvitedCount(34)).toHaveLength(0)
  })

  it('computes response rate against the manual denominator and caps at 100', () => {
    expect(computeResponseRatePct(0, 10)).toBe(0)
    expect(computeResponseRatePct(5, 0)).toBeNull()
    expect(computeResponseRatePct(17, 34)).toBe(50)
    expect(computeResponseRatePct(40, 34)).toBe(100)
  })

  it('builds the open survey link from the public token', () => {
    expect(buildSurveyLink('https://verisight.nl', 'tok-123')).toBe(
      'https://verisight.nl/survey/open/tok-123',
    )
    expect(buildSurveyLink('https://verisight.nl/', 'tok-123')).toBe(
      'https://verisight.nl/survey/open/tok-123',
    )
  })

  it('resolves relative reminders against the end date', () => {
    expect(
      resolveReminderDate({ id: 'a', kind: 'relative', daysBeforeEnd: 3, date: null, notifiedAt: null }, '2026-06-20'),
    ).toBe('2026-06-17')
    expect(
      resolveReminderDate({ id: 'b', kind: 'absolute', daysBeforeEnd: null, date: '2026-06-18', notifiedAt: null }, '2026-06-20'),
    ).toBe('2026-06-18')
  })

  it('returns reminders due on or before today that are not yet notified', () => {
    const reminders = [
      { id: 'a', kind: 'relative' as const, daysBeforeEnd: 3, date: null, notifiedAt: null },
      { id: 'b', kind: 'absolute' as const, daysBeforeEnd: null, date: '2026-06-25', notifiedAt: null },
      { id: 'c', kind: 'absolute' as const, daysBeforeEnd: null, date: '2026-06-17', notifiedAt: '2026-06-17T08:00:00Z' },
    ]
    const due = getDueReminders(reminders, '2026-06-20', '2026-06-17')
    expect(due.map((r) => r.id)).toEqual(['a'])
  })

  it('bakes the survey link into the invitation template body', () => {
    const tpl = buildInviteTemplate({
      senderName: 'Sarah de Vries, HR',
      organizationName: 'Acme BV',
      scanLabel: 'ExitScan',
      surveyLink: 'https://verisight.nl/survey/open/tok-123',
    })
    expect(tpl.subject).toContain('Acme BV')
    expect(tpl.body).toContain('https://verisight.nl/survey/open/tok-123')
    expect(tpl.body).toContain('Sarah de Vries, HR')
  })

  it('reminder template references the same link and signals it is a reminder', () => {
    const tpl = buildReminderTemplate({
      senderName: 'Sarah',
      organizationName: 'Acme BV',
      scanLabel: 'ExitScan',
      surveyLink: 'https://verisight.nl/survey/open/tok-123',
    })
    expect(tpl.subject.toLowerCase()).toContain('herinnering')
    expect(tpl.body).toContain('https://verisight.nl/survey/open/tok-123')
  })

  it('normalizes partial stored config without losing edited templates', () => {
    const config = normalizeSelfSendConfig({ senderName: '  HR  ', inviteSubject: 'Custom' })
    expect(config.senderName).toBe('HR')
    expect(config.inviteSubject).toBe('Custom')
    expect(config.reminderSubject).toBe('')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd frontend && npx vitest run lib/self-send-comms.test.ts`
Expected: FAIL ("Failed to resolve import './self-send-comms'").

- [ ] **Step 3: Implement the library**

Create `frontend/lib/self-send-comms.ts`:

```typescript
// Self-send mode — pure helpers. No e-mail addresses are stored server-side;
// these builders only produce copy-paste text and compute display values.

export const MIN_INVITED_COUNT = 5

export interface SelfSendConfig {
  senderName: string
  endDate: string | null // YYYY-MM-DD
  inviteSubject: string
  inviteBody: string
  reminderSubject: string
  reminderBody: string
}

export type ReminderKind = 'relative' | 'absolute'

export interface SelfSendReminder {
  id: string
  kind: ReminderKind
  daysBeforeEnd: number | null
  date: string | null // YYYY-MM-DD (absolute, or resolved)
  notifiedAt: string | null
}

export interface EmailTemplate {
  subject: string
  body: string
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function trimStr(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function createDefaultSelfSendConfig(): SelfSendConfig {
  return {
    senderName: '',
    endDate: null,
    inviteSubject: '',
    inviteBody: '',
    reminderSubject: '',
    reminderBody: '',
  }
}

export function normalizeSelfSendConfig(value: unknown): SelfSendConfig {
  const c = (value ?? {}) as Partial<SelfSendConfig>
  const endDate = trimStr(c.endDate)
  return {
    senderName: trimStr(c.senderName),
    endDate: DATE_ONLY.test(endDate) ? endDate : null,
    inviteSubject: trimStr(c.inviteSubject),
    inviteBody: typeof c.inviteBody === 'string' ? c.inviteBody : '',
    reminderSubject: trimStr(c.reminderSubject),
    reminderBody: typeof c.reminderBody === 'string' ? c.reminderBody : '',
  }
}

export function validateInvitedCount(value: unknown): string[] {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(n) || n < MIN_INVITED_COUNT) {
    return [`Aantal uitgenodigde deelnemers moet minimaal ${MIN_INVITED_COUNT} zijn.`]
  }
  return []
}

export function computeResponseRatePct(completed: number, invitedCount: number | null): number | null {
  if (!invitedCount || invitedCount <= 0) return null
  return Math.min(100, Math.round((completed / invitedCount) * 100))
}

export function buildSurveyLink(frontendBaseUrl: string, publicSurveyToken: string): string {
  return `${frontendBaseUrl.replace(/\/+$/, '')}/survey/open/${publicSurveyToken}`
}

export function normalizeSelfSendReminders(value: unknown): SelfSendReminder[] {
  if (!Array.isArray(value)) return []
  return value.map((raw, index) => {
    const r = (raw ?? {}) as Partial<SelfSendReminder>
    const kind: ReminderKind = r.kind === 'absolute' ? 'absolute' : 'relative'
    const date = trimStr(r.date)
    return {
      id: trimStr(r.id) || `reminder-${index}`,
      kind,
      daysBeforeEnd:
        kind === 'relative' && typeof r.daysBeforeEnd === 'number' ? r.daysBeforeEnd : kind === 'relative' ? 3 : null,
      date: kind === 'absolute' && DATE_ONLY.test(date) ? date : null,
      notifiedAt: trimStr(r.notifiedAt) || null,
    }
  })
}

function addDays(isoDate: string, delta: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

export function resolveReminderDate(reminder: SelfSendReminder, endDate: string | null): string | null {
  if (reminder.kind === 'absolute') {
    return reminder.date && DATE_ONLY.test(reminder.date) ? reminder.date : null
  }
  if (!endDate || !DATE_ONLY.test(endDate) || reminder.daysBeforeEnd == null) return null
  return addDays(endDate, -reminder.daysBeforeEnd)
}

export function getDueReminders(
  reminders: SelfSendReminder[],
  endDate: string | null,
  today: string,
): SelfSendReminder[] {
  return reminders.filter((reminder) => {
    if (reminder.notifiedAt) return false
    const resolved = resolveReminderDate(reminder, endDate)
    return resolved !== null && resolved <= today
  })
}

interface TemplateArgs {
  senderName: string
  organizationName: string
  scanLabel: string
  surveyLink: string
}

export function buildInviteTemplate(args: TemplateArgs): EmailTemplate {
  const sender = args.senderName || 'HR'
  return {
    subject: `Uitnodiging: korte vragenlijst — ${args.organizationName}`,
    body: [
      'Beste collega,',
      '',
      `${args.organizationName} houdt een korte, anonieme vragenlijst (${args.scanLabel}). Je antwoorden worden alleen op groepsniveau gerapporteerd en zijn niet naar jou herleidbaar.`,
      '',
      `Vul de vragenlijst hier in (10–15 minuten): ${args.surveyLink}`,
      '',
      'Alvast bedankt voor je deelname.',
      '',
      'Met vriendelijke groet,',
      sender,
    ].join('\n'),
  }
}

export function buildReminderTemplate(args: TemplateArgs): EmailTemplate {
  const sender = args.senderName || 'HR'
  return {
    subject: `Herinnering: korte vragenlijst — ${args.organizationName}`,
    body: [
      'Beste collega,',
      '',
      'Een korte herinnering: heb je de anonieme vragenlijst al ingevuld? Het kost ongeveer 10–15 minuten en je antwoorden tellen alleen op groepsniveau mee.',
      '',
      `Vul de vragenlijst hier in: ${args.surveyLink}`,
      '',
      'Heb je hem al ingevuld? Dan kun je deze mail negeren — dank je wel!',
      '',
      'Met vriendelijke groet,',
      sender,
    ].join('\n'),
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd frontend && npx vitest run lib/self-send-comms.test.ts`
Expected: PASS (all assertions).

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/self-send-comms.ts frontend/lib/self-send-comms.test.ts
git commit -m "feat(self-send): pure comms library (config, reminders, response rate, templates)"
```

---

## Task 4: Backend pure helpers — self_send.py

**Files:**
- Create: `backend/self_send.py`
- Test: `tests/test_self_send.py`

- [ ] **Step 1: Write the failing test**

Create `tests/test_self_send.py`:

```python
from __future__ import annotations

from datetime import date

from backend.self_send import due_reminders, hash_dedup_key, resolve_reminder_date


def test_hash_dedup_key_is_stable_and_hex_sha256():
    h1 = hash_dedup_key("abc-123")
    h2 = hash_dedup_key("abc-123")
    assert h1 == h2
    assert len(h1) == 64
    assert hash_dedup_key("") == ""  # empty key never matches


def test_resolve_relative_and_absolute_reminders():
    end = date(2026, 6, 20)
    assert resolve_reminder_date(
        {"kind": "relative", "daysBeforeEnd": 3, "date": None}, end
    ) == date(2026, 6, 17)
    assert resolve_reminder_date(
        {"kind": "absolute", "daysBeforeEnd": None, "date": "2026-06-18"}, end
    ) == date(2026, 6, 18)


def test_due_reminders_skips_notified_and_future():
    end = date(2026, 6, 20)
    reminders = [
        {"id": "a", "kind": "relative", "daysBeforeEnd": 3, "date": None, "notifiedAt": None},
        {"id": "b", "kind": "absolute", "daysBeforeEnd": None, "date": "2026-06-25", "notifiedAt": None},
        {"id": "c", "kind": "relative", "daysBeforeEnd": 7, "date": None, "notifiedAt": "2026-06-13T08:00:00Z"},
    ]
    due = due_reminders(reminders, end, date(2026, 6, 17))
    assert [r["id"] for r in due] == ["a"]
```

- [ ] **Step 2: Run to verify it fails**

Run: `.venv/Scripts/python.exe -m pytest tests/test_self_send.py -v`
Expected: FAIL (`ModuleNotFoundError: backend.self_send`).

- [ ] **Step 3: Implement the module**

Create `backend/self_send.py`:

```python
"""Self-send mode — pure helpers (geen DB, geen I/O).

- dedup-key hashing voor single-fill bescherming in de open flow
- reminderdatum-resolutie (relatief aan einddatum of absoluut)
- selectie van vandaag-of-eerder-due reminders die nog niet zijn gemeld
"""

from __future__ import annotations

import hashlib
from datetime import date, timedelta
from typing import Any


def hash_dedup_key(raw_key: str) -> str:
    """SHA-256 hex van de client-UUID. Lege sleutel -> lege string (matcht nooit)."""
    if not raw_key:
        return ""
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def _parse_date(value: Any) -> date | None:
    if isinstance(value, date):
        return value
    if isinstance(value, str) and len(value) == 10:
        try:
            return date.fromisoformat(value)
        except ValueError:
            return None
    return None


def resolve_reminder_date(reminder: dict[str, Any], end_date: date | None) -> date | None:
    if reminder.get("kind") == "absolute":
        return _parse_date(reminder.get("date"))
    days = reminder.get("daysBeforeEnd")
    if end_date is None or not isinstance(days, int):
        return None
    return end_date - timedelta(days=days)


def due_reminders(
    reminders: list[dict[str, Any]],
    end_date: date | None,
    today: date,
) -> list[dict[str, Any]]:
    due: list[dict[str, Any]] = []
    for reminder in reminders:
        if reminder.get("notifiedAt"):
            continue
        resolved = resolve_reminder_date(reminder, end_date)
        if resolved is not None and resolved <= today:
            due.append(reminder)
    return due
```

- [ ] **Step 4: Run to verify it passes**

Run: `.venv/Scripts/python.exe -m pytest tests/test_self_send.py -v`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/self_send.py tests/test_self_send.py
git commit -m "feat(self-send): backend pure helpers for dedup hashing and reminder dates"
```

---

## Task 5: Open-flow single-fill dedup (server + intro template)

**Files:**
- Modify: `backend/main.py` (`open_survey_start` ~L1106-1161)
- Modify: `templates/survey-intro.html` (form ~L139-155)
- Test: `tests/test_self_send.py`

- [ ] **Step 1: Write the failing test**

Append to `tests/test_self_send.py`:

```python
from backend.models import Campaign, Organization, OrganizationSecret, Respondent, SurveyResponse


def _org_with_campaign(db_session):
    org = Organization(name="Acme BV", slug="acme-bv", contact_email="hr@acme.nl")
    db_session.add(org)
    db_session.flush()
    db_session.add(OrganizationSecret(org_id=org.id, api_key="key-1"))
    campaign = Campaign(
        organization_id=org.id, name="Exit Q2", scan_type="exit",
        delivery_mode="baseline", comms_mode="self_send", is_active=True,
    )
    db_session.add(campaign)
    db_session.commit()
    db_session.refresh(campaign)
    return org, campaign


def test_open_start_creates_one_respondent_then_blocks_completed_dedup_key(client, db_session):
    _, campaign = _org_with_campaign(db_session)
    token = campaign.public_survey_token

    # First start with dedup_key -> creates respondent, 303 to /survey/{token}
    r1 = client.post(
        f"/survey/open/{token}/start",
        data={"dedup_key": "device-uuid-1"},
        follow_redirects=False,
    )
    assert r1.status_code == 303
    respondent_token = r1.headers["location"].rsplit("/", 1)[-1]

    # Mark that respondent completed (simulates a finished survey)
    respondent = db_session.query(Respondent).filter(Respondent.token == respondent_token).one()
    respondent.completed = True
    db_session.commit()

    # Second start with the SAME dedup_key -> blocked (no new respondent), status page
    before = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    r2 = client.post(
        f"/survey/open/{token}/start",
        data={"dedup_key": "device-uuid-1"},
        follow_redirects=False,
    )
    after = db_session.query(Respondent).filter(Respondent.campaign_id == campaign.id).count()
    assert after == before  # no new respondent created
    assert r2.status_code == 409


def test_open_start_without_dedup_key_still_works(client, db_session):
    _, campaign = _org_with_campaign(db_session)
    r = client.post(f"/survey/open/{campaign.public_survey_token}/start", follow_redirects=False)
    assert r.status_code == 303
```

- [ ] **Step 2: Run to verify it fails**

Run: `.venv/Scripts/python.exe -m pytest tests/test_self_send.py -k open_start -v`
Expected: FAIL (current handler ignores `dedup_key`; second start returns 303 and creates a new respondent).

- [ ] **Step 3: Update `open_survey_start`**

In `backend/main.py`, replace the body of `open_survey_start` from the comment `# Maak anonieme respondent aan` through the `RedirectResponse` return (~L1145-1161) with:

```python
    # Single-fill bescherming: als een afgeronde respondent met deze dedup-hash
    # al bestaat voor deze campagne, geen nieuwe respondent aanmaken.
    from backend.self_send import hash_dedup_key

    form = await request.form()
    raw_dedup_key = (form.get("dedup_key") or "").strip()
    dedup_hash = hash_dedup_key(raw_dedup_key)

    if dedup_hash:
        already = (
            db.query(Respondent)
            .filter(
                Respondent.campaign_id == campaign.id,
                Respondent.dedup_key_hash == dedup_hash,
                Respondent.completed.is_(True),
            )
            .first()
        )
        if already:
            return _render_survey_status(
                request,
                status_code=409,
                title="Al ingevuld",
                heading="U heeft deze vragenlijst al ingevuld",
                message="Bedankt — uw eerdere antwoorden zijn al meegenomen. Een tweede invulling is niet nodig.",
                tone="info",
            )

    # Maak anonieme respondent aan — geen PII, geen metadata
    respondent = Respondent(
        campaign_id=campaign.id,
        email=None,
        department=None,
        role_level=None,
        exit_month=None,
        annual_salary_eur=None,  # AVG — nooit opslaan in open flow
        dedup_key_hash=dedup_hash or None,
        token_expires_at=datetime.now(timezone.utc) + timedelta(days=90),
    )
    db.add(respondent)
    db.commit()
    db.refresh(respondent)

    # 303 See Other → browser stuurt GET naar survey-URL
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"/survey/{respondent.token}", status_code=303)
```

Note: `request.form()` is async and `request` is already a parameter of this handler. Keep the existing `from datetime import timedelta` import at the top of the function.

- [ ] **Step 4: Run to verify it passes**

Run: `.venv/Scripts/python.exe -m pytest tests/test_self_send.py -k open_start -v`
Expected: PASS (2 tests).

- [ ] **Step 5: Add the localStorage guard + dedup_key field to the intro template**

In `templates/survey-intro.html`, replace the `<form>` block (L139-143) with:

```html
    <form method="POST" action="/survey/open/{{ public_survey_token }}/start" id="start-form">
      <input type="hidden" name="dedup_key" id="dedup-key" value="" />
      <button type="submit" class="start-btn" id="start-btn">
        Survey starten
      </button>
    </form>

    <div id="already-done" class="privacy-block" style="display:none;">
      <p><strong>U heeft deze vragenlijst al ingevuld.</strong> Bedankt — een tweede invulling is niet nodig.</p>
    </div>
```

Then replace the `<script>` block (L148-155) with:

```html
  <script>
    (function () {
      var token = "{{ public_survey_token }}";
      var doneKey = "loep_survey_done_" + token;
      var idKey = "loep_survey_uuid_" + token;
      var form = document.getElementById('start-form');
      var btn = document.getElementById('start-btn');

      // Reeds ingevuld op dit device? Verberg de startknop.
      if (localStorage.getItem(doneKey)) {
        form.style.display = 'none';
        document.getElementById('already-done').style.display = 'block';
        return;
      }

      // Genereer/hergebruik een device-UUID; pas vastleggen bij 'Start'.
      function getUuid() {
        var existing = localStorage.getItem(idKey);
        if (existing) return existing;
        var uuid = (crypto && crypto.randomUUID)
          ? crypto.randomUUID()
          : 'u-' + Date.now() + '-' + Math.random().toString(16).slice(2);
        localStorage.setItem(idKey, uuid);
        return uuid;
      }

      form.addEventListener('submit', function () {
        document.getElementById('dedup-key').value = getUuid();
        btn.disabled = true;
        btn.textContent = 'Wordt geladen…';
      });
    })();
  </script>
```

Note: the `complete.html` page should set `localStorage.setItem("loep_survey_done_<token>", "1")` so a returning device sees the done-state without a server round-trip. The completion page does not receive the public token today; the server-side 409 guard (Step 3) is the authoritative protection, and the `localStorage` done-marker is a best-effort UX layer. Leave `complete.html` unchanged in this task — the server guard already prevents duplicate completed submissions for the same device UUID.

- [ ] **Step 6: Manually verify the intro flow in preview**

Start the dev servers (per CLAUDE.md), open `http://localhost:3000/survey/open/<a-self-send-campaign-public-token>`, confirm the page renders and "Survey starten" submits. Then open the same URL again in the same browser after completing — confirm the 409 "Al ingevuld" status renders. Capture a screenshot as evidence.

- [ ] **Step 7: Commit**

```bash
git add backend/main.py templates/survey-intro.html tests/test_self_send.py
git commit -m "feat(self-send): server + client single-fill dedup on the open survey flow"
```

---

## Task 6: Reminder-day e-mail to the HR admin

**Files:**
- Create: `templates/emails/reminder_day.html`
- Modify: `backend/email.py` (add `send_reminder_day_notice`, after `send_hr_notification` ~L313)
- Test: `tests/test_self_send.py`

- [ ] **Step 1: Write the failing test**

Append to `tests/test_self_send.py`:

```python
def test_send_reminder_day_notice_renders_and_reports_missing_recipient():
    from backend.email import send_reminder_day_notice

    # No recipient -> ok=False, never raises
    result = send_reminder_day_notice(
        to_email="", campaign_name="Exit Q2", campaign_id="camp-1", reminder_label="3 dagen voor sluiting"
    )
    assert result.ok is False
    assert result.reason == "missing_recipient"
```

- [ ] **Step 2: Run to verify it fails**

Run: `.venv/Scripts/python.exe -m pytest tests/test_self_send.py -k reminder_day_notice -v`
Expected: FAIL (`ImportError: cannot import name 'send_reminder_day_notice'`).

- [ ] **Step 3: Create the e-mail template**

Create `templates/emails/reminder_day.html`:

```html
<div style="font-family:Arial,sans-serif;background:#f7f2ea;padding:32px;color:#132033;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e6ddd2;border-radius:24px;padding:32px;">
    <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8b8174;">
      Loep — reminderdag
    </p>
    <h1 style="margin:0 0 18px 0;font-size:28px;line-height:1.2;color:#132033;">
      Vandaag is de geplande reminderdag
    </h1>
    <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#42556b;">
      Voor <strong>{campaign_name}</strong> staat vandaag een herinnering gepland ({reminder_label}).
    </p>
    <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#42556b;">
      Log in op het dashboard om de herinneringstekst te kopiëren en opnieuw naar dezelfde BCC-lijst te sturen.
      Loep verstuurt zelf geen e-mails naar je medewerkers.
    </p>
    <a href="{dashboard_url}"
       style="display:inline-block;border-radius:999px;background:#132033;color:#ffffff;text-decoration:none;padding:14px 20px;font-weight:700;">
      Open dashboard
    </a>
  </div>
</div>
```

- [ ] **Step 4: Implement `send_reminder_day_notice`**

In `backend/email.py`, after `send_hr_notification` (ends ~L313), add:

```python
def send_reminder_day_notice(
    *,
    to_email: str,
    campaign_name: str,
    campaign_id: str,
    reminder_label: str,
) -> EmailSendResult:
    """Operationele nudge naar de HR-beheerder op de geplande reminderdag.

    Stuurt NOOIT naar respondenten — alleen naar de bekende beheerder.
    """
    dashboard_url = f"{_require_runtime_url(_FRONTEND_URL, 'FRONTEND_URL')}/campaigns/{campaign_id}/beheer"
    html = _render_email_template(
        "reminder_day.html",
        campaign_name=campaign_name,
        reminder_label=reminder_label,
        dashboard_url=dashboard_url,
    )
    return _send_result(
        to=to_email,
        subject=f"Reminderdag vandaag: {campaign_name}",
        html=html,
    )
```

- [ ] **Step 5: Run to verify it passes**

Run: `.venv/Scripts/python.exe -m pytest tests/test_self_send.py -k reminder_day_notice -v`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/email.py templates/emails/reminder_day.html tests/test_self_send.py
git commit -m "feat(self-send): reminder-day notice e-mail to the HR admin"
```

---

## Task 7: Internal reminder dispatch endpoint

**Files:**
- Modify: `backend/main.py` (add endpoint near the other `/api/internal/...` routes ~L1968)
- Test: `tests/test_self_send.py`

- [ ] **Step 1: Write the failing test**

Append to `tests/test_self_send.py`:

```python
from backend.models import CampaignDeliveryRecord


def test_reminder_dispatch_marks_due_reminders_and_calls_email(client, db_session, monkeypatch):
    org, campaign = _org_with_campaign(db_session)
    today = date.today().isoformat()
    db_session.add(
        CampaignDeliveryRecord(
            organization_id=org.id,
            campaign_id=campaign.id,
            lifecycle_stage="invites_live",
            launch_confirmed_at=datetime.now(timezone.utc),
            invited_count=34,
            self_send_config={"endDate": None},
            self_send_reminders=[
                {"id": "r1", "kind": "absolute", "daysBeforeEnd": None, "date": today, "notifiedAt": None}
            ],
        )
    )
    db_session.commit()

    sent: list[str] = []
    from backend.email import EmailSendResult

    monkeypatch.setattr(
        "backend.main.send_reminder_day_notice",
        lambda **kwargs: sent.append(kwargs["campaign_id"]) or EmailSendResult(ok=True),
    )

    resp = client.post("/api/internal/reminders/dispatch", headers={"x-admin-token": "test-admin-token"})
    assert resp.status_code == 200
    assert resp.json()["notified"] == 1
    assert sent == [campaign.id]

    # Idempotent: the reminder is now marked notified, second run sends nothing.
    sent.clear()
    resp2 = client.post("/api/internal/reminders/dispatch", headers={"x-admin-token": "test-admin-token"})
    assert resp2.json()["notified"] == 0
    assert sent == []
```

Note: the `client` fixture in `tests/conftest.py` does not set an admin token env var. Add the env setup at the top of this test via monkeypatch if `require_backend_admin_token` enforces it in non-production — check the function. In non-production it accepts any/empty token unless `BACKEND_ADMIN_TOKEN` is set. If the test fails on auth, add `monkeypatch.setenv("BACKEND_ADMIN_TOKEN", "test-admin-token")` **and** import-reload as the other internal-endpoint tests do; mirror whatever `tests/test_api_flows.py` does for `/api/internal/...`. If no such test exists, the simplest correct form is to read `require_backend_admin_token`'s behavior and pass the matching header.

- [ ] **Step 2: Verify `require_backend_admin_token` semantics**

Run: `.venv/Scripts/python.exe -c "import inspect, backend.main as m; print(inspect.getsource(m.require_backend_admin_token))"`
Read the output. Adjust the test header/env in Step 1 to satisfy it (e.g. set `BACKEND_ADMIN_TOKEN` via `monkeypatch.setenv` and pass the same value in `x-admin-token`). Then:

Run: `.venv/Scripts/python.exe -m pytest tests/test_self_send.py -k reminder_dispatch -v`
Expected: FAIL (404 — endpoint does not exist yet).

- [ ] **Step 3: Implement the dispatch endpoint**

In `backend/main.py`, near the other `/api/internal/...` endpoints (after `download_report_internal` ~L2006), add:

```python
@app.post("/api/internal/reminders/dispatch")
async def dispatch_self_send_reminders(
    x_admin_token: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Stuurt reminderdag-nudges naar HR-beheerders voor self-send campagnes.

    Idempotent: markeert elke gemelde reminder met notifiedAt zodat een tweede
    run niets opnieuw verstuurt. Bedoeld om periodiek door een externe cron/pinger
    te worden aangeroepen — er draait geen interne scheduler.
    """
    require_backend_admin_token(x_admin_token, is_production=_IS_PRODUCTION)

    from datetime import date as _date

    from sqlalchemy.orm.attributes import flag_modified

    from backend.self_send import due_reminders

    today = _date.today()
    notified = 0

    records = (
        db.query(CampaignDeliveryRecord)
        .filter(CampaignDeliveryRecord.launch_confirmed_at.isnot(None))
        .all()
    )

    for record in records:
        campaign = record.campaign
        if campaign is None or campaign.comms_mode != "self_send" or not campaign.is_active:
            continue

        config = record.self_send_config or {}
        end_value = config.get("endDate")
        end_date = _date.fromisoformat(end_value) if isinstance(end_value, str) and len(end_value) == 10 else None
        reminders = record.self_send_reminders or []

        due = due_reminders(reminders, end_date, today)
        if not due:
            continue

        org = record.organization
        to_email = org.contact_email if org else None
        if not to_email:
            continue

        for reminder in due:
            result = send_reminder_day_notice(
                to_email=to_email,
                campaign_name=campaign.name,
                campaign_id=campaign.id,
                reminder_label=str(reminder.get("label") or "geplande herinnering"),
            )
            if result.ok:
                reminder["notifiedAt"] = datetime.now(timezone.utc).isoformat()
                notified += 1

        flag_modified(record, "self_send_reminders")

    db.commit()
    return {"notified": notified}
```

Add the import near the other email imports at the top of `backend/main.py`:

```python
from backend.email import send_reminder_day_notice
```

(Check the existing import line for `backend.email` — `send_hr_notification` is already imported there; append `send_reminder_day_notice` to that import.)

- [ ] **Step 4: Run to verify it passes**

Run: `.venv/Scripts/python.exe -m pytest tests/test_self_send.py -k reminder_dispatch -v`
Expected: PASS (1 test, both dispatch runs asserted).

- [ ] **Step 5: Run the full self-send + api-flow suite (no regressions)**

Run: `.venv/Scripts/python.exe -m pytest tests/test_self_send.py tests/test_api_flows.py tests/test_delivery_schema_parity.py -v`
Expected: PASS.

- [ ] **Step 6: Document the cron trigger**

Add a line to `CLAUDE.md` under Verisight "Beslissingslog":
```
- [2026-06-13] Self-send reminderdag-mail: POST /api/internal/reminders/dispatch (x-admin-token) — idempotent; aanroepen via externe cron (geen interne scheduler). Dashboard-banner is de altijd-werkende fallback.
```

- [ ] **Step 7: Commit**

```bash
git add backend/main.py CLAUDE.md tests/test_self_send.py
git commit -m "feat(self-send): idempotent internal reminder-dispatch endpoint"
```

---

## Task 8: Next API route — self-send-config PATCH

**Files:**
- Create: `frontend/app/api/campaigns/[id]/self-send-config/route.ts`

This mirrors the auth/ownership pattern of [launch-config/route.ts](../../../frontend/app/api/campaigns/[id]/launch-config/route.ts) but writes the self-send columns and validates `invited_count`. It does not touch `participant_comms_config`/`reminder_config`.

- [ ] **Step 1: Implement the route**

Create `frontend/app/api/campaigns/[id]/self-send-config/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  MIN_INVITED_COUNT,
  normalizeSelfSendConfig,
  normalizeSelfSendReminders,
  validateInvitedCount,
  type SelfSendConfig,
  type SelfSendReminder,
} from '@/lib/self-send-comms'

interface Context {
  params: Promise<{ id: string }>
}

type Body = {
  invited_count?: number | null
  self_send_config?: Partial<SelfSendConfig> | null
  self_send_reminders?: SelfSendReminder[] | null
  confirm_launch?: boolean
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('organization_id, comms_mode')
    .eq('id', id)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ detail: 'Campaign niet gevonden of niet toegankelijk.' }, { status: 404 })
  }
  if (campaign.comms_mode !== 'self_send') {
    return NextResponse.json({ detail: 'Deze campaign gebruikt geen self-send modus.' }, { status: 400 })
  }

  const [{ data: profile }, { data: membership }, { data: deliveryRecord }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', campaign.organization_id)
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('campaign_delivery_records')
      .select('id, invited_count, self_send_config, self_send_reminders, launch_confirmed_at')
      .eq('campaign_id', id)
      .maybeSingle(),
  ])

  const isOrgManager = membership?.role === 'owner' || membership?.role === 'member'
  if (profile?.is_verisight_admin !== true && !isOrgManager) {
    return NextResponse.json({ detail: 'Geen rechten om deze campaign te beheren.' }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as Body | null
  if (!body) {
    return NextResponse.json({ detail: 'Ongeldige request body.' }, { status: 400 })
  }

  const nextInvitedCount =
    'invited_count' in body ? body.invited_count ?? null : (deliveryRecord?.invited_count as number | null) ?? null
  const nextConfig =
    'self_send_config' in body
      ? normalizeSelfSendConfig(body.self_send_config)
      : normalizeSelfSendConfig(deliveryRecord?.self_send_config)
  const nextReminders =
    'self_send_reminders' in body
      ? normalizeSelfSendReminders(body.self_send_reminders)
      : normalizeSelfSendReminders(deliveryRecord?.self_send_reminders)

  // Confirming launch requires a valid invited count and a sender name.
  if (body.confirm_launch === true) {
    const errors = [
      ...validateInvitedCount(nextInvitedCount),
      ...(nextConfig.senderName.length === 0 ? ['Afzendernaam ontbreekt nog.'] : []),
    ]
    if (errors.length > 0) {
      return NextResponse.json({ detail: errors.join(' ') }, { status: 400 })
    }
  } else if (nextInvitedCount !== null && validateInvitedCount(nextInvitedCount).length > 0) {
    return NextResponse.json(
      { detail: `Aantal uitgenodigde deelnemers moet minimaal ${MIN_INVITED_COUNT} zijn.` },
      { status: 400 },
    )
  }

  const nowIso = new Date().toISOString()
  let nextLaunchConfirmedAt = (deliveryRecord?.launch_confirmed_at as string | null) ?? null
  if (body.confirm_launch === true) nextLaunchConfirmedAt = nowIso
  if (body.confirm_launch === false) nextLaunchConfirmedAt = null

  const writePayload = {
    invited_count: nextInvitedCount,
    self_send_config: nextConfig,
    self_send_reminders: nextReminders,
    launch_confirmed_at: nextLaunchConfirmedAt,
    updated_at: nowIso,
  }

  const { error } = deliveryRecord
    ? await supabase.from('campaign_delivery_records').update(writePayload).eq('id', deliveryRecord.id)
    : await supabase.from('campaign_delivery_records').insert({
        organization_id: campaign.organization_id,
        campaign_id: id,
        lifecycle_stage: 'setup_in_progress',
        exception_status: 'none',
        ...writePayload,
      })

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 })
  }

  return NextResponse.json({
    invited_count: nextInvitedCount,
    self_send_config: nextConfig,
    self_send_reminders: nextReminders,
    launch_confirmed_at: nextLaunchConfirmedAt,
    message: body.confirm_launch === true ? 'Campagne live gezet.' : 'Instellingen opgeslagen.',
  })
}
```

- [ ] **Step 2: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Lint the new route**

Run: `cd frontend && npx eslint app/api/campaigns/[id]/self-send-config/route.ts`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/api/campaigns/[id]/self-send-config/route.ts"
git commit -m "feat(self-send): PATCH /api/campaigns/[id]/self-send-config (invited count, config, two-step launch)"
```

---

## Task 9: beheer-data — expose a self-send block

**Files:**
- Modify: `frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts`
- Test: `frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.test.ts` (extend existing if present, else create)

Add a pure helper `buildSelfSendBlock` and unit-test it, then wire it into `fetchRouteBeheerData`. This keeps the testable logic out of the async DB function.

- [ ] **Step 1: Write the failing test**

Create (or append to) `frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import { buildSelfSendBlock } from './beheer-data'

describe('buildSelfSendBlock', () => {
  it('returns inactive block for managed campaigns', () => {
    const block = buildSelfSendBlock({
      commsMode: 'managed',
      invitedCount: null,
      totalCompleted: 0,
      config: null,
      reminders: null,
      launchConfirmedAt: null,
      today: '2026-06-17',
    })
    expect(block.isSelfSend).toBe(false)
    expect(block.responseRatePct).toBeNull()
  })

  it('computes response rate against the manual invited count', () => {
    const block = buildSelfSendBlock({
      commsMode: 'self_send',
      invitedCount: 34,
      totalCompleted: 17,
      config: { endDate: '2026-06-20', senderName: 'HR' },
      reminders: [],
      launchConfirmedAt: '2026-06-15T10:00:00Z',
      today: '2026-06-17',
    })
    expect(block.isSelfSend).toBe(true)
    expect(block.responseRatePct).toBe(50)
    expect(block.invitedCount).toBe(34)
  })

  it('surfaces a reminder that is due today and not yet notified', () => {
    const block = buildSelfSendBlock({
      commsMode: 'self_send',
      invitedCount: 10,
      totalCompleted: 1,
      config: { endDate: '2026-06-20' },
      reminders: [{ id: 'r1', kind: 'relative', daysBeforeEnd: 3, date: null, notifiedAt: null }],
      launchConfirmedAt: '2026-06-10T10:00:00Z',
      today: '2026-06-17',
    })
    expect(block.dueReminderToday?.id).toBe('r1')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd frontend && npx vitest run "app/(dashboard)/campaigns/[id]/beheer/beheer-data.test.ts"`
Expected: FAIL (`buildSelfSendBlock` is not exported).

- [ ] **Step 3: Implement `buildSelfSendBlock` and the type**

In `frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts`, add imports near the top (after the existing imports):

```typescript
import type { CommsMode } from '@/lib/types'
import {
  computeResponseRatePct,
  getDueReminders,
  normalizeSelfSendConfig,
  normalizeSelfSendReminders,
  type SelfSendConfig,
  type SelfSendReminder,
} from '@/lib/self-send-comms'
```

Add the exported type and helper (place near the other exported helpers, e.g. after `formatRoutePeriodLabel`):

```typescript
export interface SelfSendBlock {
  isSelfSend: boolean
  invitedCount: number | null
  responseRatePct: number | null
  config: SelfSendConfig
  reminders: SelfSendReminder[]
  launchConfirmedAt: string | null
  dueReminderToday: SelfSendReminder | null
}

export function buildSelfSendBlock(args: {
  commsMode: CommsMode
  invitedCount: number | null
  totalCompleted: number
  config: unknown
  reminders: unknown
  launchConfirmedAt: string | null
  today: string
}): SelfSendBlock {
  const config = normalizeSelfSendConfig(args.config)
  const reminders = normalizeSelfSendReminders(args.reminders)
  const isSelfSend = args.commsMode === 'self_send'
  const due = isSelfSend ? getDueReminders(reminders, config.endDate, args.today) : []

  return {
    isSelfSend,
    invitedCount: args.invitedCount,
    responseRatePct: isSelfSend ? computeResponseRatePct(args.totalCompleted, args.invitedCount) : null,
    config,
    reminders,
    launchConfirmedAt: args.launchConfirmedAt,
    dueReminderToday: due[0] ?? null,
  }
}
```

Add `selfSend: SelfSendBlock` to the `RouteBeheerPageData` interface (after the `selfServe` block, ~L133):

```typescript
  selfSend: SelfSendBlock
```

In `fetchRouteBeheerData`, extend the `campaigns` meta select (~L708-712) to include `comms_mode`:

```typescript
    supabase
      .from('campaigns')
      .select('delivery_mode, created_at, enabled_modules, comms_mode')
      .eq('id', campaignId)
      .maybeSingle(),
```

Update the `campaign` cast (~L767-770) to include `comms_mode`:

```typescript
  const campaign = (campaignMeta ?? null) as Pick<
    Campaign,
    'delivery_mode' | 'created_at' | 'enabled_modules' | 'comms_mode'
  > | null
```

Build the block before the `return` (near where `selfServe` is assembled), using the already-fetched `deliveryRecord` and `stats`:

```typescript
  const selfSend = buildSelfSendBlock({
    commsMode: campaign?.comms_mode ?? 'managed',
    invitedCount: (deliveryRecord?.invited_count as number | null) ?? null,
    totalCompleted: stats.total_completed,
    config: deliveryRecord?.self_send_config ?? null,
    reminders: deliveryRecord?.self_send_reminders ?? null,
    launchConfirmedAt: deliveryRecord?.launch_confirmed_at ?? null,
    today: new Date().toISOString().slice(0, 10),
  })
```

Add `selfSend,` to the returned object (alongside `selfServe`).

Note: `CampaignDeliveryRecord` (the TS type in `@/lib/ops-delivery`) may not declare `invited_count`/`self_send_config`/`self_send_reminders`. The `deliveryRecord` here is read as that type — add these optional fields to that interface in `frontend/lib/ops-delivery.ts` (find `interface CampaignDeliveryRecord` and add `invited_count?: number | null; self_send_config?: unknown; self_send_reminders?: unknown`). If the cast uses `select('*')` (it does, ~L723), the raw row already carries the columns; the type addition just satisfies `tsc`.

- [ ] **Step 4: Run to verify it passes**

Run: `cd frontend && npx vitest run "app/(dashboard)/campaigns/[id]/beheer/beheer-data.test.ts"`
Expected: PASS (3 tests).

- [ ] **Step 5: Typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add "frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts" "frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.test.ts" frontend/lib/ops-delivery.ts
git commit -m "feat(self-send): expose selfSend block (response rate, due reminder) from beheer-data"
```

---

## Task 10: SelfSendSetupPanel wizard + mount in beheer

**Files:**
- Create: `frontend/components/dashboard/self-send-setup-panel.tsx`
- Modify: `frontend/app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.tsx`

**Design note for the implementer:** The spec describes a literal 5-step wizard (Stap 0–4). The live app uses a phase-based beheer surface, not standalone wizard routes. This panel honours the spec's content as an in-place stepper mounted in the existing `live`/`communicatie` phase detail — the lowest-risk way to deliver the wizard UX without forking the navigation model. It renders **instead of** `GuidedSelfServePanel` when `data.selfSend.isSelfSend` is true.

- [ ] **Step 1: Implement the panel**

Create `frontend/components/dashboard/self-send-setup-panel.tsx`:

```tsx
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SCAN_TYPE_LABELS, type ScanType } from '@/lib/types'
import {
  MIN_INVITED_COUNT,
  buildInviteTemplate,
  buildReminderTemplate,
  buildSurveyLink,
  computeResponseRatePct,
  normalizeSelfSendConfig,
  normalizeSelfSendReminders,
  validateInvitedCount,
  type SelfSendConfig,
  type SelfSendReminder,
} from '@/lib/self-send-comms'

interface Props {
  campaignId: string
  scanType: ScanType
  organizationName: string
  publicSurveyToken: string
  frontendBaseUrl: string
  invitedCount: number | null
  config: SelfSendConfig
  reminders: SelfSendReminder[]
  launchConfirmedAt: string | null
  totalCompleted: number
  isActive: boolean
}

const STEP_LABELS = ['Scan', 'Deelnemers', 'E-mailinstellingen', 'Voorbeeld & kopieer', 'Bevestiging'] as const

async function copy(text: string, onDone: () => void) {
  try {
    await navigator.clipboard.writeText(text)
    onDone()
  } catch {
    /* clipboard unavailable — no-op */
  }
}

export function SelfSendSetupPanel({
  campaignId,
  scanType,
  organizationName,
  publicSurveyToken,
  frontendBaseUrl,
  invitedCount: initialInvited,
  config: initialConfig,
  reminders: initialReminders,
  launchConfirmedAt,
  totalCompleted,
  isActive,
}: Props) {
  const router = useRouter()
  const [step, setStep] = useState(launchConfirmedAt ? 4 : 0)
  const [invitedCount, setInvitedCount] = useState<number | ''>(initialInvited ?? '')
  const [bccPaste, setBccPaste] = useState('') // browser-only; never sent to the server
  const [config, setConfig] = useState<SelfSendConfig>(normalizeSelfSendConfig(initialConfig))
  const [reminders, setReminders] = useState<SelfSendReminder[]>(normalizeSelfSendReminders(initialReminders))
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const scanLabel = SCAN_TYPE_LABELS[scanType]
  const surveyLink = useMemo(
    () => buildSurveyLink(frontendBaseUrl, publicSurveyToken),
    [frontendBaseUrl, publicSurveyToken],
  )
  const inviteTpl = useMemo(
    () => buildInviteTemplate({ senderName: config.senderName, organizationName, scanLabel, surveyLink }),
    [config.senderName, organizationName, scanLabel, surveyLink],
  )
  const reminderTpl = useMemo(
    () => buildReminderTemplate({ senderName: config.senderName, organizationName, scanLabel, surveyLink }),
    [config.senderName, organizationName, scanLabel, surveyLink],
  )
  const inviteSubject = config.inviteSubject || inviteTpl.subject
  const inviteBody = config.inviteBody || inviteTpl.body
  const reminderSubject = config.reminderSubject || reminderTpl.subject
  const reminderBody = config.reminderBody || reminderTpl.body
  const responseRate = computeResponseRatePct(totalCompleted, typeof invitedCount === 'number' ? invitedCount : null)

  function flash(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  function addReminder() {
    setReminders((prev) => [
      ...prev,
      { id: `r-${Date.now()}`, kind: 'relative', daysBeforeEnd: 3, date: null, notifiedAt: null },
    ])
  }

  async function save(confirmLaunch: boolean) {
    setError(null)
    setBusy(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/self-send-config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invited_count: typeof invitedCount === 'number' ? invitedCount : null,
          self_send_config: {
            ...config,
            inviteSubject,
            inviteBody,
            reminderSubject,
            reminderBody,
          },
          self_send_reminders: reminders,
          confirm_launch: confirmLaunch,
        }),
      })
      const payload = (await response.json().catch(() => ({}))) as { detail?: string; message?: string }
      if (!response.ok) {
        setError(payload.detail ?? 'Opslaan mislukt.')
        return
      }
      flash(payload.message ?? 'Opgeslagen.')
      router.refresh()
    } catch {
      setError('Verbindingsfout tijdens opslaan.')
    } finally {
      setBusy(false)
    }
  }

  const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100'

  return (
    <div className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-5">
      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        {STEP_LABELS.map((label, index) => (
          <span key={label} className="flex items-center gap-1.5">
            {index > 0 ? <span className="text-slate-400">›</span> : null}
            <button
              type="button"
              onClick={() => setStep(index)}
              className={index === step ? 'font-semibold text-slate-900' : 'text-slate-500 hover:text-slate-700'}
            >
              {label}
            </button>
          </span>
        ))}
      </div>

      {/* Stap 0 — Scan context */}
      {step === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Afgesproken scan voor deze organisatie:</p>
          <div className="rounded-2xl border border-blue-600 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">{scanLabel}</p>
            <p className="mt-1 text-xs text-blue-700">Actief voor uw organisatie.</p>
          </div>
        </div>
      ) : null}

      {/* Stap 1 — Deelnemers */}
      {step === 1 ? (
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Aantal uitgenodigde deelnemers</span>
            <input
              type="number"
              min={MIN_INVITED_COUNT}
              value={invitedCount}
              onChange={(e) => setInvitedCount(e.target.value === '' ? '' : Number(e.target.value))}
              className={fieldClass}
              placeholder="bijv. 34"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Minimaal {MIN_INVITED_COUNT}. Dit is de noemer voor het responspercentage.{' '}
              {typeof invitedCount === 'number' ? `${invitedCount} deelnemers` : ''}
            </span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              BCC-hulp <span className="font-normal text-slate-400">(blijft in je browser, wordt nooit opgeslagen)</span>
            </span>
            <textarea
              rows={3}
              value={bccPaste}
              onChange={(e) => setBccPaste(e.target.value)}
              className={fieldClass}
              placeholder="Plak hier e-mailadressen om makkelijk naar BCC te kopiëren"
            />
            <button
              type="button"
              onClick={() => copy(bccPaste, () => flash('BCC-lijst gekopieerd.'))}
              className="mt-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300"
            >
              Kopieer BCC-lijst
            </button>
          </label>
        </div>
      ) : null}

      {/* Stap 2 — E-mailinstellingen */}
      {step === 2 ? (
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Afzendernaam (zoals medewerkers die zien)</span>
            <input
              type="text"
              maxLength={80}
              value={config.senderName}
              onChange={(e) => setConfig((c) => ({ ...c, senderName: e.target.value }))}
              className={fieldClass}
              placeholder="bijv. Sarah de Vries, HR"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Einddatum campagne</span>
            <input
              type="date"
              value={config.endDate ?? ''}
              onChange={(e) => setConfig((c) => ({ ...c, endDate: e.target.value || null }))}
              className={fieldClass}
            />
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Reminders</span>
              <button
                type="button"
                onClick={addReminder}
                disabled={reminders.length >= 2}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300 disabled:opacity-50"
              >
                + Reminder
              </button>
            </div>
            <p className="text-xs text-slate-500">Aanbevolen: 1 reminder, 3 dagen voor sluiting.</p>
            {reminders.map((reminder, index) => (
              <div key={reminder.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-2">
                <select
                  value={reminder.kind}
                  onChange={(e) =>
                    setReminders((prev) =>
                      prev.map((r, i) =>
                        i === index ? { ...r, kind: e.target.value as SelfSendReminder['kind'] } : r,
                      ),
                    )
                  }
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                >
                  <option value="relative">Dagen voor einddatum</option>
                  <option value="absolute">Vaste datum</option>
                </select>
                {reminder.kind === 'relative' ? (
                  <input
                    type="number"
                    min={1}
                    value={reminder.daysBeforeEnd ?? 3}
                    onChange={(e) =>
                      setReminders((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, daysBeforeEnd: Number(e.target.value) } : r)),
                      )
                    }
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                  />
                ) : (
                  <input
                    type="date"
                    value={reminder.date ?? ''}
                    onChange={(e) =>
                      setReminders((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, date: e.target.value || null } : r)),
                      )
                    }
                    className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setReminders((prev) => prev.filter((_, i) => i !== index))}
                  className="ml-auto text-xs font-semibold text-red-600"
                >
                  Verwijder
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Stap 3 — Voorbeeld & kopieer */}
      {step === 3 ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Plak in Outlook of Gmail · Voeg deelnemers toe als BCC · Verstuur
          </div>
          {[
            { title: 'Uitnodiging', subject: inviteSubject, body: inviteBody },
            { title: 'Reminder', subject: reminderSubject, body: reminderBody },
          ].map((tab) => (
            <div key={tab.title} className="space-y-2 rounded-2xl border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-900">{tab.title}</p>
              <input readOnly value={tab.subject} className={fieldClass} />
              <textarea readOnly rows={8} value={tab.body} className={`${fieldClass} font-mono text-xs`} />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copy(tab.subject, () => flash('Onderwerp gekopieerd.'))}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300"
                >
                  Kopieer onderwerp
                </button>
                <button
                  type="button"
                  onClick={() => copy(tab.body, () => flash('Tekst gekopieerd.'))}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300"
                >
                  Kopieer tekst
                </button>
                <button
                  type="button"
                  onClick={() => copy(surveyLink, () => flash('Link gekopieerd.'))}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300"
                >
                  Kopieer link
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Stap 4 — Bevestiging & lancering */}
      {step === 4 ? (
        <div className="space-y-4">
          {launchConfirmedAt ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">Campagne is live.</p>
              <p className="mt-1">
                {totalCompleted} ingevuld{typeof invitedCount === 'number' ? ` van ${invitedCount}` : ''}
                {responseRate !== null ? ` · ${responseRate}% respons` : ''}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => void save(false)}
                disabled={busy}
                className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 disabled:opacity-50"
              >
                {busy ? 'Bezig…' : 'Campagne klaarzetten (opslaan)'}
              </button>
              <button
                type="button"
                onClick={() => void save(true)}
                disabled={busy || !isActive}
                className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? 'Bezig…' : 'Ik heb de uitnodiging verstuurd — zet live'}
              </button>
              <p className="text-xs text-slate-500">
                Responsmeting start pas wanneer je bevestigt dat de uitnodiging daadwerkelijk is verstuurd.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {toast ? (
        <div className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white">{toast}</div>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 2: Mount it in the beheer phase detail**

In `frontend/app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.tsx`:

Add the import at the top:

```tsx
import { SelfSendSetupPanel } from '@/components/dashboard/self-send-setup-panel'
```

The panel needs `publicSurveyToken`, `frontendBaseUrl`, and `organizationName`. `RouteBeheerPageData` already has `organizationName`. Add `publicSurveyToken` to the data: in `beheer-data.ts`, extend the `campaigns` meta select to also fetch `public_survey_token` and add `publicSurveyToken: string | null` to `RouteBeheerPageData` and the return. (Mirror the `comms_mode` change from Task 9: add `public_survey_token` to the select string, the `Pick<Campaign, ...>` cast — note `public_survey_token` is not yet on the `Campaign` TS type, so add it to `interface Campaign` in `frontend/lib/types.ts` as `public_survey_token: string`, and to the SQLAlchemy-mirrored fields it already exists.) Set `frontendBaseUrl` from `process.env.NEXT_PUBLIC_SITE_URL ?? ''` resolved in the panel's parent; pass `''` fallback so `buildSurveyLink` yields a relative `/survey/open/...` path that still works behind the proxy.

In `RouteBeheerPhaseDetailContent`, wherever `<GuidedSelfServePanel ... />` is rendered (the `live` branch ~L234 and the default branch ~L294), wrap the existing panel so self-send campaigns get the new panel instead. Replace each `{showSelfServeWorkspace ? (<GuidedSelfServePanel .../>) : null}` with:

```tsx
          {showSelfServeWorkspace ? (
            data.selfSend.isSelfSend ? (
              <SelfSendSetupPanel
                campaignId={data.campaignId}
                scanType={data.scanType}
                organizationName={data.organizationName ?? 'je organisatie'}
                publicSurveyToken={data.publicSurveyToken ?? ''}
                frontendBaseUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ''}
                invitedCount={data.selfSend.invitedCount}
                config={data.selfSend.config}
                reminders={data.selfSend.reminders}
                launchConfirmedAt={data.selfSend.launchConfirmedAt}
                totalCompleted={data.totalCompleted}
                isActive={data.isActive}
              />
            ) : (
              <GuidedSelfServePanel
                /* ...unchanged existing props... */
              />
            )
          ) : null}
```

Keep the existing `GuidedSelfServePanel` prop list exactly as-is in the `else` branch (copy it from the current code; do not alter it).

- [ ] **Step 3: Typecheck + lint**

Run: `cd frontend && npx tsc --noEmit && npx eslint components/dashboard/self-send-setup-panel.tsx "app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.tsx"`
Expected: PASS / no errors.

- [ ] **Step 4: Preview-verify the wizard**

Create (or reuse) a `self_send` campaign, open `/campaigns/<id>/beheer`, select the `live`/`communicatie` phase, and confirm the 5-step wizard renders, the invited-count + sender + reminder inputs work, the copy buttons exist, and "Ik heb de uitnodiging verstuurd — zet live" flips the campaign to live (response line appears). Capture before/after screenshots.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/dashboard/self-send-setup-panel.tsx "frontend/app/(dashboard)/campaigns/[id]/beheer/route-beheer-phase-sections.tsx" "frontend/app/(dashboard)/campaigns/[id]/beheer/beheer-data.ts" frontend/lib/types.ts
git commit -m "feat(self-send): 5-step setup wizard mounted in beheer for self-send campaigns"
```

---

## Task 11: Comms-mode choice on campaign create

**Files:**
- Modify: `frontend/components/dashboard/new-campaign-form.tsx`

- [ ] **Step 1: Add comms-mode state and UI**

In `frontend/components/dashboard/new-campaign-form.tsx`:

Add to imports:

```tsx
import type { CommsMode } from '@/lib/types'
```

Add state (after `deliveryMode`, ~L28):

```tsx
  const [commsMode, setCommsMode] = useState<CommsMode>('managed')
```

Include it in the insert (~L56-62):

```tsx
    const { error: insertError } = await supabase.from('campaigns').insert({
      organization_id: orgId,
      name,
      scan_type: scanType,
      delivery_mode: deliveryMode,
      comms_mode: commsMode,
      enabled_modules: modules.length > 0 ? modules : null,
    })
```

Add a mode selector block (place after the "Kies route" grid, before the modules section ~L162):

```tsx
      <div className="border-t border-slate-200 pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">E-mail & deelnemers</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {([
          { value: 'managed', title: 'Platform verstuurt', body: 'Loep stuurt uitnodigingen via geüploade lijst.' },
          { value: 'self_send', title: 'HR verstuurt zelf', body: 'Kopieer-sjablonen, één campagnelink, geen e-mailopslag.' },
        ] as const).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setCommsMode(option.value)}
            className={`rounded-[22px] border p-4 text-left transition-colors ${
              commsMode === option.value ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
            }`}
          >
            <p className="text-sm font-semibold">{option.title}</p>
            <p className={`mt-1 text-sm ${commsMode === option.value ? 'text-blue-100' : 'text-slate-500'}`}>{option.body}</p>
          </button>
        ))}
      </div>
```

Reset it on success (in the success branch ~L70-76, alongside `setDeliveryMode('baseline')`):

```tsx
    setCommsMode('managed')
```

- [ ] **Step 2: Typecheck + lint**

Run: `cd frontend && npx tsc --noEmit && npx eslint components/dashboard/new-campaign-form.tsx`
Expected: PASS / no errors.

- [ ] **Step 3: Preview-verify create**

On the beheer/new-campaign surface, create a campaign with "HR verstuurt zelf" selected, then open its beheer and confirm the SelfSendSetupPanel (not GuidedSelfServePanel) appears. Screenshot as evidence.

- [ ] **Step 4: Commit**

```bash
git add frontend/components/dashboard/new-campaign-form.tsx
git commit -m "feat(self-send): choose comms mode when creating a campaign"
```

---

## Task 12: Reminder-day dashboard banner

**Files:**
- Modify: `frontend/app/(dashboard)/campaigns/[id]/beheer/page.tsx`

The banner is the always-works fallback for the reminder-day nudge (it does not depend on the cron). It uses `data.selfSend.dueReminderToday`.

- [ ] **Step 1: Locate where `RouteBeheerPageData` is rendered**

Run: `cd frontend && npx grep -n "RouteBeheerNowDoingRow\|nowDoing\|fetchRouteBeheerData" "app/(dashboard)/campaigns/[id]/beheer/page.tsx"` (or open the file). Identify the top of the rendered content (near the "Nu doen" row).

- [ ] **Step 2: Add the banner**

In `frontend/app/(dashboard)/campaigns/[id]/beheer/page.tsx`, just above the existing "Nu doen" row / page header, add:

```tsx
        {data.selfSend.isSelfSend && data.selfSend.dueReminderToday ? (
          <div className="border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-800">Reminderdag</p>
            <p className="mt-2 text-sm text-amber-900">
              Vandaag staat een herinnering gepland. Open de stap “Voorbeeld &amp; kopieer” om de reminder-tekst te
              kopiëren en opnieuw naar dezelfde BCC-lijst te sturen.
            </p>
          </div>
        ) : null}
```

(Match the surrounding container/spacing — if the page wraps content in a `space-y-*` column, place this as the first child so it sits above the rest.)

- [ ] **Step 3: Typecheck + lint**

Run: `cd frontend && npx tsc --noEmit && npx eslint "app/(dashboard)/campaigns/[id]/beheer/page.tsx"`
Expected: PASS / no errors.

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/(dashboard)/campaigns/[id]/beheer/page.tsx"
git commit -m "feat(self-send): reminder-day banner on the campaign beheer page"
```

---

## Task 13: Full verification + self-review

**Files:** none (verification only)

- [ ] **Step 1: Run the full backend suite**

Run: `.venv/Scripts/python.exe -m pytest tests/test_self_send.py tests/test_api_flows.py tests/test_delivery_schema_parity.py tests/test_runtime_health_contract.py -v`
Expected: PASS. If any unrelated test imports `Campaign` and constructs it positionally without `comms_mode`, it still passes (the column has a default). Investigate any failure before proceeding.

- [ ] **Step 2: Run the full frontend unit suite**

Run: `cd frontend && npx vitest run`
Expected: PASS (including `self-send-comms.test.ts` and `beheer-data.test.ts`).

- [ ] **Step 3: Typecheck the whole frontend**

Run: `cd frontend && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: End-to-end preview walkthrough**

With both dev servers running: create a `self_send` ExitScan campaign → in beheer, walk Stap 0→4, set invited count 34 + sender + 1 reminder (3 days before end) → "Campagne klaarzetten" → "Ik heb de uitnodiging verstuurd" → confirm live + response line. Open the public survey link in a fresh browser, complete it, reopen → confirm "U heeft deze vragenlijst al ingevuld". Confirm the beheer response % reflects `completed / 34`. Capture screenshots.

- [ ] **Step 5: Trigger the reminder dispatch once**

With a reminder dated today on a live self-send campaign, call the dispatch endpoint and confirm it reports a notification and is idempotent:

```bash
curl -s -X POST http://localhost:8000/api/internal/reminders/dispatch -H "x-admin-token: <local-admin-token>"
```
Expected: `{"notified": 1}` then `{"notified": 0}` on a second call. (Locally, `send_reminder_day_notice` logs instead of sending if `RESEND_API_KEY` is unset — that is the disclosed dev fallback.)

- [ ] **Step 6: Self-review against the spec**

Re-read [the spec](../specs/2026-06-12-email-participant-management-design.md) section by section and confirm each maps to a task:
  - Sjabloonmodel / single campaign link → Tasks 3, 5, 10 (`public_survey_token`, copy templates, no e-mail send)
  - Wizard Stap 0–4 → Task 10 (stepper); invited count + BCC-help (browser-only) → Task 10 Stap 1
  - E-mailinstellingen (sender, end date, 0–2 reminders) → Tasks 3, 8, 10
  - Preview & kopieer (3 copy buttons, instruction bar) → Task 10 Stap 3
  - Two-step launch (klaarzetten → live, `launch_confirmed_at`) → Tasks 8, 10
  - Reminder-flow (HR-only e-mail + dashboard notificatie) → Tasks 6, 7, 12
  - Responstracking (manual denominator) → Tasks 1, 8, 9
  - Eénmalige invulling (localStorage + server dedup, UUID on Start) → Task 5
  - "Wat het systeem NIET doet" (no respondent e-mails, no per-person links) → guaranteed by coexistence design (managed flow untouched; self-send sends nothing)

  Confirm no placeholders remain and that type/field names match across tasks: `comms_mode` ('managed'|'self_send'), `invited_count`, `self_send_config`, `self_send_reminders`, `dedup_key_hash`, `SelfSendConfig`, `SelfSendReminder`, `buildSelfSendBlock`, `send_reminder_day_notice`, `/api/campaigns/[id]/self-send-config`, `/api/internal/reminders/dispatch`.

- [ ] **Step 7: Finish the branch**

Use superpowers:finishing-a-development-branch to decide merge/PR/cleanup.

---

## Out of scope (per spec)

- Per-person unique survey links and targeted reminders (v2)
- E-mail delivery tracking (open rates, bounces)
- Automatic reminders to respondents
- HRIS/ATS integration
- Dashboard UX, PDF generation, portfolio, site (other subsystems)

## Known follow-ups (flag, do not build here)

- **Cron wiring for `/api/internal/reminders/dispatch`** is a deployment task (Railway cron or external pinger). Until wired, the dashboard banner (Task 12) is the only reminder surface — this is the disclosed fallback.
- **`complete.html` localStorage done-marker** could set `loep_survey_done_<token>` for a faster returning-device UX; today the server-side 409 (Task 5) is authoritative, so this is cosmetic.
