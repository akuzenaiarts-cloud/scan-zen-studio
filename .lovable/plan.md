
## What needs to change

The current `LatestCard.tsx` renders all chapters in a single flat list. Based on the reference image, it needs to show:
- Top 2 **premium** chapters (with yellow coin icon)
- A horizontal divider line
- Top 2 **free** chapters
- A blinking dot for new chapters (≤3 days old)

### Files to change

**1. `src/hooks/useAllManga.ts`**
- Increase `.slice(0, 4)` → `.slice(0, 8)` so there are enough chapters after splitting into premium/free groups (we need up to 2 of each type)

**2. `src/components/LatestCard.tsx`**
- Split `chapters` into `premiumChapters` (`ch.premium === true`, top 2) and `freeChapters` (`!ch.premium`, top 2)
- Render premium rows → divider `<div className="border-t border-border/40 my-1" />` (only if both groups have entries) → free rows
- Replace `Diamond` import with `Coins` from `lucide-react`, apply `className="w-3 h-3 text-amber-400 shrink-0"`
- Update `NewBadge` to use `animate-blink` instead of `pulse`

**3. `src/index.css`**
- Add a `@keyframes blink` animation and `.animate-blink` utility class:
```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink {
  animation: blink 1.2s ease-in-out infinite;
}
```

### Visual result
```text
┌──────────────────────────────────────┐
│ [cover] Title                        │
│         Chapter 17  🪙  18 hours ago │  ← premium
│         Chapter 16  🪙  Feb 28       │  ← premium
│         ─────────────────────────    │  ← divider
│         Chapter 15      2 days ago   │  ← free
│         Chapter 14      Feb 22       │  ← free
└──────────────────────────────────────┘
```
New dot (●) blinks on chapters ≤3 days old, showing next to the chapter number.
