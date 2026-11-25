# Process Investigation Workspace · Reactor-02

Design assignment: an investigation screen for a process engineer looking into the Reactor-02 temperature excursion (Batch 4471, 15 Sep 2026).

## What's here

| Folder | Contents |
|---|---|
| `prototype/` | The hosted prototype: three screens (A · default 24 h, B · zoomed & compared, C · 33-signal stress case). Static HTML/CSS/JS, no build step. |
| `design-note/` | One-page design note (PDF + source HTML). |
| `figma-make/` | The same prototype packaged for Figma Make (`App.tsx` + modules). |
| `research/` | Competitor benchmark (Seeq, TrendMiner, PI Vision, Ignition, Grafana). |

## Run locally

Open `prototype/index.html` in a browser, or serve the folder:

```bash
cd prototype && python3 -m http.server 4321
```

## Deploy

Vercel serves `prototype/` directly (see `vercel.json`). Import the repo with the "Other" framework preset; no build command is needed.

Data: synthetic data pack supplied with the brief. Screen C's 25 added signals are illustrative.
