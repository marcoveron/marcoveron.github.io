---
title: wazuh-mcp
description: An open-source MCP server that gives LLM agents structured, guarded access to a Wazuh SIEM/XDR deployment.
date: 2026-10-09
repo: https://github.com/marcoveron/wazuh-mcp
stack: [Python, MCP, Wazuh, OpenSearch]
tags: [ai-security, soc, mcp, wazuh]
featured: true
---

`wazuh-mcp` is a Model Context Protocol server with 25 tools covering agent inventory, alert hunting, vulnerabilities, configuration assessment, detection rules and Active Response.

## Design decisions

- **One response shape across every tool.** Totals are honest: when the Indexer stops counting, the response says so instead of reporting a capped number as exact.
- **Aggregation tools.** A model can answer "what happened last night" in one call instead of paging through hundreds of raw alerts.
- **Guardrails for response actions.** Write tools are not even registered unless explicitly enabled. Commands go through an allowlist, and fleet-wide actions need explicit confirmation.
- **SOC workflows as MCP prompts:** shift briefing, alert triage, host investigation and threat hunting.

## Testing

92 automated tests run against mocked Wazuh APIs, so no Wazuh instance is needed. A contract test enforces the response shape on every registered tool.
