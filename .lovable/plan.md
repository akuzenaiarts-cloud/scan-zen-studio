

# Fix PayPal + Improve Series & Chapter Reader

## Part 1: PayPal "Things don't appear to be working" Fix

### Root Cause

When using the PayPal JavaScript SDK (`paypal.Buttons()`), the SDK manages the `payment_source` internally. The edge function is sending `payment_source.paypal.experience_context` in the create order API call, which conflicts with the SDK's own payment source handling, causing PayPal to error with "Things don't appear to be working."

### Fix: `supabase/functions/paypal-purchase/index.ts`

In the `create-order` action, remove the `payment_source` block entirely from the order body. When using the JS SDK buttons flow, the order should only contain `intent` and `purchase_units`:

```json
{
  "intent": "CAPTURE",
  "purchase_units": [{
    "amount": { "currency_code": "USD", "value": "0.99" },
    "custom_id": "userId_coins"
  }]
}
```

No frontend changes needed -- the SDK script loading and button rendering are already correct.

---

## Part 2: Improve Series Page

Enhance `src/pages/Series.tsx` with:

- **Sort dropdown**: Add a sort option (A-Z, Z-A, Latest Update, Most Views) above the results grid
- **Result count + active filter chips**: Show active filters as dismissible chips above results
- **Add "season end" and "cancelled" to status filters** since the data contains these statuses
- **Empty state**: Show a styled empty state when no results match filters
- **Collapsible genre filter**: Make genre section collapsible to save vertical space on mobile

---

## Part 3: Improve Chapter Reader (MangaFire-inspired)

Based on the MangaFire reference, add a **settings sidebar panel** and improve the reading experience:

### 3a. Reading Settings Sidebar

Replace the current floating options button with a slide-out sidebar (right side) containing:

- **Chapter selector**: Dropdown with prev/next arrows (like MangaFire's "Chapter 1" with arrows)
- **Page indicator**: "Page X/Total" display
- **Quick actions**: Bookmark, Manga Detail link, Report Error buttons
- **Reader settings toggles**:
  - "Header Sticky" -- toggle sticky header on/off
  - "Long Strip" vs "Page by Page" reading mode
  - "Fit Width" -- toggle between fit-width and original size
  - "Left to Right" / "Right to Left" reading direction
- **Bottom Progress Bar**: A thin progress bar at the bottom showing scroll position through the chapter

### 3b. Top Navigation Bar Improvements

- Add chapter info display: "Chapter X/Y" and "Page X/Z" in the header bar
- Add a compact chapter dropdown selector in the header

### 3c. Keyboard Navigation

- Left/Right arrow keys for prev/next chapter
- Escape to close sidebar

### Files Changed

1. `supabase/functions/paypal-purchase/index.ts` -- remove `payment_source` from create-order
2. `src/pages/Series.tsx` -- add sorting, filter chips, collapsible genres, empty state, extra statuses
3. `src/pages/ChapterReader.tsx` -- add settings sidebar, progress bar, keyboard nav, reading mode options

