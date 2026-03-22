

# Redesign Chapter Reader Header + MENU Panel

## Overview
Complete overhaul of the ChapterReader header and settings sidebar to match MangaFire/AsuraScans reference designs. Only `src/pages/ChapterReader.tsx` changes.

## Changes (single file: `src/pages/ChapterReader.tsx`)

### 1. Header Redesign (lines 252-305)
- Height increased to 56-64px
- **Left**: Home icon button (dark rounded square) → manga cover thumbnail (40×52px, smaller on mobile) → two-line text (title + "Chapter N - Title")
- **Right**: Only the MENU button — rectangular dark bg, 2×2 grid icon + bold "MENU" text
- Remove: prev/next chapter buttons, chapter dropdown, page count, BookOpen link

### 2. MENU Panel (replace existing Sheet, lines 507-626)
Replace the current `<Sheet>` with a custom right-side sliding panel (280-300px wide) with backdrop overlay.

**Panel structure top-to-bottom:**
- Manga title (bold) + collapse `>` arrow button
- "you are reading" / "by chapter" with cycle icon toggle
- Language row (globe + "English")
- Chapter selector row: `<` arrow + dropdown + `>` arrow — dropdown expands to scrollable chapter list with search
- Page selector row: same pattern — expands to scrollable page list
- Action rows: Library (bookmark toggle), Manga Detail (navigate), Report Error (simple dialog)
- Toggle rows: Header Sticky, Long Strip, Fit Height, Bottom Progress
- "Advanced Settings" button → opens modal
- Share section: Facebook, X, Discord, Reddit icon buttons

### 3. Advanced Settings Modal
Centered modal overlay with 3 tabs:
- **PAGE LAYOUT**: Page Display Style (Single/Double/Long Strip), Strip Margin input, Reading Direction (LTR/RTL), Progress Bar Position (Top/Bottom/Left/Right/None), "Show tips" toggle
- **IMAGE**: Contain to width/height, Stretch small pages, Limit max width/height, Greyscale, Dim pages toggles
- **SHORTCUTS**: Keyboard shortcut reference list (H, M, N, B, →, ←)

### 4. Settings Persistence
All settings stored in localStorage under a single key (e.g. `reader-settings`). Loaded on mount, saved on each change. Settings include: reading mode, fit mode, sticky header, reading direction, strip margin, page display style, progress bar position, image sizing toggles, image coloring toggles.

### 5. Keyboard Shortcuts Update
- `H`: Toggle header visibility
- `M`: Toggle menu panel
- `N`: Next chapter
- `B`: Previous chapter
- `←`/`→`: Page navigation (respects LTR/RTL)
- `Esc`: Close menu panel

### 6. Floating Settings Button
When sticky header is off, show a small floating gear icon button at bottom-right to open the MENU panel.

### Technical Notes
- Custom panel component built inline (not using Sheet) for full control over animation and backdrop
- Advanced Settings modal uses Dialog component from shadcn
- All new state consolidated into a single `readerSettings` object loaded from/saved to localStorage
- Bookmark toggle uses existing `useMangaBookmark` hook
- No changes to image rendering, comments section, lock screen, or any other page

