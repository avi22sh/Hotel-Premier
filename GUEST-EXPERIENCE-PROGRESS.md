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

## Remaining stages

Review-form simplification, further menu/detail navigation and whole-app visual audit remain separate follow-up stages. Actual numbered room register, router survey, secure Wi-Fi backend, private administration, network approval and physical POS/isolation/Android/iPhone connection tests remain pending owner information. The new room categories, prices and authentic photos have not been replaced.
