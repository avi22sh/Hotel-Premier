/* Guest QR and Wi-Fi presentation only. This module never configures a router.
 * No SSIDs, passwords, management addresses or room assignments belong here.
 * Provision the HTTPS service described in GUEST-NETWORK-SETUP.md before activation. */
(() => {
  'use strict';
  const settings = Object.freeze({ apiBase: '' }); // Unconfigured intentionally; no paid service is enabled.
  const state = { rooms: [], loaded: false, generation: 0 };
  const sectionMap = {
    home: 'section-home', sanctuary: 'section-home', reception: 'section-home',
    dine: 'section-dine', dining: 'section-dine', menu: 'section-dine', food: 'section-dine',
    stay: 'section-stay', rooms: 'section-stay', suites: 'section-stay',
    tariffs: 'section-tariffs', tariff: 'section-tariffs', rates: 'section-tariffs',
    celebrate: 'section-celebrate', events: 'section-celebrate', banquets: 'section-celebrate', offers: 'section-celebrate',
    explore: 'section-explore', arrive: 'section-explore', guide: 'section-explore', location: 'section-explore',
    reviews: 'guest-feedback-section', feedback: 'guest-feedback-section',
    contact: 'section-contact', call: 'section-contact', phone: 'section-contact', address: 'section-contact',
    concierge: 'section-concierge'
  };
  const plain = (v, max = 100) => typeof v === 'string' && v.length <= max && !/[\u0000-\u001f<>]/.test(v);
  const roomId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,32}$/.test(value);
  function resolve(location) {
    const url = new URL(location.href);
    const hash = url.hash.slice(1).toLowerCase();
    if (sectionMap[hash]) return sectionMap[hash];
    const entry = url.searchParams.get('entry');
    if (entry === 'reception') return 'section-home';
    if (entry === 'room' || url.searchParams.has('room') || /^room\s+/i.test(url.searchParams.get('src') || '')) return 'section-concierge';
    if (entry === 'restaurant' || entry === 'menu' || ['table', 't', 'category', 'cat'].some(k => url.searchParams.has(k)) || /^table\s+/i.test(url.searchParams.get('src') || '')) return 'section-dine';
    for (const key of ['section', 'page', 'tab']) {
      const section = sectionMap[(url.searchParams.get(key) || '').toLowerCase()];
      if (section) return section;
    }
    return 'section-home';
  }
  function destination(base, type, room, rooms = state.rooms) {
    const url = new URL(base);
    if (url.protocol !== 'https:' || url.username || url.password) throw Error('Use a public HTTPS website address.');
    // Strip all old personal, table and route parameters from printable links.
    url.search = ''; url.hash = '';
    if (type === 'reception') { url.searchParams.set('entry', type); url.hash = 'home'; }
    else if (type === 'restaurant') { url.searchParams.set('entry', type); url.hash = 'dine'; }
    else if (type === 'room' && rooms.some(r => r.id === room && r.verified === true)) {
      url.searchParams.set('entry', type); url.searchParams.set('room', room); url.hash = 'concierge';
    } else throw Error('Choose a verified room from the central room register.');
    return url.href;
  }
  async function request(path) {
    if (!settings.apiBase) throw Error('Guest network setup is awaiting verification.');
    const base = new URL(settings.apiBase);
    if (base.protocol !== 'https:') throw Error('Secure service required.');
    const response = await fetch(new URL(path, base.href.endsWith('/') ? base.href : base.href + '/'), {
      cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer',
      headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000)
    });
    if (!response.ok || !/application\/json/i.test(response.headers.get('content-type') || '')) throw Error('Guest network unavailable.');
    if (!/no-store/i.test(response.headers.get('cache-control') || '')) throw Error('Secure response policy missing.');
    return response.json();
  }
  function validateRooms(data) {
    if (!Array.isArray(data.rooms) || data.rooms.length > 100) throw Error('Invalid room register.');
    const ids = new Set();
    return data.rooms.map(r => {
      if (!roomId(r.id) || !plain(r.label) || !r.label || !plain(r.category) || !r.category || r.verified !== true || ids.has(r.id)) throw Error('Unverified room register.');
      ids.add(r.id);
      return { id: r.id, label: r.label, category: r.category, verified: true };
    });
  }
  function validateAccess(data) {
    if (data.status !== 'active' || !data.verifiedAt || !Number.isFinite(Date.parse(data.verifiedAt)) || !Array.isArray(data.networks) || data.networks.length < 1 || data.networks.length > 2) throw Error('Guest access not verified.');
    return data.networks.map(n => {
      // Only interoperable WPA/WPA2 personal or genuinely open networks; no fake WPA3/captive-portal support.
      if (!plain(n.ssid, 32) || !n.ssid || new TextEncoder().encode(n.ssid).length > 32 || !['WPA', 'nopass'].includes(n.security) || typeof n.hidden !== 'boolean') throw Error('Unsupported guest network.');
      if (n.security === 'WPA' && !(typeof n.password === 'string' && (/^[\x20-\x7e]{8,63}$/.test(n.password) || /^[a-fA-F0-9]{64}$/.test(n.password)))) throw Error('Invalid guest credentials.');
      return { ssid: n.ssid, security: n.security, password: n.security === 'WPA' ? n.password : '', hidden: n.hidden, allowCopy: n.allowCopy === true };
    });
  }
  function wifiPayload(network) {
    const [n] = validateAccess({ status: 'active', verifiedAt: new Date().toISOString(), networks: [network] });
    const escape = v => v.replace(/[\\;,:\"]/g, '\\$&');
    return `WIFI:T:${n.security};S:${escape(n.ssid)};P:${escape(n.password)};H:${n.hidden ? 'true' : 'false'};;`;
  }
  function node(tag, text, cls) {
    const el = document.createElement(tag); if (text) el.textContent = text; if (cls) el.className = cls; return el;
  }
  function renderQR(host, payload) {
    host.replaceChildren();
    if (!window.QRCode) { host.append(node('p', 'QR unavailable. Please use the manual instructions.')); return; }
    // Local rendering only. Never send connection information to an external QR image API.
    new window.QRCode(host, { text: payload, width: 220, height: 220, colorDark: '#111111', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M });
  }
  function closeWifi() {
    state.generation++;
    const dialog = document.getElementById('guest-wifi-dialog');
    if (dialog) { if (dialog.open) dialog.close(); dialog.replaceChildren(); }
  }
  async function showWifi(context, id) {
    let dialog = document.getElementById('guest-wifi-dialog');
    if (!dialog) {
      dialog = node('dialog', '', 'guest-network-dialog'); dialog.id = 'guest-wifi-dialog';
      dialog.setAttribute('aria-labelledby', 'guest-wifi-title'); document.body.append(dialog);
      dialog.addEventListener('close', () => { if (!dialog.open) closeWifi(); });
      dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeWifi(); } });
    }
    const generation = ++state.generation;
    dialog.replaceChildren();
    const close = node('button', 'Close', 'btn-secondary'); close.type = 'button'; close.addEventListener('click', closeWifi);
    const title = node('h2', 'Guest Wi-Fi'); title.id = 'guest-wifi-title';
    const content = node('div', '', 'guest-network-content'); content.setAttribute('aria-live', 'polite');
    dialog.append(close, title, node('p', 'Opening this page does not connect your phone to Wi-Fi. No personal details are needed.'), content);
    dialog.showModal(); content.append(node('p', 'Checking guest access…'));
    try {
      if (!['restaurant', 'room'].includes(context) || (context === 'room' && !state.rooms.some(r => r.id === id))) throw Error('Unverified location.');
      const data = await request(`guest-access?location=${context}${context === 'room' ? '&room=' + encodeURIComponent(id) : ''}`);
      if (generation !== state.generation || !dialog.open) return;
      const networks = validateAccess(data); content.replaceChildren();
      networks.forEach((n, index) => {
        const card = node('section', '', 'guest-network-card');
        card.append(node('h3', index === 0 ? 'Preferred guest network' : 'Fallback guest network'), node('p', n.ssid, 'guest-network-ssid'), node('p', n.security === 'WPA' ? 'WPA / WPA2 Personal' : 'Open network — traffic is not encrypted'));
        const qr = node('div', '', 'guest-network-qr'); qr.setAttribute('role', 'img'); qr.setAttribute('aria-label', 'Wi-Fi connection QR for ' + n.ssid); renderQR(qr, wifiPayload(n)); card.append(qr);
        card.append(node('p', 'On this phone: open Settings → Wi-Fi, select the network above, then enter the password. To scan this QR, use another device.'));
        if (n.security === 'WPA') {
          card.append(node('p', 'Guest password: ' + n.password, 'guest-network-password'));
          if (n.allowCopy) { const copy = node('button', 'Copy password', 'btn-secondary'); copy.type = 'button'; copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(n.password); copy.textContent = 'Password copied'; } catch (_) { copy.textContent = 'Select the displayed password to copy'; } }); card.append(copy); }
        }
        content.append(card);
      });
    } catch (_) {
      if (generation !== state.generation || !dialog.open) return;
      content.replaceChildren(node('p', 'Guest Wi-Fi details are not available here yet. Please ask reception for the verified guest network. Hotel and POS networks are not displayed.', 'guest-network-notice'));
    }
  }
  function currentRoom() {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || (params.get('src') || '').replace(/^room\s+/i, '');
  }
  function renderConcierge() {
    const host = document.getElementById('room-concierge-content'); if (!host) return;
    const room = state.rooms.find(r => r.id === currentRoom()); host.replaceChildren();
    if (!room) { host.append(node('p', 'This room QR has not been verified. Please ask reception for your room’s concierge link. No room or network assignment is assumed.', 'guest-network-notice')); return; }
    host.append(node('h3', room.label), node('p', room.category));
    const wifi = node('button', 'Guest Wi-Fi', 'btn-primary'); wifi.type = 'button'; wifi.addEventListener('click', () => showWifi('room', room.id)); host.append(wifi);
    host.append(node('p', 'Browse the culinary collection for dining, or contact reception for assistance. Requests remain subject to staff confirmation.'));
  }
  async function load() {
    try { state.rooms = validateRooms(await request('rooms')); state.loaded = true; } catch (_) { state.rooms = []; state.loaded = false; }
    renderConcierge();
    window.dispatchEvent(new Event('premier-room-register-updated'));
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) closeWifi(); });
  window.addEventListener('pagehide', closeWifi);
  window.HotelGuestNetwork = Object.freeze({ resolve, destination, validateRooms, validateAccess, wifiPayload, renderQR, showWifi, closeWifi, renderConcierge, load, getRooms: () => state.rooms.map(r => ({ ...r })), configured: () => Boolean(settings.apiBase) });
})();
