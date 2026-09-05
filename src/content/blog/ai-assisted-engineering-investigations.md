---
title: "Leveraging AI Agents for Real-Time Infrastructure Incident Diagnostics"
description: "How combining LLMs, agentic workflows, internal knowledge retrieval, and telemetry diagnostics drastically reduces Mean Time to Detection (MTTD) and Resolution (MTTR)."
pubDate: 2026-06-10
author: "Anderson Rodrigues"
tags: ["Artificial Intelligence", "AI Agents", "Observability", "Distributed Systems", "DevOps"]
readTime: "6 min read"
---

When an alert fires in a high-scale microservice architecture—say, an unexpected latency spike in an authentication cluster or elevated HTTP 502 rates on a payment gateway—on-call engineers face an overwhelming wall of context. They must cross-reference Datadog metrics, query CloudWatch logs, inspect recent deployment commits, and consult internal post-mortem documentation.

To streamline this diagnostic phase, I developed an **internal AI-assisted investigation tool** designed to organize hypotheses, gather evidence autonomously, and assist engineering teams during incident triage.

---

## The Problem: Cognitive Load During On-Call Triage

The bottleneck during complex incidents is rarely *fixing* the bug; it's **finding the root cause**. On-call engineers spend precious minutes performing repetitive diagnostic steps:

1. Searching APM traces for correlated error spikes.
2. Checking deployment pipelines for recent canary rollouts.
3. Searching Slack channels or Confluence for past incident runbooks matching similar error signatures.

AI-assisted development tools (like Claude Code and GitHub Copilot) excel at writing code within an editor, but infrastructure diagnostics require an **agentic workflow** capable of querying live telemetry and reasoning about system topology.

---

## Agentic Diagnostic Architecture

The AI investigation tool uses an **Agentic Loop** powered by retrieval-augmented generation (RAG) and tool-use capabilities:

```
                  [ Incident Alert / Human Prompt ]
                                 │
                                 ▼
                     [ Diagnostic Coordinator ]
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
  [ Tool: Logs API ]    [ Tool: Metrics/Traces ]  [ Tool: Git History ]
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                   [ Hypotheses & Evidence Graph ]
                                 │
                                 ▼
                 [ Actionable Root Cause Summary ]
```

### 1. Hypothesis Generation

When provided with an incident context (e.g., `"NuPay Checkout API returning 504 Gateway Timeout"`), the agent initializes a **Diagnostic Tree** with potential hypotheses:
- *Hypothesis A:* Database connection pool exhaustion.
- *Hypothesis B:* Downstream dependency timeout or circuit breaker tripped.
- *Hypothesis C:* Memory leak introduced in the latest deployment SHA.

### 2. Autonomous Evidence Collection

Instead of hallucinating answers, the agent executes targeted read-only diagnostic tools:
- Querying Prometheus / Datadog for P99 latency broken down by downstream dependency.
- Fetching the last 10 git commits deployed to production in the affected service.
- Performing semantic search against past post-mortems for matching error codes.

### 3. Synthesis and Triage Report

Once evidence is gathered, the agent synthesizes a concise, structured diagnostic summary for the on-call engineer:

```markdown
### 🚨 Incident Investigation Summary: NuPay Checkout API 504s

**Primary Cause (Confidence: 90%):** Downstream timeout in `credit-risk-evaluator`.

**Key Evidence:**
1. P99 latency on `credit-risk-evaluator` spiked from 45ms to 3,200ms at 14:12 UTC.
2. Commit `a8f9c2d` (deployed at 14:08 UTC) introduced an unindexed query on `user_risk_profiles`.
3. Circuit breaker opened on 14:15 UTC due to 15% error threshold breach.

**Recommended Remediation:**
- Roll back deployment `a8f9c2d` to restore index query plan.
- Run `EXPLAIN ANALYZE` on `user_risk_profiles` in staging.
```

---

## Key Design Principles for AI Engineering Tools

1. **Read-Only Safety:** AI agents assisting with incident triage must have strictly scoped read-only access to metrics, logs, and git history. They should never execute destructive or state-changing infrastructure actions autonomously.
2. **Citation & Grounding:** Every claim made by the diagnostic agent must be backed by a link to a raw log trace, metric graph, or git commit.
3. **Structured Context Management:** To prevent context window bloat during long incident investigations, tool outputs (like 50,000-line log dumps) are automatically summarized into structured metrics and key stack trace frames before feeding back to the model.

---

## Real-World Impact

During initial deployment within engineering workflows, the AI-assisted investigation tool demonstrated immediate value:

- **Faster Diagnostic Time:** Reduced average time spent gathering initial incident context from ~15 minutes down to <2 minutes.
- **Improved Knowledge Sharing:** On-call engineers gained instant access to relevant historical post-mortems and runbooks.
- **Lower Cognitive Stress:** Provided structured, step-by-step hypothesis validation during high-pressure production incidents.

---

*About the Author:* **Anderson Rodrigues** is a Senior Software Engineer at Nubank exploring how AI, distributed systems, and modern observability improve engineering workflows.
