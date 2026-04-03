# Project Research: Stack Dimension

## Target Milestone
`v2.0` - Stitch redesign and architecture refactor for the existing web product.

## Existing Stack Worth Keeping

### Frontend
- **Next.js 16 + React 19** remain the right app shell for the current product.
- **Tailwind CSS 4 + Framer Motion** are already sufficient for implementing a Stitch-driven redesign.
- **Zustand + React Hook Form + Zod** already cover local state, forms, and validation needs without forcing a state rewrite.

### Backend
- **NestJS + Prisma + PostgreSQL** remain the right backend stack for the current domain.
- Existing domain modules already exist (`itinerary`, `votes`, `memories`, `fund`, `logistics`, etc.), so the refactor should deepen boundaries rather than replace the framework.

## Recommended Stack Direction For v2

### Core principle
Do **not** add a major platform change during this milestone. `v2.0` is about:
- visual redesign
- module boundaries
- file decomposition
- safer contracts between FE and BE

### Frontend recommendations
- Promote `packages/ui` from placeholder package into the real shared design-system package.
- Move reusable primitives, layout shells, and design tokens into `packages/ui`.
- Keep route-level screens in `apps/web/app`, but move feature logic into feature folders under `apps/web/src/features` or equivalent domain slices.
- Split `apps/web/src/lib/api-client.ts` into domain clients instead of keeping a single 1500+ line transport/types file.

### Backend recommendations
- Keep NestJS modules, but split large services into:
  - orchestration services
  - pure domain helpers
  - mappers / serializers
  - policy / permission helpers
  - repository-style Prisma access helpers where useful
- Standardize DTO, response-shaping, and shared domain types per module so service files stop being the dumping ground for every concern.

## Stack Additions Worth Considering

These are optional and only justified if they directly accelerate the redesign/refactor:
- **Storybook or equivalent isolated component workflow** for the new design system
- **shared FE contract modules** for API types by domain
- **lint or architectural boundaries** to prevent slipping back into oversized files

None of these are required to start `v2.0`. The milestone can begin successfully with the current runtime stack.

## Integration Findings From Current Codebase

- `packages/ui` exists but is barely used and still contains starter placeholder components.
- The frontend currently carries too much design and state logic directly inside route screens and large feature components.
- The backend already has domain folders, but several services have grown into "god service" files.
- The safest path is evolutionary refactor inside the current monorepo, not a stack migration.

## Confidence
High.

The codebase already proves the product works end to end on the current stack. The bottleneck is maintainability and visual consistency, not missing runtime technology.
