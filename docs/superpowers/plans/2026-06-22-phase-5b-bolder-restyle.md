# Phase 5b — Bolder Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a bolder, neutral-based identity (principle #6) and a hybrid watchdog hero (principle #1) to the shared chrome, homepage, and the transparency + statistics flagship pages — building on 5a's single `:root` token surface.

**Architecture:** Add design tokens to the 5a `:root` in `style.css`, then restyle by *applying* those tokens to existing selectors. Appearance changes on purpose; the invariant is "intended change + nothing broken" (figures/charts still render, AA contrast holds, no console errors). The hero's visible copy is i18n-driven (`translations.js`) with njk fallbacks — both are updated.

**Tech Stack:** Plain CSS custom properties, Nunjucks templates, a JS translation map. Verification via the running `eleventy --serve` preview (serverId from `preview_list`): screenshots, `preview_inspect` for contrast, `preview_console_logs`.

**Integrity constraint (carried from Phase 4):** do not invent values. The hero stat uses the real `data/dpwh-projects.json` figure (₱409,494,730.55 / 63 projects). FIL/ILO translation strings are only written where they can be authored accurately; otherwise they are flagged for native-speaker review, not fabricated.

---

## Task 1: Add the 5b design tokens

**Files:**
- Modify: `assets/css/style.css` (the 5a `:root`, after the folded `--wide` line)

- [ ] **Step 1: Capture baseline homepage screenshot**

`preview_list` → confirm `eleventy` server, note serverId. `preview_resize` width 1280 height 860. Navigate to `http://localhost:8765/`, `preview_screenshot`. Keep as "before".

- [ ] **Step 2: Append the token block to the `:root`**

In `assets/css/style.css`, immediately after the `--wide: var(--display);` line (end of the 5a folded block), insert:

```css

  /* === Phase 5b: neutral scale, type scale, section spacing === */
  --n-0: #ffffff;
  --n-50: #f8f9fa;
  --n-100: #f0f2f5;
  --n-200: #e5e7eb;
  --n-300: #cbd2da;
  --n-400: #9aa3ad;
  --n-500: #6b7280;
  --n-600: #4b5563;
  --n-700: #374151;
  --n-800: #1f2733;
  --n-900: #141a22;

  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
  --text-2xl: 1.95rem;
  --text-3xl: 2.5rem;
  --text-display: clamp(3rem, 9vw, 7rem);

  --weight-body: 400;
  --weight-head: 600;
  --weight-display: 800;

  --spacing-2xl: 64px;
  --spacing-3xl: 96px;
```

- [ ] **Step 3: Verify tokens resolve and nothing shifted yet**

Navigate to `http://localhost:8765/`, `preview_eval`:

```js
(() => { const s = getComputedStyle(document.documentElement);
  return ['--n-0','--n-100','--n-900','--text-base','--text-display','--spacing-3xl'].map(v=>v+' = '+s.getPropertyValue(v).trim()).join('\n'); })()
```

Expected: each resolves (e.g. `--n-900 = #141a22`, `--text-display = clamp(3rem, 9vw, 7rem)`). `preview_screenshot` — must still match Task 1 Step 1 (tokens are defined but unused, so no visual change yet).

- [ ] **Step 4: Commit**

Write message to `/tmp/5b-1.txt`, then:

```bash
git add assets/css/style.css && git commit -F /tmp/5b-1.txt
```

Message: `feat: add 5b design tokens (neutral scale, type scale, spacing) [no visual change]`

---

## Task 2: Neutralize the emergency hotline bar

The full-width red bar is shared chrome: its `.hotline-bar` markup is duplicated into every page's
`.njk` and styled once in `assets/css/style.css`. Demote it to neutral-dark (principle #6: no large
non-SDG fills) — the single CSS rule change propagates to every page.

**Files:**
- Modify: the `.hotline-bar` CSS rule in `assets/css/style.css` (its current red `background`)

- [ ] **Step 1: Locate the bar**

Run: `grep -rniE "0927 400 8033|Police|emergency|hotline" src/` to confirm the markup + its wrapper class. Then `grep -rn "\.hotline-bar" assets/css/` to find the CSS rule and its current red `background`.

- [ ] **Step 2: Recolour to neutral-dark**

In the bar's CSS rule, replace the red `background` (a red hex or `var(--sdg-1)`/`#d62828`/`#e5243b`-family value) with `background: var(--n-900);` and ensure the text/icon colour is `var(--n-0)` (white) for AA contrast. Leave layout, spacing, and the phone numbers unchanged.

- [ ] **Step 3: Verify contrast + appearance**

Navigate to `http://localhost:8765/`. `preview_inspect` the bar's text element for `color` and its background — compute contrast of text on `#141a22`; white-on-`#141a22` ≈ 16:1, passes AA. `preview_screenshot`: the top bar is now dark neutral, numbers legible, layout identical. `preview_console_logs` (error): none.

- [ ] **Step 4: Commit**

`git add` the changed file(s); commit `refactor: demote red hotline bar to neutral-dark (principle #6)`.

---

## Task 3: Reframe the hero markup (njk fallbacks, hrefs, CTAs, stat chip)

**Files:**
- Modify: `src/index.njk:214-260` (hero sky + earth blocks)

- [ ] **Step 1: Update eyebrow + lede fallback text**

In `src/index.njk`, replace the eyebrow inner text (line ~217) `Camarines Norte Provincial Government` with `Following the money · Cost to the people: ₱0`, and the lede inner text (lines ~244-245) `Government services, information, and resources, built around the people of Camarines Norte.` with `An independent watchdog tracking how Camarines Norte spends public money — every figure sourced and dated.` Keep the `data-i18n` attributes intact (i18n strings updated in Task 4).

- [ ] **Step 2: Add the sourced stat chip**

In `src/index.njk`, immediately after the `</p>` closing the `hero__lede` (line ~246), insert:

```html
            <p class="hero__stat">
              <a href="transparency/">
                <strong>₱409.5M</strong> across <strong>63</strong> DPWH projects tracked
              </a>
              <span class="hero__stat-src">Source: DPWH — Camarines Norte District Engineering Office</span>
            </p>
```

- [ ] **Step 3: Rewrite the two CTAs**

Replace the `hero__actions` block (lines ~249-257) with:

```html
            <div class="hero__actions">
              <a href="transparency/" class="hero__btn hero__btn--primary" data-i18n="hero-cta-primary">
                See the money
                <i class="bi bi-arrow-right" aria-hidden="true"></i>
              </a>
              <a href="transparency/#sources" class="hero__btn hero__btn--ghost" data-i18n="hero-cta-secondary"
                >How we source this</a
              >
            </div>
```

- [ ] **Step 4: Verify (fallbacks render, links resolve)**

The i18n strings don't exist yet for the new keys, so the fallback text shows. Navigate to `http://localhost:8765/`, `preview_snapshot` — confirm the eyebrow, lede, stat chip ("₱409.5M across 63 DPWH projects tracked"), and both CTAs render with the new text. `preview_eval` `document.querySelector('.hero__stat a').getAttribute('href')` → `transparency/`. No commit yet (styling in Task 5).

---

## Task 4: Update the hero i18n strings

**Files:**
- Modify: `assets/js/translations.js` (the `hero-eyebrow`, `hero-subtitle` keys; add `hero-cta-primary`, `hero-cta-secondary`)

- [ ] **Step 1: Find the existing hero keys**

Run: `grep -nE "hero-eyebrow|hero-subtitle|home-contact-us" assets/js/translations.js`. Note the structure (one object per language: `en`, `fil`, `ilo` or similar).

- [ ] **Step 2: Update English strings**

In the `en` block, set:
- `hero-eyebrow`: `Following the money · Cost to the people: ₱0`
- `hero-subtitle`: `An independent watchdog tracking how Camarines Norte spends public money — every figure sourced and dated.`
- add `hero-cta-primary`: `See the money`
- add `hero-cta-secondary`: `How we source this`

- [ ] **Step 3: Update Filipino strings (accurate translation)**

In the `fil` block, set:
- `hero-eyebrow`: `Sinusundan ang pera · Halaga sa mamamayan: ₱0`
- `hero-subtitle`: `Isang malayang bantay na sinusubaybayan kung paano ginagastos ng Camarines Norte ang pondo ng publiko — bawat datos may pinagmulan at petsa.`
- `hero-cta-primary`: `Tingnan ang pera`
- `hero-cta-secondary`: `Paano namin ito pinagkukunan`

- [ ] **Step 4: Ilocano — flag for native review, do NOT fabricate**

In the `ilo` block, set the four keys to the **English** strings from Step 2 as a safe fallback, and add a `// TODO(i18n): Ilocano translation needs native-speaker review` comment beside them. (Showing English to an Ilocano reader is honest; inventing shaky Ilocano is not.) Record this in the redesign plan's open-items list.

- [ ] **Step 5: Verify each language renders**

Navigate to `http://localhost:8765/`. For each lang button (EN/FIL/ILO), `preview_click` it, then `preview_snapshot` the hero — confirm eyebrow/lede/CTA show the expected strings (English appears for ILO). `preview_console_logs` (error): none.

- [ ] **Step 6: Commit**

`git add src/index.njk assets/js/translations.js`; commit `feat: reframe hero copy toward watchdog framing + sourced DPWH stat`.

---

## Task 5: Style the hero (neutral base, type tokens, gold accent, stat chip)

**Files:**
- Modify: `assets/css/home-redesign.css` (hero rules)

- [ ] **Step 1: Read current hero CSS**

Read `assets/css/home-redesign.css` hero section (the `.hero`, `.hero__title*`, `.hero__lede`, `.hero__btn*`, `.hero__horizon-label` rules) to get exact current selectors/values.

- [ ] **Step 2: Apply neutral base + type tokens**

Edit the hero rules so that:
- `.hero__title-line--sans` (the "ng Camarines Norte" line) colour changes from maroon (`var(--maroon)` / `#7a1f2b`) to `var(--ink)`.
- `.hero__title` font-size uses `var(--text-display)` and `font-weight: var(--weight-display)`.
- `.hero__lede` uses `font-size: var(--text-lg)` and `color: var(--ink-soft)`.
- Gold stays only on `.hero__horizon-star`, `.hero__btn--primary` background, and the eyebrow star (sanctioned accent — do not change these).

- [ ] **Step 3: Add stat-chip styling**

Append rules:

```css
.hero__stat {
  margin: var(--spacing-sm) 0 var(--spacing-md);
  font-size: var(--text-base);
  color: var(--ink);
}
.hero__stat a { color: inherit; text-decoration: none; border-bottom: 2px solid var(--gold); }
.hero__stat strong { font-weight: var(--weight-display); }
.hero__stat-src { display: block; font-size: var(--text-sm); color: var(--ink-soft); margin-top: 2px; }
```

- [ ] **Step 4: Verify hero appearance + contrast**

Navigate to `http://localhost:8765/`. `preview_screenshot` — wordmark bold, subtitle now neutral ink (not maroon), stat chip with gold underline, gold CTA intact. `preview_inspect` `.hero__lede` `color` and `.hero__stat-src` `color` against their background — both ≥ 4.5:1 on the light hero. `preview_console_logs` (error): none.

- [ ] **Step 5: Commit**

`git add assets/css/home-redesign.css`; commit `style: neutral-base hero with type-scale tokens + stat chip`.

---

## Task 6: Apply type scale + spacing rhythm + neutral surfaces to homepage sections

**Files:**
- Modify: `assets/css/home-redesign.css` and/or `assets/css/style.css` (homepage `.section`, `.home-section-header`, section heading/body rules)

- [ ] **Step 1: Read current section rules**

Read the `.section`, `.home-section-header`, and section-title/lead rules in `home-redesign.css` and `style.css`. Note current padding and heading sizes.

- [ ] **Step 2: Apply tokens**

- Section vertical padding → `var(--spacing-3xl)` top/bottom (was a smaller fixed value).
- Section headings → `font-size: var(--text-3xl); font-weight: var(--weight-display);`
- Sub-heads/section leads → `var(--text-lg)`, `color: var(--ink-soft)`.
- Section background surfaces that used ad-hoc grays (`#f8f9fa`, `#f0f2f5`) → the matching `var(--n-50)` / `var(--n-100)` (same value, named).
- Leave the per-section `--sdg` seam accents untouched.

- [ ] **Step 3: Verify**

Navigate to `http://localhost:8765/`. `preview_screenshot` full page (scroll via `preview_eval window.scrollTo(0, N)` for lower sections) — headings larger/bolder, more section breathing room, surfaces unchanged in colour. `preview_console_logs` (error): none.

- [ ] **Step 4: Commit**

`git add` changed CSS; commit `style: type scale + spacing rhythm across homepage sections`.

---

## Task 7: Restyle the transparency + statistics flagship bodies

**Files:**
- Modify: `assets/css/transparency.css`, `assets/css/transparency-v2.css`, `assets/css/statistics.css`

- [ ] **Step 1: Read each stylesheet's headings/surfaces/spacing**

For each of the three files, read the page-title, card/panel, table, and section rules; note ad-hoc hex (greys, blues) and fixed font sizes.

- [ ] **Step 2: Apply tokens (no layout/data changes)**

In each file:
- Page + section headings → `var(--text-3xl)` / `var(--text-2xl)`, `var(--weight-display)`.
- Body/captions → `var(--text-base)` / `var(--text-sm)`, `color: var(--ink)` / `var(--ink-soft)`.
- Card/panel surfaces using ad-hoc grays → `var(--n-0)` / `var(--n-50)` / `var(--n-100)` borders `var(--n-200)`.
- Primary-coloured UI (links, active states) → `var(--color-primary)`.
- Section padding → `var(--spacing-2xl)`/`var(--spacing-3xl)`.
- Do NOT touch chart canvases, data tables' structure, or `.data-source` citation blocks' content.

- [ ] **Step 3: Verify both pages render + charts draw**

Navigate to `http://localhost:8765/transparency/` then `http://localhost:8765/statistics/`. For statistics, `preview_eval`:

```js
['cmciOverviewChart','populationBarChart','historicalLineChart','distributionPieChart'].map(id=>{const c=Chart.getChart(id);return id+': '+(c?c.data.datasets.length+' datasets':'MISSING');}).join('\n')
```

Expected: every chart present (non-`MISSING`). `preview_screenshot` each page — bolder headings, neutral surfaces, figures + citations intact. `preview_console_logs` (error): none on either page.

- [ ] **Step 4: Commit**

`git add` the three CSS files; commit `style: apply restyle tokens to transparency + statistics bodies`.

---

## Task 8: Cross-page + mobile + contrast audit, then final commit

**Files:** none until the redesign-plan update + commit.

- [ ] **Step 1: Inherit-only page didn't break**

Navigate to `http://localhost:8765/terms/` (a page NOT in 5b scope). `preview_screenshot` — confirm the new chrome (neutral hotline bar if present, restyled header/footer) propagated and the body still renders cleanly (no broken layout from token changes). `preview_console_logs` (error): none.

- [ ] **Step 2: Mobile pass**

`preview_resize` width 375 height 812. Re-screenshot homepage, transparency, statistics. Confirm hero, stat chip, and sections reflow without overflow or overlap. Reset to 1280×860.

- [ ] **Step 3: Contrast audit (principle #6 / pre-5d)**

For each new text/accent pair, `preview_inspect` the element's `color` + effective background and confirm ratio: hero eyebrow, hero lede, hero stat + stat-src, neutralized hotline-bar text, primary-CTA label on gold, restyled section headings. Body text ≥ 4.5:1, large/UI ≥ 3:1. Record any pair that fails and fix its token usage before proceeding.

- [ ] **Step 4: Update the redesign plan**

In `docs/redesign-plan.md`, mark Phase 5 progress: 5a + 5b done (chrome + homepage + flagship pages restyled, neutral base applied, hybrid hero shipped); note open items — other page bodies still to restyle, and the Ilocano hero strings awaiting native review (from Task 4 Step 4).

- [ ] **Step 5: Final commit**

`git add docs/redesign-plan.md`; commit `docs: record Phase 5b restyle complete + open items`.

---

## Done when

- Hotline bar is neutral-dark; hero is the hybrid watchdog version with the real sourced DPWH stat; homepage, transparency, statistics carry the type scale / spacing rhythm / neutral surfaces; chrome propagated to inherit-only pages without breaking them.
- All restyled pages pass AA contrast on new pairs, render with no console errors, and statistics charts still draw — on desktop and mobile.
- Ilocano hero strings flagged (not fabricated); open restyle items recorded.

Next: **5c — perf gate + the 264 KB-gz `translations.js` diet**, then **5d — the build-failing AA-contrast gate** that mechanizes Task 8 Step 3.
