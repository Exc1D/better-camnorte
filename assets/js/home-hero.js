/* ==========================================================================
   Home hero — Bantayog × the 17 Sustainable Development Goals
   1. GSAP cinematic entrance (seam wipe, monument rise, staggered reveal).
   2. Three.js constellation: 17 goal-coloured nodes drifting behind the
      monument, linked like a partnership network, with mouse parallax.
   3. GSAP ScrollTrigger reveals for the sections down the page.
   Everything is progressive enhancement and reduced-motion aware: the page is
   fully usable, and fully visible, if any of it fails to load.
   ========================================================================== */

const root = document.documentElement;
const hero = document.querySelector('.hero');
const canvas = document.querySelector('.hero__field');
const monument = document.querySelector('.hero__monument');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Official SDG palette, goals 1..17
const SDG = [
  0xe5243b, 0xdda63a, 0x4c9f38, 0xc5192d, 0xff3a21, 0x26bde2, 0xfcc30b, 0xa21942,
  0xfd6925, 0xdd1367, 0xfd9d24, 0xbf8b2e, 0x3f7e44, 0x0a97d9, 0x56c02b, 0x00689d, 0x19486a,
];

const rand = (a, b) => a + Math.random() * (b - a);

// Shared pointer signal (drives the monument tilt and the constellation parallax)
const pointer = { x: 0, y: 0 };
if (!reduced) {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true }
  );
}

revealHero();
if (!reduced && canvas) {
  import('three').then(initField).catch(() => {}); // no WebGL? the poster still stands
}
// Down-page reveals are now owned by the shared SDG motion layer in main.js.

/* --------------------------------------------------------------------------
   1. Cinematic entrance — independent of Three.js so a CDN miss can't hide it
   -------------------------------------------------------------------------- */
function revealHero() {
  const gsap = window.gsap;
  if (reduced || !gsap || !hero) {
    root.classList.remove('hero-anim'); // unhide whatever the <head> armed
    return;
  }
  const compact = window.matchMedia('(max-width: 860px)').matches;
  root.classList.add('hero-played');

  const targets = [
    '.hero__eyebrow',
    '.hero__title-line--serif',
    '.hero__title-line--sans',
    '.hero__monument',
    '.hero__horizon-label',
    '.hero__lede',
    '.hero__search',
    '.hero__actions',
    '.hero__tags',
  ];

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete() {
      root.classList.remove('hero-anim');
      gsap.set(targets, { clearProps: 'transform,opacity' });
      startMonumentParallax();
    },
  });

  tl.fromTo('.hero__earth', { '--seam': 0 }, { '--seam': 1, duration: 1.0, ease: 'power2.inOut' }, 0.1)
    .fromTo('.hero__eyebrow', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.25)
    .fromTo(
      '.hero__title-line--serif',
      { yPercent: 22, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.05 },
      0.18
    )
    .fromTo(
      '.hero__title-line--sans',
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 },
      0.5
    )
    .fromTo(
      '.hero__monument',
      compact ? { opacity: 0 } : { y: 64, opacity: 0 },
      compact
        ? { opacity: 1, duration: 0.8, ease: 'power3.out' }
        : { y: 0, opacity: 1, duration: 1.15, ease: 'power3.out' },
      0.28
    )
    .fromTo(
      ['.hero__horizon-label', '.hero__lede', '.hero__search', '.hero__actions', '.hero__tags'],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.08 },
      0.55
    )
    .fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1.3, ease: 'power1.out' }, 0.2);
}

// Subtle, alive: the monument leans a hair toward the cursor once it has landed
function startMonumentParallax() {
  const gsap = window.gsap;
  const canParallax = window.matchMedia('(min-width: 861px) and (pointer: fine)').matches;
  if (reduced || !gsap || !monument || !canParallax) return;
  const xTo = gsap.quickTo(monument, 'x', { duration: 0.7, ease: 'power3' });
  const rTo = gsap.quickTo(monument, 'rotation', { duration: 0.9, ease: 'power3' });
  gsap.ticker.add(() => {
    xTo(pointer.x * 10);
    rTo(pointer.x * 1.1);
  });

  if (window.ScrollTrigger) {
    gsap.to(monument, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}

/* --------------------------------------------------------------------------
   2. The constellation of the 17 goals
   -------------------------------------------------------------------------- */
function initField(THREE) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 1000);
  camera.position.z = 60;

  const group = new THREE.Group();
  scene.add(group);

  const NODES = SDG.length; // the 17 goals
  const AMBIENT = 78;
  const COUNT = NODES + AMBIENT;
  const DEPTH = 26;
  const LINK = 9.5; // world-units within which two points connect
  let HALF_H = 34;
  let HALF_W = 50;

  function computeBounds() {
    HALF_H = Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z;
    HALF_W = HALF_H * camera.aspect;
  }

  const positions = new Float32Array(COUNT * 3);
  const aColor = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  const vel = new Float32Array(COUNT * 3);
  const c = new THREE.Color();
  const white = new THREE.Color(0xffffff);

  function seed() {
    computeBounds();
    for (let i = 0; i < COUNT; i++) {
      const isNode = i < NODES;
      positions[i * 3] = rand(-1, 1) * HALF_W * 1.2;
      positions[i * 3 + 1] = rand(-1, 1) * HALF_H * 1.2;
      positions[i * 3 + 2] = rand(-1, 1) * DEPTH;
      c.setHex(isNode ? SDG[i] : SDG[(Math.random() * SDG.length) | 0]);
      if (!isNode) c.lerp(white, 0.18); // ambient dust sits quieter than the goals
      aColor[i * 3] = c.r;
      aColor[i * 3 + 1] = c.g;
      aColor[i * 3 + 2] = c.b;
      sizes[i] = isNode ? rand(2.6, 3.6) : rand(0.8, 1.7);
      const s = isNode ? 0.55 : 1;
      vel[i * 3] = rand(-0.02, 0.02) * s;
      vel[i * 3 + 1] = rand(-0.02, 0.02) * s;
      vel[i * 3 + 2] = rand(-0.012, 0.012) * s;
    }
  }
  seed();

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(aColor, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms: { uMap: { value: discTexture(THREE) }, uScale: { value: 300 } },
      vertexShader: `
        attribute float size;
        attribute vec3 aColor;
        varying vec3 vColor;
        uniform float uScale;
        void main() {
          vColor = aColor;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (uScale / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform sampler2D uMap;
        varying vec3 vColor;
        void main() {
          vec4 tex = texture2D(uMap, gl_PointCoord);
          if (tex.a < 0.02) discard;
          gl_FragColor = vec4(vColor, tex.a);
        }`,
      transparent: true,
      depthWrite: false,
    })
  );
  group.add(points);

  // Connection lines, rebuilt each frame; colour fades into the sky with distance
  const MAX_SEG = 1500;
  const linePos = new Float32Array(MAX_SEG * 6);
  const lineCol = new Float32Array(MAX_SEG * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));
  const sky = new THREE.Color(0xf6f8fc);
  const lines = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.62 })
  );
  group.add(lines);

  function buildLines() {
    let s = 0;
    const ca = new THREE.Color();
    const cb = new THREE.Color();
    for (let i = 0; i < COUNT && s < MAX_SEG; i++) {
      const ix = i * 3;
      for (let j = i + 1; j < COUNT && s < MAX_SEG; j++) {
        const jx = j * 3;
        const dx = positions[ix] - positions[jx];
        const dy = positions[ix + 1] - positions[jx + 1];
        const dz = positions[ix + 2] - positions[jx + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d > LINK) continue;
        const t = d / LINK; // 0 near, 1 at the edge of reach
        ca.setRGB(aColor[ix], aColor[ix + 1], aColor[ix + 2]).lerp(sky, t * 0.85);
        cb.setRGB(aColor[jx], aColor[jx + 1], aColor[jx + 2]).lerp(sky, t * 0.85);
        const o = s * 6;
        linePos[o] = positions[ix];
        linePos[o + 1] = positions[ix + 1];
        linePos[o + 2] = positions[ix + 2];
        linePos[o + 3] = positions[jx];
        linePos[o + 4] = positions[jx + 1];
        linePos[o + 5] = positions[jx + 2];
        lineCol[o] = ca.r;
        lineCol[o + 1] = ca.g;
        lineCol[o + 2] = ca.b;
        lineCol[o + 3] = cb.r;
        lineCol[o + 4] = cb.g;
        lineCol[o + 5] = cb.b;
        s++;
      }
    }
    lineGeo.setDrawRange(0, s * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
  }

  function resize() {
    const w = canvas.clientWidth || hero.clientWidth;
    const h = canvas.clientHeight || hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    computeBounds();
  }
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
  else window.addEventListener('resize', resize);

  // Pause when the hero is off-screen or the tab is hidden
  let onScreen = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => {
      onScreen = es[0].isIntersecting;
    }).observe(hero);
  }

  let last = performance.now();
  let px = 0;
  let py = 0;
  const WB = () => HALF_W * 1.25;
  const HB = () => HALF_H * 1.25;

  function tick(now) {
    requestAnimationFrame(tick);
    if (!onScreen || document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min((now - last) / 16.667, 3);
    last = now;

    const wb = WB();
    const hb = HB();
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      positions[ix] += vel[ix] * dt;
      positions[ix + 1] += vel[ix + 1] * dt;
      positions[ix + 2] += vel[ix + 2] * dt;
      if (positions[ix] > wb) positions[ix] = -wb;
      else if (positions[ix] < -wb) positions[ix] = wb;
      if (positions[ix + 1] > hb) positions[ix + 1] = -hb;
      else if (positions[ix + 1] < -hb) positions[ix + 1] = hb;
      if (positions[ix + 2] > DEPTH) positions[ix + 2] = -DEPTH;
      else if (positions[ix + 2] < -DEPTH) positions[ix + 2] = DEPTH;
    }
    geo.attributes.position.needsUpdate = true;
    buildLines();

    px += (pointer.x - px) * 0.05;
    py += (pointer.y - py) * 0.05;
    group.rotation.y = px * 0.14;
    group.rotation.x = -py * 0.1;
    camera.position.x = px * 6;
    camera.position.y = py * 4;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);
}

function discTexture(THREE) {
  const s = 64;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(cv);
  tex.needsUpdate = true;
  return tex;
}
