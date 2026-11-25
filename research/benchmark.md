# Competitive benchmark: Process Investigation Workspace

Scope: how existing industrial analytics and HMI tools handle the jobs the brief asks for (trend reading, comparing units, events next to signals, root cause, orientation). Sources are linked at the end. Where a source was old or unverified, that is noted.

## What each tool does

| Tool | What it does well | Where it costs the engineer | What we take / avoid |
|---|---|---|---|
| **Seeq Workbench** | Signals stacked in **lanes** on one time axis. Events are first-class time periods (**capsules**) drawn under the trend. | Content is spread across a **Details pane, Capsules pane, toolbar of one-click buttons and several views** (Capsule, Chain). Powerful, but the chart competes with the panes around it. | **Take:** lanes + events as time bars on the same axis. **Avoid:** panes around the chart. |
| **TrendMiner** | Context periods (ContextHub, built on PI event frames) can be **overlaid on the trend** instead of read in a table. | Analysis is split across three modules (TrendHub, ContextHub, DashHub). The sources found were 2018–19, so the current UI is unverified. | **Take:** events overlaid on the signals. **Avoid:** spreading one investigation across modules. |
| **AVEVA PI Vision** | One time range per display; event frames link alarms to periods. | Users complain on AVEVA's own feedback portal that **multi-scale trends make it hard to see when a value left its operating window**, that **scales don't follow attribute limits**, and that the **event time window is fixed**. Some fixes have shipped since 2019–2022. | **Take:** one time range. **Fix:** scales always include alarm limits; one shared "% to limit" axis for comparing; freely adjustable window. |
| **Ignition Power Chart** | Flexible pens, axes and plots. | Configuration-first: **Axes / Pens / Plots / Columns tabs**, custom axes per pen, ~4–5 axes recommended for performance. The engineer builds the chart before reading it. | **Avoid:** setup before insight; several y-axes on one plot. The chart should arrive pre-built for the incident. |
| **Grafana** | Shared crosshair / tooltip across panels; generic annotations. | Shared crosshair behaviour has been **inconsistent across panel types** (open GitHub issues). Annotations are generic markers with **no notion of alarm priority or process limits**. | **Take:** one synced cursor. **Fix:** annotations carry severity (shape + colour) and sit on the signal they belong to. |

## The common failure

Every tool is strong at **showing data** and weak at **telling the engineer what matters first**. They add panes, tabs and axes, so the engineer has to configure and cross-reference. The cognitive cost is in the surrounding chrome, not in the chart.

## Design rules for v2 (from the benchmark + the brief)

1. **The chart is the screen.** No left rail. No navigator strip. Range changes by presets or by dragging on the chart (no separate overview).
2. **One fact, one place.** Status lives in the header, values next to each signal's name, reasoning in the side panel. Nothing is repeated.
3. **Events and alarms live on the time axis.** One event row under the axis; alarm markers sit on the signal they belong to.
4. **Grey until abnormal (ISA-101).** Traces are grey; only the part beyond a limit turns amber (H/LO) or red (HH). Every colour also has a shape and a label.
5. **Compare without extra axes.** Different units are compared as "% of the way from normal to alarm limit" on one axis.
6. **Answer first, evidence on demand.** The side panel leads with the recommended action, then the brief's questions as short answers with evidence underneath.
7. **Collapse what is normal.** Signals that are within limits fold into one row. With 33 signals, only the deviating ones get lanes.

## Sources

- Seeq: [Adjusting signal lanes & axes](https://support.seeq.com/kb/latest/cloud/adjusting-signal-lanes-axes-formatting), [Capsule time](https://support.seeq.com/R58/cloud/capsule-time), [Chain view](https://support.seeq.com/R65/cloud/chain-view)
- TrendMiner: [ContextHub launch (Automation.com)](https://www.automation.com/article/trendminer-introduces-contexthub-software-solution), [2018.R2 update](https://www.automation.com/article/trendminer-introduces-trendminer-2018r2-update), [TrustRadius reviews](https://www.trustradius.com/products/trendminer/reviews/all)
- AVEVA PI Vision feedback portal: [PIVISION-I-935](https://pisystem.feedback.aveva.com/ideas/PIVISION-I-935), [PIVISION-I-1361](https://pisystem.feedback.aveva.com/ideas/PIVISION-I-1361), [PIVISION-I-704](https://pisystem.feedback.aveva.com/ideas/PIVISION-I-704)
- Ignition: [Perspective Power Chart docs](https://docs.inductiveautomation.com/docs/8.3/appendix/components/perspective-components/perspective-chart-palette/perspective-power-chart), [Power Chart usability thread](https://forum.inductiveautomation.com/t/feature-increase-usability-of-the-perspective-power-chart-component/51474)
- Grafana: [Shared crosshair issue #30564](https://www.github.com/grafana/grafana/issues/30564), [Shared crosshair community thread](https://community.grafana.com/t/will-the-timeseries-panel-support-shared-crosshairs-tooltips-in-the-future/44153), [Annotations docs](https://grafana.com/docs/grafana/latest/dashboards/annotations/)
