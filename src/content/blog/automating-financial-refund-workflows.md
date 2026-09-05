---
title: "Automating Complex Refund Workflows in Event-Driven Financial Systems"
description: "How proportional interest recalculation, distributed sagas, and automated reversals eliminate manual intervention in multi-installment refunds."
pubDate: 2026-07-20
author: "Anderson Rodrigues"
tags: ["Distributed Systems", "Clojure", "Event-Driven", "Financial Systems", "Kafka"]
readTime: "8 min read"
---

Refunding a simple single-payment purchase is straightforward: reverse the credit card charge, update the merchant balance, and issue a ledger entry. 

However, refunding a **financed, multi-installment transaction** introduces significant mathematical and operational complexity. When a customer or merchant cancels an order that was financed into 12 monthly payments, the backend must calculate proportional interest reversals, adjust future tax obligations (such as IOF), handle partially paid statement cycles, and reverse ledger entries across isolated domain microservices.

In this article, I break down how we designed and automated complex financial refund workflows using Clojure, event-driven architecture, and multi-service testing.

---

## The Challenge of Multi-Installment Refunds

When a customer refunds an active financing agreement midway through its lifecycle, several domain boundaries are touched:

1. **Past Paid Statements:** Installments already settled by the customer contain interest and principal. Refunding these requires crediting the customer's active account balance.
2. **Future Unpaid Statements:** Future installments scheduled on upcoming invoices must be canceled immediately to prevent incorrect billing.
3. **Proportional Interest & Tax Recalculation:** Interest is accrued daily based on compound formulas. A partial or full early cancellation requires recalculating the exact interest owed up to the millisecond of cancellation and waiving unearned future interest.

Previously in legacy financial systems, edge cases in these calculations required manual operational reviews by customer support or risk operations. Automation is essential for operating at scale.

---

## Event-Driven Workflow Architecture

To decouple the refund request from underlying accounting engines, we designed an event-driven workflow powered by **Apache Kafka** and **Clojure microservices**.

```
[ Merchant / Customer Refund Request ]
                  │
                  ▼
         ( API Contract / OAuth )
                  │
                  ▼
   [ Refund Orchestrator (Clojure) ]
                  │
   ┌──────────────┼────────────────────────┐
   │              │                        │
   ▼              ▼                        ▼
[ Event ]      [ Event ]               [ Event ]
`RefundInitiated` `InterestRecalculated` `LedgerReversed`
   │              │                        │
   ▼              ▼                        ▼
[ Credit Core ] [ Accounting Engine ]   [ User Statement ]
```

### Proportional Interest Calculation in Clojure

Clojure's pure functions allow us to encapsulate interest reversal logic cleanly. Here is a simplified illustration of how proportional interest and tax recalculation functions are structured:

```clojure
(defn calculate-refund-breakdown
  [{:keys [original-amount total-interest-charged paid-installments total-installments]}]
  (let [principal-per-installment (/ original-amount total-installments)
        refunded-principal        (* paid-installments principal-per-installment)
        proportional-interest     (recalculate-accrued-interest paid-installments total-interest-charged)
        waived-future-interest    (- total-interest-charged proportional-interest)]
    {:credit-to-statement (+ refunded-principal proportional-interest)
     :waived-future-debt  (* (- total-installments paid-installments) principal-per-installment)
     :waived-interest     waived-future-interest}))
```

Because this function relies strictly on immutable inputs, it can be unit-tested across thousands of generated financial edge cases (e.g., leap years, partial statement settlements, late payment penalties) without spinning up database dependencies.

---

## Handling Failures with Distributed Saga Pattern

When interacting across multiple domain boundaries (Billing, Core Banking, Credit Risk, Notifications), an atomic HTTP transaction is impossible. 

We applied the **Saga Pattern** with compensating actions:

1. **Step 1:** Reserve refund intent on the Financing service (`STATUS_REFUNDING`).
2. **Step 2:** Request credit limit adjustment from Core Banking.
3. **Step 3:** Post ledger adjustment to Accounting.
4. **Step 4:** Mark financing agreement as `CANCELLED_FULLY_REFUNDED`.

If Step 3 fails due to a temporary database disruption, a compensating event (`RollbackCreditLimitAdjustment`) is emitted, and the saga retries Step 3 using exponential backoff with circuit breaker pattern.

---

## Multi-Service Automated Testing Strategy

To guarantee financial correctness prior to deployment:

- **Contract Tests:** Pact/versioned contract tests ensure schema compatibility across domain microservices.
- **Sandbox Mocks:** Synthetic banking sandboxes allow running full end-to-end refund scenarios in CI/CD pipelines.
- **Property-Based Testing:** Using Clojure's `test.check`, we generate millions of random valid payment schedules and verify invariants (e.g., `Sum(Refunded + Remaining) == Total Original Principal`).

---

## Impact & Metrics

- **100% Operational Automation:** Eliminated manual intervention for multi-installment interest and tax reversal workflows.
- **Latency Reduction:** Reduced refund processing time from hours (manual batch review) to sub-second asynchronous completion.
- **Zero Reconciliation Drift:** Financial auditing pipelines confirm 100% precision between loan ledger adjustments and customer statements.

---

*About the Author:* **Anderson Rodrigues** is a Senior Software Engineer at Nubank specializing in Clojure, Java, and distributed systems architecture.
