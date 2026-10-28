/* Guest QR and Wi-Fi presentation only. This module never configures a router.
 * No SSIDs, passwords, management addresses or room assignments belong here.
 * Provision the HTTPS service described in GUEST-NETWORK-SETUP.md before activation. */
(() => {
  'use strict';
  const settings = Object.freeze({ apiBase: '' }); // Unconfigured intentionally; no paid service is enabled.
  const state = { rooms: [], loaded: false, generation: 0 };
  // Public area labels only. Network identities and approved assignments stay on the service.
  const areas = Object.freeze([
    { id: 'lobby', label: 'Lobby / reception' },
    { id: 'restaurant', label: 'Pride Restaurant' },
    { id: 'floor-1', label: 'First floor' },
    { id: 'floor-2', label: 'Second floor' },
    { id: 'floor-3', label: 'Third floor' }
  ]);
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
    const entry = (url.searchParams.get('entry') || '').toLowerCase();
    if (entry === 'reception' || entry === 'home') return 'section-home';
    if (entry === 'room' || url.searchParams.has('room') || /^room\s+/i.test(url.searchParams.get('src') || '')) return 'section-concierge';
    if (entry === 'restaurant' || entry === 'menu' || entry === 'dine' || ['dish', 'table', 't', 'category', 'cat'].some(k => url.searchParams.has(k)) || /^table\s+/i.test(url.searchParams.get('src') || '')) return 'section-dine';
    for (const key of ['section', 'page', 'tab']) {
      const section = sectionMap[(url.searchParams.get(key) || '').toLowerCase()];
      if (section) return section;
    }
    return 'section-home';
  }
  function destination(base, type, room, rooms = state.rooms) {
    const url = new URL(base);
    if (url.protocol !== 'https:' || url.username || url.password) throw Error('Use a secure HTTPS website address.');
    // Strip all old personal, table and route parameters from printable links.
    url.search = ''; url.hash = '';
    if (type === 'reception' || type === 'home') {
      url.searchParams.set('entry', 'home');
      url.hash = 'home';
    } else if (type === 'restaurant') {
      url.searchParams.set('entry', 'restaurant');
      url.hash = 'menu';
    } else if (type === 'room') {
      if (!roomId(room) || !rooms.some(record => record.id === room && record.verified === true)) throw Error('Choose a verified room before creating its QR.');
      url.searchParams.set('entry', 'room');
      url.searchParams.set('room', room);
      url.hash = 'concierge';
    } else {
      url.searchParams.set('entry', 'home');
      url.hash = 'home';
    }
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
  function accessPath(context, id, rooms = state.rooms) {
    if (context === 'room') {
      if (!roomId(id) || !rooms.some(room => room.id === id && room.verified === true)) throw Error('Unverified location.');
      return 'guest-access?location=room&room=' + encodeURIComponent(id);
    }
    if (!areas.some(area => area.id === context)) throw Error('Unverified location.');
    return 'guest-access?location=' + context;
  }
  function openWifi() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('room') || params.get('entry') === 'room' || /^room\s+/i.test(params.get('src') || '')) return showWifi('room', currentRoom());
    return showWifi(window.app?.activeSection === 'section-dine' ? 'restaurant' : 'lobby');
  }
  async function showWifi(context = 'lobby', id) {
    let dialog = document.getElementById('guest-wifi-dialog');
    if (!dialog) {
      dialog = node('dialog', '', 'guest-network-dialog'); dialog.id = 'guest-wifi-dialog';
      dialog.setAttribute('aria-labelledby', 'guest-wifi-title'); document.body.append(dialog);
      dialog.addEventListener('close', () => { if (!dialog.open) closeWifi(); });
      dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeWifi(); } });
    }
    dialog.replaceChildren();
    const close = node('button', 'Close', 'btn-secondary'); close.type = 'button'; close.addEventListener('click', closeWifi);
    const title = node('h2', 'Guest Wi-Fi'); title.id = 'guest-wifi-title';
    const areaLabel = node('label', 'Choose your area', 'guest-network-area');
    const areaSelect = node('select'); areaSelect.id = 'guest-wifi-area'; areaLabel.htmlFor = areaSelect.id;
    const available = areas.map(area => ({ ...area }));
    if (state.rooms.some(room => room.id === id && room.verified === true)) available.push({ id: 'room', label: 'Your room' });
    if (!available.some(area => area.id === context)) {
      const blank = node('option', 'Choose your area'); blank.value = ''; blank.disabled = true; areaSelect.append(blank);
    }
    available.forEach(area => { const option = node('option', area.label); option.value = area.id; areaSelect.append(option); });
    areaSelect.value = available.some(area => area.id === context) ? context : '';
    areaLabel.append(areaSelect);
    const content = node('div', '', 'guest-network-content'); content.setAttribute('aria-live', 'polite');
    dialog.append(close, title, node('p', 'Opening this page does not connect your phone to Wi-Fi. No personal details are needed.'), areaLabel, content);
    dialog.showModal();
    const refresh = () => loadArea(areaSelect.value);
    areaSelect.addEventListener('change', refresh);
    async function loadArea(selected) {
      const generation = ++state.generation;
      content.replaceChildren(node('p', 'Checking guest access…'));
      try {
        const data = await request(accessPath(selected, id));
        if (generation !== state.generation || !dialog.open) return;
        const networks = validateAccess(data); content.replaceChildren();
        networks.forEach((n, index) => {
          const card = node('section', '', 'guest-network-card');
          card.append(node('h3', index === 0 ? 'Preferred guest network' : 'Fallback guest network'), node('p', n.ssid, 'guest-network-ssid'), node('p', n.security === 'WPA' ? 'WPA / WPA2 Personal' : 'Open network — traffic is not encrypted'));
          const qrDetails = node('details', '', 'guest-network-connect-qr');
          qrDetails.append(node('summary', 'Show Wi-Fi connection QR'));
          const qr = node('div', '', 'guest-network-qr'); qr.setAttribute('role', 'img'); qr.setAttribute('aria-label', 'Wi-Fi connection QR for ' + n.ssid); renderQR(qr, wifiPayload(n));
          qrDetails.append(qr, node('p', 'Scan with another phone’s camera and confirm Join. Opening the PWA does not connect a phone to Wi-Fi.')); card.append(qrDetails);
          const steps = node('ol', '', 'guest-network-join-steps');
          steps.append(node('li', 'Open your phone’s Settings → Wi-Fi.'));
          const networkStep = node('li'); networkStep.append(node('span', 'Select this network: '), node('strong', n.ssid, 'guest-network-ssid')); steps.append(networkStep);
          const finish = node('li', 'Enter the displayed password and confirm Join.'); steps.append(finish);
          if (n.security === 'WPA') {
            const password = node('p', '', 'guest-network-password');
            password.append(node('span', 'Guest password: '), node('code', n.password, 'guest-network-secret')); card.append(password);
            if (n.allowCopy) {
              steps.hidden = true;
              const feedback = node('p', '', 'guest-network-join-feedback'); feedback.setAttribute('role', 'status');
              const copy = node('button', 'Copy password & show steps', 'guest-network-join-btn'); copy.type = 'button';
              copy.addEventListener('click', async () => {
                if (generation !== state.generation || !dialog.open) return;
                copy.disabled = true;
                try {
                  await navigator.clipboard.writeText(n.password);
                  if (generation !== state.generation || !dialog.open) return;
                  feedback.textContent = 'Password copied. Finish joining in your phone’s Wi-Fi settings.';
                  finish.textContent = 'Paste the copied password and confirm Join.';
                } catch (_) {
                  if (generation !== state.generation || !dialog.open) return;
                  feedback.textContent = 'Copy is unavailable. Enter the displayed password in Wi-Fi settings.';
                  finish.textContent = 'Enter the displayed password and confirm Join.';
                } finally { copy.disabled = false; }
                steps.hidden = false;
              });
              card.append(copy, feedback);
            }
          } else {
            finish.textContent = 'Confirm Join on your phone.';
          }
          card.append(steps);
          content.append(card);
        });
      } catch (_) {
        if (generation !== state.generation || !dialog.open) return;
        content.replaceChildren(node('p', 'Guest Wi-Fi details are not available here yet. Please ask reception for the verified guest network. Hotel and POS networks are not displayed.', 'guest-network-notice'));
      }
    }
    await refresh();
  }
  function currentRoom() {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || (params.get('src') || '').replace(/^room\s+/i, '');
  }
  function renderConcierge() {
    const host = document.getElementById('room-concierge-content'); if (!host) return;
    const room = state.rooms.find(r => r.id === currentRoom()); host.replaceChildren();
    if (!room) { host.append(node('p', settings.apiBase ? 'This room QR has not been verified. Please ask reception for your room’s concierge link. No room or network assignment is assumed.' : 'Room concierge and Guest Wi-Fi are not available here yet. Please contact reception for assistance.', 'guest-network-notice')); return; }
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
  window.HotelGuestNetwork = Object.freeze({ resolve, destination, validateRooms, validateAccess, wifiPayload, renderQR, showWifi, openWifi, closeWifi, accessPath, renderConcierge, load, getAreas: () => areas.map(area => ({ ...area })), getRooms: () => state.rooms.map(r => ({ ...r })), configured: () => Boolean(settings.apiBase) });
})();
