import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const css = read('assets/css/home-redesign.css');
const main = read('assets/js/main.js');
const hero = read('assets/js/home-hero.js');
const html = read('index.html');
const reactCss = read('react-app/public/assets/css/style.css');
const sw = read('sw.js');

assert.match(css, /\.hero__field\s*{[^}]*position: absolute;[^}]*inset: 0;/s);
assert.match(css, /\.hero__earth::before\s*{[^}]*scaleX\(var\(--seam, 1\)\)/s);
assert.doesNotMatch(css, /--sdg-(?:1|17):|--sdg-ribbon:|--font-main:/);
assert.match(main, /IntersectionObserver' in window/);
assert.match(main, /transitionend/);
assert.match(main, /getElementById\(href\.slice\(1\)\)/);
assert.match(main, /:not\(\[class\*="-card-"\]\)/);
assert.match(hero, /'ResizeObserver' in window/);
assert.match(html, /<form class="hero__search" role="search" action="services\/">/);
assert.match(html, /id="hero-search"[\s\S]*?name="q"/);
assert.doesNotMatch(html, /cdnjs\.cloudflare\.com\/ajax\/libs\/gsap|unpkg\.com\/three@/);
assert.match(reactCss, /--font-main: 'Source Sans 3', sans-serif;/);
assert.match(sw, /\/assets\/js\/vendor\/three\.module\.js/);
read('assets/js/vendor/gsap.min.js');
read('assets/js/vendor/ScrollTrigger.min.js');
read('assets/js/vendor/three.module.js');

console.log('PR #3 review regression checks passed');
