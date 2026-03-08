

## Plan: Match Slider Arrows and Dots to Reference Image

Looking at the reference image, I can see:

1. **Arrows** are below the cover thumbnails (not beside them), styled as larger circular buttons with a filled/solid dark background
2. **Dots** are inline next to the arrows (not centered below), with the active dot being larger/filled
3. **Arrows + dots sit in a single row** at the bottom-left beneath the thumbnails

### Changes to `src/components/EditorChoice.tsx`:

1. **Move arrows out of the covers row** — remove the left/right chevron buttons flanking the thumbnails
2. **Create a new bottom row** with arrows on the left and dots to their right, all in one horizontal line
3. **Style arrows** as larger (~40px) solid circular buttons with `bg-muted/50` background, matching the reference's filled circle look
4. **Style dots** as small circles inline next to the arrows, with the active dot being `bg-primary` and slightly wider

The covers row will just show the thumbnails without flanking arrows, and a new combined arrows+dots row sits below.

