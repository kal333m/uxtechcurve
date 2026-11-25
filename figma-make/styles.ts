// Design tokens + layout (Day = ISA-101 light grey, Night = dark graphite)
export const css = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
/* Process Investigation Workspace — v3
   Two themes, one meaning. Theme follows the shift: Day = ISA-101 light grey (lit control room / office),
   Night = dark graphite (dim control room, less glare). Alarm colours and shapes are identical in both.
   ISA-18.2 priority: red diamond = critical (HH), amber triangle = warning (H / LO). Colour is never alone. */

/* ---------- Night (dark) ---------- */
.frame, .frame.night {
  --bg-0: #14171A;  --bg-1: #1A1E22;  --bg-2: #21262B;  --bg-3: #2A3037;
  --hdr: #1A1E22;   --act: #1E242B;   --quiet: #171B1E;
  --line-1: #272D33; --line-2: #3A424A;
  --ink-1: #E6E9EC; --ink-2: #A9B1BA; --ink-3: #7D8792;
  --trace: #C3C9D0; --trace-dim: #66707A;
  --crit: #F2474F; --crit-text: #FF6B72; --crit-bg: rgba(242,71,79,.14);
  --warn: #F5A524; --warn-line: #F5A524; --warn-text: #F5B544; --warn-edge: #14171A; --warn-bg: rgba(245,165,36,.12);
  --ok: #8FA39A; --info: #6CA6D9; --badq: #D46BE0; --maint: #8A9BB0;
  --band: rgba(230,233,236,.04); --band-strong: rgba(230,233,236,.07);
  --accent: #4C9AFF; --accent-bg: rgba(76,154,255,.14); --btn: #2B6FD6;
  --s1: #3987E5; --s2: #199E70; --s3: #9085E9; --s4: #7FA33A; --s5: #C86FA0;
  --shadow: none;
}
/* ---------- Day (ISA-101 light grey) ---------- */
.frame.day {
  --bg-0: #F3F4F6;  --bg-1: #FAFAFB;  --bg-2: #FFFFFF;  --bg-3: #E7EAEE;
  --hdr: #FAFAFB;   --act: #FFFFFF;   --quiet: #EDEFF2;
  --line-1: #E0E3E7; --line-2: #C9CED5;
  --ink-1: #1B2026; --ink-2: #4D5661; --ink-3: #636C77;
  --trace: #3A424C; --trace-dim: #9AA2AB;
  --crit: #D92D35; --crit-text: #C9252D; --crit-bg: rgba(217,45,53,.10);
  --warn: #F0A21A; --warn-line: #C27A00; --warn-text: #965A00; --warn-edge: #7A4A00; --warn-bg: rgba(240,162,26,.14);
  --ok: #4E6B5E; --info: #2F6FAE; --badq: #A23BB0; --maint: #6C7D91;
  --band: rgba(27,32,38,.035); --band-strong: rgba(27,32,38,.06);
  --accent: #2B6FD6; --accent-bg: rgba(43,111,214,.10); --btn: #2B6FD6;
  --s1: #2A78D6; --s2: #14936A; --s3: #6250D6; --s4: #5E8A1E; --s5: #C2457E;
  --shadow: 0 1px 2px rgba(20,30,40,.06);
}
:root { --f-ui: "Inter", system-ui, -apple-system, Segoe UI, sans-serif; --f-num: "JetBrains Mono", ui-monospace, Menlo, monospace; }
.frame { --lh-w: 184px; --panel-w: 372px; }
.frame.vp1440 { --lh-w: 168px; --panel-w: 330px; }

* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body { background: #0B0D0F; color: #E6E9EC; font: 13px/1.45 var(--f-ui); -webkit-font-smoothing: antialiased; overflow: hidden; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
.num { font-family: var(--f-num); font-variant-numeric: tabular-nums; letter-spacing: -.01em; }
.mut { color: var(--ink-3); } .sec { color: var(--ink-2); }
.c-crit { color: var(--crit-text); } .c-warn { color: var(--warn-text); }

/* screen switcher (A / B / C) — outside the product UI */
.deck { height: 40px; display: flex; align-items: center; justify-content: center; padding: 0 16px; background: #0B0D0F; border-bottom: 1px solid #1c2126; white-space: nowrap; overflow: hidden; }
.deck .seg { display: flex; gap: 2px; background: #15181c; border: 1px solid #252b31; border-radius: 8px; padding: 3px; }
.deck .seg button { display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px 4px 6px; border-radius: 5px; color: #A9B1BA; font-size: 12.5px; }
.deck .seg button span { width: 20px; height: 20px; border-radius: 4px; display: grid; place-items: center; font-weight: 700; font-size: 11px; background: #22272d; color: #E6E9EC; }
.deck .seg button.on { background: #2A3138; color: #F2F4F6; }
.deck .seg button.on span { background: #4C9AFF; color: #fff; }
.stage { position: absolute; inset: 40px 0 0 0; overflow: hidden; background: #0B0D0F; }
.frame { position: absolute; left: 0; top: 0; transform-origin: 0 0; background: var(--bg-0); color: var(--ink-1); display: grid; grid-template-rows: 60px 1fr; grid-template-columns: minmax(0, 1fr); overflow: hidden; }
.frame.vp1440 { grid-template-rows: 56px 1fr; }
.frame button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* ---------- header: answers when / what / how bad ---------- */
.hdr { overflow: hidden; display: flex; align-items: center; gap: 28px; padding: 0 24px; background: var(--hdr); border-bottom: 1px solid var(--line-1); position: relative; white-space: nowrap; }
.hdr::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--crit); }
.asset { display: flex; flex-direction: column; line-height: 1.25; }
.asset b { font-size: 17px; font-weight: 600; letter-spacing: -.015em; }
.asset span { font-size: 12px; color: var(--ink-3); }
.hdr .sp { flex: 1; }
.kpi { display: flex; flex-direction: column; line-height: 1.3; }
.kpi .k { font-size: 11px; color: var(--ink-3); }
.kpi .v { font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 7px; }
.kpi .v small { font-size: 12px; color: var(--ink-2); font-weight: 400; }
.live { display: inline-flex; align-items: center; gap: 5px; font: 700 10px var(--f-ui); letter-spacing: .06em; padding: 1px 6px; border: 1px solid var(--line-2); border-radius: 9px; color: var(--ink-2); }
.live::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--ink-2); }
.due { padding: 6px 12px; border-radius: 6px; background: var(--warn-bg); border: 1px solid var(--warn-line); }
.due .v { color: var(--ink-1); }
.themebtn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--line-2); display: grid; place-items: center; color: var(--ink-2); }
.pill { display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px; border-radius: 3px; font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; white-space: nowrap; }
.pill.crit { background: var(--crit); color: #fff; }
.pill.warn { background: var(--warn); color: #1b1300; }
.pill.ok { color: var(--ok); border: 1px solid var(--line-2); font-weight: 600; }
.pill.sm { height: 17px; font-size: 10px; padding: 0 5px; }

/* ---------- body ---------- */
.body { display: grid; grid-template-columns: minmax(0, 1fr) var(--panel-w); min-height: 0; }
.main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.toolbar { height: 52px; flex: none; display: flex; align-items: center; gap: 12px; padding: 0 20px; border-bottom: 1px solid var(--line-1); }
.seg2 { display: flex; border: 1px solid var(--line-2); border-radius: 5px; overflow: hidden; height: 30px; background: var(--bg-1); }
.seg2 button { white-space: nowrap; padding: 0 12px; color: var(--ink-2); border-right: 1px solid var(--line-2); font-size: 12.5px; font-weight: 500; }
.seg2 button:last-child { border-right: 0; }
.seg2 button.on { background: var(--bg-3); color: var(--ink-1); box-shadow: inset 0 -2px 0 var(--accent); }
.range { font-size: 12.5px; color: var(--ink-2); white-space: nowrap; }
.chip { display: inline-flex; align-items: center; gap: 8px; height: 28px; padding: 0 6px 0 12px; border-radius: 14px; background: var(--accent-bg); border: 1px solid var(--accent); font-size: 12.5px; white-space: nowrap; color: var(--ink-1); }
.chip button { width: 18px; height: 18px; border-radius: 9px; color: var(--ink-2); font-size: 14px; line-height: 1; }
.toolbar .sp { flex: 1; }
.btn { height: 30px; padding: 0 12px; border-radius: 5px; border: 1px solid var(--line-2); display: inline-flex; align-items: center; justify-content: center; gap: 7px; background: var(--bg-1); white-space: nowrap; font-size: 12.5px; font-weight: 500; color: var(--ink-1); }
.btn:hover { background: var(--bg-3); }
.btn.zoom { border-color: var(--accent); color: var(--accent); }
.btn.primary { background: var(--btn); border-color: var(--btn); color: #fff; }
.btn.wide { width: 100%; height: 36px; font-size: 13px; }

/* chart: every row shares one grid so time lines up */
.chart { flex: 1; min-height: 0; display: flex; flex-direction: column; position: relative; }
.row { display: grid; grid-template-columns: var(--lh-w) minmax(0, 1fr); border-bottom: 1px solid var(--line-1); position: relative; }
.lh { padding: 12px 14px 10px 20px; display: flex; flex-direction: column; gap: 4px; min-width: 0; overflow: hidden; border-right: 1px solid var(--line-1); }
.lh .nm { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: var(--ink-2); white-space: nowrap; }
.lh .nm span { overflow: hidden; text-overflow: ellipsis; }
.lh .vv { display: flex; align-items: baseline; gap: 5px; white-space: nowrap; }
.lh .vv b { font: 500 21px var(--f-num); letter-spacing: -.03em; }
.lh .vv .u { font-size: 11.5px; color: var(--ink-3); }
.lh .vv .pill { align-self: center; margin-left: auto; }
.ord { width: 18px; height: 18px; border-radius: 50%; border: 1.3px solid var(--ink-2); color: var(--ink-1); font: 700 10px var(--f-ui); display: grid; place-items: center; flex: none; }
.plot { position: relative; min-width: 0; }
.plot svg { position: absolute; inset: 0; display: block; }
.axis-row .lh { justify-content: center; font-size: 12px; color: var(--ink-3); }
.lane { flex: 1 1 0; min-height: 0; }
.lane.c { flex: 0 0 52px; }
.lane.c .lh { justify-content: center; gap: 1px; padding: 4px 14px 4px 20px; }
.lane.c .lh .nm { font-size: 12px; }
.lane.c .lh .vv b { font-size: 14px; }
.normal-row { flex: none; height: 40px; display: flex; align-items: center; gap: 10px; padding: 0 20px; border-bottom: 1px solid var(--line-1); font-size: 12.5px; color: var(--ink-2); background: var(--quiet); white-space: nowrap; overflow: hidden; }
.normal-row b { color: var(--ink-1); font-weight: 500; }
.linkbtn { color: var(--accent); font-size: 12.5px; font-weight: 500; }
.grp { flex: none; height: 36px; display: flex; align-items: center; gap: 10px; padding: 0 20px; border-bottom: 1px solid var(--line-1); font-size: 12.5px; color: var(--ink-2); white-space: nowrap; background: var(--quiet); }
.grp b { color: var(--ink-1); font-weight: 500; }
.grp .r { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; }
.grp.dev { background: var(--warn-bg); }
.grp.dev b { font-weight: 600; }
.cur { position: absolute; top: 0; bottom: 0; border-left: 1px solid var(--ink-1); opacity: .8; pointer-events: none; z-index: 5; display: none; }
.cur-tip { position: absolute; transform: translate(-50%, 3px); background: var(--ink-1); color: var(--bg-0); font: 600 11px var(--f-num); padding: 1px 6px; border-radius: 3px; z-index: 6; pointer-events: none; display: none; }
.sel { position: absolute; top: 0; bottom: 0; background: var(--accent-bg); border-left: 1px solid var(--accent); border-right: 1px solid var(--accent); pointer-events: none; z-index: 4; display: none; }
.plot.hit { cursor: crosshair; }
.note { flex: none; padding: 8px 20px; font-size: 12px; color: var(--ink-2); border-bottom: 1px solid var(--line-1); display: flex; gap: 8px; align-items: center; }
.cmp-lg { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.cmp-lg div { display: grid; grid-template-columns: 18px 1fr auto; align-items: center; font-size: 12px; color: var(--ink-2); }
.cmp-lg b { font: 500 12px var(--f-num); color: var(--ink-1); }
.cmp-lg b.c-warn { color: var(--warn-text); }
.sw { display: inline-block; width: 12px; border-top: 2.5px solid; }

/* ---------- side panel: three blocks, answer first ---------- */
.panel { background: var(--bg-1); border-left: 1px solid var(--line-1); display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.panel .scroll { flex: 1; min-height: 0; overflow: auto; }
.blk { padding: 22px 24px; border-bottom: 1px solid var(--line-1); }
.blk:last-child { border-bottom: 0; }
.blk.first { background: var(--act); box-shadow: var(--shadow); }
.lbl { font-size: 11px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.lbl .r { margin-left: auto; text-transform: none; letter-spacing: 0; font-weight: 500; color: var(--accent); font-size: 11.5px; }
.blk h2 { font-size: 20px; font-weight: 600; letter-spacing: -.02em; line-height: 1.25; }
.blk p { font-size: 13px; color: var(--ink-2); margin-top: 6px; }
.blk .ans { font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.confrow { display: flex; align-items: center; gap: 10px; margin: 14px 0 16px; font-size: 12.5px; color: var(--ink-2); }
.confrow b { color: var(--ink-1); font-weight: 600; }
.meter { display: inline-flex; gap: 3px; }
.meter i { width: 18px; height: 6px; border-radius: 3px; background: var(--bg-3); }
.meter i.f { background: var(--ink-1); }
details.more { margin-top: 12px; font-size: 12.5px; color: var(--ink-2); }
details.more summary { cursor: pointer; color: var(--ink-2); list-style: none; display: flex; align-items: center; gap: 6px; }
details.more summary::-webkit-details-marker { display: none; }
details.more summary::before { content: "›"; display: inline-block; transition: transform .15s; font-size: 14px; }
details.more[open] summary::before { transform: rotate(90deg); }
details.more ul { list-style: none; margin: 8px 0 0 14px; display: flex; flex-direction: column; gap: 4px; }
.checks { list-style: none; margin-top: 12px; display: flex; flex-direction: column; gap: 9px; }
.checks li { display: grid; grid-template-columns: 18px 1fr; gap: 8px; font-size: 13px; color: var(--ink-2); line-height: 1.4; }
.checks li svg { margin-top: 2px; }
.checks li em { font-style: normal; color: var(--accent); font-size: 12px; display: block; margin-top: 2px; }
.checks li .new { font-size: 10px; font-weight: 700; letter-spacing: .05em; color: var(--accent); margin-right: 4px; }
.ruled { list-style: none; margin-top: 4px; display: flex; flex-direction: column; }
.ruled li { display: grid; grid-template-columns: 18px 1fr auto; gap: 8px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--line-1); font-size: 13px; color: var(--ink-1); }
.ruled li:last-child { border-bottom: 0; }
.ruled li span { color: var(--ink-3); font-size: 12px; text-align: right; }
.upd { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; color: var(--ink-2); padding: 10px 12px; border-radius: 6px; background: var(--accent-bg); margin-bottom: 14px; }
.upd b { color: var(--ink-1); font-weight: 600; }

/* 1440 × 900 */
.frame.vp1440 .hdr { gap: 18px; padding: 0 18px; }
.frame.vp1440 .hide1440 { display: none; }
.frame.vp1440 .blk { padding: 18px 18px; }
.frame.vp1440 .toolbar { padding: 0 14px; gap: 10px; }
.frame.vp1440 .lh { padding-left: 16px; }

.list { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; scrollbar-width: none; }
.list::-webkit-scrollbar { display: none; }
.list > * { flex-shrink: 0; }
.frame.vp1440 .list .lane.c { flex-basis: 46px; }
`;
