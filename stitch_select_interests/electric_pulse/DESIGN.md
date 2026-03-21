# Design System Strategy: The Electric High-End Editorial

## 1. Overview & Creative North Star: "Neon Nocturne"
The Creative North Star for this design system is **"Neon Nocturne."** It is a rejection of the "cookie-cutter" SaaS aesthetic in favor of a high-energy, editorial experience that feels like a premium digital magazine tailored for the night. 

To achieve a high-end feel for a Gen Z social app, we move beyond simple grids. We embrace **Intentional Asymmetry**—where a display headline might bleed off-center or an image container might overlap a text block—to create a sense of kinetic energy. We utilize deep tonal layering to create a "liquid" interface that feels responsive, alive, and unmistakably premium.

## 2. Colors: Vibrancy & Depth
Our palette is anchored in the contrast between deep, atmospheric purples and hyper-reactive neon accents.

*   **Primary (`#df8eff`):** Used for core brand moments and primary actions. It represents the "electric" energy of the platform.
*   **Secondary (`#2ff801`):** A high-visibility neon green used sparingly for "Online" status, success states, or high-intensity CTAs to create a visual "jolt."
*   **Background & Surface (`#1a0425`):** A deep, midnight obsidian that provides the canvas for our neon elements to pop without causing eye strain.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning or containment. Traditional lines clutter the Gen Z editorial aesthetic. 
*   **The Alternative:** Boundaries must be defined solely through background color shifts. Place a `surface_container_low` section directly against a `surface` background to create a "soft-edge" division.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
*   **Level 0 (Base):** `surface` (`#1a0425`).
*   **Level 1 (Sections):** `surface_container` (`#290c36`).
*   **Level 2 (Cards/Modules):** `surface_container_high` (`#31113f`).
*   **Level 3 (Interactive Elements):** `surface_container_highest` (`#391648`).

### The "Glass & Gradient" Rule
To elevate the system, use **Glassmorphism** for floating elements (e.g., bottom navigation bars or profile headers). Apply a `surface_variant` color at 40% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** For Hero CTAs, use a linear gradient from `primary` (`#df8eff`) to `primary_container` (`#d878ff`) at a 135-degree angle to provide a "chromic" depth that flat colors lack.

## 3. Typography: Expressive & Structural
We use a high-contrast typographic pairing to balance "vibe" with legibility.

*   **Display & Headlines (Epilogue):** This is our "Chunky" voice. Use `display-lg` (3.5rem) for hero moments and `headline-lg` (2rem) for section titles. These should feel heavy, confident, and slightly "oversized" to claim space.
*   **Body & Labels (Plus Jakarta Sans):** Our clean, modern sans-serif. Use `body-lg` (1rem) for content to ensure readability against dark backgrounds. 
*   **The Hierarchy Goal:** Use extreme scale differences. A `display-lg` headline paired with a `label-sm` metadata tag creates an editorial tension that feels curated and professional.

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not structural shadows.

*   **The Layering Principle:** Stacking tiers creates natural lift. An "inner" card should use `surface_container_highest` while sitting on a `surface_container` background.
*   **Ambient Shadows:** For floating modals, use a shadow with a `48px` blur, `0%` spread, and a `10%` opacity using the `primary` color (`#df8eff`). This mimics the "glow" of a neon light rather than a muddy grey drop shadow.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline_variant` (`#593e63`) at **15% opacity**. This creates a "suggestion" of a boundary without breaking the liquid flow of the design.

## 5. Components

### Buttons
*   **Primary:** Solid `primary` (`#df8eff`) with `on_primary` text. Border radius: `full`.
*   **Secondary:** Glass-effect. `surface_variant` at 20% opacity with a `full` radius and a "Ghost Border."
*   **Interaction:** On hover/active, buttons should "grow" slightly (1.05x scale) rather than just changing color.

### Cards & Content Lists
*   **Rule:** Forbid divider lines.
*   **Structure:** Use `spacing.6` (2rem) to separate content blocks. Group related items within a `surface_container` card with a `roundness.lg` (2rem) corner radius.

### Input Fields
*   **Style:** Minimalist. Use `surface_container_lowest` as the fill. 
*   **Focus State:** Instead of a thick border, use a subtle 1px "Ghost Border" and a `primary` outer glow (4px blur).

### Signature Component: The "Story Ring"
*   For a social app, profile avatars should use a `secondary` (`#2ff801`) to `primary` (`#df8eff`) conic gradient border to indicate active stories, emphasizing the "vibrant" nature of the system.

## 6. Do's and Don'ts

### Do:
*   **Use Oversized White Space:** Use `spacing.12` or `spacing.16` between major sections to let the typography breathe.
*   **Embrace Softness:** Use `roundness.xl` (3rem) for image containers to contrast against the sharp, chunky typography.
*   **Micro-interactions:** Use spring-based animations for transitions; elements should feel like they have weight and momentum.

### Don't:
*   **Don't Use Pure Black:** Avoid `#000000` for backgrounds (except for the `lowest` container tier). Use our `surface` purple-black to maintain tonal richness.
*   **Don't Use Default Icons:** Forbid thin, wiry icons. Use high-weight, "duotone" icons where the secondary path is a lower opacity of the `primary` color.
*   **Don't Over-Saturate:** If every element is neon, nothing is neon. Use the `secondary` green only for the most critical "Live" or "Action" moments.