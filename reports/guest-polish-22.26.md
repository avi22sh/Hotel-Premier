# Guest UI refinement — 22.26

## Changes
- Shared schedule grid for restaurant celebration and group enquiries: paired tracks above 479px, stacked on narrower phones; 52px native date/time fields with 16px text and theme-aware picker controls.
- Green WhatsApp enquiry actions, clear disabled state and polished champagne-gold action surfaces. Normal text retains solid contrast; partner branding is preserved.
- Menu info symbol reduced to 16px inside an unchanged 44px touch target.
- Review journal introduction, section shortcuts, refreshed feedback composer, source-link cards and responsive review layout. Five-star targets remain at least 44px wide.
- New visible copy translated in Hindi and Marathi.
- Removed four local testimonials whose external source and verification status could not be established. No automatic feed is claimed. Empty state links to the existing Google/MMT/Goibibo listings. Authorized feed integration remains deferred.

## Validation
- 59 JavaScript suites passed, including a new provenance test: empty public feed is handled, arbitrary review badge fields cannot claim verified bookings.
- 17 PowerShell source checks passed on 22.24; later changes were spacing, finish and synchronized cache-version updates.
- Live browser: date/time fields were 52px high, 16px text, equal widths within each form at 375px and 320px. Desktop fields shared a row at 1280px.
- No horizontal document overflow at 320px or 375px; visual viewport scale stayed 1 while date/time fields were focused in this desktop browser.
- Light and dark review layouts inspected; five-star selection updates the verdict. Initial 320px overflow was corrected in 22.25: last star right 268.8px inside card right 288.8px; each target 44px wide.
- Menu info symbols measured 16px inside 44px targets; tapping opened dish details.
- No enquiry, feedback, external share or public review was submitted. No credentials, guest records, router or POS settings changed.

## Limits
Physical iOS/Android keyboard autozoom, installed-PWA behavior and actual pinch gestures require device checks. Intentional browser zoom remains available. Public platform reviews still require an authorized feed; no weekly synchronization is active.
