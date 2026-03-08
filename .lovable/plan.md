

## Issues Found on MangaInfo Page

### 1. Wrong Alternative Titles for Neon Knight
The screenshot shows Neon Knight displaying `魔法の魔女伝説 · The Arcane Sorceress` — these belong to "The Arcane Witch." Need to verify the mock data has the correct `altTitles` for each manga entry (Neon Knight should show `['네온 기사', 'Cybernetic Knight']`).

### 2. Content Overflow / Sidebar Crowding
On screens between ~1024px and ~1280px, the main content and sidebar compete for space. The genre pills and description text get cut off or pushed behind the sidebar. The layout uses `xl:flex-row` (1280px+) to go horizontal, but the main content area still doesn't have enough breathing room.

### Fixes

**`src/data/mockManga.ts`**
- Verify all `altTitles` arrays match their respective manga entries (the earlier edit may have misaligned them).

**`src/pages/MangaInfo.tsx`**
- Add `overflow-hidden` or `flex-wrap` fixes to the genre pills row so they don't overflow.
- Optionally reduce sidebar width from `xl:w-[360px]` to `xl:w-[320px]` to give more room to main content.
- Ensure the info section next to the cover properly wraps text with `break-words` or similar.

