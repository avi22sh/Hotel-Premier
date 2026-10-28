# Hotel Premier navigation, Events and QR refinement

## Delivered

- Removed Previous/Next arrows from the main section strip. Horizontal tab scrolling remains available; guarded page swipes add a brief direction-aware entry transition and respect reduced motion.
- Kept form controls, galleries, overlays and Admin outside section-swipe handling.
- Updated the direct benefit label to “₹200 off eligible direct stays”, including Hindi and Marathi wording.
- Used the existing Playfair Display typeface consistently for English dish names in cards and details; retained Devanagari fallbacks.
- Refined Events card spacing, full-width room allocation controls and event enquiry actions. Corrected the light Events introduction to the semantic muted text colour.
- Constrained the GPS QR to a square with a white quiet zone. The global image helper now recognizes generated QR images instead of assigning landscape-photo dimensions or unrelated photo labels. A failed generated image reveals its QR canvas rather than a photo placeholder.
- Redesigned QR Studio cards with the original logo tinted gold, navy masthead, ivory scan area, deep-red title and gold footer. Print uses a standalone body-level card with exactly one frozen QR image and cleans up on print close/failure. Raw PNG download remains separate.

## Verification

- All 68 JavaScript regression suites passed after the QR image-helper change.
- The final single-QR print correction passed its behaviour regression; all 17 source checks passed at v22.57.
- Live mobile browser checks: arrow-free menu; Playfair Display dish titles; dish details open in both themes; no horizontal overflow in the checked event controls; the GPS QR measured 160 × 160 rather than approximately 558 × 900.
- Live desktop checks: custom room allocation spans the form with three columns. Adding one King room changed the default CP estimate from ₹5,400 to ₹8,400, then the test quantity was restored.
- The unlocked QR Studio card was visually inspected. A physical print and a real-phone scan/swipe were not performed; simulated gesture guards and print lifecycle are covered by behaviour tests.
- Final live v22.57 check: Events subtitle computed as `rgb(82, 89, 104)`; mobile menu had zero navigation arrows and no horizontal page overflow; generated Maps QR declared and displayed at 160 × 160 with the accessible label “Scan QR code”. GitHub Pages deployment completed successfully for commit `48f9541`.

## Preserved

Prices, eligibility terms, room inventory, capacity limits, saved device-local edits and the five-router/POS network are unchanged. No guest network or external publishing backend was activated.
