# Redesign Plan — applying the web principles

The point-in-time punch-list for bringing today's site in line with
[web-principles.md](../web-principles.md). The principles are the timeless rules; this plan is how
we get there from here.

**Rollout:** foundation first, then restyle — migrate to the system with the *current* look
preserved and verified, then apply the new visual design. The site stays live throughout.

## Phase 0 — Resolve the blocking dependency

Official site: **[camsnorte.com](https://camsnorte.com/)**. The canonical services source is the
**Citizen's Charter** (`camsnorte.com/citizens-charter/`) — legally mandated under RA 11032 — with
`camsnorte.com/offices/` as a secondary. ⚠️ As of June 2026 both are thin placeholder pages (the
charter is a single 2022 image; the offices page is logos only). That content is the LGU's to
maintain, not this watchdog's.

- [x] Link the cut services section to the Citizen's Charter as the official source, accepting it is
      thin today (recommended — services aren't the watchdog's job; see *transparency watchdog*).
      Confirm before deleting `services/` + `service-details/`.

## Phase 1 — Cut scope · _Watchdog scope · ADR-0004_

- [x] Remove the weather widget (Open-Meteo) and the currency converter (ExchangeRate). Deleted
      `info-bar.js` + `weather-map.js`, the info-bar block on every page, the homepage weather column,
      and the `info-bar.js` precache entry in `sw.js` (cache bumped v5→v6). Kept the homepage's static
      OpenStreetMap iframe (no JS, free) and retitled its section "Map of Camarines Norte".
- [x] Remove `services/` and the ~24 `service-details/` pages; replace homepage service links with a
      single link out to the official LGU services URL. Deleted both dirs; rewired every dead link —
      homepage Citizen's Charter callout, the `government/` office cards (now plain cards, contacts
      kept), `sitemap/` + `sitemap.xml`, `faq/`, and the `404` page. Dropped the homepage hero search
      and its JSON-LD `SearchAction`.
- [x] Rewrite the README mission: drop the "services" lead; describe the site as a public-funds
      transparency watchdog.
- [~] Redesign primary navigation around the core: **Transparency/Budget · Projects (DPWH) ·
      Officials · Legislative**. Demote Statistics out of primary nav. **Done:** removed the Services
      dropdown and Statistics item from primary nav on every page. **Deferred to Phase 3:** the
      cosmetic reorder and adding a Projects/DPWH item — the nav is hand-duplicated across 29 pages
      with page-namespaced i18n keys and 4 path variants; the 11ty base layout makes this a
      one-template edit instead of 29 fragile ones. (Homepage Statistics stat-cards link to the still-
      live, demoted statistics page and were left in place.)

## Phase 2 — Strip the bloat · _Performance + Motion · ADR-0001_

- [x] Remove the Three.js constellation hero and Lenis smooth-scroll. Deleted all 5 vendor libs
      (`three.module.js` **1.27 MB**, `gsap.min.js`, `ScrollTrigger.min.js`, `lenis.min.js`) +
      `home-hero.js`, the hero `<canvas>` + pre-paint arming script, and the homepage's now-unused
      Leaflet JS/CSS (the map is a plain OSM iframe). Removed the three dead precache entries from
      `sw.js`. Verified in-browser: `window.gsap` / `Lenis` / `THREE` are all `undefined`.
- [~] Rebuild the home hero as a cheap CSS/SVG signature moment inside the perf budget. **Not
      rebuilt — challenged the requirement.** Stripping Three.js leaves the existing static hero
      (Bantayog wordmark + monument image + navy ground band) which *is* the cheap signature.
      Verified rendering: title visible at opacity 1, monument loaded, no horizontal overflow, no
      JS needed. Adding a new SVG moment would re-introduce the bloat we just cut.
- [x] Audit the SDG motion layer against the budget and the "aids comprehension" rule; keep only what
      passes; confirm `prefers-reduced-motion` leaves every page complete. **Removed entirely** — the
      heading line-masks, card lift-ins, ribbon seams, hue-cycling, count-up figures and parallax are
      all decoration that fails *motion serves comprehension* (count-up actively undercuts *every
      figure is sourced and dated* by animating budget numbers up from zero). Deleted the motion IIFE
      from `main.js` (the only Lenis consumer) and the dead `html.sdg-motion` CSS block in
      `style.css`. Reduced-motion / no-JS already rendered every page fully visible and static — that
      is now the only state. The per-area `--sdg` accent on section-title stars/icons (a *contained*
      colour accent, ADR-0002) was kept.

_Tooling: added `.claude/launch.json` (python static server on :8765) for live preview through the
remaining phases._

## Phase 3 — Stand up the system · _System of record · ADR-0003_ · _look preserved_

- [x] Introduce Eleventy; build the shared nav/header partials and migrate every page. **Done.**
      `@11ty/eleventy` (v3) + `eleventy.config.js` (input `src/`, output `_site/`, `assets/`
      passthrough so `_site` / `eleventy --serve` is self-contained). All 18 chrome-bearing pages
      live in `src/` as standalone `.njk`; each one's `<header class="site-header">…</header>` is now
      a single `{% include "header.njk" %}` (which pulls in the shared `nav.njk`). Head, `<main>`,
      footer and scripts are left byte-identical — verified: every rendered page is byte-for-byte
      identical to the old hand-authored page **outside the header region**. The foothold
      `base.njk` / `chrome-top.njk` / `chrome-bottom.njk` were dropped in favour of this
      include-injection (smaller diff, no layout indirection). `build.sh` runs `eleventy --output=dist`
      after the asset copy; `src/` + `eleventy.config.js` + `_site/` stay out of `dist/`.
      - **Nav reorder landed here** (the Phase 1 deferral): one shared `nav.njk` leads with the
        watchdog core — **Home · Transparency · Government · Legislative · Contact** — using
        **root-relative paths** (`/budget/`, `/government/`, …) correct on every page, killing the
        4-path-variant drift, the 18 page-namespaced i18n key sets, and the empty-`href` logo bug on
        subpages. No Projects/DPWH item: no such page exists yet (ponytail — no dead links); add it
        when a projects page lands. Officials stay under Government.
- [ ] Define CSS custom-property tokens (neutral scale, provincial primary, SDG accent set, type,
      spacing, radius) — values matching the **current** look for now. _Deferred:_ tokens earn their
      place when something reads them (the Phase 5 restyle), not before — defining unread tokens now
      is speculation. Introduce them as the restyle flips values.
- [~] Migrate pages to templates page-by-page. **Done for chrome** (header unified across all 18; each
      verified byte-identical outside the header). _Deferred:_ folding repeated pages (officials, news,
      projects) into one template + `data/*.json` is Phase 4 work — the data gains `source`/`as_of`
      there anyway, so splitting it out earns its place then, not now.

## Phase 4 — Provenance · _Sourced & dated_

- [x] **Build check** (`scripts/check-provenance.js`, wired into `build.sh` step 1b). Encodes
      principle #2 as an enforceable rule: any *fetched* dataset that renders figures
      (`dpwh-projects`, `fiscal_transparency`, `demographics`) must declare a top-level `source`,
      `source_url`, and `as_of` (empty drafts are skipped, so they trip the gate the moment they're
      populated); `news.json` items each warn if they lack a source `url`. **Warning-only for now** —
      flip to `--strict` (build-failing) once real provenance lands. The gate's report *is* the
      actionable debt list; it does not invent values.
- [~] Add `source` + `as_of` to the figure datasets. **Declared the schema, did not fabricate
      values.** `dpwh-projects.json` now carries `source` = "DPWH — Camarines Norte District
      Engineering Office" (the real agency, already in the file) with `source_url`/`as_of` left
      `null` + a `_provenance_note`: those two values are the LGU's to supply (official DPWH list URL
      + snapshot date). **Still open:** dpwh `source_url`/`as_of`; the 3 `news.json` items have no
      source `url`; `fiscal_transparency` + `demographics` are empty drafts awaiting official data.
- [x] **Single source of truth for the statistics figures.** They were hard-coded in
      `statistics-new.js` (`barangayData`, `historicalData`, `cmciData`), bypassing the data layer
      (`data/competitive-index.json` was a dead duplicate). Moved all three verbatim into
      `data/statistics.json` (verified byte-identical to the old constants) with per-section
      provenance harvested from the page's *existing* citation links — `population`: PSA
      (`psa.gov.ph`, as_of 2024), `cmci`: DTI CMCI (`cmci.dti.gov.ph`, as_of 2024). `statistics-new.js`
      now `fetch()`es the file on load; deleted `competitive-index.json`; the gate covers the new file
      via a `SECTIONED_DATASETS` check. Verified in-browser: all charts (CMCI 5×9, population ×12,
      historical 2020/2024) render from the fetched data, no console errors. Citations already render
      from the template's `p.data-source` links, so no new rendering was needed.
      - **Note:** the visible citation links live in the template while the gate's provenance lives in
        the data file — a small, deliberate duplication (static citations don't vanish if a fetch
        fails). Deriving citations from the fetched provenance is a Phase 5 nicety, not worth a
        new failure mode now.
- [ ] **Remaining provenance debt** (the gate reports it on every build): `dpwh-projects` needs a real
      `source_url` + `as_of`; the 3 `news.json` items need source `url`s; `fiscal_transparency` +
      `demographics` await official data. These values are the LGU's to supply — flip the gate to
      `--strict` once they land.

## Phase 5 — Restyle · _Performance · Colour · Accessibility_

- [x] Apply the new visual design by updating tokens (neutral base + SDG accents in named slots only).
      _5a consolidated the tokens; 5b applied them — neutral chrome (hotline, skip-link), watchdog
      hero with the one contained gold stat-accent, sourced ₱409.5M/63-DPWH chip linking to /budget/#dpwh,
      Ilocano dropped, volunteer modal removed. Homepage/flagship bodies left as-is (already v2/v5 redesign)._
- [ ] Promote performance to a build-failing gate: Lighthouse mobile ≥ 0.9, first-party JS
      ≤ ~50 KB gz/page, LCP ≤ 2.5 s on slow 4G; keep the accessibility gate (≥ 0.9, WCAG 2.1 AA).
- [ ] Verify SDG accents meet AA contrast in every slot.
