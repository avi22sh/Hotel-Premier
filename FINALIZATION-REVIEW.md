# Hotel Premier PWA — finalization review, 22.09

Prepared 26 October 2026. Starting commit: `b154ef4` (22.06). The supplied ZIP's core files matched the starting checkout. Changes are saved in the workspace; this review build has **not been published**.

The code and fixture checks below are not a production certification. The browser could not reach the local preview (`ERR_CONNECTION_TIMED_OUT`), and browser policy blocks direct local-file previews, so actual visual, touch, zoom, installed-PWA and Lighthouse results remain unverified. No scores or device passes have been invented.

## Findings recorded before implementation

Line numbers refer to the original 22.06 files, before edits moved them.

| ID | Severity | Original location | Cause | Implemented correction |
|---|---|---|---|---|
| SEC-01 | P0 | vault.js:26, 486, 868 | Default/plaintext PIN and PIN in email instructions | Removed credentials and disclosure; shared device-local lock |
| SEC-02 | P0 | storage.js:413–448; admin.js:93–110 | Default hash, fallback credentials and alternate unlock paths | First-use PIN setup; salted WebCrypto PBKDF2-SHA-256, 210,000 iterations; no cryptographic fallback |
| SEC-03 | P0 | admin.js:114; vault.js:498 | No consistent throttling or inactivity expiry | Persistent exponential attempt delays, one verification at a time, 15-minute inactivity lock and cleared CRM views |
| SEC-04 | P0 | public-reviews.js:22; CRM templates | Data interpolated as HTML | DOM/textContent review and CRM rendering; literal toast text; validated owner imports |
| IMG-01 | P0 | data/menu-data.js, including former line 5926 | Missing fudge photo, two rice paths, garlic filename case mismatch; fudge also used a soup photo | Existing matching rice assets and branded missing-photo placeholder; exact-case gate |
| IMG-02 | P1 | assets/menu-images; data/menu-photos.js; data/menu-image-sizes.js | Mixed case, spaces and duplicate copies | Lowercase kebab-case paths, byte-verified mapping CSV and used-asset aliases for old local drafts |
| IMG-03 | P1 | index.html and image templates | Missing dimensions and inconsistent failure handling | Dimensions, component ratios, shared branded fallback and below-fold lazy loading |
| STUDIO-01 | P1 | asset-pipeline.js:383, 1670; storage.js:62 | Large PNG/base64 images duplicated in localStorage; expensive foreground work | Shared crop/resize workflow, workers where supported, WebP/Blob persistence, original retention and portable backup |
| ADMIN-01 | P1 | admin.js:98 and editor templates | Blocking prompts, inline colours, desktop tables and unclear publishing state | Themed async dialogs, extracted token-based styles, segmented navigation, mobile table cards and explicit local/publish labels |
| UI-01 | P1 | app.js:4741; royal.css:181 | Zoom disabled, mixed scroll locks and z-index outlier | Accessible viewport; shared fixed-body overlay manager, focus/keyboard handling and layer scale |
| THEME-01 | P1 | styles.css; royal.css | 627 `!important` declarations across the original styles and competing colours | Named cascade layers, extracted inline layer, semantic theme tokens; four reduced-motion exceptions remain |
| PWA-01 | P1 | sw.js:45–105; index.html:1995 | All-or-nothing precache, forced activation/reload and network-forced images | Per-file resilient cache, image strategies, explicit Refresh prompt and offline fallback |
| DEPLOY-01 | P1 | .github/workflows/deploy-pages.yml | Entire repository uploaded to Pages | Explicit public `dist` allowlist, generated 404 and test/build gate |
| QA-01 | P1 | Existing regression fixtures | Several tests assumed older theme/routing behaviour; asset checks ignored filename case | Updated behavioural fixtures and dependency-free case-sensitive image gate |

Additional photo finding during the audit: Vanilla Shake referenced a sabudana photo, and 15 menu image strings still referenced stock-photo URLs. These now use the branded placeholder. No replacement dish photographs were invented.

## Changelog and architectural choices

1. Removed default PINs, legacy bypass hashes and PIN disclosure. Public hotel phone numbers were preserved.
2. Added `local-lock.js`: owner-created 6–64 digit PIN, per-device random salt, PBKDF2-SHA-256 at 210,000 iterations, exponential attempt delays and inactivity expiry. The UI explicitly says this is a local lock, not server authentication or encryption of guest records. No owner PIN was created during testing.
3. Public reviews, CRM records and toast messages use literal DOM/text rendering. Source classes and ratings are bounded. Imported menu/photo records reject executable markup, unsafe image addresses and prototype keys. Existing trusted component templates remain; this is not a framework rewrite.
4. Fixed the missing/misassigned menu references, including fudge, both milkshake options, Hyderabad biryani, Triple Schezwan rice and garlic filename case. Missing photos remain visibly missing.
5. Normalized 558 asset mappings (557 path changes). Every mapping is SHA-256 verified. Removed 92 byte-identical, unreferenced copies, saving 13,414,473 bytes; retained copies remain byte-identical. Git/your original ZIP retain the old paths. Unique original photographs were retained.
6. Added `tools/verify-image-assets.cjs`. Builds fail for missing files, filename case differences or non-normalized menu paths. `data/legacy-photo-paths.js` resolves 211 old paths for currently used public photos, so old device drafts can still find them.
7. Added image dimensions to static and dynamic templates; hero, room, gallery and dish components have defined ratios. The shared error handler removes broken responsive sources and shows the branded placeholder. Existing responsive WebP pairs remain intact. Actual LCP prioritization and rendered crop quality still require browser measurement.
8. Added a shared upload workflow: file/camera/drop input, type/20 MB checks, EXIF-aware decoding, live crop controls, a whole-photo option, max-1600px optimization and WebP/JPEG output. It never generates a substitute dish. Older-browser fallback is bounded and uses asynchronous decoding/encoding.
9. New photo bytes are Blobs in IndexedDB. Small metadata stays in localStorage. Legacy records remain readable and migrate after successful saves; there is no blanket deletion of owner storage. Quota checks provide a backup action. Working URLs and worker resources are released. Dish, room and banner originals support recovery; full backups include room/banner original archives.
10. Added **Export publish bundle**. It contains public overrides and hashed image filenames, excluding guest records, PINs and raw originals. Local images are optimized for publishing when needed. `tools/unpack-publish-bundle.cjs` stages reviewed files in a new folder and refuses to overwrite an existing staging folder. Instructions explain review, commit and deployment. Exporting does not publish.
11. Labelled the studio as local photo enhancement; cloud generation remains disabled. Existing before/after range controls, approval, discard and original recovery remain available. Background treatment and optional colour adjustment are distinct; colour grading stays off for new uploads.
12. Admin tables receive mobile card layouts and field labels; tabs remain horizontally scrollable controls. Browser alert/confirm/prompt calls in the admin/content/menu editors were replaced with literal themed async dialogs/toasts. Static admin inline styles and hardcoded hex colours were removed; form controls use at least 16px text.
13. Removed maximum-scale/user-scalable restrictions and `100vw` uses. Preserved the text-size control. Settings panel sizing now uses the header as its containing block, rather than the small settings trigger.
14. Added a shared counted overlay manager. It fixes the body and restores the exact scroll position, suspends underlying sheets, traps focus, handles Escape and restores focus. Sheet height follows visualViewport and safe areas. Header, floating controls, settings, sheets and notices use one layer scale. Actual iOS keyboard/touch behaviour is not yet device-verified.
15. Kept existing enquiry validation and hotel-local date logic, room/guest limits, extra-bed limits and ages 5–10 child-bed policy. Added shared input styling and mobile grid rules. A new dish may leave its price blank for later editing; no existing price was changed.
16. Kept `applyTheme()` and Light/Dark/Auto preference logic. `styles.css` and `royal.css` use base/inline/priority cascade layers; `theme-tokens.css` is the semantic token authority. Core text, muted, accent, danger and border pairs pass contrast calculations. This does **not** certify every rendered component or text-over-photo combination.
17. Replaced the permanent room-register checking message with a clear unavailable state. Reviews have loading/error/empty and freshness messages. Wi-Fi remains unconfigured, without invented rooms, SSIDs or passwords. No router or POS configuration was touched.
18. Service worker 22.09 precaches each file independently, uses stale-while-revalidate for original photos and cache-first for hashed derivatives, bypasses private/no-store/API requests, and provides an offline fallback. There is no automatic skipWaiting/claim/reload. Guests choose Refresh. Older shells are retained while other windows are open. Added a separate maskable icon with all source content inside its safe circle.
19. Pages workflow now builds/tests and uploads only `dist`. The 404 is generated from index at build time; the duplicate source 404 was removed. Tests, tools, reports, scripts, backups and base64 dumps are excluded. Legacy logo base64 dumps were verified against existing JPEGs and removed; the active brand logo bytes were not altered.
20. Added/updated regression tests for the lock, injection boundaries, asset mappings/case/dimensions, photo workers and Blob backups, publish bundles, overlays, themes and preserved business data. Test fixtures use synthetic records and PINs, never owner credentials or live guest records.

## Continuation: gallery performance and batch-save integrity (22.08)

- Ordinary menu/gallery reads now hydrate only the displayed photo and small metadata. Raw originals, alternate masters and recovery archives load when an individual editor or full backup needs them. The stored originals are unchanged.
- Batch enhancement now waits for a confirmed storage commit before changing the displayed dish photo. Failed saves retain the previous image.
- Added progress counts and Stop batch. Cancellation or session expiry prevents remaining preview results from being saved; already committed photos remain available.
- Repeated clicks cannot start duplicate batches. Late results are skipped if the owner changed or removed an item while its preview ran.
- Photo writes now merge only their changed fields inside the transaction. They cannot restore an outdated price snapshot over a newer price edit. Batch writes also compare a record revision inside the transaction and reject stale previews.
- Per-record revision keys prevent same-millisecond photo updates from sharing an old display URL. Preview URLs are released after successful saves, errors and cancellation.
- Locked sessions cannot redraw the photo gallery after a delayed read. Legacy originals receive the same import safety checks before opening an editor.
- Replaced exaggerated studio claims with a plain explanation of on-device enhancement and the disabled cloud path.
- Added regression coverage for commit-before-display, failure/cancel/lock handling, concurrent price/photo edits and lightweight gallery projection.

## Continuation: asynchronous admin editors (22.09)

- Added view/session generation checks to room, photo-gallery and slide loading. Results from an older tab, detached view or expired session cannot replace the current admin content.
- Added loading/error/retry states for these admin reads. Full backups and the admin gallery now fail clearly if local photo records cannot be read; the public menu can still use its published fallback.
- Delayed slide-editor openings and original-photo restores are discarded when their initiating editor is no longer current.
- Locking Admin Studio also closes room/slide and new-dish editors. Closing an editor cancels pending crop/upload work, and late new-dish previews are released instead of being applied to a different form.
- New dish creation now saves its full item metadata and photo lifecycle in one confirmed record before adding it to the visible menu. Repeated Save clicks are guarded, failed saves retain the draft, and a late successful save does not clear or close a newer draft. Blank prices remain supported.
- New room-photo saves capture their target room and stop before writing if the editor closes while its gallery is loading.
- Replaced the public-build QR studio’s unavailable Markdown checklist link with an inline equipment/rollback checklist. No network settings were changed.
- Added regression tests for stale room/slide reads, session changes, detached views, retry messages, closed uploads, duplicate new-dish saves, saved metadata and draft preservation. Updated the CRM Back-button test to exercise the actual bound class method, including pending-render invalidation.

## Validation and QA matrix

Run `node tools/run-tests.cjs`, then `./tests/run-regression.ps1` for the Windows source checks. Machine-readable results are in `reports/regression-status.json`. The expanded requested device matrix is in `reports/qa-matrix.csv`.

Latest completed runs: **54/54 JavaScript regression suites passed; 17/17 Windows source checks passed.** The raster metadata scan read **964 image files with zero header/metadata errors** (`reports/image-metadata-audit.json`). Metadata readability does not prove that every photo visually matches its dish. The matrix records 840 grouped area/theme/browser/view combinations as NOT RUN, covering the requested width, zoom and text-size ranges.

| Area | Light | Dark | Auto | Evidence / limit |
|---|---|---|---|---|
| Theme selection and device-following logic | PASS | PASS | PASS | Isolated JS fixtures; original applyTheme logic preserved |
| Semantic token contrast | PASS | PASS | PASS | Calculated foreground/surface pairs; not a rendered-page AA audit |
| PIN setup, attempts, expiry, lock UI | PASS | PASS | PASS | WebCrypto and synthetic DOM fixtures; no live owner PIN entered |
| Review/CRM text safety | PASS | PASS | PASS | Hostile-string DOM fixtures |
| Photo paths, bytes and responsive references | PASS | PASS | PASS | Exact-case/filesystem/hash checks; not semantic identification of every dish |
| Photo workers, colour preservation and stale preview guards | PASS | PASS | PASS | Worker/canvas fixtures; not an actual camera/device session |
| Blob saving, original recovery and backup round trip | PASS | PASS | PASS | Isolated IndexedDB transaction fixtures and real Blob serialization |
| Overlay scroll/focus/Escape behaviour | PASS | PASS | PASS | Synthetic DOM; actual iOS/Android keyboard and touch still NOT RUN |
| Enquiry, tariff and group business rules | PASS | PASS | PASS | Logic/source regressions; prices and business data compared with 22.06 |
| Public build, offline strategies and update gating | PASS | PASS | PASS | Build + service-worker fixtures; installed-PWA lifecycle still NOT RUN |
| All guest sections, sheets and admin tabs on real browsers | NOT RUN | NOT RUN | NOT RUN | Local preview unreachable from browser tool |
| 320/360/390/412/768/1024/1440, 100–200% zoom, normal/A+ text | NOT RUN | NOT RUN | NOT RUN | Must be checked in reachable browsers |
| Android Chrome, iOS Safari, desktop Chrome/Edge/Firefox | NOT RUN | NOT RUN | NOT RUN | No physical/device-browser results claimed |
| Installed PWA versus browser tab | NOT RUN | NOT RUN | NOT RUN | Needs actual installation and offline/update checks |

Lighthouse mobile targets remain **unmeasured**: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥95 and installability. Source checks and token calculations cannot establish these scores.

## Deployment boundary

Publishing was corrected on 26 October 2026: GitHub Pages changed from legacy main/root to the public-only GitHub Actions build. An obsolete waiting deployment from 6 October was cancelled to release the queue. The public site now serves the refined mobile build. The initial Linux deployment caught 29 case-only Git asset paths that Windows had not recorded; these were corrected and the asset gate now verifies the Git index as well as the filesystem. Source regression checks run in the GitHub deployment before any public artifact is uploaded. See the mobile delivery notes below for browser verification and remaining limits.

## Owner decisions and missing photographs

- Cloudflare AI pilot: keep disabled, or explicitly approve a separately reviewed free-tier pilot. Nothing paid was enabled.
- Real server-side authentication/private CRM: decide whether to add it; the current local PIN is not a server security boundary.
- Supply/confirm the photographs listed in `reports/photos-needed.json` (20 menu records, including grouped options). Hot Chocolate Fudge, Vanilla Shake and Chocolate Shake specifically need their own matching photographs. The report also lists the dessert, mocktail, mastani, milkshake, juice, buttermilk, jaljeera and fresh-lime slots still awaiting photos.

Google/MMT/Goibibo review authorization and the five-router details remain deferred as previously requested. No feed authorization, weekly review updater, router changes, paid AI service or new external account was activated.


## Mobile delivery correction — 22.10

Live mobile inspection at 390 × 844 confirmed that the public site remained on 22.06. The restaurant search/history panel and hero consumed much of the first screen, grouped dish photos were small, and the floating Menu control covered cards. GitHub Pages was still configured for legacy main/root publishing.

The mobile layout now uses a shorter restaurant introduction, a compact sticky search panel with Collections and favourites, larger square dish photographs, full-width horizontally scrollable subsection choices without a visible scrollbar, clear ivory/gold dark text, and semantic light-mode surfaces. The collection button remains the existing accessible drawer trigger and sits inside the sticky controls rather than covering food. Recent searches appear while interacting with search. Room counts, policies, dish names and prices were retained.

The 54 source regression suites passed after these changes. Live browser checks below must be recorded after successful deployment; source tests alone do not establish a working mobile rendering. Older 22.09 ZIP files are previous local review snapshots, not this mobile release.


### Live mobile follow-up — 22.13

Browser verification of the published 22.10–22.12 builds exposed issues that source checks had missed: image intrinsic height overrode the photo box, dark dish and collection panels retained hardcoded light surfaces, and the sticky search covered Settings. These were corrected with explicit image sizing, semantic detail/drawer colours, a header stacking boundary, and a constrained dish-view flex layout. The photo and Swiggy/Zomato actions stay outside the internal detail scroller; options remain in two columns. Version-stamped scripts/styles/service worker now use 22.13. Preserve existing guest/admin device data when updating; use the in-app Refresh offer rather than clearing browser storage.

These are live browser checks, not physical iOS/Android or installed-PWA certification. The comprehensive device/zoom/Lighthouse matrix remains incomplete.


### Final published mobile verification — 22.14

Published commit: `1fa18c7`; successful GitHub Pages run: https://github.com/avi22sh/Hotel-Premier/actions/runs/40279033548 . The browser loaded `theme-tokens.css?v=22.14`. The main stylesheet now parses as three top-level CSS rules (layer order, complete base layer, complete priority layer); a stray orphan declaration/closing brace had previously ended the base layer early and caused subsequent priority rules to be discarded. A new CSS structure regression prevents recurrence.

Verified in the live in-app browser: light menu and light dish details at 390px; dark dish details at 320px with both ordering links on the same row, 44px tall; dark menu at 320px including enlarged text without document overflow; dark collection drawer with 21 collections plus All Items; Morning Delights selection yields 7 cards; variant selection changes title, photo and price; dark Stay, Tariff and enquiry at 412px without document overflow. Settings was restored to Auto and normal text size after testing. Screenshots were saved in the task visualization folder. Machine-readable measurements are in `reports/live-mobile-qa-22.14.json`.

Validation: 55/55 JavaScript suites, including CSS structure and Git-index casing, passed locally and in the successful deployment. All 17 PowerShell source checks passed. This does not certify physical-device touch/keyboard behavior, installed-PWA lifecycle, every zoom combination or Lighthouse targets; those remain unverified.


## Dish options, enquiry layout and language repair — 22.17 (27 October 2026)

Published code commit: `e24f17a`. Successful Pages deployment: https://github.com/avi22sh/Hotel-Premier/actions/runs/40388610523 .

- Confirmed the original 320px collision: an 87px bilingual dish title overflowed a 46px flex-shrunk header. Detail children now retain intrinsic height, headings wrap, narrow layouts place the price beneath the title, and the complete detail body scrolls below the pinned photograph. The options panel no longer covers the name/subtitle.
- Mobile enquiry grids use full-width single-column fields. A live follow-up caught legacy `justify-content:flex-end` compressing number-input grid tracks; explicit full-width tracks and stretch alignment corrected Nights/Rooms/Guests as well as date/time. At 320px all five fields measure 255.2px wide with the same x position; at 390px they measure 325.6px, each 48px tall.
- New `data/guest-localization.js` supplements the existing language catalogue, sets the document language, updates dynamic text/accessible labels and remembers original English text for language round trips. It does not rewrite guest field values, private Admin/CRM content or original public guest reviews. Select options without explicit values retain their original submitted value when their label is translated. Admin-only mutations do not trigger guest translation scans.
- Added 80 Hindi/Marathi description pairs covering every remaining guest-visible dish. Together with existing descriptions all 136 current public entries have both languages. All 21 category names and summaries are in Devanagari. Menu titles, Settings, dish-detail controls, enquiry labels/help/policies, room capacity and estimate messages now follow the selected language. Marathi no longer silently falls back to Hindi. Original English menu/hotel data, prices, policies, room limits and photography are unchanged.
- Checked Hindi dish details in light mode at 320px, Marathi details in dark mode at 320px, Marathi arrival/counter fields at 320px and 390px, and Marathi-to-English return. An enquiry-only synthetic arrival of 28 October at 14:35 and selected Royale room survived a language round trip; no enquiry or WhatsApp message was submitted. Normal text size, English and Auto appearance were restored afterwards. No final browser console errors.
- Validation: 56/56 JavaScript regression suites passed, including guest-language round trips, form/option preservation, current public description coverage and layout safeguards. All 17 PowerShell source checks passed. The successful GitHub deployment ran the JavaScript suites before publishing.

Evidence: `reports/language-audit-22.17.json` and `reports/live-language-layout-qa-22.17.json`; visual proofs are saved in the task visualization folder. Some legacy long-form property paragraphs outside the translation catalogue still retain English, as does new owner-authored content without a supplied translation. These results do not certify physical iOS/Android keyboards, every zoom combination or Lighthouse scores.


## Flexible group enquiries, guest number controls and Home sharing — 22.23

Published code commit: `3efcc28`. Successful deployment: https://github.com/avi22sh/Hotel-Premier/actions/runs/40409546245 . Browser evidence: `reports/group-form-home-qa-22.23.json`.

The group estimator now defaults to an editable custom allocation: 0–2 Royale King, 0–4 Signature Queen and 0–8 Companion Twin, within the existing 2–12 group-room range and 36-guest ceiling. Existing presets remain optional shortcuts. Each chosen category is priced independently from its published double-occupancy RO/CP tariff; nights, paid beds and complimentary child beds update the estimate and capacity together. Group arrival date and IST time are included in enquiries. Invalid allocations cannot reuse a previous valid quote, and sending recalculates/validates the current draft. Source property inventory (14), room rates, direct benefit, bed charges and child-bed policy were preserved.

`guest-forms.js` supplies accessible 44px/48px minus/number/plus controls for room, group and restaurant forms. Manual input is retained while incomplete or outside a limit, errors are shown alongside the field and invalid drafts cannot be sent. Valid corrections immediately restore the restaurant enquiry action; quantity controls inside ancestor labels use concise accessible names. Mobile forms use full-width tracks and 16px inputs. Browser zoom remains accessible; the enquiry no longer rewrites the viewport on opening.

For mobile startup, menu cards are visible by default instead of waiting for an IntersectionObserver callback, initial routing settles without smooth scrolling, and pageshow synchronizes overlay locks. Clipping sideways overflow avoids creating a nested body scroll container, allowing the header to stay in place. Overlay release temporarily bypasses global smooth scrolling before restoring the saved position. A live scrolled enquiry returned immediately to exactly 3048px.

Home now has one Restaurant Menu quick card, without the extra large restaurant banner or old share button beneath the highlights. A 44px share control sits beside Settings, with champagne contrast in both themes and a header name that fits at 320px. It shares the canonical public hotel link using the device share sheet; unsupported/failing sharing falls back to copying or a selectable-link dialog. Cancellation does not launch another app or copy anything. Native sharing was covered with mock regression tests, without sending a real share or overwriting the test browser clipboard.

Live checks: custom mix and changing presets, manual empty/over-limit correction, booking counters, restaurant 40-guest boundary, header fit, both themes, Hindi value retention, fresh reload without a page tap, exact modal scroll restoration and no horizontal document overflow at 320/390px. A custom 1 King + 1 Queen + 1 Twin, two-night CP request with 1 paid and 1 complimentary child bed for 8 guests showed ₹17,800. Two Queen rooms for 3 guests CP showed ₹4,800 after the existing direct benefit. No room/event enquiry was submitted. English and Auto appearance were restored; final console errors: none.

Validation: 58/58 JavaScript suites passed locally and in deployment, including new custom-allocation/price tests, native-share cancellation/canonical-link tests, strict number-boundary tests and instant-scroll-restoration regression. All 17 PowerShell source checks passed. Physical Android/iOS focus/keyboard behaviour, installed-PWA lifecycle, full zoom combinations and Lighthouse remain unverified; the physical-phone freeze report was not independently reproduced, and no universal device-resolution claim is made.
