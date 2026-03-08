

## Plan: Show Partial Items on Left and Right Edges

The reference image shows 3 fully visible slides in the center with partially visible slides peeking from both edges. Currently the slides take `33.333%` width on desktop with `align: 'center'`, which shows exactly 3 with no peek.

### Changes to `src/components/HeroCarousel.tsx`:

1. **Reduce slide width on desktop** (line 62): Change `lg:flex-[0_0_33.333%]` to `lg:flex-[0_0_28%]` so that 3 slides take ~84% of the viewport, leaving ~8% on each side for partial slides to peek through.

2. **Adjust tablet breakpoint**: Change `sm:flex-[0_0_45%]` to `sm:flex-[0_0_40%]` for a similar peek effect on tablets.

3. **Keep `align: 'center'`** (line 29) so the active group stays centered with partials on edges.

4. **Reduce edge fade overlays** (lines 105-106): Narrow the gradient width slightly (e.g., `lg:w-16`) so the partial slides are more visible rather than fully faded out.

