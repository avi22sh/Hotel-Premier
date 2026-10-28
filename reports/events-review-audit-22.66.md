# Events and Reviews audit — v22.66

Published source: 3b22f1b. GitHub Pages deployment succeeded:
https://github.com/avi22sh/Hotel-Premier/actions/runs/40682115015

## Changes

- Events: editorial headings, glossy gold actions and tier tags, consistent card borders and spacing.
- Group estimator: purpose/category share a desktop row; arrival fields follow together. Separate Stay details and Rooms & guests headings, translated into Hindi and Marathi. Meal plan spans the form width. Existing calculation IDs and business constraints retained.
- Restaurant enquiry: recognizable green WhatsApp action; incomplete forms retain a distinct disabled state.
- Reviews: navy/gold introduction, removed outer ivory poster surface, moved authentic Google/MMT/Goibibo links above the private feedback form. Centered rating field and verdict. No preselected rating, fake public reviews or automatic feedback submission.
- Removed conflicting legacy light rules found during live visual verification.

## Verification

- 69/69 JavaScript regression suites; 17/17 source checks.
- After final CSS correction: contrast token, interface-language and CSS structure suites passed; public build passed.
- Live desktop and 375px browser checks: Events and Reviews render in both themes; at 375px all four event date/time fields measured 298.4px, equal to their containers. Document scroll width 360px versus 375px viewport: no horizontal overflow.
- Review hero computed gold rgb(240,212,156) on navy, outer container transparent. Five-star selection checked the fifth radio and activated five stars. Test cleared by reload; no feedback sent.
- Menu footer: desktop document height 11409px/footer bottom 11408.9px; mobile height 14130px/footer bottom 14130.6px. The screenshot's large empty tail was not reproduced, so no speculative height/overflow clipping was applied. Earlier filtered-menu audit also ended at the footer.
- Restored light mode and normal viewport. Saved Admin data and PIN untouched. Physical iPhone Safari testing not performed.

Screenshots are stored in the chat visualization folder: events-light-22.66.png, events-estimator-22.66.png, reviews-mobile-22.66.png, reviews-final-22.66.png.
