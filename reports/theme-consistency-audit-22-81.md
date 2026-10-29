# Theme consistency audit — 22.81

Design retained: navy, glossy gold and heritage red; existing brand assets, photography, rates, policies, translations and saved content are unchanged.

Corrected remnants:
- Explore inactive/active filters and best-season/timing panels: semantic surfaces/text, gold selected state; no white panels with pale dark-mode text.
- Menu section item counts: readable muted text and themed chip backgrounds on desktop and mobile.
- Unavailable-photo branding: coordinated navy placeholder with readable gold lettering in either theme; no fabricated replacement images.
- Tariff WhatsApp enquiry: same deeper green as the other messaging actions, with readable white text.
- Dark Settings selected language/appearance: same polished gold treatment.
- Native date/time controls: corrected specificity so group, event and room enquiry pickers use the active theme.
- Admin tab and pressed tag states: shared gold selection treatment; no authentication or data changes.

Validation:
- 70 JavaScript suites and 17 source checks passed for the main theme patch.
- Live 22.81 confirmed all six event/group/room date and time inputs report dark colour scheme in dark mode.
- Final native-control correction passed public build, CSS structure, mobile scale, semantic contrast and interface-language checks.
- Live guest audit covered Home, Stay, Tariff, Menu, Explore, Contact, Review, dish details, room enquiry, guest profile, property gallery and expanded event/group forms. Both themes were reviewed across the affected components; mobile forms were checked at 375px without horizontal overflow.
- DOM contrast sampling excludes image/gradient backgrounds and is not a complete WCAG or physical-device certification. Gradient treatments were visually reviewed.
- Admin lock screen was visually checked. Unlocked CRM/editor screens require the owner to enter the existing PIN; their shared styles were reviewed in source. No PIN bypass was attempted.

Publication: GitHub Pages, with versioned asset URLs. Device-local drafts still require reviewed publishing to reach other devices.
