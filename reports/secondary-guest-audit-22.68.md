# Secondary guest views — v22.68

Release source: ce85839. Deployment: https://github.com/avi22sh/Hotel-Premier/actions/runs/40687184946

## Findings and fixes

- Dark Contact cards retained white surfaces while their text became ivory. Added dark semantic surfaces, readable gold headings/numbers, muted body text and gold actions with dark text. WhatsApp remains green with white text.
- Property photo viewer had wrapping navigation and a legacy dark-green surface. Added a title and accessible close icon, a centered viewport-bounded sheet, contained photography and two equal Previous/Next controls matching both appearances.
- Removed repetitive wording from the room capacity note: for example, `1 room · Up to 1 extra guest in total`. Capacity calculations and room limits are unchanged. Hindi and Marathi dynamic translations included.

## Verification

- 70 JavaScript suites passed, including updated gallery close/navigation and translated capacity cases. After the final Contact CSS edit, CSS structure, language and contrast-token suites passed again. All 17 source checks passed.
- Live v22.68 at 375px: dark Contact surface computed rgba(24,32,44,.94); non-WhatsApp actions use dark text on gold, WhatsApp uses white text. No document overflow (scroll width 360px versus viewport 375px).
- Explore route cards, direction/QR panel, attractions and home information cards retained dark surfaces with readable text in this audit. No GPS/location permission requested.
- Gallery checked in both themes. Next advances facade photo to elevator photo and caption to 2/6; close works. Full image contained within sheet; Previous/Next no longer wrap into narrow columns.
- Room enquiry opened with concise capacity text and zero inputs wider than their container. No personal details entered; no external enquiries/messages submitted.
- Restored light mode and normal viewport; saved content and Admin PIN untouched. Physical iOS testing and unlocked Admin visual QA were not performed.

Evidence in chat visualization folder: contact-dark-mobile-22.68.png, gallery-dark-mobile-22.68.png, gallery-light-mobile-22.68.png.
