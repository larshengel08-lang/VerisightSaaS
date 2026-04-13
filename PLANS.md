# PLANS.md - Verisight Commercial Website Redesign Plan

## Summary
This plan turns the current public Verisight site into a sharper commercial website centered on **two live products only**: **ExitScan** and **RetentieScan**. The visual target is a more polished, conversion-oriented marketing experience in the spirit of the TailGrids reference: stronger hero composition, clearer section hierarchy, more visual proof, less text repetition, and cleaner product navigation.

This plan assumes:
- the **public marketing website** is in scope
- the **dashboard/app UX is out of scope for now**
- **future products stay technically supported**, but are **removed from the primary sales story** until they are real
- `PLANS.md` at repo root becomes the execution source of truth

Important codebase anchors for execution:
- marketing homepage: `frontend/app/page.tsx`
- shared marketing shell: `frontend/components/marketing/marketing-page-shell.tsx`
- nav/footer/content primitives: `frontend/components/marketing/*`
- product pages: `frontend/app/producten/*`
- marketing content/config: `frontend/lib/marketing-products.ts`, `frontend/components/marketing/site-content.ts`
- styling base: `frontend/app/globals.css`

Important interface/content changes:
- no backend/API changes required
- no dashboard contracts required
- marketing content model should be centralized enough that page copy, nav labels, CTA labels, and proof blocks are not duplicated across page files
- `/producten/*` remains the canonical public product structure
- future product routes stay non-primary and non-prominent

---

## Milestone 0 - Freeze Scope And Baseline
Dependency: none

### Tasks
- [x] Confirm and document that the public site will sell **only ExitScan, RetentieScan, and the combination route**.
- [x] Document current public routes, current live sections, and current shared marketing components.
- [x] Capture baseline screenshots of homepage, `/producten`, `/producten/exitscan`, `/producten/retentiescan`, `/aanpak`, `/tarieven`, and mobile header states.
- [x] Identify duplicated copy blocks, repeated section patterns, and current visual weak spots in the shared shell and homepage.
- [x] Record the current list of public assets and where visual placeholders are still synthetic or reused.

### Definition of done
- [x] A baseline inventory exists inside `PLANS.md` or linked internal notes.
- [x] Execution starts from one agreed scope: public marketing site only.
- [x] The plan explicitly excludes dashboard redesign work in this phase.

### Baseline inventory

#### Scope locked for execution
- Public marketing website only.
- Current live commercial story should center on **ExitScan**, **RetentieScan**, and **Combinatie**.
- Dashboard/app UX remains out of scope for this website redesign track.

#### Current public routes in active sales flow
- `/`
- `/producten`
- `/producten/exitscan`
- `/producten/retentiescan`
- `/producten/combinatie`
- `/aanpak`
- `/tarieven`
- `/privacy`
- `/voorwaarden`
- `/dpa`
- `/#kennismaking`

#### Current shared marketing components in use
- `frontend/components/marketing/public-header.tsx`
- `frontend/components/marketing/public-footer.tsx`
- `frontend/components/marketing/marketing-page-shell.tsx`
- `frontend/components/marketing/preview-slider.tsx`
- `frontend/components/marketing/contact-form.tsx`
- `frontend/components/marketing/solutions-dropdown.tsx`
- `frontend/components/marketing/trust-strip.tsx`
- `frontend/components/marketing/site-content.ts`

#### Baseline visual and content issues observed
- Homepage still relies heavily on repeated bordered-card sections with similar visual weight.
- Shared `marketing-page-shell` repeats the same right-column story pattern across multiple pages.
- `/producten` still sells a broader portfolio and explicitly surfaces "Binnenkort" products in the live commercial flow.
- The dropdown under `Producten` still includes upcoming products and keeps the current sales story broader than the two live products.
- Preview/demo content is still synthetic and reused across multiple pages, which weakens proof value.
- Multiple public pages still lean on "productportfolio" framing instead of a sharper two-product commercial story.
- Footer still contains one visible mojibake issue: `oriÃƒÂ«ntatie`.

#### Current public asset baseline
- Present reusable public assets are still limited to wordmarks, one HTML flow preview, one segment deep dive image, and template download files.
- There is no dedicated library yet of product-specific proof media such as polished hero mockups, product screenshots, report crops, or pricing visuals.
- Existing proof is largely component-rendered and synthetic rather than screenshot-led.

#### Baseline screenshots captured
- Temporary baseline screenshots captured outside the repo at:
  - `%TEMP%\\verisight-baseline-20260413\\home-desktop.png`
  - `%TEMP%\\verisight-baseline-20260413\\producten-desktop.png`
  - `%TEMP%\\verisight-baseline-20260413\\exitscan-desktop.png`
  - `%TEMP%\\verisight-baseline-20260413\\retentiescan-desktop.png`
  - `%TEMP%\\verisight-baseline-20260413\\aanpak-desktop.png`
  - `%TEMP%\\verisight-baseline-20260413\\tarieven-desktop.png`
  - `%TEMP%\\verisight-baseline-20260413\\home-mobile.png`
  - `%TEMP%\\verisight-baseline-20260413\\home-mobile-menu-open.png`

#### Milestone 0 completion status
- Completed:
  - Scope frozen to the public marketing site.
  - Baseline routes, shared components, assets, and weak spots documented.
  - Baseline desktop and mobile screenshots captured.
- Still open after this milestone:
  - All Milestone 1 work and beyond.
  - Existing local uncommitted marketing/SEO changes remain outside this milestone and were left untouched.
- New follow-ups discovered in this milestone:
  - [ ] Fix the remaining mojibake string in `public-footer.tsx` during a later milestone that touches live public copy.
  - [ ] Remove "Binnenkort" exposure from both `/producten` and the `Producten` dropdown when Milestone 1 is executed.
  - [ ] Replace "productportfolio" framing on homepage and product-supporting pages with a tighter two-product commercial framing during Milestone 1 and Milestone 3.
- Validation executed:
  - Repo inspection of current marketing routes, components, and shared content/config.
  - Live HTML inspection of `/producten`, `/aanpak`, and `/tarieven`.
  - Temporary desktop screenshots for homepage, products overview, both live product pages, aanpak, and tarieven.
  - Temporary mobile screenshots for homepage default header state and open mobile menu state.

---

## Milestone 1 - Marketing Information Architecture And Content Model
Dependency: Milestone 0

### Tasks
- [x] Simplify the top-level marketing IA to:
  - `Home`
  - `Producten`
  - `Aanpak`
  - `Tarieven`
  - `Plan gesprek`
- [x] Make `Producten` the single primary entry into product choice.
- [x] Keep public product routes focused on:
  - `/producten/exitscan`
  - `/producten/retentiescan`
  - `/producten/combinatie`
- [x] Remove or de-emphasize future products from the main commercial flow.
- [x] Refactor marketing content structure so shared copy blocks do not live inline across multiple page files.
- [x] Define a central marketing content/config layer for:
  - nav labels
  - CTA labels
  - product summaries
  - comparison rows
  - proof blocks
  - pricing summaries
  - FAQ content
- [x] Decide and document canonical page purpose for each public page:
  - homepage = product choice + trust + conversion
  - product pages = product-specific conversion
  - aanpak = process clarity
  - tarieven = commercial packaging and price framing

### Definition of done
- [x] Each public page has one clear commercial job.
- [x] Product choice is not duplicated confusingly across homepage, nav, and products overview.
- [x] Future products are no longer part of the primary current sales story.
- [x] Shared copy/config has an obvious single source of truth.

### Milestone 1 completion status
- Completed:
  - Central marketing content/config moved into `frontend/components/marketing/site-content.ts`.
  - Homepage, `/producten`, `/aanpak`, `/tarieven`, header, and footer now consume shared IA/content primitives instead of duplicating inline blocks.
  - Main commercial flow now sells only ExitScan, RetentieScan, and Combinatie.
  - Upcoming products were removed from the primary `Producten` dropdown and the `/producten` overview page.
  - Canonical page purposes were documented in the central content layer and reflected in page copy.
- Still open after this milestone:
  - All Milestone 2 work and beyond.
  - Any visual redesign beyond IA/content cleanup remains intentionally untouched for now.
  - Existing local product-page SEO/social image work remains outside this milestone and was preserved.
- New follow-ups discovered in this milestone:
  - [ ] Consider eventually removing or redirecting public `/producten/[slug]` pages for upcoming products if they keep existing outside the linked sales flow.
  - [ ] Consider moving contact-form framing copy into the same central content layer if later milestones need even tighter CTA governance.
- Validation executed:
  - Repo inspection of homepage, products overview, aanpak, tarieven, header, footer, and shared marketing content files.
  - `npm.cmd run lint` in `frontend`.
  - `npm.cmd run build` in `frontend`.

---

## Milestone 2 - Visual System And Section Framework
Dependency: Milestone 1

### Tasks
- [x] Define a lightweight visual system for the marketing site:
  - typography scale
  - section spacing rules
  - card hierarchy rules
  - CTA hierarchy
  - accent usage for ExitScan vs RetentieScan vs combination
- [x] Add reusable visual section patterns so pages stop feeling like repeated "title + paragraph + 3 cards".
- [x] Introduce stronger layout variation:
  - split hero blocks
  - wide proof strips
  - dense comparison tables
  - visual callout bands
  - media-first sections
- [x] Reduce reliance on identical rounded bordered cards for every section.
- [x] Add a limited but consistent background language:
  - gradients
  - subtle glows/shapes
  - section contrast rhythm
- [x] Clean up global styling utilities and remove any remaining mojibake/encoding artifacts in comments or copy.

### Definition of done
- [x] The marketing pages use a recognizable visual system instead of ad hoc section styling.
- [x] At least 4 distinct section patterns exist and are reusable.
- [x] Visual hierarchy is stronger: primary CTA, proof, comparison, and content sections no longer feel equally weighted.
- [x] Shared styling changes are compatible with existing Next.js + Tailwind v4 setup.

### Milestone 2 completion status
- Completed:
  - Added a shared visual system in `frontend/app/globals.css` for section spacing, marketing surfaces, panel hierarchy, and accent glows.
  - Added reusable marketing components for section framing, proof strips, comparison tables, spotlight layouts, and CTA bands.
  - Updated the shared `marketing-page-shell` to use the new split hero and spotlight framework.
  - Updated `/producten`, `/aanpak`, and `/tarieven` to consume the new reusable comparison and callout patterns.
- Still open after this milestone:
  - All Milestone 3 work and beyond.
  - The homepage still needs its full conversion-oriented rebuild in Milestone 3.
  - Product pages still need stronger product-specific visual differentiation in Milestone 4.
- New follow-ups discovered in this milestone:
  - [ ] Consider introducing a single shared CTA component for homepage and shell-level buttons if later milestones need even stricter CTA consistency.
  - [ ] Consider extracting repeated dark trust/proof bands into one more shared component once homepage and product pages are rebuilt.
- Validation executed:
  - `npm.cmd run lint` in `frontend`.
  - `npm.cmd run build` in `frontend`.

---

## Milestone 3 - Homepage Redesign
Dependency: Milestone 2

### Tasks
- [x] Rebuild the homepage as a commercial landing page for **two products**.
- [x] Replace repetitive explanatory blocks with a tighter conversion flow:
  - hero
  - quick product choice
  - visual proof/demo
  - product comparison
  - trust/proof
  - CTA/contact
- [x] Add one dominant visual hero block that feels closer to a polished SaaS landing page.
- [x] Add clearer commercial proof sections:
  - what HR gets
  - what MT gets
  - what directie gets
  - what makes Verisight different from a generic survey
- [x] Reduce homepage copy volume by removing repetition between hero, product choice, and comparison sections.
- [x] Make the combination route visible but secondary to the two core products.
- [x] Ensure homepage keeps one primary CTA and one secondary CTA consistently throughout.

### Definition of done
- [x] The homepage clearly explains Verisight in under 10 seconds.
- [x] A visitor can distinguish ExitScan and RetentieScan without reading long text blocks.
- [x] There is no repeated "same message in three different sections" problem.
- [x] The homepage feels like a commercial landing page, not a stitched set of informational blocks.

### Milestone 3 completion status
- Completed:
  - Rebuilt the homepage around a single conversion flow with a dominant hero, quick product choice, proof/demo, product comparison, audience-value section, and CTA/contact finish.
  - Made ExitScan and RetentieScan the clear primary routes and kept Combinatie visible but secondary.
  - Reduced repeated explanatory text and shifted homepage proof into clearer audience-oriented blocks.
- Still open after this milestone:
  - All Milestone 4 work and beyond.
  - Product pages still need stronger product-specific differentiation.
  - Proof media still relies on synthetic preview assets and needs Milestone 6 work.
- New follow-ups discovered in this milestone:
  - [ ] Consider replacing the portfolio preview block with one higher-fidelity composed mockup once proof assets exist.
  - [ ] Consider testing whether the homepage CTA pair should be `Plan mijn gesprek` plus `Bekijk producten` or `Bekijk ExitScan` plus `Bekijk RetentieScan`.
- Validation executed:
  - `npm.cmd run lint` in `frontend`.
  - `npm.cmd run build` in `frontend`.

---

## Milestone 4 - Product Pages For ExitScan And RetentieScan
Dependency: Milestone 2

### Tasks
- [x] Make ExitScan and RetentieScan pages visually distinct while staying in one brand system.
- [x] Give each product page a tighter commercial structure:
  - product-specific hero
  - when to use
  - what management gets
  - why this is different
  - example output
  - what it is not
  - CTA
- [x] Reduce template sameness between the two product pages.
- [x] Keep the combination page, but position it as a deliberate decision route rather than a third equal flagship.
- [x] Remove all non-essential mention of future products from the live product conversion path.
- [x] Ensure each product page supports product-specific metadata, structured data, and social preview assets.

### Definition of done
- [x] ExitScan and RetentieScan are clearly different in visual emphasis and commercial message.
- [x] Each product page can stand alone in a sales conversation.
- [x] Combination is framed as a portfolio route, not as a vague extra option.
- [x] Product pages are visually richer than the current shell-driven structure.

### Milestone 4 completion status
- Completed:
  - Rebuilt ExitScan, RetentieScan, and Combinatie product pages with product-specific sections, proof structure, and CTA framing.
  - Reduced template sameness by giving ExitScan a more retrospective proof layout, RetentieScan a more forward-looking signal layout, and Combinatie a route-based portfolio story.
  - Kept product-specific metadata, structured data, and social preview assets intact on the canonical `/producten/[slug]` routes.
  - Left upcoming product pages accessible but outside the linked live conversion flow.
- Still open after this milestone:
  - All Milestone 5 work and beyond.
  - `/producten`, `/aanpak`, `/tarieven`, and footer still need their dedicated commercial refinement pass in Milestone 5.
  - Proof assets are still largely synthetic and need Milestone 6 work.
- New follow-ups discovered in this milestone:
  - [ ] Consider eventually deciding whether upcoming product routes should stay public placeholders or redirect to `/producten`.
  - [ ] Consider adding product-specific downloadable sample reports once proof collateral is available.
- Validation executed:
  - `npm.cmd run lint` in `frontend`.
  - `npm.cmd run build` in `frontend`.

---

## Milestone 5 - Product Overview, Aanpak, Tarieven, Contact
Dependency: Milestone 1 and Milestone 2

### Tasks
- [x] Rework `/producten` into a concise buyer-oriented overview page rather than a mixed live/future catalog.
- [x] Rebuild `/aanpak` to focus on process clarity and buying confidence:
  - intake
  - execution
  - reporting
  - follow-up
- [x] Rebuild `/tarieven` so it clearly sells the current commercial model:
  - ExitScan baseline / live
  - RetentieScan baseline / repeat
  - combination logic
- [x] Make pricing cards cleaner and more commercial, inspired by SaaS section conventions without pretending this is a pure self-serve tool.
- [x] Tighten contact-form framing so it reflects product choice and commercial next step.
- [x] Ensure footer reinforces only the current live commercial structure.

### Definition of done
- [x] `/producten`, `/aanpak`, and `/tarieven` each have a distinct purpose and no major content overlap.
- [x] Pricing is understandable without a guided explanation.
- [x] Contact flow feels like the logical endpoint of the public site.
- [x] Footer and cross-links support the same two-product sales story.

### Milestone 5 completion status
- Completed:
  - Kept `/producten` focused on the two live products plus combination, without future-catalog clutter.
  - Sharpened `/aanpak` into a clearer commercial process page with intake, datavoorbereiding, uitvoering, rapport, and opvolging logic.
  - Rebuilt `/tarieven` into cleaner pricing bands and package explanation for ExitScan, RetentieScan, and combination logic.
  - Tightened contact-form framing so leads enter through product choice first and then talk about aanpak and prijs.
  - Left the footer aligned to the current two-product commercial structure only.
- Still open after this milestone:
  - All Milestone 6 work and beyond.
  - Proof media still needs a dedicated upgrade in Milestone 6.
  - Mobile/accessibility/SEO final QA still needs Milestone 7.
- New follow-ups discovered in this milestone:
  - [ ] Consider adding one compact pricing comparison strip on the homepage if later conversion testing shows visitors still jump straight to `/tarieven`.
  - [ ] Consider adding contact-form intent presets only if a later user test shows the free-text field is too open-ended.
- Validation executed:
  - `npm.cmd run lint` in `frontend`.
  - `npm.cmd run build` in `frontend`.

---

## Milestone 6 - Visual Proof, Media, And Trust Assets
Dependency: Milestone 3 and Milestone 4

### Tasks
- [x] Upgrade the current preview/demo presentation so it feels less like a generic placeholder and more like intentional product proof.
- [x] Decide which proof assets are needed:
  - product mockups
  - dashboard snapshots
  - report excerpts
  - pricing visuals
  - flow diagrams
- [x] Add or improve OG images for homepage and core product pages.
- [x] Add lightweight trust/proof sections that can be truthful even without client logos:
  - privacy framing
  - hosted in Europe
  - management-ready output
  - guided implementation
- [x] Make screenshot-based or mockup-based visuals consistent across homepage and product pages.

### Definition of done
- [x] The site shows meaningful visual proof instead of mostly abstract explanation.
- [x] The same visual asset language is used across homepage and product pages.
- [x] Social sharing previews look product-specific and polished.

### Milestone 6 completion status
- Completed:
  - Upgraded the shared preview/demo presentation into a more intentional proof component with dashboard mockup, report excerpt notes, and segment-preview media.
  - Reused the same proof language across homepage and product pages.
  - Added a generated homepage Open Graph image and kept product-specific Open Graph images active on the core product pages.
  - Strengthened truthful trust/proof framing around guided implementation, management-ready output, and European hosting.
- Still open after this milestone:
  - All Milestone 7 work.
  - Proof is now stronger, but still not client-case-based; testimonial/case proof remains outside the current scope.
- New follow-ups discovered in this milestone:
  - [ ] Consider replacing synthetic proof modules with client-safe report crops once those assets exist.
  - [ ] Consider adding a dedicated proof/media library page only if later sales use cases justify it.
- Validation executed:
  - `npm.cmd run lint` in `frontend`.
  - `npm.cmd run build` in `frontend`.

---

## Milestone 7 - Mobile UX, Accessibility, SEO, QA
Dependency: Milestones 3-6

### Tasks
- [x] Review and refine mobile header, mobile menu, CTA placement, and page rhythm across all public pages.
- [x] Ensure comparison tables and dense sections degrade well on mobile.
- [x] Run accessibility review on:
  - heading hierarchy
  - focus states
  - contrast
  - keyboard nav
  - form labels
- [x] Complete SEO pass for public pages:
  - metadata consistency
  - canonical correctness
  - product-specific OG images
  - structured data
  - breadcrumbs
- [x] Run final commercial QA:
  - product distinction
  - no repeated text blocks
  - no future-product leakage into current sales path
  - no encoding issues
- [x] Validate build and lint.

### Definition of done
- [x] Public pages are usable and coherent on mobile.
- [x] Accessibility issues with obvious commercial impact are resolved.
- [x] SEO metadata and structured data are complete for homepage and current product pages.
- [x] Final QA confirms the site is commercially coherent around exactly two live products.

### Milestone 7 completion status
- Completed:
  - Added mobile-friendly comparison table behavior so dense comparison content degrades into stacked cards on small screens.
  - Added visible `:focus-visible` treatment for links, buttons, and form controls across the public site.
  - Completed metadata, canonical, Open Graph, structured-data, and breadcrumb coverage for homepage, product overview, aanpak, tarieven, and live product pages.
  - Ran a final commercial QA pass focused on the two-product sales story, mobile menu behavior, and remaining encoding issues.
- Still open after this milestone:
  - No open milestone work remains in this plan.
  - Any further refinements should now be treated as follow-up work rather than this redesign baseline.
- New follow-ups discovered in this milestone:
  - [ ] Consider an explicit browser-level QA pass on Safari/iPhone once that environment is available.
  - [ ] Consider validating social card rendering with external preview tools after deployment.
- Validation executed:
  - `npm.cmd run lint` in `frontend`.
  - `npm.cmd run build` in `frontend`.
  - Local mobile QA screenshots generated at:
    - `%TEMP%\\verisight-qa-home.png`
    - `%TEMP%\\verisight-qa-producten.png`
    - `%TEMP%\\verisight-qa-retentie.png`
    - `%TEMP%\\verisight-qa-tarieven.png`
    - `%TEMP%\\verisight-qa-home-menu-open.png`
  - Local Playwright check confirmed the mobile menu opens and exposes both `Alle producten` and `Inloggen`.

---

## Execution Breakdown By Subsystem

### Content And IA
- [x] Centralize marketing copy/config
- [x] Remove future-product emphasis from current sales flow
- [x] Rewrite repetitive homepage and supporting-page text
- [x] Align CTA language across all public pages

### Visual Components
- [x] Build reusable hero, proof, comparison, pricing, CTA, and testimonial/trust sections
- [x] Replace repeated generic card grids with mixed section patterns
- [x] Standardize product-specific accent system

### Page Work
- [x] Homepage
- [x] Product overview
- [x] ExitScan
- [x] RetentieScan
- [x] Combinatie
- [x] Aanpak
- [x] Tarieven
- [x] Contact/footer polish

### SEO And Trust
- [x] Product-specific metadata
- [x] Product-specific OG assets
- [x] Structured data
- [x] Breadcrumbs
- [x] Public trust/proof layer

---

## Test Plan
- [x] Homepage renders with no duplicated primary message across hero, comparison, and proof sections.
- [x] `Producten` nav points to the current live product architecture.
- [x] `/producten/exitscan` and `/producten/retentiescan` are visually distinct and copy-distinct.
- [x] `/producten/combinatie` is clearly secondary and portfolio-oriented.
- [x] `/aanpak` and `/tarieven` no longer repeat homepage language.
- [x] Mobile menu works for homepage and product pages.
- [x] No encoding artifacts remain in rendered public content.
- [x] Lint passes.
- [x] Production build passes.
- [x] Metadata and schema exist for homepage and live product pages.
- [x] OG images resolve for homepage and live product pages.

---

## Open Questions
- [ ] Should upcoming product routes remain publicly accessible but unlinked, or should they redirect away for now?
- [ ] Do we want testimonials/cases on the first commercial pass, or only once there is stronger proof material?
- [ ] Should the combination route remain a full page, or become a supporting section under `/producten` plus CTA?
- [ ] Do we want pricing to remain exact/public, or partially framed with “vanaf” and conversation-led packaging?
- [ ] Should the homepage hero include a static composed mockup, a richer slider, or a custom product comparison visual?

---

## Follow-up Ideas
- [ ] Add a small case library or example library once client-safe material exists.
- [ ] Add product-specific downloadable sample reports.
- [ ] Add richer motion and transition polish after the core visual system is stable.
- [ ] Add product-specific blog/content hooks if Verisight starts publishing thought leadership.
- [ ] Add a small proof section for methodology and privacy with stronger visual storytelling.
- [ ] Consider eventually removing or redirecting public `/producten/[slug]` pages for upcoming products if they keep existing outside the linked sales flow.
- [ ] Consider moving contact-form framing copy into the same central content layer if later milestones need even tighter CTA governance.

---

## Out Of Scope For Now
- [ ] Dashboard redesign
- [ ] Auth-flow redesign
- [ ] Survey UI redesign
- [ ] New products beyond ExitScan and RetentieScan
- [ ] CMS integration
- [ ] Multi-language support
- [ ] Backend/API refactors unrelated to the public site
- [ ] Major legal-content rewrite beyond visual and structural polish

---

## Defaults Chosen
- `PLANS.md` should live at repo root.
- The marketing site is optimized for **two live products**, not for a broad product catalog.
- Future products remain technically possible, but not part of the current primary sales UX.
- The site should borrow the **clarity, hierarchy, and polish rhythm** of the TailGrids-style reference, but keep Verisight’s own product language and not become a generic SaaS clone.
- No backend/API contract changes are required unless implementation uncovers an unexpected dependency in product metadata or contact flow.
