# Screenshot-led Stay and enquiry repair — 22.27

## Reproduced issues
- On the live dark Stay page, `.room-editorial-desc` computed to `rgb(74,85,104)` on a dark panel. Earlier rules targeted a different class, `.room-suite-desc`.
- `.room-rate-breakdown` computed to `rgb(253,251,247)` while its inherited text was ivory.
- `.hotel-atmosphere-gallery` computed to white while the title and subtitle inherited light dark-mode text.
- The supplied iPhone screenshots showed oversized date/time controls extending outside the form and modal. Desktop browser checks alone had not captured this native WebKit behavior.

## Repairs
- Corrected the base component declarations to use semantic theme tokens, with explicit nested Stay-panel coverage.
- Room rate rows use a consistent grid, stacking at 600px. Prices, labels and plan annotations each have explicit readable colours. Room descriptions are larger with more line spacing.
- Property gallery uses the active theme surface; photos fill their own aspect-ratio boxes.
- Room carousel photos fill the stretched photo panel, including when room text makes a desktop card taller.
- Shared date/time CSS now resets native appearance, specifies physical and logical width/min/max/height constraints and border-box sizing, and constrains WebKit internal date editors. Native date/time input types, pickers, required checks and event handlers remain intact.
- Browser zoom remains available. Inputs keep 16px text to avoid field-focus zoom where supported.

## Verification scope
- 60 JavaScript regression suites passed, including Stay surface inheritance and native-control guardrails.
- All 17 PowerShell source checks passed.
- Deployment succeeded: https://github.com/avi22sh/Hotel-Premier/actions/runs/40458832755 (code commit `9ce671d`). Live stylesheet URL confirmed `theme-tokens.css?v=22.27`; applied the offered PWA refresh.
- Rendered dark-mode description changed from `rgb(74,85,104)` to `rgb(197,202,210)`, and font size from 13.76px to 15.2px. Rate-panel background is now `rgb(32,43,58)` with ivory labels and readable plan text. Gallery surface is now `rgba(24,32,44,.94)`.
- At 1280px the first room photo and photo panel both measured 611.05 × 657.39px, confirming the former lower gap is filled. All six gallery photographs loaded successfully; browser console had no errors.
- At 320px the room date/time fields were 255.2px wide inside 255.2px parents, 52px high, font 16px, appearance none. Viewport scale remained 1.
- At 320px celebration fields were 243.2px wide inside 243.2px parents; group fields were 239.2px inside 239.2px parents. At 390px these measured 313.6px and 309.6px respectively. All were 52px high. Document width did not exceed viewport width.
- Live light/dark layouts inspected. Proof screenshots: `stay-dark-repaired-22.27.png`, `gallery-dark-repaired-22.27.png`, `enquiry-fields-repaired-22.27.png` in this chat's visualization output folder.
- Actual iPhone Safari and installed-PWA picker sizing must be confirmed on a physical device; this environment does not provide iOS WebKit emulation. No claim of completed physical-device verification is made.
- No enquiries were sent, no guest personal data was entered, and no business policies, rates, images or room inventory were replaced.
