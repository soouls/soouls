---
name: soouls-design-system
description: Follows the Soouls design system, which includes layout, colors, typography, effects, and anti-patterns for front-end development.
---

# Soouls Design System Guidelines

When building or updating UI components and pages for the Soouls application, you MUST adhere to the following design system rules, derived from the core `design_system.md`.

## Overview
- **Name:** Vibrant & Block-based
- **Keywords:** Bold, energetic, playful, block layout, geometric shapes, high color contrast, duotone, modern
- **Target Vibe:** Startups, creative agencies, gaming, social media, youth-focused, entertainment, consumer.

## Typography
- **Heading Font:** Playfair Display
- **Body Font:** Inter
- **Mood:** elegant, luxury, sophisticated, timeless, premium, editorial
- **Best For:** Luxury brands, fashion, spa, beauty, editorial, magazines, high-end e-commerce
- **Google Fonts Import:** `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap`

## Color Palette
Use these exact hex codes for styling components:
- **Primary:** `#8B5CF6` (Calming lavender)
- **Secondary:** `#C4B5FD`
- **CTA:** `#10B981` (Wellness green)
- **Background:** `#FAF5FF`
- **Text:** `#4C1D95`

*Note: The palette focuses on a continuous palette transition. Progress bars should be `#000000`.*

## Core Layout Patterns

### Horizontal Scroll Journey
- **Conversion Focus:** Immersive product discovery. High engagement. Keep navigation visible.
- **CTA Placement:** Floating Sticky CTA or End of Horizontal Track
- **Sections:**
  1. Intro (Vertical)
  2. The Journey (Horizontal Track)
  3. Detail Reveal
  4. Vertical Footer

### Bento Grid Showcase
- **Best for:** Features, modular displays, Apple-style showcases.
- **Structure:** 1. Hero -> 2. Bento Grid (Key Features) -> 3. Detail Cards -> 4. Tech Specs -> 5. CTA (Floating Action Button or Bottom of Grid).
- **Styling:** Card backgrounds should be `#F5F5F7` or Glass. Icons should be vibrant brand colors. Text should be dark.
- **Effects:** Hover card scale (1.02), video inside cards, tilt effect, staggered reveal. High information density without clutter. Mobile stack.

### Interactive 3D Configurator
- **Structure:** 1. Hero (Configurator) -> 2. Feature Highlight (synced) -> 3. Price/Specs -> 4. Purchase.
- **Styling:** Neutral studio background. Product uses realistic materials. Minimal UI overlay. Inside Configurator UI + Sticky Bottom Bar.
- **Effects:** Real-time rendering, material swap animation, camera rotate/zoom, light reflection.

### AI-Driven Dynamic Landing
- **Structure:** 1. Prompt/Input Hero -> 2. Generated Result Preview -> 3. How it Works -> 4. Value Prop.
- **Styling:** Input Field (Hero) + 'Try it' Buttons. Dark mode for compute feel. Neon accents.
- **Effects:** Adaptive to user input, typing text effects, shimmering generation loaders, morphing layouts.

## Key Effects
- **Gaps/Spacing:** Large sections (48px+ gaps).
- **Animation:** Animated patterns, bold hover (color shift), smooth hover transitions (150-300ms).
- **Scrolling:** Scroll-snap for specific layouts.
- **Typography:** Large type (32px+).

## Anti-patterns (What to Avoid)
- Flat design without depth.
- Text-heavy pages.
- Emojis as icons.

## Pre-Delivery UI Checklist
Before finalizing any UI, verify the following:
- [ ] No emojis as icons (use SVG: Heroicons or Lucide).
- [ ] `cursor-pointer` is on all clickable elements.
- [ ] Hover states with smooth transitions (150-300ms).
- [ ] Light mode text contrast meets 4.5:1 minimum WCAG standards.
- [ ] Focus states are visible for keyboard navigation.
- [ ] `prefers-reduced-motion` is respected in animations.
- [ ] Fully responsive on: 375px, 768px, 1024px, 1440px.
