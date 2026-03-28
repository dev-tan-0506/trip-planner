# Phase 2: the-itinerary-engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `02-CONTEXT.md`; this file preserves the main alternatives considered during discussion.

**Date:** 2026-03-28
**Phase:** 02-the-itinerary-engine
**Areas discussed:** timeline structure, timeline collaboration, progress states, map behavior, voting flow, template cloning

---

## Timeline Structure

### Item Shape
- Option considered: simple time-based item
- Option considered: medium-detail item with owner and estimated cost
- Option considered: rich item with media, status, links, and nested checklist
- **Selected:** simple time-based item with time, title, location, and short note

### Timeline Grouping
- Option considered: grouped by day
- Option considered: one long timeline for the whole trip
- Option considered: grouped by day with morning/afternoon/evening blocks
- **Selected:** grouped by day

### Drag And Drop
- Option considered: reorder and move items across days
- Option considered: reorder only within a day
- Option considered: highly flexible drag-and-drop model
- **Selected:** reorder within a day and move across days

### Untimed Items
- Option considered: allow untimed items
- Option considered: require time for every item
- Option considered: use broad time buckets only
- **Selected:** allow untimed items and show them as not yet finalized

### Create And Edit Flow
- Option considered: quick create directly in the timeline
- Option considered: dedicated modal only
- Option considered: both quick and detailed create modes
- **Selected:** quick mode plus detailed mode, with explicit insertion-point selection

### Edit And Delete Flow
- Option considered: inline editing
- Option considered: dedicated modal or side panel
- Option considered: both inline and modal editing
- **Selected:** edit in a dedicated modal/panel

- Option considered: require delete confirmation
- Option considered: immediate delete with undo
- Option considered: temporary trash model
- **Selected:** require delete confirmation

## Timeline Collaboration

### Member Contribution Model
- Option considered: members are view-only
- Option considered: members can submit structured proposals for leader review
- Option considered: members can edit a limited subset of fields directly
- **Selected:** members submit structured proposals; the leader approves changes

### Proposal Shape
- Option considered: simple structured proposals
- Option considered: freeform message-based proposals
- Option considered: full edit-form proposals
- **Selected:** simple structured proposals for time, location, note, or new item suggestions

### Proposal Review Surface
- Option considered: dedicated proposal inbox only
- Option considered: proposal indicators on timeline items only
- Option considered: both inbox and item-level indicators
- **Selected:** both, with the inbox as the primary review surface

### Proposal Moderation
- Option considered: review proposals one by one
- Option considered: bulk review
- Option considered: edit the proposal before applying it
- **Selected:** review proposals one by one

### Conflict Handling
- Option considered: leader is the final source of truth and stale proposals expire
- Option considered: merge old proposals into the latest item state
- Option considered: lock an item while the leader is editing it
- **Selected:** leader is the final source of truth and stale proposals become outdated

## Timeline Progress States

### Progress Source
- Option considered: leader updates progress manually
- Option considered: progress updates automatically from time
- Option considered: hybrid manual plus automatic
- **Selected:** automatic progress updates based on time

### Transition Rule
- Option considered: an item is active at its start time and completed when the next item begins
- Option considered: require start and end times
- Option considered: manual start/stop controls
- **Selected:** active at start time, completed when the next timed item begins

### Untimed Item Handling
- Option considered: untimed items still stay in the normal progress flow
- Option considered: untimed items are displayed as a separate state
- Option considered: infer their state from order within the day
- **Selected:** untimed items stay separate as `chua chot gio`

### Empty States And Auto Focus
- Option considered: a friendly empty state with CTA
- Option considered: prefilled example suggestions
- Option considered: CTA plus lightweight suggestions
- **Selected:** friendly empty state with clear add-action CTA

- **Selected:** the full itinerary view opens expanded, highlights the current section, and scrolls to the current portion automatically
- **Selected:** progress-state styling should be distinct and clarity-first, with exact visuals left to agent discretion

### Overlap Warnings
- Option considered: warn but still allow save
- Option considered: block save
- Option considered: no overlap handling
- **Selected:** warn but still allow save

- Option considered: warning in both form and timeline
- Option considered: form-only warning
- Option considered: timeline-only warning
- **Selected:** warning in both form and timeline

- Option considered: same-day time overlap only
- Option considered: time overlap plus too-far-apart locations
- Option considered: broad "smart inconsistency" warnings
- **Selected:** same-day time overlap only

## Map Behavior

### Map Role
- Option considered: read-only visualization of itinerary locations
- Option considered: map supports location selection while timeline stays central
- Option considered: map-first itinerary planning
- **Selected:** map supports location selection and visualization while timeline stays central

### Place Selection
- Option considered: search-led place selection
- Option considered: search plus direct map click
- Option considered: map-first place selection
- **Selected:** search plus direct map click

- Option considered: map click only suggests coordinates and still requires place confirmation
- Option considered: map click locks the place immediately
- Option considered: map click opens a separate confirmation sheet
- **Selected:** map click suggests a point, but the final place must still be confirmed

- Option considered: zoom and highlight immediately after place selection
- Option considered: silent background update only
- Option considered: separate confirmation popup
- **Selected:** zoom and highlight immediately after place selection

### Map Display
- Option considered: markers only
- Option considered: markers plus simple connector lines in itinerary order
- Option considered: real route directions
- **Selected:** markers plus simple connector lines in itinerary order

- Option considered: show all markers with light clustering when dense
- Option considered: show only a subset of highlighted places
- Option considered: always show all markers with no clustering
- **Selected:** show all markers with light clustering when needed

- Option considered: visual-only connector lines
- Option considered: approximate route lines
- Option considered: real route directions
- **Selected:** visual-only connector lines

### Synchronization
- Option considered: update the map immediately when timeline data changes
- Option considered: update only after save
- Option considered: let users choose whether to sync
- **Selected:** update immediately

- Option considered: omit items without a location
- Option considered: show temporary markers
- Option considered: require a location for all map-visible items
- **Selected:** omit items without a location

### Map Screen
- Option considered: embed map on the itinerary screen
- Option considered: separate map screen
- Option considered: embedded plus expanded view
- **Selected:** separate map screen

- Option considered: current-day-only map
- Option considered: whole-trip map
- Option considered: day-filtered map
- **Selected:** day-filtered map

- Option considered: default to the current day
- Option considered: remember the last selected day/filter
- Option considered: always open the full trip
- **Selected:** remember the last selected day/filter

- Option considered: when opened from an itinerary item, focus that item immediately
- Option considered: open as a generic map view
- Option considered: prompt the user for focus behavior
- **Selected:** focus the originating item immediately

## Voting Flow

### Vote Scope
- Option considered: vote only on new candidate places/activities
- Option considered: vote on both new candidates and replacement options for existing items
- Option considered: vote on all planning operations, including add, move, delete, and replace
- **Selected:** vote on both new candidates and replacement options for existing items

### Vote Creation
- Option considered: leader-only vote creation
- Option considered: members can propose votes and the leader approves them
- Option considered: anyone can create votes directly
- **Selected:** members can propose votes; the leader approves before publishing

### Result Application
- Option considered: all vote winners become proposals only
- Option considered: all winners apply automatically
- Option considered: new-item winners may auto-create items, but replacement winners still require leader confirmation
- **Selected:** split behavior by vote type

### Interaction Model
- Option considered: swipe-only Tinder-style voting
- Option considered: button-based like/dislike voting
- Option considered: both swipe and button voting
- **Selected:** swipe-first Tinder-style voting

### Participation Rules
- Option considered: official trip members only
- Option considered: guests with the trip link may vote
- Option considered: leader chooses per vote
- **Selected:** official trip members only

- Option considered: fixed vote with no changes allowed
- Option considered: members may change their vote before the deadline
- Option considered: leader decides per voting session
- **Selected:** members may change their vote before the deadline; only the latest active vote counts

### Vote Duration And Tie Handling
- Option considered: leader-defined deadline
- Option considered: auto-close when enough users vote
- Option considered: hybrid closure
- **Selected:** leader-defined deadline

- Option considered: leader resolves ties immediately
- Option considered: earliest-created option wins ties
- Option considered: run a tie-break round
- **Selected:** run a tie-break round, then fall back to leader decision if still tied

### Live Results
- Option considered: hide interim results
- Option considered: show live interim results
- Option considered: leader-only interim visibility
- **Selected:** show live interim results

### Replacement Vote Context
- Option considered: show the current item and challenger clearly
- Option considered: show challenger options only
- Option considered: present replacement votes like generic votes
- **Selected:** clearly show the current item and challenger

### New Item Placement
- Option considered: leader defines the target day and insertion position when creating the vote
- Option considered: ask the leader where to insert after the vote ends
- Option considered: append automatically
- **Selected:** leader defines the target day and insertion position up front

### Option Volume And Mid-Session Additions
- Option considered: small bounded option count
- Option considered: no hard cap on options
- Option considered: strict head-to-head votes only
- **Selected:** no hard cap in the data model, but the UX should still present options sequentially as cards

- Option considered: leader-only option additions
- Option considered: members can propose options and the leader approves them
- Option considered: anyone can inject options directly
- **Selected:** members can propose options and the leader approves them

- Option considered: newly approved options join immediately
- Option considered: newly approved options wait until the next round
- Option considered: the leader decides each time
- **Selected:** newly approved options join immediately from the approval point forward

## Template Cloning

### Clone Model
- Option considered: fully separate clone
- Option considered: linked clone that keeps receiving source-template updates
- Option considered: partial clone controls
- **Selected:** fully separate clone

### Cloned Content
- Option considered: copy timeline and locations only
- Option considered: copy timeline, locations, and notes
- Option considered: copy all planning history, including votes and moderation state
- **Selected:** copy timeline, locations, and notes

### Day Mapping
- Option considered: keep relative day structure and remap onto the new trip dates
- Option considered: keep the original absolute dates
- Option considered: force the leader to remap every day manually after cloning
- **Selected:** keep relative day structure and remap to the new trip

### Publishing Rights
- Option considered: leader-only template publishing
- Option considered: members can propose publishing and the leader approves
- Option considered: any member can publish
- **Selected:** leader-only template publishing

### Privacy Handling
- Option considered: automatically strip personal data when publishing
- Option considered: let the leader choose field by field
- Option considered: publish the trip exactly as-is
- **Selected:** automatically strip personal data when publishing

## the agent's Discretion

- Final visual styling for timeline progress states
- Exact proposal inbox presentation
- Exact desktop fallback for swipe-first voting
- Exact empty-state iconography and CTA wording

## Deferred Ideas

None — the discussion stayed within Phase 2 scope.
