# Hotel Premier release 22.74

Published guest refinements:
- Selected-only enquiry estimate: room, plan, guests, nights and chosen arrival; paid/complimentary beds appear only when nonzero. Valid estimates contain no single/double occupancy allocation prose. Capacity errors remain and prevent submission.
- No tariff, inventory, policy, booking-record or WhatsApp submission changes.
- Larger authentic MakeMyTrip and Goibibo logos in readable partner cards. Exact existing official Hotel Premier listing destinations retained; these are external listing links, not live availability APIs.
- Explicit high-contrast Admin/CRM Back styling in light and dark modes; authentication unchanged.
- Recent-search pointer handling preserves focus until activation, completing the Collections layout repair from 22.72.
- Hindi and Marathi equivalents for all added labels and concise wording.

Earlier work completed in this task:
- Navy/gold dark navigation and Explore surfaces, purpose-specific Contact/GPS action colors, coordinated direct-stay benefit card and less repetitive CP terms.
- Collections body-width/scroll restoration and readable drawer sizing.
- Royal restaurant/lobby QR Studio layout and two 100 x 180 mm printable cards. Rendered PDFs were visually checked, QR payloads decoded in software, and link annotations/page dimensions verified. Physical print/phone scan not performed.

Validation:
- 70/70 JavaScript suites and 17/17 source checks passed.
- Live 22.74 tested at 375 x 812; partner cards fit 320 px without horizontal overflow.
- Both themes visually checked for estimate and partner cards. Light Admin header Back visible, 44px tall and functional on locked screen. Unlocked CRM dashboard not re-audited after the session expired; no PIN bypass attempted.
- Live recent search paneer retained the query and produced 41 results. Collections drawer fits mobile.
- Hindi and Marathi summary labels, benefit and partner actions inspected through the live interface. Restored English/light and normal viewport afterward.
- Local edits still require reviewed publishing to reach other devices, as requested. Router/POS/Wi-Fi configuration untouched.
