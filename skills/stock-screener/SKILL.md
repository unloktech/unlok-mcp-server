---
name: stock-screener
description: Intelligent stock screener skill — translates natural language queries into precise filter combinations, enriches shortlists with fundamentals and analyst ratings, and produces ranked, explained candidate lists.
disable-model-invocation: true
---

# Intelligent Stock Screener — Unlok

Use this skill whenever the user asks to find, screen, discover, or filter stocks using any natural language description. Translates the request into `run_screener` parameters, then enriches the shortlist with fundamentals and ratings for deeper queries.

## Platform Context

- **Unlok** (`app.unlok.com`): equities and ETFs — primary scope.
- MCP endpoint: `mcp.unlok.com`
- No auth required for screener calls. Enrichment tools (`get_financial_ratios`, `get_analyst_ratings`) are also auth-free.

## Tools

| Tool | Purpose |
|------|---------|
| `run_screener` | First filter — returns up to 100 candidates |
| `get_financial_ratios` | Enrichment — PEG, ROE, D/E, revenue growth, dividend yield |
| `get_analyst_ratings` | Enrichment — consensus rating, price target, upside % |
| `get_earnings_history` | Enrichment — EPS trend, beat/miss pattern |
| `analyze_market` | Deep single-stock context when fewer than 5 candidates remain |
| `show_chart` | Technical structure for swing/momentum setups |

## Filter Vocabulary

Map natural language to `run_screener` parameters:

### Sector → `sector`
| User says | `sector` value |
|-----------|---------------|
| tech, technology, software, semiconductor, chip, AI, cloud, SaaS | `Technology` |
| health, healthcare, pharma, biotech, medical, drug | `Healthcare` |
| energy, oil, gas, renewable, solar, wind, clean energy | `Energy` |
| finance, financial, bank, banking, insurance, fintech, payment | `Financials` |
| consumer, retail, shopping, e-commerce, apparel, food | `Consumer` |
| industrial, manufacturing, aerospace, defense, logistics | `Industrial` |

### Market Cap → `marketCapMin` / `marketCapMax`
| User says | Value |
|-----------|-------|
| mega cap, large cap, blue chip | `marketCapMin: 10_000_000_000` |
| mid cap | `marketCapMin: 2_000_000_000, marketCapMax: 10_000_000_000` |
| small cap | `marketCapMin: 300_000_000, marketCapMax: 2_000_000_000` |
| micro cap, nano cap | `marketCapMin: 50_000_000, marketCapMax: 300_000_000` |

### Price → `priceMin` / `priceMax`
| User says | Value |
|-----------|-------|
| penny stocks, under $5 | `priceMax: 5` |
| under $10, cheap stocks | `priceMax: 10` |
| under $50, affordable | `priceMax: 50` |
| under $100 | `priceMax: 100` |
| high-priced, premium, expensive | `priceMin: 200` |
| Extract number from "under $73" → | `priceMax: 73` |

Always extract explicit dollar amounts from the query. "cheap tech stocks under $73" → `sector: Technology, priceMax: 73`.

### Exchange → `exchange`
| User says | Value |
|-----------|-------|
| NASDAQ, NASDAQ-listed | `NASDAQ` |
| NYSE, New York Stock Exchange | `NYSE` |
| AMEX, American Stock Exchange | `AMEX` |

### Valuation → `peMin` / `peMax`
| User says | Value |
|-----------|-------|
| undervalued, value stocks, low P/E, cheap P/E | `peMin: 1, peMax: 20` |
| deep value, very cheap P/E, bargain | `peMin: 1, peMax: 15` |
| growth stocks, high P/E | `peMin: 30` |
| reasonable valuation, fair value | `peMin: 10, peMax: 25` |

### Limit
Default to `limit: 20` for general queries. Use `limit: 30–50` when enrichment is needed (gives more candidates to filter after post-processing). Use `limit: 10` when the user asks for a tight, ranked list.

## Query Resolution Workflow

### Step 1 — Classify the request

**Type A — Direct filter query**: Translates cleanly to `run_screener` params.
Examples: "cheap tech stocks under $50", "small cap healthcare", "NASDAQ value stocks"
→ Call `run_screener` with derived params. Present results.

**Type B — Enrichment query**: Screener narrows candidates, then enrichment tools rank them.
Examples: "undervalued AI companies with strong earnings growth", "high ROE low debt tech stocks"
→ Call `run_screener` with sector/cap/valuation filters. Then batch `get_financial_ratios` on top candidates. Filter/rank in response.

**Type C — Multi-signal query**: Requires screener + technicals + ratings.
Examples: "fundamentally strong stocks near 52-week highs", "top analyst picks in technology"
→ Call `run_screener` for sector/cap. Then batch `get_analyst_ratings` + optionally `show_chart` on finalists.

**Type D — Out-of-screener query**: Cannot be answered by `run_screener` alone.
Examples: "swing trading setups for this week", "unusual options activity", "increasing institutional ownership"
→ Use screener for broad candidate pool, then state which additional signals are needed and how to interpret results.

### Step 2 — Call `run_screener`

Always pass `query` with the user's original text — the backend auto-derives filters from it as a fallback. Then explicitly pass the filters you derived above so they take precedence.

```
run_screener({
  query: "<user's original text>",
  sector: <derived>,
  marketCapMin: <derived>,
  marketCapMax: <derived>,
  priceMin: <derived>,
  priceMax: <derived>,
  peMin: <derived>,
  peMax: <derived>,
  limit: <20-50>
})
```

### Step 3 — Enrichment (Type B/C only)

Take the top 10–15 symbols from screener results. Call enrichment tools in parallel:

```
Parallel:
  get_financial_ratios(symbol1), get_financial_ratios(symbol2), ...  (for Type B)
  get_analyst_ratings(symbol1), get_analyst_ratings(symbol2), ...    (for Type C)
```

Then rank candidates by the enrichment criteria the user asked about.

## Handling Complex Queries

### "Find undervalued AI companies with strong earnings growth"
1. `run_screener(sector: Technology, peMin: 1, peMax: 20, limit: 30)`
2. Batch `get_financial_ratios` on top 15 results
3. Filter for: revenue growth > 10%, return on equity > 15%
4. Rank by P/E (ascending) × revenue growth (descending)
5. Present top 5–8 with P/E, revenue growth, ROE

### "High ROE, low debt, strong revenue growth"
1. `run_screener(limit: 40)` — broad first pass
2. Batch `get_financial_ratios` on top 20
3. Filter in post: ROE > 20%, debt-to-equity < 0.5, revenue growth > 15%
4. Present with all three metrics shown

### "Fundamentally strong stocks near 52-week highs"
1. `run_screener(marketCapMin: 2_000_000_000, limit: 30)` — mid/large cap only
2. Batch `get_financial_ratios` + `get_analyst_ratings` in parallel on top 15
3. Filter for analyst consensus ≥ "Buy", positive EPS trend
4. Present sorted by analyst price target upside

### "Top analyst picks in [sector]"
1. `run_screener(sector: <sector>, marketCapMin: 1_000_000_000, limit: 30)`
2. Batch `get_analyst_ratings` on top 20 results
3. Sort by: Strong Buy count descending, then price target upside descending
4. Present top 8–10 with rating, consensus, upside %

### "Momentum/trending stocks"
1. `run_screener(exchange: NASDAQ, priceMin: 10, limit: 20)` — sort is `change_percentage:desc` (backend handles this when momentum phrases detected in `query`)
2. Present with change % prominently. Optionally call `show_chart` on top 3 for visual confirmation.

### "Small cap [sector] under $[price]"
1. Extract all numbers from query for price threshold
2. `run_screener(sector: <sector>, marketCapMin: 300_000_000, marketCapMax: 2_000_000_000, priceMax: <extracted>, limit: 20)`

### "Dividend stocks / income stocks"
1. `run_screener(marketCapMin: 2_000_000_000, limit: 30)` — large/mid cap only (small caps rarely have stable dividends)
2. Batch `get_financial_ratios` on top 20
3. Filter for: dividend yield > 2%
4. Sort by dividend yield descending
5. Present with yield, payout ratio if available

### "Swing trading opportunities this week"
Screener alone cannot answer this — it has no real-time technical data. Tell the user:
1. `run_screener` for candidate pool by sector/cap they specify
2. Call `show_chart(symbol, timeFrame: '1M')` on top 5–8 candidates
3. Identify: pullbacks to support, flags/pennants, approaching breakout levels
4. Rank by setup clarity and risk/reward

### "Stocks similar to [SYMBOL]"
1. Call `get_stock_peers(symbol)` first
2. Then `run_screener(sector: <same sector>, marketCapMin: <similar range>)` to widen the pool
3. Batch `get_financial_ratios` on peers + screener results
4. Rank by similarity across P/E, market cap, revenue growth

### "Beaten-down / oversold stocks with recovery potential"
1. `run_screener(sector: <if specified>, limit: 40)`
2. Batch `get_financial_ratios` on top 20
3. Filter for: positive ROE (profitable), reasonable debt, price down significantly from highs
4. Batch `get_analyst_ratings` on survivors
5. Filter for analyst consensus ≥ "Hold" (not deteriorating)
6. Present as recovery candidates with risk caveat

## Number Extraction Rules

Always parse explicit numbers from the query before calling `run_screener`:
- `"under $73"` → `priceMax: 73`
- `"over $100"` → `priceMin: 100`
- `"P/E below 15"` → `peMax: 15`
- `"market cap over $5 billion"` → `marketCapMin: 5_000_000_000`
- `"between $20 and $50"` → `priceMin: 20, priceMax: 50`
- `"cap under 500M"` → `marketCapMax: 500_000_000`

Prefer explicit numbers over semantic defaults. "Undervalued tech under $30" → `peMax: 20, priceMax: 30` (both applied).

## Multi-Sector Handling

`run_screener` only accepts one sector at a time. For "tech and healthcare" queries:
- Call `run_screener` twice in parallel (one per sector) with the same other filters
- Merge and deduplicate results
- Rank combined list by the primary sorting criterion

## Empty Result Recovery

If `run_screener` returns 0 results:
1. Identify the most restrictive filter (usually P/E range or price cap)
2. Relax it: widen P/E range by 50%, raise price cap by 25%
3. Re-run with relaxed filter
4. Tell the user what was relaxed and why

If still empty: suggest alternative framing ("No micro-cap energy stocks exist under $5 — trying small-cap energy under $10 instead").

## Output Format

For **Type A** (direct filter): present the widget results + 1–2 sentence context on what the filter found.

For **Type B/C** (enrichment): present a ranked table with the enrichment metrics. Lead with:
```
Found [N] candidates matching [intent]. Enriched with [ratios/ratings] and ranked by [criterion].
```
Then the table: Symbol | Price | Market Cap | [enrichment columns] | Why it qualifies

For **Type D** (out-of-screener): explain which part of the request the screener can answer, what additional steps are needed, and offer to run the screener portion + call charts/technicals on finalists.

## What Not To Do

- Do not call `run_screener` without passing `query` — always include it so the backend can display the intent banner.
- Do not set `limit` below 20 when enrichment will follow — you need candidates to filter against.
- Do not present screener results as a final answer for Type B/C queries — enrichment is required.
- Do not fabricate financial metrics — only report what `get_financial_ratios` returns.
- Do not invent price targets or analyst ratings — only what `get_analyst_ratings` returns.
- Do not run more than 15 parallel `get_financial_ratios` calls — limit enrichment to top-N candidates.

## Good Triggers

- "Find cheap tech stocks"
- "Screen for small cap healthcare under $20"
- "Show me undervalued AI companies with strong earnings growth"
- "Find high ROE, low debt technology stocks"
- "What are the top analyst picks in financials right now?"
- "Find dividend stocks with yield over 3%"
- "Show me NASDAQ momentum stocks"
- "Find beaten-down stocks with recovery potential"
- "Screen for value stocks in energy"
- "Find mid-cap stocks similar to NVDA"
