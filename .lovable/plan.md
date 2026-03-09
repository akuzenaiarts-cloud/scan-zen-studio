

# Fix LatestCard: Show Chapters Instead of Status/Description

## Problem
The LatestCard currently displays the manga's status and description text. Based on the reference image, it should instead show a list of recent chapters with:
- Chapter number and title
- Premium indicator (diamond icon) for premium chapters
- Relative time or date for each chapter
- "New" badge for recently added chapters

## Changes

### 1. Update `useAllManga` hook to join chapters
Modify the query to fetch the latest 3-4 chapters per manga using a Supabase join: `select("*, chapters(*)")` ordered by chapter number descending, so each manga object includes its recent chapters.

### 2. Redesign `LatestCard` component
Replace the status/description section with a chapter list matching the reference design:
- Each row shows: `Chapter {number}` with optional premium diamond icon (`Crown` or diamond), and a relative date on the right
- Premium chapters get a colored diamond indicator
- New chapters (within 3 days) get the existing `NewBadge`
- Show up to 3-4 most recent chapters
- Each chapter row links to the chapter reader

### 3. Update `LatestCard` props
Accept manga with joined chapters data: `manga: Manga & { chapters: Chapter[] }`

### 4. Add relative time formatting
Add a helper to format dates as "18 hours ago", "2 days ago", or fall back to "Feb 28, 2026" for older dates.

## Visual Layout (matching reference)
```text
┌──────────┬─────────────────────────────┐
│          │  Title                      │
│  Cover   │  Chapter 17 ◆   18 hours   │
│  Image   │  Chapter 16 ◆   Feb 28     │
│          │  Chapter 15      2 days ago │
│          │  Chapter 14      Feb 22     │
└──────────┴─────────────────────────────┘
```

