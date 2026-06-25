---
name: market-scanner
description: Scan sectors, themes, and symbols to rank high-conviction setups for Unlok users using trend, momentum, catalyst, and risk.
---

# Market Scanner

Purpose:
- Surface actionable trade candidates quickly from a user-defined universe.

Inputs:
- universe or theme (indices, sectors, custom symbol list)
- style preference (momentum, quality, mean-reversion)
- optional risk profile (conservative, balanced, aggressive)

Pipeline:
1. Build universe from user intent.
2. Pull market context and regime snapshot.
3. Score candidates on trend, momentum, catalyst quality, and downside risk.
4. Filter out low-liquidity or high-friction candidates when possible.
5. Return ranked shortlist with clear invalidation conditions.

Scoring rubric:
- trend quality: 30%
- momentum quality: 25%
- catalyst quality: 25%
- downside risk penalty: 20%

Output contract:
- top 5 ranked candidates with score and one-line thesis
- confidence label (high, medium, low) per candidate
- invalidation condition per candidate
- next best action: /deep-dive or /trade
