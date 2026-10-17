# Developer editing — current scope

## Added in 21.8 (local, not published)

Open the existing developer studio, sign in, and choose **Page Content**.

- Edit supported plain-text editorial headings and descriptions by section.
- Add, edit, reorder and remove custom text cards in Home, Stay, Tariffs, Menu, Celebrate, Explore and Contact.
- Restore original text or reset the editorial draft after confirmation.
- Export/import `hotel-premier-content.json` separately from private CRM backups.
- Import accepts only supported text targets and card fields. Text is inserted as text, never HTML.
- Storage failure leaves the previous visible draft intact.

These changes are browser-local. Export before clearing browser storage or changing devices. Exporting is not publishing, and local drafts do not appear on other guests' devices. Original content remains in the repository.

Existing Menu, Rooms and Slides controls remain available. The new editor does not modify booking calculations, navigation, room inventory, review feeds, or translated copy. Custom cards are appended to their section; reordering is between custom cards only.

## Audit and next implementation stages

1. Consolidate duplicated room data: static Stay/Tariff markup, booking rates and group estimates currently have separate representations. Render these from one validated model before offering room-category add/delete controls.
2. Add schema-based controls for room names, stock, sizes, capacities, amenities, rates and child policies. Use stable IDs, soft deletion and dependency checks so existing inquiries remain readable.
3. Add menu-category management with dish reassignment checks. Confirm that deleted dishes remain deleted after defaults and overrides are merged on reload.
4. Introduce a public-content-only publish artifact and revision history. Never publish CRM exports, API credentials or guest records.
5. A browser-side PIN is only a local UI gate, not server authorization. Shared publishing needs server-side authentication/authorization; no GitHub or provider token should be embedded in frontend JavaScript.
6. Verify developer and guest screens at mobile and desktop widths in both themes, including keyboard navigation, dialogs and overflow, before releasing 21.8.

## Verification

The new regression test checks literal-text safety, edit/add/remove, restore, storage failure, schema validation and the local sign-in guard. Existing regression tests remain green. Local browser preview timed out during this pass; visual verification and deployment remain pending.
