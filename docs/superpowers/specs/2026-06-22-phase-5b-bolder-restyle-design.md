# Phase 5b — Bolder Restyle

**Date:** 2026-06-22
**Status:** Approved (design)
**Part of:** Phase 5, after 5a (token consolidation, done). Followed by 5c (perf/i18n) and 5d (AA-contrast gate).
**Builds on:** the single `:root` token surface in `style.css` from 5a.

## Goal

A bolder, neutral-based visual identity that applies principle #6 (neutral base,
SDG colour as contained accent) and nudges the homepage from _portal_ toward
_transparency watchdog_ (principle #1) — without a structural rebuild. Unlike 5a,
this **does** change appearance.

## Scope

In this pass:

- **Shared chrome** — `header.njk` / `nav.njk` + `footer.css` (propagates to every page).
- **Homepage** — hero + all existing sections (`assets/css/home-redesign.css`, `src/index.njk`).
- **Flagship pages** — transparency and statistics page bodies + their CSS
  (`transparency.css` / `transparency-v2.css` / `statistics.css`).

Out of this pass: other page bodies (legal, FAQ, government, legislative, etc.)
inherit the new chrome + tokens but keep current body styling until a later pass.

## Design

### 1. Primary & neutral scale (tokens added to the 5a `:root` in `style.css`)

- Single provincial primary: `--color-primary: #0032a0` (unchanged). `#002170`
  (`--color-primary-dark` / `--navy`) is its dark variant, used for the hero ground.
- Add a neutral scale `--n-0 … --n-900` and re-point existing ad-hoc grays
  (`#e5e7eb`, `#f0f2f5`, `#f8f9fa`, `#666`, `#1a1a1a`, …) at the nearest step.
  Values chosen to match current grays so existing surfaces don't visibly shift;
  the scale exists so 5b's new surfaces use named neutrals, not new hex.

### 2. Type scale (tokens)

Source Sans 3 (already the loaded face). Modular ~1.25 scale:

```css
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.25rem;
--text-xl: 1.5rem;
--text-2xl: 1.95rem;
--text-3xl: 2.5rem;
--text-display: clamp(3rem, 9vw, 7rem); /* hero wordmark */
```

Weights: 400 body, 600 headings, 800 display. Headings and the hero wordmark
adopt these tokens; body stays `--text-base`.

### 3. Spacing rhythm (tokens)

Reuse `--spacing-xs…xl` (8/16/24/32/48). Add `--spacing-2xl: 64px`,
`--spacing-3xl: 96px`. Section vertical padding moves to `--spacing-3xl` for
breathing room.

### 4. Neutral-base discipline (principle #6)

- **Emergency hotline bar:** full-width red → slim **neutral-dark** utility bar
  (background `--n-900`/ink, text `--n-0`). Safety numbers stay; the large
  non-SDG red fill is removed. (This bar is in the shared chrome.)
- **Hero maroon subtitle ("ng Camarines Norte"):** maroon → `--ink` (neutral).
- **Gold:** kept as the single contained hero accent (the star) and the primary
  CTA fill — a sanctioned accent slot.
- **SDG per-section colours:** unchanged — already confined to section-seam
  accents via the `--sdg` mappings in `home-redesign.css`.
- **Audit:** no SDG/gold/maroon colour may be used as body text or as a large
  fill behind reading content after this pass (checked in 5d's gate; spot-checked
  here).

### 5. Hero — hybrid (keep identity, reframe copy)

Keep the monument image and the "Bantayog / ng Camarines Norte" wordmark.
Replace the portal copy in `src/index.njk`'s hero with watchdog framing. Proposed
copy (final wording may be tuned in implementation, but the _structure_ is fixed):

- Eyebrow: `FOLLOWING THE MONEY · COST TO THE PEOPLE: ₱0`
- Subhead (replaces "Access government services, information, and resources…"):
  `An independent watchdog tracking how Camarines Norte spends public money — every figure sourced and dated.`
- Sourced stat chip: `₱409.5M across 63 DPWH projects tracked` with a visible
  source label (`DPWH — Camarines Norte District Engineering Office`), linking to
  the transparency page. Figure is real (data/dpwh-projects.json summary:
  totalCost 409494730.55, totalProjects 63). **No invented figures.**
- CTAs: primary `See the money →` → transparency; secondary `How we source this`
  → the provenance/transparency explainer. Replaces the "Contact Us" portal CTA.

The hotlines/contact remain reachable from chrome + the contact section; only the
hero's _primary_ CTA changes.

### 6. Flagship page bodies

Transparency + statistics: adopt the type scale, spacing rhythm, neutral surfaces,
and primary/accent tokens. No data or layout-structure changes — figures and their
citations (from 5a/Phase 4) must still render. Statistics charts must still draw.

## Verification

Appearance changes, so the invariant is "intended change + nothing broken":

- **Before/after screenshots** of: homepage, transparency, statistics, and one
  inherit-only page (e.g. terms) to confirm chrome propagated and its body did NOT
  break. Desktop (1280×860) and mobile (375×812).
- **AA contrast** (`preview_inspect`) on every new text/background and text/accent
  pair introduced: hero subhead on light, stat chip text, neutralized hotline bar
  text on `--n-900`, CTA label on gold. Each ≥ 4.5:1 (body) / ≥ 3:1 (large/UI).
- **Statistics charts** still render (CMCI/population/historical), no console errors.
- **No console errors** on all restyled pages.

## Out of scope / flagged

- **Content cuts (principle #1):** homepage portal sections — appointment CTA,
  weather map, quiz CTA, Facebook feed — are candidates for deletion, but that's a
  content/IA decision, not this restyle. Flagged for a later pass.
- 5c: perf gate + the 264 KB-gz `translations.js` diet.
- 5d: the build-failing AA-contrast gate that mechanizes the §4 audit.
