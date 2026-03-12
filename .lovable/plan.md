

# Plan: Fix Theme Rollback on Login and Clean Last "Kayn Scan" Reference

## Root Cause

The theme rollback on login happens because of **one line** in `ThemeContext.tsx` line 30:

```ts
const presetName = (settings as any)?.theme?.preset || 'Default';
```

When a user logs in, the auth state change causes React Query to briefly return the `DEFAULT_SETTINGS` object (which correctly has `preset: 'Sakura'`). However, during the transition, `settings` can momentarily be the raw object from React Query where the fallback `'Default'` kicks in. This applies the Default purple theme variables over the Sakura CSS, causing the visual rollback.

The second issue is the last "Kayn Scan" reference in `Navbar.tsx` line 27.

## Changes

### 1. `src/contexts/ThemeContext.tsx` line 30
Change the fallback from `'Default'` to `'Sakura'`:
```ts
const presetName = (settings as any)?.theme?.preset || 'Sakura';
```

### 2. `src/components/Navbar.tsx` line 27
Change fallback from `'Kayn Scan'` to `'MangaHub v1'`:
```ts
const siteName = settings.general.site_name || 'MangaHub v1';
```

Two single-line fixes. No other "Kayn Scan" or stale references remain in the codebase.

