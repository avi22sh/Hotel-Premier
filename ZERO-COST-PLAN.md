# Hotel Premier: zero-paid-usage plan

## Non-negotiable constraints

- Do not activate paid plans, trials requiring billing, paid API usage, or automatic upgrades. The owner now accepts a capped free image allowance that resets within a day, conditional on satisfactory results.
- Never put provider credentials or GitHub publishing tokens in browser code.
- Do not claim any hosted service is unlimited or that the app has had a complete security audit.

## Current implementation

- Photo editing runs locally using Canvas. Original photos, natural polish and studio surface treatments are supported. These are not generative AI scenes.
- The legacy cloud adapter rejects calls before making any network request.
- New studio settings saves discard legacy cloud credential fields. This does not revoke old provider keys or erase old backups; previously entered keys should be revoked with their provider.
- Dish photo choices use the selected dish's saved photos rather than generic stock presets. Staff must still verify the actual photo depicts the correct dish.
- Dish saves await local database transaction completion, with a complete local-storage fallback and explicit failure reporting.
- Export/import backups remain the manual transfer and recovery path. Clearing browser data can delete local edits; keep backups outside the browser.
- No cloud sync queue is enabled because there is no authorized server destination. Registering an empty Background Sync handler would not publish anything.

## Publication and security boundaries

Keep the existing static deployment for reviewed public menu assets. Local administrator edits are not automatically published to all visitors. Publishing remains an authenticated GitHub workflow outside the public PWA; no repository token should be embedded in the app.

The browser's admin PIN is a local convenience lock, not server-side authorization. Do not use it to protect remote writes, confidential data, or paid functions. GitHub Pages itself has hosting limits; this plan does not promise unlimited hosting.

## Daily-free pilot candidate (researched 2026-10-14; not connected)

Cloudflare Workers AI on Workers Free with `@cf/black-forest-labs/flux-2-klein-4b` is the proposed pilot, not a tested quality recommendation.

- Workers Free includes 10,000 neurons per day; requests fail at the free limit. Reset is 00:00 UTC / 05:30 Asia/Kolkata. Do not enable Workers Paid, prepaid Gateway credits, automatic top-ups or paid fallback models. Verify the actual account plan before running anything.
- This model supports reference-image editing. The model author's 4B release is Apache 2.0 and permits commercial use; do not substitute a differently licensed variant.
- Cloudflare states Workers AI customer content is not shared with other customers or used for training/improvement without explicit consent. Uploaded photos still leave the device for processing; submit only restaurant-owned food photos without personal or confidential information.
- No account connection was available through the integration directory. Account sign-in is required before testing; never paste credentials into chat or commit them to this repository.

### Quality gate before PWA integration

Test one authentic curry photo, one bread/snack photo and one beverage/dessert photo. Retain originals and make only one candidate per dish initially. Use a neutral, well-lit cream surface for light mode and a slate surface with restrained brass accents for dark mode. Keep the food bright in both.

Reference-edit instruction: Preserve the exact dish, ingredients, portion, garnish, plate and camera angle from the supplied photograph. Replace only the surrounding table/background with the selected Hotel Premier surface. Use realistic soft restaurant lighting, natural contact shadows and authentic food colours. No extra food, invented ingredients, text, logos, hands or duplicated utensils. Keep the entire plate visible.

Reject any output that changes the food or serving size, damages the plate edge, invents garnish, darkens the food, or merely changes lighting without the requested background change. Compare at mobile-card size and full dish-detail size. The owner must approve the three samples before generated photos replace originals.

Only after the quality gate: implement server-side staff authentication, fixed-model routing, input-size validation, bounded requests, quota-error display and explicit approval before saving. The public PWA must contain no provider token. No automatic retries or background generation jobs; these would consume the free allowance unexpectedly. This image pilot does not implement menu-state synchronization.

Sources:
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers-ai/models/flux-2-klein-4b/
- https://developers.cloudflare.com/workers-ai/platform/data-usage/
- https://huggingface.co/black-forest-labs/FLUX.2-klein-4B

## Other deferred work

1. Full AI background generation: assess a locally hosted model, its commercial license, hardware requirements, download size and expected speed before installation. No model has been downloaded or installed. Hardware inspection found Intel UHD 620 graphics; no generation benchmark was performed.
2. Cross-device automatic sync: requires an authenticated always-available backend. Free hosted tiers have quotas; self-hosting requires an operating computer, maintenance and connectivity. Neither meets a literal unlimited, zero-resource-cost promise.
3. Capped free image generation is now accepted subject to quality testing. Automatic cross-device sync remains separate and requires staff authentication, least-privilege access, bounded retries, conflict handling and deletion-safe backups before activation.

## Verification

Run `node tests/image-order-regression.cjs` and `node tests/dish-storage-regression.cjs`.
These cover the disabled cloud call, local image processing, selected surfaces, delivery routing, save completion and storage failures. They do not replace browser offline testing or an end-to-end security audit.
