# Phase 4: Finances & Safety - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the auto-selected defaults.

**Date:** 2026-03-30T00:00:00Z
**Phase:** 04-finances-safety
**Mode:** discuss --auto
**Areas discussed:** Group Fund Authority, Contribution And QR Collection, Fund Visibility And Burn Rate, Forecast And Safety Awareness, SOS And Escalation

---

## Group Fund Authority

| Option | Description | Selected |
|--------|-------------|----------|
| Leader-first authority | Keep the existing leader-controlled structural model and let leader manage fund setup in V1 | ✓ |
| Dedicated treasurer role first | Introduce a new explicit treasurer permission model in this phase | |
| Member-managed pool | Let any member create and control fund settings | |

**Auto choice:** Leader-first authority
**Notes:** Auto-selected because the current codebase only models `LEADER` and `MEMBER`, and prior phases consistently preserve leader control for structural trip data.

---

## Contribution And QR Collection

| Option | Description | Selected |
|--------|-------------|----------|
| Unified QR collection surface | Show MoMo and bank QR options from one contribution surface with app-recorded confirmation | ✓ |
| Payment-provider verification first | Build webhook-backed verified money collection before shipping the fund UI | |
| Ledger-first admin flow | Start with manual ledger tables and postpone payment guidance UX | |

**Auto choice:** Unified QR collection surface
**Notes:** Auto-selected because it matches the roadmap/requirements while staying aligned with the repo's current web-first scope and avoiding premature payment-provider complexity.

---

## Fund Visibility And Burn Rate

| Option | Description | Selected |
|--------|-------------|----------|
| Summary-first finance view | Highlight collected/spent/remaining/% used with warning cards before detailed tables | ✓ |
| Detailed ledger-first | Make transaction tables the main finance experience | |
| Analytics dashboard first | Emphasize charts and benchmarking over core trip progress | |

**Auto choice:** Summary-first finance view
**Notes:** Auto-selected because the trip workspace already favors operational cards and action surfaces over dense back-office UI.

---

## Forecast And Safety Awareness

| Option | Description | Selected |
|--------|-------------|----------|
| Itinerary-aware safety modules | Prioritize weather, crowd, and service information around upcoming trip context | ✓ |
| Generic travel info page | Show a broad safety page disconnected from the itinerary | |
| External-link hub only | Rely mostly on outbound links instead of first-class in-app summaries | |

**Auto choice:** Itinerary-aware safety modules
**Notes:** Auto-selected because prior phases established the trip workspace and timeline context as the product's operational center.

---

## SOS And Escalation

| Option | Description | Selected |
|--------|-------------|----------|
| Clear high-priority SOS action | One obvious web SOS trigger with immediate visible sent state and support actions | ✓ |
| Hidden overflow emergency menu | Place SOS behind deeper menus to reduce accidental taps | |
| Background-native style escalation | Assume native/device-level emergency capabilities not available on web | |

**Auto choice:** Clear high-priority SOS action
**Notes:** Auto-selected because the project is web-first and the feature needs urgency, clarity, and minimal friction.

---

## Corrections Made

No corrections — auto mode selected recommended defaults.

## Deferred Ideas

None.
