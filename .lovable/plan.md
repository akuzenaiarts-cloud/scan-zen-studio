

## Light Theme Optimization Plan

### Problem
The light theme has several issues causing poor contrast and visual breakage:

1. **`--muted-foreground` in light mode is `240 5% 10%`** — nearly the same as `--foreground`. This makes "muted" text indistinguishable from normal text, and elements using `bg-muted-foreground` become dark black blobs.

2. **`--secondary` in light mode is `240 5% 33%`** — a very dark gray. Elements using `bg-secondary` as backgrounds (chapter cards, description boxes, filter pills, info cards) appear as dark blocks on the light page.

3. **`--muted` at `240 4% 83%`** is acceptable but `--secondary-foreground: 0 0% 98%` (white text) renders invisible on the dark secondary background or appears oddly on light contexts.

4. **Scrollbar colors are hardcoded dark** (`hsl(240 5% 6%)` track, `hsl(240 4% 20%)` thumb) — looks wrong on light backgrounds.

5. **`TypeBadge` uses hardcoded `text-white`** — fine on colored backgrounds but worth noting.

6. **HeroCarousel** uses hardcoded `text-white` on image overlays — this is intentional (text over images) and should stay.

### Changes

**File: `src/index.css`**

Adjust light theme (`:root`) CSS variables:
- `--muted-foreground`: change from `240 5% 10%` → `240 4% 46%` (a proper mid-gray, matching dark theme's muted)
- `--secondary`: change from `240 5% 33%` → `240 5% 92%` (light gray background instead of dark)
- `--secondary-foreground`: change from `0 0% 98%` → `240 5% 10%` (dark text on light secondary)
- `--popover`: change from `240 5% 90%` → `0 0% 100%` (white popover background)
- Make scrollbar theme-aware by using CSS variables or `.dark` scoping

Scrollbar fix — scope the dark scrollbar styles under `.dark` and add light-appropriate defaults:
```css
::-webkit-scrollbar-track {
  background: hsl(0 0% 95%);
}
::-webkit-scrollbar-thumb {
  background: hsl(0 0% 78%);
}
.dark ::-webkit-scrollbar-track {
  background: hsl(240 5% 6%);
}
.dark ::-webkit-scrollbar-thumb {
  background: hsl(240 4% 20%);
}
```

**File: `src/components/MangaInfo.tsx`**
- The description box uses `bg-secondary/60` — will now render correctly with the fixed `--secondary` value. No code change needed.

**File: `src/components/TypeBadge.tsx`**
- Uses `text-white` hardcoded. Since type badges sit on colored backgrounds, this is correct. No change needed.

### Summary
This is primarily a CSS variable fix in `src/index.css`. The light theme variables were set to dark-appropriate values, making most UI elements render as dark blocks. Fixing `--secondary`, `--muted-foreground`, `--secondary-foreground`, and the scrollbar styles will cascade through all components automatically.

### Files to edit
- `src/index.css` — fix light theme variables and scrollbar scoping

