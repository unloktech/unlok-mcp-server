---
name: portfolio-analysis
description: Portfolio intelligence mode for Unlok accounts: identify concentration risk, exposure imbalance, and performance drivers.
disable-model-invocation: true
---

# Portfolio Intelligence — Unlok

Use this skill for professional portfolio diagnostics on Unlok (`app.unlok.com`) equities and ETF accounts. Focused on exposure mapping, concentration risk, drawdown vulnerability, and attribution — producing ranked, actionable output.

## Platform Context

- **Unlok** (`app.unlok.com`): equities and ETFs — primary scope.
- **Co-Invest** (`coinvest.unlok.com`): crypto and perpetuals — separate portfolio context; redirect if needed.
- MCP endpoint: `mcp.unlok.com`
- OAuth scope required: `account:read`

## Tools

- `get_holdings`
- `get_portfolio_summary`
- `get_portfolio_allocation`
- `show_portfolio_pie_widget`
- `get_portfolio_heatmap`
- `get_account_overview`

## Workflow

1. Confirm target account. If multiple accounts exist (e.g., paper trading account alongside live), ask the user to select before proceeding.
2. Confirm analysis window and objective: risk review, rebalancing prep, or attribution analysis.
3. Batch `get_holdings` + `get_portfolio_summary` to establish baseline state (positions, P&L, total value).
4. Batch `get_portfolio_allocation` + `show_portfolio_pie_widget` + `get_portfolio_heatmap` to map composition, concentration, and cluster risk.
5. Call `get_account_overview` for supplemental account-level context.
6. Identify top exposure concentrations, sector imbalances, and largest drawdown vulnerabilities.
7. Produce a ranked risk narrative with attribution summary and ordered action items.

## Confirmation Required

Before finalizing recommendations, confirm:

- Selected account (paper vs. live) — label all output accordingly
- Analysis period if user requested period-specific performance attribution
- Optimization priority: risk reduction, return improvement, or rebalancing to target weights

## Output

Return:

**Portfolio Snapshot**:
- Total portfolio value and day/period move with context
- Number of open positions and cash position

**Exposure Map**:
- Top 5 holdings by weight with concentration flags (>20% single position, >40% single sector)
- Sector and thematic breakdown

**Risk Flags** (ranked by severity):
- Concentration: oversized single-name or sector positions
- Correlation: cluster risk — positions likely to move together in a drawdown
- Drawdown vulnerability: positions with largest unrealized loss or farthest from stop

**Attribution Summary**:
- Top 3 contributors and top 3 detractors by P&L impact

**Action Items** (top 3, ordered by risk impact):
- Specific symbol or sector with the recommended action
- Expected risk-reduction effect
- Note whether action requires execution — route to `order-guidance` or `trade-execution-governance` to act

## Visualization Preference

- Use `show_portfolio_pie_widget` as the primary allocation composition visual.
- Use `get_portfolio_heatmap` output as the primary visual for concentration clusters.
- Use `get_portfolio_allocation` for sector and weight pie/bar breakdown.
- If specialized chart output is unavailable or blank (Chart.js sandbox limitation), produce an SVG-based allocation or heatmap fallback inline — label it as a fallback.

## Safety

- Never invent holdings, prices, returns, or risk values.
- If account data is incomplete or ambiguous, stop and ask for clarification — do not estimate.
- Paper trading accounts must be clearly labeled **[PAPER]** throughout all output. Never mix paper and live analysis in the same workflow.

## Good Triggers

- "Review my portfolio risk."
- "Where am I overexposed right now?"
- "Give me a concentration and attribution breakdown."
- "I want to rebalance — show me what needs trimming."

## Do Not Use When

- The user wants direct execution. Use `trade-execution-governance` or `order-guidance`.
- The user wants single-symbol thesis work. Use `market-research` or `investment-decision-memo`.
- The user wants watchlist curation. Use `watchlist-intelligence`.