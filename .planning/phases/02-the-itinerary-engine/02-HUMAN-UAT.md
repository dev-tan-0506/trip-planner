---
status: partial
phase: 02-the-itinerary-engine
source: [02-VERIFICATION.md]
started: "2026-03-28T07:59:00.000Z"
updated: "2026-03-28T07:59:00.000Z"
---

## Current Test

[awaiting human testing]

## Tests

### 1. Drag-and-drop reorder
expected: Leader can add 3+ items and drag to reorder; order persists on refresh
result: [pending]

### 2. Member view permissions
expected: Non-leader member sees timeline but cannot add/edit/reorder
result: [pending]

### 3. Swipe gesture voting
expected: On touch device, swipe left/right triggers vote submission with card animation
result: [pending]

### 4. Desktop vote fallback
expected: On desktop, Accept/Reject buttons visible and functional
result: [pending]

### 5. Template publish privacy
expected: Published template sanitizedSnapshot contains no member names, joinCode, or vote data
result: [pending]

### 6. Template clone flow
expected: Cloned trip has new joinCode, matching day structure, no shared FKs with source
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
