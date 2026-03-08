

## Plan: Match Navbar to KaynScan Reference

Looking at the reference screenshot, the KaynScan navbar differs from ours in two key ways:

### 1. Transparent, borderless background
The original navbar has a fully transparent background with no bottom border — it floats over the page content seamlessly. Our current navbar uses `bg-background/95 backdrop-blur-md border-b border-border/30`.

**Change in `Navbar.tsx` (line 33):**
- Remove `bg-background/95 backdrop-blur-md border-b border-border/30`
- Replace with `bg-transparent` — making it blend into the page background

### 2. Button styling — glassmorphism instead of solid secondary
The original buttons use a subtle `backdrop-blur bg-white/10 hover:bg-white/20` glass effect instead of our opaque `bg-secondary/80`.

**Change in `Navbar.tsx`:**
- Replace all `bg-secondary/80 hover:bg-secondary` on nav buttons with `bg-white/10 hover:bg-white/20 backdrop-blur`
- Apply the same to the back-arrow circle, user badge, and mobile menu buttons
- The mobile menu background should also be transparent (`bg-background` → `bg-background/80 backdrop-blur`)

### Files to edit
- `src/components/Navbar.tsx` — update nav background and all button styles

