# v22.86 — CRM text editing and reviewed owner images

## Owner content and backups

Exported the owner's unlocked Brave session using the normal **Backup & Publish** controls. Saved the full device backup (`Hotel_Premier_Full_Backup_2026-10-30.json`) and a separate public-only publish bundle (`hotel-premier-publish-2026-10-30.json`) in `G:\HOTEL PROJECTS`. A source ZIP and copies of the data exports are in the ignored `backups/pre-crm-text-22-86-20261030-113052` folder. These backups are excluded from Git and the public build.

Reviewed all 60 uploaded image assets with contact sheets, validated their digest filenames and copied the approved public assets. Synchronized child photos into their grouped options. Kept existing reviewed images where the browser export contained older fallback paths; removed the known pakoda placeholder from coffee, and used the new tea photo for the tea option. Repaired a legacy Paratha record exported under the invalid key `undefined`, retaining the canonical ID, **Mix Veg Paratha with Curd**, ₹140 and its place after Paneer Paratha. No room tariffs or hotel policies were changed.

## Editor changes

Menu & Pricing now has **Edit name & description** on each item, with English fields and collapsible Hindi/Marathi fields. Explicit save, validation, save status and failed-save draft retention replace the read-only text display. Renaming a grouped child updates related option names/descriptions in one IndexedDB transaction. Other prices and photos stay intact. Saving does not rebuild the entire Admin table or discard another open text editor.

Added the optional **Fresh to the Menu** badge to both Add New Dish and Manage Item. Staff can add/remove the badge without deleting a dish. The guest label follows the theme and language, including grouped dishes and selected options. Existing new-dish creation remains available through **+ Add New Dish**.

Fixed custom override loading so the stable storage key supplies a missing item ID; malformed reserved IDs are retained in backups but excluded from rendering. Added the private backups folder to Git ignores.

## Validation

74 JavaScript regression suites, 17 source checks, asset validation and whitespace checks. New coverage verifies multilingual editing, authenticated saves, grouped text synchronization, all-or-nothing storage failures, original photo/price preservation, custom-item IDs, new-item badge labels and the reviewed public publication. Physical device and unlocked post-deployment Admin visual verification are separate.

Edits remain device-local until a reviewed export is deployed, as requested by the owner. This release does not introduce automatic server publishing or a paid service.
