# Tong Studio Booking Form

Standalone booking form for Tong Studio — select studio, date, timing, add-ons, and submit details.

## Run locally

```bash
npm install
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

## Structure

- **`src/pages/BookingPage.tsx`** — Main 4-step booking flow (studio selection, date, timing, add-ons & contact)
- **`src/constants/FeaturedConstants.ts`** — Studio data (titles, prices, images, features). Edit here to update studios.
- **`public/`** — Studio images (served at `/`)

## Customization

- **Studios** — Edit `src/constants/FeaturedConstants.ts` (add images to `public/` if needed)
- **Timing slots & add-ons** — Defined in `BookingPage.tsx` (`TIMING_SLOTS`, `ADDONS`)
