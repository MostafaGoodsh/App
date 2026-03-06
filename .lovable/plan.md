

## Plan: Image Upload for Home Cards + Performance Optimization

### Problem Summary
1. **No image upload option** in `/admin/home-cards` — only a URL text input exists (line 442 of HomePageCardsManagement.tsx)
2. **Broken card images** — 3 cards point to `/lovable-uploads/placeholder.png` which doesn't exist
3. **Slow loading** — FCP is 8.4s, all 85+ routes load eagerly, 250 JS modules loaded upfront

### Changes

#### 1. Add Image Upload to HomePageCardsManagement
- Replace the URL-only `<Input>` on the Styling tab (line 440-443) with a file upload component similar to `ReelsCardManagement.tsx`
- Upload to existing `content-backgrounds` bucket (already public, supports image types)
- Add image preview thumbnail after upload
- Make background image required: disable Save button if no image is set and card_type is not a special type (tasks/anubis/reels/live_stream)
- Add `uploading` state and progress indicator

#### 2. Fix Existing Broken Images in Database
- Update the 3 cards with `placeholder.png` to use real images from the project's existing uploads:
  - **التعلم (learning)**: use an existing Egyptian-themed image
  - **الهوية الرقمية (identity)**: use an existing image
  - **الخزانة الرقمية (wallet)**: use an existing image

#### 3. Performance: Lazy Load Routes
- Convert all page imports in `App.tsx` to `React.lazy()` with `Suspense`
- This reduces initial bundle from 250 modules to only what the home page needs
- Expected improvement: FCP from ~8s to ~3-4s

#### 4. Performance: Client-Side Image Compression Before Upload
- Compress images to max 1200px width and 80% JPEG quality before uploading to storage
- Use canvas-based compression (no new dependency needed)
- Reduces upload time and storage usage

### Files to Modify
- `src/components/admin/HomePageCardsManagement.tsx` — add file upload, image preview, required validation
- `src/App.tsx` — convert all imports to lazy loading
- Database update — fix 3 placeholder image URLs

### Technical Notes
- Uses existing `content-backgrounds` storage bucket (public, allows image types, 5MB limit)
- Upload pattern copied from working `ReelsCardManagement.tsx`
- Lazy loading uses `React.lazy` + `Suspense` with a loading fallback

