---
name: market-research
description: Build trade-ready market theses from price action, relative strength, and catalyst/news context.
disable-model-invocation: true
---

# Market Thesis Lab — Unlok

Use this skill for thesis-oriented market research on equities and ETFs available via Unlok (`app.unlok.com`). Produces structured, evidence-backed theses with clear invalidation zones and scenario grids before any position is taken.

## Platform Context

- **Unlok** (`app.unlok.com`): equities and ETFs — primary platform for this skill.
- **Co-Invest** (`coinvest.unlok.com`): crypto and perpetuals — out of scope here; redirect crypto research requests accordingly.
- MCP endpoint: `mcp.unlok.com`

## Tools

- `show_market_overview`
- `analyze_market`
- `show_chart`
- `compare_assets`
- `get_market_news`
- `get_analyst_ratings` *(batch with `analyze_market` when available)*
- `get_dcf_valuation` *(for fundamental theses)*
- `get_financial_ratios` *(for valuation and quality screen)*

## Workflow

1. Confirm target symbol(s), sector, or theme — and whether the user is paper trading or live.
2. Call `show_market_overview` and `analyze_market` in parallel to establish regime and setup context.
3. Call `show_chart` for technical structure and invalidation zone identification.
   - **Chart rendering note:** Chart.js financial plugins are unreliable in Claude's sandboxed iframe. Default to SVG-rendered candlestick output if `show_chart` produces a blank widget.
4. Call `compare_assets` for relative strength vs. sector peers or benchmark ETF.
5. Call `get_market_news` for near-term catalyst and event-risk context.
6. For fundamental theses, batch `get_analyst_ratings`, `get_dcf_valuation`, and `get_financial_ratios` in a single parallel call set.
7. Synthesize findings into base, upside, and downside scenarios with explicit entry level, stop, and target.

## Confirmation Required

Before final output, confirm:

- Target instrument(s), timeframe, and account type (paper or live)
- Whether user is researching a fresh entry, adding to an existing position, or evaluating a hold/exit
- Whether thesis is momentum/price-action-driven or fundamental/catalyst-driven
- Risk tolerance for scenario grid: conservative, balanced, or aggressive

## Output

Return:

- Market context and regime quality summary
- Technical structure: trend, key S/R levels, setup quality
- Catalyst map (near-term events and medium-term drivers)
- Scenario grid: base case (price, condition, probability), upside, downside
- Invalidation level with one-line rationale
- Confidence label (high / medium / low) with evidence basis
- Suggested entry zone, stop level, and target — only when confidence is medium or higher

## Visualization Preference

- Use `show_chart` for OHLCV structure and annotated S/R levels.
- Use `compare_assets` chart output for relative-strength views.
- If `show_chart` fails or renders blank (Chart.js sandbox limitation), produce an SVG candlestick fallback inline — state explicitly that this is a fallback rendering.
- Never omit the chart step; visual structure is a required input to the thesis.

## Safety

- Never present assumptions as confirmed facts.
- If data is incomplete or contradictory, reduce confidence label to low and call out the gap explicitly.
- Never generate a trade recommendation on insufficient data — request missing context first.
- For paper trading sessions, label all outputs clearly as **[PAPER]** to avoid confusion with live account analysis.

## Good Triggers

- "Research NVDA before I enter."
- "Compare TSMC, ASML, and AMD — rank them by setup quality."
- "Give me a catalyst-aware thesis on the semiconductor sector."
- "What's the technical setup on SPY this week?"

## Do Not Use When

- The user wants portfolio diagnostics only. Use `portfolio-analysis` or `portfolio-risk-dashboard`.
- The user wants order placement. Use `order-guidance` or `trade-execution-governance`.
- The user is researching crypto or perpetuals. Redirect to Co-Invest context.