# Events, Admin and photo management — 22.30

## Scope and publishing choice
The owner chose device-local editing with reviewed GitHub publishing. No Cloudflare service, remote content store, provider key or paid service was connected. Public publishing remains an explicit export/review/deploy step.

## Changes
- Events group estimator: explicit two-column desktop form, full-row date/time pair, full-row room allocation with three category controls; narrow layouts stack. This removes the tall allocation cell that created the large empty area in the supplied screenshot.
- Restaurant WhatsApp action: green enabled treatment and muted green disabled state; still requires valid guest count and native form validation before preparing an enquiry.
- Admin: one bounded scroll area beneath the header/navigation; `min-height:0` throughout the flex chain, with an independently scrollable photo editor. Clear local-save/publish status.
- Menu manager: first 40 items, search/filter across all items, Show more, collapsed taste controls. Menu section/item sequencing editor retained.
- CRM: compact counts, collapsed exports, expandable recent-record groups. No changes to private guest records or authentication.
- Replaced the photography studio with a plain photo library and upload/replace/remove editor. Removed the enhancement worker, enhancement/background-generation methods, cloud adapter and batch-calibration controls. Retained display rendering, safe upload optimization, original-photo recovery and backup compatibility.
- Entire-photo uploads preserve natural aspect ratio without baking blank borders. Optional framing crops only when the owner disables whole-photo mode. No dish colour or background generation. Guest dish images use `contain`; existing photographs are not replaced or regenerated.
- Photo save/remove operations commit before changing the visible dish. Failed writes retain the earlier image; stale uploads and repeated saves are guarded.
- Price, tags and availability likewise wait for storage. Item removal writes a layout tombstone, including for custom items, so deliberate deletion survives reload.
- Names/descriptions are included in menu save/load. Broadcasts occur after committed image/metadata writes. Room, banner and menu updates refresh matching same-device tab views; editorial text uses storage events.
- Public export now includes editorial drafts, alongside menu layout and public photos. Guest records and PIN data remain excluded.

## Validation
- 63 JavaScript suites passed. Retired three tests for deliberately removed engine capabilities and replaced them with engine-removal, delivery-routing and photo-transaction coverage. Added item-write failure/deletion and local save/reload/scope tests.
- All 17 PowerShell source checks passed with version 22.30. Public build: 712 files; enhancement worker excluded.
- Live desktop Events check on 22.29 (layout unchanged in 22.30): 1280px viewport; document width 1265px; form tracks 535.2px each and allocation tracks about 342.93px. No large empty allocation row. Proof: `events-organized-22.29.png` in this chat's visualization folder.
- Restaurant guest count 12 enabled the WhatsApp action; computed background was the intended green gradient. No enquiry was submitted and no guest contact information was entered.
- Live dish images computed `object-fit:contain`.
- Admin browser showed first-time Create local PIN. The owner was asked to complete it privately; no PIN was entered or bypassed. Unlocked dashboard/CRM scrolling remains a visual verification item.
- A requested mobile viewport override did not affect the background audit tab (it still reported 1280px). No mobile browser success is claimed for this release. Narrow CSS and source checks passed, but physical iPhone/Android checks remain necessary.
- Existing photographs, room inventory, tariffs, policies, router/POS settings and saved guest data were preserved.
