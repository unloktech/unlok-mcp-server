---
name: order-guidance
description: Execution guardrail mode for turning trade intent into rule-compliant, confirmation-gated order execution.
disable-model-invocation: true
---

# Execution Guard — Unlok

Use this skill for controlled, approval-gated trade execution on Unlok (`app.unlok.com`) equities and ETFs. Enforces the mandatory `preview_order` → explicit confirmation → `place_order` safety contract on every order.

## Platform Context

- **Unlok** (`app.unlok.com`): equities and ETFs — primary scope for this skill.
- **Co-Invest** (`coinvest.unlok.com`): crypto and perpetuals — separate execution context; redirect crypto order requests accordingly.
- MCP endpoint: `mcp.unlok.com`
- OAuth scopes required: `orders:read` for preview; `orders:write` for placement, modification, and cancellation.

## Tools

- `get_order_rules`
- `check_tradability`
- `preview_order`
- `place_order`
- `modify_order`
- `cancel_order`
- `close_position`

## Execution Safety Contract

**This is non-negotiable:**

1. `preview_order` is always called before `place_order`. No exceptions.
2. The full preview recap is always presented to the user before asking for confirmation.
3. `place_order` is only called after receiving **explicit, unambiguous approval** with `confirmed=true`.
4. `modify_order`, `cancel_order`, and `close_position` each require their own explicit confirmation — prior approval for one action does not carry over.

## Workflow

1. Confirm symbol, side (buy/sell), quantity, and intended order type.
2. **Default to Market order** unless the user explicitly requests a Limit order.
3. For paper trading sessions: confirm whether this is a paper account before proceeding. Label all output **[PAPER]**.
4. Call `get_order_rules` and `check_tradability` in parallel. If either check fails, stop and return the specific failure reason with a correction path.
5. Call `preview_order` with the exact intended payload.
6. Present the full order recap (see Output section below) and request explicit confirmation.
7. Call `place_order` only after clear approval, with `confirmed=true` in the payload.
8. For modify/cancel/close: repeat steps 4–7 independently for each action.

## Confirmation Required

Before execution, confirm:

- Symbol and side (buy / sell / short / cover)
- Quantity (shares)
- Order type: Market (default) or Limit (only when explicitly requested)
- Limit price, if applicable
- Time-in-force (DAY, GTC, etc.) and session constraints (regular / extended)
- Estimated fee and total cost impact
- Account type: paper or live

## Output

**Before execution**, present:

- Order payload summary (symbol, side, qty, type, price if limit, TIF)
- `get_order_rules` and `check_tradability` status — pass or fail with reason
- Estimated total cost (quantity × price + fee estimate)
- Estimated fee and friction notes (spread, slippage guidance for Market orders)
- Clear confirmation prompt: *"Confirm to place this order — yes or no."*

**After execution attempt**, present:

- Submitted order details with order ID (when available)
- Final status: filled, pending, rejected, or error
- Rejection or error reason with next-best correction path

## Safety

- Never call `place_order`, `modify_order`, `cancel_order`, or `close_position` without explicit approval.
- If `check_tradability` fails, do not proceed to preview — return the failure and a correction path.
- If the user's OAuth token lacks `orders:write` scope, surface the scope error clearly and stop.
- Paper trading sessions must be labeled **[PAPER]** on all output — never mix paper and live execution context in a single workflow.

## Good Triggers

- "Buy 10 shares of TSLA."
- "Preview this trade before I confirm."
- "Cancel my open AAPL limit order."
- "Close my MSFT position."

## Do Not Use When

- The user wants idea research or thesis work. Use `market-research` or `investment-decision-memo`.
- The user wants portfolio diagnostics only. Use `portfolio-analysis` or `portfolio-risk-dashboard`.
- The user is placing crypto or perpetuals orders. Redirect to Co-Invest.