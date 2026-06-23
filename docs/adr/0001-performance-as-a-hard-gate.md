# Performance is a build-failing gate, not a soft target

The static site exists to reach citizens on low-end Android phones over slow, sometimes-offline
mobile data; reaching them is the project's civic purpose. The decided **target state** is to
promote performance from a soft Lighthouse warning (≥ 0.7) to a hard, build-failing gate alongside
accessibility: Lighthouse mobile ≥ 0.9, ≤ ~50 KB gzipped first-party JS per page, progressive
enhancement (pages work without JS), one subset web font, LCP ≤ 2.5 s on slow 4G. Interactive data
pages (Leaflet map, Chart.js statistics) are a documented exception — heavy libraries load on user
intent, not first paint. Enforcement is staged: `.lighthouserc.json` still sets
`categories:performance` to `warn` at 0.7; flipping it to `error` at 0.9 is the implementing step,
taken once first-party pages clear the budget (accessibility is already an `error` gate at 0.9).

We chose a hard gate over guidance because the soft 0.7 warning is precisely what allowed a Three.js
(WebGL) homepage hero and a site-wide motion layer to ship — features the worst-case user pays for in
bytes and battery. A gate makes the floor non-negotiable; the cost is that genuinely heavy ideas must
be rebuilt cheaply or dropped.
