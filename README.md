# Unlok Claude Plugin

Public plugin layer for Unlok investment experiences in Claude.

This repository is intentionally separated from private backend services.
It contains only the capability contracts and packaging assets used by Claude.

Operating profile:
- finance-master mode: evidence-first, risk-prioritized, decision-grade outputs

## V1 capabilities

Skills:
- portfolio-analysis
- market-research
- order-guidance

Skill identities:
- Portfolio Intelligence
- Market Thesis Lab
- Execution Guard

Commands:
- /portfolio
- /watchlist
- /trade
- /deep-dive

Workflow:
- market-scanner

## What stays private

- OAuth internals and secrets
- Trading/risk execution internals
- Internal databases and private services

## Repository layout

- .claude-plugin/: Claude plugin manifests
- capabilities/: capability registry and versions
- skills/: skill definitions
- commands/: command contracts
- workflows/: workflow contracts
- scripts/: packaging scripts
- .github/workflows/: CI for validation and release artifacts

## Build artifact

The release workflow creates a zip artifact containing the plugin package.

Local build:

1. npm install
2. npm run build

## Compatibility policy

- This repo version controls plugin contracts.
- Backend MCP endpoint compatibility is tracked in capabilities/v1.json.
- Breaking command or output shape changes require a major version bump.
