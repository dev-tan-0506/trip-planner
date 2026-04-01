# Phase 5: Deep AI Integration - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the AI assistance layer on top of the existing trip workspace: culinary routing, health-profile conflict matching for itinerary items, booking-email parsing into itinerary drafts, local expert menu/spot assistance, outfit suggestions, daily AI podcast summaries, and local cost benchmarking warnings. This phase adds AI-guided insight and draft generation to the trip flow, not autonomous trip editing, not native-only automation, and not a separate AI-only product surface.

</domain>

<decisions>
## Implementation Decisions

### AI Authority And Data Safety
- **D-01:** AI in Phase 5 may analyze, recommend, and create drafts, but it must not silently rewrite trip structure or other high-impact data.
- **D-02:** Any AI output that would change itinerary structure, import booking details into the trip, or otherwise alter canonical trip data must go through explicit user confirmation, with leader confirmation as the default structural authority path.
- **D-03:** AI-generated warnings such as health-profile conflicts or suspiciously expensive planned costs may surface immediately as warnings because they are advisory signals, not autonomous mutations.

### Entry Points And Surface Placement
- **D-04:** Phase 5 features should live primarily inside the existing trip workspace rather than behind a separate AI hub.
- **D-05:** Sheet, panel, or route extensions are acceptable only when a specific AI flow genuinely needs more space, but the trip workspace remains the main launch point and context anchor.
- **D-06:** AI features should stay attached to the trip context they help with: routing near itinerary/map flows, booking import near timeline flows, and health/cost warnings near the items or expense context they evaluate.

### Output Shape And Action Model
- **D-07:** Culinary Routing should return an ordered suggested route with short reasoning and an explicit apply/confirm step rather than silently reordering the trip.
- **D-08:** Health profile matching should appear inline on itinerary items as warnings or risk signals, not as a separate dashboard.
- **D-09:** Booking email parsing should produce reviewable draft imports or draft itinerary items before anything is inserted into the canonical timeline.
- **D-10:** Local Expert AI and menu translation should respond in short, scan-friendly cards with a clear next action rather than long chat-like walls of text.
- **D-11:** Outfit Planner should return a small set of visual direction cards, not a long prose answer.
- **D-12:** AI Daily Podcast should produce a lightweight end-of-day audio summary paired with a short text recap.
- **D-13:** Local Cost Benchmarking should surface as warning or caution badges attached to spending context instead of becoming a standalone analytics dashboard.

### Trust, Confidence, And Fallback Behavior
- **D-14:** AI responses must communicate uncertainty honestly using wording like `gợi ý`, `ước lượng`, or `cần kiểm tra lại` whenever confidence is limited.
- **D-15:** The system must not imply certainty for booking extraction, health/dietary risk evaluation, or local-price estimates when the supporting data is incomplete or ambiguous.
- **D-16:** Email parsing and culinary route generation must always preserve a review/edit step before the result becomes canonical trip data.
- **D-17:** Warning-oriented AI outputs should support visible severity levels such as `lưu ý`, `cần xem lại`, and `nguy cơ cao` instead of a binary warn/don't-warn model.
- **D-18:** Every AI-assisted flow must have a graceful fallback to normal product behavior, including manual entry, manual edit, or skipping the AI suggestion entirely.

### the agent's Discretion
- Exact visual treatment of AI suggestion cards, as long as they remain Vietnamese-first, compact, and clearly distinct from already-confirmed trip data.
- Exact grouping of Phase 5 features into one or more execution waves, as long as the trip workspace remains the primary operational home.
- Exact audio generation mechanics for the daily podcast, as long as the user-facing surface behaves like a short playful recap rather than a heavy media workflow.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Scope
- `.planning/ROADMAP.md` — Defines Phase 5 scope: culinary routing, AI parsing, local expert assistance, outfit planner, daily podcast, and cost benchmarking.
- `.planning/PROJECT.md` — Product positioning, Vietnamese-only UX, AI feature intent, and web-first constraints.
- `.planning/REQUIREMENTS.md` — Functional requirements for PLAN-04, PLAN-05, AIX-01, AIX-02, AIX-03, AIX-04, and FINA-04.

### Prior Decisions
- `.planning/phases/01-foundation-onboarding/01-CONTEXT.md` — Establishes playful Vietnamese-first UX and leader-controlled structural edits.
- `.planning/phases/02-the-itinerary-engine/02-CONTEXT.md` — Establishes timeline as source of truth, map as support surface, and leader confirmation around structural changes.
- `.planning/phases/03-logistics-attendance/03-CONTEXT.md` — Reinforces trip workspace as the coordination home and bounded member actions under leader authority.
- `.planning/phases/04-finances-safety/04-CONTEXT.md` — Reinforces warning-oriented trip modules, serious caution tone when needed, and trip-scoped operational surfaces.

### Existing Implementation Context
- `packages/database/prisma/schema.prisma` — Current domain model, including existing `healthProfile` on `User` and trip-scoped entities that AI features will read from or annotate.
- `apps/web/src/components/trip/TripWorkspaceShell.tsx` — Existing trip workspace shell and current trip-scoped surface composition model.
- `apps/web/src/lib/api-client.ts` — Current typed client contracts, snapshot patterns, and trip-feature integration style.
- `apps/web/src/components/trip/TimelineDaySection.tsx` — Current itinerary presentation layer where inline health/risk warnings may need to surface.
- `apps/web/src/components/trip/FinanceSafetyTab.tsx` — Current example of warning-oriented informational modules inside the trip workspace.
- `apps/web/src/components/trip/TripMapScreen.tsx` — Existing map support surface relevant to culinary route suggestion output.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/components/trip/TripWorkspaceShell.tsx`: The primary trip-scoped shell already hosts multiple operational tabs and is the best launch point for most AI features.
- `apps/web/src/lib/api-client.ts`: The codebase already favors typed, feature-scoped API modules and snapshot-style responses after mutations.
- `packages/database/prisma/schema.prisma`: `User.healthProfile` already exists, so health-profile matching can build on existing persisted data instead of inventing a new profile system first.
- `apps/web/src/components/trip/TimelineDaySection.tsx`: Existing timeline cards provide a natural place for inline AI conflict warnings and route-related affordances.
- `apps/web/src/components/trip/FinanceSafetyTab.tsx`: Existing trip-scoped warning and summary surfaces can inform how AI caution states should read in the UI.
- `apps/web/src/components/trip/TripMapScreen.tsx`: Existing map projection behavior can support route suggestion visualization instead of requiring a completely separate map product.

### Established Patterns
- The product consistently keeps trip operations inside one workspace rather than scattering them across unrelated top-level routes.
- Leader-controlled structural authority remains the default governance model for trip-changing actions.
- Current feature APIs lean toward explicit trip-scoped routes and canonical snapshot refreshes rather than hidden background mutation flows.
- Vietnamese-first copy and friendly presentation remain non-negotiable, but warning/alert surfaces can adopt a more serious tone when trust is involved.

### Integration Points
- Phase 5 likely needs new AI-focused feature modules on both API and web, but they should plug into existing trip-scoped patterns instead of bypassing them.
- Health-profile matching will likely intersect the itinerary domain and render through timeline item or editor surfaces.
- Culinary routing will likely intersect itinerary plus map features rather than living as a disconnected standalone tool.
- Booking email parsing, local expert outputs, outfit suggestions, podcast generation, and cost benchmarking should all feed existing trip data or trip-facing UI surfaces rather than create parallel source-of-truth models.

</code_context>

<specifics>
## Specific Ideas

- AI should feel helpful and confident enough to save time, but never magical in a way that hides uncertainty or overrides group planning authority.
- Outputs should skew toward compact cards, warnings, and draft proposals rather than verbose chatbot transcripts.
- Trust-sensitive AI results need language that helps the group understand whether something is a soft suggestion, a caution, or a high-risk warning.
- The trip workspace should remain the emotional center of the product even as AI features expand.

</specifics>

<deferred>
## Deferred Ideas

### Reviewed Todos (not folded)
- `Track proposal realtime sync follow-up` — reviewed during Phase 5 discuss, but deferred because it belongs to collaboration/realtime hardening rather than the AI-assistance scope of this phase.

</deferred>

---

*Phase: 05-deep-ai-integration*
*Context gathered: 2026-04-01*
