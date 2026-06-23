# Phase 5a — Token Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the two competing `:root` token blocks (`style.css` + `home-redesign.css`) into one canonical block in `style.css`, with zero visible change.

**Architecture:** Pure relocate-and-dedupe. `style.css`'s `:root` (already loaded on every page) absorbs the home-redesign-only tokens byte-for-byte; `home-redesign.css`'s `:root` is deleted. No token is renamed or revalued — that is Phase 5b. The pass condition is pixel-identical before/after.

**Tech Stack:** Plain CSS custom properties. Verification via the running `eleventy --serve` preview (serverId from `preview_list`) — screenshots + `getComputedStyle` checks. No test framework.

---

### Task 1: Capture the before-state baseline

The invariant this refactor must preserve: every page looks identical, and the homepage's home-redesign tokens still resolve. Capture that baseline first so "after" can be diffed against it.

**Files:** none (read-only verification).

- [ ] **Step 1: Confirm the preview server is running**

Run the `preview_list` tool. Expect one server named `eleventy` on port 8765, status `running`. If absent, run `preview_start` with name `eleventy`. Note the `serverId` for all later preview calls.

- [ ] **Step 2: Set a stable desktop viewport**

Call `preview_resize` with `width: 1280, height: 860` (the named `desktop` preset reset to native/narrow in testing — pass explicit dimensions).

- [ ] **Step 3: Screenshot the four baseline pages**

For each URL, navigate then screenshot:
- `http://localhost:8765/` (homepage — the only consumer of both token sets)
- `http://localhost:8765/transparency/` (a `style.css`-only page) — if that path 404s, use the actual transparency page path found via `preview_snapshot` of the homepage nav
- `http://localhost:8765/statistics/`
- `http://localhost:8765/terms/` (a legal page)

Navigate with `preview_eval`, expression: `window.location.href='<url>'; '<url>'`. Then `preview_screenshot`. Keep all four images as the "before" reference.

- [ ] **Step 4: Record the homepage's computed token values**

Navigate to `http://localhost:8765/`, then `preview_eval` with:

```js
(() => {
  const s = getComputedStyle(document.documentElement);
  return ['--navy','--gold','--gold-soft','--gold-deep','--maroon','--ink','--ink-soft','--display','--serif','--wide','--color-primary','--color-primary-dark','--font-main','--sdg-9']
    .map(v => v + ' = ' + s.getPropertyValue(v).trim()).join('\n');
})()
```

Expected (non-empty for every name): `--navy = #002170`, `--gold = #e0a431`, `--ink = oklch(0.32 0.04 264)`, `--display = 'Source Sans 3', 'Inter', system-ui, sans-serif`, `--color-primary = #0032a0`, etc. Save this output — it is the resolution invariant.

- [ ] **Step 5: Confirm no console errors**

`preview_console_logs` (level error). Expected: "No console logs".

---

### Task 2: Fold the home-redesign tokens into `style.css` and mark the block

**Files:**
- Modify: `assets/css/style.css:1-2` (banner comment) and `assets/css/style.css:26-27` (insert folded tokens)

- [ ] **Step 1: Add a banner comment above the `:root`**

In `assets/css/style.css`, the file currently begins:

```css
/* BetterCamNorte - Complete Main Stylesheet */
:root {
```

Replace those two lines with:

```css
/* BetterCamNorte - Complete Main Stylesheet */
/* === DESIGN TOKENS — single source of truth (Phase 5a). All custom properties
   live here; home-redesign.css consumes them, it no longer redefines them. === */
:root {
```

- [ ] **Step 2: Insert the folded tokens after the shadow tokens**

In `assets/css/style.css`, find these two lines (currently lines 25-26):

```css
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
```

Immediately after `--shadow-md`, insert:

```css

  /* Folded from home-redesign.css (Phase 5a) — values unchanged.
     --navy is identical to --color-primary-dark; --display to --font-main. */
  --navy: #002170;
  --gold: #e0a431;
  --gold-soft: #f3c969;
  --gold-deep: #a9760f;
  --maroon: #7a1f2b;
  --ink: oklch(0.32 0.04 264);
  --ink-soft: oklch(0.48 0.03 264);
  --display: 'Source Sans 3', 'Inter', system-ui, sans-serif;
  --serif: var(--display);
  --wide: var(--display);
```

- [ ] **Step 3: Sanity-check the file still parses**

Run: `node -e "const c=require('fs').readFileSync('assets/css/style.css','utf8'); const o=(c.match(/{/g)||[]).length, x=(c.match(/}/g)||[]).length; if(o!==x) throw new Error('brace mismatch '+o+' vs '+x); console.log('braces balanced:',o)"`

Expected: `braces balanced: <n>` with no throw. (Catches a truncated/odd edit before touching the second file.)

---

### Task 3: Delete the now-duplicate `:root` from `home-redesign.css`

**Files:**
- Modify: `assets/css/home-redesign.css:11-24` (remove the `:root { … }` block)

- [ ] **Step 1: Remove the `:root` block**

In `assets/css/home-redesign.css`, delete the entire block (currently lines 11-24):

```css
:root {
  /* Monument-derived accents (the hero star) */
  --gold: #e0a431;
  --gold-soft: #f3c969;
  --gold-deep: #a9760f;
  --maroon: #7a1f2b;
  --navy: #002170;

  --ink: oklch(0.32 0.04 264);
  --ink-soft: oklch(0.48 0.03 264);
  --display: 'Source Sans 3', 'Inter', system-ui, sans-serif;
  --serif: var(--display); /* legacy aliases now resolve to the SDG face */
  --wide: var(--display);
}
```

Leave the file's header comment (lines 1-9) and the per-section `--sdg` mappings (the `.appointment-cta-section { --sdg: var(--sdg-16); }` block onward) untouched. Leave one blank line where the `:root` block was.

- [ ] **Step 2: Confirm `home-redesign.css` no longer defines tokens but still maps sections**

Run: `grep -nE '^\s*:root|--sdg:' assets/css/home-redesign.css | head`

Expected: NO `:root` line; the `--sdg: var(--sdg-N)` mapping lines still present.

- [ ] **Step 3: Brace sanity check**

Run: `node -e "const c=require('fs').readFileSync('assets/css/home-redesign.css','utf8'); const o=(c.match(/{/g)||[]).length, x=(c.match(/}/g)||[]).length; if(o!==x) throw new Error('brace mismatch '+o+' vs '+x); console.log('braces balanced:',o)"`

Expected: `braces balanced: <n>`, no throw.

---

### Task 4: Verify pixel-identical + tokens resolve, then commit

**Files:** none until the commit step.

- [ ] **Step 1: Reload and re-screenshot the four baseline pages**

`eleventy --serve` hot-reloads CSS, but force it: for each of the four URLs from Task 1 Step 3, `preview_eval` `window.location.href='<url>'; location.reload(); '<url>'`, then `preview_screenshot`. Compare each against its Task 1 "before" image — they must be visually identical (same colours, type, layout).

- [ ] **Step 2: Re-record the homepage computed token values**

Navigate to `http://localhost:8765/`, run the exact same `preview_eval` snippet from Task 1 Step 4. Output must match the Task 1 baseline line-for-line: every token still resolves to the same value (in particular `--navy`, `--gold`, `--ink`, `--display`, `--serif`, `--wide` — the ones that moved).

- [ ] **Step 3: Confirm no console errors**

`preview_console_logs` (level error). Expected: "No console logs".

- [ ] **Step 4: Confirm exactly one `:root` defines these tokens repo-wide**

Run: `grep -rnE '^\s*:root' assets/css/ | grep -v 'accessibility.css\|responsive.css'`

Expected: only `assets/css/style.css` appears. (`accessibility.css` has a high-contrast-mode `:root` and `responsive.css` a media-query `:root` — both intentional and out of scope; the grep excludes them.)

- [ ] **Step 5: Commit**

```bash
git add assets/css/style.css assets/css/home-redesign.css
git commit -F /tmp/commit-5a.txt
```

Where `/tmp/commit-5a.txt` contains:

```
refactor: consolidate design tokens into one :root (Phase 5a)

home-redesign.css carried a second :root duplicating navy/gold/maroon/ink/
display — two sources of truth for the same design values (violates
principle #7). Fold those tokens into style.css's :root (the block every page
already loads), byte-for-byte, and delete the duplicate. --navy was identical
to --color-primary-dark and --display to --font-main, so nothing shifts.

No visible change: the homepage and three representative pages are
pixel-identical before/after, and every moved token still resolves to the same
value. This is the single token surface the Phase 5b restyle builds on.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

(Heredocs fail in this shell — write the message to `/tmp/commit-5a.txt` with the Write tool first, then run the commit as a standalone command.)

---

## Done when

- One `:root` defines the design tokens (in `style.css`); `home-redesign.css` only consumes + maps SDG sections.
- Four pages pixel-identical before/after; all moved tokens resolve unchanged; no console errors.
- Change committed.

Next: **Phase 5b — the bolder restyle**, which restyles against this single token surface (type scale, spacing rhythm, hero, neutral-base discipline, choosing which navy is primary, site-wide propagation).
