# Verisight Blog Content Machine Design

Date: 2026-05-06
Project: `Verisight`
Related project: `content-machine`
Status: Approved in conversation, ready for implementation planning

## Summary

Verisight needs a real public blog section that functions as a marketing channel, not as a generic knowledge base or newsroom.

The blog should work with the existing `content-machine` project, which generates one campaign package at a time and already includes a `Blog for verisight.nl` block. Version 1 should therefore not introduce a separate CMS or a manual copy-paste workflow. Instead, Verisight should become the publication layer on top of machine-generated content.

The core design is:

1. `content-machine` generates one publish-ready post package at a time.
2. Verisight imports that package automatically into repo-based Markdown content.
3. Verisight opens a pull request as the publication gate.
4. After merge, the post is live on `/inzichten/[slug]`.

This keeps the generation and publication responsibilities separate while still giving the user a one-button experience.

## Product Goal

Build a public blog system for `verisight.nl` that:

1. Publishes machine-generated, near-final marketing posts.
2. Converts those posts into owned SEO and authority value.
3. Routes readers toward relevant Verisight products or conversations.
4. Avoids manual content copying into Markdown files.

The blog should feel like a curated insight channel for HR and retention topics, with clear commercial intent but without turning every article into blunt sales copy.

## Primary Role of the Blog

Version 1 is a marketing channel first.

Implications:

1. The index page should behave like a curated insight hub, not a neutral archive.
2. Each article should support authority, discovery, and conversion.
3. The public blog should be tightly aligned with product pages, solution pages, and contact flows.

It should not be framed as:

1. A generic corporate blog.
2. A newsroom.
3. A knowledge base.
4. A full editorial CMS.

## Source-of-Truth Model

The system has two bounded source roles.

### 1. `content-machine` as generator

`content-machine` remains responsible for:

1. Topic selection.
2. Campaign package generation.
3. The full blog draft content.
4. Blog metadata suggested by generation prompts.

It does not become the final publication system for `verisight.nl`.

### 2. Verisight as publication layer

Verisight remains responsible for:

1. URL structure.
2. Markdown publication format.
3. CTA rules and site-level routing.
4. Review and merge gate.
5. Final public rendering.

This prevents the public site from becoming structurally dependent on the internal generator's current text format.

## Public URL Structure

Version 1 uses:

1. `/inzichten`
2. `/inzichten/[slug]`

Rationale:

1. `inzichten` fits the brand and the thought-leadership tone better than a literal `/blog`.
2. It feels compatible with Verisight's existing marketing language.
3. It supports a curated content posture rather than a casual posting feed.

## Public Experience

### Index page: `/inzichten`

The index should feel like a marketing insight hub.

It should include:

1. One featured article above the fold.
2. A grid of recent insight cards.
3. Simple category filters or chips.
4. A lightweight CTA rail to relevant solutions or demo/contact.

It should avoid:

1. A bare chronological archive.
2. A corporate newsroom feel.
3. Overweight author metadata.

### Post page: `/inzichten/[slug]`

Each post should use one fixed marketing-oriented template:

1. Hero with title, intro, category, reading time, and date.
2. Markdown article body.
3. Inline CTA after the first substantial section.
4. Closing CTA tied to the post's CTA type.
5. Related insight cards near the bottom.

The post template should feel calm, premium, and conversion-aware without becoming aggressive.

## Content Contract Between Projects

Version 1 should not import the full campaign bundle into the site. Verisight only needs the blog-specific subset of the machine output.

Each generated post package should contain:

1. `post.json`
2. `body.md`

### `post.json`

Required fields:

1. `title`
2. `suggested_slug`
3. `meta_description`
4. `focus_keyword`
5. `category`
6. `why_this_topic`
7. `cta_type`
8. `cta_label`
9. `cta_target`
10. `related_solution_slug`
11. `generated_at`
12. `source_topic`
13. `status`

Optional future-safe fields:

1. `seo_title`
2. `excerpt`
3. `standfirst`
4. `internal_link_suggestions`
5. `review_notes`

### `body.md`

Contains:

1. The article body only.
2. Plain Markdown.

It should not contain:

1. Frontmatter.
2. Presentation-specific wrappers.
3. Site-specific component markup.

Verisight will translate the package into its own publication format.

## Content Package Storage

The generator should write one post per package into a dedicated export directory, not into one mutable export file.

Recommended structure:

1. `exports/posts/<timestamp>-<slug>/post.json`
2. `exports/posts/<timestamp>-<slug>/body.md`

Why:

1. One post per package matches the current generation model.
2. It preserves generation history.
3. It is easier to automate and validate.
4. It removes ambiguity around overwriting exports.

## Publication Flow

Version 1 should feel like one button for the user, but stay clean under the hood.

### User-facing flow

1. `content-machine` generates one content package.
2. The user clicks one publish action.
3. The system prepares a Verisight publication PR.

### System flow

1. `content-machine` marks one package as `ready`.
2. Verisight importer validates the package.
3. Verisight importer converts the package into a Markdown post file in the site repo.
4. Verisight importer opens a PR.
5. Merge publishes the article.

The one-button experience is preserved, but the publication gate remains inside the site workflow.

## Publication Format Inside Verisight

Version 1 should keep published posts in the Verisight repo as content files.

Recommended location:

1. `frontend/content/insights/<slug>.md`

Each published file should contain frontmatter and the article body. Example shape:

```md
---
title: "Waarom onboarding in 90 dagen al retentie voorspelt"
slug: "waarom-onboarding-in-90-dagen-retentie-voorspelt"
metaDescription: "Lees hoe onboardingfrictie vroeg zichtbaar maakt waar medewerkers later afhaken."
focusKeyword: "onboarding retentie"
category: "Onboarding"
ctaType: "soft_product"
ctaLabel: "Bekijk de Onboarding Scan"
ctaTarget: "/producten/onboarding-30-60-90"
relatedSolutionSlug: "medewerkersbehoud-analyse"
generatedAt: "2026-05-06"
publishedAt: "2026-05-06"
---
```

This keeps the public site deploy model simple, transparent, and versioned.

## CTA System

Every post should use one dominant CTA pattern.

Allowed CTA types in v1:

1. `conversation`
2. `knowledge`
3. `soft_product`
4. `diagnostic`

Meaning:

1. `conversation` points toward contact or response.
2. `knowledge` points toward another relevant insight or solution page.
3. `soft_product` points toward a product page.
4. `diagnostic` points toward a scan or structured next step.

The article template should not choose CTA behavior ad hoc in rendering. It should render from the imported content fields.

## Review and Governance

Version 1 should not allow direct live publication from `content-machine`.

Required review gate:

1. Content package generated.
2. Package imported into Verisight.
3. Pull request opened.
4. Human checks:
   - claim quality
   - tone of voice
   - CTA fit
   - category and slug sanity
5. Merge publishes.

This keeps review lightweight while preventing accidental live publishing of unvetted content.

## Homepage and Site Integration

The blog should not live in isolation.

Version 1 should include:

1. A small `Laatste inzichten` rail on the homepage.
2. The ability to show related insight cards on solution pages later if needed.

Version 1 does not need:

1. A fully site-wide insight recommendation engine.
2. Dynamic personalization.

## SEO and Metadata

Version 1 should support:

1. Page title.
2. Meta description.
3. Canonical URL.
4. Open Graph title and description.
5. Open Graph image fallback.

Optional later:

1. Structured data.
2. Author pages.
3. Topic cluster pages.

## Editorial Scope Boundaries

### In scope for v1

1. `/inzichten` index page.
2. `/inzichten/[slug]` article page.
3. Markdown-based rendering.
4. Machine-package importer.
5. One-button publish preparation ending in a PR.
6. Fixed CTA logic.
7. Homepage insight rail.
8. Basic SEO metadata.

### Out of scope for v1

1. Full CMS.
2. WYSIWYG editing.
3. Multi-author system.
4. Comments.
5. Rich embedded post components.
6. Direct auto-publish without PR.
7. Multi-post campaign bundle publishing.
8. Advanced content analytics dashboards.

## Implementation Constraints

The implementation should respect the current reality of both projects:

1. `content-machine` currently generates a full campaign package and already has a blog block.
2. The current `generate_blog(...)` output is not yet a hard publish contract.
3. Verisight should therefore normalize imported content rather than trust the raw text format.

The importer must validate required fields and reject incomplete packages explicitly instead of silently publishing partial content.

## Recommended Technical Direction

### In `content-machine`

Add support for:

1. A one-post export package.
2. Stable JSON metadata output.
3. Stable Markdown body output.
4. `status` progression at least:
   - `generated`
   - `ready`
   - `imported`

### In Verisight

Add:

1. A package importer.
2. Markdown file generation into repo content.
3. Blog routes and templates.
4. A PR-based publish step.

## Risks

### 1. Generator output shape drift

If `content-machine` changes its blog output format without preserving the contract, imports will break.

Mitigation:

1. Validate import packages strictly.
2. Keep the contract minimal and explicit.

### 2. Over-coupling of publishing to generation

If `content-machine` becomes responsible for final site structure, the boundary between producer and publisher erodes.

Mitigation:

1. Keep normalization in Verisight.
2. Keep the PR step in Verisight.

### 3. Marketing tone inconsistency

If machine output is technically correct but tonally off-brand, the blog can feel generic.

Mitigation:

1. Fixed template.
2. CTA contract.
3. Review gate before merge.

## Definition of Done for Design

This design is complete when:

1. `content-machine` is treated as the producer of one publish-ready post package at a time.
2. Verisight is treated as the importer and publisher.
3. The public blog is defined as `/inzichten` and `/inzichten/[slug]`.
4. Repo-based Markdown publication is the chosen v1 storage model.
5. One-button publish preparation ends in a PR, not in direct live publication.
6. Scope boundaries for v1 are explicit.
