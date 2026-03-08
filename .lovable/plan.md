

## Plan: Fix Responsive Layout to Match KaynScan Reference

### Problem
The current layout uses `overflow-hidden` to clip overflowing content instead of allowing it to reflow naturally. On the reference site, the description and action buttons sit **below** the cover+title row at full width, not crammed beside the cover.

### Layout Change (MangaInfo.tsx)

Restructure the header section so that:
1. **Cover image + Title/Alt titles/Badges** are side-by-side (`flex-row` on sm+)
2. **Description** and **Action Buttons** move **outside** the side-by-side flex — they sit below at full width of the main content area
3. Remove `overflow-hidden` from the main content div since content will now flow naturally

Current structure:
```text
┌─────────────────────────────────┐
│ Cover │ Title + Badges          │
│       │ Description             │  ← crammed
│       │ Buttons                 │  ← crammed
└─────────────────────────────────┘
```

New structure (matching reference):
```text
┌─────────────────────────────────┐
│ Cover │ Title + Alt Titles      │
│       │ Badges (status/genres)  │
└─────────────────────────────────┘
│ Description (full width)        │
│ Buttons (full width)            │
└─────────────────────────────────┘
```

### File: `src/pages/MangaInfo.tsx`
- Move the description `<div>` and action buttons `<div>` out of the `flex-1 space-y-3.5` container that sits beside the cover
- Place them as siblings in the `space-y-3` main content area
- Remove `overflow-hidden` from the main content wrapper
- Keep all existing styling for badges, buttons, etc.

