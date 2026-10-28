# Hotel Premier — safe five-router rollout (phase 1)

## Current facts and activation status

The owner confirms five LAN-wired routers, five different SSIDs, and working cross-area restaurant mobile POS connectivity. Router models, roles, actual room numbers, guest-network capability and isolation are **not yet verified**. No router was accessed or changed by this release. No guest SSID, credential or room mapping is invented. `HOTEL PREMIER GUEST` is a proposed identity only.

PWA implementation: default/reception → Home; restaurant → Culinary Collection with Guest Wi-Fi; verified room → concierge. Unknown room links fail closed. QR Studio uses only the verified central room register, not the old sample room list. Wi-Fi stays inactive until a secure service and verified network configuration exist. This is not a completed network rollout or a deployed credential backend.

## Private equipment survey — complete outside the public repository

Keep the completed inventory, backups and IP addresses in a private administrator-controlled location. Do not commit them or upload them through the browser-local menu editor.

| Router identifier (five required) | Model / firmware | Router/AP mode | Existing SSIDs | LAN IP / subnet | DHCP server or disabled | Wired uplink / switch / port | Restaurant / actual room coverage | Existing guest SSID / isolation capability in this mode |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |

Also record the gateway, network diagram, router management access restrictions, configuration-backup location, POS terminals/mobile devices/printers/billing/reception systems, their wired/SSID connections, required ports/protocols, discovery/broadcast requirements, and actual room numbers/categories with measured preferred/fallback coverage. Obtain model documentation before deciding whether guest isolation works in AP mode and across wired uplinks.

## Guest network design decision (not authorization to implement)

If all appropriate access points can carry a separately isolated guest network end-to-end, propose a common guest identity with matching security/credentials and guest-only internet access. Enforce separation at the gateway/firewall and across wired paths; client isolation alone may not block wired internal devices. Deny guest access to POS, billing, reception, router management and internal hotel devices. Preserve the operations network unchanged.

If isolation cannot be enforced safely with these devices/current operating modes, retain the current arrangement. Do not publish operations-network credentials as a workaround. Recommend an appropriately configured guest VLAN/firewall and VLAN-capable APs/switches or a separately routed guest infrastructure after surveying equipment. No purchase, paid plan or network change is authorized by this document. A common SSID does not guarantee seamless roaming.

## Central secure service contract — required before activation

`guest-network.js` has one deliberately empty `settings.apiBase`. Configure it only after the backend and equipment have been reviewed. Use an HTTPS directory URL for a dedicated guest-access API. There is no credential in public source, QR destination URLs, localStorage, IndexedDB or service-worker cache.

Implement one server-side configuration store for router references, guest networks, restaurant assignment, actual rooms/categories, preferred/fallback assignments and verification/approval records. Keep router administrator credentials out of this system entirely. Management IPs/topology must not be returned to guest endpoints. The public Pages host cannot securely store secrets or authenticate administrator edits; the existing local Admin PIN is not server authorization.

Required guest endpoints (public guest access, no personal registration):

- `GET rooms`: `{ "rooms": [] }`, populated only with verified `{id,label,category,verified:true}` records. Public room labels reveal no occupants, occupancy, reservation data or private network details.
- `GET guest-access?location=restaurant`, or `?location=room&room=<verified-id>`: `{status:"active",verifiedAt:"<ISO date>",networks:[{ssid,security:"WPA",password,hidden:false,allowCopy:true}]}`. Maximum two networks, preferred first. `nopass` is only for genuinely open networks; WPA3-only, enterprise and captive portals require a separate reviewed flow.
- Unknown/unapproved locations return 404/403, not a default operations SSID. Server must gate publication on a current approved mapping, internet/coverage/POS/isolation verification and explicit activation. Never trust client `verified:true` as network proof.
- All responses, errors and OPTIONS: `Cache-Control: no-store`, JSON content type, exact permitted PWA origin (no wildcard credentials), HTTPS, no credential-bearing redirects, no sensitive request/response logging, rate limiting and response size limits. Do not put passwords in URLs, analytics or third-party QR APIs. An anonymously accessible guest endpoint necessarily makes shared guest credentials available to anyone with its link; use hotel-approved guest-only access/rotation rather than treating QR possession as strong authentication.

Required private administration: authenticated server-side CRUD for the single configuration store (networks, router identifiers, room mappings, restaurant mapping, credential rotation, approval/audit history). Use an existing verified identity provider with server-validated identity and administrator allowlist, CSRF protection for cookie sessions, least privilege, encrypted secret storage and audit logging without passwords. Never use the public local Admin PIN, a browser-stored bearer secret or CORS alone as authentication. Credential updates must invalidate any server caches. No backend or free-tier claim is made before choosing/approving its deployment and limits.

Before activation, self-host/review the QR library and review third-party scripts on credential-bearing views. Rendering itself must stay entirely on-device. Add bounded request/response sizes server-side. The frontend already requires HTTPS and no-store responses, omits cookies, times out, validates display fields, clears displayed credentials on close/background, and does not cache responses. It does not prove backend security or network isolation.

## Separate QR functions

### Five-area PWA provision

Settings now has a discreet Guest Wi-Fi action, without a Home/Menu banner. The central frontend area catalogue contains only `lobby`, `restaurant`, `floor-1`, `floor-2`, and `floor-3` plus public display labels. It contains no SSIDs, credentials, IP addresses or claimed coverage. The owner has reported locations for five wired routers; equipment capabilities, guest isolation, exact floor SSIDs and room assignments remain unverified. Keep the actual survey and reported network identities outside the public repository.

The secure service contract additionally supports `GET guest-access?location=lobby`, `?location=floor-1`, `?location=floor-2`, and `?location=floor-3`, with the same approval, no-store and response validation requirements as restaurant access. A floor is a manually selected coverage area, not an automatic network scan or a verified room assignment. Unknown area codes are rejected. Room access still requires the verified room register. Pending/unconfigured areas never fall back to operations credentials.

Opening Wi-Fi from a room QR retains that room context; the Menu defaults to Restaurant, and other pages default to Lobby. Guests can choose another public area manually. The UI clears the prior response as soon as an area changes and ignores stale replies after selection changes or dialog closure. Network names and credential strings are excluded from language rewriting. Admin QR Studio lists the same five areas as awaiting verification; this checklist cannot activate a network or authorize router changes.

Activation remains pending. There is no backend deployment, paid service, router access, SSID merge or Wi-Fi auto-connect in this change. Printed website and Wi-Fi connection QR codes remain separate functions.

Verified network cards provide a one-tap **Copy password & show steps** action when the service permits copying. It copies only after a guest click and explains the remaining Settings → Wi-Fi → select network → Join steps. Clipboard failure reveals manual-entry instructions instead. The separate **Show Wi-Fi connection QR** disclosure is for scanning with another device and confirming the operating system's Join prompt. Neither control can join a network directly from a browser. Unsupported Wi-Fi URL schemes and Settings deep links are not used. No connection control or QR is offered for an unconfigured/unverified network.

Reception: `?entry=reception#home`. Restaurant: `?entry=restaurant#dine`. Room: `?entry=room&room=<verified-id>#concierge`. These website QR codes contain no Wi-Fi secrets. Changing guest credentials must not require reprinting these cards.

The separate Wi-Fi QR is generated on-device from verified guest connection information. Opening the website cannot automatically connect a phone. Manual Settings → Wi-Fi instructions are always available because the guest may be viewing the QR on the same phone. A separate printed Wi-Fi card must be generated from the secured system only after activation; treat the printed credential as intentionally shared guest information. Do not advertise “Guest Wi-Fi Available” on cards before network activation.

## Approved cutover and rollback checklist

1. Record all existing settings and back up each device where supported. Keep backups private.
2. Document and baseline real POS ordering, kitchen/printer, billing and reception workflows and required protocols.
3. Prepare a per-device rollback procedure, backup restoration method, owner/operator and maintenance window. Obtain explicit administrator approval.
4. Test only a noncritical network/AP first. Never reset the operations network.
5. Verify internet access and real POS workflows across all operating areas, not just ping.
6. Verify guests cannot reach POS, billing, reception, wired/internal devices or administration interfaces. Test across APs and uplinks; ping alone is insufficient.
7. Measure restaurant and every room’s coverage, preferred/fallback network, reconnect behaviour and Android/iPhone compatibility. Do not advertise seamless roaming without testing.
8. Obtain sign-off; expand incrementally with rollback on any POS regression. Activate only approved mappings.
9. Scan printed reception/restaurant/each-room QR with Android and iPhone, check correct destination, direct Wi-Fi QR, manual connection, credential rotation, offline/error behaviour and no personal-data requirement.

## Remaining work

Secure backend selection/implementation/authorization, private equipment survey, actual room register, capability validation, network configuration proposal and explicit approval, physical network testing, server admin CRUD, self-hosted QR dependency and final printed-card scan testing remain prerequisites. The PWA-side scaffold is intentionally useful but inactive until these are completed.
