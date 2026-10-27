# Language and light appearance audit — v22.35

- Shared reviewed UI catalogue: 634 English/Hindi/Marathi rows.
- All 136 visible menu entries have Hindi and Marathi names and descriptions, including approved description fallbacks.
- Guest pages, enquiry guidance, policies, directions, placeholders, image/accessible labels and fixed Admin interface controls use the shared catalogue.
- Canonical menu records, form values, option values, PINs and CRM records are not translated or rewritten.
- Intentional empty eventsBadge remains empty; it is not a missing translation.
- Brands, contact numbers, GST/HSN identifiers and original guest reviews remain unchanged.
- Light-only champagne surfaces and bronze/gold typography; existing dark palette preserved. Large headings use a restrained metallic gradient; smaller prices/names use readable solid bronze. Forced-color fallback provided; no continuous shimmer.

## Verification

65 JavaScript regression suites passed, including first-render menu localization and Admin/private-data round trips. 17 source checks passed before the final accessible-favourite-label addition; both language suites passed again after it. Live Hindi/Marathi menu and dish modal inspected at a 390px browser viewport. Room enquiry date/time fields measured 325px each, ending at their parent boundary (350px). No horizontal page overflow observed.

## Limits

New administrator-authored text needs corresponding Hindi/Marathi copy; unknown custom text remains as authored. OS date/time picker dialogs follow the device/browser language. Prepared operational WhatsApp messages retain their existing English format. The newly opened audit tab was not unlocked for a fresh Admin visual inspection; Admin safety and translations were checked in code tests. Browser viewport checks do not replace testing on a physical iPhone.
