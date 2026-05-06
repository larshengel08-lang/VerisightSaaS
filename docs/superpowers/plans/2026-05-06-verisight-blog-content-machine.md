# Verisight Blog Content Machine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real `/inzichten` marketing blog on `verisight.nl` that ingests one publish-ready post package at a time from `content-machine`, converts it into repo-based Markdown, and publishes through a pull request.

**Architecture:** Keep `content-machine` as the producer of one publish-ready blog package and keep Verisight as the importer and public renderer. The flow stays one-button for the user, but the boundary remains clean: `content-machine` generates and marks one package as ready, then a Verisight importer creates the Markdown post and opens a PR as the publication gate.

**Tech Stack:** Python, Streamlit, OpenAI Python SDK, JSON and Markdown file persistence, Next.js App Router, React, TypeScript, Vitest, Node CLI scripts

---

## Planned File Map

### Create

- `C:\Users\larsh\Desktop\Business\content-machine\lib\publish_package.py`
- `C:\Users\larsh\Desktop\Business\content-machine\prompts\blog_publish_package.txt`
- `C:\Users\larsh\Desktop\Business\content-machine\tests\test_publish_package.py`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\content\insights\.gitkeep`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\lib\insights.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\lib\insights.test.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\components\marketing\insight-card.tsx`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\components\marketing\insight-rail.tsx`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\components\marketing\insights-index-content.tsx`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\components\marketing\insight-article-content.tsx`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\inzichten\page.tsx`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\inzichten\[slug]\page.tsx`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\inzichten\page.test.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\inzichten\[slug]\page.test.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\scripts\import-content-machine-post.mjs`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\scripts\import-content-machine-post.test.mjs`

### Modify

- `C:\Users\larsh\Desktop\Business\content-machine\lib\generator.py`
- `C:\Users\larsh\Desktop\Business\content-machine\lib\history.py`
- `C:\Users\larsh\Desktop\Business\content-machine\tests\test_generator.py`
- `C:\Users\larsh\Desktop\Business\content-machine\tests\test_history.py`
- `C:\Users\larsh\Desktop\Business\content-machine\tabs\write.py`
- `C:\Users\larsh\Desktop\Business\content-machine\.env.example`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\package.json`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\page.tsx`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\sitemap.ts`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\components\marketing\home-page-content.tsx`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\components\marketing\site-content.ts`

### Leave Alone

- `C:\Users\larsh\Desktop\Business\content-machine\tabs\trends.py`
- `C:\Users\larsh\Desktop\Business\content-machine\tabs\sources_tab.py`
- `C:\Users\larsh\Desktop\Business\content-machine\lib\feeds.py`
- `C:\Users\larsh\Desktop\Business\content-machine\lib\sources.py`
- `C:\Users\larsh\Desktop\Business\content-machine\lib\trends.py`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\producten\[slug]\page.tsx`
- `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\oplossingen\[slug]\page.tsx`

These files already carry product, trend, or solution logic that should not be repurposed into the blog pipeline in version 1.

## Task 1: Stabilize the Shared OpenAI Helper Layer in `content-machine`

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\content-machine\lib\generator.py`
- Modify: `C:\Users\larsh\Desktop\Business\content-machine\tests\test_generator.py`
- Test: `C:\Users\larsh\Desktop\Business\content-machine\tests\test_generator.py`

- [ ] **Step 1: Write the failing tests for shared text and JSON helpers**

Replace the current generator tests with explicit helper coverage:

```python
from types import SimpleNamespace
from unittest.mock import MagicMock, patch


def _mock_openai_response(text: str):
    message = SimpleNamespace(content=text)
    choice = SimpleNamespace(message=message)
    response = SimpleNamespace(choices=[choice])
    client = MagicMock()
    client.chat.completions.create.return_value = response
    return client


def test_chat_text_returns_message_content():
    from lib.generator import _chat_text

    mock_client = _mock_openai_response("Klaar")
    with patch("lib.generator._client", return_value=mock_client):
        result = _chat_text("system", "user", max_tokens=100)

    assert result == "Klaar"


def test_chat_json_strips_fence_and_parses_object():
    from lib.generator import _chat_json

    mock_client = _mock_openai_response('```json\\n{\"title\": \"Blog\"}\\n```')
    with patch("lib.generator._client", return_value=mock_client):
        result = _chat_json("system", "user", max_tokens=100)

    assert result["title"] == "Blog"
```

- [ ] **Step 2: Run the generator tests to verify they fail for the right reason**

Run:

```powershell
pytest C:\Users\larsh\Desktop\Business\content-machine\tests\test_generator.py -v
```

Expected:

1. Failures mention `_chat_text` or `_chat_json` missing or old mock assumptions.
2. Existing generator behavior tests may fail because they still patch the old direct client flow.

- [ ] **Step 3: Add shared text and JSON helpers to `lib/generator.py`**

Refactor the helper layer to:

```python
import json
import os
from pathlib import Path

from openai import OpenAI

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"
MODEL = "gpt-4o"


def _load(name: str) -> str:
    return (PROMPTS_DIR / name).read_text(encoding="utf-8")


def _client() -> OpenAI:
    return OpenAI(api_key=os.environ["OPENAI_API_KEY"])


def _chat_text(system_prompt: str, user_prompt: str, max_tokens: int) -> str:
    response = _client().chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return response.choices[0].message.content or ""


def _chat_json(system_prompt: str, user_prompt: str, max_tokens: int) -> dict:
    raw = _chat_text(system_prompt, user_prompt, max_tokens=max_tokens).strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return json.loads(raw)
```

Update `generate_linkedin()`, `generate_blog()`, and `generate_ideas()` to use `_chat_text(...)`.

- [ ] **Step 4: Run the generator tests again**

Run:

```powershell
pytest C:\Users\larsh\Desktop\Business\content-machine\tests\test_generator.py -v
```

Expected:

1. The new helper tests pass.
2. Existing blog and LinkedIn tests still pass after using the updated OpenAI mock shape.

- [ ] **Step 5: Commit the helper refactor**

```powershell
git -C C:\Users\larsh\Desktop\Business\content-machine add -- lib/generator.py tests/test_generator.py
git -C C:\Users\larsh\Desktop\Business\content-machine commit -m "refactor: add shared OpenAI generator helpers"
```

## Task 2: Add a Structured Blog Publish Package in `content-machine`

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\content-machine\lib\publish_package.py`
- Create: `C:\Users\larsh\Desktop\Business\content-machine\prompts\blog_publish_package.txt`
- Create: `C:\Users\larsh\Desktop\Business\content-machine\tests\test_publish_package.py`
- Test: `C:\Users\larsh\Desktop\Business\content-machine\tests\test_publish_package.py`

- [ ] **Step 1: Write failing tests for normalized publish packages**

Create `test_publish_package.py`:

```python
from unittest.mock import patch


def test_generate_publish_package_returns_required_fields():
    from lib.publish_package import generate_publish_package

    payload = {
        "title": "Waarom onboarding retentie vroeg voorspelt",
        "suggested_slug": "waarom-onboarding-retentie-vroeg-voorspelt",
        "meta_description": "Lees hoe onboardingfrictie vroeg zichtbaar maakt waar medewerkers later afhaken.",
        "focus_keyword": "onboarding retentie",
        "category": "Onboarding",
        "why_this_topic": "Nieuwe instroom staat onder druk.",
        "cta_type": "soft_product",
        "cta_label": "Bekijk de Onboarding Scan",
        "cta_target": "/producten/onboarding-30-60-90",
        "related_solution_slug": "medewerkersbehoud-analyse",
        "body_markdown": "# Intro\\n\\nTekst",
    }

    with patch("lib.publish_package._chat_json", return_value=payload):
        package = generate_publish_package("Onboarding", "onboarding retentie")

    assert package["post"]["title"] == payload["title"]
    assert package["post"]["status"] == "generated"
    assert package["body_markdown"].startswith("# Intro")


def test_write_post_package_creates_post_json_and_body_md(tmp_path):
    from lib.publish_package import write_post_package

    package = {
        "post": {
            "title": "Titel",
            "suggested_slug": "titel",
            "meta_description": "Meta",
            "focus_keyword": "keyword",
            "category": "Retention",
            "why_this_topic": "Waarom nu",
            "cta_type": "knowledge",
            "cta_label": "Lees meer",
            "cta_target": "/producten",
            "related_solution_slug": "medewerkersbehoud-analyse",
            "generated_at": "2026-05-06T09:00:00",
            "source_topic": "Retention topic",
            "status": "generated",
        },
        "body_markdown": "Body",
    }

    package_dir = write_post_package(package, export_root=tmp_path)

    assert (package_dir / "post.json").exists()
    assert (package_dir / "body.md").read_text(encoding="utf-8") == "Body"
```

- [ ] **Step 2: Run the new tests and confirm they fail**

Run:

```powershell
pytest C:\Users\larsh\Desktop\Business\content-machine\tests\test_publish_package.py -v
```

Expected:

1. Failure because `lib.publish_package` does not exist yet.

- [ ] **Step 3: Implement package generation and export writing**

Create `lib/publish_package.py` with:

```python
import json
from datetime import datetime
from pathlib import Path

from lib.generator import _chat_json, _load

EXPORT_ROOT = Path(__file__).parent.parent / "exports" / "posts"


def generate_publish_package(topic: str, seo_keyword: str) -> dict:
    payload = _chat_json(
        _load("system.txt"),
        _load("blog_publish_package.txt").format(topic=topic, seo_keyword=seo_keyword or topic),
        max_tokens=4096,
    )
    return {
        "post": {
            "title": payload["title"],
            "suggested_slug": payload["suggested_slug"],
            "meta_description": payload["meta_description"],
            "focus_keyword": payload["focus_keyword"],
            "category": payload["category"],
            "why_this_topic": payload["why_this_topic"],
            "cta_type": payload["cta_type"],
            "cta_label": payload["cta_label"],
            "cta_target": payload["cta_target"],
            "related_solution_slug": payload["related_solution_slug"],
            "generated_at": datetime.now().isoformat(),
            "source_topic": topic,
            "status": "generated",
        },
        "body_markdown": payload["body_markdown"].strip(),
    }


def write_post_package(package: dict, export_root: Path | None = None) -> Path:
    root = export_root or EXPORT_ROOT
    slug = package["post"]["suggested_slug"]
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    package_dir = root / f"{stamp}-{slug}"
    package_dir.mkdir(parents=True, exist_ok=False)
    (package_dir / "post.json").write_text(
        json.dumps(package["post"], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (package_dir / "body.md").write_text(package["body_markdown"], encoding="utf-8")
    return package_dir
```

Create `prompts/blog_publish_package.txt` that asks the model for one JSON object with these exact keys:

```text
Schrijf een publicatieklare blogpackage voor Verisight.

Onderwerp: {topic}
SEO-trefwoord: {seo_keyword}

Geef exact één JSON-object terug met deze velden:
- title
- suggested_slug
- meta_description
- focus_keyword
- category
- why_this_topic
- cta_type
- cta_label
- cta_target
- related_solution_slug
- body_markdown

Regels:
- schrijf in het Nederlands
- body_markdown moet 800-1200 woorden zijn
- gebruik markdown
- gebruik een zachte commerciële brug
- kies cta_type uit: conversation, knowledge, soft_product, diagnostic
- geef geen code fence terug
```

- [ ] **Step 4: Run the package tests again**

Run:

```powershell
pytest C:\Users\larsh\Desktop\Business\content-machine\tests\test_publish_package.py -v
```

Expected:

1. Both publish package tests pass.

- [ ] **Step 5: Commit the publish package foundation**

```powershell
git -C C:\Users\larsh\Desktop\Business\content-machine add -- lib/publish_package.py prompts/blog_publish_package.txt tests/test_publish_package.py
git -C C:\Users\larsh\Desktop\Business\content-machine commit -m "feat: add structured blog publish packages"
```

## Task 3: Add One-Button Publish Preparation to `content-machine`

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\content-machine\tabs\write.py`
- Modify: `C:\Users\larsh\Desktop\Business\content-machine\lib\history.py`
- Modify: `C:\Users\larsh\Desktop\Business\content-machine\tests\test_history.py`
- Modify: `C:\Users\larsh\Desktop\Business\content-machine\.env.example`
- Test: `C:\Users\larsh\Desktop\Business\content-machine\tests\test_history.py`

- [ ] **Step 1: Write failing tests for package-aware history entries**

Add to `test_history.py`:

```python
def test_add_entry_keeps_optional_metadata():
    from lib.history import add_entry, load_history, HISTORY_PATH

    add_entry(
        "blog_publish_package",
        "",
        "Onboarding",
        "Volledige blogtekst",
        metadata={"package_status": "ready", "slug": "onboarding-retentie"},
    )

    latest = load_history()[-1]
    assert latest["metadata"]["package_status"] == "ready"
    assert latest["metadata"]["slug"] == "onboarding-retentie"
```

- [ ] **Step 2: Run the history tests and confirm failure**

Run:

```powershell
pytest C:\Users\larsh\Desktop\Business\content-machine\tests\test_history.py -v
```

Expected:

1. Failure because `metadata` is not yet accepted or stored.

- [ ] **Step 3: Add metadata support and publish preparation flow**

Update `lib/history.py`:

```python
def add_entry(entry_type: str, tone: str, title: str, full_text: str, metadata: dict | None = None) -> None:
    history = load_history()
    history.append({
        "date": datetime.now().isoformat(),
        "type": entry_type,
        "tone": tone,
        "title": title,
        "snippet": full_text[:120],
        "full_text": full_text,
        "metadata": metadata or {},
    })
    HISTORY_PATH.write_text(json.dumps(history, indent=2, ensure_ascii=False), encoding="utf-8")
```

Update `.env.example`:

```text
VERISIGHT_REPO_PATH=C:/Users/larsh/Desktop/Business/Verisight
```

Update `tabs/write.py` so that blog generation stores a publish package and exposes one publish button:

```python
from lib.publish_package import generate_publish_package, write_post_package

# after result generation for Blogpost
package = generate_publish_package(topic, seo_keyword)
st.session_state["_last_blog_package"] = package
st.session_state["_last_result"] = package["body_markdown"]

# below the generated content
if content_type == "Blogpost" and st.session_state.get("_last_blog_package"):
    if st.button("Maak publicatieklaar voor Verisight"):
        package_dir = write_post_package(st.session_state["_last_blog_package"])
        add_entry(
            "blog_publish_package",
            "",
            st.session_state["_last_blog_package"]["post"]["title"],
            st.session_state["_last_blog_package"]["body_markdown"],
            metadata={
                "package_status": "ready",
                "package_dir": str(package_dir),
                "slug": st.session_state["_last_blog_package"]["post"]["suggested_slug"],
            },
        )
        st.success(f"Publicatiepakket klaar: {package_dir}")
```

Do not shell out to Verisight yet in this task. First make the package and history status explicit.

- [ ] **Step 4: Run the history tests again**

Run:

```powershell
pytest C:\Users\larsh\Desktop\Business\content-machine\tests\test_history.py -v
```

Expected:

1. The new metadata test passes.
2. Existing history tests still pass.

- [ ] **Step 5: Commit the one-button package preparation**

```powershell
git -C C:\Users\larsh\Desktop\Business\content-machine add -- tabs/write.py lib/history.py tests/test_history.py .env.example
git -C C:\Users\larsh\Desktop\Business\content-machine commit -m "feat: prepare one-click Verisight blog packages"
```

## Task 4: Add the Insight Content Model to Verisight

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\package.json`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\content\insights\.gitkeep`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\lib\insights.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\lib\insights.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\lib\insights.test.ts`

- [ ] **Step 1: Write the failing insight loader tests**

Create `insights.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import { parseInsightDocument, estimateReadingMinutes } from './insights'

describe('insight content parsing', () => {
  it('parses frontmatter and markdown body', () => {
    const source = `---\n` +
      `title: "Titel"\n` +
      `slug: "titel"\n` +
      `metaDescription: "Meta"\n` +
      `focusKeyword: "keyword"\n` +
      `category: "Onboarding"\n` +
      `ctaType: "soft_product"\n` +
      `ctaLabel: "Bekijk"\n` +
      `ctaTarget: "/producten/onboarding-30-60-90"\n` +
      `relatedSolutionSlug: "medewerkersbehoud-analyse"\n` +
      `generatedAt: "2026-05-06"\n` +
      `publishedAt: "2026-05-06"\n` +
      `---\n\n## Intro\n\nBody`

    const result = parseInsightDocument(source)

    expect(result.slug).toBe('titel')
    expect(result.bodyMarkdown).toContain('## Intro')
  })

  it('estimates reading time from word count', () => {
    expect(estimateReadingMinutes('woord '.repeat(450))).toBe(3)
  })
})
```

- [ ] **Step 2: Run the insight loader tests and confirm failure**

Run:

```powershell
npx vitest run "frontend/lib/insights.test.ts"
```

Expected:

1. Failure because `frontend/lib/insights.ts` does not exist yet.

- [ ] **Step 3: Add Markdown and frontmatter dependencies plus the insight loader**

Update `package.json`:

```json
"dependencies": {
  "@sentry/nextjs": "^8.0.0",
  "@supabase/ssr": "^0.10.0",
  "@supabase/supabase-js": "^2.101.1",
  "gray-matter": "^4.0.3",
  "next": "15.5.14",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "react-markdown": "^10.1.0",
  "recharts": "^3.8.1",
  "remark-gfm": "^4.0.1"
}
```

Create `frontend/lib/insights.ts`:

```typescript
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export interface InsightPost {
  title: string
  slug: string
  metaDescription: string
  focusKeyword: string
  category: string
  ctaType: 'conversation' | 'knowledge' | 'soft_product' | 'diagnostic'
  ctaLabel: string
  ctaTarget: string
  relatedSolutionSlug: string
  generatedAt: string
  publishedAt?: string
  bodyMarkdown: string
  readingMinutes: number
}

export const INSIGHTS_DIR = path.join(process.cwd(), 'content', 'insights')

export function estimateReadingMinutes(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 180))
}

export function parseInsightDocument(source: string): InsightPost {
  const parsed = matter(source)
  const data = parsed.data as Omit<InsightPost, 'bodyMarkdown' | 'readingMinutes'>
  return {
    ...data,
    bodyMarkdown: parsed.content.trim(),
    readingMinutes: estimateReadingMinutes(parsed.content),
  }
}

export function listInsightSlugs() {
  if (!fs.existsSync(INSIGHTS_DIR)) return []
  return fs.readdirSync(INSIGHTS_DIR).filter((name) => name.endsWith('.md'))
}

export function getAllInsights(): InsightPost[] {
  return listInsightSlugs()
    .map((name) => {
      const source = fs.readFileSync(path.join(INSIGHTS_DIR, name), 'utf8')
      return parseInsightDocument(source)
    })
    .sort((a, b) => (a.publishedAt ?? a.generatedAt) < (b.publishedAt ?? b.generatedAt) ? 1 : -1)
}

export function getInsightBySlug(slug: string) {
  const filePath = path.join(INSIGHTS_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null
  return parseInsightDocument(fs.readFileSync(filePath, 'utf8'))
}
```

- [ ] **Step 4: Install dependencies and run the insight tests**

Run:

```powershell
Set-Location C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend
npm install
npx vitest run "frontend/lib/insights.test.ts"
```

Expected:

1. Dependency install completes.
2. Insight parsing tests pass.

- [ ] **Step 5: Commit the insight model foundation**

```powershell
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine add -- frontend/package.json frontend/package-lock.json frontend/content/insights/.gitkeep frontend/lib/insights.ts frontend/lib/insights.test.ts
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine commit -m "feat: add insight markdown content model"
```

## Task 5: Build the Public `/inzichten` Pages and Homepage Rail

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\components\marketing\insight-card.tsx`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\components\marketing\insight-rail.tsx`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\components\marketing\insights-index-content.tsx`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\components\marketing\insight-article-content.tsx`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\inzichten\page.tsx`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\inzichten\[slug]\page.tsx`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\inzichten\page.test.ts`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\inzichten\[slug]\page.test.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\components\marketing\home-page-content.tsx`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\components\marketing\site-content.ts`
- Modify: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\sitemap.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\inzichten\page.test.ts`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\app\inzichten\[slug]\page.test.ts`

- [ ] **Step 1: Write failing route-shell tests for the insight pages**

Create `app/inzichten/page.test.ts`:

```typescript
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('inzichten index shell', () => {
  it('keeps inzichten as a curated marketing hub', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('/inzichten')
    expect(source).toContain('Laatste inzichten')
    expect(source).not.toContain('newsroom')
  })
})
```

Create `app/inzichten/[slug]/page.test.ts`:

```typescript
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('inzichten article shell', () => {
  it('renders the article page as a marketing article, not a dashboard or CMS shell', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('generateMetadata')
    expect(source).toContain('notFound')
    expect(source).not.toContain('DashboardHero')
    expect(source).not.toContain('ActionCenter')
  })
})
```

- [ ] **Step 2: Run the new shell tests and confirm failure**

Run:

```powershell
npx vitest run "frontend/app/inzichten/page.test.ts" "frontend/app/inzichten/[slug]/page.test.ts"
```

Expected:

1. Failure because the routes do not exist yet.

- [ ] **Step 3: Implement the insight routes and marketing components**

Create the reusable card:

```tsx
// frontend/components/marketing/insight-card.tsx
import Link from 'next/link'
import type { InsightPost } from '@/lib/insights'

export function InsightCard({ post }: { post: InsightPost }) {
  return (
    <article className="rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-[0_1px_4px_rgba(10,25,47,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{post.category}</p>
      <h3 className="mt-3 text-xl font-semibold text-[var(--ink)]">{post.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--text)]">{post.metaDescription}</p>
      <div className="mt-4 flex items-center justify-between text-sm text-[var(--muted)]">
        <span>{post.readingMinutes} min leestijd</span>
        <Link href={`/inzichten/${post.slug}`} className="font-semibold text-[var(--ink)]">
          Lees inzicht
        </Link>
      </div>
    </article>
  )
}
```

Create the rail:

```tsx
// frontend/components/marketing/insight-rail.tsx
import type { InsightPost } from '@/lib/insights'
import { InsightCard } from './insight-card'

export function InsightRail({ posts, title }: { posts: InsightPost[]; title: string }) {
  if (posts.length === 0) return null
  return (
    <section className="border-t border-[var(--border)] bg-[#F7F5F1]">
      <div className="marketing-shell py-16">
        <h2 className="text-3xl font-semibold text-[var(--ink)]">{title}</h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {posts.map((post) => (
            <InsightCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

Create the index page:

```tsx
// frontend/app/inzichten/page.tsx
import type { Metadata } from 'next'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { InsightRail } from '@/components/marketing/insight-rail'
import { getAllInsights } from '@/lib/insights'
import { marketingPrimaryCta } from '@/components/marketing/site-content'

export const metadata: Metadata = {
  title: 'Inzichten | Verisight',
  description: 'Inzichten over onboarding, behoud, uitstroom en HR-prioritering.',
  alternates: { canonical: '/inzichten' },
}

export default function InsightsIndexPage() {
  const posts = getAllInsights()
  const [featured, ...rest] = posts

  return (
    <MarketingPageShell
      pageType="overview"
      ctaHref={marketingPrimaryCta.href}
      ctaLabel={marketingPrimaryCta.label}
      heroIntro={
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Inzichten</p>
          <h1 className="mt-4 text-5xl font-semibold text-[var(--ink)]">Laatste inzichten voor HR en management</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--text)]">
            Praktische thought leadership over onboarding, retentie en uitstroom, met een duidelijke route naar wat Verisight helpt organiseren.
          </p>
        </div>
      }
    >
      <div className="marketing-shell py-16">
        {featured ? <InsightRail posts={[featured, ...rest.slice(0, 5)]} title="Laatste inzichten" /> : <p>Nog geen inzichten gepubliceerd.</p>}
      </div>
    </MarketingPageShell>
  )
}
```

Create the article page using `react-markdown` and `remark-gfm`, and modify `home-page-content.tsx` to render:

```tsx
<InsightRail posts={getAllInsights().slice(0, 3)} title="Laatste inzichten" />
```

Also extend `site-content.ts` nav and footer arrays with:

```ts
{ href: '/inzichten', label: 'Inzichten' }
```

Update `app/sitemap.ts` so `/inzichten` and each insight slug are emitted.

- [ ] **Step 4: Run the route-shell tests and homepage integration tests**

Run:

```powershell
npx vitest run "frontend/app/inzichten/page.test.ts" "frontend/app/inzichten/[slug]/page.test.ts" "frontend/lib/insights.test.ts"
```

Expected:

1. All insight shell tests pass.
2. The existing homepage tests remain green if any are impacted.

- [ ] **Step 5: Commit the public insight surfaces**

```powershell
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine add -- frontend/components/marketing/insight-card.tsx frontend/components/marketing/insight-rail.tsx frontend/components/marketing/insights-index-content.tsx frontend/components/marketing/insight-article-content.tsx frontend/app/inzichten/page.tsx frontend/app/inzichten/[slug]/page.tsx frontend/app/inzichten/page.test.ts frontend/app/inzichten/[slug]/page.test.ts frontend/components/marketing/home-page-content.tsx frontend/components/marketing/site-content.ts frontend/app/sitemap.ts
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine commit -m "feat: add public inzichten blog surfaces"
```

## Task 6: Add the Verisight Importer and PR Creation Script

**Files:**
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\scripts\import-content-machine-post.mjs`
- Create: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\scripts\import-content-machine-post.test.mjs`
- Test: `C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend\scripts\import-content-machine-post.test.mjs`

- [ ] **Step 1: Write failing importer tests for validation and markdown output**

Create `import-content-machine-post.test.mjs`:

```javascript
import { describe, expect, it } from 'vitest'
import { buildMarkdownDocument, validatePackage } from './import-content-machine-post.mjs'

describe('content-machine insight importer', () => {
  it('rejects packages missing required post fields', () => {
    expect(() => validatePackage({ title: 'Titel' }, 'Body')).toThrow(/meta_description/)
  })

  it('builds markdown with frontmatter and body', () => {
    const post = {
      title: 'Titel',
      suggested_slug: 'titel',
      meta_description: 'Meta',
      focus_keyword: 'keyword',
      category: 'Onboarding',
      why_this_topic: 'Waarom',
      cta_type: 'soft_product',
      cta_label: 'Bekijk',
      cta_target: '/producten/onboarding-30-60-90',
      related_solution_slug: 'medewerkersbehoud-analyse',
      generated_at: '2026-05-06T09:00:00',
      source_topic: 'Topic',
      status: 'ready',
    }

    const markdown = buildMarkdownDocument(post, '## Intro')
    expect(markdown).toContain('title: "Titel"')
    expect(markdown).toContain('## Intro')
  })
})
```

- [ ] **Step 2: Run the importer tests and confirm failure**

Run:

```powershell
npx vitest run "frontend/scripts/import-content-machine-post.test.mjs"
```

Expected:

1. Failure because the importer file does not exist yet.

- [ ] **Step 3: Implement the importer script and PR workflow**

Create `import-content-machine-post.mjs`:

```javascript
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

export function validatePackage(post, bodyMarkdown) {
  const required = [
    'title',
    'suggested_slug',
    'meta_description',
    'focus_keyword',
    'category',
    'why_this_topic',
    'cta_type',
    'cta_label',
    'cta_target',
    'related_solution_slug',
    'generated_at',
    'source_topic',
    'status',
  ]
  for (const key of required) {
    if (!post[key]) throw new Error(`Missing required field: ${key}`)
  }
  if (!bodyMarkdown.trim()) throw new Error('Missing body markdown')
}

export function buildMarkdownDocument(post, bodyMarkdown) {
  return `---\n` +
    `title: "${post.title.replaceAll('"', '\\"')}"\n` +
    `slug: "${post.suggested_slug}"\n` +
    `metaDescription: "${post.meta_description.replaceAll('"', '\\"')}"\n` +
    `focusKeyword: "${post.focus_keyword}"\n` +
    `category: "${post.category}"\n` +
    `ctaType: "${post.cta_type}"\n` +
    `ctaLabel: "${post.cta_label.replaceAll('"', '\\"')}"\n` +
    `ctaTarget: "${post.cta_target}"\n` +
    `relatedSolutionSlug: "${post.related_solution_slug}"\n` +
    `generatedAt: "${post.generated_at}"\n` +
    `publishedAt: "${new Date().toISOString().slice(0, 10)}"\n` +
    `---\n\n${bodyMarkdown.trim()}\n`
}

function main() {
  const packageDir = process.argv[2]
  if (!packageDir) throw new Error('Usage: node import-content-machine-post.mjs <package-dir>')

  const post = JSON.parse(fs.readFileSync(path.join(packageDir, 'post.json'), 'utf8'))
  const bodyMarkdown = fs.readFileSync(path.join(packageDir, 'body.md'), 'utf8')
  validatePackage(post, bodyMarkdown)

  const repoRoot = path.resolve(process.cwd())
  const targetPath = path.join(repoRoot, 'content', 'insights', `${post.suggested_slug}.md`)
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, buildMarkdownDocument(post, bodyMarkdown), 'utf8')

  const branch = `content-machine/${post.suggested_slug}-${post.generated_at.slice(0, 10)}`
  execFileSync('git', ['checkout', '-b', branch], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('git', ['add', '--', targetPath], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('git', ['commit', '-m', `feat: publish insight ${post.suggested_slug}`], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync('git', ['push', '-u', 'origin', branch], { cwd: repoRoot, stdio: 'inherit' })
  execFileSync(
    'gh',
    ['pr', 'create', '--base', 'main', '--head', branch, '--title', `Publish insight: ${post.title}`, '--body', `Imported from content-machine package ${path.basename(packageDir)}`],
    { cwd: repoRoot, stdio: 'inherit' },
  )
}

if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  main()
}
```

- [ ] **Step 4: Run the importer tests**

Run:

```powershell
npx vitest run "frontend/scripts/import-content-machine-post.test.mjs"
```

Expected:

1. Validation and markdown output tests pass.

- [ ] **Step 5: Commit the importer workflow**

```powershell
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine add -- frontend/scripts/import-content-machine-post.mjs frontend/scripts/import-content-machine-post.test.mjs
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine commit -m "feat: add content machine insight importer"
```

## Task 7: Wire the One-Button Publish Action End-to-End

**Files:**
- Modify: `C:\Users\larsh\Desktop\Business\content-machine\tabs\write.py`
- Modify: `C:\Users\larsh\Desktop\Business\content-machine\lib\publish_package.py`
- Test: `C:\Users\larsh\Desktop\Business\content-machine\tests\test_publish_package.py`

- [ ] **Step 1: Write a failing test for the Verisight publish command wrapper**

Add to `test_publish_package.py`:

```python
from unittest.mock import patch


def test_publish_to_verisight_invokes_importer_script(tmp_path):
    from lib.publish_package import publish_to_verisight

    package_dir = tmp_path / "20260506-onboarding"
    package_dir.mkdir()

    with patch("lib.publish_package.subprocess.run") as run_mock, patch.dict(
        "os.environ",
        {"VERISIGHT_REPO_PATH": "C:/Users/larsh/Desktop/Business/Verisight/frontend"},
        clear=False,
    ):
        publish_to_verisight(package_dir)

    command = run_mock.call_args.args[0]
    assert command[-2] == "import-content-machine-post.mjs"
    assert command[-1] == str(package_dir)
```

- [ ] **Step 2: Run the publish package tests and confirm failure**

Run:

```powershell
pytest C:\Users\larsh\Desktop\Business\content-machine\tests\test_publish_package.py -v
```

Expected:

1. Failure because `publish_to_verisight` does not exist yet.

- [ ] **Step 3: Add the end-to-end publish wrapper and connect the button**

Update `lib/publish_package.py`:

```python
import os
import subprocess


def publish_to_verisight(package_dir: Path) -> None:
    repo_path = Path(os.environ["VERISIGHT_REPO_PATH"])
    script_path = repo_path / "frontend" / "scripts" / "import-content-machine-post.mjs"
    subprocess.run(
        ["node", str(script_path), str(package_dir)],
        check=True,
        cwd=repo_path / "frontend",
    )
```

Update `tabs/write.py` so the publish button performs:

```python
from lib.publish_package import generate_publish_package, write_post_package, publish_to_verisight

if st.button("Publiceer naar Verisight"):
    package_dir = write_post_package(st.session_state["_last_blog_package"])
    publish_to_verisight(package_dir)
    add_entry(
        "blog_publish_package",
        "",
        st.session_state["_last_blog_package"]["post"]["title"],
        st.session_state["_last_blog_package"]["body_markdown"],
        metadata={
            "package_status": "imported",
            "package_dir": str(package_dir),
            "slug": st.session_state["_last_blog_package"]["post"]["suggested_slug"],
        },
    )
    st.success("Publicatie-PR voor Verisight is aangemaakt.")
```

- [ ] **Step 4: Run the focused tests again**

Run:

```powershell
pytest C:\Users\larsh\Desktop\Business\content-machine\tests\test_publish_package.py -v
pytest C:\Users\larsh\Desktop\Business\content-machine\tests\test_history.py -v
```

Expected:

1. Publish wrapper tests pass.
2. History status still passes.

- [ ] **Step 5: Commit the one-button publish integration**

```powershell
git -C C:\Users\larsh\Desktop\Business\content-machine add -- lib/publish_package.py tabs/write.py tests/test_publish_package.py tests/test_history.py
git -C C:\Users\larsh\Desktop\Business\content-machine commit -m "feat: publish Verisight blog posts through one button"
```

## Task 8: Final Verification Across Both Repos

**Files:**
- Test only task

- [ ] **Step 1: Run all targeted `content-machine` tests**

```powershell
pytest C:\Users\larsh\Desktop\Business\content-machine\tests\test_generator.py -v
pytest C:\Users\larsh\Desktop\Business\content-machine\tests\test_publish_package.py -v
pytest C:\Users\larsh\Desktop\Business\content-machine\tests\test_history.py -v
```

Expected:

1. All targeted content-machine tests pass.

- [ ] **Step 2: Run all targeted Verisight tests**

```powershell
Set-Location C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine\frontend
npx vitest run "frontend/lib/insights.test.ts" "frontend/app/inzichten/page.test.ts" "frontend/app/inzichten/[slug]/page.test.ts" "frontend/scripts/import-content-machine-post.test.mjs"
```

Expected:

1. All targeted blog tests pass.

- [ ] **Step 3: Run lint on the Verisight blog slice**

```powershell
npx eslint "frontend/lib/insights.ts" "frontend/app/inzichten/page.tsx" "frontend/app/inzichten/[slug]/page.tsx" "frontend/components/marketing/insight-card.tsx" "frontend/components/marketing/insight-rail.tsx" "frontend/components/marketing/insights-index-content.tsx" "frontend/components/marketing/insight-article-content.tsx" "frontend/components/marketing/home-page-content.tsx" "frontend/components/marketing/site-content.ts" "frontend/scripts/import-content-machine-post.mjs"
```

Expected:

1. ESLint exits cleanly.

- [ ] **Step 4: Manually rehearse one publish package end-to-end**

Use one generated package and verify:

1. `content-machine` writes `post.json` and `body.md`.
2. The publish button triggers the importer.
3. Verisight gets a new Markdown file in `frontend/content/insights`.
4. A PR is opened against `main`.
5. The new post appears on `/inzichten` after merge.

- [ ] **Step 5: Commit any final glue changes**

```powershell
git -C C:\Users\larsh\Desktop\Business\content-machine status --short
git -C C:\Users\larsh\Desktop\Business\Verisight\.worktrees\verisight-blog-content-machine status --short
```

Expected:

1. Both repos are clean except for intentional uncommitted review notes.

