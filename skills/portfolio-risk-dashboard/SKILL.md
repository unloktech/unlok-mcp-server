---
name: portfolio-risk-dashboard
description: Institutional portfolio risk dashboard skill for concentration control, exposure diagnostics, and priority risk actions.
disable-model-invocation: true
---

# Portfolio Risk Dashboard — Unlok

Use this skill for institutional-grade risk reporting and remediation planning on Unlok (`app.unlok.com`) equities and ETF accounts. The high-formalism variant of `portfolio-analysis` — produces a structured dashboard with explicit severity ratings and a ranked action plan.

## Platform Context

- **Unlok** (`app.unlok.com`): equities and ETFs — primary scope.
- **Co-Invest** (`coinvest.unlok.com`): crypto and perpetuals — out of scope; redirect if needed.
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

1. Confirm account scope and review objective. If multiple accounts exist (paper vs. live), ask the user to select and confirm before proceeding.
2. Confirm whether the user wants tactical (near-term) or strategic (structural) risk actions.
3. Batch `get_holdings` + `get_portfolio_summary` to baseline portfolio performance and exposure.
4. Batch `get_portfolio_allocation` + `show_portfolio_pie_widget` + `get_portfolio_heatmap` for composition, concentration cluster, and sector risk.
5. Call `get_account_overview` for additional account-level context.
6. Rank all identified risk issues by estimated downside impact.
7. Produce a governance-ready dashboard with severity-rated risk flags and a specific action plan.

## Confirmation Required

Before final output, confirm:

- Selected account (paper or live) — label all output accordingly
- Tactical vs. strategic risk action preference
- Whether recommendations should minimize turnover (i.e., prefer trimming to full exits)
- Whether any positions are off-limits for action (conviction holds, locked positions)

## Output

Structure the output as a formal dashboard:

**Portfolio Snapshot**:
- Total AUM, day and period P&L, cash buffer
- Position count and average position size

**Exposure Map**:
- Top holdings by weight with concentration thresholds flagged
- Sector breakdown with overweight/underweight vs. benchmark
- Thematic cluster identification (e.g., AI/semis concentration, rate-sensitive cluster)

**Risk Register** (severity: Critical / High / Medium):
- **Critical**: single position >25% of portfolio or sector >50%
- **High**: correlated cluster representing >40% of portfolio; drawdown >15% on a position
- **Medium**: moderately elevated concentration or sector drift from target

**Attribution Summary**:
- Top 3 contributors (P&L impact, momentum quality)
- Top 3 detractors (P&L impact, recovery likelihood)

**Action Plan** (top 3 risk-reduction actions):
- Specific symbol or sector with recommended action
- Severity rating addressed
- Expected portfolio risk-reduction effect
- Routing note: actions requiring execution → `order-guidance` or `trade-execution-governance`

## Visualization Preference

- Use `show_portfolio_pie_widget` for allocation composition as the first allocation visual.
- Lead with `get_portfolio_heatmap` as the primary risk visual.
- Follow with `get_portfolio_allocation` for sector/weight breakdown.
- If chart output is blank or fails (Chart.js sandbox limitation), produce SVG-based heatmap and allocation visuals inline — clearly label as fallback renders.

## Safety

- Never fabricate holdings, returns, risk values, or attribution data.
- If required account context is missing or ambiguous, stop and ask for clarification — do not estimate or approximate.
- Paper trading accounts: label all dashboard output **[PAPER]** throughout. Never allow paper and live data to mix in a single dashboard output.

## Good Triggers

- "Give me an institutional-grade risk dashboard."
- "Show me where my biggest downside exposure is."
- "What should I trim first to reduce portfolio risk?"
- "Run a full risk audit on my account."

## Do Not Use When

- The user wants trade-entry execution flow. Use `order-guidance` or `trade-execution-governance`.
- The user wants watchlist maintenance. Use `watchlist-intelligence`.
- The user wants single-symbol deep research. Use `market-research` or `investment-decision-memo`.