(() => {
  'use strict';
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  let requested = false;
  let registration;
  function showUpdate() {
    if (!registration?.waiting || document.getElementById('pwa-update-notice')) return;
    const notice = document.createElement('aside');
    notice.id = 'pwa-update-notice';
    notice.className = 'pwa-update-notice';
    notice.setAttribute('aria-label', 'Application update');
    const text = document.createElement('p');
    text.textContent = 'An update is available. Save your work before refreshing.';
    const refresh = document.createElement('button');
    refresh.type = 'button';
    refresh.textContent = 'Refresh';
    refresh.addEventListener('click', () => {
      const worker = registration.waiting;
      if (!worker) { location.reload(); return; }
      requested = true;
      refresh.disabled = true;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'activated' && requested) location.reload();
      });
      worker.postMessage({ type: 'SKIP_WAITING' });
    });
    const later = document.createElement('button');
    later.type = 'button';
    later.textContent = 'Later';
    later.addEventListener('click', () => notice.remove());
    notice.append(text, refresh, later);
    document.body.appendChild(notice);
  }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (requested) location.reload();
  });
  window.addEventListener('load', async () => {
    try {
      registration = await navigator.serviceWorker.register('sw.js?v=22.46', { updateViaCache: 'none' });
      window.hpServiceWorkerReg = registration;
      showUpdate();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate();
        });
      });
      window.addEventListener('online', () => registration.update().catch(() => {}));
    } catch (_) { /* Browsing still works when offline installation is unavailable. */ }
  });
})();
