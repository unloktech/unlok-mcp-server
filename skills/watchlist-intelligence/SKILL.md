---
name: watchlist-intelligence
description: Professional watchlist governance skill for opportunity triage, catalyst monitoring, and portfolio funnel management.
disable-model-invocation: true
---

# Watchlist Intelligence — Unlok

Use this skill for disciplined watchlist curation and idea-funnel governance on Unlok (`app.unlok.com`). Manages the research pipeline from initial idea capture through promote-to-trade decision — the top of the execution funnel before `order-guidance` or `trade-execution-governance` takes over.

## Platform Context

- **Unlok** (`app.unlok.com`): equities and ETFs — primary scope.
- **Co-Invest** (`coinvest.unlok.com`): crypto and perpetuals — out of scope; redirect crypto watchlist requests accordingly.
- MCP endpoint: `mcp.unlok.com`
- OAuth scope required: `account:read` (watchlist read and write operations are account-scoped)

## Tools

- `list_watchlists`
- `get_watchlist`
- `create_watchlist`
- `add_to_watchlist`
- `remove_from_watchlist`
- `delete_watchlist`
- `get_market_news`
- `analyze_market`
- `compare_assets`

## Workflow

1. Confirm target watchlist name and curation objective (add ideas, prune weak setups, or full review).
2. Call `list_watchlists` to show current inventory. If multiple watchlists exist, confirm which one(s) to operate on.
3. Call `get_watchlist` on the selected list(s) to establish current symbol inventory.
4. For curation and triage:
   - Batch `analyze_market` across all symbols in the watchlist (or a specified subset for large lists).
   - Call `compare_assets` on symbol clusters to rank relative strength within the list.
   - Call `get_market_news` for catalyst flow on the most active symbols.
5. Generate promote/prune recommendations with explicit, evidence-backed rationale per symbol.
6. Present changes (adds, removes, deletions) for explicit user confirmation before executing any modification.
7. Execute confirmed changes and report final watchlist state with next-review priorities.

## Confirmation Required

Before any modification, confirm:

- Exact watchlist name(s)
- Exact symbol(s) to add or remove
- For `delete_watchlist`: reconfirm explicitly that the deletion is intentional and irreversible
- Preferred review cadence (daily, weekly, event-driven) for monitoring recommendations

## Output

Return:

**Watchlist Inventory**:
- List names, sizes, and last-modified context
- Selected list: full symbol roster

**Signal Board** (per symbol or top-N for large lists):
- Setup strength (momentum, consolidation, breakdown)
- Trend quality and relative strength vs. sector benchmark
- Notable weakness or deterioration flags

**Catalyst Board**:
- Near-term event risk (earnings, macro catalysts, sector events)
- Recent news signal (positive, negative, neutral)

**Promote / Prune Recommendations**:
- Promote to active consideration: symbols with improving setup + catalyst alignment
- Prune: symbols with broken thesis, deteriorating setup, or no near-term catalyst
- Hold: symbols worth monitoring but not ready to act on

**Applied Changes Summary**:
- Actions executed (with confirmation noted)
- Updated watchlist state
- Top 3 symbols for next review cycle

## Safety

- Never delete watchlists or remove symbols without explicit user confirmation.
- If a symbol name is ambiguous (ticker collision or partial match), stop and ask for clarification before any action.
- `delete_watchlist` is irreversible — always reconfirm with the user before calling it, even if they already said "yes" earlier in the conversation.
- Paper trading context: if the user's watchlist is associated with a paper account, label all output **[PAPER]**.

## Good Triggers

- "Clean up my momentum watchlist."
- "Add NVDA, AMD, and ASML to my semiconductors list."
- "Which names on my watchlist should I act on this week?"
- "Prune the underperformers from my ETF list."

## Do Not Use When

- The user wants portfolio risk diagnostics. Use `portfolio-analysis` or `portfolio-risk-dashboard`.
- The user wants direct order execution. Use `order-guidance` or `trade-execution-governance`.
- The user wants a full investment thesis on a symbol. Use `market-research` or `investment-decision-memo`.