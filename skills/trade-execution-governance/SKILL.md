---
name: trade-execution-governance
description: Execution governance skill for rule-compliant order workflows with mandatory preview and explicit approval.
disable-model-invocation: true
---

# Trade Execution Governance — Unlok

Use this skill for policy-compliant execution with strict pre-trade controls on Unlok (`app.unlok.com`). This is the high-governance variant of `order-guidance` — intended for larger positions, complex order modifications, or any context where the user explicitly wants maximum pre-trade friction.

## Platform Context

- **Unlok** (`app.unlok.com`): equities and ETFs — primary scope.
- **Co-Invest** (`coinvest.unlok.com`): crypto and perpetuals — out of scope; redirect if needed.
- MCP endpoint: `mcp.unlok.com`
- OAuth scopes required: `orders:read` (preview, rules) and `orders:write` (placement, modification, cancellation).

## Tools

- `get_order_rules`
- `check_tradability`
- `preview_order`
- `place_order`
- `modify_order`
- `cancel_order`
- `close_position`

## Execution Safety Contract

**Absolute rules — no exceptions:**

1. `get_order_rules` and `check_tradability` are always called before `preview_order`.
2. `preview_order` is always called before `place_order`.
3. The full order payload recap is always presented to the user before requesting confirmation.
4. `place_order` is only executed after **explicit, unambiguous approval** with `confirmed=true`.
5. Every modify, cancel, and close action requires its own independent confirmation cycle — prior approval does not carry forward.
6. If any pre-trade check fails, execution stops entirely and a correction path is returned.

## Workflow

1. Confirm order intent, symbol, side, quantity, account type (paper or live).
2. **Default to Market order** unless user explicitly requests a Limit order.
3. Call `get_order_rules` and `check_tradability` in parallel.
   - If either fails: stop, return the specific failure reason, and do not proceed to preview.
4. Call `preview_order` with the exact payload.
   - Evaluate constraints, slippage sensitivity, and fee impact.
   - For large orders: flag market-impact and execution risk explicitly.
5. Present full governance recap (see Output section) and request explicit confirmation.
6. Call `place_order` with `confirmed=true` only after unambiguous approval.
7. For modify/cancel/close: restart from step 3 independently. Do not reuse prior check results.

## Confirmation Required

Before any execution action, confirm:

- Symbol, side (buy / sell / short / cover), quantity
- Order type: Market (default) or Limit (only when explicitly requested)
- Limit price and price trigger conditions (for Limit orders)
- Time-in-force and execution session (regular / extended)
- Fee estimate and slippage range (for Market orders)
- Notable constraints from `get_order_rules` output
- Account type: paper or live

## Output

**Pre-execution governance recap**, present:

- Final order payload (symbol, side, qty, type, price if Limit, TIF, session)
- `get_order_rules` status with any flagged constraints
- `check_tradability` status: pass or fail with specific reason
- Fee/slippage sensitivity assessment
- Any size-related execution risk flags
- Explicit confirmation prompt: *"Confirm to proceed — yes or no."*

**Post-execution status**, present:

- Action attempted and final order status (filled, pending, rejected, error)
- Order ID when available
- Failure reason and next-best correction path when blocked

## Safety

- Never place, modify, cancel, or close without explicit user approval per action.
- If `check_tradability` or `get_order_rules` fails, do not proceed — return the failure clearly.
- If the user's OAuth token lacks `orders:write` scope, surface the scope error and stop.
- For paper trading sessions: confirm paper account status before any execution, and label all output **[PAPER]** throughout. Never allow paper and live workflows to overlap in the same session.
- Never retry a failed order silently — always surface the failure and ask the user to confirm retry intent.

## Good Triggers

- "Execute this order with full pre-trade checks."
- "Check rules, preview, then place — I want to see everything before it goes."
- "Modify my open NVDA limit order."
- "Close my entire TSLA position."

## Do Not Use When

- The user only wants market research or thesis work. Use `market-research` or `investment-decision-memo`.
- The user only wants portfolio diagnostics. Use `portfolio-analysis` or `portfolio-risk-dashboard`.
- The user is executing crypto or perpetuals orders. Use Co-Invest context instead.