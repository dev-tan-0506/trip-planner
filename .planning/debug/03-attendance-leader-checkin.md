# Phase 03 Debug: Leader Check-in Gap

## Issue

UAT reported that the leader should also be able to submit attendance proof during an active check-in session, not only regular members.

## Root Cause

The backend already treats the leader as a trip member and allows that member to submit proof through `submitProof`, but the web attendance UI hides the capture action and personal attendance state whenever `snapshot.isLeader` is true. That leaves leaders able to open and close sessions, yet unable to check themselves in through the product UI.

## Evidence

- `apps/api/src/attendance/attendance.service.ts`
  - `getCurrentAttendanceSnapshot` builds attendance rows from all `tripMember` records in the trip, including the leader.
  - `submitProof` checks that the user belongs to the trip, but does not block leaders from submitting attendance.
- `apps/web/src/components/trip/AttendanceTab.tsx`
  - The check-in CTA is rendered only under `!snapshot.isLeader && snapshot.session?.status === 'OPEN'`.
  - The personal status card is also rendered only under `!snapshot.isLeader && myRow`.
  - The leader branch only shows open/close session controls.
- `apps/api/test/phase-03-attendance.e2e-spec.ts`
  - Coverage stops at "leader opens session and member submits proof".
- `apps/web/src/components/trip/__tests__/attendance-panel.test.tsx`
  - Coverage verifies leader dashboard rendering only, not leader proof submission affordances.

## Missing

- A leader-visible check-in action during an open attendance session.
- A leader-visible personal attendance status card after session open.
- Automated tests proving a leader can submit proof and see their own submission state.
