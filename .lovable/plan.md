

## Plan: Add Dynamic Alternative Titles to Manga Data

### 1. `src/data/mockManga.ts`
- Add `altTitles?: string[]` field to the `Manga` interface
- Add sample alternative titles to each manga entry (e.g., Shadow Monarch → `['그림자 군주', 'Shadow Lord']`, Neon Knight → `['네온 기사', 'Cybernetic Knight']`, etc.)

### 2. `src/pages/MangaInfo.tsx`
- Replace the hardcoded alternative titles block (line ~66-68) with dynamic rendering from `manga.altTitles`
- If `altTitles` is empty or undefined, hide the section entirely
- Join titles with ` · ` separator

