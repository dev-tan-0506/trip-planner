# Pre-v2 Working Brief

Purpose: convert the reset checklist into a concrete decision brief before opening any `v2` milestone artifacts.

## 1. What v1 Actually Proved

`v1.0` proved that the web-first trip workspace is viable as a single collaborative surface.

Working baseline from shipped product:
- auth, dashboard, trip creation, and guest join all function as the acquisition entry
- the trip workspace shell successfully hosts itinerary, logistics, finance/safety, AI, and memories together
- advisory AI features work better when embedded into workflow cards than as freeform chat
- post-trip features fit better as lightweight retention helpers than as separate heavy admin flows

## 2. Recommended Non-Negotiables to Carry Forward

These should be treated as locked unless `v2` explicitly chooses to overturn them:

- Web-first onboarding remains the easiest growth path unless the product strategy itself changes
- Vietnamese-first tone and URL-accessible product surface remain core usability constraints
- The shared trip workspace shell is the architectural center of the product
- AI should keep the `draft / warn / summarize` trust model unless `v2` intentionally changes control boundaries
- Leader-controlled structural trip edits remain the safe default until a deliberate collaboration redesign happens

## 3. Candidate Carry-Over Debt

These are the only currently visible `v1` carry-over items worth actively considering:

### Promote into v2

- Proposal realtime sync follow-up
  Source: [2026-03-28-track-proposal-realtime-sync-follow-up.md](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.planning/todos/pending/2026-03-28-track-proposal-realtime-sync-follow-up.md)
  Why: this affects collaboration quality directly, not just internal cleanliness

### Archive as historical planning debt

- Missing verification artifacts for phases `01`, `03`, `05`, `06`
- Stale requirement checkbox bookkeeping that existed during `v1`

Why: these matter for planning hygiene, but they do not define the product direction of `v2`

## 4. Decisions That Need Fresh Input Before v2

These are the questions the team should answer before any new milestone or roadmap is created:

1. Is `v2` still an extension of the same web product, or is it a strategy shift?
2. Is the next milestone about deeper collaboration quality, native/mobile expansion, or a narrower repositioned product?
3. Which `v1` feature areas are now core differentiators?
4. Which `v1` feature areas should stop growing for now?
5. Should `v2` optimize for growth, retention, monetization, operational reliability, or a platform rewrite?

## 5. Three Plausible v2 Directions

These are not final commitments. They are framing options to accelerate the reset discussion.

### Option A: Collaboration Hardening

Focus:
- realtime proposal sync
- shared-state quality
- smoother group coordination
- trust and reliability improvements inside the existing workspace

Best if:
- the current product shape is right
- the biggest pain now is polish, consistency, and collaboration smoothness

### Option B: AI Travel Concierge Expansion

Focus:
- deepen the strongest AI helpers
- add more contextual intelligence around planning, finance, and in-trip decisions
- keep web-first surface but push differentiation through AI guidance

Best if:
- the team believes the defensible moat is AI-assisted trip orchestration

### Option C: Platform / Direction Reset

Focus:
- revisit product thesis
- possibly reduce scope
- possibly re-center around a narrower user segment or a mobile-first future

Best if:
- the current roadmap no longer matches the intended business or product direction

## 6. Recommended Next Decision Sequence

Before opening `v2`, do this in order:

1. Pick which of the three direction shapes above is closest to the new intent.
2. Mark each `v1` area as one of:
   - `carry forward`
   - `freeze`
   - `drop`
3. Write a one-sentence `v2` success metric.
4. Only then create fresh milestone requirements.

## 7. Suggested Default Starting Point

If no stronger strategy signal exists yet, the safest default is:

- keep the web-first product thesis
- treat the workspace shell as fixed
- carry forward only the realtime collaboration debt
- avoid opening a huge `v2` scope until the product direction is rewritten explicitly

That default preserves momentum without accidentally committing the team to a `v2` built on old assumptions.
