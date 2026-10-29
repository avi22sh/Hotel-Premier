# Admin and CRM theme audit — 22.82

Inspected unlocked on 22.81 in light mode: Customer CRM, Menu & Pricing, Dish Photos, Room Photos & Deals, Page Content, Slides Editor, Table QR Studio, and Backup & Publish. No edits, imports, exports, deletion actions or PIN changes were performed.

Fixes:
- Replaced the hardcoded white menu table background/hover with shared surfaces, avoiding ivory text on white in dark mode.
- Room bed-type labels use readable muted text. Inventory and cover badges have explicit readable foreground/background pairs.
- Photo search now uses a full-width rounded 48px field.
- Photo-removal controls use high-contrast deep red, 32px desktop and 44px mobile sizing.
- Slideshow sub-tabs, backup actions and file chooser buttons now follow the shared theme.
- Mobile Admin navigation no longer creates an extra vertical scrollbar alongside its horizontal tab strip.

Checks: 70 JavaScript suites and 17 source checks passed. Existing mobile Admin body scroll was verified without horizontal overflow at 375px. A final rendered check of the new dark-mode Admin requires the owner to reload the update and unlock again, because closing/reloading ends the local authentication session. No attempt was made to bypass the PIN.

Follow-up: owner switched the existing session to dark mode, but it still held 22.81. The audit tab was refreshed to 22.82, confirmed dark, and reopened through the existing five-tap brand entry. It is now on the local PIN screen; final unlocked dark verification remains pending. No credentials were read or entered.
