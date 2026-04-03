# Project Research: Pitfalls Dimension

## Target Milestone
`v2.0` - full-app Stitch redesign plus FE/BE structural refactor.

## Critical Risks

### 1. Redesign without a real design system
**Warning sign:** screens are visually updated one by one, but spacing, typography, component states, and responsiveness drift immediately.

**Prevention:**
- build tokens and shared primitives first
- make `packages/ui` the source of truth
- redesign shells and repeated patterns before deep feature screens

### 2. Refactor that is only file moving
**Warning sign:** files become smaller, but responsibilities stay mixed and every change still touches many modules.

**Prevention:**
- split by responsibility, not by arbitrary filename size
- separate orchestration from pure logic
- separate feature composition from presentational markup

### 3. Full-app redesign causing behavior regressions
**Warning sign:** the UI looks better, but auth, trip creation, tab interactions, or leader/member permission flows subtly break.

**Prevention:**
- keep regression work as a first-class requirement
- preserve current contracts wherever possible during UI work
- verify core user flows continuously, not only at the end

### 4. Trying to redesign and invent new product scope at the same time
**Warning sign:** milestone expands into new AI bets, new business model ideas, or mobile strategy changes while the redesign/refactor is still unstable.

**Prevention:**
- freeze product-direction scope for this milestone
- treat this as modernization and maintainability work
- defer new strategic bets to a later milestone unless clearly essential

### 5. Backend refactor detached from frontend needs
**Warning sign:** backend files are reorganized in isolation, but FE still depends on oversized contracts and brittle response shapes.

**Prevention:**
- refactor backend domain-by-domain alongside the FE surfaces that consume them
- use contract clarity as a success metric, not just smaller service files

### 6. Over-centralized workspace orchestration surviving into v2
**Warning sign:** `TripWorkspaceShell` remains the place where every new redesign or behavior change lands.

**Prevention:**
- split workspace shell into navigation, data orchestration, and tab surface ownership
- let each tab own its own screen composition where possible

### 7. Leaving encoding/content hygiene unresolved during redesign
**Warning sign:** visual work ships while text quality, metadata, and copy consistency remain patchy.

**Prevention:**
- treat text/content cleanup as part of redesign acceptance
- ensure Vietnamese-first copy is consistently correct in runtime surfaces

## Recommendation

The safest milestone shape is:
- design system first
- shell and navigation next
- tab-by-tab redesign + refactor
- regression verification throughout

That sequencing lowers risk while still delivering a visible `v2.0`.
