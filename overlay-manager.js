// One visible sheet, shared iOS-safe scroll lock, and one keyboard/focus boundary.
(() => {
  'use strict';
  const roots = '.modal-backdrop.active, dialog[open]';
  const focusSelector = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const locks = new Set();
  let saved, top = null;
  const order = new Map();
  let sequence = 0;
  function acquire(owner) {
    if (locks.has(owner)) return;
    if (!locks.size) {
      const style = document.body.style;
      saved = { y: window.scrollY, x: window.scrollX, position: style.position, top: style.top, left: style.left, width: style.width, overflow: style.overflow };
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      const contentWidth = document.body.getBoundingClientRect?.().width || document.documentElement.clientWidth || viewportWidth;
      const gutter = Math.max(0, viewportWidth - contentWidth);
      // Keep the underlying layout at its pre-lock width when the scrollbar disappears.
      Object.assign(style, { position: 'fixed', top: `-${saved.y}px`, left: `-${saved.x}px`, width: `calc(100% - ${gutter}px)`, overflow: 'hidden' });
    }
    locks.add(owner);
  }
  function release(owner) {
    if (!locks.delete(owner) || locks.size || !saved) return;
    const { y, x, ...styles } = saved;
    saved = null;
    const rootStyle = document.documentElement.style;
    const previousBehavior = rootStyle.scrollBehavior;
    rootStyle.scrollBehavior = 'auto';
    Object.assign(document.body.style, styles);
    window.scrollTo(x, y);
    rootStyle.scrollBehavior = previousBehavior || '';
  }
  function close(element) {
    if (element.tagName === 'DIALOG') element.close();
    else if (element.id === 'image-replace-modal') window.admin?.closeImageModal();
    else if (window.app?.dismissGuestOverlay) window.app.dismissGuestOverlay(element);
    else element.classList.remove('active');
  }
  function sync() {
    const active = [...document.querySelectorAll(roots)];
    for (const element of active) {
      if (!order.has(element)) {
        order.set(element, { sequence: ++sequence, opener: document.activeElement });
        element.setAttribute('role', 'dialog');
        element.setAttribute('aria-modal', 'true');
      }
      acquire(element);
    }
    const previous = top;
    top = active.sort((a,b) => order.get(a).sequence - order.get(b).sequence).at(-1) || null;
    for (const element of active) {
      const suspended = element !== top;
      element.toggleAttribute('data-overlay-suspended', suspended);
      element.inert = suspended;
    }
    let restore;
    for (const [element, record] of order) if (!active.includes(element)) {
      release(element);
      element.removeAttribute('data-overlay-suspended');
      element.inert = false;
      order.delete(element);
      if (element === previous) restore = record.opener;
    }
    if (top !== previous) {
      if (restore?.isConnected && (!top || top.contains(restore))) restore.focus({ preventScroll: true });
      else if (top) {
        const first = top.querySelector(focusSelector);
        top.tabIndex = -1;
        (first || top).focus({ preventScroll: true });
      }
    }
  }
  function init() {
    new MutationObserver(sync).observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:['class','open'] });
    document.addEventListener('keydown', event => {
      if (!top) return;
      if (event.key === 'Escape') {
        event.preventDefault(); event.stopImmediatePropagation(); close(top); return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...top.querySelectorAll(focusSelector)].filter(element => element.getClientRects().length && !element.closest('[inert]'));
      const first = focusable[0], last = focusable.at(-1);
      if (!first) { event.preventDefault(); top.focus(); return; }
      if (!top.contains(document.activeElement) || (!event.shiftKey && document.activeElement === last)) { event.preventDefault(); first.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === top)) { event.preventDefault(); last.focus(); }
    }, true);
    document.addEventListener('focusin', event => {
      // showModal() can move focus before MutationObserver delivers the new open attribute.
      sync();
      if (top && !top.contains(event.target)) (top.querySelector(focusSelector) || top).focus({ preventScroll:true });
    });
    const keyboard = () => {
      const viewport = window.visualViewport;
      document.documentElement.style.setProperty('--overlay-viewport-height', `${viewport?.height || window.innerHeight}px`);
      document.documentElement.style.setProperty('--overlay-viewport-top', `${Math.max(0,viewport?.offsetTop||0)}px`);
      if (top?.contains(document.activeElement)) document.activeElement.scrollIntoView({ block:'nearest', behavior:'auto' });
    };
    window.visualViewport?.addEventListener('resize', keyboard);
    window.addEventListener('resize', keyboard);
    keyboard(); sync();
    window.addEventListener('pageshow',()=>{
      sync();
      if(!top&&!locks.size)document.body.classList.remove('modal-open');
    });
  }
  window.HotelOverlays = Object.freeze({ acquire, release, sync, get count() { return locks.size; } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
