# Royal PWA release — 17 October 2026

## Design and architecture
- `royal.css` is the final presentation layer: ivory/champagne on deep green-blue, shared room/tariff/menu surfaces, selective blur with solid fallbacks, and reduced-motion support.
- Keep the menu compact; reserve descriptions and options for details. Preserve keyboard access and theme-independent dialog visibility.
- Settings owns the developer contact link. The booking modal offers the existing Hotel Premier MMT and Goibibo URLs without sending guest form data to either partner.

## Modal and cache corrections
- Opening cancels pending close timers. Old close callbacks cannot hide a reopened modal. Analytics failures no longer block dish details.
- This browser opened the previous live dark-mode modal successfully; a universal dark-mode failure was not reproduced. Device-specific failures still require verification.
- Original local image filenames use network-first reload; hashed derivatives use exact-key cache-first. Query parameters are no longer ignored for image matching.
- New releases purge only this PWA's previous caches. IndexedDB, guest data, and local uploaded photos are not erased.
- Published paths take precedence over legacy device-local `assets/` overrides. Uploaded data URLs and explicit blank slots remain preserved.
- Run `tools/build-menu-image-sizes.cjs` after replacing original files. Content hashes create new derivative URLs. Never manually replace generated derivative contents under the same hash.

## Reviews and booking limits
- The Reviews tab now renders all approved records from `data/public-reviews.json` using text nodes, not injected HTML.
- Feed schema: `{ "reviews": [{ "approved": true, "author": "Public display name", "text": "Consented review", "rating": 5 }] }`.
- The feed is intentionally empty until approved public reviews or an authorized external feed are supplied. No private CRM feedback or contact details are published. No fabricated testimonials.
- MMT and Goibibo links reuse existing hotel URLs; automated remote verification was unavailable. They are outbound booking links, not live inventory/payment integrations.
- No paid service or API has been enabled.

## Requested review-feed policy
- Display only approved 3–5-star reviews and disclose that the display is selected, not the full review history. Never derive or present an overall hotel rating from this subset.
- Display source and last successful update date. Mark data older than seven days as awaiting refresh.
- Weekly ingestion is not active: Google Business Profile project/API approval and owner OAuth authorization are required. MMT/Goibibo partner support must provide authorized review-feed access and republication permission. Booking account access alone is not a configured feed.
- Secrets must stay in a server-side secret store, never GitHub Pages JavaScript, JSON, or chat. No scraping or paid review widget is enabled.
