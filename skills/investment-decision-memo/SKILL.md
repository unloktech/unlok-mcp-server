---
name: investment-decision-memo
description: Decision-memo skill for thesis validation, scenario analysis, and clear risk-aware investment recommendations.
disable-model-invocation: true
---

# Investment Decision Memo — Unlok

Use this skill to produce investment committee-style decision memos for equities and ETFs on Unlok. Designed for pre-trade conviction validation — the last analytical step before committing to execution.

## Platform Context

- **Unlok** (`app.unlok.com`): equities and ETFs — primary scope.
- **Co-Invest** (`coinvest.unlok.com`): crypto and perpetuals — out of scope; redirect if needed.
- MCP endpoint: `mcp.unlok.com`

## Tools

- `show_market_overview`
- `analyze_market`
- `show_chart`
- `compare_assets`
- `get_market_news`
- `get_analyst_ratings`
- `get_dcf_valuation`
- `get_financial_ratios`

## Workflow

1. Confirm target symbol(s), thesis question, and decision horizon (day, swing, position).
2. Confirm account type: paper trading or live — label all memo outputs accordingly.
3. Batch `show_market_overview` + `analyze_market` for regime and setup context.
4. Batch `show_chart` + `compare_assets` for structure and relative strength evidence.
5. Call `get_market_news` for catalyst and event-risk context.
6. Call `get_analyst_ratings`, `get_dcf_valuation`, and `get_financial_ratios` in parallel for fundamental evidence layer.
7. Construct base, upside, and downside cases with explicit assumptions, entry zone, stop, and target.
8. Close with a decision recommendation, confidence label, and monitoring trigger.

## Confirmation Required

Before final recommendation, confirm:

- Target instrument, timeframe, and account type (paper or live)
- Decision type: entry timing, position sizing, or hold/exit decision
- Risk tolerance: conservative, balanced, or aggressive
- Whether the position would be a new entry or add-on to existing exposure

## Output

Return a structured memo with:

**Thesis Statement** (1–2 lines): the core directional conviction and rationale.

**Evidence Stack**:
- Confirmed facts (data-backed)
- Working assumptions (clearly labeled)
- Evidence gaps (explicitly flagged)

**Scenario Grid**:
- Base case: condition, entry zone, target, stop, probability
- Upside case: catalyst or condition, extended target, probability
- Downside case: invalidation condition, stop, risk amount, probability

**Key Risks and Invalidation**:
- Primary invalidation level (price or catalyst)
- Event risk (earnings, macro, sector catalyst windows)
- Liquidity and spread considerations

**Decision and Monitoring**:
- Recommended action with confidence label (high / medium / low)
- Monitoring trigger for re-evaluation (price level or event)
- Suggested position sizing direction based on conviction (not a hard allocation; confirmation before execution)

## Visualization Preference

- Include `show_chart` output in the memo as evidence for technical structure.
- If `show_chart` produces a blank widget (Chart.js sandbox limitation), generate an SVG candlestick/level diagram fallback inline and label it as such.
- Use `compare_assets` chart for relative-strength evidence.

## Safety

- Never imply certainty when evidence is mixed or assumptions outweigh facts.
- If the evidence stack has more assumptions than confirmed facts, reduce confidence to low and explicitly flag before recommending any action.
- Do not progress to execution recommendations here — route to `order-guidance` or `trade-execution-governance` after memo sign-off.
- Paper trading sessions: label all memo outputs **[PAPER]** throughout.

## Good Triggers

- "Write a decision memo for my NVDA trade."
- "Should I enter MSFT now or wait for a pullback?"
- "Give me base/upside/downside with invalidation before I size up."
- "I'm considering adding to my AAPL position — validate the thesis."

## Do Not Use When

- The user wants direct order execution. Use `order-guidance` or `trade-execution-governance`.
- The user wants watchlist curation only. Use `watchlist-intelligence`.
- The user wants a broad portfolio review. Use `portfolio-analysis` or `portfolio-risk-dashboard`.