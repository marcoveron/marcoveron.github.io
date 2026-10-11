---
title: soc-analyst-llm-wazuh
description: A local-LLM SOC analyst that reads Wazuh alerts and proposes responses, with a human approving every action.
date: 2026-01-01
repo: https://github.com/marcoveron/soc-analyst-llm-wazuh
stack: [Python, LangGraph, Ollama, Streamlit, Wazuh]
tags: [ai-security, soc, llm, human-in-the-loop]
featured: true
---

An agent that reads Wazuh alerts, reasons about them and proposes active responses: block an IP, isolate a host, kill a process.

- Runs fully on-premise with Ollama (`llama3.1:8b`), so no alert data leaves the network.
- Every state-changing action pauses the LangGraph agent with an `interrupt` until an operator clicks Authorize or Deny in the Streamlit UI.
- Tools for alert retrieval, IP reputation (local Wazuh evidence plus AbuseIPDB), indicator enrichment (VirusTotal), fleet status and incident reports.
- Each decision is written to an append-only audit log.
