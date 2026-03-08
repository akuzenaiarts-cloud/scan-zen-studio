

## Plan: Fix Navbar Position and Match Typography

### What's Different from the Original

Comparing the reference screenshot to our implementation:

1. **Navbar is NOT sticky** — On kaynscan.com, the navbar scrolls with the page (normal document flow). Ours uses `sticky top-0` which makes it float/stick at the top.

2. **Back arrow styling** — The original has a plain arrow icon without the circular glass background. It's just a simple `←` icon next to the "Kayn Scan" text.

3. **Typography/spacing are already close** — The Outfit font and sizes largely match. Minor tweaks needed to tighten spacing.

### Changes

**File: `src/components/Navbar.tsx`**
- Remove `sticky top-0` from the `<nav>` element, replace with just no position (static)
- Remove the circular `div` wrapper around the back arrow — make it a plain icon like the original
- Keep everything else (glassmorphism buttons, transparent bg) as-is

**File: `src/index.css`**
- No font changes needed — Outfit already matches the original

### Summary
Two targeted changes: make navbar static (not sticky) and simplify the back arrow to a plain icon.

