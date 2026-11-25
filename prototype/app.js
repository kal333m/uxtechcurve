/* Process Investigation Workspace — v2 (decluttered)
   Real data: data.js (reactor02_signals.csv). Events & alarms transcribed from the CSVs.
   Frame C's 25 extra signals are illustrative (labelled in the UI). */
(() => {
const D = window.SIG.cols, N = window.SIG.n, NOW = 1440;
const T = (h, m, day = 15) => (day === 14 ? h * 60 + m - 580 : 860 + h * 60 + m);   // idx 0 = 14 Sep 09:40
const hhmm = i => { const m = (580 + Math.round(i)) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

/* ---------------- icons: shape always travels with colour ---------------- */
const IC = {
  crit: (s = 12) => `<svg width="${s}" height="${s}" viewBox="0 0 12 12" aria-label="Critical"><path d="M6 .6 11.4 6 6 11.4.6 6z" fill="var(--crit)"/><path d="M6 3.4v3.2M6 8.3v.3" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  warn: (s = 12) => `<svg width="${s}" height="${s}" viewBox="0 0 12 12" aria-label="Warning"><path d="M6 .9 11.5 10.8H.5z" fill="var(--warn)"/><path d="M6 4.4v3M6 9v.2" stroke="#1b1300" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  ok: (s = 12) => `<svg width="${s}" height="${s}" viewBox="0 0 12 12" aria-label="Normal"><circle cx="6" cy="6" r="5.4" fill="none" stroke="var(--ok)" stroke-width="1.2"/><path d="m3.6 6.1 1.7 1.7 3.2-3.4" fill="none" stroke="var(--ok)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  yes: (s = 12) => `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><path d="M2 6.5 4.8 9 10 3" fill="none" stroke="var(--ink-1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  unk: (s = 12) => `<svg width="${s}" height="${s}" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5.4" fill="none" stroke="var(--info)" stroke-width="1.2" stroke-dasharray="2 1.6"/><path d="M4.6 4.7a1.5 1.5 0 1 1 2 1.4c-.4.2-.6.5-.6.9M6 8.6v.1" fill="none" stroke="var(--info)" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  chev: `<svg width="10" height="10" viewBox="0 0 10 10"><path d="m3 2 3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  chevd: `<svg width="10" height="10" viewBox="0 0 10 10"><path d="m2 3.5 3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
};
const pill = (sev, txt, sm) => sev === 'ok' ? `<span class="pill ok${sm ? ' sm' : ''}">${txt}</span>`
  : `<span class="pill ${sev}${sm ? ' sm' : ''}">${sev === 'crit' ? '◆' : '▲'} ${txt}</span>`;
const conf = (n, t) => `<span class="conf"><i>${[1, 2, 3, 4, 5].map(k => `<b class="${k <= n ? 'f' : ''}"></b>`).join('')}</i>${t}</span>`;

/* ---------------- signals ---------------- */
const SIGS = {
  cflow:  { key: 'Coolant_flow_m3h', name: 'Coolant flow', unit: 'm³/h', lo: 105, dp: 1, base: 120.0, onset: 1394, sev: 'warn', st: 'LO' },
  rtemp:  { key: 'Coolant_return_temp_C', name: 'Coolant return temp', unit: '°C', hi: 38, dp: 1, base: 32.0, onset: 1401, sev: 'warn', st: 'H' },
  tempA:  { key: 'Reactor_temp_A_C', name: 'Reactor temperature', unit: '°C', hi: 85, hh: 90, dp: 1, base: 78.0, onset: 1408, companion: 'Reactor_temp_B_C', sev: 'crit', st: 'HH' },
  press:  { key: 'Reactor_pressure_bar', name: 'Reactor pressure', unit: 'bar', hi: 4.6, hh: 5.2, dp: 2, base: 4.2, onset: 1419, sev: 'crit', st: 'HH' },
  energy: { key: 'Total_energy_kW', name: 'Total energy', unit: 'kW', hi: 380, dp: 0, base: 310, onset: 1419, sev: 'warn', st: 'H' },
  feed:   { key: 'Feed_flow_m3h', name: 'Feed flow', unit: 'm³/h', lo: 42, dp: 1, base: 45.0, ruled: true, sev: 'ok', st: 'Normal' },
  agit:   { key: 'Agitator_current_A', name: 'Agitator current', unit: 'A', dp: 1, base: 52.0, ruled: true, sev: 'ok', st: 'Normal' },
};
Object.entries(SIGS).forEach(([id, s]) => { s.id = id; s.data = D[s.key]; if (s.companion) s.data2 = D[s.companion]; });
const CAUSAL = ['cflow', 'rtemp', 'tempA', 'press', 'energy'];
CAUSAL.forEach((id, k) => SIGS[id].order = k + 1);

const ALARMS = [
  { r: T(2, 20), sev: 'warn', tag: 'feed' }, { r: T(8, 30), sev: 'warn', tag: 'feed' },
  { r: T(9, 3), sev: 'warn', tag: 'cflow' }, { r: T(9, 10), sev: 'warn', tag: 'rtemp' },
  { r: T(9, 15), sev: 'warn', tag: 'tempA' }, { r: T(9, 20), sev: 'crit', tag: 'tempA' },
  { r: T(9, 24), sev: 'warn', tag: 'press' }, { r: T(9, 24), sev: 'warn', tag: 'energy' },
  { r: T(9, 26), sev: 'warn', tag: 'press' }, { r: T(9, 28), sev: 'warn', tag: 'press' },
  { r: T(9, 38), sev: 'crit', tag: 'press' },
];
const EVENTS = [
  { a: T(15, 0, 14), b: T(15, 12, 14), kind: 'proc', label: 'Batch 4471 charging' },
  { a: T(19, 0, 14), kind: 'shift', label: 'Shift handover' }, { a: T(22, 40, 14), kind: 'lab', label: 'Lab sample' },
  { a: T(3, 0), kind: 'shift', label: 'Shift handover' }, { a: T(7, 0), kind: 'shift', label: 'Shift handover' },
  { a: T(8, 15), b: T(8, 45), kind: 'maint', label: 'CV-204 service' },
  { a: T(8, 46), kind: 'ops', label: 'CV-204 → AUTO' },
];

/* ---------------- illustrative signals (Frame C only) ---------------- */
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function synth(seed, base, noise, shape) { const r = rng(seed); const out = new Array(N); let w = 0; for (let i = 0; i < N; i++) { w = w * 0.85 + (r() - 0.5) * noise; out[i] = +(base + w + (shape ? shape(i) : 0)).toFixed(3); } return out; }
const ramp = (i, a, b, amt) => i <= a ? 0 : i >= b ? amt : amt * (i - a) / (b - a);
const maint = (i, amt) => (i >= T(8, 15) && i < T(8, 46) ? amt : 0);
const X = [
  { id: 'cvpos', grp: 'jacket', name: 'CV-204 valve position', unit: '%', dp: 0, data: synth(11, 64, 0.8, i => maint(i, -30) + ramp(i, T(8, 50), NOW, -23)), dev: true, onset: T(8, 51), sev: 'warn', st: 'Closing' },
  { id: 'cvout', grp: 'jacket', name: 'CV-204 controller output', unit: '%', dp: 0, data: synth(12, 64, 0.8, i => maint(i, -30) + Math.min(36, ramp(i, T(8, 51), T(9, 22), 36))), dev: true, onset: T(8, 52), sev: 'warn', st: 'Max' },
  { id: 'p204d', grp: 'jacket', name: 'P-204 discharge pressure', unit: 'bar', dp: 2, data: synth(13, 3.1, 0.02, i => ramp(i, T(8, 52), NOW, 0.42)), dev: true, onset: T(8, 56), sev: 'warn', st: 'High' },
  { id: 'p204i', grp: 'jacket', name: 'P-204 motor current', unit: 'A', dp: 1, data: synth(14, 38, 0.3, i => ramp(i, T(8, 52), NOW, -2.2)) },
  { id: 'jin', grp: 'jacket', name: 'Jacket inlet temp', unit: '°C', dp: 1, data: synth(15, 24.0, 0.25) },
  { id: 'tempC', grp: 'vessel', name: 'Reactor temp C (top)', unit: '°C', dp: 1, data: SIGS.tempA.data.map((v, i) => +(v - 0.6 + Math.sin(i / 7) * 0.08).toFixed(2)), dev: true, onset: T(9, 9), sev: 'crit', st: 'HH' },
  { id: 'cond', grp: 'vessel', name: 'Condenser duty', unit: 'kW', dp: 0, data: synth(16, 85, 1.2, i => ramp(i, T(9, 18), NOW, 36)), dev: true, onset: T(9, 21), sev: 'warn', st: 'High' },
  { id: 'vent', grp: 'vessel', name: 'Vent valve PV-206', unit: '%', dp: 0, data: synth(17, 0.3, 0.1, i => ramp(i, T(9, 28), NOW, 12)), dev: true, onset: T(9, 30), sev: 'warn', st: 'Open' },
  { id: 'lvl', grp: 'vessel', name: 'Reactor level', unit: '%', dp: 1, data: synth(18, 68, 0.3) },
  { id: 'n2', grp: 'vessel', name: 'N₂ blanket pressure', unit: 'bar', dp: 2, data: synth(19, 0.35, 0.01) },
  { id: 'psv', grp: 'vessel', name: 'PSV-205 lift', unit: '', dp: 0, data: new Array(N).fill(0) },
  { id: 'fsp', grp: 'feed', name: 'FIC-210 setpoint', unit: 'm³/h', dp: 1, data: new Array(N).fill(45) },
  { id: 'fop', grp: 'feed', name: 'FIC-210 output', unit: '%', dp: 0, data: synth(21, 52, 0.6) },
  { id: 'ftemp', grp: 'feed', name: 'Feed temperature', unit: '°C', dp: 1, data: synth(22, 25, 0.2) },
  { id: 'cat', grp: 'feed', name: 'Catalyst flow', unit: 'kg/h', dp: 2, data: synth(23, 1.8, 0.02) },
  { id: 'dens', grp: 'feed', name: 'Feed density', unit: 'kg/L', dp: 3, data: synth(24, 0.92, 0.002) },
  { id: 'rpm', grp: 'agit', name: 'Agitator speed', unit: 'rpm', dp: 0, data: synth(25, 120, 0.4) },
  { id: 'vib', grp: 'agit', name: 'Agitator vibration', unit: 'mm/s', dp: 1, data: synth(26, 2.1, 0.05) },
  { id: 'wind', grp: 'agit', name: 'Motor winding temp', unit: '°C', dp: 1, data: synth(27, 61, 0.3) },
  { id: 'hst', grp: 'header', name: 'CW header supply temp', unit: '°C', dp: 1, data: synth(31, 24.1, 0.22) },
  { id: 'hp', grp: 'header', name: 'CW header pressure', unit: 'bar', dp: 2, data: synth(32, 4.0, 0.02) },
  { id: 'r1t', grp: 'header', name: 'Reactor-01 temperature', unit: '°C', dp: 1, data: synth(33, 76.5, 0.3) },
  { id: 'r1f', grp: 'header', name: 'Reactor-01 coolant flow', unit: 'm³/h', dp: 1, data: synth(34, 118, 0.9) },
  { id: 'r3t', grp: 'header', name: 'Reactor-03 temperature', unit: '°C', dp: 1, data: synth(35, 79.2, 0.3) },
  { id: 'r3f', grp: 'header', name: 'Reactor-03 coolant flow', unit: 'm³/h', dp: 1, data: synth(36, 122, 0.9) },
];
X.forEach(s => { s.sev = s.sev || 'ok'; s.st = s.st || 'Normal'; s.base = s.data[0]; });
const ALL = [...Object.values(SIGS).map(s => ({ ...s, grp: s.id === 'feed' ? 'feed' : s.id === 'agit' ? 'agit' : ['cflow', 'rtemp'].includes(s.id) ? 'jacket' : 'vessel', dev: !s.ruled })), ...X];
const byId = id => SIGS[id] || X.find(x => x.id === id);

const fmt = (v, dp) => v == null ? '—' : v.toFixed(dp);
function niceTicks(lo, hi, n) { const st0 = (hi - lo) / n, mag = Math.pow(10, Math.floor(Math.log10(st0))); const st = [1, 2, 2.5, 5, 10].map(k => k * mag).find(s => s >= st0); const out = []; for (let v = Math.ceil(lo / st) * st; v <= hi + 1e-9; v += st) out.push(+v.toFixed(6)); return out; }
function timeTicks(a, b, w) { const steps = [1, 2, 5, 10, 15, 30, 60, 120, 180, 240]; const step = steps.find(s => w / ((b - a) / s) >= 80) || 240; const out = []; for (let t = Math.ceil((a + 580) / step) * step - 580; t <= b; t += step) out.push(t); return out; }

/* ---------------- state ---------------- */
const PRESETS = { '1 h': 60, '4 h': 240, '24 h': 1440 };
const ST = { frame: 'A', vp: '1920', theme: 'day', fw: 1920, fh: 1080, a: 0, b: NOW, mode: 'lanes', showNormal: false, parked: null };
const frameEl = document.getElementById('frame');

/* ================= drawing ================= */
const DEFS = `<defs><pattern id="hM" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="rgba(138,155,176,.08)"/><line x1="0" y1="0" x2="0" y2="6" stroke="rgba(138,155,176,.4)" stroke-width="1.2"/></pattern>
<pattern id="hQ" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="5" stroke="rgba(212,107,224,.45)" stroke-width="1"/></pattern></defs>`;
const xOf = (i, w) => (i - ST.a) / (ST.b - ST.a) * (w - 14) + 2;   // 12px right gutter so the latest point is never clipped
function path(arr, xf, yf) { let d = '', pen = false; const step = Math.max(1, Math.floor((ST.b - ST.a) / 1500)); for (let i = Math.floor(ST.a); i <= Math.ceil(ST.b); i += step) { const v = arr[i]; if (v == null) { pen = false; continue; } d += (pen ? 'L' : 'M') + xf(i).toFixed(1) + ' ' + yf(v).toFixed(1); pen = true; } return d; }
function marker(sev, x, y) { return sev === 'crit' ? `<path d="M${x} ${y - 6}L${x + 6} ${y}L${x} ${y + 6}L${x - 6} ${y}Z" fill="var(--crit)" stroke="var(--bg-0)" stroke-width="1.5"/>` : `<path d="M${x} ${y - 5.5}L${x + 6} ${y + 4.5}L${x - 6} ${y + 4.5}Z" fill="var(--warn)" stroke="var(--warn-edge)" stroke-width="1"/>`; }

function drawLane(el, s, compact) {
  const ord = el.dataset.ord || s.order;
  const w = el.offsetWidth, h = el.offsetHeight; if (!w || !h) return;
  const { a, b } = ST; const xf = i => xOf(i, w);
  let lo = Infinity, hi = -Infinity;
  for (let i = Math.floor(a); i <= Math.ceil(b); i++) for (const arr of [s.data, s.data2]) { const v = arr && arr[i]; if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
  if (!compact) [s.lo, s.hi, s.hh].forEach(L => { if (L != null) { lo = Math.min(lo, L); hi = Math.max(hi, L); } });   // scale always includes the limits
  const minSpan = Math.max(Math.abs(s.base || 1) * 0.02, 1e-3); if (hi - lo < minSpan) { const m = (hi + lo) / 2; hi = m + minSpan / 2; lo = m - minSpan / 2; }
  const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
  const pT = compact ? 4 : 18, pB = compact ? 4 : 8;
  const yf = v => pT + (1 - (v - lo) / (hi - lo)) * (h - pT - pB);
  let g = DEFS;
  const on = T(8, 50); if (on < b) { const x0 = xf(Math.max(a, on)); g += `<rect x="${x0}" y="0" width="${xf(b) - x0 + 12}" height="${h}" fill="var(--band)"/>`; }
  const mA = T(8, 15), mB = T(8, 45); if (mB > a && mA < b && !compact) g += `<rect x="${xf(Math.max(a, mA))}" y="0" width="${xf(Math.min(b, mB)) - xf(Math.max(a, mA))}" height="${h}" fill="url(#hM)" opacity=".6"><title>CV-204 maintenance 08:15–08:45</title></rect>`;
  if (!compact) niceTicks(lo, hi, h > 120 ? 3 : 2).forEach(v => { const y = yf(v); if (y < pT || y > h - pB) return; g += `<line x1="0" x2="${w}" y1="${y}" y2="${y}" stroke="var(--line-1)"/><text x="6" y="${y - 3}" font-size="10" fill="var(--ink-3)" class="num">${+v.toFixed(3)}</text>`; });
  if (s.data2 && !compact) { let st = null; for (let i = Math.floor(a); i <= Math.ceil(b) + 1; i++) { const nul = s.data2[i] == null && i <= b; if (nul && st == null) st = i; if (!nul && st != null) { const x0 = xf(Math.max(a, st - .5)), x1 = xf(Math.min(b, i - .5)); g += `<rect x="${x0}" y="${pT}" width="${Math.max(2, x1 - x0)}" height="${h - pT - pB}" fill="url(#hQ)"><title>Temp B: bad data quality ${hhmm(st)}–${hhmm(i - 1)}</title></rect>`; if (x1 - x0 > 70) g += `<text x="${(x0 + x1) / 2}" y="${h - pB - 4}" text-anchor="middle" font-size="10" fill="var(--badq)">B: bad data</text>`; st = null; } } }
  const main = path(s.data, xf, yf);
  if (s.data2 && !compact) g += `<path d="${path(s.data2, xf, yf)}" fill="none" stroke="var(--trace-dim)" stroke-width="1.1" stroke-dasharray="4 3"/>`;
  g += `<path d="${main}" fill="none" stroke="${s.ruled ? 'var(--trace-dim)' : 'var(--trace)'}" stroke-width="${compact ? 1.3 : 1.6}" stroke-linejoin="round"/>`;
  const lims = []; if (s.hi != null) lims.push([s.hi, 'warn', 'H', 1]); if (s.hh != null) lims.push([s.hh, 'crit', 'HH', 1]); if (s.lo != null) lims.push([s.lo, 'warn', 'LO', -1]);
  const id = 'k' + Math.random().toString(36).slice(2, 7);
  lims.forEach(([v, sev, lab, dir], k) => {
    const y = yf(v); if (y < 0 || y > h) return;
    g += `<clipPath id="${id}${k}"><rect x="0" y="${dir > 0 ? 0 : y}" width="${w}" height="${dir > 0 ? y : h - y}"/></clipPath>`;
    if (!compact) {
      g += `<path d="${main}L${xf(b)} ${y}L${xf(a)} ${y}Z" fill="var(--${sev}-bg)" clip-path="url(#${id}${k})"/>`;
      g += `<line x1="0" x2="${w}" y1="${y}" y2="${y}" stroke="var(--${sev === 'warn' ? 'warn-line' : 'crit'})" stroke-dasharray="5 4" opacity=".85"/>`;
      g += `<text x="44" y="${y + (dir > 0 ? -4 : 12)}" font-size="10" font-weight="600" fill="var(--${sev}-text)" class="num" paint-order="stroke" stroke="var(--bg-0)" stroke-width="3">${lab} ${v}</text>`;
    }
    g += `<path d="${main}" fill="none" stroke="var(--${sev === 'warn' ? 'warn-line' : 'crit'})" stroke-width="${compact ? 1.6 : 2.2}" clip-path="url(#${id}${k})"/>`;
  });
  if (!compact) { const cl = []; ALARMS.filter(x => x.tag === s.id && x.r >= a && x.r <= b).sort((p, q) => p.r - q.r).forEach(x => { const px = xf(x.r), l = cl[cl.length - 1]; if (l && px - l.px < 12) { if (x.sev === 'crit') l.sev = 'crit'; l.n++; } else cl.push({ px, sev: x.sev, n: 1, t: x.r }); });
    cl.forEach(c => g += `<g>${marker(c.sev, c.px, 9)}<title>${c.n > 1 ? c.n + ' alarms from ' : 'Alarm '}${hhmm(c.t)}</title></g>`); }
  if (s.onset >= a && s.onset <= b) { const x = xf(s.onset), y = yf(s.data[s.onset]);
    g += compact && !ord ? `<circle cx="${x}" cy="${y}" r="3.5" fill="var(--bg-0)" stroke="var(--ink-1)" stroke-width="1.4"/>`
      : `<g><circle cx="${x}" cy="${y}" r="8" fill="var(--bg-0)" stroke="var(--ink-1)" stroke-width="1.4"/><text x="${x}" y="${y + 3.5}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--ink-1)">${ord || ''}</text><title>First deviation ${hhmm(s.onset)}</title></g>`; }
  el.innerHTML = `<svg width="${w}" height="${h}">${g}</svg>`;
}

/* Compare: % of the way from 24 h baseline (0%) to alarm limit (100%). One axis, any units. */
const LIM = { cflow: 105, rtemp: 38, tempA: 85, press: 4.6, energy: 380, feed: 42 };
const pct = (id, v) => v == null ? null : (v - SIGS[id].base) / (LIM[id] - SIGS[id].base) * 100;
function drawCompare(el) {
  const w = el.offsetWidth, h = el.offsetHeight; const { a, b } = ST; const xf = i => xOf(i, w);
  const ser = CAUSAL.map((id, k) => ({ id, col: `var(--s${k + 1})`, arr: SIGS[id].data.map(v => pct(id, v)) }));
  let hi = 100; ser.forEach(s => { for (let i = a; i <= b; i++) if (s.arr[i] != null) hi = Math.max(hi, s.arr[i]); }); hi = Math.ceil((hi + 15) / 50) * 50; const lo = -50;
  const yf = v => 12 + (1 - (v - lo) / (hi - lo)) * (h - 20);
  let g = '';
  niceTicks(lo, hi, 5).forEach(v => { const y = yf(v); g += `<line x1="0" x2="${w}" y1="${y}" y2="${y}" stroke="var(--line-1)"/><text x="6" y="${y - 3}" font-size="10" fill="var(--ink-3)" class="num">${v}%</text>`; });
  const y100 = yf(100);
  g += `<line x1="0" x2="${w}" y1="${y100}" y2="${y100}" stroke="var(--warn-line)" stroke-dasharray="6 4"/><text x="50" y="${y100 - 5}" font-size="10.5" font-weight="600" fill="var(--warn-text)" paint-order="stroke" stroke="var(--bg-0)" stroke-width="3">100% = alarm limit</text>`;
  g += `<text x="50" y="${yf(0) - 5}" font-size="10.5" fill="var(--ink-3)" paint-order="stroke" stroke="var(--bg-0)" stroke-width="3">0% = normal (24 h average)</text>`;
  g += `<path d="${path(SIGS.feed.data.map(v => pct('feed', v)), xf, yf)}" fill="none" stroke="var(--trace-dim)" stroke-width="1.2" stroke-dasharray="2 3"/>`;
  ser.forEach(s => { g += `<path d="${path(s.arr, xf, yf)}" fill="none" stroke="${s.col}" stroke-width="2.2" stroke-linejoin="round"/>`;
    for (let i = a + 1; i <= b; i++) if (s.arr[i - 1] < 100 && s.arr[i] >= 100) { g += `<circle cx="${xf(i)}" cy="${y100}" r="5" fill="var(--bg-0)" stroke="${s.col}" stroke-width="2"><title>${SIGS[s.id].name} crossed its limit at ${hhmm(i)}</title></circle>`; break; } });
  el.innerHTML = `<svg width="${w}" height="${h}">${g}</svg>`;
}

function drawAxis(el) {
  const w = el.offsetWidth, h = el.offsetHeight; const { a, b } = ST; const xf = i => xOf(i, w); const span = b - a;
  let g = DEFS;
  const on = T(8, 50), ox = on >= a && on < b ? xf(on) : null;
  timeTicks(a, b, w).forEach(t => { const x = xf(t), mid = (t + 580) % 1440 === 0; g += `<line x1="${x}" x2="${x}" y1="0" y2="${h}" stroke="var(--line-1)"/>`; if (ox == null || (ox > 180 ? (x < ox - 175 || x > ox + 4) : (x < ox - 4 || x > ox + 130))) g += `<text x="${x + 4}" y="13" font-size="10.5" fill="${mid ? 'var(--ink-1)' : 'var(--ink-3)'}" class="num">${mid ? '15 Sep' : hhmm(t)}</text>`; });
  const y = 31;
  if (on < b) { const x0 = xf(Math.max(a, on)); g += `<rect x="${x0}" y="0" width="${xf(b) - x0 + 12}" height="${h}" fill="var(--band-strong)"/>`; if (ox != null) g += x0 > 180 ? `<text x="${x0 - 6}" y="13" text-anchor="end" font-size="11" font-weight="600" fill="var(--ink-1)">Incident from 08:50 →</text>` : `<text x="${x0 + 6}" y="13" font-size="11" font-weight="600" fill="var(--ink-1)">Incident from 08:50</text>`; }
  EVENTS.forEach(e => { if ((e.b || e.a) < a || e.a > b) return; const x = xf(Math.max(a, e.a));
    if (e.b) { const x1 = xf(Math.min(b, e.b)); g += `<rect x="${x}" y="${y - 7}" width="${Math.max(3, x1 - x)}" height="14" rx="2" fill="${e.kind === 'maint' ? 'url(#hM)' : 'rgba(167,176,186,.16)'}" stroke="${e.kind === 'maint' ? 'var(--maint)' : 'var(--line-2)'}"><title>${e.label} ${hhmm(e.a)}–${hhmm(e.b)}</title></rect>`;
      if (span <= 240 && x1 - x > 70) g += `<text x="${x + 5}" y="${y + 3.5}" font-size="10.5" fill="var(--ink-1)">${e.label}</text>`; }
    else { g += e.kind === 'shift' ? `<line x1="${x}" x2="${x}" y1="${y - 7}" y2="${y + 7}" stroke="var(--ink-3)" stroke-width="1.5"><title>${e.label} ${hhmm(e.a)}</title></line>` : `<circle cx="${x}" cy="${y}" r="4" fill="${e.kind === 'ops' ? 'var(--ink-1)' : 'var(--bg-0)'}" stroke="var(--ink-2)" stroke-width="1.3"><title>${e.label} ${hhmm(e.a)}</title></circle>`;
      if (span <= 240 && e.kind === 'ops') g += `<text x="${x + 8}" y="${y + 3.5}" font-size="10.5" fill="var(--ink-2)">${e.label}</text>`; } });
  el.innerHTML = `<svg width="${w}" height="${h}">${g}</svg>`;
}

/* ================= templates ================= */
function header() {
  const day = ST.theme === 'day';
  return `<header class="hdr">
    <div class="asset"><b>Reactor-02</b><span>Unit 200 · Batch 4471 · Running</span></div>
    <div class="kpi"><span class="k">Severity</span><span class="v">${pill('crit', 'Critical')}<span class="c-crit">↑ Worsening</span></span></div>
    <div class="kpi"><span class="k">Started</span><span class="v"><span class="num">08:50</span><small class="hide1440">25 min before the first temperature alarm</small></span></div>
    <div class="kpi"><span class="k">Affected</span><span class="v">Jacket cooling loop<small class="hide1440">CV-204 · P-204</small></span></div>
    <div class="kpi"><span class="k">Trip risk</span><span class="v"><span class="num">78%</span><small>within 4 h</small></span></div>
    <span class="sp"></span>
    <div class="kpi"><span class="k">Day shift</span><span class="v num">09:40 <span class="live">LIVE</span></span></div>
    <div class="due kpi"><span class="k">Supervisor decision</span><span class="v"><span class="num">10:00</span><small>in 20 min</small></span></div>
    <button class="themebtn" data-act="theme" title="${day ? 'Day theme · switches to Night at 19:00 handover' : 'Night theme · switches to Day at 07:00 handover'}">${day
      ? '<svg width="15" height="15" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6 13 13M3 13l1.4-1.4M11.6 4.4 13 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
      : '<svg width="15" height="15" viewBox="0 0 16 16"><path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>'}</button>
  </header>`;
}
function toolbar() {
  const span = ST.b - ST.a, preset = Object.keys(PRESETS).find(k => PRESETS[k] === span && ST.b === NOW);
  const zoomed = !preset;
  return `<div class="toolbar">
    <div class="seg2">${Object.keys(PRESETS).map(p => `<button class="${p === preset ? 'on' : ''}" data-p="${p}">${p}</button>`).join('')}</div>
    ${zoomed ? `<span class="chip num">15 Sep ${hhmm(ST.a)} → ${hhmm(ST.b)}<button data-act="reset" title="Back to 24 h">×</button></span>`
             : `<span class="range num">${ST.a < 860 ? '14 Sep ' : '15 Sep '}${hhmm(ST.a)} → 15 Sep 09:40</span>
                <button class="btn zoom" data-act="zoominc"><svg width="13" height="13" viewBox="0 0 14 14"><circle cx="6" cy="6" r="4.3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m9.3 9.3 3 3M4 6h4M6 4v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Zoom to incident <span class="num" style="opacity:.75">08:45–09:40</span></button>`}
    <span class="sp"></span>
    ${ST.frame === 'C' ? '' : `<div class="seg2"><button class="${ST.mode === 'lanes' ? 'on' : ''}" data-m="lanes">Own units</button><button class="${ST.mode === 'compare' ? 'on' : ''}" data-m="compare">Compare</button></div>`}
    <button class="btn">+ Add signal</button>
  </div>`;
}
const laneRow = (s, compact) => `<div class="row lane${compact ? ' c' : ''}">
  <div class="lh"><div class="nm">${s.order ? `<span class="ord">${s.order}</span>` : ''}<span>${s.name}</span></div>
    <div class="vv"><b data-val="${s.id}">${fmt(s.data[ST.b], s.dp)}</b><span class="u">${s.unit}</span>${pill(s.sev, s.st, compact)}</div></div>
  <div class="plot hit" data-sig="${s.id}" data-ord="${s.order || ''}" ${compact ? 'data-compact="1"' : ''}></div></div>`;
const axisRow = () => `<div class="row axis-row" style="flex:0 0 46px"><div class="lh">Events</div><div class="plot hit" data-axis="1"></div></div>`;
function normalRow() {
  if (ST.showNormal) return `${['feed', 'agit'].map(id => laneRow(SIGS[id], true)).join('')}<div class="normal-row">${IC.ok(12)} Feed flow and agitator current are within normal range <span style="flex:1"></span><button class="linkbtn" data-act="normal">Hide</button></div>`;
  return `<div class="normal-row">${IC.ok(12)} <b>2 signals normal</b> · Feed flow <span class="num">${fmt(SIGS.feed.data[ST.b], 1)}</span> m³/h · Agitator current <span class="num">${fmt(SIGS.agit.data[ST.b], 1)}</span> A <span style="flex:1"></span><button class="linkbtn" data-act="normal">Show</button></div>`;
}
function chartAB() {
  if (ST.mode === 'compare') return `${axisRow()}
    <div class="row" style="flex:1.25 1 0">
      <div class="lh"><div class="nm" style="color:var(--ink-1);font-weight:600">Compare</div><div class="mut" style="font-size:11.5px;white-space:normal">% of the way from normal to the alarm limit</div>
        <div class="cmp-lg">${CAUSAL.map((id, k) => `<div><span class="sw" style="border-color:var(--s${k + 1})"></span><span>${SIGS[id].name}</span><b data-cmp="${id}"></b></div>`).join('')}<div><span class="sw" style="border-color:var(--trace-dim);border-top-style:dotted"></span><span class="mut">Feed flow</span><b data-cmp="feed"></b></div></div></div>
      <div class="plot hit" data-cmp-plot="1"></div></div>
    ${CAUSAL.map(id => laneRow(SIGS[id], true)).join('')}${normalRow()}`;
  return `${axisRow()}${CAUSAL.map(id => laneRow(SIGS[id])).join('')}${normalRow()}`;
}
function chartC() {
  const dev = ALL.filter(s => s.dev).sort((p, q) => p.onset - q.onset);
  const groups = [['header', 'Shared cooling water · Reactor-01 & -03'], ['jacket', 'Jacket cooling loop'], ['vessel', 'Reactor vessel'], ['feed', 'Feed system'], ['agit', 'Agitator M-201']];
  const g = groups.map(([id, name]) => { const m = ALL.filter(s => s.grp === id && !s.dev); if (!m.length) return '';
    return `<div class="grp">${IC.chev}<b>${name}</b><span class="r">${IC.ok(12)} ${m.length} normal</span></div>`; }).join('');
  return `${axisRow()}<div class="list">
    <div class="grp dev">${IC.warn(12)}<b>11 of 33 signals deviated</b><span>· in the order they changed</span></div>
    ${dev.map((s, k) => laneRow({ ...s, order: k + 1 }, true)).join('')}
    <div class="grp" style="background:none;color:var(--ink-3)"><b style="color:var(--ink-2);font-weight:500">22 normal signals, grouped by asset</b><span class="r">expand a group to see its signals</span></div>
    ${g}</div>`;
}
function panel() {
  const C = ST.frame === 'C';
  const n = C ? 4 : 3;
  const meter = `<span class="meter">${[1, 2, 3, 4].map(k => `<i class="${k <= n ? 'f' : ''}"></i>`).join('')}</span>`;
  return `<aside class="panel"><div class="scroll">
    <section class="blk first">
      <div class="lbl">Do first</div>
      <h2>Switch to the backup cooling route</h2>
      <p>Cooling is failing while feed is normal. Restoring cooling fixes the cause.</p>
      <div class="confrow">${meter}<span><b>${C ? 'Very high' : 'High'} confidence</b> · ${n} of 4 checks agree</span></div>
      <button class="btn primary wide">Send to supervisor</button>
      <details class="more"><summary>Why not the other two options</summary><ul>
        <li><b style="color:var(--ink-1);font-weight:500">Reduce feed:</b> feed is normal. It slows the rise but leaves the cause.</li>
        <li><b style="color:var(--ink-1);font-weight:500">Keep watching:</b> two HH alarms and still rising.</li></ul></details>
    </section>
    <section class="blk">
      <div class="lbl">Why</div>
      ${C ? `<div class="upd">${IC.yes(12)}<span><b>25 signals added.</b> The cause is unchanged and is now confirmed.</span></div>` : ''}
      <div class="ans">Cooling lost at valve CV-204</div>
      <ul class="checks">
        <li>${IC.yes(13)}<span>Began 4 min after CV-204 came back from maintenance</span></li>
        <li>${IC.yes(13)}<span>Cooling moved first, then temperature, then pressure (1 → ${C ? 11 : 5} on the chart)</span></li>
        <li>${IC.yes(13)}<span>Reactor-01 and -03 share the cooling water and are normal</span></li>
        ${C ? `<li>${IC.yes(13)}<span><span class="new">NEW</span>CV-204 is closing (64% → 41%) while its controller asks it to open</span></li>`
            : `<li>${IC.unk(13)}<span>Valve or pump? Not confirmed yet<em>Add CV-204 position to check</em></span></li>`}
      </ul>
    </section>
    <section class="blk">
      <div class="lbl">Ruled out</div>
      <ul class="ruled">
        <li>${IC.ok(13)}Feed rate<span>steady at 45 m³/h</span></li>
        <li>${IC.ok(13)}Agitator<span>steady at 52 A</span></li>
        <li>${IC.ok(13)}Temperature sensor<span>A and B agree</span></li>
        <li>${IC.ok(13)}Cooling water supply<span>neighbours normal</span></li>
        ${C ? `<li>${IC.ok(13)}Pump P-204<span>pushing harder, not failing</span></li>` : ''}
      </ul>
    </section>
  </div></aside>`;
}

/* ================= render & interaction ================= */
function render() {
  size(); frameEl.style.transform = 'none';
  frameEl.className = 'frame f' + ST.frame + ' ' + ST.theme + (ST.vp === '1440' ? ' vp1440' : '');
  if (ST.frame === 'C') frameEl.style.setProperty('--lh-w', ST.vp === '1440' ? '210px' : '236px'); else frameEl.style.removeProperty('--lh-w');
  frameEl.innerHTML = header() + `<div class="body"><main class="main">${toolbar()}<div class="chart">${ST.frame === 'C' ? chartC() : chartAB()}<div class="cur"></div><div class="cur-tip"></div><div class="sel"></div></div></main>${panel()}</div>`;
  requestAnimationFrame(() => {
    frameEl.querySelectorAll('[data-sig]').forEach(p => drawLane(p, byId(p.dataset.sig), !!p.dataset.compact));
    frameEl.querySelectorAll('[data-axis]').forEach(drawAxis);
    frameEl.querySelectorAll('[data-cmp-plot]').forEach(drawCompare);
    setCursor(ST.parked); bind(); fit();
  });
}
function plotGeom() { const chart = frameEl.querySelector('.chart'); const ax = chart.querySelector('[data-axis]'); return { chart, ax, left: ax.offsetLeft, w: ax.offsetWidth }; }
function setCursor(i) {
  const { chart, ax, left, w } = plotGeom(); const cur = chart.querySelector('.cur'), tip = chart.querySelector('.cur-tip'); const top = ax.parentElement.offsetTop;
  if (i == null) { cur.style.display = tip.style.display = 'none'; }
  else { const x = left + xOf(i, w); cur.style.cssText = `display:block;left:${x}px;top:${top}px`; tip.style.cssText = `display:block;left:${x}px;top:${top}px`; tip.textContent = hhmm(i); }
  const k = i == null ? ST.b : Math.round(i);
  frameEl.querySelectorAll('[data-val]').forEach(n => { const s = byId(n.dataset.val); n.textContent = fmt(s.data[k], s.dp); });
  frameEl.querySelectorAll('[data-cmp]').forEach(n => { const v = pct(n.dataset.cmp, SIGS[n.dataset.cmp].data[k]); n.textContent = v == null ? '—' : Math.round(v) + '%'; n.className = v >= 100 ? 'c-warn' : ''; });
}
function bind() {
  const { chart } = plotGeom(); const sel = chart.querySelector('.sel');
  const toIdx = e => { const r = chart.getBoundingClientRect(), sc = r.width / chart.offsetWidth, { left, w } = plotGeom(); const x = (e.clientX - r.left) / sc - left; if (x < 0) return null; return Math.max(ST.a, Math.min(ST.b, ST.a + (x - 2) / (w - 14) * (ST.b - ST.a))); };
  let d0 = null;
  chart.addEventListener('mousedown', e => { const i = toIdx(e); if (i != null && e.target.closest('.plot')) { d0 = i; e.preventDefault(); } });
  chart.addEventListener('mousemove', e => { const i = toIdx(e); if (i == null || !e.target.closest('.plot')) { if (d0 == null) setCursor(ST.parked); return; } setCursor(i);
    if (d0 != null) { const { left, w, ax } = plotGeom(); const x0 = left + xOf(Math.min(d0, i), w), x1 = left + xOf(Math.max(d0, i), w); sel.style.cssText = `display:block;left:${x0}px;width:${x1 - x0}px;top:${ax.parentElement.offsetTop}px`; } });
  chart.addEventListener('mouseleave', () => { if (d0 == null) setCursor(ST.parked); });
  window.onmouseup = e => { if (d0 == null) return; const i = toIdx(e) ?? d0; const a = Math.round(Math.min(d0, i)), b = Math.round(Math.max(d0, i)); d0 = null; sel.style.display = 'none'; if (b - a >= 3) { ST.a = a; ST.b = b; ST.parked = null; render(); } };
  frameEl.querySelectorAll('[data-p]').forEach(bt => bt.onclick = () => { ST.b = NOW; ST.a = NOW - PRESETS[bt.dataset.p]; ST.parked = null; render(); });
  frameEl.querySelectorAll('[data-m]').forEach(bt => bt.onclick = () => { if (ST.frame === 'C') return; ST.mode = bt.dataset.m; render(); });
  frameEl.querySelector('[data-act="reset"]')?.addEventListener('click', () => { ST.a = 0; ST.b = NOW; ST.parked = null; render(); });
  frameEl.querySelector('[data-act="normal"]')?.addEventListener('click', () => { ST.showNormal = !ST.showNormal; render(); });
  frameEl.querySelector('[data-act="zoominc"]')?.addEventListener('click', () => { ST.a = T(8, 45); ST.b = NOW; ST.parked = null; render(); });
  frameEl.querySelector('[data-act="theme"]')?.addEventListener('click', () => setTheme(ST.theme === 'day' ? 'night' : 'day'));
}
function size() { const st = document.querySelector('.stage'); ST.fw = Math.max(1280, st.clientWidth); ST.fh = Math.max(720, st.clientHeight); ST.vp = ST.fw < 1700 ? '1440' : '1920'; frameEl.style.width = ST.fw + 'px'; frameEl.style.height = ST.fh + 'px'; }
function fit() { const st = document.querySelector('.stage'); const s = Math.min(st.clientWidth / ST.fw, st.clientHeight / ST.fh, 1); frameEl.style.transform = s < 1 ? `scale(${s})` : 'none'; frameEl.style.left = Math.max(0, (st.clientWidth - ST.fw * s) / 2) + 'px'; frameEl.style.top = Math.max(0, (st.clientHeight - ST.fh * s) / 2) + 'px'; }
function setTheme(t) { ST.theme = t; render(); }
function go(f) {
  ST.frame = f; history.replaceState(null, '', '#' + f + (ST.theme === 'night' ? '-night' : '')); ST.showNormal = false;
  if (f === 'A') Object.assign(ST, { a: 0, b: NOW, mode: 'lanes', parked: null });
  if (f === 'B') Object.assign(ST, { a: T(9, 0), b: T(9, 25), mode: 'compare', parked: T(9, 15) });
  if (f === 'C') Object.assign(ST, { a: NOW - 240, b: NOW, mode: 'lanes', parked: null });
  document.querySelectorAll('#frameSeg button').forEach(b => b.classList.toggle('on', b.dataset.f === f)); render();
}
document.querySelectorAll('#frameSeg button').forEach(b => b.onclick = () => go(b.dataset.f));
let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(render, 120); });
window.addEventListener('keydown', e => { if (e.key === 'Escape' && !(ST.a === 0 && ST.b === NOW) && ST.frame === 'A') { ST.a = 0; ST.b = NOW; render(); } });
if (/night/.test(location.hash)) ST.theme = 'night';
go((location.hash.match(/[ABC]/) || ['A'])[0]);
})();
