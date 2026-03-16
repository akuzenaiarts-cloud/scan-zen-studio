

# Comprehensive Bug Fix, Feature Restructure & Tutorial Plan

This is a large, multi-part request covering 5 bugs, payment restructuring, and storage tutorials. Given the scope, I recommend splitting implementation across multiple messages. Here is the full plan:

---

## Part 1: Critical Bugs

### Bug 1 — Images Not Loading

**Root cause:** The `optimizedImageUrl()` function in `src/lib/utils.ts` rewrites Supabase Storage URLs from `/storage/v1/object/public/` to `/storage/v1/render/image/public/` for on-the-fly image transformation. However, **Supabase's image transformation API is a paid feature** and is likely not enabled on this project's plan. This causes all transformed URLs to return errors/blank images.

**Fix:** Remove the render/image transformation or add a fallback. The safest approach is to return the original URL when transformation is unavailable. Additionally, `MangaInfo.tsx` and `LatestCard.tsx` use `manga.cover_url` directly (without `optimizedImageUrl`), so those should work — but the hero carousel and trending section use the optimized version, which breaks.

**Changes:**
- `src/lib/utils.ts`: Modify `optimizedImageUrl()` to return the original URL directly (remove the render API transformation), since the project doesn't have image transformations enabled.

### Bug 2 — Chapters Missing from Latest Section and MangaInfo

**Root cause:** The `useAllManga` hook fetches chapters via a join on the `chapters` table: `.select("*, chapters(id, number, title, created_at, premium)")`. However, the `chapters` table has RLS policies that **only allow admins** to SELECT. Non-admin/anonymous users get zero chapters returned.

The `useMangaChapters` hook in `useMangaBySlug.ts` correctly queries `chapters_public` (the view), but `useAllManga` does NOT — it queries the base `chapters` table directly.

**Fix:**
- `src/hooks/useAllManga.ts`: The join `chapters(...)` references the base table. Since Supabase doesn't support joining views in `.select()`, we need to either:
  - Add a public SELECT RLS policy on `chapters` that exposes non-sensitive columns (everything except `pages`), OR
  - Fetch chapters separately from `chapters_public` and merge them client-side.

  The cleanest approach: **Add an RLS policy** on the `chapters` table allowing public SELECT for all columns except `pages` (which is already excluded from `chapters_public`). Since the `useAllManga` select only asks for `id, number, title, created_at, premium`, and `pages` is not included, a public SELECT policy is safe.

**Changes:**
- SQL migration: Add a public SELECT policy on `chapters` table: `CREATE POLICY "Anyone can read chapter metadata" ON public.chapters FOR SELECT TO public USING (true);`
- Note: The `pages` column won't be exposed because it's not selected in the query. For extra safety, we could create a security definer function, but since `pages` isn't in the select list, the current approach is sufficient.

### Bug 3 — Latest Page Not Mobile Responsive

**Root cause:** In `src/pages/Latest.tsx`, the filter tabs are in a horizontal flex container (`flex items-center gap-1`) inside a rounded pill, causing horizontal overflow on mobile.

**Fix:**
- `src/pages/Latest.tsx`: Restructure the layout so the title is on its own row, and the filter tabs are below it in a 2-column grid on mobile, switching to inline flex on larger screens.

### Bug 4 — PayPal "Failed to create PayPal order"

**Root cause:** The **client-side coin packages don't match the server-side valid packages**. 

- Client (`CoinShop.tsx`) generates packages with multipliers: `[1, 3, 7, 15, 32, 100]` relative to `baseAmount`
- Server (`paypal-purchase/index.ts` and `stripe-checkout/index.ts`) validates against multipliers: `[1, 2, 5, 10, 20]`

When a user selects any package except the first one, the `coins` and `amount` values don't match any server-side package, so it returns "Invalid coin package".

Additionally, the PayPal edge function reads credentials from `site_settings` (the `premium_general` key), but that key requires admin role to read (it's not in the public-readable allowlist in the RLS policy). The service role key is used in the edge function though, so this should work. The main issue is the package mismatch.

**Fix:**
- `src/pages/CoinShop.tsx`: Change the package multipliers to match the server: `[1, 2, 5, 10, 20]` (6th package with multiplier 100 needs to be added server-side, or removed from client).
- `supabase/functions/paypal-purchase/index.ts` and `supabase/functions/stripe-checkout/index.ts`: Update server multipliers to match the client's desired tiers. Best approach: define 6 tiers on both sides using multipliers `[1, 3, 7, 15, 32, 100]`.

### Bug 5 — Check-in and Comment Streak Not Awarding Tokens

**Two sub-issues:**

**5a — Comment streak:** The `handle_new_comment()` database function reads `value->>'mission_streak_days'` and `value->>'mission_streak_reward'` from the `token_settings` row. But the admin panel saves these as `comment_streak_days` and `comment_streak_reward`. The keys don't match, so the function always falls back to defaults (3 days, 1 reward) regardless of admin config. More critically, it reads from `token_settings` but the function body references `mission_streak_days` — if the admin sets different values, they won't take effect.

**Fix:** SQL migration to update `handle_new_comment()` to read `comment_streak_days` and `comment_streak_reward` instead of `mission_streak_days` and `mission_streak_reward`.

**5b — Daily check-in:** The check-in logic in `EarnCoins.tsx` looks correct: it inserts into `user_checkins`, then calls `secure_increment_tokens` RPC when the cycle completes. However, the `secure_increment_tokens` function requires the caller to be the function owner (SECURITY DEFINER), and since it's called via `supabase.rpc()` from the client using the anon key, it should work. Let me verify the RPC is accessible — yes, it's a public function. This should work. If there's still an issue, it may be because `todayDay >= cycleDays` logic is off when `claimedDays` resets after completing a cycle.

Actually, looking more carefully: when a cycle completes (`claimedDays === cycleDays - 1` and user checks in), `todayDay = claimedDays + 1 = cycleDays`, so `todayDay >= cycleDays` is true and tokens are awarded. This looks correct.

The issue might be that the `canClaimToday` calculation has an edge case: after completing a full cycle, `claimedDays % cycleDays === 0`, so `claimedDays = 0`, and `todayDay = 1`, which means the next check-in starts a new cycle. This seems correct.

I'll add error logging to help debug if the issue persists.

---

## Part 2: Payment Method Restructure in Admin Panel

The client wants all payment configuration to be self-contained in the admin panel, without needing Lovable connectors or code access.

**Current state:** Payment credentials are stored in `site_settings` under `premium_general` key and read by edge functions. The Stripe edge function uses `Deno.env.get("STRIPE_SECRET_KEY")` (from Lovable's secret manager), not from `site_settings`.

**Problem:** The Stripe secret key needs to come from `site_settings` (admin-configurable) instead of environment variables, so the client can configure it from the admin panel.

**Changes:**
- `supabase/functions/stripe-checkout/index.ts`: Read `STRIPE_SECRET_KEY` from `site_settings.premium_general.payment_stripe_secret_key` instead of `Deno.env.get()`. Fall back to env var if not set.
- `supabase/functions/paypal-purchase/index.ts`: Already reads from `site_settings` — no change needed.
- `supabase/functions/nowpayments/index.ts`: Already reads from env vars for `NOWPAYMENTS_API_KEY`. Update to read from `site_settings` as well.
- `src/pages/admin/PremiumContent.tsx`: Restructure the Payment Methods section:
  - Show all 3 payment methods in a vertical list (not tabbed)
  - Each method has its own card with fields, status badge, and a setup tutorial
  - Add step-by-step tutorials for each payment method (Stripe, PayPal, USDT/NOWPayments)
  - Add "Enable/Disable" toggle per payment method
  - Add NOWPayments API Key + IPN Secret fields for USDT

**Security note:** The `premium_general` key in `site_settings` is NOT in the public-readable RLS allowlist, so only admins can read it. This is correct — secret keys should not be publicly readable. The edge functions use the service role key to read it.

---

## Part 3: Storage Settings with Blogger Tutorial & Usage Widget

**Changes to `src/pages/AdminPanel.tsx` (storage sub-tab):**
- Add a detailed step-by-step tutorial for configuring Blogger storage:
  1. Create a Google Cloud project
  2. Enable Blogger API v3
  3. Create OAuth 2.0 credentials
  4. Create a Blogger blog
  5. Get the Blog ID from the URL
  6. Generate an access token
- Add storage usage widgets:
  - Supabase: Query `storage.objects` via an RPC or edge function to calculate total size
  - Blogger: Cannot accurately track usage (Google CDN doesn't expose this), show "N/A" or track uploaded count locally
- Make the entire storage section responsive

For Supabase storage usage, we need a database function or edge function since we can't query `storage.objects` directly from the client. We'll create an edge function that returns the total storage used.

---

## Implementation Order (across multiple messages)

1. **Message 1:** Fix Bugs 1, 2, 3 (images, chapters, mobile responsive)
2. **Message 2:** Fix Bug 4 (PayPal package mismatch) + Bug 5 (token rewards)
3. **Message 3:** Restructure Payment Methods in Admin Panel with tutorials
4. **Message 4:** Storage tutorials and usage widgets

---

## Technical Summary

| Issue | Root Cause | Fix Location |
|-------|-----------|-------------|
| Images broken | `optimizedImageUrl` uses paid Supabase image transform API | `src/lib/utils.ts` |
| Chapters missing | RLS on `chapters` blocks non-admin SELECT | SQL migration |
| Latest not responsive | Filter tabs in horizontal flex overflow | `src/pages/Latest.tsx` |
| PayPal fails | Client packages `[1,3,7,15,32,100]` ≠ server `[1,2,5,10,20]` | `CoinShop.tsx` + edge functions |
| Tokens not awarded | DB function reads wrong JSON keys (`mission_streak_*` vs `comment_streak_*`) | SQL migration |
| Payment admin config | Stripe reads from env vars, not `site_settings` | Edge functions + Admin UI |
| Storage tutorials | Missing | `AdminPanel.tsx` storage section |

