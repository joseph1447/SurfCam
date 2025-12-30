# SurfCam Design System & Guidelines

## Frontend Aesthetics Framework: DISTILLED_AESTHETICS_PROMPT

> You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight.

This is the foundation of all SurfCam design. Every design decision must resist the gravitational pull toward generic, default choices.

---

## Resist Generic AI Patterns

### What Creates "AI Slop"

The most common AI-generated frontend patterns to avoid:

- **Overused Font Families:**
  - ❌ Inter (the most defaulted font across all AI tools)
  - ❌ Roboto (generic, uninspired)
  - ❌ Arial (dated, corporate)
  - ❌ System fonts (safe but soulless)
  - ❌ Space Grotesk (AI slop common choice—everyone uses it)

- **Clichéd Color Schemes:**
  - ❌ Purple gradients on white backgrounds (THE most generic AI pattern)
  - ❌ Default pastel palettes (timid, uninspiring)
  - ❌ Evenly distributed colors with no hierarchy
  - ❌ Tailwind default colors used directly (gray, blue, generic)
  - ❌ No intentional color strategy (just picking random bright colors)

- **Predictable Layouts & Components:**
  - ❌ All centered cards
  - ❌ Uniform spacing (margins all the same)
  - ❌ Standard grid with no visual variation
  - ❌ Generic UI kits without customization

- **Cookie-Cutter Design Lacking Context:**
  - ❌ Design that could apply to ANY website (no personality)
  - ❌ No reference to SurfCam's surfing/ocean context
  - ❌ Generic trendy design (glassmorphism, neumorphism without purpose)
  - ❌ No thought behind every choice

---

## Typography Excellence

### Principle
Choose fonts that are **beautiful, unique, and interesting**. Typography is the first signal of distinctive design.

### Guidelines

- **Avoid generic fonts** like Arial, Inter, Roboto, system fonts, Space Grotesk
- **Choose distinctive fonts** that elevate the frontend's aesthetics
- **Consider typography hierarchy** — Headlines, body, code, accents all need purpose
- **Draw from context** — SurfCam is about surfing, so consider fonts that evoke modern sports, ocean culture, or elegant motion

### For SurfCam

```
Headlines: Playfair Display (elegant serif, sophisticated, ocean-inspired)
Body: IBM Plex Sans (modern sans-serif, readable, professional)
Code/Accent: JetBrains Mono (technical, distinctive, code-friendly)
```

### Implementation

- Import distinctive fonts from Google Fonts or Typekit in `globals.css`
- Create CSS variables: `--font-headline`, `--font-body`, `--font-mono`
- Update `tailwind.config.ts` to extend font families
- Apply consistently across all components

---

## Color & Theme Strategy

### Principle
Commit to a **cohesive aesthetic**. Use **dominant colors with sharp accents**—not timid, evenly-distributed palettes.

### Inspiration Sources

- **IDE Themes:** Dracula, Nord, One Dark Pro (proven color psychology)
- **Ocean & Surf Culture:** Blues, teals, sandy tones, sunset oranges
- **Cultural Aesthetics:** Sports design, vintage themes, modern minimalism

### Guidelines

- **Avoid:** Purple gradients, default pastels, Tailwind defaults used directly
- **Commit:** Choose 1-2 dominant colors + 2-3 sharp accents
- **Use CSS Variables:** All colors as HSL tokens in `:root`
- **Vary themes:** Support light/dark without looking generic

### For SurfCam

```
Dominant: Deep Ocean Blue (hsl(210 50% 6%))
Secondary: Bright Teal (hsl(200 100% 50%))
Accent 1: Sunset Orange (hsl(25 100% 50%))
Accent 2: Foam White (hsl(210 20% 98%))
Accent 3: Sand Beige (hsl(35 50% 70%))
```

### Implementation

- Define all colors as CSS variables in HSL format
- Use `@apply` in Tailwind for utilities (`.bg-ocean-dark`, `.text-teal-bright`)
- Ensure sufficient color contrast for accessibility
- Test both light and dark modes

---

## Motion & Interactions

### Principle
Use animations for **effects and meaningful micro-interactions**. Prioritize high-impact moments over scattered effects.

### Guidelines

- **CSS-Only:** Prioritize CSS @keyframes and transitions for performance
- **High-Impact Moments:** Page load entrance > everything else
- **Page Load Strategy:** One well-orchestrated entrance with staggered reveals (`animation-delay` cascade)
- **Micro-moments:** State changes (chat messages, tab switches, focus states)
- **Meaningful:** Every animation serves UX, not decoration

### For SurfCam

Key animations:

- `wave` — Ocean wave effect (3s, infinite)
- `pulse-glow` — Breathing cyan glow (2s, infinite)
- `fade-in-up` — Entrance animation from bottom (0.6s)
- `staggered entrance` — Elements cascade on page load (0.1s-0.3s delays)

### Implementation

```css
/* Define in globals.css */
@keyframes wave { ... }
@keyframes pulse-glow { ... }
@keyframes fade-in-up { ... }

/* Stagger page load */
.component { animation: fade-in-up 0.6s ease-out; }
.component:nth-child(1) { animation-delay: 0.1s; }
.component:nth-child(2) { animation-delay: 0.2s; }
/* etc. */
```

---

## Backgrounds & Depth

### Principle
Create **atmosphere and depth**. Never default to solid colors.

### Guidelines

- **Layer gradients:** Use linear, radial, or conic gradients
- **Add patterns:** Subtle geometric patterns, wave patterns, textures
- **Glassmorphism:** Semi-transparent elements with `backdrop-blur`
- **Context-matching:** Backgrounds should reinforce brand (ocean, fluid, organic)
- **Avoid:** Solid white/dark, heavy images, distracting backgrounds

### For SurfCam

```css
/* Layered ocean gradient */
body {
  background: linear-gradient(135deg, #0F2A3D 0%, #06B6D4 50%, #0F2A3D 100%);
  animation: wave-animation 20s ease-in-out infinite;
}

/* Glassmorphic cards */
.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Implementation

- Layer multiple gradients for depth
- Use `backdrop-filter: blur()` for glassmorphic effects
- Create subtle animations for dynamic backgrounds
- Ensure content readability over background

---

## Component Design Philosophy

### Every Component Should

- ✅ Reflect SurfCam's surfing/ocean context
- ✅ Use the established design system (colors, fonts, animations)
- ✅ Have distinctive, memorable appearance
- ✅ Include meaningful micro-interactions
- ✅ Maintain accessibility (contrast, keyboard nav)
- ✅ Feel intentionally designed, not default

### Examples

- **Chat Tabs:** Not generic horizontal tabs—animated, ocean-themed with lock indicators
- **Chat Window:** Not plain message list—glassmorphic, gradient backgrounds, smooth animations
- **Admin Panel:** Not bland table—distinctive, with purpose-driven interactions
- **Header:** Not plain navbar—gradient, glassmorphic, animated logo

---

## Design System Tokens

### CSS Variables (in `globals.css`)

```css
/* Typography */
--font-headline: 'Playfair Display', serif;
--font-body: 'IBM Plex Sans', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Colors */
--color-ocean-dark: hsl(210 50% 6%);
--color-teal-bright: hsl(200 100% 50%);
--color-orange-sunset: hsl(25 100% 50%);
--color-white-foam: hsl(210 20% 98%);
--color-beige-sand: hsl(35 50% 70%);

/* Effects */
--effect-glass: rgba(255, 255, 255, 0.1);
--effect-glass-border: rgba(255, 255, 255, 0.2);
--effect-glow: 0 0 20px hsl(200 100% 50% / 0.3);
```

### Tailwind Configuration (in `tailwind.config.ts`)

```typescript
extend: {
  fontFamily: {
    headline: ['Playfair Display', 'serif'],
    body: ['IBM Plex Sans', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  colors: {
    ocean: { dark: '#0F2A3D', bright: '#06B6D4' },
    sunset: '#EA580C',
    foam: '#F8FAFB',
    sand: '#D4A574',
  },
}
```

---

### Typography

- **Distinctive Fonts:** Choose beautiful, contextual typography
- **Hierarchy:** Headlines, body, code, accents all intentional
- **Avoid Defaults:** No Inter, Roboto, Arial, system fonts

### Color & Theme

- **Cohesive Aesthetic:** Dominant colors + sharp accents
- **CSS Variables:** All colors as tokens
- **Context-Driven:** Ocean/surf culture inspiration
- **Vary Themes:** Light/dark support without genericness

### Motion

- **High-Impact Moments:** Page load entrance prioritized
- **CSS-Only:** @keyframes and transitions for performance
- **Staggered Reveals:** `animation-delay` cascade for entrance
- **Meaningful:** Every animation serves a purpose

### Backgrounds & Depth

- **Layered Gradients:** Never solid colors
- **Glassmorphic Effects:** Semi-transparent with backdrop-blur
- **Contextual Patterns:** Ocean/wave themes
- **Atmospheric:** Depth and visual interest

### Design Principles for SurfCam

1. **Context-Driven Design:** Reflect surfing, ocean conditions, community—fluid motion, ocean palettes, organic shapes
2. **Distinctive Typography:** Fonts that evoke surfing culture or modern sports aesthetics
3. **Purposeful Color Palette:** Ocean-anchored (blues, teals), with unexpected accents
4. **Micro-animations:** Key moments enhanced (chat transitions, stream loading)
5. **Think Outside the Box:** Every decision should surprise and delight—avoid "good enough"

---

## Project-Specific Notes

- **Live Chat Integration:** Motion and transitions critical for real-time chat UX
- **Webcam Stream:** UI complements video, doesn't compete
- **Admin Panel:** Professional, clean, but still distinctive (not generic)
- **Mobile Responsive:** Design scales beautifully across devices

---

## Designer Agent Reference

For advanced design work, reference **`agent.md`** which contains the Designer Agent framework for implementing these principles systematically. Invoke with `@designer` when redesigning components or pages.

---

**Last Updated:** November 27, 2025  
**Context:** DISTILLED_AESTHETICS_PROMPT  
**Status:** Foundation of all SurfCam design decisions
