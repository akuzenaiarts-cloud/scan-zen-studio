

# HeroCarousel Redesign — Full-Width with Edge Fading, Drag & Infinite Loop

## Changes

### 1. `src/components/TypeBadge.tsx`
- Change the `default` variant styling to uniform grey background (`bg-gray-700`) with white text (`text-white`) and no border for all types
- Remove the per-type color styles from the default variant entirely — all badges get the same grey/white treatment

### 2. `src/components/HeroCarousel.tsx` — Full rewrite
**Replace the custom transform-based slider with Embla Carousel** (already installed as `embla-carousel-react`) to get:
- **Drag/swipe** support (mouse + touch) out of the box
- **Infinite loop** via Embla's `loop: true` option

**Layout:**
- Remove the container constraint — the carousel should be full-width (edge-to-edge). Either render it outside `container` in Index.tsx or use negative margins
- Increase cover height: `h-[500px] md:h-[550px]`
- Use Embla with `align: 'center'`, `loop: true`, `slidesToScroll: 1`
- Each slide: `flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_33.333%]` with gap via padding — this naturally shows partial cards on both edges

**Edge fading overlays:**
- Add two fixed gradient overlays on left/right edges of the container:
  - Left: `bg-gradient-to-r from-background to-transparent` (~80px wide)
  - Right: `bg-gradient-to-l from-background to-transparent` (~80px wide)
- These create the shadow/fade effect on partially visible cards at the edges, matching the reference

**Navigation arrows:**
- Always visible (infinite loop, so always scrollable)
- Large circular dark buttons positioned at the edges, over the fade overlays
- `ChevronLeft` / `ChevronRight` icons

**Mobile:**
- Slides at `flex-[0_0_85%]` so only 1 card is fully visible with small peeks on both sides + fading overlays

**Card content** (unchanged from current):
- TypeBadge top-left (now grey/white uniform)
- Bottom gradient overlay with alt title, title, blinking status dot, description

### 3. `src/pages/Index.tsx`
- Wrap the HeroCarousel in a full-width container: add a wrapper `div` with `-mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-24` (negative margins to break out of the container) or move HeroCarousel outside the `container` div entirely
- Keep the rest of the page layout unchanged

## Files to Edit
1. `src/components/TypeBadge.tsx` — uniform grey badges as default
2. `src/components/HeroCarousel.tsx` — full rewrite with Embla, drag, infinite loop, edge fading
3. `src/pages/Index.tsx` — full-width wrapper for hero

