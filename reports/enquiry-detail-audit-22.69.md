# Enquiry and dish detail finish — v22.69

Main source: 283f1e0; language refinement: f84207f.
Deployment: https://github.com/avi22sh/Hotel-Premier/actions/runs/40689223721

## Changes

- Enquiry estimate shows room, meal plan, duration and arrival in separate rows. Fixed-menu breakfast terms remain elsewhere in the form; room name no longer repeats them. Price calculations, enquiry dispatch and approved policies unchanged.
- MMT and Goibibo buttons keep authentic logos, remove duplicate visible brand names and use separate accessible labels. Equal grid columns prevent overlap on small phones; arrows are omitted only below 360px.
- Dark Bestseller badge uses deep red with warm gold lettering instead of fluorescent pink. Delivery partner brand colours remain unchanged.
- New summary room/plan text supports Hindi and Marathi. Singular/plural capacity wording refined in both languages. Initial capacity placeholder matches the existing concise dynamic note.

## Checks

- 70/70 JavaScript regression suites; targeted enquiry, interface-language, theme-token and CSS structure checks repeated after partner edits. 17/17 source checks passed. Language check and public build repeated after singular/plural correction.
- Live v22.69 mobile QA: room/meal-plan summary separated correctly. Switching to Companion Twin + RO updates name, plan and capacity (up to 2 extra guests); restored Queen + CP.
- Hindi summary displayed translated room name and fixed-menu plan. Singular wording adjustment then passed language tests.
- Partner buttons checked at 375px and 320px. At 320px both were 89.2px wide with no scroll overflow; logos remained within button bounds. Light/dark branding checked at 375px.
- Dark badge computed background gradient rgb(132,37,54) to rgb(94,16,29), text rgb(255,227,168).
- No guest details entered or messages/enquiries sent. Restored English, light mode and normal browser viewport. Physical iPhone/Safari not tested.

Evidence in chat visualization folder: enquiry-summary-dark-22.69.png, partner-buttons-light-22.69.png, dish-badge-dark-22.69.png.
