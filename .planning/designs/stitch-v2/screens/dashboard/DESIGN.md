```markdown
# Design System Document: "Mình Đi Đâu Thế?" 

## 1. Overview & Creative North Star
**Creative North Star: "The Kinetic Curator"**

This design system is not a static interface; it is a living, breathing digital companion for the Gen Z traveler. We move beyond the "grid-and-line" monotony of traditional travel apps to embrace a style that feels like a TikTok "For You" page—high-energy, immersive, and unapologetically bold. 

By leveraging **Kinetic Layering**, we break the template look. We use intentional asymmetry (e.g., overlapping images and floating typography), deep glassmorphism, and high-contrast typography scales. The goal is "Chaotic Polish": a layout that feels spontaneous and casual like a social story, but is underpinned by a rigorous, premium architectural logic.

---

## 2. Colors & Signature Textures
Our palette is a high-octane blend designed to stop the thumb-scroll. We use color not just for branding, but to signal energy levels and urgency.

### The Palette (Core Tokens)
- **Primary (Vibrant Orange):** `#a93000` (Main Actions / Brand Soul)
- **Secondary (Playful Purple):** `#5a3bdd` (Discovery / Exploration)
- **Tertiary (Neon Green):** `#006a33` (Success / "Chốt đơn" moments)
- **Surface & Background:** `#f9f6f5` (A warm, sophisticated off-white to keep the vibe premium, not clinical).

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections. We define boundaries through:
- **Tonal Shifts:** Placing a `surface-container-low` card against a `surface` background.
- **Vibrant Gradients:** Using a transition from `primary` to `primary-container` for CTAs to give them a 3D "soul."
- **Glassmorphism:** Using semi-transparent surface colors with a `24px` backdrop-blur for floating navigation.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, frosted acrylic sheets. 
1. **Base Layer:** `surface` (The foundation).
2. **Content Sections:** `surface-container-low` (Subtle definition).
3. **Interactive Cards:** `surface-container-lowest` (The "lifted" white look).
4. **Active Overlays:** Glassmorphic layers with 60% opacity of the surface color.

---

## 3. Typography
We use a "Mega-Scale" approach. If a heading is important, it should be loud. If it’s body text, it should be hyper-readable.

*   **Display (Be Vietnam Pro):** Used for "ét ô ét" moments or major screen headers. High-weight, tight tracking.
    *   *Display-lg:* 3.5rem (The "Hero" statement).
*   **Headline (Be Vietnam Pro):** For section titles like "Lên đồ ngay!".
    *   *Headline-md:* 1.75rem.
*   **Body & Labels (Plus Jakarta Sans):** Geometric and modern. Used for the "Casual Talk" components.
    *   *Body-lg:* 1rem (The standard for Gen Z slang interaction).

**Tone Note:** Copy must always be in Gen Z Vietnamese. Instead of "Confirm," use "Chốt đơn." Instead of "Beautiful," use "Xịn xò."

---

## 4. Elevation & Depth
In this system, depth is organic, not artificial. We don't use "Shadow_01" presets.

*   **Tonal Layering:** Achieve hierarchy by stacking `surface-container-lowest` on top of `surface-container-high`. It creates a "soft lift" that feels architectural.
*   **Ambient Shadows:** For Floating Action Buttons (FABs) or "Lên đồ" cards, use extra-diffused shadows. 
    *   *Blur:* 32px to 64px.
    *   *Opacity:* 6% - 10%.
    *   *Color:* Use a tinted version of `on-surface` (never pure black).
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline-variant` token at **15% opacity**. It should feel like a suggestion of an edge, not a cage.

---

## 5. Components

### Buttons & Chips
*   **Primary Action (Chốt đơn!):** Pill-shaped (`rounded-full`), using a linear gradient from `primary` to `primary-container`. High-impact, high-energy.
*   **Filter Chips:** Extra round (`rounded-md`). Use `secondary-container` for unselected and `secondary` for selected. No borders; use color-fill only.
*   **Emoji Integrations:** Every major action chip should include a relevant emoji (e.g., ✈️ for 'Bay màu', 🛵 for 'Phượt thôi').

### Cards & Discovery Lists
*   **The "No-Divider" Rule:** Never use a horizontal line to separate list items. Use a `1.4rem` (4) spacing gap or a subtle background shift between `surface-container-low` and `surface-container-lowest`.
*   **Visual Style:** Cards must use `rounded-lg` (2rem) or `rounded-xl` (3rem) corners. Images within cards should have a slight "tilt" or overlap the card boundary to create that TikTok-style kinetic energy.

### Floating Action Buttons (FAB)
*   The FAB is our "Home Base." It should be a glassmorphic circle with a high-intensity `primary` icon. Position it offset from the center to break symmetry.

### Input Fields
*   **State:** Large padding (`1.2rem`), `rounded-md`, and a background of `surface-container-highest`.
*   **Error State:** Use `error_container` as a background fill rather than a red border. Keep it "soft-loud."

---

## 6. Do's and Don'ts

### Do:
*   **Overlap Elements:** Let images bleed into the margins or overlap with text to create depth.
*   **Use High-Contrast Scaling:** Make "Display" text massive and "Label" text tiny but uppercase for a premium editorial look.
*   **Embrace the "Extra Round":** If a corner can be rounder, make it rounder. Use the `xl` (3rem) token for main container cards.

### Don't:
*   **Don't use #000000:** Use `on-surface` (`#2f2e2e`) for text. Pure black kills the vibrant Gen Z energy.
*   **Don't use Dividers:** If you feel the urge to draw a line, add `1.4rem` of white space instead.
*   **Don't be Formal:** Avoid "Chào mừng bạn." Use "Hế lô bạn iu!" or "Đi đâu đây?" to keep the friendly, casual vibe.
*   **Don't Flatten the Layers:** If two elements are on the same plane, one of them is in the wrong place. Use the `surface-container` tiers to keep the "stacked glass" feel alive.

---

*This design system is a living framework. When in doubt, ask: "Would this look cool in a 15-second travel transition video?" if the answer is no, make it bolder.*```