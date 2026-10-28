# Guest theme and editing boundary — v22.67

Source release: 68ddf05. Deployment: https://github.com/avi22sh/Hotel-Premier/actions/runs/40685190862

## Implemented

- Three group stay privilege cards use navy panels, warm gold titles and badges, ivory body copy, aligned spacing and separators in both appearances.
- Reviews now put the hotel feedback heading and form first. Public review links follow the form and remain available to all guests, independent of rating. No rating gating or automatic submission added.
- Station distance is approximately 3 km in the home banner, location card, route distance, footer, shared landmark and hotel data. New English/Hindi/Marathi copy is included.
- Sanctuary banner has concise copy, stronger text, consistent highlight tiles and a responsive grid. Light-mode muted text is darker.
- Guest pages no longer activate staff controls from staff/admin/manage/cms query parameters or the legacy remembered flag. Dish photo/tag/variant editors were removed from guest rendering, including asset-pipeline media. Hidden variants stay hidden to guests. Editing remains in the PIN-protected Admin/CRM UI. Explicit admin.html/#admin access and five logo taps remain available; no PIN or saved edits reset.

## Verification

- 70/70 JavaScript suites passed, including a new guest/editor boundary regression. 17/17 source checks passed.
- Business-content comparison permits only the owner-approved station-distance correction; remaining inventory, rates, descriptions, policies, contact and menu records retain their baseline.
- Live v22.67 verified on the existing legacy ?staff=1 URL: body staff class false, Staff Studio absent from guest settings, zero inline editor nodes in an open dish dialog.
- Live light/dark and 375px checks: home, group cards, review order, dark Stay/Tariffs and dish detail sheet. Phone document width remained within viewport. Group titles computed rgb(241,211,154), body rgb(224,227,233) on navy in both themes.
- Marathi home copy and approximately 3 km distance verified; restored English/light and normal viewport. Feedback form precedes public review links in rendered layout. No enquiry, review or message sent.
- Physical iOS/Safari and unlocked Admin visual testing were not performed in this pass. Admin authentication regression suites passed.

Evidence in the chat visualization folder: group-privileges-22.67.png, home-sanctuary-22.67.png, reviews-first-mobile-22.67.png.
