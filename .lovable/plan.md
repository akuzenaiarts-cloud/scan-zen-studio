

# Trending Section — Bottom Bar Redesign

## What Changed
The reference shows the rank number, title, and genres displayed in a **single horizontal dark bar/strip** below the covers — not as separate text lines. Each item has a large bold rank number on the left, then title and genres stacked to its right, all inside a dark rounded bar.

## Changes

**`src/pages/Index.tsx`** (lines 43-51) — Replace the current `<div className="mt-2">` block with a dark bar layout:

- Wrap in a dark background bar: `bg-secondary/80 rounded-md px-2 py-1.5 mt-2 flex items-center gap-2`
- Large bold rank number: `text-2xl font-extrabold text-primary`
- To the right: title (truncated, `text-sm font-bold`) and genres (`text-xs text-muted-foreground`) stacked vertically, both truncated with `min-w-0` to prevent overflow

This matches the reference strip style with big numbers on the left and compact text on the right.

## Files to Edit
- `src/pages/Index.tsx` — lines 43-51 only

