# Web Principles — BetterCamNorte (static site)

The contributor doctrine for the static `main` site. When a change is in question — a new library, a
visual effect, a page, a redesign — this document is the tie-breaker.

**If a proposal fails a principle, the proposal changes, not the principle.**

- **Who we design for:** an ordinary Camarines Norte citizen on a low-to-mid Android phone over slow,
  metered, sometimes-offline mobile data. Every principle serves that person first.
- **Scope:** the static HTML/CSS/JS site. The `react-app/` migration is out of scope until it ships.

The order is deliberate: *purpose* and *trust* first, then the universal *floors*, then *expression*,
then the *machinery*.

---

## 1. A transparency watchdog, not a portal — every section earns its place

BetterCamNorte exists to show where Camarines Norte's public money goes and who is accountable for
it. That is the core. Every section must earn its place against that mission; anything that doesn't
serve it is cut or demoted to clearly secondary.

**Why:** A site that is at once a service directory, news outlet, statistics dashboard, and
utility-widget collection dilutes the one thing it can be trusted for — following the money. Focus is
what makes a watchdog credible and a small volunteer team able to maintain it.

**The test** — for any page, section, or feature, ask:

> Does this help a citizen see, understand, or question how public funds are used, or who is
> accountable for them?

- **Yes, directly** → core. It earns primary navigation: budget & fiscal data, DPWH / projects,
  officials, legislative acts.
- **Only as context** → supporting. Allowed, but kept lean and out of primary nav (e.g. demographics
  and statistics as context for judging spending).
- **No** → it does not belong. Remove it (weather widget, currency converter), or it survives only as
  unavoidable boilerplate (contact, privacy, terms, FAQ, accessibility statement).

A new feature is measured against this test *before* any design or code. "It would be nice" is not
"it follows the money."

---

## 2. Every figure is sourced and dated — or it doesn't ship

Every number, chart, and factual claim about public funds or officials carries its official source
(the document or portal it came from, linked where possible) and the date it reflects ("as of"). An
unsourced figure does not ship.

**Why:** A watchdog is only as trustworthy as its weakest citation. An unsourced number invites "says
who?" and lets anyone dismiss the whole site as biased. Traceability is not decoration — it is the
product.

**The test:**

- Every entry in `data/*.json` carries a `source` (with a link where one exists) and an `as_of` date
- Templates render the citation next to the figure automatically; no figure appears without one
- A data file with a missing `source` or `as_of` fails the build, exactly as accessibility and
  performance do
- Sources are official / primary (government documents, official portals), not secondary reporting,
  wherever a primary exists
- When data can't be sourced, it is omitted — never estimated, never shown unattributed

---

## 3. Performance is a floor, not a feature

The site must load fast and work on a low-end phone over slow 4G. Performance is not something we
optimise toward later; it is a gate every page passes before it ships.

**Why:** A civic transparency site that only works on fast devices excludes the people who most need
free access to government information. "₱0 to the people" means ₱0 in data *and* a working page on
the phone they actually own.

**The test** — CI-enforced and build-failing, exactly as accessibility already is:

- Lighthouse mobile performance ≥ 0.9
- First-party JavaScript ≤ ~50 KB gzipped per page; no render-blocking JS
- Every page works with JavaScript disabled (progressive enhancement)
- At most one web font, subsetted, `font-display: swap`
- LCP ≤ 2.5 s on throttled slow 4G; CLS < 0.1
- **Exception — interactive data pages** (map, statistics): the heavy library (Leaflet, Chart.js)
  loads only on user intent, never on first paint. Exempt from the JS budget *below the fold*, not
  from the rest.

If a beautiful idea can't fit this budget, it isn't beautiful here.

---

## 4. Accessible to WCAG 2.1 AA — enforced, not aspirational

Every page meets WCAG 2.1 AA. This is the existing build gate (Lighthouse accessibility ≥ 0.9,
build-failing), not a goal we drift toward.

**Why:** A government site excludes citizens when it can't be used with a keyboard, a screen reader,
or low vision. For a public service, that exclusion isn't a bug — it's a failure of the mission.

**The test:**

- Lighthouse accessibility ≥ 0.9 on every page, build-failing (already in place)
- Semantic HTML first; ARIA only to fill genuine gaps
- Every interactive element is keyboard-reachable and operable, with a visible focus state
- Text and meaningful UI meet AA contrast (≥ 4.5:1 body, ≥ 3:1 large / UI) — this is the contrast
  floor the SDG accents must clear
- Every image or icon that carries meaning has a text alternative

---

## 5. Motion serves comprehension, not decoration

Animation is welcome when it helps someone understand the page — orienting them, showing state,
guiding the eye to an answer. Motion that exists only to impress is not.

**Why:** On a low-end phone every animation costs frames, battery, and sometimes legibility. Motion
the user doesn't benefit from is a tax they pay for our delight.

**The test:**

- CSS only (`transform`/`opacity`); no JavaScript animation libraries, no scroll-hijacking — native
  scroll always (this is why Lenis is out)
- No WebGL, 3D, or decorative `<canvas>` (this is why the Three.js hero is out)
- Every animation has a one-sentence job ("reveals the answer", "shows it's loading"). If you can't
  name the job, cut it.
- `prefers-reduced-motion: reduce` removes all non-essential motion; the page stays complete and usable
- The signature home hero is CSS/SVG, inside the page's performance budget

---

## 6. A neutral base, SDG colour as contained accent

Surfaces, text, and primary UI are neutral — near-monochrome for legibility and authority. The SDG
17 colours live only as accents in a defined set of slots, where they rotate to give the site its
optimistic, mission-forward character.

**Why:** Citizens must be able to read and trust official data. A neutral base guarantees contrast
and hierarchy; confining the SDG palette to named slots adds joy and energy without letting colour
compete with content or dilute authority.

**The test:**

- The neutral scale + a single provincial primary carry all body text, surfaces, and global chrome
  (nav, footer, links)
- SDG colours appear ONLY in sanctioned accent slots — hero, section seams, stat highlights, category
  tags — never as body text, never as a large fill behind reading content
- One dominant accent per view; accents rotate across sections and pages, never stacked many-per-screen
- Any accent used on text or fills meets WCAG AA contrast (≥ 4.5:1 body text, ≥ 3:1 large text / UI)
- Accents are drawn from the SDG colour tokens, never hand-picked hex values

---

## 7. The system is the source of truth — compose, don't hand-author

Pages are composed from a single design system: design tokens (CSS custom properties), shared
components, and the JSON data layer, assembled at build time by Eleventy. Contributors compose pages
from these parts; they do not hand-author one-off markup, one-off CSS, or literal values.

**Why:** 53 hand-copied pages drift — the ~24 near-identical service pages were the proof. One source
for structure (templates + partials), one for style (tokens), and one for content (`data/*.json`)
keeps the site coherent and cheap to change: fix the nav once, restyle once, correct a figure once.

**The test:**

- Every page is an Eleventy template; repeated structures (official cards, news items, project lists)
  render from ONE template + a `data/*.json` source — never copied per page
- Shared chrome (nav, header, footer, `<head>`) lives in a single layout/partial, included everywhere
- Colour, type, spacing, radius, and shadow come from CSS custom-property tokens — no literal hex, no
  one-off `px`, no one-off font declarations in page CSS
- Type is Inter (subset, one variable family) with a system-font fallback; no second web font
- A page that can't be built from existing tokens and components is a signal to *extend the system*,
  not to write bespoke CSS
