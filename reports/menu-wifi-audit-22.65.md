# Desktop menu and guided Wi-Fi joining

The desktop menu now keeps Collections, the compact search field and Favorites in one aligned row at wide widths. Intermediate screens use a two-row layout; the existing compact mobile arrangement remains. Collections stays inside the toolbar rather than floating over content. Recent searches remain available while using the toolbar and are hidden after focus leaves it. The obsolete surrounding background band and nested search-field blur were removed.

Verified Wi-Fi cards provide a user-triggered “Copy password & show steps” control and a separate Wi-Fi QR disclosure. Copy success and clipboard failure both show accurate next steps; neither claims a network connection. The browser cannot silently join a Wi-Fi network or reliably launch a cross-platform Wi-Fi Settings shortcut. The guest still joins through the phone’s Settings or its Wi-Fi QR prompt.

Guest-network activation remains disabled. There are no real network credentials in this release, no router/POS changes and no paid service. Actual router verification, isolated guest assignments and the secure configuration service remain prerequisites.

Validation: all 69 JavaScript suites passed after the Wi-Fi behaviour change, including click-only copying and clipboard-failure fallback. All 17 source checks passed at v22.65. Live checks exercised Collections, menu search and Favorites; tablet/mobile layouts showed no page overflow. No real guest-network connection or physical-phone QR join was tested.

Final live v22.65 check: the wide toolbar used three columns with a 420px search field, transparent outer surround and hidden idle history. Opening a recent “paneer” search returned 41 dishes; the field was then cleared. The normal viewport and English light appearance were restored. GitHub Pages deployment succeeded for `05ab283`.
