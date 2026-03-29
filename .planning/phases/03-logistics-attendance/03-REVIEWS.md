---
phase: 03
reviewers:
  - gemini
reviewed_at: 2026-03-29T09:56:42.7613007+07:00
plans_reviewed:
  - 03-01-PLAN.md
  - 03-02-PLAN.md
  - 03-03-PLAN.md
---

# Cross-AI Plan Review — Phase 03

## Gemini Review

# Phase 3: Logistics & Attendance - Plan Review

## 1. Summary
The implementation plans for Phase 3 are **highly comprehensive, architecturally sound, and strictly aligned** with the established project vision of "Leader-led coordination with bounded member participation." The three-plan split logically separates the three core logistics pillars (Allocation, Checklist, Attendance), ensuring that complexity is layered incrementally. The use of **snapshot-based APIs** and **Prisma transactions** for capacity-sensitive operations demonstrates a senior-level focus on data integrity and UI consistency.

---

## 2. Strengths
*   **Role-Based Integrity:** The plans consistently enforce the "Leader as structural authority" model. Leaders manage containers (rooms/rides, checklist groups, attendance sessions), while members act within them.
*   **Concurrency Handling:** Plan 01 explicitly uses Prisma transactions for self-join operations, preventing race conditions in overbooking slots.
*   **Pragmatic Attendance Model:** Recognizing web-app limitations, the "Session-based" check-in (rather than background tracking) is the correct technical choice for a PWA.
*   **Snapshot Architecture:** Returning full feature-area snapshots after mutations simplifies the frontend state management and ensures the UI always reflects the "source of truth."
*   **Vietnamese-First UX:** The UI contracts and plan tasks explicitly include Vietnamese labels (`Phân phòng/xe`, `Chia nhanh`, `Đã đến`), maintaining brand consistency.
*   **Testing Rigor:** Each plan includes dedicated E2E and unit tests for critical business rules (capacity limits, unique occupancy, and leader-only overrides).

---

## 3. Concerns

*   **Asset Storage for Proofs (HIGH):** Plan 03 introduces `photoUrl` in `AttendanceSubmission`. However, the current codebase does not yet have a defined image upload service or S3/Cloudinary integration. 
    *   *Risk:* Implementation may stall or use insecure/unscalable local storage unless an upload strategy is finalized.
*   **"Leave" Action for Members (MEDIUM):** Plan 01 focuses on `self-join`. It does not explicitly define a `self-leave` or `cancel-join` action for members who change their minds.
    *   *Risk:* Increased leader workload if members have to ask a leader to remove them from a slot.
*   **Capacity Reduction Edge Case (LOW):** If a leader reduces the capacity of a room from 4 to 2 while 4 people are already assigned, the system's "overbooked" state handling is not detailed.
    *   *Risk:* UI might look broken or confusing if occupancy > capacity.
*   **Websocket Namespace Isolation (LOW):** Plan 03 uses `/attendance`. Ensure this doesn't conflict with the existing `/votes` namespace in terms of client-side connection management.

---

## 4. Suggestions
*   **Upload Mock/Service:** For Plan 03, explicitly implement a minimal `UploadService` or use a placeholder base64/data-URL strategy for the first wave to avoid blocking on infrastructure.
*   **Unassign Endpoint:** Add a `POST /trips/:tripId/logistics/assignments/leave` endpoint to Plan 01 to complement `self-join`.
*   **Capacity Warning UI:** In Plan 01, ensure the `AllocationUnitCard` has a specific visual state for "Overbooked" (e.g., pulsing coral border) to handle cases where a leader manually overrides capacity.
*   **Checklist "My Tasks" Filter:** In Plan 02, add a "Chỉ xem việc của tôi" (Only show my tasks) toggle in the `ChecklistTab` to help members filter noise in very large groups.

---

## 5. Risk Assessment: LOW
The overall risk is low because:
1.  **Prior Patterns:** The plans reuse the successful "Snapshot" and "Gateway" patterns established in Phase 2 (Itinerary & Voting).
2.  **Explicit Boundaries:** By deferring offline mode and background tracking, the technical hurdles are restricted to standard CRUD and basic Web APIs (Geolocation/Camera).
3.  **Strong Research:** The Research Findings (03-RESEARCH.md) provided a clear technical blueprint that the plans followed accurately.

**Conclusion:** These plans are ready for execution. The only major prerequisite is deciding on a temporary or permanent storage strategy for the attendance selfie photos.

---

## Consensus Summary

Single independent reviewer completed in this run: `gemini`.

### Agreed Strengths

- Plans are well-scoped and align tightly with the product rule that leader controls structure while members act inside safe boundaries.
- Snapshot-style APIs and transaction-backed writes are the right fit for this codebase and reduce UI drift.
- Phase split across allocation, checklist, and attendance is coherent and implementation-ready.

### Agreed Concerns

- Highest priority: `photoUrl` in attendance needs an explicit storage strategy before or during execution of Plan 03.
- Medium priority: allocation should include a member `leave/unassign` path so self-service is symmetric with self-join.
- Lower priority: plan the UI/state behavior for over-capacity units when leader overrides create temporary overbooked states.

### Divergent Views

- None recorded in this run because only one independent reviewer completed successfully.
