

## Plan: Flickering Footer Redesign

### What we're building
Replace the current simple footer with the flickering grid footer from 21st.dev, adapted for this React/Vite project.

### Dependency adaptations needed
The original component uses `color-bits`, `motion` (framer-motion), `next/link`, and `@radix-ui/react-icons` — none of which are installed. We'll:
- Replace `color-bits` with a simple manual RGBA parser (createElement + getComputedStyle)
- Replace `motion` animations with CSS transitions
- Replace `next/link` with `react-router-dom` `Link`
- Replace `@radix-ui/react-icons` `ChevronRightIcon` with lucide-react's `ChevronRight`

### Files to create/edit

**1. Create `src/components/ui/flickering-grid.tsx`**
- Port the `FlickeringGrid` canvas component with the flickering animation logic
- Inline the `getRGBA` and `colorWithOpacity` helpers without `color-bits` — use a temporary DOM element to resolve CSS colors to `rgb()`, then manually construct `rgba()` strings
- Keep the text mask feature, canvas resize observer, and intersection observer

**2. Rewrite `src/components/Footer.tsx`**
- Use `FlickeringGrid` as background with gradient fade overlay
- Adapt content for Kayn Scan:
  - Left section: Logo "K", brand name, description, nav links (Home, Series, Latest)
  - Right section: Link columns — "Navigation" (Home, Series, Latest, Library), "Legal" (DMCA, Privacy, Terms), "Social" (Discord)
- Footer bottom bar with copyright text and "Kayn Scan" branding
- Use CSS transitions for hover effects instead of `motion`
- All links use `react-router-dom` `Link`

### No new npm packages required

