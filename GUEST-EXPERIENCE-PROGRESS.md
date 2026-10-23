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

## Remaining stages

Further menu/detail navigation and whole-app visual audit remain separate follow-up stages. Actual numbered room register, router survey, secure Wi-Fi backend, private administration, network approval and physical POS/isolation/Android/iPhone connection tests remain pending owner information. The new room categories, prices and authentic photos have not been replaced.
