# Hotel Premier — refinement progress, release 21.78

## This stage

- Reworked group accommodation around a 12-room/36-guest ceiling, separate from the hotel's 14 rooms and restaurant's 40-person capacity.
- Largest group allocation: 2 Premier Royale King + 10 combined Premier Signature Queen / Premier Companion Twin. No promise of a full-property buyout or automatic room allocation.
- Fixed the estimator reading obsolete radio controls instead of the meal-plan dropdown. Estimates use published double-occupancy rates from room data; paid extra beds are ₹300 RO / ₹500 CP. Free child beds ages 5–10 share the selected room capacity. Children count towards the guest total; meals require staff confirmation.
- Added an overnight guest counter, child-bed counter, exact nights input and blocking occupancy checks. Recalculate immediately before preparing WhatsApp text so stale previews cannot bypass policy.
- Added restaurant occasion choices and optional food/setup requests. Restaurant enquiries remain separate, staff-confirmed, and limited to 40 attendees.
- Refined Home introduction, reduced discount-heavy wording, removed room presentation emojis and clarified the one-time welcome set per stay.
- Revised factory group tiers to remove unsupported full-property privacy, free-room and tea-station promises. Obsolete stored factory tiers fall back to current published tiers without deleting the stored backup. Valid customized tiers remain editable. Admin saves reject obsolete capacity/buyout claims.
- Added accommodation policy calculations in `group-stays.js`, with regression coverage. Kept public QR/Wi-Fi architecture unchanged and inactive.
- Live QA exposed redundant menu-cache writes and update broadcasts during read-only loads. Loading no longer saves/rebroadcasts the menu, avoiding quota warnings on startup and cross-tab update loops; explicit editing saves remain intact.

## Validation

Run all `tests/*.cjs` and `tests/run-regression.ps1`. The new group test covers caps, category limits, both tariff plans, shared bed capacity, invalid occupancy/nights, legacy offers, preserved inventory, actual dropdown pricing and stale summary prevention. External WhatsApp messages must not be sent during QA.

## Release 21.79 — feedback and menu details

- Review flow is now rating → comment → guest details. Rating is an explicit native radio choice; no five-star default or preselected positive highlights. Mobile is optional, and extra visit details are collapsed.
- The prior confirmation falsely implied remote hotel delivery even though the app used device-local storage only. The new flow prepares a WhatsApp message for the guest to review and send; preparing it does not transmit anything or claim receipt. Browser feedback copies are opt-in, save failures are disclosed, and editing does not create duplicate unchanged copies. Existing stored records are untouched.
- Feedback input edits no longer automatically save the guest profile. Previously supplied profile details can still prefill the form. Private feedback is not promoted to the authorized public-review feed.
- Removed stale numerical ratings from external-platform link labels; existing destinations remain unchanged.
- Dish details use a visible, native information button with a CSS-rendered symbol rather than an icon-font dependency. Card keyboard handlers ignore nested controls, preventing keyboard activation from opening the wrong option.
- Startup now selects the requested section before awaiting photo/menu storage, with inactive sections hidden by default. This prevents unrelated sections flashing during slow QR/sub-page loads.
- Live light-mode QA found legacy dark-only backgrounds/heading colours in the review section. Release 21.81 replaces them with theme-aware glass surfaces, readable labels/placeholders, muted copy and matching star/tag/platform controls.
- Regression coverage includes all ratings, optional/invalid phone, preparation without transmission, opt-in local copy/failure/retry, and keyboard/detail-control markup. Live QA must not create test guest records or send messages.

## Release 21.82 — menu/navigation and room enquiry audit

- Global search clears stale category, subcategory, filter and favourites scope. Regional dish names are searchable. Hidden options cannot supply search matches or qualify a group for the budget filter, and fully hidden groups stay out of the full menu.
- Explicit category/all-menu selection exits favourites without deleting saved items. The category drawer uses keyboard-accessible buttons, with counts based on visible, ungrouped cards rather than duplicated hidden/grouped entries.
- Shared dish links now reopen the exact published dish/option; removed/hidden options show a notice instead of a substitute. Sharing strips room/guest query parameters and preserves zero-priced options. An explicit non-menu hash is respected on refresh. The header brand returns Home.
- Room enquiry counts respect category inventory and the existing 12-room/36-guest group ceiling. Paid and free beds share capacity, invalid occupancy blocks dispatch before recording, and the estimate reads current room-data tariffs. Child-bed counts are retained in local records; prepared messages are not labelled delivered.
- Contact copy no longer promises instant confirmation. All enquiries still require staff availability checks and final confirmation. No live enquiry/message or network configuration is changed during QA.
- Live dark-mode QA found legacy white category tiles, oversized emblems and truncated labels in the drawer. Release 21.83 adds theme-aware glass surfaces, readable wrapping names, quieter item counts and native keyboard-accessible selection without the bulky icon/current badges. Mobile navigation omits long roll-up descriptions; desktop retains them.

## Remaining stages

Final cross-section visual polish remains a follow-up stage. Actual numbered room register, router survey, secure Wi-Fi backend, private administration, network approval and physical POS/isolation/Android/iPhone connection tests remain pending owner information. Room names, approved prices and authentic photos have not been replaced.

## Release 21.84 — photo preview reliability and lighter editing saves

- Upload now awaits its actual preview rather than reporting success during a debounce. Removed undefined result variables and the silent compression fallback that could replace the chosen treatment.
- New uploads start with optional colour correction unchecked. Existing original-preserving processing remains unchanged; background selection alone does not enable colour grading.
- Save is blocked while a preview is pending, running, failed or unavailable. Obsolete render results and file reads from closed dialogs cannot replace the current preview. Closing cancels scheduled work; opening another dish ignores stale storage reads.
- Empty before/after panes no longer fetch an unrelated stock dish.
- Removed the unused full-menu cache write without deleting existing stored data. Explicit menu saves preserve original-photo lifecycle metadata in their overrides rather than replacing it.
- Verified using isolated synthetic upload/preview fixtures, plus the full regression suite. No owner photos were edited, uploaded externally or replaced during testing. Admin processing on the owner's device still needs an authenticated real-photo review.
- Wi-Fi remains inactive; no router, POS, credential or paid-service changes.

## Release 21.86 — device appearance and uncluttered navigation

- Retains the immediately preceding light/dark palettes; no historical stylesheet rollback or replacement colour scheme. Appearance now follows device settings automatically, including live setting changes, without a manual third mode.
- Removes the restaurant Guest Wi-Fi banner without activating or changing the deferred network infrastructure.
- Replaces the floating Menu emoji/count pill with a compact vector icon and label, positioned outside dining containers, with safe-area spacing and expanded-state accessibility.
- Removes visible numeric review-selection wording; retains approved review filtering, source labels, highlight context, update dates and full source links.
- Includes the pending photo-save safety fixes: immutable save snapshots, duplicate-write protection, guarded approval/restoration, original selection on reopen and no false approval on storage failure.
- Synthetic fixtures verify appearance changes, original restoration, concurrent edits and delayed saves. Owner photos, guest records, network settings and paid services remain unchanged.
