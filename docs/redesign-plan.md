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

- [ ] Introduce Eleventy; build the base layout + nav/header/footer partials.
- [ ] Define CSS custom-property tokens (neutral scale, provincial primary, SDG accent set, type,
      spacing, radius) — values matching the **current** look for now.
- [ ] Migrate pages to templates page-by-page; repeated pages (officials, news, projects) render from
      one template + `data/*.json`. Verify each page renders identically to today.

## Phase 4 — Provenance · _Sourced & dated_

- [ ] Add `source` (with link) and `as_of` to every `data/*.json` entry.
- [ ] Render citations next to every figure via the template.
- [ ] Add a build check that fails on a missing `source` or `as_of`.

## Phase 5 — Restyle · _Performance · Colour · Accessibility_

- [ ] Apply the new visual design by updating tokens (neutral base + SDG accents in named slots only).
- [ ] Promote performance to a build-failing gate: Lighthouse mobile ≥ 0.9, first-party JS
      ≤ ~50 KB gz/page, LCP ≤ 2.5 s on slow 4G; keep the accessibility gate (≥ 0.9, WCAG 2.1 AA).
- [ ] Verify SDG accents meet AA contrast in every slot.
