# Build-time templating with Eleventy

The static site had grown to ~53 hand-authored HTML pages, including ~24 near-duplicate
service-detail pages kept in sync by hand — the source of constant drift. We are adopting Eleventy
(11ty) as a build-time static-site generator: pages become templates, shared structure becomes
partials/layouts, and the existing `data/*.json` files drive repeated pages through 11ty's data
cascade (e.g. `services.json` renders every service page from one template).

We chose 11ty over a hand-rolled preprocessor and over a heavier framework because it outputs plain,
zero-client-JS static HTML — preserving the static-only scope and the performance floor — while its
data cascade fits the existing JSON layer directly. The deployed output (cPanel / Vercel) is
unchanged in nature: inert static files. Only the authoring model changes. Cost: a dev dependency, a
repo restructure into 11ty conventions, and a page-by-page migration.
