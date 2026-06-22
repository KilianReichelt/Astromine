/* Stabilitäts-/Crash-Fuzzer für ../index.html (oder Datei als Argument).
   Mockt das Browser-/Canvas-Environment, führt den kompletten <script>-Block aus
   (inkl. buildGalaxy + init) und fuzzt Generierung, Rendering, Ticks und Save/Load
   über viele Seeds/alle Sternklassen/Besonderheiten. */
const fs = require('fs');
const path = require('path');
const FILE = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(FILE, 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('Kein <script>-Block gefunden'); process.exit(2); }
let body = m[1];

/* ---------- Browser-/Canvas-Mock ---------- */
function makeCtx() {
  const grad = { addColorStop() {} };
  const ctx = {
    canvas: { width: 1280, height: 800 },
    globalAlpha: 1, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1,
    lineDashOffset: 0, font: '', textAlign: '', globalCompositeOperation: 'source-over',
    filter: 'none', imageSmoothingEnabled: true,
    save() {}, restore() {}, beginPath() {}, closePath() {}, moveTo() {}, lineTo() {},
    arc() {}, ellipse() {}, rect() {}, fill() {}, stroke() {}, clip() {},
    fillRect() {}, strokeRect() {}, clearRect() {}, fillText() {}, strokeText() {},
    translate() {}, rotate() {}, scale() {}, setTransform() {}, resetTransform() {},
    setLineDash() {}, quadraticCurveTo() {}, bezierCurveTo() {}, arcTo() {},
    drawImage() {}, createRadialGradient() { return grad; }, createLinearGradient() { return grad; },
    createPattern() { return null; },
    measureText() { return { width: 8 }; },
    getImageData(x, y, w, h) { return { data: new Uint8ClampedArray(Math.max(0, (w | 0) * (h | 0) * 4)) }; },
    putImageData() {}, createImageData(w, h) { return { data: new Uint8ClampedArray(Math.max(0, (w | 0) * (h | 0) * 4)) }; },
  };
  return ctx;
}
function makeEl(tag) {
  const el = {
    tagName: (tag || 'div').toUpperCase(),
    width: 300, height: 150, value: '', checked: false, textContent: '', _html: '',
    dataset: {}, style: {}, scrollTop: 0, scrollLeft: 0, offsetWidth: 100, offsetHeight: 100,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
    appendChild(c) { return c; }, removeChild(c) { return c; }, remove() {},
    insertBefore(c) { return c; }, setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
    focus() {}, blur() {}, click() {}, closest() { return null; },
    getBoundingClientRect() { return { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }; },
    getContext() { return makeCtx(); },
    querySelector() { return makeEl('div'); },
    querySelectorAll() { return []; },
    requestFullscreen() {}, webkitRequestFullscreen() {},
  };
  Object.defineProperty(el, 'innerHTML', { get() { return el._html; }, set(v) { el._html = String(v); } });
  Object.defineProperty(el, 'firstChild', { get() { return null; } });
  return el;
}
const elCache = {};
const documentMock = {
  documentElement: makeEl('html'),
  body: makeEl('body'),
  head: makeEl('head'),
  fullscreenElement: null, webkitFullscreenElement: null,
  createElement(tag) { return makeEl(tag); },
  createElementNS() { return makeEl('svg'); },
  createTextNode() { return makeEl('text'); },
  getElementById(id) { return elCache[id] || (elCache[id] = makeEl('div')); },
  querySelector(sel) { return elCache[sel] || (elCache[sel] = makeEl('div')); },
  querySelectorAll() { return []; },
  addEventListener() {}, removeEventListener() {},
  exitFullscreen() {}, webkitExitFullscreen() {},
};
let perfT = 0;
const store = {};
const localStorageMock = {
  getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
  setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; }, clear() { for (const k in store) delete store[k]; },
};
let rafCb = null;
function setGlobal(k, v) {
  try { globalThis[k] = v; }
  catch (e) { Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true }); }
}
const globals = {
  window: globalThis, self: globalThis, document: documentMock,
  localStorage: localStorageMock,
  innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1,
  performance: { now() { return (perfT += 16.7); } },
  requestAnimationFrame(cb) { rafCb = cb; return 1; }, cancelAnimationFrame() {},
  addEventListener() {}, removeEventListener() {},
  matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
  navigator: { userAgent: 'node-stability-test', hardwareConcurrency: 4, language: 'de' },
  screen: { width: 1280, height: 800 },
  alert() {}, confirm() { return true; }, prompt() { return ''; },
  Image: function () { return makeEl('img'); },
  OffscreenCanvas: function (w, h) { const c = makeEl('canvas'); c.width = w; c.height = h; return c; },
  setTimeout(fn) { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
};
for (const k in globals) setGlobal(k, globals[k]);

/* ---------- Skript ausführen + interne Funktionen exportieren ---------- */
body += `\n;try{globalThis.__API={
  getSystem, STARS, SYSCACHE, getTex, drawStarPreview, drawBodyPreview, STARCL, PTYPES, PHENOMENA,
  SHIPTYPES, MEGADEF, MEGAORDER, startMegaPhase, dispatchRouteStops, persist, loadSave, G,
  freshSave, NSTARS, SOL, LMS, frame,
  drawSystem, drawGalaxy,
  setSys:(i)=>{ SYSIDX=i; SYS=getSystem(i); MODE="system"; cam={x:0,y:0,z:0.6}; tgt={...cam}; },
  setGalaxy:()=>{ MODE="galaxy"; const s=STARS[SOL]; cam={x:s.x,y:s.y,z:0.4}; tgt={...cam}; },
  state:()=>({MODE, SYSIDX, PERSIST}),
};}catch(e){globalThis.__APIERR=e;}`;

const errors = [];
function rec(scenario, e) { errors.push({ scenario, msg: e && e.message, stack: e && e.stack && e.stack.split('\n').slice(0, 4).join(' | ') }); }

let API;
try {
  const run = new Function(body);
  run();
} catch (e) { rec('Initiales Laden/Bootstrap', e); }
if (globalThis.__APIERR) rec('API-Export', globalThis.__APIERR);
API = globalThis.__API;
if (!API) { console.log('FATAL: keine API exportiert.'); console.log(JSON.stringify(errors, null, 2)); process.exit(1); }

/* ---------- Szenario 1: getSystem über ALLE Systeme ---------- */
const NS = API.NSTARS;
const classCount = {};
const featureCount = {};
const phenomenonCount = {};
let noFeature = 0;
let nanFields = 0, nanExamples = [];
for (let i = 0; i < NS; i++) {
  try {
    const sys = API.getSystem(i);
    const cl = sys.cl; classCount[cl.k] = (classCount[cl.k] || 0) + 1;
    if (sys.feature) featureCount[sys.feature.n] = (featureCount[sys.feature.n] || 0) + 1; else if (!sys.star.sol) noFeature++;
    if (sys.phenomenon) phenomenonCount[sys.phenomenon.key] = (phenomenonCount[sys.phenomenon.key] || 0) + 1;
    // Validierung: alle abbaubaren Körper haben endliche dep-Werte
    const bodies = sys.planets.concat(sys.moons || [], sys.comets || [], sys.beltBody ? [sys.beltBody] : []);
    for (const b of bodies) {
      if (b.dep) for (const k in b.dep) {
        if (!Number.isFinite(b.dep[k]) || !Number.isFinite(b.depMax[k])) {
          nanFields++; if (nanExamples.length < 6) nanExamples.push(sys.star.name + ' · ' + b.name + ' · ' + k);
        }
      }
      if (!Number.isFinite(b.massN)) { nanFields++; if (nanExamples.length < 6) nanExamples.push(sys.star.name + ' · ' + b.name + ' · massN'); }
    }
    for (const p of sys.planets) if (!Number.isFinite(p.dist)) { nanFields++; if (nanExamples.length < 6) nanExamples.push(sys.star.name + ' · ' + p.name + ' · dist'); }
  } catch (e) { rec('getSystem(' + i + ')', e); if (errors.length > 40) break; }
}

/* ---------- Szenario 2: Texturen/Vorschauen für jeden Planetentyp ---------- */
try {
  const seen = {};
  for (let i = 0; i < NS && Object.keys(seen).length < 40; i++) {
    const sys = API.getSystem(i);
    for (const p of sys.planets) {
      if (seen[p.type.id]) continue; seen[p.type.id] = 1;
      p.tex = null; API.getTex(p);
    }
  }
} catch (e) { rec('getTex je Planetentyp', e); }
try { for (let c = 0; c < API.STARCL.length; c++) API.drawStarPreview(makeEl('canvas'), API.STARCL[c]); }
catch (e) { rec('drawStarPreview je Sternklasse', e); }

/* ---------- Szenario 3: Rendering jedes Systems (System- + Galaxiemodus) ---------- */
let rendered = 0;
const step = Math.max(1, Math.floor(NS / 400)); // ~400 Systeme abdecken (alle Klassen/Specials)
for (let i = 0; i < NS; i += step) {
  try {
    API.setSys(i);
    for (let f = 0; f < 3; f++) API.frame(perfT + 16.7);
    rendered++;
  } catch (e) { rec('Rendern System ' + i, e); if (errors.length > 60) break; }
}
// gezielt jede Sternklasse + jedes Phänomen + jede Feature-Art mindestens einmal rendern
try {
  const wantCls = {}, wantSpec = {}, wantFeat = {};
  for (let i = 0; i < NS; i++) {
    const sys = API.getSystem(i);
    let need = false;
    if (!wantCls[sys.cl.k]) { wantCls[sys.cl.k] = 1; need = true; }
    if (sys.phenomenon && !wantSpec[sys.phenomenon.key]) { wantSpec[sys.phenomenon.key] = 1; need = true; }
    if (sys.feature && !wantFeat[sys.feature.n]) { wantFeat[sys.feature.n] = 1; need = true; }
    if (need) { API.setSys(i); for (let f = 0; f < 4; f++) API.frame(perfT + 16.7); }
  }
} catch (e) { rec('Rendern aller Klassen/Specials', e); }

/* ---------- Szenario 4: Galaxie-Rendering bei verschiedenen Zoomstufen ---------- */
try {
  API.setGalaxy();
  for (let f = 0; f < 30; f++) API.frame(perfT + 16.7);
} catch (e) { rec('Galaxie-Rendering', e); }

/* ---------- Szenario 5: Save → Load Roundtrip + langer Tick-Lauf ---------- */
try { API.persist(); const sv = API.loadSave(); if (!sv || !sv.game) rec('loadSave Ergebnis', new Error('kein game-Objekt')); }
catch (e) { rec('persist/loadSave', e); }
try { API.setSys(API.SOL); for (let f = 0; f < 600; f++) API.frame(perfT + 16.7); } // ~10 s Sim
catch (e) { rec('Langer Tick-Lauf (Sol)', e); }

/* ---------- Szenario 6: ungültige Routen-/Mega-Aufrufe robust? ---------- */
try { API.dispatchRouteStops([], {}, {}); API.dispatchRouteStops([{ sys: 0, act: 'load' }], {}, {}); }
catch (e) { rec('dispatchRouteStops Grenzfälle', e); }
try { API.startMegaPhase('dyson', API.SOL); API.startMegaPhase('nope', 0); }
catch (e) { rec('startMegaPhase Grenzfälle', e); }

/* ---------- Szenario 7: korrupter Save (defensives loadSave) ---------- */
try {
  store['galaktischer-kartograf-spiel-v1'] = '{"game":null,"p":"kaputt","vis":42}';
  const sv = API.loadSave();
  if (!sv || !sv.game) rec('loadSave korrupt', new Error('kein valides game nach korruptem Save'));
} catch (e) { rec('loadSave korrupt', e); }
try { store['galaktischer-kartograf-spiel-v1'] = '{nicht valides json'; API.loadSave(); }
catch (e) { rec('loadSave ungültiges JSON', e); }

/* ---------- Report ---------- */
console.log('===== STABILITÄTS-REPORT ' + path.basename(FILE) + ' =====');
console.log('Systeme generiert:        ' + NS);
console.log('Sternklassen-Verteilung:  ' + JSON.stringify(classCount));
console.log('Feature-Verteilung:       ' + JSON.stringify(featureCount));
console.log('Systeme OHNE Besonderheit:' + noFeature + (noFeature ? '  ✗ (sollte 0 sein!)' : '  ✓'));
console.log('Phänomene (selten):       ' + JSON.stringify(phenomenonCount));
console.log('Systeme gerendert:        ~' + rendered + ' (Stichprobe) + alle Klassen/Phänomene/Features');
console.log('NaN-Felder gefunden:      ' + nanFields + (nanExamples.length ? ' z.B. ' + nanExamples.join('; ') : ''));
console.log('Fehler/Crashes gesamt:    ' + errors.length);
if (errors.length) {
  console.log('\n----- FEHLERDETAILS -----');
  for (const er of errors.slice(0, 40)) console.log('• [' + er.scenario + '] ' + er.msg + '\n   ' + er.stack);
} else {
  console.log('\n✓ Keine Crashes in den Szenarien.');
}
process.exit(errors.length ? 1 : 0);
