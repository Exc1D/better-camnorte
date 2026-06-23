# Build-time templating with Eleventy

The static site had grown to ~53 hand-authored HTML pages, including ~24 near-duplicate
service-detail pages kept in sync by hand — the source of constant drift. We are adopting Eleventy
(11ty) as a build-time static-site generator: pages become templates and shared structure becomes
partials/layouts (e.g. the hand-synced site header is now one `header.njk`/`nav.njk` include pulled
into every page — the immediate win that killed the cross-page nav drift). The `data/*.json` layer
is passthrough-copied and fetched client-side today; 11ty's data cascade remains available to
generate repeated pages from a single template if a data-driven section later warrants it.

We chose 11ty over a hand-rolled preprocessor and over a heavier framework because it outputs plain,
zero-client-JS static HTML — preserving the static-only scope and the performance floor — while its
data cascade fits the existing JSON layer directly. The deployed output (cPanel / Vercel) is
unchanged in nature: inert static files. Only the authoring model changes. Cost: a dev dependency, a
repo restructure into 11ty conventions, and a page-by-page migration.
