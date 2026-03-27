# Discuss Phase 1: Audit Log
*Date: 2026-03-28*

**Area 1: Backend Architecture & Database**
- Q: Do we need a custom backend? Supabase BaaS vs Next.js API vs NestJS?
- A: NestJS and REST API. Best long-term choice to scale up for the Mobile App phase later.
- Q: Database selection (PostgreSQL vs MongoDB vs Firebase)?
- A: Agent recommended PostgreSQL + Prisma due to financial transactions (Group Fund) requiring strict ACID compliance. User agreed.

**Area 2: Authentication Strategy**
- Q: Traditional Email/Password or Magic Link?
- A: Combine both to cover all demographics (adults prefer passwords, GenZ prefers social/links).

**Area 3: Guest Join Flow**
- Q: Force login immediately or open itinerary preview first?
- A: Open itinerary preview first. Only enforce login (gatekeeping) when a user performs a write/interactive action (e.g., voting for food, joining a room/car). Maximizes virality.

**Area 4: UI/UX Aesthetic Direction**
- Q: Minimalist/Elegant or Vibrant/Playful?
- A: Vibrant/Playful. Aim for a dynamic GenZ style (like Duolingo, Tinder) to make trip planning feel fun.
