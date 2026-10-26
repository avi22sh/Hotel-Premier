/* Device-local convenience lock. This is not server authentication or encryption
 * of CRM records. Anyone controlling this browser can access its local storage. */
(() => {
  'use strict';
  const PIN_KEY = 'hp_local_lock_v1';
  const ATTEMPTS_KEY = 'hp_local_lock_attempts_v1';
  const ITERATIONS = 210000;
  const IDLE_MS = 15 * 60 * 1000;
  const listeners = new Set();
  let unlocked = false, lastActivity = 0, timer = null, busy = false;
  const cryptoAPI = () => {
    if (!window.crypto?.subtle || !window.crypto?.getRandomValues) throw Error('A secure HTTPS connection and WebCrypto are required for the local lock. No weaker fallback is used.');
    return window.crypto;
  };
  const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  const unhex = value => new Uint8Array(value.match(/../g).map(s => parseInt(s, 16)));
  function record() {
    const raw = localStorage.getItem(PIN_KEY);
    if (!raw) return null;
    let value;
    try { value = JSON.parse(raw); } catch { throw Error('The local lock record is damaged. Contact your device administrator; saved hotel data has not been changed.'); }
    if (value?.version !== 1 || value.algorithm !== 'PBKDF2-SHA-256' || !Number.isInteger(value.iterations) || value.iterations < ITERATIONS || value.iterations > 1000000 || !/^[a-f0-9]{32}$/.test(value.salt) || !/^[a-f0-9]{64}$/.test(value.hash)) throw Error('The local lock record is invalid. Saved hotel data has not been changed.');
    return value;
  }
  function attempts() {
    try {
      const v = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '{}');
      return { failures: Number.isInteger(v.failures) && v.failures > 0 ? Math.min(v.failures, 100) : 0, lockedUntil: Number.isFinite(v.lockedUntil) ? v.lockedUntil : 0 };
    } catch { throw Error('The local attempt counter cannot be read. Unlock is unavailable until device storage is working.'); }
  }
  function lock(reason = 'Admin Studio is locked on this device.') {
    const wasUnlocked = unlocked;
    unlocked = false;
    clearTimeout(timer);
    if (wasUnlocked) for (const listener of listeners) { try { listener(reason); } catch (error) { console.warn('Local lock UI update failed:', error); } }
  }
  function isUnlocked() {
    if (unlocked && Date.now() - lastActivity >= IDLE_MS) lock('Locked after 15 minutes of inactivity. Enter your local PIN again.');
    return unlocked;
  }
  function touch() {
    if (!isUnlocked()) return;
    lastActivity = Date.now();
    clearTimeout(timer);
    timer = setTimeout(() => isUnlocked(), IDLE_MS + 10);
  }
  function unlock() { unlocked = true; lastActivity = Date.now(); touch(); }
  function status() {
    const pin = record(), a = attempts();
    return { configured: Boolean(pin), unlocked: isUnlocked(), retryAfterMs: Math.max(0, a.lockedUntil - Date.now()), iterations: pin?.iterations || ITERATIONS };
  }
  async function derive(pin, salt, iterations) {
    const api = cryptoAPI();
    const key = await api.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
    return new Uint8Array(await api.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256));
  }
  async function exclusive(action) {
    if (busy) throw Error('A local PIN operation is already running. Please wait.');
    busy = true;
    try { return await action(); } finally { busy = false; }
  }
  async function setPin(value) {
    return exclusive(async () => {
      const pin = String(value || '');
      if (!/^\d{6,64}$/.test(pin)) throw Error('Choose a PIN containing 6 to 64 digits.');
      if (record() && !isUnlocked()) throw Error('Unlock this device before changing its local PIN.');
      const salt = cryptoAPI().getRandomValues(new Uint8Array(16));
      const hash = await derive(pin, salt, ITERATIONS);
      const next = { version: 1, algorithm: 'PBKDF2-SHA-256', iterations: ITERATIONS, salt: hex(salt), hash: hex(hash) };
      // Storage errors must not produce a false unlock or erase the old lock.
      const encoded = JSON.stringify(next);
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ failures: 0, lockedUntil: 0 }));
      localStorage.setItem(PIN_KEY, encoded);
      if (localStorage.getItem(PIN_KEY) !== encoded) throw Error('The local PIN could not be saved. Check browser storage and retry.');
      // Retire only obsolete credential keys, never guest records or photos.
      localStorage.removeItem('hp_vault_master_pin');
      localStorage.removeItem('hp_admin_pin_hash');
      unlock();
      return true;
    });
  }
  async function verify(value) {
    return exclusive(async () => {
      const pin = record();
      if (!pin) throw Error('Create a local PIN on this device first.');
      const a = attempts();
      if (a.lockedUntil > Date.now()) throw Error(`Too many attempts. Try again in ${Math.ceil((a.lockedUntil - Date.now()) / 1000)} seconds.`);
      const input = String(value || '');
      let difference = 1;
      if (/^\d{6,64}$/.test(input)) {
        const hash = await derive(input, unhex(pin.salt), pin.iterations), expected = unhex(pin.hash);
        difference = 0;
        for (let i = 0; i < expected.length; i++) difference |= hash[i] ^ expected[i];
      }
      if (difference === 0) {
        localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ failures: 0, lockedUntil: 0 }));
        unlock();
        return true;
      }
      const failures = a.failures + 1;
      const delay = failures < 3 ? 0 : Math.min(IDLE_MS, 1000 * 2 ** Math.min(failures - 3, 20));
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ failures, lockedUntil: Date.now() + delay }));
      return false;
    });
  }
  for (const event of ['pointerdown', 'keydown', 'input', 'wheel', 'touchstart']) window.addEventListener?.(event, touch, { capture:true, passive:true });
  document.addEventListener?.('visibilitychange', () => isUnlocked());
  window.addEventListener?.('pagehide', () => lock());
  window.HotelLocalLock = Object.freeze({ status, setPin, verify, lock, isUnlocked, touch, onLock(listener) { listeners.add(listener); return () => listeners.delete(listener); }, idleMs: IDLE_MS });
})();
