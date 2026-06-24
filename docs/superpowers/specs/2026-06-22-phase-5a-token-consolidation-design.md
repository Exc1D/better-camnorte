# Phase 5a — Token Consolidation

**Date:** 2026-06-22
**Status:** Approved (design)
**Part of:** Phase 5 (Restyle), sequenced as 5a → 5b restyle → 5c perf/i18n → 5d contrast.

## Problem

Design tokens have two competing sources of truth, violating web-principle #7
("the system is the source of truth"):

- `assets/css/style.css` `:root` (loaded by all 18 content pages) defines
  `--color-primary`/`--color-primary-dark`, the full `--sdg-1..17` palette,
  neutrals, spacing, radius, shadows, `--font-main`.
- `assets/css/home-redesign.css` `:root` (homepage only) defines a _second_,
  overlapping set: `--navy`, `--gold(/-soft/-deep)`, `--maroon`, `--ink`,
  `--ink-soft`, `--display` (+ `--serif`/`--wide` aliases).

The same provincial navy is expressed twice (`--color-primary-dark: #002170`
and `--navy: #002170`), and there is no single place to read or change a token.
5b (the bolder restyle) needs one token surface to restyle against.

## Goal

Exactly one `:root` token block, in the file every page already loads. **No
visible change** — this is a pure relocate-and-dedupe refactor. Renaming or
revaluing tokens (e.g. deciding which navy "wins where") is explicitly out of
scope; that is a 5b decision.

## Approach (lean — approved)

`style.css`'s `:root` becomes the single canonical token block.

1. **Fold** `home-redesign.css`'s unique tokens into `style.css`'s `:root`,
   values byte-for-byte unchanged:
   - `--gold: #e0a431`, `--gold-soft: #f3c969`, `--gold-deep: #a9760f`
   - `--maroon: #7a1f2b`
   - `--navy: #002170` (identical to the existing `--color-primary-dark` — an
     alias, not a new value)
   - `--ink: oklch(0.32 0.04 264)`, `--ink-soft: oklch(0.48 0.03 264)`
   - `--display: 'Source Sans 3', 'Inter', system-ui, sans-serif` (identical to
     the existing `--font-main`), `--serif: var(--display)`, `--wide: var(--display)`
2. **Delete** the `:root { … }` block from `home-redesign.css` (lines ~11–24).
   Its per-section `--sdg` mappings and all component CSS stay untouched.
3. **Mark** the consolidated block with a banner comment
   (`/* === DESIGN TOKENS — single source of truth (Phase 5a) === */`) so it is
   findable inside the 187 KB file.

The `--sdg-1..17` palette and the `.section { --sdg: var(--sdg-N) }` mappings are
already single-sourced (palette in `style.css`, mappings in `home-redesign.css`
where they are consumed) — left as-is.

### Rejected alternative

A dedicated `assets/css/tokens.css` + a shared `_includes/head-styles.njk`
partial emitting every `<link>` (which would also fix the mixed
`../assets/` / `/assets/` / `assets/` path prefixes). Cleaner long-term, but it
is an 18-page edit 5a does not need. Revisit in 5c, when per-page `<link>`
duplication starts to bite.

## Net diff

- `style.css`: `:root` gains ~8 token lines + a banner comment.
- `home-redesign.css`: loses its `:root` block.
- Zero new files, zero new `<link>`s, zero page-template edits.

## Verification

Pass condition: **pixel-identical** before/after.

- Live `eleventy --serve` preview (running). Screenshot the homepage (which
  consumes both token sets) plus 3 representative pages (a transparency page, the
  statistics page, a legal page) before and after; diff visually.
- Confirm no console errors and that `--navy`/`--gold`/`--ink`/`--display`
  still resolve on the homepage (computed-style spot check via `preview_eval`).

## Out of scope (later in Phase 5)

- 5b: the bolder restyle (type scale, spacing rhythm, hero, neutral-base
  discipline, choosing which navy is primary, propagating site-wide).
- 5c: the perf gate + the 264 KB-gz `translations.js` diet.
- 5d: the AA-contrast gate for SDG accents.
