# Unlocked Admin follow-up — 22.31

The owner unlocked the existing Admin session in the in-app browser. No PIN, prices, photos, guest records or other saved content were changed during inspection.

## Reproduced in the live unlocked view
- At 870px viewport width, menu search measured only 29.79px wide.
- Item names computed to `rgb(74,10,18)` on the dark surface.
- The nine-column menu table required horizontal scrolling for most actions.
- Admin content height was 431.91px with 4742px scroll height. Native scrolling worked and moved content to scrollTop 2568.
- Switching to a shorter tab retained the previous scroll offset, hiding its introduction.
- Rooms manager headings had the same low-contrast branding colours. Four inspected thumbnails loaded with valid natural widths.
- CRM showed zero records in this browser; exports were not triggered. Photo editor showed only upload/framing/save/remove, with no image engine. Opened and cancelled it without saving.

## Repairs
- Full-width search on a dedicated filter row; category/status controls below it, Add New Dish separately aligned. Removed duplicate cuisine shortcuts.
- Compact four-column table: photo, item/description, price/availability, expandable actions. Real category names, escaped text, labelled controls and correct up/down reorder commands.
- Explicit readable text tokens for Admin headings/labels and legacy brand-colour aliases inside the Admin content scope.
- Two-row navigation grid at desktop/tablet widths; narrow layouts retain touch-scroll navigation.
- Tab switches reset the content scroll position to zero. Existing overlay scroll restoration is retained.

## Checks
- 64 JavaScript regression suites and 17 PowerShell source checks passed.
- Added coverage for compact table shape, escaped hostile text, correct reorder commands, accessible search and tab scroll reset.
- Deployment code commit: `ec70bb9`; workflow https://github.com/avi22sh/Hotel-Premier/actions/runs/40502258233.
- Owner re-entered the existing PIN after the refresh. Live `local-admin.css?v=22.31` was confirmed; no authentication bypass was used.
- At 870px, search now measured 644.44px, item text was ivory `rgb(243,238,228)`, and the four-column table fit inside an 822px content width with no horizontal content overflow.
- Show more expanded the list from 40 to 80 entries. Native scrolling reached scrollTop 8628.8; switching to Rooms reset it to 0 and showed ivory headings.
- At a verified 390px viewport, search measured 341.6px; content scroll width and client width were both 374px. Search for Poori returned one item. Opened its photo editor and cancelled without saving.
- Restored normal 870px viewport, blank search, 40-item view and scrollTop 0. Screenshot: `admin-verified-22.31.png` in this chat's visualization folder. No saved data changed.
