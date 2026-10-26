// ==========================================================================
// HOTEL PREMIER - PRIDE PURE VEG AC RESTAURANT & HOTEL PREMIER STAYS, BHUSAWAL
// Digital QR Menu Display & Hotel Room Booking Portal Controller
// Supports: English, Hindi (हिंदी), Marathi (मराठी)
// Multi-Photo Carousel Engine for Main Hero, Sub-Sections & Room Stays
// ==========================================================================

class HotelPremierApp {
  constructor() {
    this.menuData = (window.HOTEL_PREMIER_INITIAL_MENU && window.HOTEL_PREMIER_INITIAL_MENU.length > 0)
      ? [...window.HOTEL_PREMIER_INITIAL_MENU]
      : [];
    this.categories = (window.HOTEL_PREMIER_CATEGORIES && window.HOTEL_PREMIER_CATEGORIES.length > 0)
      ? [...window.HOTEL_PREMIER_CATEGORIES]
      : [];
    this.currentCategory = 'all';
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.viewMode = 'all'; // 'home' | 'section' | 'all' | 'search'
    this.mainMode = 'menu'; // 'menu' | 'hotel'
    this.isLargeFont = false;
    this.currentLang = 'en'; // 'en' | 'hi' | 'mr'
    this.activeSubCategories = {}; // { [catId]: subCatId }

    // Storage Keys
    this.storageKeyMenu = 'hotel_premier_menu_v2';
    this.storageKeyOverrides = 'hotel_premier_user_overrides_v1';
    this.storageKeyFontSize = 'hotel_premier_font_size';
    this.storageKeyLang = 'hotel_premier_language';
    this.storageKeyTheme = 'hotel_premier_theme';
    this.themeMode = 'system';

    // Favorites System
    this.storageKeyFavorites = 'hp_favorites';
    try {
      this.favorites = JSON.parse(localStorage.getItem(this.storageKeyFavorites)) || [];
      if (!Array.isArray(this.favorites)) this.favorites = [];
    } catch (e) {
      this.favorites = [];
    }
    this.isFavoritesFilterActive = false;

    // Recent Searches
    this.storageKeyRecentSearches = 'hp_recent_searches';
    try {
      this.recentSearches = JSON.parse(localStorage.getItem(this.storageKeyRecentSearches)) || [];
      if (!Array.isArray(this.recentSearches)) this.recentSearches = [];
    } catch (e) {
      this.recentSearches = [];
    }

    // Carousel States
    this.heroSlides = [];
    this.currentHeroSlideIndex = 0;
    this.heroAutoInterval = null;

    this.sectionSlides = [];
    this.currentSectionSlideIndex = 0;
    this.sectionAutoInterval = null;

    this.roomGalleries = {};
    if (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories) {
      window.HOTEL_PREMIER_HOTEL_DATA.roomCategories.forEach(room => {
        this.roomGalleries[room.id] = (room.images && room.images.length > 0) ? [...room.images] : [room.image];
      });
    }
    this.roomSlideIndices = {
      'ac-super-deluxe': 0,
      'ac-deluxe-queen': 0,
      'ac-deluxe-twin': 0
    };
    this.currentAttractionFilter = 'all';

    this.init();
  }

  async init() {
    try { this.loadPreferences(); } catch (e) { console.warn('[Init] loadPreferences:', e); }
    // Resolve the visible page before waiting for stored photos/menu data.
    // Only the requested route should be visible during a slow startup.
    try { if (window.HotelGuestNetwork) this.switchSection(window.HotelGuestNetwork.resolve(window.location), false); } catch (e) { console.warn('[Init] entry route:', e); }
    try { this.bindMenuSearchEvents(); } catch (e) { console.warn('[Init] search controls:', e); }
    try { await this.loadMenuData(); } catch (e) { console.warn('[Init] loadMenuData:', e); }
    try { this.updateUILanguage(); } catch (e) { console.warn('[Init] updateUILanguage:', e); }
    try { this.renderCategoryCards(); } catch (e) { console.warn('[Init] renderCategoryCards:', e); }
    try { this.renderCategories(); } catch (e) { console.warn('[Init] renderCategories:', e); }
    try { this.renderQuickFilters(); } catch (e) { console.warn('[Init] renderQuickFilters:', e); }
    try { this.renderMenu(); } catch (e) { console.warn('[Init] renderMenu:', e); }
    try { this.renderMenuSectionDrawer(); } catch (e) { console.warn('[Init] renderMenuSectionDrawer:', e); }
    try { this.renderLocationQR(); } catch (e) { console.warn('[Init] renderLocationQR:', e); }
    try { this.renderLocalAttractions(); } catch (e) { console.warn('[Init] renderLocalAttractions:', e); }
    try { await this.initHeroCarousel(); } catch (e) { console.warn('[Init] initHeroCarousel:', e); }
    try { await this.renderRoomCarousels(); } catch (e) { console.warn('[Init] renderRoomCarousels:', e); }
    try { this.renderBulkDealsSection(); } catch (e) { console.warn('[Init] renderBulkDealsSection:', e); }
    try { this.calculateBulkQuote(); } catch (e) { console.warn('[Init] calculateBulkQuote:', e); }
    try { this.renderRestaurantEventPackages(); } catch (e) { console.warn('[Init] renderRestaurantEventPackages:', e); }
    try { this.renderEventDecorations(); } catch (e) { console.warn('[Init] renderEventDecorations:', e); }
    try { this.calculateRestaurantEventQuote(); } catch (e) { console.warn('[Init] calculateRestaurantEventQuote:', e); }
    try { this.checkStaffModeAccess(); } catch (e) { console.warn('[Init] checkStaffModeAccess:', e); }
    try { this.initGuestProfile(); } catch (e) { console.warn('[Init] initGuestProfile:', e); }
    try { this.updateFavoritesBadges(); } catch (e) { console.warn('[Init] updateFavoritesBadges:', e); }
    try { this.renderRecentSearches(); } catch (e) { console.warn('[Init] renderRecentSearches:', e); }
    const urlParams = new URLSearchParams(window.location.search);
    let catParam = urlParams.get('category') || urlParams.get('cat');
    let sectionParam = urlParams.get('section') || urlParams.get('page') || urlParams.get('tab');
    if (!catParam && window.location.hash) {
      const match = window.location.hash.match(/(?:category|cat)=([a-zA-Z0-9_-]+)/);
      if (match) catParam = match[1];
    }

    // Verify catParam against known categories
    const isKnownCategory = catParam && this.categories.some(c => c.id === catParam);
    if (!isKnownCategory) {
      catParam = null;
    }

    // Hash-based independent section routing
    const rawHash = (window.location.hash || '').replace('#', '').toLowerCase();
    const hashToSection = {
      '': 'section-home',
      'home': 'section-home',
      'sanctuary': 'section-home',
      'tariffs': 'section-tariffs',
      'tariff': 'section-tariffs',
      'rates': 'section-tariffs',
      'stay': 'section-stay',
      'rooms': 'section-stay',
      'dine': 'section-dine',
      'dining': 'section-dine',
      'menu': 'section-dine',
      'celebrate': 'section-celebrate',
      'events': 'section-celebrate',
      'banquets': 'section-celebrate',
      'explore': 'section-explore',
      'arrive': 'section-explore',
      'guide': 'section-explore',
      'location': 'section-explore',
      'reviews': 'guest-feedback-section',
      'feedback': 'guest-feedback-section',
      'contact': 'section-contact',
      'call': 'section-contact',
      'phone': 'section-contact'
    };

    const src = urlParams.get('src') || '';
    const hasTableParam = urlParams.has('table') || urlParams.has('t') || (src && /^table/i.test(src.trim()));
    const entryParam = (urlParams.get('entry') || '').toLowerCase();
    const isRestaurantEntry = entryParam === 'restaurant' || entryParam === 'menu' || entryParam === 'dine' || hasTableParam;

    let initialSection = window.HotelGuestNetwork ? window.HotelGuestNetwork.resolve(window.location) : 'section-home';
    if (window.HotelGuestNetwork) {
      if (initialSection !== 'section-dine') catParam = null;
      window.HotelGuestNetwork.load();
    } else if (isRestaurantEntry || catParam) {
      initialSection = 'section-dine';
    } else if (sectionParam && hashToSection[sectionParam.toLowerCase()]) {
      initialSection = hashToSection[sectionParam.toLowerCase()];
    } else if (rawHash && hashToSection[rawHash]) {
      initialSection = hashToSection[rawHash];
    }
    this.prioritizeDiningControls();
    this.switchSection(initialSection, false);

    if (catParam && !this.searchQuery.trim()) {
      this.openCategorySection(catParam);
    }
    this.bindEvents();
    this.setupBroadcastChannel();
    this.openSharedDishFromUrl(urlParams);
  }

  // QR visitors should be able to search or choose a menu category immediately.
  prioritizeDiningControls() {
    const header = document.querySelector('.app-header');
    if (header && window.ResizeObserver) {
      this.headerResizeObserver = new ResizeObserver(() => {
        document.documentElement.style.setProperty('--app-header-height', `${header.getBoundingClientRect().height}px`);
      });
      this.headerResizeObserver.observe(header);
    }
    const settings = document.getElementById('guest-settings');
    if (settings) {
      document.addEventListener('click', (event) => {
        if (settings.open && !settings.contains(event.target)) settings.open = false;
      });
      settings.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          settings.open = false;
          settings.querySelector('summary').focus();
          event.stopPropagation();
        }
      });
    }
    const diningContainer = document.querySelector('.editorial-dining-container');
    const controls = diningContainer?.querySelector('.dining-view-controls');
    const featuredDishes = diningContainer?.querySelector('.signature-creations-wrapper');
    if (!diningContainer || !controls || !featuredDishes) return;

    diningContainer.insertBefore(controls, featuredDishes);
    const menu = diningContainer.querySelector('#menu-container');
    if (menu) diningContainer.insertBefore(menu, featuredDishes);
    diningContainer.classList.add('qr-menu-first');
  }

  // ==================== USER PREFERENCES ====================
  loadPreferences() {
    try {
      const userTheme = localStorage.getItem('hotel_premier_theme_choice');
      this.themeMode = (userTheme === 'light' || userTheme === 'dark' || userTheme === 'system') ? userTheme : 'system';
      this.applyTheme();

      if (window.matchMedia) {
        this.colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.colorSchemeQuery.addEventListener('change', () => {
          if (this.themeMode === 'system') this.applyTheme();
        });
      }

      const savedLang = localStorage.getItem(this.storageKeyLang);
      if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'mr')) {
        this.currentLang = savedLang;
      }
      if (window.HOTEL_PREMIER_I18N) {
        window.HOTEL_PREMIER_I18N.currentLang = this.currentLang;
      }
      this.updateLangButtons();

      const savedFontSize = localStorage.getItem(this.storageKeyFontSize);
      if (savedFontSize === 'large') {
        this.isLargeFont = true;
        document.body.classList.add('large-font-mode');
        const btn = document.getElementById('font-size-toggle-btn');
        if (btn) btn.innerHTML = '<span class="hp-inline-d88f59571365">A-</span>';
      }
    } catch (e) {}
  }

  setThemeMode(mode) {
    if (mode !== 'light' && mode !== 'dark' && mode !== 'system') mode = 'system';
    this.themeMode = mode;
    try {
      localStorage.setItem('hotel_premier_theme_choice', mode);
      localStorage.setItem(this.storageKeyTheme, mode);
    } catch (e) {}
    this.applyTheme();
    this.haptic(15);
  }

  cycleTheme() {
    if (this.themeMode === 'system') {
      this.setThemeMode('light');
    } else if (this.themeMode === 'light') {
      this.setThemeMode('dark');
    } else {
      this.setThemeMode('system');
    }
  }

  // ==================== HAPTIC TACTILE ENGINE ====================
  haptic(ms = 10) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(ms);
      }
    } catch (e) {}
  }

  // ==================== FAVORITES & BOOKMARKS SYSTEM ====================
  favoriteKey(dish, variant) {
    return variant ? `${dish.id}::${encodeURIComponent(variant.id || variant.name).replace(/'/g, '%27')}` : dish.id;
  }

  getFavoriteItems() {
    return this.menuData.flatMap(dish => {
      if (dish.groupedUnder || dish.notAvailable) return [];
      if (!dish.variants?.length) return this.favorites.includes(dish.id) ? [dish] : [];
      return dish.variants.flatMap((variant, index) => {
        const key = this.favoriteKey(dish, variant);
        if (variant.hidden || !this.favorites.includes(key)) return [];
        return [{...dish, ...variant, id:key, _sourceDishId:dish.id, _sourceVariantIndex:index,
          image:variant.image || dish.image, variants:undefined, isGroupMaster:false, displayPriceRange:undefined,
          _activeVariantImage:undefined, _activeVariantPrice:undefined}];
      });
    });
  }

  syncDetailFavorite() {
    const dish = this.menuData.find(d => d.id === this.currentDetailDishId);
    const host = document.querySelector('#dish-detail-body .modal-dish-photo-wrap');
    if (!dish || !host) return;
    const variant = dish.variants?.[this.currentDetailVariantIndex];
    const key = this.favoriteKey(dish, variant);
    let button = host.querySelector('.detail-photo-favorite');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button'; button.className = 'detail-photo-favorite';
      button.addEventListener('click', () => {
        this.toggleFavorite(this.currentDetailFavoriteKey);
        this.syncDetailFavorite();
      });
      host.appendChild(button);
    }
    this.currentDetailFavoriteKey = key;
    const selected = this.favorites.includes(key);
    button.textContent = selected ? '♥' : '♡';
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${selected ? 'Remove' : 'Save'} ${variant?.name || dish.name} ${selected ? 'from' : 'to'} favourites`);
  }

  toggleFavorite(dishId) {
    this.haptic([10, 50, 10]);
    const idx = this.favorites.indexOf(dishId);
    let isFav = false;
    if (idx >= 0) {
      this.favorites.splice(idx, 1);
      isFav = false;
      this.showToast('Removed from Favorites', 'info');
    } else {
      this.favorites.push(dishId);
      isFav = true;
      this.showToast('Saved to Favorites ♥', 'success');
    }
    try {
      localStorage.setItem(this.storageKeyFavorites, JSON.stringify(this.favorites));
    } catch (e) {}

    this.updateFavoritesBadges();

    // Update heart icons across the UI
    document.querySelectorAll(`.dish-fav-btn[data-dish-id="${dishId}"]`).forEach(btn => {
      btn.classList.toggle('active', isFav);
      btn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
      btn.innerHTML = `<span class="fav-icon ${isFav ? 'pop-anim' : ''}" aria-hidden="true">${isFav ? '♥' : '♡'}</span>`;
    });

    const modalFavLabel = document.getElementById(`modal-fav-label-${dishId}`);
    if (modalFavLabel) {
      modalFavLabel.innerText = isFav ? '♥ Favorited' : '♡ Add to Favorites';
      modalFavLabel.closest('.modal-fav-toggle-btn')?.classList.toggle('active', isFav);
    }

    if (this.isFavoritesFilterActive) {
      this.renderMenu();
    }
  }

  updateFavoritesBadges() {
    // Preserve old group favourites as individually removable item favourites.
    this.favorites = [...new Set((this.favorites || []).flatMap(key => {
      const dish = this.menuData?.find(d => d.id === key);
      return dish?.variants?.length ? dish.variants.filter(v => !v.hidden).map(v => this.favoriteKey(dish,v)) : [key];
    }))];
    try { localStorage.setItem(this.storageKeyFavorites, JSON.stringify(this.favorites)); } catch(e) {}
    const count = this.favorites ? this.favorites.length : 0;
    const badge = document.getElementById('favorites-count-badge');
    if (badge) {
      badge.innerText = count;
      badge.hidden = count === 0;
    }
  }

  toggleFavoritesFilter() {
    this.haptic(15);
    this.isFavoritesFilterActive = !this.isFavoritesFilterActive;
    const btn = document.getElementById('btn-favorites-filter');
    if (btn) { btn.classList.toggle('active', this.isFavoritesFilterActive); btn.setAttribute('aria-pressed',String(this.isFavoritesFilterActive)); }

    if (this.isFavoritesFilterActive) {
      this.currentCategory = 'all';
      this.currentFilter = 'all';
      this.searchQuery = '';
      const search = document.getElementById('menu-search-input');
      if (search) search.value = '';
      const clear = document.getElementById('clear-search-btn');
      if (clear) clear.style.display = 'none';
      this.renderQuickFilters();
      this.viewMode = 'section';
      const homeView = document.getElementById('home-categories-view');
      const dishesView = document.getElementById('dishes-section-view');
      if (homeView) homeView.style.display = 'none';
      if (dishesView) dishesView.style.display = 'block';

      const titleEl = document.getElementById('active-category-title');
      const hindiEl = document.getElementById('active-category-hindi');
      const countEl = document.getElementById('active-category-count');
      if (titleEl) titleEl.innerText = 'My Favorite Selections';
      if (hindiEl) hindiEl.innerText = 'पसंदीदा डिशेस';
      if (countEl) countEl.innerText = `${this.favorites.length} Saved`;

      this.renderSectionSlideshow(null);
    }
    this.renderMenu();
  }

  clearMenuFavoritesScope() {
    this.isFavoritesFilterActive = false;
    const button = document.getElementById('btn-favorites-filter');
    if (button) { button.classList.remove('active'); button.setAttribute('aria-pressed','false'); }
  }

  setMenuSearch(query) {
    const scopeChanged=this.currentCategory!=='all' || this.currentFilter!=='all' || this.isFavoritesFilterActive;
    this.searchQuery = query;
    if (query.trim()) {
      this.currentCategory = 'all';
      this.currentFilter = 'all';
      this.activeSubCategories = {};
      this.clearMenuFavoritesScope();
      if (scopeChanged) { this.renderQuickFilters(); this.renderMenuSectionDrawer(); }
    }
  }

  openSharedDishFromUrl(params = new URLSearchParams(window.location.search)) {
    const hash=(window.location.hash || '').slice(1).toLowerCase();
    if (hash && !['dine','dining','menu','food'].includes(hash)) return;
    const id = params.get('dish');
    if (!id) return;
    const dish = this.menuData.find(item => item.id === id && !item.notAvailable && !item.groupedUnder);
    if (!dish || (dish.variants?.length && dish.variants.every(v=>v.hidden))) {
      this.showToast('This shared dish is no longer available. Please browse the current menu.','info'); return;
    }
    const option = params.get('variant');
    let index = null;
    if (option) {
      index = dish.variants?.findIndex(v => !v.hidden && String(v.id || v.name) === option);
      if (index == null || index < 0) { this.showToast('This shared dish option is no longer available.','info'); return; }
    }
    this.switchSection('section-dine');
    this.openDishDetail(dish.id,index);
  }

  // ==================== WEB SHARE ENGINE ====================
  shareDish(dishId) {
    if (!dishId && this.currentDetailDishId) dishId = this.currentDetailDishId;
    this.haptic(10);
    const dish = this.menuData ? this.menuData.find(d => d.id === dishId) : null;
    if (!dish) return;
    const modalVariant = this.currentDetailDishId===dish.id && Number.isInteger(this.currentDetailVariantIndex) ? dish.variants?.[this.currentDetailVariantIndex] : null;
    const activeVariant = modalVariant && !modalVariant.hidden ? modalVariant : dish.variants?.find(v => !v.hidden && v.name === dish._activeVariantName);
    const currentPrice = activeVariant ? activeVariant.price : (dish._activeVariantPrice ?? dish.price);
    const priceText = Number.isFinite(currentPrice) ? `₹${currentPrice}` : '';
    const variantName = activeVariant ? ` - ${activeVariant.name}` : '';
    const desc = (activeVariant && this.getVariantDescription?.(activeVariant)) || this.getDishDescription(dish) || '';
    const shareLink = new URL(window.location.pathname, window.location.origin);
    shareLink.searchParams.set('dish',dish.id);
    if (activeVariant) shareLink.searchParams.set('variant',String(activeVariant.id || activeVariant.name));
    shareLink.hash='dine';
    const shareUrl = shareLink.href;
    const title = `${dish.name}${variantName} | Hotel Premier Pure Veg`;
    const text = `${dish.name}${variantName} ${priceText ? `(${priceText})` : ''} at Pride Pure Veg Restaurant, Hotel Premier: ${desc}`;

    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: shareUrl
      }).catch(() => {});
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + shareUrl)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  }

  shareHotel() {
    this.haptic(10);
    const title = 'Hotel Premier — A Sanctuary in Bhusawal';
    const text = 'Discover Hotel Premier — 14 air-conditioned suites, 24-hour checkout for direct bookings only, and Pride Pure Veg AC Restaurant in Bhusawal.';
    const shareUrl = window.location.origin + window.location.pathname + '#home';

    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: shareUrl
      }).catch(() => {});
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + shareUrl)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  }

  // ==================== ENHANCED FUZZY SEARCH & RECENT SEARCHES ====================
  fuzzyMatch(text, pattern, threshold = 0.6) {
    if (!text || !pattern) return false;
    text = text.toLowerCase();
    pattern = pattern.toLowerCase();
    if (text.includes(pattern)) return true;

    const words = text.split(/\s+/);
    for (const word of words) {
      if (this.calculateSimilarity(word, pattern) >= threshold) return true;
    }
    return this.calculateSimilarity(text, pattern) >= threshold;
  }

  calculateSimilarity(s1, s2) {
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0;
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return (longerLength - costs[s2.length]) / parseFloat(longerLength);
  }

  saveRecentSearch(query) {
    if (!query || query.trim().length < 2) return;
    const cleanQ = query.trim();
    this.recentSearches = this.recentSearches.filter(q => typeof q === 'string' && q.toLowerCase() !== cleanQ.toLowerCase());
    this.recentSearches.unshift(cleanQ);
    if (this.recentSearches.length > 5) {
      this.recentSearches = this.recentSearches.slice(0, 5);
    }
    try {
      localStorage.setItem(this.storageKeyRecentSearches, JSON.stringify(this.recentSearches));
    } catch (e) {}
    this.renderRecentSearches();
  }

  renderRecentSearches() {
    const container = document.getElementById('recent-searches-list');
    const bar = document.getElementById('recent-searches-bar');
    if (!container || !bar) return;
    if (!this.recentSearches || this.recentSearches.length === 0) {
      bar.style.display = 'none';
      return;
    }
    container.replaceChildren();
    for (const q of this.recentSearches.filter(q => typeof q === 'string').slice(0,5)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'recent-search-chip';
      button.textContent = q;
      button.addEventListener('click', () => this.executeRecentSearch(encodeURIComponent(q)));
      container.appendChild(button);
    }
    bar.style.display = 'flex';
  }

  executeRecentSearch(encodedQuery) {
    this.haptic(10);
    const q = decodeURIComponent(encodedQuery || '');
    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) {
      searchInput.value = q;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  highlightMatches(text, query) {
    if (!text || !query) return text;
    try {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    } catch (e) {
      return text;
    }
  }

  // ==================== STAGGERED CARD ANIMATIONS ====================
  observeStaggeredCards() {
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.dish-card-stagger').forEach(card => card.classList.add('in-view'));
      return;
    }
    if (!this._cardObserver) {
      this._cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const card = entry.target;
            card.classList.add('in-view');
            this._cardObserver.unobserve(card);
          }
        });
      }, { threshold: 0.05, rootMargin: '40px' });
    }
    document.querySelectorAll('.dish-card-stagger:not(.in-view)').forEach((card, index) => {
      card.style.transitionDelay = `${(index % 8) * 40}ms`;
      this._cardObserver.observe(card);
    });
  }

  // ==================== DYNAMIC ADMIN CMS LAZY-LOADER ====================
  ensureAdminLoaded(callback) {
    if (window.admin) {
      if (typeof callback === 'function') callback();
      return;
    }
    this.showToast('Loading admin tools...', 'info');
    const s = document.createElement('script');
    s.src = 'admin.js?v=22.11';
    s.onload = () => {
      if (typeof initializeHotelPremierAdmin === 'function') {
        initializeHotelPremierAdmin();
      }
      if (window.admin && typeof callback === 'function') {
        callback();
      }
    };
    s.onerror = () => {
      this.showToast('Failed to load admin tools', 'warning');
    };
    document.body.appendChild(s);
  }

  applyTheme() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    let resolvedTheme;

    if (this.themeMode === 'dark') {
      resolvedTheme = 'dark';
    } else if (this.themeMode === 'light') {
      resolvedTheme = 'light';
    } else {
      this.themeMode = 'system';
      resolvedTheme = prefersDark ? 'dark' : 'light';
    }

    document.body.classList.toggle('theme-dark', resolvedTheme === 'dark');
    document.body.classList.toggle('theme-light', resolvedTheme === 'light');
    document.documentElement.style.colorScheme = resolvedTheme;

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = resolvedTheme === 'dark' ? '#131C26' : '#FAF7F0';

    const btnSystem = document.getElementById('theme-choice-system');
    const btnLight = document.getElementById('theme-choice-light');
    const btnDark = document.getElementById('theme-choice-dark');
    if (btnSystem) btnSystem.classList.toggle('active', this.themeMode === 'system');
    if (btnLight) btnLight.classList.toggle('active', this.themeMode === 'light');
    if (btnDark) btnDark.classList.toggle('active', this.themeMode === 'dark');

    const toggle = document.getElementById('theme-toggle-btn');
    if (toggle) {
      if (this.themeMode === 'system') {
        toggle.title = 'Automatically follows your device appearance';
        toggle.setAttribute('aria-label', `${resolvedTheme === 'dark' ? 'Dark' : 'Light'} mode, following your device`);
        toggle.textContent = `${resolvedTheme === 'dark' ? 'Dark' : 'Light'} · Auto`;
      } else {
        toggle.title = `Theme manually set to ${this.themeMode}`;
        toggle.setAttribute('aria-label', `${this.themeMode === 'dark' ? 'Dark' : 'Light'} mode (Manual)`);
        toggle.textContent = `${this.themeMode === 'dark' ? 'Dark' : 'Light'} · Manual`;
      }
    }
  }

  // ==================== TOP MAIN MODE SWITCHER (MENU vs HOTEL) ====================
  switchMainMode(mode) {
    this.mainMode = mode;

    const menuContainer = document.getElementById('section-menu-container');
    const hotelContainer = document.getElementById('section-hotel-container');
    const tabMenu = document.getElementById('tab-mode-menu');
    const tabHotel = document.getElementById('tab-mode-hotel');
    const floatBtn = document.getElementById('floating-menu-toggle-btn');

    if (mode === 'hotel') {
      if (menuContainer) menuContainer.style.display = 'none';
      if (hotelContainer) hotelContainer.style.display = 'block';
      if (tabMenu) tabMenu.classList.remove('active');
      if (tabHotel) tabHotel.classList.add('active');
      if (floatBtn) floatBtn.style.display = 'none';
      this.closeMenuSectionDrawer();
      this.renderRoomCarousels();
      this.calculateBulkQuote();
    } else {
      if (menuContainer) menuContainer.style.display = 'block';
      if (hotelContainer) hotelContainer.style.display = 'none';
      if (tabMenu) tabMenu.classList.add('active');
      if (tabHotel) tabHotel.classList.remove('active');
      if (floatBtn) floatBtn.style.display = 'flex';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==================== INDEPENDENT HOTEL SECTION ROUTING ====================
  switchSection(sectionId, updateHash = true) {
    this.haptic(5);
    const validSections = [
      'section-concierge',
      'section-home',
      'section-stay',
      'section-tariffs',
      'section-dine',
      'section-celebrate',
      'section-explore',
      'guest-feedback-section',
      'section-contact'
    ];

    if (!validSections.includes(sectionId)) {
      sectionId = 'section-home';
    }

    if (sectionId !== 'section-dine') {
      clearTimeout(this.drawerNavigationTimer);
      this.closeMenuSectionDrawer({ restoreFocus:false });
    }
    this.activeSection = sectionId;
    if (sectionId === 'section-concierge') window.HotelGuestNetwork?.renderConcierge();

    // Show ONLY the requested section; hide all other sections separately
    validSections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === sectionId) {
          el.style.display = 'block';
        } else {
          el.style.display = 'none';
        }
      }
    });

    // Floating Quick Navigation Menu Button: ONLY show inside Dining section
    const floatingMenuBtn = document.getElementById('floating-menu-toggle-btn');
    if (floatingMenuBtn) {
      floatingMenuBtn.style.display = (sectionId === 'section-dine') ? 'flex' : 'none';
    }

    // Auto-fill profile whenever entering guest feedback or reviews section
    if (sectionId === 'guest-feedback-section') {
      this.applyGuestProfileToAllForms();
    }

    // Dynamic render Explore Concierge & Local Attractions when navigating to explore
    if (sectionId === 'section-explore') {
      try {
        this.renderLocalAttractions();
        this.renderLocationQR();
      } catch (e) {
        console.warn('[switchSection] explore render:', e);
      }
    }

    // Update active tab in top navigation bar
    document.querySelectorAll('.hotel-nav-tab').forEach(tab => tab.classList.remove('active'));
    const tabMap = {
      'section-home': 'tab-nav-home',
      'section-stay': 'tab-nav-stay',
      'section-tariffs': 'tab-nav-tariffs',
      'section-dine': 'tab-nav-dine',
      'section-celebrate': 'tab-nav-celebrate',
      'section-explore': 'tab-nav-explore',
      'guest-feedback-section': 'tab-nav-reviews',
      'section-contact': 'tab-nav-contact'
    };
    const activeTabId = tabMap[sectionId];
    if (activeTabId) {
      const activeTab = document.getElementById(activeTabId);
      if (activeTab) {
        activeTab.classList.add('active');
        activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    // Update URL hash cleanly
    if (updateHash) {
      const hashMap = {
        'section-concierge': 'concierge',
        'section-home': 'home',
        'section-stay': 'stay',
        'section-tariffs': 'tariffs',
        'section-dine': 'dine',
        'section-celebrate': 'events',
        'section-explore': 'explore',
        'guest-feedback-section': 'reviews',
        'section-contact': 'contact'
      };
      const hashName = hashMap[sectionId] || 'home';
      try {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#' + hashName);
        } else {
          window.location.hash = hashName;
        }
      } catch (e) {}
    }

    // Smooth scroll to top of selected page view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToSection(sectionId) {
    this.switchSection(sectionId);
  }

  // ==================== TARIFF PLAN SWITCHER (RO vs CP vs ALL) ====================
  setTariffPlanView(plan) {
    if (!['all','ro','cp'].includes(plan)) plan = 'all';
    this.currentTariffPlan = plan; // 'all' | 'ro' | 'cp'
    document.querySelectorAll('.tariff-plan-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.plan === plan);
      btn.setAttribute('aria-pressed', String(btn.dataset.plan === plan));
    });

    const roBoxes = document.querySelectorAll('.tariff-plan-box.plan-ro');
    const cpBoxes = document.querySelectorAll('.tariff-plan-box.plan-cp');

    if (plan === 'ro') {
      roBoxes.forEach(b => b.style.display = 'block');
      cpBoxes.forEach(b => b.style.display = 'none');
    } else if (plan === 'cp') {
      roBoxes.forEach(b => b.style.display = 'none');
      cpBoxes.forEach(b => b.style.display = 'block');
    } else {
      roBoxes.forEach(b => b.style.display = 'block');
      cpBoxes.forEach(b => b.style.display = 'block');
    }
  }

  // ==================== MULTILINGUAL SYSTEM ====================
  setLanguage(lang) {
    if (lang !== 'en' && lang !== 'hi' && lang !== 'mr') return;
    this.haptic(10);
    this.currentLang = lang;
    if (window.HOTEL_PREMIER_I18N) {
      window.HOTEL_PREMIER_I18N.currentLang = lang;
    }
    try {
      localStorage.setItem(this.storageKeyLang, lang);
    } catch (e) {}

    this.updateLangButtons();
    this.updateUILanguage();
    this.renderQuickFilters();
    this.renderCategoryCards();
    this.renderCategories();

    const hindiEl = document.getElementById('active-category-hindi');
    if (this.viewMode === 'section' && this.currentCategory !== 'all') {
      const catId = this.currentCategory;
      const titleEl = document.getElementById('active-category-title');
      if (titleEl) titleEl.innerText = this.getCategoryLocalizedName(catId);
      if (hindiEl) {
        if (this.currentLang === 'en') {
          hindiEl.style.display = 'none';
          hindiEl.innerText = '';
        } else {
          const sub = this.getCategoryLocalizedSubtitle(catId);
          if (sub) {
            hindiEl.style.display = 'block';
            hindiEl.innerText = sub;
          } else {
            hindiEl.style.display = 'none';
          }
        }
      }
    } else if (this.viewMode === 'all') {
      const titleEl = document.getElementById('active-category-title');
      if (titleEl) titleEl.innerText = this.t('allMenuTitle');
      if (hindiEl) {
        if (this.currentLang === 'en') {
          hindiEl.style.display = 'none';
          hindiEl.innerText = '';
        } else {
          hindiEl.style.display = 'block';
          hindiEl.innerText = this.t('allMenuSubtitle');
        }
      }
    }

    this.renderMenu();
    this.renderMenuSectionDrawer();
    this.calculateBulkQuote();
    this.renderRestaurantEventPackages();
    this.renderEventDecorations();
    this.calculateRestaurantEventQuote();
  }

  updateLangButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === this.currentLang);
    });
  }

  t(key, fallback = '') {
    if (window.HOTEL_PREMIER_I18N) {
      return window.HOTEL_PREMIER_I18N.getText(key, fallback);
    }
    return fallback || key;
  }

  getCategoryLocalizedName(catId) {
    if (window.HOTEL_PREMIER_I18N) {
      return window.HOTEL_PREMIER_I18N.getCategoryName(catId);
    }
    const cat = this.categories.find(c => c.id === catId);
    return cat ? cat.name : catId;
  }

  getCategoryLocalizedSubtitle(catId) {
    if (this.currentLang === 'en') return '';
    if (window.HOTEL_PREMIER_I18N) {
      return window.HOTEL_PREMIER_I18N.getCategorySubtitle(catId);
    }
    return '';
  }

  getCategoryLocalizedDesc(catId) {
    if (window.HOTEL_PREMIER_I18N) {
      return window.HOTEL_PREMIER_I18N.getCategoryDescription(catId);
    }
    const cat = this.categories.find(c => c.id === catId);
    return cat ? (cat.description || '') : '';
  }

  updateUILanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (text) {
        if (el.tagName === 'OPTION') {
          el.text = text;
        } else {
          el.innerHTML = text;
        }
      }
    });

    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) {
      searchInput.placeholder = this.t('searchPlaceholder');
    }
  }

  // ==================== ACCESSIBILITY & FONT ZOOM ====================
  toggleElderlyFontSize() {
    this.isLargeFont = !this.isLargeFont;
    const btn = document.getElementById('font-size-toggle-btn');
    if (this.isLargeFont) {
      document.body.classList.add('large-font-mode');
      if (btn) btn.innerHTML = '<span class="hp-inline-d88f59571365">A-</span>';
      localStorage.setItem(this.storageKeyFontSize, 'large');
      this.showToast(this.t('textSizeLarge'), 'info');
    } else {
      document.body.classList.remove('large-font-mode');
      if (btn) btn.innerHTML = '<span class="hp-inline-d88f59571365">A+</span>';
      localStorage.setItem(this.storageKeyFontSize, 'normal');
      this.showToast(this.t('textSizeNormal'), 'info');
    }
  }

  async loadMenuData() {
    let initialMenu = window.HOTEL_PREMIER_INITIAL_MENU ? [...window.HOTEL_PREMIER_INITIAL_MENU] : [];
    const publicMenu={menuData:initialMenu};
    window.HotelMenuStructure?.applyPublished?.(publicMenu);
    initialMenu=publicMenu.menuData;
    let overridesMap = {};

    // 1. Fetch from Unified Safe Storage Manager (IndexedDB + LocalStorage)
    if (window.HOTEL_STORAGE) {
      overridesMap = await window.HOTEL_STORAGE.getAllDishOverrides();
    } else {
      try {
        const savedOverrides = localStorage.getItem(this.storageKeyOverrides);
        if (savedOverrides) overridesMap = JSON.parse(savedOverrides);
      } catch (e) {}
    }

    // 2. Base on fresh initial menu so new dish photos/updates always load
    this.menuData = initialMenu.map(dish => {
      const copy = { ...dish };
      // Published owner-selected photos are the baseline; newer local edits win.
      if (Object.prototype.hasOwnProperty.call(window.HOTEL_PREMIER_PHOTOS || {}, dish.id)) {
        copy.image = window.HOTEL_PREMIER_PHOTOS[dish.id];
      }
      const published=window.HOTEL_PREMIER_PUBLISHED_OVERRIDES?.dishes?.[dish.id];
      if(published)Object.assign(copy,published,{id:dish.id});
      if (overridesMap && overridesMap[dish.id]) {
        const ov = overridesMap[dish.id];
        // Published asset paths are authoritative baseline. Preserve user uploads,
        // timestamps, and explicit image selections.
        if (ov.image !== undefined && ov.image !== '') {
          const isStaleBaseline = (typeof ov.image === 'string' && ov.image.startsWith('assets/') && !ov.updatedAt && !ov.lastEnhancedAt && window.HOTEL_PREMIER_PHOTOS && window.HOTEL_PREMIER_PHOTOS[dish.id] && ov.image !== window.HOTEL_PREMIER_PHOTOS[dish.id]);
          if (!isStaleBaseline) copy.image = ov.image;
        } else if (ov.image === '') {
          copy.image = '';
        }
        if (ov.price !== undefined) copy.price = ov.price;
        if (ov.isSoldOut !== undefined) copy.isSoldOut = ov.isSoldOut;
        if (ov.notAvailable !== undefined) copy.notAvailable = Boolean(ov.notAvailable);
        if (ov.tags !== undefined) copy.tags = ov.tags;
        if (ov.variants !== undefined) copy.variants = ov.variants;
      }
      return copy;
    });

    // 3. Add custom dishes created by admin that are not in initialMenu
    for(const [id,published] of Object.entries(window.HOTEL_PREMIER_PUBLISHED_OVERRIDES?.dishes||{})) {
      if(!this.menuData.some(dish=>dish.id===id) && published.name)this.menuData.push({...published,id});
    }
    if (overridesMap) {
      const initialIds = new Set(initialMenu.map(d => d.id));
      Object.keys(overridesMap).forEach(id => {
        if (!initialIds.has(id) && !this.menuData.some(d=>d.id===id) && overridesMap[id].name) {
          this.menuData.push(overridesMap[id]);
        }
      });
    }

    try {
      const savedOrder = localStorage.getItem('hp_menu_dish_order');
      if (savedOrder) {
        const idOrder = JSON.parse(savedOrder);
        if (Array.isArray(idOrder) && idOrder.length > 0) {
          const map = new Map(this.menuData.map(d => [d.id, d]));
          const reordered = [];
          idOrder.forEach(id => {
            if (map.has(id)) {
              reordered.push(map.get(id));
              map.delete(id);
            }
          });
          map.forEach(d => reordered.push(d));
          this.menuData = reordered;
        }
      }
    } catch (e) {}

    if (!this.menuData || this.menuData.length === 0) {
      this.menuData = initialMenu;
    }

    this.categories = window.HOTEL_PREMIER_CATEGORIES ? [...window.HOTEL_PREMIER_CATEGORIES] : [];
    window.HotelMenuStructure?.apply(this);
    // Reading is not an edit. Re-saving here duplicated large photo data in
    // localStorage and re-broadcast MENU_UPDATED on every receiving tab.
  }

  saveMenuData() {
    try {
      window.HotelMenuStructure?.capture(this);
      // This legacy full-menu cache has no reader. Do not duplicate every photo
      // into it or let its quota failure prevent the actual overrides saving.
      const existingOverrides = localStorage.getItem(this.storageKeyOverrides);
      let overridesMap = existingOverrides ? JSON.parse(existingOverrides) : {};
      this.menuData.forEach(dish => {
        const fields = {
          image: dish.image,
          price: dish.price,
          isSoldOut: dish.isSoldOut,
          notAvailable: Boolean(dish.notAvailable),
          tags: dish.tags,
          variants: dish.variants
        };
        overridesMap[dish.id] = { ...(overridesMap[dish.id] || {}), ...(window.HotelPhotoStorage ? window.HotelPhotoStorage.compact(fields) : fields) };
      });
      localStorage.setItem(this.storageKeyOverrides, JSON.stringify(overridesMap));
      try {
        const idOrder = this.menuData.map(d => d.id);
        localStorage.setItem('hp_menu_dish_order', JSON.stringify(idOrder));
      } catch (e) {}
      this.notifyMenuUpdate();
    } catch (e) {
      console.warn('Could not save to localStorage cache:', e);
    }
  }

  setupBroadcastChannel() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcast = new BroadcastChannel('hotel_premier_sync_channel');
        this.broadcast.onmessage = async (event) => {
          if (event.data && event.data.type === 'MENU_UPDATED') {
            await this.loadMenuData();
            this.renderCategoryCards();
            this.renderMenu();
          }
        };
      }
    } catch (e) {}
  }

  notifyMenuUpdate() {
    if (this.broadcast) {
      try {
        this.broadcast.postMessage({ type: 'MENU_UPDATED', timestamp: Date.now() });
      } catch (e) {}
    }
  }

  // ==================== RESTAURANT MAIN HERO CAROUSEL ====================
  async initHeroCarousel() {
    const defaultSlides = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides)
      ? window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides
      : [];

    if (window.HOTEL_STORAGE) {
      const stored = await window.HOTEL_STORAGE.getSectionSlides('restaurant_hero', null);
      if (stored && Array.isArray(stored) && stored.length > 0 && !stored[0].image.includes('unsplash')) {
        this.heroSlides = stored;
      } else {
        this.heroSlides = defaultSlides;
      }
    } else {
      this.heroSlides = defaultSlides;
    }

    this.renderHeroCarousel();
    this.startHeroAutoSlide();
  }

  renderHeroCarousel() {
    const track = document.getElementById('hero-carousel-track');
    const dotsContainer = document.getElementById('hero-carousel-dots');
    if (!track || !this.heroSlides || this.heroSlides.length === 0) return;

    track.innerHTML = this.heroSlides.map((slide, idx) => {
      if (window.AssetPipeline && typeof window.AssetPipeline.renderHeroSlideMedia === 'function') {
        return window.AssetPipeline.renderHeroSlideMedia(slide, idx);
      }
      return `
        <div class="hero-carousel-slide" data-slide-index="${idx}">
          <img height="675" width="1200" src="${slide.image}" alt="${slide.title || 'Hotel Premier'}" class="hero-carousel-img" loading="${idx === 0 ? 'eager' : 'lazy'}">
          <div class="hero-carousel-overlay">
            <span class="hero-slide-badge" data-i18n="heroBadge">PRIDE PURE VEG AC RESTAURANT</span>
            <h2 class="hero-slide-title">${slide.title || 'Culinary Delights of Hotel Premier'}</h2>
            <p class="hero-slide-subtitle">${slide.subtitle || 'Prepared fresh in standard refined oil • 100% Pure Veg'}</p>
          </div>
        </div>
      `;
    }).join('');

    if (dotsContainer) {
      dotsContainer.innerHTML = this.heroSlides.map((_, idx) => `
        <div class="carousel-dot ${idx === this.currentHeroSlideIndex ? 'active' : ''}" onclick="window.app.goToHeroSlide(${idx})"></div>
      `).join('');
    }

    this.updateHeroSlidePosition();
  }

  updateHeroSlidePosition() {
    const track = document.getElementById('hero-carousel-track');
    if (track) {
      track.style.transform = `translateX(-${this.currentHeroSlideIndex * 100}%)`;
    }
    const dots = document.querySelectorAll('#hero-carousel-dots .carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentHeroSlideIndex);
    });
  }

  nextHeroSlide() {
    if (!this.heroSlides || this.heroSlides.length === 0) return;
    this.currentHeroSlideIndex = (this.currentHeroSlideIndex + 1) % this.heroSlides.length;
    this.updateHeroSlidePosition();
  }

  prevHeroSlide() {
    if (!this.heroSlides || this.heroSlides.length === 0) return;
    this.currentHeroSlideIndex = (this.currentHeroSlideIndex - 1 + this.heroSlides.length) % this.heroSlides.length;
    this.updateHeroSlidePosition();
  }

  goToHeroSlide(index) {
    if (index >= 0 && index < this.heroSlides.length) {
      this.currentHeroSlideIndex = index;
      this.updateHeroSlidePosition();
      this.resetHeroAutoSlide();
    }
  }

  startHeroAutoSlide() {
    if (this.heroAutoInterval) clearInterval(this.heroAutoInterval);
    this.heroAutoInterval = setInterval(() => {
      this.nextHeroSlide();
    }, 4500);
  }

  resetHeroAutoSlide() {
    if (this.heroAutoInterval) clearInterval(this.heroAutoInterval);
    this.startHeroAutoSlide();
  }

  // ==================== SUB-SECTION DISHES MULTI-PHOTO SLIDESHOW ====================
  getSectionDishes(sectionId) {
    const [categoryId, subId] = sectionId.split('::');
    const sub = (window.HOTEL_PREMIER_SUB_CATEGORIES?.[categoryId] || []).find(s => s.id === subId);
    const ids = sub?.dishIds ? new Set(sub.dishIds) : null;
    return this.menuData.filter(d => !d.notAvailable && d.categoryId === categoryId && d.image && d.image.trim() &&
      (ids ? ids.has(d.id) || ids.has(d.groupedUnder) : !d.groupedUnder)).slice(0, 5);
  }

  async renderSectionSlideshow(catId) {
    const renderId = this.sectionRenderId = (this.sectionRenderId || 0) + 1;
    const container = document.getElementById('section-slideshow-container');
    if (!container) return;

    if (this.sectionAutoInterval) {
      clearInterval(this.sectionAutoInterval);
      this.sectionAutoInterval = null;
    }

    if (!catId || catId === 'all') {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    // 1. Check custom saved slides for this category
    let slides = null;
    if (window.HOTEL_STORAGE) {
      const subId = this.activeSubCategories[catId];
      const sectionId = subId && subId !== 'all' ? `${catId}::${subId}` : catId;
      slides = await window.HOTEL_STORAGE.getSectionSlides('category_' + sectionId, null);
    }

    if (renderId !== this.sectionRenderId) return;
    // Use a stable sequence so photos and captions keep the same order.
    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      const subId = this.activeSubCategories[catId];
      const dishes = this.getSectionDishes(subId && subId !== 'all' ? `${catId}::${subId}` : catId);
      // Shuffle and pick random 4-5 dishes from this section to display in the banner
      const shuffledDishes = [...dishes].filter(d => !d.groupedUnder);
      const selectedDishes = shuffledDishes.slice(0, Math.min(5, shuffledDishes.length));

      slides = selectedDishes.map(d => ({
        id: d.id,
        dishId: d.id,
        name: d.name,
        title: d.name,
        price: d.price,
        image: d.image,
        badge: (d.tags && d.tags.includes('chef-special'))
          ? this.t('badgeChefSpecial', "👑 Chef's Special")
          : ((d.tags && d.tags.includes('bestseller'))
            ? this.t('badgeBestseller', '🔥 Bestseller')
            : this.t('sectionHighlight', '👑 SECTION HIGHLIGHT')),
        subtitle: d.description || this.t('tapToViewDish', '👆 Tap to view dish details & options')
      }));
    }

    if (slides.length < 1) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    this.sectionSlides = slides;
    this.currentSectionSlideIndex = 0;

    container.style.display = 'block';
    container.innerHTML = `
      <div class="section-slideshow-banner" id="active-section-carousel">
        <div class="section-slideshow-track" id="section-slides-track">
          ${slides.map((slide, idx) => {
            if (window.AssetPipeline && typeof window.AssetPipeline.renderSectionSlideMedia === 'function') {
              return window.AssetPipeline.renderSectionSlideMedia(slide, idx);
            }
            return `
              <div class="section-slide-card" onclick="${slide.dishId ? `window.app.openDishDetail('${slide.dishId}')` : ''}">
                <img height="900" width="1200" src="${slide.image}" alt="${slide.name || slide.title}" class="section-slide-img" loading="${idx === 0 ? 'eager' : 'lazy'}" onerror="this.onerror=null; this.src='assets/premier-original-logo.png'">
                <div class="section-slide-overlay">
                  <div class="section-slide-badge-row">
                    <span class="section-slide-badge">${slide.badge || this.t('sectionHighlight', '👑 SECTION HIGHLIGHT')}</span>
                  </div>
                  <div class="section-slide-title-row">
                    <div>
                      <h3 class="section-slide-title">${slide.name || slide.title}</h3>
                      <div class="section-slide-action-hint">${slide.subtitle || this.t('tapToViewDish', '👆 Tap to view dish details & options')}</div>
                    </div>
                    ${slide.price !== undefined ? `<span class="section-slide-price-pill">₹${slide.price}/-</span>` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${slides.length > 1 ? `
          <button class="carousel-nav-btn prev" onclick="window.app.prevSectionSlide(event)" aria-label="Previous Dish Slide">‹</button>
          <button class="carousel-nav-btn next" onclick="window.app.nextSectionSlide(event)" aria-label="Next Dish Slide">›</button>
          <div class="carousel-dots-container" id="section-carousel-dots">
            ${slides.map((_, idx) => `
              <div class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="window.app.goToSectionSlide(${idx}, event)"></div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    this.updateSectionSlidePosition();
    if (slides.length > 1) {
      this.startSectionAutoSlide();
    }
  }

  updateSectionSlidePosition() {
    const track = document.getElementById('section-slides-track');
    if (track && this.sectionSlides) {
      track.style.transform = `translateX(-${this.currentSectionSlideIndex * 100}%)`;
    }
    const dots = document.querySelectorAll('#section-carousel-dots .carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentSectionSlideIndex);
    });
  }

  nextSectionSlide(e) {
    if (e) e.stopPropagation();
    if (!this.sectionSlides || this.sectionSlides.length === 0) return;
    this.currentSectionSlideIndex = (this.currentSectionSlideIndex + 1) % this.sectionSlides.length;
    this.updateSectionSlidePosition();
  }

  prevSectionSlide(e) {
    if (e) e.stopPropagation();
    if (!this.sectionSlides || this.sectionSlides.length === 0) return;
    this.currentSectionSlideIndex = (this.currentSectionSlideIndex - 1 + this.sectionSlides.length) % this.sectionSlides.length;
    this.updateSectionSlidePosition();
  }

  goToSectionSlide(index, e) {
    if (e) e.stopPropagation();
    if (index >= 0 && index < this.sectionSlides.length) {
      this.currentSectionSlideIndex = index;
      this.updateSectionSlidePosition();
      this.resetSectionAutoSlide();
    }
  }

  startSectionAutoSlide() {
    if (this.sectionAutoInterval) clearInterval(this.sectionAutoInterval);
    this.sectionAutoInterval = setInterval(() => {
      if (document.hidden || document.body.classList.contains('modal-open')) return;
      this.nextSectionSlide();
    }, 4000);
  }

  resetSectionAutoSlide() {
    if (this.sectionAutoInterval) clearInterval(this.sectionAutoInterval);
    this.startSectionAutoSlide();
  }

  // ==================== HOTEL ROOMS MULTI-PHOTO CAROUSELS ====================
  async renderRoomCarousels() {
    const rooms = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories)
      ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories
      : [];

    for (const room of rooms) {
      const defaultImgs = (room.images && room.images.length > 0) ? room.images : [room.image];
      let images = defaultImgs;

      if (window.HOTEL_STORAGE) {
        images = await window.HOTEL_STORAGE.getRoomGallery(room.id, defaultImgs);
      }
      this.roomGalleries[room.id] = images;

      const track = document.getElementById(`room-track-${room.id}`);
      const counter = document.getElementById(`room-counter-${room.id}`);
      const dotsContainer = document.getElementById(`room-dots-${room.id}`);

      if (track) {
        track.innerHTML = images.map((imgUrl, idx) => {
          if (window.AssetPipeline && typeof window.AssetPipeline.renderRoomMedia === 'function') {
            return window.AssetPipeline.renderRoomMedia(imgUrl, room, idx);
          }
          return `
            <div class="room-carousel-slide hp-room-pedestal">
              <div class="hp-room-frame">
                <img height="900" width="1200" src="${imgUrl}" alt="${room.name} Photo ${idx + 1}" class="room-card-img" loading="lazy" onerror="this.onerror=null; this.src='${room.image}'">
                <div class="hp-room-vignette"></div>
              </div>
            </div>
          `;
        }).join('');
      }

      const activeIdx = this.roomSlideIndices[room.id] || 0;
      if (counter) {
        counter.innerText = `${activeIdx + 1} / ${images.length}`;
      }

      if (dotsContainer) {
        dotsContainer.innerHTML = images.map((_, idx) => `
          <div class="room-dot ${idx === activeIdx ? 'active' : ''}" onclick="window.app.goToRoomSlide('${room.id}', ${idx}, event)"></div>
        `).join('');
      }

      this.updateRoomSlidePosition(room.id);
    }
  }

  updateRoomSlidePosition(roomId) {
    const track = document.getElementById(`room-track-${roomId}`);
    const activeIdx = this.roomSlideIndices[roomId] || 0;
    const images = this.roomGalleries[roomId] || [];

    if (track) {
      track.style.transform = `translateX(-${activeIdx * 100}%)`;
    }

    const counter = document.getElementById(`room-counter-${roomId}`);
    if (counter && images.length > 0) {
      counter.innerText = `${activeIdx + 1} / ${images.length}`;
    }

    const dots = document.querySelectorAll(`#room-dots-${roomId} .room-dot`);
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeIdx);
    });
  }

  nextRoomSlide(roomId, e) {
    if (e) e.stopPropagation();
    let images = this.roomGalleries[roomId];
    if (!images || images.length === 0) {
      const room = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories)
        ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories.find(r => r.id === roomId)
        : null;
      if (room) images = (room.images && room.images.length > 0) ? room.images : [room.image];
    }
    if (!images || images.length <= 1) return;
    this.roomGalleries[roomId] = images;
    this.roomSlideIndices[roomId] = ((this.roomSlideIndices[roomId] || 0) + 1) % images.length;
    this.updateRoomSlidePosition(roomId);
  }

  prevRoomSlide(roomId, e) {
    if (e) e.stopPropagation();
    let images = this.roomGalleries[roomId];
    if (!images || images.length === 0) {
      const room = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories)
        ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories.find(r => r.id === roomId)
        : null;
      if (room) images = (room.images && room.images.length > 0) ? room.images : [room.image];
    }
    if (!images || images.length <= 1) return;
    this.roomGalleries[roomId] = images;
    this.roomSlideIndices[roomId] = ((this.roomSlideIndices[roomId] || 0) - 1 + images.length) % images.length;
    this.updateRoomSlidePosition(roomId);
  }

  goToRoomSlide(roomId, index, e) {
    if (e) e.stopPropagation();
    const images = this.roomGalleries[roomId] || [];
    if (index >= 0 && index < images.length) {
      this.roomSlideIndices[roomId] = index;
      this.updateRoomSlidePosition(roomId);
    }
  }

  // ==================== 1. HOME CULINARY COLLECTIONS ====================
  filterCulinaryTheme(theme) {
    this.currentCulinaryTheme = theme || 'all';
    document.querySelectorAll('.culinary-theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === this.currentCulinaryTheme);
    });
    this.renderCategoryCards();
  }

  renderCategoryCards() {
    const container = document.getElementById('category-cards-grid');
    if (!container) return;

    if (!this.categories || this.categories.length === 0) {
      this.categories = window.HOTEL_PREMIER_CATEGORIES ? [...window.HOTEL_PREMIER_CATEGORIES] : [];
    }

    const allCategories = this.categories.filter(c => c.id !== 'all' && c.id !== 'chef-specials');
    const itemsWord = this.t('itemsCount', 'Items');
    const viewWord = this.t('viewSection', 'Explore Collection →');

    const themeMap = {
      'breakfast': ['morning-delights', 'hot-hearty'],
      'starters': ['tandoor-classics', 'indo-chinese', 'tasty-tidbits', 'premier-soups'],
      'curries': ['paneer-specialties', 'vegetable-specialties', 'kofta-delights', 'flavorful-dals', 'delivery-thalis'],
      'grains': ['rice-biryani', 'signature-breads', 'sizzling-rice-noodles', 'pasta-section'],
      'desserts': ['mithai-magic', 'frozen-fantasies', 'mocktails', 'milkshake-mastani', 'chilled-beverages', 'fresh-addons']
    };

    let displayCats = allCategories;
    if (this.currentCulinaryTheme && this.currentCulinaryTheme !== 'all' && themeMap[this.currentCulinaryTheme]) {
      displayCats = allCategories.filter(c => themeMap[this.currentCulinaryTheme].includes(c.id));
    }

    container.innerHTML = displayCats.map(cat => {
      const catDishes = this.menuData.filter(d => !d.notAvailable && d.categoryId === cat.id);
      const count = catDishes.length;
      const localizedTitle = this.getCategoryLocalizedName(cat.id);
      const localizedSubtitle = this.getCategoryLocalizedSubtitle(cat.id);
      const localizedDesc = this.getCategoryLocalizedDesc(cat.id);

      // Extract 2 to 3 representative star dishes for rich culinary preview
      let starDishes = catDishes
        .filter(d => d.tags && (d.tags.includes('bestseller') || d.tags.includes('chef-special') || d.tags.includes('swiggy-top')))
        .slice(0, 3)
        .map(d => d.name);
      if (starDishes.length < 2 && catDishes.length > 0) {
        catDishes.slice(0, 3).forEach(d => {
          if (!starDishes.includes(d.name)) starDishes.push(d.name);
        });
      }
      starDishes = starDishes.slice(0, 3);

      return `
        <article class="category-card" onclick="window.app.openCategorySection('${cat.id}')" role="button" tabindex="0" aria-label="Browse ${localizedTitle}">
          ${(window.AssetPipeline && typeof window.AssetPipeline.renderCategoryCardMedia === 'function')
            ? window.AssetPipeline.renderCategoryCardMedia(cat, count, itemsWord, localizedTitle)
            : `
            <div class="category-card-media">
              <img height="900" width="1200"
                src="${cat.image}"
                alt="${localizedTitle}"
                class="category-card-img"
                loading="lazy"
                onerror="this.onerror=null; this.src='assets/premier-original-logo.png'"
              >
              <div class="category-card-overlay" aria-hidden="true"></div>
              <div class="category-crest-emblem" aria-hidden="true">${cat.icon || '🍽️'}</div>
              <span class="category-card-badge">${count} ${itemsWord}</span>
            </div>
            `}
          <div class="category-card-content">
            <div class="category-card-body-text">
              <div class="category-card-header-row">
                <h3 class="category-card-title">${localizedTitle}</h3>
                ${(this.currentLang !== 'en' && localizedSubtitle) ? `<span class="category-card-hindi">${localizedSubtitle}</span>` : ''}
              </div>
              <p class="category-card-desc">${localizedDesc || 'Fresh & pure veg delicacies prepared to order.'}</p>
              ${starDishes.length > 0 ? `
                <div class="category-star-chips">
                  ${starDishes.map(dName => `<span class="star-chip">✦ ${dName}</span>`).join('')}
                </div>
              ` : ''}
            </div>
            <div class="category-card-footer">
              <span class="category-card-action">${viewWord}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  scrollCategoryToView() {
    // Scroll directly to the category navigation bar or menu container
    const target = document.getElementById('category-nav-bar') || document.getElementById('menu-container') || document.getElementById('dishes-section-view');
    if (target) {
      const headerOffset = 140;
      const rect = target.getBoundingClientRect();
      const targetScrollY = rect.top + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: 'smooth'
      });
    }
  }

  scrollCollectionsToView() {
    const target = document.getElementById('culinary-theme-bar') || document.getElementById('category-cards-grid') || document.getElementById('home-categories-view');
    if (target) {
      const headerOffset = 140;
      const rect = target.getBoundingClientRect();
      const targetScrollY = rect.top + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: 'smooth'
      });
    }
  }

  scrollDiningToView() {
    const dineEl = document.getElementById('section-dine');
    if (dineEl) {
      const headerOffset = 140;
      const elPos = dineEl.getBoundingClientRect().top;
      window.scrollTo({
        top: elPos + window.pageYOffset - headerOffset,
        behavior: 'smooth'
      });
    }
  }

  openCategorySection(catId) {
    this.clearMenuFavoritesScope();
    if (window.HOTEL_VAULT) {
      window.HOTEL_VAULT.recordCategoryClick(catId);
    }

    // Ensure dining section is actively rendered & unhidden
    if (this.activeSection !== 'section-dine') {
      this.switchSection('section-dine', false);
    }

    this.currentCategory = catId;
    this.viewMode = 'section';
    this.currentFilter = 'all';
    this.searchQuery = '';

    const searchInput = document.getElementById('menu-search-input');
    const clearSearch = document.getElementById('clear-search-btn');
    if (searchInput) searchInput.value = '';
    if (clearSearch) clearSearch.style.display = 'none';

    const homeView = document.getElementById('home-categories-view');
    const dishesView = document.getElementById('dishes-section-view');
    if (homeView) homeView.style.display = 'none';
    if (dishesView) dishesView.style.display = 'block';

    const btnAll = document.getElementById('btn-mode-all-dishes');
    const btnCats = document.getElementById('btn-mode-categories');
    if (btnAll) btnAll.classList.remove('active');
    if (btnCats) btnCats.classList.remove('active');

    const titleEl = document.getElementById('active-category-title');
    const hindiEl = document.getElementById('active-category-hindi');
    const countEl = document.getElementById('active-category-count');
    const catDishes = this.menuData.filter(d => !d.notAvailable && d.categoryId === catId);
    const itemsWord = this.t('itemsCount', 'Items');

    if (titleEl) titleEl.innerText = this.getCategoryLocalizedName(catId);
    if (hindiEl) {
      if (this.currentLang === 'en') {
        hindiEl.style.display = 'none';
        hindiEl.innerText = '';
      } else {
        const sub = this.getCategoryLocalizedSubtitle(catId);
        if (sub) {
          hindiEl.style.display = 'block';
          hindiEl.innerText = sub;
        } else {
          hindiEl.style.display = 'none';
        }
      }
    }
    if (countEl) countEl.innerText = `${catDishes.length} ${itemsWord}`;

    this.renderQuickFilters();
    this.renderCategories();
    this.renderSectionSlideshow(catId);
    this.renderMenu();

    // Smoothly scroll directly into category heading so user immediately sees dishes!
    this.scrollCategoryToView();
  }

  showHomeCategories() {
    // The unified menu replaced the old category-card home screen.
    if (!document.getElementById('home-categories-view')) {
      this.showAllDishesView();
      return;
    }
    if (this.activeSection !== 'section-dine') {
      this.switchSection('section-dine', false);
    }

    this.viewMode = 'home';
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.currentFilter = 'all';

    const searchInput = document.getElementById('menu-search-input');
    const clearSearch = document.getElementById('clear-search-btn');
    if (searchInput) searchInput.value = '';
    if (clearSearch) clearSearch.style.display = 'none';

    const homeView = document.getElementById('home-categories-view');
    const dishesView = document.getElementById('dishes-section-view');
    if (homeView) homeView.style.display = 'block';
    if (dishesView) dishesView.style.display = 'none';

    const btnAll = document.getElementById('btn-mode-all-dishes');
    const btnCats = document.getElementById('btn-mode-categories');
    if (btnAll) btnAll.classList.remove('active');
    if (btnCats) btnCats.classList.add('active');

    this.renderSectionSlideshow(null);
    this.renderQuickFilters();
    this.renderCategoryCards();
    this.renderCategories();

    // Smoothly return view to the culinary collections grid
    this.scrollCollectionsToView();
  }

  showAllDishesView() {
    this.clearMenuFavoritesScope();
    this.activeSubCategories = {};
    if (this.activeSection !== 'section-dine') {
      this.switchSection('section-dine', false);
    }

    this.currentCategory = 'all';
    this.viewMode = 'all';
    this.currentFilter = 'all';
    this.searchQuery = '';

    const searchInput = document.getElementById('menu-search-input');
    const clearSearch = document.getElementById('clear-search-btn');
    if (searchInput) searchInput.value = '';
    if (clearSearch) clearSearch.style.display = 'none';

    const homeView = document.getElementById('home-categories-view');
    const dishesView = document.getElementById('dishes-section-view');
    if (homeView) homeView.style.display = 'none';
    if (dishesView) dishesView.style.display = 'block';

    const btnAll = document.getElementById('btn-mode-all-dishes');
    const btnCats = document.getElementById('btn-mode-categories');
    if (btnAll) btnAll.classList.add('active');
    if (btnCats) btnCats.classList.remove('active');

    const titleEl = document.getElementById('active-category-title');
    const hindiEl = document.getElementById('active-category-hindi');
    const countEl = document.getElementById('active-category-count');
    const itemsWord = this.t('itemsCount', 'Items');

    if (titleEl) titleEl.innerText = this.t('allMenuTitle', 'All Dishes (Full Menu)');
    if (hindiEl) hindiEl.innerText = this.t('allMenuSubtitle', 'All Pure Veg Categories & Dishes');
    if (countEl) countEl.innerText = `${this.menuData.filter(d => !d.notAvailable).length} ${itemsWord}`;

    this.renderQuickFilters();
    this.renderCategories();
    this.renderSectionSlideshow(null);
    this.renderMenu();

    this.scrollCategoryToView();
  }

  // ==================== 2. DISHES & CATEGORIES RENDERING ====================
  renderCategories() {
    const container = document.getElementById('category-chips-container');
    if (!container) return;

    if (!this.categories || this.categories.length === 0) {
      this.categories = window.HOTEL_PREMIER_CATEGORIES ? [...window.HOTEL_PREMIER_CATEGORIES] : [];
    }

    const allChips = [
      { id: 'all', name: 'All Items', icon: '🍽️' },
      ...this.categories.filter(c => c.id !== 'all')
    ];

    container.innerHTML = allChips.map(cat => {
      const name = (cat.id === 'all') ? this.t('filterAll', 'All Items') : this.getCategoryLocalizedName(cat.id);
      const icon = cat.icon || '';
      return `
        <button class="category-chip ${this.currentCategory === cat.id ? 'active' : ''}" data-cat-id="${cat.id}">
          ${icon ? `<span class="chip-icon">${icon}</span>` : ''}
          <span>${name}</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.category-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-cat-id');
        if (catId === 'all') {
          this.showAllDishesView();
        } else {
          this.openCategorySection(catId);
        }
      });
    });

    // Auto-center the active category chip in view
    setTimeout(() => {
      const activeChip = container.querySelector('.category-chip.active');
      if (activeChip) {
        activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 60);

    this.setupCategoryNavDrag();
  }

  scrollCategoryNav(offset) {
    const wrapper = document.getElementById('category-nav-scroll-wrapper');
    if (wrapper) {
      wrapper.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  setupCategoryNavDrag() {
    const wrapper = document.getElementById('category-nav-scroll-wrapper');
    if (!wrapper || wrapper.dataset.dragInitialized) return;
    wrapper.dataset.dragInitialized = 'true';

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    wrapper.addEventListener('mousedown', (e) => {
      isDown = true;
      wrapper.classList.add('dragging');
      startX = e.pageX - wrapper.offsetLeft;
      scrollLeft = wrapper.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        wrapper.classList.remove('dragging');
      }
    });

    wrapper.addEventListener('mouseleave', () => {
      if (isDown) {
        isDown = false;
        wrapper.classList.remove('dragging');
      }
    });

    wrapper.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - wrapper.offsetLeft;
      const walk = (x - startX) * 1.6;
      wrapper.scrollLeft = scrollLeft - walk;
    });

    // Support horizontal scroll with mouse wheel
    wrapper.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        wrapper.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  // ==================== FULL MENU SUB-SECTIONS SWITCHER DRAWER ====================
  renderMenuSectionDrawer() {
    const list = document.getElementById('drawer-sections-list');
    if (!list) return;

    if (!this.categories || this.categories.length === 0) {
      this.categories = window.HOTEL_PREMIER_CATEGORIES ? [...window.HOTEL_PREMIER_CATEGORIES] : [];
    }

    const validCategories = this.categories.filter(c => c.id !== 'all' && c.id !== 'chef-specials');
    const floatBadge = document.getElementById('floating-sections-count');
    if (floatBadge) {
      floatBadge.innerText = validCategories.length;
    }

    const visibleMenu=this.getVisibleMenuItems();
    const allDishesCount = visibleMenu.length;
    const isAllActive = (this.currentCategory === 'all' && this.viewMode === 'all');
    const dishesWord = this.t('itemsCount', 'Items');

    const items = [
      {
        id: 'all',
        name: this.t('filterAll', 'All Dishes'),
        subtitle: `Complete Pure Veg Menu • All ${allDishesCount} Curated Dishes`,
        icon: '🍽️',
        image: 'assets/menu-images/veg-specialities/veg-pride-special-1.jpg',
        count: allDishesCount,
        isActive: isAllActive,
        isAll: true
      },
      ...validCategories.map(cat => {
        const catDishes = visibleMenu.filter(d => d.categoryId === cat.id);
        const localizedTitle = this.getCategoryLocalizedName(cat.id);
        const localizedSubtitle = this.getCategoryLocalizedSubtitle(cat.id);
        const localizedDesc = this.getCategoryLocalizedDesc(cat.id);
        const isActive = (this.currentCategory === cat.id && this.viewMode === 'section');

        let displaySub = localizedSubtitle;
        if (displaySub && cat.description) {
          displaySub += ` • ${cat.description}`;
        } else if (!displaySub) {
          displaySub = localizedDesc || 'Fresh & pure veg delicacies';
        }

        return {
          id: cat.id,
          name: localizedTitle,
          subtitle: displaySub,
          icon: cat.icon || '🍽️',
          image: cat.image,
          count: catDishes.length,
          isActive: isActive,
          isAll: false
        };
      })
    ];

    list.innerHTML = items.map(item => `
      <button type="button" class="drawer-section-item ${item.isActive ? 'active' : ''} ${item.isAll ? 'all-items-row' : ''}"
           aria-current="${item.isActive ? 'true' : 'false'}"
           data-section-id="${item.id}"
           onclick="window.app.selectCategoryFromDrawer('${item.id}')">
        <div class="drawer-item-icon-emblem">
          <span class="drawer-emblem-glyph">${item.icon}</span>
        </div>
        <div class="drawer-item-content">
          <div class="drawer-item-title-row">
            <h4 class="drawer-item-title">${item.name}</h4>
            ${item.isActive ? '<span class="drawer-active-pill">✓ CURRENT</span>' : ''}
          </div>
          <p class="drawer-item-sub">${item.subtitle}</p>
        </div>
        <div class="drawer-item-meta">
          <span class="drawer-item-count">${item.count} ${dishesWord}</span>
          <span class="drawer-item-arrow">→</span>
        </div>
      </button>
    `).join('');
  }

  toggleMenuSectionDrawer() {
    const modal = document.getElementById('menu-sections-drawer-modal');
    if (!modal) return;
    if (modal.classList.contains('active')) {
      this.closeMenuSectionDrawer();
    } else {
      this.openMenuSectionDrawer();
    }
  }

  openMenuSectionDrawer() {
    this.haptic(10);
    const modal = document.getElementById('menu-sections-drawer-modal');
    if (!modal) return;
    this.renderMenuSectionDrawer();
    this.filterDrawerByGroup('all');
    if (!modal.classList.contains('active')) {
      this.menuDrawerOpener = document.activeElement;
    }
    modal.classList.add('active');
    modal.style.display = 'flex';
    const list = document.getElementById('drawer-sections-list');
    if (list) list.scrollTop = 0; // Reset only after the sheet participates in layout.
    document.getElementById('floating-menu-toggle-btn')?.setAttribute('aria-expanded', 'true');
    const searchInput = document.getElementById('drawer-sections-search');
    if (searchInput) {
      searchInput.value = '';
      const clearBtn = document.getElementById('drawer-clear-search-btn');
      if (clearBtn) clearBtn.style.display = 'none';
      clearTimeout(this.menuDrawerFocusTimer);
      this.menuDrawerFocusTimer = setTimeout(() => {
        if (!modal.classList.contains('active')) return;
        const touch = window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 600;
        (touch ? modal.querySelector('.modal-close-btn') : searchInput)?.focus({ preventScroll:true });
      }, 150);
    }
  }

  closeMenuSectionDrawer({ restoreFocus = true } = {}) {
    this.haptic(5);
    document.getElementById('floating-menu-toggle-btn')?.setAttribute('aria-expanded', 'false');
    clearTimeout(this.menuDrawerFocusTimer);
    const modal = document.getElementById('menu-sections-drawer-modal');
    if (!modal || !modal.classList.contains('active')) return;
    modal.classList.remove('active');
    modal.style.display = 'none';
    if (!restoreFocus && modal.contains?.(document.activeElement)) document.activeElement.blur?.();
    if (restoreFocus && this.menuDrawerOpener?.isConnected) this.menuDrawerOpener.focus({ preventScroll:true });
    this.menuDrawerOpener = null;
  }

  selectCategoryFromDrawer(catId) {
    clearTimeout(this.drawerNavigationTimer);
    this.closeMenuSectionDrawer();
    this.currentFilter = 'all';
    this.searchQuery = '';
    const searchInput = document.getElementById('menu-search-input');
    const clearSearch = document.getElementById('clear-search-btn');
    if (searchInput) searchInput.value = '';
    if (clearSearch) clearSearch.style.display = 'none';

    if (catId === 'all') {
      this.showAllDishesView();
    } else {
      this.openCategorySection(catId);
    }

    this.drawerNavigationTimer = setTimeout(() => {
      if (this.activeSection !== 'section-dine') return;
      let target = null;
      if (catId !== 'all') {
        target = document.getElementById(`section-${catId}`);
      }
      if (!target) {
        target = document.getElementById('category-nav-bar') || document.getElementById('menu-container');
      }
      if (target) {
        const headerOffset = (document.querySelector('.app-header')?.getBoundingClientRect().height || 118) + 12;
        const rect = target.getBoundingClientRect();
        const targetScrollY = rect.top + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, targetScrollY),
          behavior: 'smooth'
        });
      }
    }, 120);
  }

  filterDrawerSections(query) {
    // Text search spans every category; do not leave a stale group selected.
    document.querySelectorAll('#drawer-quick-filter-chips .drawer-qf-chip').forEach(chip => {
      const selected = (chip.getAttribute('onclick') || '').includes("'all'");
      chip.classList.toggle('active', selected);
      chip.setAttribute('aria-pressed', String(selected));
    });
    const q = (query || '').toLowerCase().trim();
    const clearBtn = document.getElementById('drawer-clear-search-btn');
    if (clearBtn) {
      clearBtn.style.display = q ? 'block' : 'none';
    }
    const rows = document.querySelectorAll('#drawer-sections-list .drawer-section-item');
    rows.forEach(row => {
      if (!q) {
        row.style.display = '';
        return;
      }
      const title = row.querySelector('.drawer-item-title') ? row.querySelector('.drawer-item-title').innerText.toLowerCase() : '';
      const sub = row.querySelector('.drawer-item-sub') ? row.querySelector('.drawer-item-sub').innerText.toLowerCase() : '';
      const sectionId = (row.getAttribute('data-section-id') || '').toLowerCase();
      const isVegMatch = (q === 'veg' || q === 'vegetable' || q === 'mains' || q === 'sabji' || q === 'bhaji') &&
        (sectionId.includes('veg') || sectionId.includes('paneer') || sectionId.includes('kofta'));

      if (title.includes(q) || sub.includes(q) || sectionId.includes(q) || isVegMatch) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
    this.updateDrawerStatus();
  }

  filterDrawerByGroup(groupKey) {
    const search = document.getElementById('drawer-sections-search');
    if (search) search.value = '';
    const clear = document.getElementById('drawer-clear-search-btn');
    if (clear) clear.style.display = 'none';
    const chips = document.querySelectorAll('#drawer-quick-filter-chips .drawer-qf-chip');
    chips.forEach(chip => { chip.classList.remove('active'); chip.setAttribute('aria-pressed', 'false'); });
    const clickedChip = Array.from(chips).find(c => {
      const onclickAttr = c.getAttribute('onclick') || '';
      return onclickAttr.includes(`'${groupKey}'`);
    });
    if (clickedChip) { clickedChip.classList.add('active'); clickedChip.setAttribute('aria-pressed', 'true'); }

    const groupMap = {
      all: null,
      breakfast: ['morning-delights', 'hot-hearty', 'tasty-tidbits', 'premier-soups', 'indo-chinese', 'tandoor-classics', 'pasta-section'],
      main: ['vegetable-specialties', 'veg-specialties', 'kofta-delights', 'paneer-specialties', 'signature-breads', 'tandoor-rotis', 'khandeshi-specialties', 'thali-combos', 'delivery-thalis'],
      rice: ['flavorful-dals', 'rice-biryani', 'fresh-addons', 'sizzling-rice-noodles', 'sides-accompaniments'],
      beverages: ['mithai-magic', 'frozen-fantasies', 'desserts', 'mocktails', 'milkshake-mastani', 'chilled-beverages']
    };

    const allowed = groupMap[groupKey];
    const rows = document.querySelectorAll('#drawer-sections-list .drawer-section-item');
    rows.forEach(row => {
      const sectionId = row.getAttribute('data-section-id');
      if (!allowed || sectionId === 'all' || allowed.includes(sectionId)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
    this.updateDrawerStatus();
  }

  updateDrawerStatus() {
    const list = document.getElementById('drawer-sections-list');
    if (list) list.scrollTop = 0;
    const status = document.getElementById('drawer-results-status');
    if (!status) return;
    const visible = [...document.querySelectorAll('#drawer-sections-list .drawer-section-item')].filter(row => row.style.display !== 'none');
    const count = visible.filter(row => row.getAttribute('data-section-id') !== 'all').length;
    status.textContent = count ? `${count} ${count === 1 ? 'collection' : 'collections'}`
      : visible.some(row => row.getAttribute('data-section-id') === 'all') ? 'All menu items'
      : 'No collections found. Try another name or clear your search.';
  }

  renderQuickFilters() {
    const filters = [
      { id: 'all', labelKey: 'filterAll', icon: '🍽️' },
      { id: 'top-rated', labelKey: 'filterTopRated', icon: '' },
      { id: 'chef-special', labelKey: 'filterChefSpecial', icon: '👑' },
      { id: 'bestseller', labelKey: 'filterBestseller', icon: '🔥' },
      { id: 'khandeshi', labelKey: 'filterKhandeshi', icon: '🌶️' },
      { id: 'under-150', labelKey: 'filterUnder150', icon: '💰' }
    ];

    const container = document.getElementById('quick-filters-container');
    if (!container) return;

    const primaryIds = ['all', 'bestseller', 'chef-special'];
    const renderFilter = f => `
      <button type="button" class="filter-pill ${this.currentFilter === f.id ? 'active' : ''}" data-filter-id="${f.id}" aria-pressed="${this.currentFilter === f.id}">
        ${f.icon ? `<span>${f.icon}</span>` : ''}
        <span>${this.t(f.labelKey)}</span>
      </button>
    `;
    const extraFilters = filters.filter(f => !primaryIds.includes(f.id));
    const activeExtra = extraFilters.find(f => f.id === this.currentFilter);
    container.innerHTML = primaryIds.map(id => renderFilter(filters.find(f => f.id === id))).join('') + `
      <details class="more-menu-filters" ${activeExtra ? 'open' : ''}>
        <summary>${this.t('filterMore', 'More filters')}${activeExtra ? ' •' : ''}</summary>
        <div class="more-menu-filters-options">${extraFilters.map(renderFilter).join('')}</div>
      </details>`;

    container.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const fId = btn.getAttribute('data-filter-id');
        this.currentFilter = fId;
        if (window.HOTEL_VAULT && fId !== 'all') {
          window.HOTEL_VAULT.recordFilterClick(fId);
        }
        this.renderQuickFilters();

        if (fId !== 'all') {
          this.viewMode = 'section';
          const homeView = document.getElementById('home-categories-view');
          const dishesView = document.getElementById('dishes-section-view');
          if (homeView) homeView.style.display = 'none';
          if (dishesView) dishesView.style.display = 'block';

          const titleEl = document.getElementById('active-category-title');
          const hindiEl = document.getElementById('active-category-hindi');
          const countEl = document.getElementById('active-category-count');
          if (titleEl) titleEl.innerText = btn.innerText;
          if (hindiEl) {
            if (this.currentLang === 'en') {
              hindiEl.style.display = 'none';
              hindiEl.innerText = '';
            } else {
              hindiEl.style.display = 'block';
              hindiEl.innerText = this.t('filterAll', 'Filter Results');
            }
          }

          const filtered = this.getFilteredDishes();
          const itemsWord = this.t('itemsCount', 'Items');
          if (countEl) countEl.innerText = `${filtered.length} ${itemsWord}`;

          this.renderSectionSlideshow(null);
          this.renderMenu();
        } else if (this.viewMode === 'home') {
          this.showHomeCategories();
        } else {
          this.renderMenu();
        }
      });
    });
  }

  getVisibleMenuItems() {
    return (this.menuData || []).filter(item=>!item.notAvailable && !item.groupedUnder && !(item.variants?.length && item.variants.every(v=>v.hidden)));
  }

  getFilteredDishes() {
    if (!this.menuData || this.menuData.length === 0) {
      if (window.HotelMenuStructure?.hasDraft()) return [];
      if (window.HOTEL_PREMIER_INITIAL_MENU && window.HOTEL_PREMIER_INITIAL_MENU.length > 0) {
        this.menuData = [...window.HOTEL_PREMIER_INITIAL_MENU];
      } else {
        return [];
      }
    }

    const hasSearch = Boolean(this.searchQuery && this.searchQuery.trim() !== '');

    return (this.isFavoritesFilterActive ? this.getFavoriteItems() : this.menuData).filter(item => {
      if (item.notAvailable) return false;
      if (item.groupedUnder) return false;
      if (item.variants?.length && item.variants.every(v => v.hidden)) return false;

      // Filter by favorites when Favorites mode is active
      if (this.isFavoritesFilterActive) {
        if (!this.favorites || !this.favorites.includes(item.id)) return false;
      }

      if (this.currentCategory === 'chef-specials') {
        if (!item.tags || !item.tags.includes('chef-special')) return false;
      } else if (this.currentCategory && this.currentCategory !== 'all') {
        if (item.categoryId !== this.currentCategory) return false;
      }

      if (this.currentFilter === 'top-rated') {
        const isZomato = (item.tags && item.tags.includes('zomato-top')) || Boolean(item.zomatoRating);
        if (!isZomato) return false;
      }
      if (this.currentFilter === 'chef-special' && (!item.tags || !item.tags.includes('chef-special'))) return false;
      if (this.currentFilter === 'bestseller' && (!item.tags || !item.tags.includes('bestseller'))) return false;
      if (this.currentFilter === 'khandeshi' && (!item.tags || !item.tags.includes('khandeshi-special'))) return false;
      const visibleVariants = (item.variants || []).filter(v=>!v.hidden);
      const visiblePrices=visibleVariants.length ? visibleVariants.map(v=>v.price) : [item.price];
      if (this.currentFilter === 'under-150' && !visiblePrices.some(price=>Number.isFinite(price) && price>=0 && price<=150)) return false;

      if (hasSearch) {
        const q = this.searchQuery.toLowerCase().trim();
        const matchName = [item.name,item.hindiName,item.marathiName].some(name=>typeof name==='string' && name.toLowerCase().includes(q));
        const matchDesc = (item.description && item.description.toLowerCase().includes(q)) || (item.descriptionHi && item.descriptionHi.toLowerCase().includes(q)) || (item.descriptionMr && item.descriptionMr.toLowerCase().includes(q));
        const matchTag = item.tags && item.tags.some(t => t.toLowerCase().includes(q));
        const matchVariant = visibleVariants.some(v =>
          (v.name && v.name.toLowerCase().includes(q)) ||
          (v.hindiName && v.hindiName.toLowerCase().includes(q)) ||
          (v.marathiName && v.marathiName.toLowerCase().includes(q)) ||
          (v.description && v.description.toLowerCase().includes(q))
        );

        let isMatch = matchName || matchDesc || matchTag || matchVariant;
        if (!isMatch && q.length >= 3) {
          isMatch = this.fuzzyMatch(item.name, q, 0.6) ||
                    visibleVariants.some(v => this.fuzzyMatch(v.name, q, 0.6));
        }
        if (!isMatch) return false;
      }

      return true;
    });
  }

  getSubCategoryLocalizedName(subCat) {
    if (!subCat) return '';
    if (this.currentLang === 'hi' && subCat.hindiName) return subCat.hindiName;
    if (this.currentLang === 'mr' && subCat.marathiName) return subCat.marathiName;
    return subCat.name;
  }

  renderSubCategoryChips() {
    // Guest section strips are intentionally removed; the admin taxonomy remains.
    return '';
  }

  setSubCategoryFilter(catId, subCatId) {
    this.activeSubCategories[catId] = subCatId;
    if (this.currentCategory === catId) this.renderSectionSlideshow(catId);

    const container = document.getElementById(`subcat-chips-${catId}`);
    if (container) {
      container.querySelectorAll('.subcat-chip').forEach(btn => {
        const isMatch = btn.getAttribute('data-subcat-id') === subCatId;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        if (isMatch) {
          btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    }

    const grid = document.getElementById(`dish-grid-${catId}`);
    if (grid) {
      const catDishes = this.menuData.filter(d => !d.notAvailable && !d.groupedUnder && d.categoryId === catId);
      const subCats = (window.HOTEL_PREMIER_SUB_CATEGORIES && window.HOTEL_PREMIER_SUB_CATEGORIES[catId]) || [];
      const subCat = subCats.find(s => s.id === subCatId);

      let displayed = catDishes;
      if (subCat && subCat.id !== 'all' && subCat.dishIds) {
        displayed = catDishes.filter(d => subCat.dishIds.includes(d.id));
      }

      grid.style.opacity = '0.35';
      grid.style.transform = 'translateY(4px)';
      setTimeout(() => {
        grid.innerHTML = displayed.map(dish => this.renderDishCard(dish)).join('');
        this.bindDishActions();
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
      }, 90);
    }
  }

  renderMenu() {
    // Without guest subcategory controls, no stale selection may hide dishes.
    this.activeSubCategories = {};
    const container = document.getElementById('menu-items-grid');
    if (!container) return;

    const filtered = this.getFilteredDishes();
    const itemsWord = this.t('itemsCount', 'Items');
    const searchStatus = document.getElementById('menu-search-status');
    if (searchStatus) searchStatus.textContent = this.searchQuery.trim()
      ? `${filtered.length} ${filtered.length === 1 ? 'dish' : 'dishes'} found across the menu` : '';

    if (filtered.length === 0) {
      if (this.isFavoritesFilterActive) {
        container.innerHTML = `
          <div class="favorites-empty-state">
            <span class="empty-fav-icon">♥</span>
            <h4 class="empty-fav-title">No Favorite Dishes Saved Yet</h4>
            <p class="empty-fav-sub">Open a dish and tap the small heart on its photo to save that individual item or option.</p>
            <button class="btn-primary hp-inline-03ff67f53e18" onclick="window.app.toggleFavoritesFilter()">Explore Full Menu</button>
          </div>
        `;
        return;
      }
      container.innerHTML = `
        <div class="hp-inline-1142771b813d">
          <div class="hp-inline-1391c90b12fb">🍲</div>
          <h3 class="hp-inline-49f768235d91">${this.t('noDishesFound')}</h3>
          <p class="hp-inline-4908cb0a1366">${this.t('noDishesSub')}</p>
          <button class="btn-primary hp-inline-5c6876484bae" onclick="window.app.showHomeCategories()">${this.t('viewAllCategoriesBtn')}</button>
        </div>
      `;
      return;
    }

    if (this.isFavoritesFilterActive) {
      let html = '';
      const activeCats = this.categories.filter(c => c.id !== 'all' && c.id !== 'chef-specials');
      activeCats.forEach(cat => {
        const catDishes = filtered.filter(d => d.categoryId === cat.id);
        if (catDishes.length > 0) {
          const locName = this.getCategoryLocalizedName(cat.id);
          const locSub = this.getCategoryLocalizedSubtitle(cat.id);
          html += `
            <div class="category-section" id="fav-cat-${cat.id}">
              <div class="section-header">
                <div>
                  <h3 class="section-title">${locName}</h3>
                  ${locSub ? `<span class="section-subtitle">${locSub}</span>` : ''}
                </div>
                <span class="section-count">${catDishes.length} ${itemsWord}</span>
              </div>
              <div class="dish-grid" id="dish-grid-${cat.id}">
                ${catDishes.map(dish => this.renderDishCard(dish)).join('')}
              </div>
            </div>
          `;
        }
      });
      container.innerHTML = html;
      this.bindDishActions();
      this.observeStaggeredCards();
      return;
    }

    if (this.currentCategory === 'all' && this.searchQuery.trim() === '' && this.currentFilter === 'all') {
      let html = '';
      const activeCats = this.categories.filter(c => c.id !== 'all' && c.id !== 'chef-specials');

      activeCats.forEach(cat => {
        const catDishes = filtered.filter(d => d.categoryId === cat.id);
        if (catDishes.length > 0) {
          const locName = this.getCategoryLocalizedName(cat.id);
          const locSub = this.getCategoryLocalizedSubtitle(cat.id);
          const activeSubId = this.activeSubCategories[cat.id] || 'all';
          const subCats = (window.HOTEL_PREMIER_SUB_CATEGORIES && window.HOTEL_PREMIER_SUB_CATEGORIES[cat.id]) || [];
          const subCat = subCats.find(s => s.id === activeSubId);

          let displayedDishes = catDishes;
          if (subCat && subCat.id !== 'all' && subCat.dishIds) {
            displayedDishes = catDishes.filter(d => subCat.dishIds.includes(d.id));
          }

          html += `
            <div class="category-section" id="section-${cat.id}">
              <div class="section-header">
                <div>
                  <h3 class="section-title">${locName}</h3>
                  ${locSub ? `<span class="section-subtitle">${locSub}</span>` : ''}
                </div>
                <span class="section-count">${catDishes.length} ${itemsWord}</span>
              </div>
              ${this.renderSubCategoryChips(cat.id, catDishes)}
              <div class="dish-grid" id="dish-grid-${cat.id}">
                ${displayedDishes.map(dish => this.renderDishCard(dish)).join('')}
              </div>
            </div>
          `;
        }
      });
      container.innerHTML = html;
    } else {
      let sectionTitle = '';
      let sectionSub = '';
      let subCatChipsHtml = '';
      let displayedDishes = filtered;

      if (this.currentCategory && this.currentCategory !== 'all') {
        const catId = this.currentCategory;
        sectionTitle = this.getCategoryLocalizedName(catId);
        sectionSub = this.getCategoryLocalizedSubtitle(catId);
        const catDishes = this.menuData.filter(d => !d.notAvailable && !d.groupedUnder && d.categoryId === catId);

        const activeSubId = this.activeSubCategories[catId] || 'all';
        const subCats = (window.HOTEL_PREMIER_SUB_CATEGORIES && window.HOTEL_PREMIER_SUB_CATEGORIES[catId]) || [];
        const subCat = subCats.find(s => s.id === activeSubId);

        if (subCat && subCat.id !== 'all' && subCat.dishIds) {
          displayedDishes = filtered.filter(d => subCat.dishIds.includes(d.id));
        }

        subCatChipsHtml = this.renderSubCategoryChips(catId, catDishes);
      } else if (this.searchQuery.trim() !== '') {
        sectionTitle = 'Search results';
      } else {
        sectionTitle = 'Culinary Selection';
      }

      const activeCatId = (this.currentCategory && this.currentCategory !== 'all') ? this.currentCategory : 'custom';

      container.innerHTML = `
        <div class="category-section" id="section-${activeCatId}">
          <div class="section-header">
            <div>
              <h3 class="section-title">${sectionTitle}</h3>
              ${sectionSub ? `<span class="section-subtitle">${sectionSub}</span>` : ''}
            </div>
            <span class="section-count">${filtered.length} ${itemsWord}</span>
          </div>
          ${subCatChipsHtml}
          <div class="dish-grid" id="dish-grid-${activeCatId}">
            ${displayedDishes.map(dish => this.renderDishCard(dish)).join('')}
          </div>
        </div>
      `;
    }

    this.bindDishActions();
    this.observeStaggeredCards();
  }

  getDishDescription(dish) {
    if (this.currentLang === 'hi' && dish.descriptionHi) return dish.descriptionHi;
    if (this.currentLang === 'mr' && dish.descriptionMr) return dish.descriptionMr;
    return dish.description;
  }

  getVariantDescription(variant) {
    if (!variant) return '';
    if (this.currentLang === 'hi' && variant.descriptionHi) return variant.descriptionHi;
    if (this.currentLang === 'mr' && (variant.descriptionMr || variant.descriptionHi)) return variant.descriptionMr || variant.descriptionHi;
    return variant.description || '';
  }

  renderDishCard(dish) {
    const detailId = dish._sourceDishId || dish.id;
    const detailVariant = Number.isInteger(dish._sourceVariantIndex) ? `, ${dish._sourceVariantIndex}` : '';
    const isFav = Boolean(this.favorites && this.favorites.includes(dish.id));
    const hasVariants = dish.variants && dish.variants.length > 0;
    const isMaster = Boolean(dish.isGroupMaster && hasVariants);
    const visibleVariants = hasVariants ? dish.variants.filter(v => !v.hidden) : [];
    const selectedVariant = visibleVariants.find(v => v.name === dish._activeVariantName);
    const displayImage = selectedVariant ? (selectedVariant.image || dish.image) : (dish._activeVariantImage || dish.image);
    const displayPrice = selectedVariant ? selectedVariant.price : (isMaster ? dish.price : (dish._activeVariantPrice ?? dish.price));
    const visiblePrices = visibleVariants.filter(v => Number.isFinite(v.price)).map(v => v.price);
    const variantRange = !visiblePrices.length ? 'Price on request' : visiblePrices.length < visibleVariants.length ? `From ₹${Math.min(...visiblePrices)}` : (Math.min(...visiblePrices) === Math.max(...visiblePrices) ? `₹${Math.min(...visiblePrices)}` : `₹${Math.min(...visiblePrices)} – ₹${Math.max(...visiblePrices)}`);
    const priceRangeText = isMaster && !selectedVariant ? variantRange : (Number.isFinite(displayPrice) ? `₹${displayPrice}` : 'Price on request');
    const hasPhoto = displayImage && displayImage.trim() !== '';

    let dishTitleHtml = dish.name;
    if (this.currentLang === 'hi' && dish.hindiName) {
      dishTitleHtml = `${dish.name} <span class="dish-title-sub">(${dish.hindiName})</span>`;
    } else if (this.currentLang === 'mr' && (dish.marathiName || dish.hindiName)) {
      const subName = dish.marathiName || dish.hindiName;
      dishTitleHtml = `${dish.name} <span class="dish-title-sub">(${subName})</span>`;
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      dishTitleHtml = this.highlightMatches(dishTitleHtml, this.searchQuery.trim());
    }

    return `
      <div class="dish-card compact-dish-card dish-card-stagger ${isMaster ? 'group-master-card' : ''} ${dish.isSoldOut ? 'sold-out' : ''}"
           id="dish-card-${dish.id}"
           onclick="window.app.openDishDetail('${detailId}'${detailVariant})"
           role="button"
           tabindex="0"
           aria-label="${dish.name}, ${priceRangeText}"
           onkeydown="if(event.target===this && (event.key==='Enter'||event.key===' ')){event.preventDefault(); window.app.openDishDetail('${detailId}'${detailVariant});}">
        <div class="dish-banner-media ${hasPhoto ? '' : 'no-photo'}">
          <div class="hp-dish-pedestal-backdrop" aria-hidden="true"></div>
          ${hasPhoto ? `
            <img height="900" width="1200" src="${window.AssetPipeline?.versionedPhotoSource(displayImage) || displayImage}" ${window.AssetPipeline?.responsivePhotoAttributes(displayImage, false, true) || ''} alt="${dish.name}" class="dish-img" id="dish-img-el-${dish.id}" loading="lazy" decoding="async" onerror="this.onerror=null; this.hidden=true; this.parentElement.classList.add('no-photo')">
            <div class="hp-glass-vignette" aria-hidden="true"></div>
          ` : `
            <div class="dish-no-photo-placeholder" id="dish-img-el-${dish.id}">
              <div class="no-photo-icon">🌱</div>
              <div class="no-photo-crest">HOTEL PREMIER</div>
            </div>
          `}
          ${dish.isSoldOut ? `<div class="sold-out-overlay">${this.t('soldOut')}</div>` : ''}
          <div class="dish-veg-symbol" title="100% Pure Vegetarian"><div class="dish-veg-dot"></div></div>
        </div>
        <div class="dish-banner-content">
          <div class="dish-banner-top">
            <div class="dish-banner-header">
              <h4 class="dish-title">${dishTitleHtml}</h4>
            </div>
            <div class="dish-banner-price-stack">
              <span class="dish-price" id="price-display-${dish.id}">${priceRangeText}</span>
              <span class="dish-tax-note">${this.t('taxNote')}</span>
            </div>
          </div>
          <div class="dish-banner-bottom">
            ${isMaster ? `
              <div class="dish-card-variant-chips" role="group" aria-label="${dish.name} items" onclick="event.stopPropagation()">
                ${visibleVariants.map(v => {
                  const vIdx = dish.variants.indexOf(v);
                  const label = this.currentLang === 'hi' && v.hindiName ? v.hindiName : this.currentLang === 'mr' && (v.marathiName || v.hindiName) ? (v.marathiName || v.hindiName) : v.name;
                  return `<button type="button" class="dish-card-chip" onclick="event.stopPropagation(); window.app.openDishDetail('${dish.id}', ${vIdx})" title="${v.name}"><span class="chip-name">${label}</span><span class="chip-price">${Number.isFinite(v.price) ? `₹${v.price}` : 'Price on request'}</span></button>`;
                }).join('')}
              </div>
            ` : ''}
            <div class="dish-banner-action">
              ${dish.isSoldOut ? `
                <span class="dish-soldout-label">${this.t('soldOut')}</span>
              ` : `
                <button type="button" class="view-detail-link" onclick="event.stopPropagation(); window.app.openDishDetail('${detailId}'${detailVariant})" aria-label="View dish details">
                  <span class="dish-info-symbol" aria-hidden="true">i</span>
                </button>
              `}
            </div>
          </div>
          ${dish.tags && dish.tags.includes('online-exclusive') ? `<div class="dish-badge-delivery-exclusive"><span>Online exclusive</span><span class="exclusive-platforms"><img src="assets/brands/swiggy.png" alt="Swiggy" width="54" height="18"><span aria-hidden="true">&amp;</span><span class="exclusive-zomato"><img src="assets/brands/zomato.png" alt="Zomato" width="54" height="16"></span></span></div>` : ''}
        </div>
      </div>
    `;
  }

  bindDishActions() {
    document.querySelectorAll('.variant-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const parent = btn.closest('.dish-variants');
        if (!parent) return;
        const dishId = parent.getAttribute('data-dish-id');
        parent.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        const newPrice = btn.getAttribute('data-variant-price');
        const priceDisplay = document.getElementById(`price-display-${dishId}`);
        if (priceDisplay && newPrice) priceDisplay.innerText = `₹${newPrice}`;

        const dishObj = this.menuData ? this.menuData.find(d => d.id === dishId) : null;
        if (dishObj && newPrice) {
          dishObj._activeVariantPrice = Number(newPrice);
        }

        const newImg = btn.getAttribute('data-variant-img');
        if (newImg && newImg.trim() !== '') {
          const cardImg = document.getElementById(`dish-img-el-${dishId}`);
          if (cardImg && cardImg.tagName === 'IMG') {
            cardImg.classList.add('dish-img-swapping');
            setTimeout(() => {
              cardImg.src = newImg;
              cardImg.classList.remove('dish-img-swapping');
            }, 120);
          }
          if (dishObj) {
            dishObj._activeVariantImage = newImg;
          }
        }
      });
    });
  }

  // Dish Details Modal
  openDishDetail(dishId, targetVariantIndex = null) {
    if (!dishId) return;
    this.haptic(5);

    // Resilient ID Resolution & Legacy Alias Lookup
    let dish = this.menuData.find(d => d.id === dishId);
    if (!dish) {
      const aliasMap = {
        'dish-thali-maharaja': 'vs-1',
        'dish-paneer-butter-masala': 'ps-3',
        'dish-tandoor-platter': 'tc-1',
        'dish-veg-dum-biryani': 'rb-1'
      };
      if (aliasMap[dishId]) {
        dish = this.menuData.find(d => d.id === aliasMap[dishId]);
      }
    }
    if (!dish) {
      const cleanKey = dishId.replace(/^dish-/, '').replace(/-/g, ' ').toLowerCase();
      dish = this.menuData.find(d => d.name && d.name.toLowerCase().includes(cleanKey));
    }
    if (!dish) return;

    // Subsumed item redirect: if this dish is grouped under a master card, redirect to master card at this variant
    if (dish.groupedUnder) {
      const master = this.menuData.find(d => d.id === dish.groupedUnder);
      if (master && master.variants && master.variants.length > 0) {
        const vIdx = master.variants.findIndex(v =>
          v.name.toLowerCase() === dish.name.toLowerCase() ||
          dish.name.toLowerCase().includes(v.name.toLowerCase()) ||
          v.name.toLowerCase().includes(dish.name.toLowerCase())
        );
        return this.openDishDetail(master.id, vIdx !== -1 ? vIdx : 0);
      }
    }

    try { window.HOTEL_VAULT?.recordDishView(dish.id, dish.name, dish.categoryId); }
    catch (error) { console.warn('Dish analytics unavailable', error); }

    const modal = document.getElementById('dish-detail-modal');
    const body = document.getElementById('dish-detail-body');
    if (!modal || !body) return;
    clearTimeout(this.dishDetailCloseTimer);
    this.lastDishDetailTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.currentDetailDishId = dish.id;

    const hasModalVariants = dish.variants && dish.variants.length > 0;
    let initialVariantIndex = 0;
    if (hasModalVariants) {
      if (typeof targetVariantIndex === 'number' && targetVariantIndex >= 0 && targetVariantIndex < dish.variants.length) {
        initialVariantIndex = targetVariantIndex;
      } else {
        initialVariantIndex = 0;
      }
    }

    // A hidden option must never become the guest-facing default or shift selection indices.
    if (hasModalVariants && !document.body.classList.contains('staff-mode-active') && dish.variants[initialVariantIndex]?.hidden) {
      initialVariantIndex = dish.variants.findIndex(v => !v.hidden);
    }
    const activeVariant = hasModalVariants ? dish.variants[initialVariantIndex] : null;
    this.currentDetailVariantIndex = initialVariantIndex;
    const displayImage = activeVariant ? (activeVariant.image || dish.image) : (dish.image);
    const displayPrice = activeVariant ? (activeVariant.price === undefined ? dish.price : activeVariant.price) : dish.price;
    const hasPhoto = displayImage && displayImage.trim() !== '';

    const currentVariantName = activeVariant ? activeVariant.name : dish.name;
    const currentVariantHi = activeVariant ? (activeVariant.hindiName || dish.hindiName) : dish.hindiName;
    const currentVariantMr = activeVariant ? (activeVariant.marathiName || dish.marathiName || dish.hindiName) : (dish.marathiName || dish.hindiName);

    let dishTitleHtml = currentVariantName;
    if (this.currentLang === 'hi' && currentVariantHi) {
      dishTitleHtml = `${currentVariantName} <span class="dish-title-sub hp-inline-8c79846eb3a3">(${currentVariantHi})</span>`;
    } else if (this.currentLang === 'mr' && currentVariantMr) {
      dishTitleHtml = `${currentVariantName} <span class="dish-title-sub hp-inline-8c79846eb3a3">(${currentVariantMr})</span>`;
    }

    let initialDesc = this.getDishDescription(dish);
    if (activeVariant) {
      const vDesc = this.getVariantDescription(activeVariant);
      if (vDesc) initialDesc = vDesc;
    }

    // Badges on modal photo per user request
    const modalBadges = [];
    if (dish.tags) {
      if (dish.tags.includes('bestseller')) {
        modalBadges.push(`<span class="badge-tag bestseller">${this.t('badgeBestseller')}</span>`);
      }
      if (dish.tags.includes('khandeshi-special')) {
        modalBadges.push(`<span class="badge-tag khandeshi">${this.t('badgeKhandeshi')}</span>`);
      }
      if (dish.tags.includes('chef-special') && !dish.tags.includes('bestseller')) {
        modalBadges.push(`<span class="badge-tag chef">${this.t('badgeChefSpecial')}</span>`);
      }
      if (dish.tags.includes('sweet')) {
        modalBadges.push(`<span class="badge-tag sweet">${this.t('badgeSweet')}</span>`);
      }
      if (dish.tags.includes('spicy')) {
        modalBadges.push(`<span class="badge-tag spicy">${this.t('badgeSpicy')}</span>`);
      }
      if (dish.tags.includes('online-exclusive')) {
        modalBadges.push(`<span class="badge-tag delivery-exclusive hp-inline-2dba2d4bad11">🛵 Online Exclusive</span>`);
      }
    }
    const modalBadgesHtml = modalBadges.join('');

    let detailMediaHtml = '';
    if (window.AssetPipeline && typeof window.AssetPipeline.renderDetailMedia === 'function') {
      detailMediaHtml = window.AssetPipeline.renderDetailMedia({
        ...dish,
        name: currentVariantName,
        image: displayImage,
        isSoldOut: dish.isSoldOut
      }, {
        badgesHtml: modalBadgesHtml,
        soldOutText: this.t('soldOut')
      });
    } else if (hasPhoto) {
      detailMediaHtml = `
        <div class="modal-dish-photo-wrap">
          <div class="hp-dish-pedestal-backdrop" aria-hidden="true"></div>
          <img height="900" width="1200" src="${displayImage}" alt="${currentVariantName}" id="detail-modal-img" class="modal-dish-img" loading="eager" onerror="this.onerror=null; this.hidden=true; this.parentElement.classList.add('no-photo')">
          <div class="hp-glass-vignette" aria-hidden="true"></div>
          <div class="dish-veg-symbol" title="100% Pure Vegetarian"><div class="dish-veg-dot"></div></div>
          ${modalBadgesHtml ? `<div class="dish-badges">${modalBadgesHtml}</div>` : ''}
          ${dish.isSoldOut ? `<div class="sold-out-overlay">${this.t('soldOut')}</div>` : ''}
          <button onclick="window.admin ? window.admin.openImageModal('${dish.id}') : null" class="btn-detail-photo-action">
            📷 Change Photo
          </button>
        </div>
      `;
    } else {
      detailMediaHtml = `
        <div class="modal-dish-photo-wrap no-photo">
          <div class="dish-no-photo-placeholder" id="detail-modal-img">
            <div class="no-photo-icon">🌱</div>
            <div class="no-photo-crest hp-inline-2e72acd64782">HOTEL PREMIER</div>
            <div class="no-photo-sub hp-inline-8b511f076fb1">PRIDE PURE VEG AC RESTAURANT</div>
          </div>
          <div class="dish-veg-symbol" title="100% Pure Vegetarian"><div class="dish-veg-dot"></div></div>
          <button onclick="window.admin ? window.admin.openImageModal('${dish.id}') : null" class="btn-detail-photo-action">
            ➕ Add Authentic Photo
          </button>
        </div>
      `;
    }

    let modalVariantsHtml = '';
    const isStaff = document.body.classList.contains('staff-mode-active');
    if (hasModalVariants) {
      const variantsToDisplay = isStaff ? dish.variants : dish.variants.filter(v => !v.hidden);
      modalVariantsHtml = `
        <div class="modal-dish-variants-box">
          <div class="modal-dish-variants-header">
            <span class="modal-dish-variants-icon" aria-hidden="true">◆</span>
            <div class="modal-dish-variants-header-text">
              <span class="modal-dish-variants-title">${this.t('variantsTitle', 'Curated Options & Styles')}</span>
              <span class="modal-dish-variants-hint">${this.t('variantsHint', 'Select an option below to view photo, price & details')}</span>
            </div>
          </div>
          <div class="modal-dish-variants-list" id="modal-variants-list-${dish.id}" role="radiogroup" aria-label="Available Dish Variations">
            ${variantsToDisplay.map((v, i) => {
              const isSelected = (v === activeVariant);
              const displayName = (this.currentLang === 'hi' && v.hindiName) ? v.hindiName : ((this.currentLang === 'mr' && (v.marathiName || v.hindiName)) ? (v.marathiName || v.hindiName) : v.name);
              const descEn = encodeURIComponent(v.description || '');
              const descHi = encodeURIComponent(v.descriptionHi || v.description || '');
              const descMr = encodeURIComponent(v.descriptionMr || v.descriptionHi || v.description || '');
              const nameHi = encodeURIComponent(v.hindiName || '');
              const nameMr = encodeURIComponent(v.marathiName || '');
              return `
                <button type="button"
                        class="modal-dish-variant-btn ${isSelected ? 'selected' : ''}"
                        role="radio"
                        aria-checked="${isSelected}"
                        data-variant-name="${v.name}"
                        data-variant-name-hi="${nameHi}"
                        data-variant-name-mr="${nameMr}"
                        data-variant-price="${v.price}"
                        data-variant-img="${v.image || dish.image || ''}"
                        data-variant-desc="${descEn}"
                        data-variant-desc-hi="${descHi}"
                        data-variant-desc-mr="${descMr}"
                        onclick="window.app.switchModalVariant('${dish.id}', this)">
                  <span class="variant-btn-name">${displayName}</span>
                  <span class="variant-btn-price">${Number.isFinite(v.price) ? `₹${v.price}` : 'Price on request'}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="modal-staff-variants-manager" id="staff-variants-mgr-${dish.id}">
          <div class="hp-inline-6e72da60eeb7">
            <span>🛠️ Option Controls (Sequence, Hide &amp; Delete)</span>
            <button type="button" class="staff-add-opt-btn hp-inline-30c1d597b8b1" onclick="window.app.promptAddVariant('${dish.id}')">+ Add Option</button>
          </div>
          <div class="staff-variants-list hp-inline-2befb59f42e9">
            ${dish.variants.map((v, i) => `
              <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 5px 8px; border-radius: 6px; font-size: 0.75rem; border: 1px solid rgba(255,255,255,0.08); ${v.hidden ? 'opacity: 0.6;' : ''}">
                <span class="hp-inline-8da89a75a781">
                  <strong class="hp-inline-f8538cbd29f8">${i + 1}.</strong>
                  <span>${v.name} (₹${v.price})</span>
                  ${v.hidden ? '<span class="hp-inline-5767e4ab3ab2">HIDDEN</span>' : ''}
                </span>
                <div class="hp-inline-a714698963cb">
                  <button class="hp-inline-235d73071662" type="button" onclick="window.app.moveVariant('${dish.id}', ${i}, ${i - 1})" ${i === 0 ? 'disabled' : ''} style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #FFF; border-radius: 3px; padding: 1px 6px; cursor: pointer;" title="Move Up (Make Earlier)">▲</button>
                  <button class="hp-inline-235d73071662" type="button" onclick="window.app.moveVariant('${dish.id}', ${i}, ${i + 1})" ${i === dish.variants.length - 1 ? 'disabled' : ''} style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #FFF; border-radius: 3px; padding: 1px 6px; cursor: pointer;" title="Move Down">▼</button>
                  <button type="button" onclick="window.app.toggleVariantAvailability('${dish.id}', ${i})" style="background: ${v.hidden ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; border: 1px solid rgba(255,255,255,0.2); color: #FFF; border-radius: 3px; padding: 1px 6px; cursor: pointer;" title="${v.hidden ? 'Show to customers' : 'Hide from customers'}">${v.hidden ? '👁️ Show' : '🚫 Hide'}</button>
                  <button class="hp-inline-135bf246d594" type="button" onclick="window.app.deleteVariant('${dish.id}', ${i})" title="Delete Option">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    body.innerHTML = `
      ${detailMediaHtml}
      <div class="modal-dish-detail-container">
        <div class="modal-dish-header">
          <div>
            <div class="hp-inline-674501151eb8">
              <h3 class="modal-dish-title">${dishTitleHtml}</h3>
              <button onclick="window.admin ? window.admin.openAdminModal('menu', '${dish.id}') : null" class="btn-staff-dish-edit-tag" title="Staff Taste & Price Editor">
                ✏️ Edit Tags
              </button>
            </div>
            <div class="modal-dish-subtitle">Pride Restaurant • Chef Curated</div>
          </div>
          <span class="modal-dish-price" id="modal-dish-price-${dish.id}">${Number.isFinite(displayPrice) ? `₹${displayPrice}` : 'Price on request'}</span>
        </div>

        <div class="modal-staff-taste-modifier-bar" id="modal-staff-taste-bar-${dish.id}">
          <span class="hp-inline-1fd02deed669">Taste Profile:</span>
          <button type="button" class="admin-tag-toggle-chip ${dish.tags && dish.tags.includes('sweet') ? 'active-sweet' : ''}" onclick="window.admin ? window.admin.toggleDishTag('${dish.id}', 'sweet') : null">
            🍯 Sweet
          </button>
          <button type="button" class="admin-tag-toggle-chip ${dish.tags && dish.tags.includes('spicy') ? 'active-spicy' : ''}" onclick="window.admin ? window.admin.toggleDishTag('${dish.id}', 'spicy') : null">
            🌶️ Spicy
          </button>
          <button type="button" class="admin-tag-toggle-chip ${dish.tags && dish.tags.includes('chef-special') ? 'active-chef' : ''}" onclick="window.admin ? window.admin.toggleDishTag('${dish.id}', 'chef-special') : null">
            👑 Chef
          </button>
          <button type="button" class="admin-tag-toggle-chip ${dish.tags && dish.tags.includes('bestseller') ? 'active-bestseller' : ''}" onclick="window.admin ? window.admin.toggleDishTag('${dish.id}', 'bestseller') : null">
            🔥 Hot
          </button>
          <button type="button" class="admin-tag-toggle-chip ${dish.tags && dish.tags.includes('khandeshi-special') ? 'active-khandeshi' : ''}" onclick="window.admin ? window.admin.toggleDishTag('${dish.id}', 'khandeshi-special') : null">
            🫕 Khandeshi
          </button>
          <button type="button" class="admin-tag-toggle-chip ${dish.notAvailable ? 'active-not-available' : ''}" onclick="window.app.toggleDishNotAvailable('${dish.id}', !${Boolean(dish.notAvailable)})" title="Toggle visibility in customer PWA">
            ${dish.notAvailable ? '🚫 Hidden from PWA' : '👁️ Hide (Not Available)'}
          </button>
          <button type="button" class="admin-tag-toggle-chip" onclick="window.app.promptAddVariant('${dish.id}')" title="Add portion/style options to this dish">
            ➕ Add Option
          </button>
        </div>

        ${modalVariantsHtml}

        <p class="modal-dish-desc">${initialDesc || 'Prepared fresh with finest ingredients and authentic culinary care.'}</p>

        <div class="modal-dish-veg-guarantee">
          <span class="veg-guarantee-icon" aria-hidden="true">🌱</span>
          <div>
            <strong class="veg-guarantee-title">100% Pure Veg Kitchen Guarantee</strong>
            <p class="veg-guarantee-note">Please tell our team about any food allergies or dietary requirements.</p>
          </div>
        </div>

      </div>
    `;

    const headerShareBtn = document.getElementById('modal-dish-share-btn');
    if (headerShareBtn) {
      headerShareBtn.onclick = () => this.shareDish(dish.id);
      headerShareBtn.setAttribute('aria-label', `Share ${dish.name}`);
    }

    const orderActions = document.createElement('div');
    orderActions.className = 'modal-dish-actions delivery-buttons-container';

    // Swiggy button with authentic brand color & badge
    const swiggyBtn = document.createElement('a');
    swiggyBtn.className = 'modal-btn-swiggy-order delivery-btn';
    swiggyBtn.href = this.getDeliveryUrl('swiggy', dish);
    swiggyBtn.target = '_blank';
    swiggyBtn.rel = 'noopener noreferrer';
    swiggyBtn.setAttribute('aria-label', `Order ${dish.name} on Swiggy`);
    swiggyBtn.innerHTML = `
      <span class="delivery-btn-brand swiggy-brand"><img class="partner-order-logo partner-logo-swiggy" src="assets/brands/swiggy.png" alt="Swiggy" width="46" height="15"></span>
      <span class="delivery-btn-text">Order &#x2197;</span>
    `;

    // Zomato button with authentic brand color & typography
    const zomatoBtn = document.createElement('a');
    zomatoBtn.className = 'modal-btn-zomato-order delivery-btn';
    zomatoBtn.href = this.getDeliveryUrl('zomato', dish);
    zomatoBtn.target = '_blank';
    zomatoBtn.rel = 'noopener noreferrer';
    zomatoBtn.setAttribute('aria-label', `Order ${dish.name} on Zomato`);
    zomatoBtn.innerHTML = `
      <span class="delivery-btn-brand zomato-brand"><img class="partner-order-logo partner-logo-zomato" src="assets/brands/zomato.png" alt="Zomato" width="54" height="12"></span>
      <span class="delivery-btn-text">Order &#x2197;</span>
    `;

    orderActions.appendChild(swiggyBtn);
    orderActions.appendChild(zomatoBtn);
    body.appendChild(orderActions);
    const detailContainer = body.querySelector('.modal-dish-detail-container');
    if (detailContainer) detailContainer.scrollTop = 0;
    this.syncDetailFavorite();
    modal.classList.remove('closing');
    modal.style.display = 'flex';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    clearTimeout(this.dishDetailFocusTimer);
    this.dishDetailFocusTimer = window.setTimeout(() => {
      if (modal.classList.contains('active')) modal.querySelector('.modal-close-btn')?.focus({ preventScroll:true });
    }, 60);
  }

  switchModalVariant(dishId, btn) {
    if (!btn) return;
    const parentList = btn.closest('.modal-dish-variants-list');
    if (parentList) {
      parentList.querySelectorAll('.modal-dish-variant-btn').forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });
    }
    btn.classList.add('selected');
    btn.setAttribute('aria-checked', 'true');

    const newPrice = btn.getAttribute('data-variant-price');
    const newImg = btn.getAttribute('data-variant-img');
    const varName = btn.getAttribute('data-variant-name');
    const varNameHi = decodeURIComponent(btn.getAttribute('data-variant-name-hi') || '');
    const varNameMr = decodeURIComponent(btn.getAttribute('data-variant-name-mr') || '');
    const descEn = decodeURIComponent(btn.getAttribute('data-variant-desc') || '');
    const descHi = decodeURIComponent(btn.getAttribute('data-variant-desc-hi') || '');
    const descMr = decodeURIComponent(btn.getAttribute('data-variant-desc-mr') || '');
    const dishObj = this.menuData ? this.menuData.find(d => d.id === dishId) : null;
    this.currentDetailVariantIndex = dishObj?.variants?.findIndex(v => v.name === varName) ?? -1;
    this.syncDetailFavorite();

    // 1. Update price
    const priceEl = document.getElementById(`modal-dish-price-${dishId}`);
    const parsedVariantPrice = newPrice && !['null','undefined'].includes(newPrice) ? Number(newPrice) : null;
    if (priceEl) priceEl.innerText = Number.isFinite(parsedVariantPrice) ? `₹${parsedVariantPrice}` : 'Price on request';

    // 2. Update image with smooth crossfade and clear responsive srcset so browser loads variant photo
    const targetImg = (newImg && newImg.trim() !== '') ? newImg : (dishObj?.image || '');
    const previousImg = document.getElementById('detail-modal-img') || document.querySelector('#dish-detail-body .dish-no-photo-placeholder');
    const photoWrap = previousImg?.closest('.modal-dish-photo-wrap');
    if (targetImg && targetImg.trim() !== '' && photoWrap) {
      const versionedSrc = window.AssetPipeline?.versionedPhotoSource(targetImg) || targetImg;
      if (previousImg && previousImg.tagName === 'IMG' && (previousImg.src === versionedSrc || previousImg.getAttribute('src') === versionedSrc)) {
        previousImg.alt = varName || '';
        photoWrap.classList.remove('no-photo');
      } else {
        const modalImg = document.createElement('img');
        modalImg.id = 'detail-modal-img';
        modalImg.className = 'modal-dish-img';
        modalImg.alt = varName || '';
        modalImg.loading = 'eager';
        modalImg.src = versionedSrc;
        modalImg.onerror = () => {
          if (!modalImg.isConnected) return;
          const placeholder = document.createElement('div');
          placeholder.id = 'detail-modal-img';
          placeholder.className = 'dish-no-photo-placeholder';
          placeholder.textContent = 'Photo coming soon';
          photoWrap.classList.add('no-photo');
          modalImg.replaceWith(placeholder);
        };
        photoWrap.classList.remove('no-photo');
        previousImg.replaceWith(modalImg);
      }
    } else if (previousImg && photoWrap) {
      const placeholder = document.createElement('div');
      placeholder.id = 'detail-modal-img';
      placeholder.className = 'dish-no-photo-placeholder';
      placeholder.textContent = 'Photo coming soon';
      photoWrap.classList.add('no-photo');
      previousImg.replaceWith(placeholder);
    }

    // 3. Update title
    const titleEl = document.querySelector('.modal-dish-title');
    if (titleEl && varName) {
      let subTitle = '';
      if (this.currentLang === 'hi' && varNameHi) {
        subTitle = ` <span class="dish-title-sub hp-inline-8c79846eb3a3">(${varNameHi})</span>`;
      } else if (this.currentLang === 'mr' && (varNameMr || varNameHi)) {
        const sm = varNameMr || varNameHi;
        subTitle = ` <span class="dish-title-sub hp-inline-8c79846eb3a3">(${sm})</span>`;
      }
      titleEl.innerHTML = `${varName}${subTitle}`;
    }

    // 4. Update description
    let activeDesc = descEn;
    if (this.currentLang === 'hi' && descHi) activeDesc = descHi;
    else if (this.currentLang === 'mr' && (descMr || descHi)) activeDesc = descMr || descHi;
    const descEl = document.querySelector('.modal-dish-desc');
    if (descEl) descEl.textContent = activeDesc || (dishObj ? this.getDishDescription(dishObj) : '');

    // 5. Update delivery buttons aria labels
    const swiggyBtn = document.querySelector('.modal-btn-swiggy-order');
    if (swiggyBtn && varName) {
      swiggyBtn.setAttribute('aria-label', `Order ${varName} on Swiggy`);
    }
    const zomatoBtn = document.querySelector('.modal-btn-zomato-order');
    if (zomatoBtn && varName) {
      zomatoBtn.setAttribute('aria-label', `Order ${varName} on Zomato`);
    }

    // 6. Synchronize the dish card in the background too
    const cardPrice = document.getElementById(`price-display-${dishId}`);
    if (cardPrice) cardPrice.innerText = Number.isFinite(parsedVariantPrice) ? `₹${parsedVariantPrice}` : 'Price on request';

    const cardImg = document.getElementById(`dish-img-el-${dishId}`);
    if (cardImg && cardImg.tagName === 'IMG' && targetImg && targetImg.trim() !== '') {
      const versionedCardSrc = window.AssetPipeline?.versionedPhotoSource(targetImg) || targetImg;
      cardImg.removeAttribute('srcset');
      cardImg.removeAttribute('sizes');
      cardImg.src = versionedCardSrc;
    }

    const dishVariantsCard = document.querySelector(`.dish-variants[data-dish-id="${dishId}"]`);
    if (dishVariantsCard) {
      dishVariantsCard.querySelectorAll('.variant-btn').forEach(b => {
        if (b.getAttribute('data-variant-name') === varName) {
          b.classList.add('selected');
        } else {
          b.classList.remove('selected');
        }
      });
    }

    // 7. Persist active state on dish object
    if (dishObj) {
      dishObj._activeVariantImage = targetImg;
      if (newPrice) dishObj._activeVariantPrice = Number(newPrice);
      if (varName) dishObj._activeVariantName = varName;
    }
  }

  closeDishDetail() {
    this.haptic(5);
    clearTimeout(this.dishDetailFocusTimer);
    const modal = document.getElementById('dish-detail-modal');
    if (modal && modal.classList.contains('active')) {
      modal.classList.add('closing');
      modal.classList.remove('active');
      if (!document.querySelector('.modal-backdrop.active')) document.body.classList.remove('modal-open');
      this.dishDetailCloseTimer = setTimeout(() => {
        if (modal.classList.contains('active')) return;
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('closing');
        if (!document.querySelector('.modal-backdrop.active') && this.lastDishDetailTrigger?.isConnected) this.lastDishDetailTrigger.focus({ preventScroll:true });
        this.lastDishDetailTrigger = null;
      }, 240);
    }
  }

  async toggleDishNotAvailable(dishId, isNotAvailable) {
    const dish = this.menuData.find(d => d.id === dishId);
    if (!dish) return;
    dish.notAvailable = Boolean(isNotAvailable);
    this.saveMenuData();
    if (window.HOTEL_STORAGE) {
      await window.HOTEL_STORAGE.saveDishOverride(dishId, { notAvailable: dish.notAvailable });
    }
    this.renderCategoryCards();
    this.renderMenu();
    if (window.admin && typeof window.admin.filterAdminDishes === 'function') {
      window.admin.filterAdminDishes();
    }
    const statusText = dish.notAvailable
      ? `"${dish.name}" is now marked Not Available and hidden from PWA!`
      : `"${dish.name}" is now Available and restored to PWA!`;
    this.showToast(statusText, dish.notAvailable ? 'warning' : 'success');

    // If modal is open for this dish, re-render it so staff immediately sees the updated state
    const modal = document.getElementById('dish-detail-modal');
    if (modal && modal.classList.contains('active')) {
      this.openDishDetail(dishId);
    }
  }

  // ==================== VARIANT / OPTION MANAGEMENT ====================
  moveVariant(dishId, fromIdx, toIdx) {
    this.haptic(10);
    const dish = this.menuData ? this.menuData.find(d => d.id === dishId) : null;
    if (!dish || !dish.variants || fromIdx < 0 || toIdx < 0 || fromIdx >= dish.variants.length || toIdx >= dish.variants.length) return;
    const item = dish.variants.splice(fromIdx, 1)[0];
    dish.variants.splice(toIdx, 0, item);
    this.saveMenuData();
    if (window.HOTEL_STORAGE) {
      window.HOTEL_STORAGE.saveDishOverride(dishId, { variants: dish.variants });
    }
    this.openDishDetail(dishId, 0);
    this.renderMenu();
    this.showToast(`Updated option sequence for "${dish.name}"`, 'success');
  }

  toggleVariantAvailability(dishId, variantIdx) {
    this.haptic(10);
    const dish = this.menuData ? this.menuData.find(d => d.id === dishId) : null;
    if (!dish || !dish.variants || variantIdx < 0 || variantIdx >= dish.variants.length) return;
    const v = dish.variants[variantIdx];
    v.hidden = !v.hidden;
    this.saveMenuData();
    if (window.HOTEL_STORAGE) {
      window.HOTEL_STORAGE.saveDishOverride(dishId, { variants: dish.variants });
    }
    this.openDishDetail(dishId, 0);
    this.renderMenu();
    this.showToast(`Option "${v.name}" is now ${v.hidden ? 'hidden from guests' : 'visible'}`, 'info');
  }

  deleteVariant(dishId, variantIdx) {
    this.haptic(15);
    const dish = this.menuData ? this.menuData.find(d => d.id === dishId) : null;
    if (!dish || !dish.variants || variantIdx < 0 || variantIdx >= dish.variants.length) return;
    if (dish.variants.length <= 1) {
      alert('A dish must have at least one option. To hide this dish entirely, use the Hide button.');
      return;
    }
    const vName = dish.variants[variantIdx].name;
    if (!confirm(`Are you sure you want to remove portion/option "${vName}"?`)) return;
    dish.variants.splice(variantIdx, 1);
    this.saveMenuData();
    if (window.HOTEL_STORAGE) {
      window.HOTEL_STORAGE.saveDishOverride(dishId, { variants: dish.variants });
    }
    this.openDishDetail(dishId, 0);
    this.renderMenu();
    this.showToast(`Removed option "${vName}"`, 'warning');
  }

  promptAddVariant(dishId) {
    this.haptic(10);
    const dish = this.menuData ? this.menuData.find(d => d.id === dishId) : null;
    if (!dish) return;
    const name = prompt(`Enter Option / Portion Name for "${dish.name}" (e.g. Full, Half, Regular, Large):`);
    if (!name || !name.trim()) return;
    const priceStr = prompt(`Enter Price (₹) for "${name.trim()}":`, String(dish.price || ''));
    const price = Number(priceStr);
    if (!Number.isFinite(price) || price < 0) {
      alert('Please enter a valid numeric price.');
      return;
    }
    const desc = prompt(`Optional short description for "${name.trim()}" (leave blank to inherit dish description):`, '');
    if (!dish.variants) dish.variants = [];
    dish.variants.push({
      name: name.trim(),
      price: price,
      description: desc && desc.trim() ? desc.trim() : (dish.description || ''),
      image: dish.image || ''
    });
    this.saveMenuData();
    if (window.HOTEL_STORAGE) {
      window.HOTEL_STORAGE.saveDishOverride(dishId, { variants: dish.variants });
    }
    this.openDishDetail(dishId, dish.variants.length - 1);
    this.renderMenu();
    this.showToast(`Added option "${name.trim()}"`, 'success');
  }

  moveDish(dishId, direction) {
    this.haptic(10);
    const idx = this.menuData.findIndex(d => d.id === dishId);
    if (idx === -1) return;
    const current = this.menuData[idx];
    const catId = current.categoryId;

    if (direction === 'up') {
      let targetIdx = -1;
      for (let i = idx - 1; i >= 0; i--) {
        if (this.menuData[i].categoryId === catId) {
          targetIdx = i;
          break;
        }
      }
      if (targetIdx !== -1) {
        const item = this.menuData.splice(idx, 1)[0];
        this.menuData.splice(targetIdx, 0, item);
      }
    } else if (direction === 'down') {
      let targetIdx = -1;
      for (let i = idx + 1; i < this.menuData.length; i++) {
        if (this.menuData[i].categoryId === catId) {
          targetIdx = i;
          break;
        }
      }
      if (targetIdx !== -1) {
        const item = this.menuData.splice(idx, 1)[0];
        this.menuData.splice(targetIdx, 0, item);
      }
    }
    this.saveMenuData();
    this.renderMenu();
    if (window.admin && typeof window.admin.filterAdminDishes === 'function') {
      window.admin.filterAdminDishes();
    }
    this.showToast(`Updated dish order for "${current.name}"`, 'info');
  }

  openExternalPlatform(platform) {
    if (platform === 'zomato' || platform === 'swiggy') {
      window.open(this.getDeliveryUrl(platform), '_blank', 'noopener,noreferrer');
      return;
    }
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (platform === 'swiggy') {
      const appUrl = 'swiggy://restaurant?restaurant_id=787948';
      const webUrl = 'https://www.swiggy.com/restaurants/hotel-premier-saket-society-bhusawal-787948';
      if (isMobile) {
        const start = Date.now();
        window.location.href = appUrl;
        setTimeout(() => {
          if (Date.now() - start < 1500) {
            window.location.href = webUrl;
          }
        }, 600);
      } else {
        const win = window.open(webUrl, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          window.location.href = webUrl;
        }
      }
      return;
    }

    if (platform === 'zomato') {
      // Direct restaurant deep-link to Hotel Premier Bhusawal page
      const appUrl = 'zomato://restaurant/search?q=Hotel%20Premier%20Bhusawal';
      const webUrl = 'https://www.zomato.com/bhusawal/restaurants?q=Hotel+Premier';
      if (isMobile) {
        const start = Date.now();
        window.location.href = appUrl;
        setTimeout(() => {
          if (Date.now() - start < 1500) {
            window.location.href = webUrl;
          }
        }, 600);
      } else {
        const win = window.open(webUrl, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          window.location.href = webUrl;
        }
      }
      return;
    }

    if (platform === 'google') {
      const webUrl = 'https://www.google.com/search?q=Hotel+Premier+Jamner+Road+Bhusawal+reviews';
      window.open(webUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const fallbackUrl = 'https://www.swiggy.com/restaurants/hotel-premier-saket-society-bhusawal-787948';
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  }

  routeToReview(platform) {
    this.openExternalPlatform(platform);
  }

  getDeliveryUrl(platform, dish = {}) {
    const restaurants = {
      zomato: 'https://www.zomato.com/bhusawal/hotel-premier-bhusawal-locality/order',
      swiggy: 'https://www.swiggy.com/city/bhusawal/hotel-premier-gayatri-nagar-jamner-road-rest165366'
    };
    // Accept a platform's real item/share URL when one has been supplied.
    // Otherwise the verified restaurant menu is the reliable destination.
    const candidate = dish[`${platform}OrderUrl`];
    if (candidate) {
      try {
        const url = new URL(candidate);
        const domain = `${platform}.com`;
        if (url.protocol === 'https:' && (url.hostname === domain || url.hostname.endsWith(`.${domain}`))) return url.href;
      } catch (e) {}
    }
    return restaurants[platform];
  }

  // ==================== 3. BULK BOOKING & CALCULATOR ENGINE (14 ROOMS PROPERTY) ====================
  getBulkDeals() {
    const defaults = window.HOTEL_PREMIER_HOTEL_DATA?.bulkMarriageDeals || [];
    try {
      const saved = JSON.parse(localStorage.getItem('hotel_premier_bulk_deals_override') || 'null');
      return JSON.parse(JSON.stringify(window.HotelGroupStays ? window.HotelGroupStays.deals(saved, defaults) : defaults));
    } catch (_) { return JSON.parse(JSON.stringify(defaults)); }
  }

  renderBulkDealsSection() {
    const container = document.getElementById('bulk-deals-tiers-container');
    if (!container) return;

    const deals = this.getBulkDeals();
    const escape = value => String(value || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    container.innerHTML = deals.map((deal, idx) => `
      <div class="bulk-tier-card ${idx === deals.length - 1 ? 'featured' : ''}">
        <div class="tier-tag">${escape(deal.badge || `${deal.minRooms}+ ROOMS`)}</div>
        <h4 class="tier-name">${escape(deal.name)}</h4>
        <div class="tier-privilege-label hp-inline-799769be9495">
          ${escape(deal.privilege || 'Availability confirmed by our team')}
        </div>
        <ul class="tier-perks">
          ${(deal.perks || []).map(p => `<li>${escape(p)}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  calculateBulkQuote() {
    const get = id => document.getElementById(id);
    if (!get('calc-room-type') || !window.HotelGroupStays) return;
    this.latestQuote = null;
    try {
      const q = window.HotelGroupStays.estimate({
        type:get('calc-room-type').value, rooms:get('calc-rooms-number').value,
        guests:get('calc-guests').value, nights:get('calc-num-nights').value,
        plan:get('calc-plan-select').value, paidBeds:get('calc-extra-beds').value,
        childBeds:get('calc-child-beds').value
      }, window.HOTEL_PREMIER_HOTEL_DATA.roomCategories);
      for (const id of ['calc-rooms-number','calc-rooms-slider']) {
        const el = get(id); el.min=q.minRooms; el.max=q.maxRooms; el.value=q.rooms; el.disabled=q.minRooms===q.maxRooms;
      }
      get('calc-guests').min=q.rooms; get('calc-guests').max=q.maxGuests; get('calc-guests').value=q.guests;
      get('calc-extra-beds').max=q.maxBeds-q.childBeds; get('calc-extra-beds').value=q.paidBeds;
      get('calc-child-beds').max=q.maxBeds-q.paidBeds; get('calc-child-beds').value=q.childBeds;
      if (get('calc-extra-bed-label')) get('calc-extra-bed-label').textContent='Chargeable extra beds (₹'+q.extraBedRate+'/night)';
      const money = amount => '₹ '+amount.toLocaleString('en-IN')+'/-';
      get('quote-regular-price').innerText = q.valid ? money(q.baseRoomPrice) : '—';
      get('quote-final-price').innerText = q.valid ? money(q.finalPrice) : '—';
      const tier = this.getBulkDeals().slice().sort((a,b)=>b.minRooms-a.minRooms).find(d=>q.rooms>=d.minRooms);
      get('quote-discount-tag').innerText = tier?.name || 'Published room tariffs';
      get('quote-extra-bed-row').style.display=q.paidBeds ? 'flex':'none';
      get('quote-extra-bed-count').innerText=q.paidBeds;
      get('quote-extra-bed-amount').innerText=money(q.extraBedCost);
      get('group-stay-validation').textContent=q.error || (q.rooms+' rooms · '+q.guests+' guests including children · '+q.nights+' night(s). Availability and exact room allocation require staff confirmation.');
      get('group-stay-send').disabled=!q.valid;
      if (q.valid) this.latestQuote = {
        ...q, extraBeds:q.paidBeds, regularPrice:q.finalPrice,
        roomType:get('calc-room-type').options[get('calc-room-type').selectedIndex].text,
        eventType:get('calc-event-type').value, privilegeTier:tier?.name || 'Published room tariffs'
      };
      return this.latestQuote;
    } catch (_) {
      get('group-stay-validation').textContent='This estimate needs staff confirmation. Please contact reception.';
      get('group-stay-send').disabled=true;
    }
  }

  sendBulkWhatsAppInquiry() {
    // Always recalculate: stale previews must not bypass current policy limits.
    const q = this.calculateBulkQuote();
    if (!q?.valid || q.rooms>12 || q.guests>36) return;
    const name = document.getElementById('calc-bulk-guest-name')?.value?.trim() || '';
    const rawPhone = document.getElementById('calc-bulk-guest-phone')?.value?.trim() || '';
    const phone = this.sanitizeIndianMobile(rawPhone);
    if (rawPhone && !this.isValidIndianMobile(phone)) {
      this.showToast('Please enter a valid organizer mobile number.','warning');
      document.getElementById('calc-bulk-guest-phone')?.focus(); return;
    }
    const message = [
      'HOTEL PREMIER — GROUP STAY ENQUIRY',
      name ? 'Organizer: '+name : '', phone ? 'Mobile: '+phone : '',
      'Purpose: '+q.eventType, 'Collection: '+q.roomType,
      'Rooms: '+q.rooms+' (maximum group allocation: 12)',
      'Guests including children: '+q.guests+' (maximum: 36)',
      'Nights: '+q.nights,
      'Meal plan: '+(q.plan==='CP' ? 'CP — fixed-menu breakfast. Terms & conditions apply. Speak to our staff for details.' : 'Room only (RO)'),
      'Chargeable extra beds: '+q.paidBeds+' at ₹'+q.extraBedRate+'/bed/night',
      'Complimentary child beds (ages 5–10 inclusive): '+q.childBeds+'; meals to be confirmed separately',
      'Estimate: ₹'+q.finalPrice.toLocaleString('en-IN')+' using published double-occupancy room tariffs',
      'Please check availability, room allocation and final charges. This is an enquiry, not a confirmed booking.'
    ].filter(Boolean).join('\n');
    const waUrl = 'https://wa.me/919325375802?text=' + encodeURIComponent(message);
    const waWin = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!waWin || waWin.closed || typeof waWin.closed === 'undefined') {
      window.location.href = waUrl;
    }
    this.showToast('Review the enquiry in WhatsApp, then send it to reception.','info');
  }

  // ==================== RESTAURANT EVENTS, PARTY PACKAGES & LUNCH BUYOUT ====================
  scrollToEventsSection() {
    const el = document.getElementById('restaurant-events-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getRestaurantEventPackages() {
    return (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.restaurantEventPackages)
      ? window.HOTEL_PREMIER_HOTEL_DATA.restaurantEventPackages
      : [];
  }

  filterEventPackages(cat, btnEl) {
    this.currentEventCategoryFilter = cat;
    const tabBtns = document.querySelectorAll('.event-filter-tab');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    if (btnEl) {
      btnEl.classList.add('active');
    }
    this.renderRestaurantEventPackages(cat);
  }

  renderRestaurantEventPackages(filter = 'all') {
    const container = document.getElementById('restaurant-events-packages-grid');
    if (!container) return;

    let pkgs = this.getRestaurantEventPackages();
    if (filter && filter !== 'all') {
      pkgs = pkgs.filter(p => p.category === filter);
    }

    if (pkgs.length === 0) {
      container.innerHTML = `<div class="no-events-found">No packages found for this category.</div>`;
      return;
    }

    container.innerHTML = pkgs.map(pkg => {
      // Strip any leading emoji from name and badge so exactly ONE icon is displayed
      const displayName = (pkg.name || '').replace(/^[\p{Emoji}\u200d\uFE0F\s]+/u, '').trim();
      const displayBadge = (pkg.badge || '').replace(/^[\p{Emoji}\u200d\uFE0F\s]+/u, '').trim();

      let subTitle = '';
      if (this.currentLang === 'hi' && pkg.hindiName) {
        const cleanHi = (pkg.hindiName || '').replace(/^[\p{Emoji}\u200d\uFE0F\s]+/u, '').trim();
        subTitle = `<div class="event-pkg-sub">${cleanHi}</div>`;
      } else if (this.currentLang === 'mr' && pkg.marathiName) {
        const cleanMr = (pkg.marathiName || '').replace(/^[\p{Emoji}\u200d\uFE0F\s]+/u, '').trim();
        subTitle = `<div class="event-pkg-sub">${cleanMr}</div>`;
      }

      const amenitiesHtml = (pkg.amenities && pkg.amenities.length > 0)
        ? `<div class="event-pkg-amenities">
            ${pkg.amenities.map(a => `<span class="amenity-chip">✨ ${a}</span>`).join('')}
           </div>`
        : '';

      return `
        <div class="event-package-card ${pkg.featured ? 'featured' : ''} ${pkg.isBuyout ? 'buyout-card' : ''}" id="card-${pkg.id}">
          ${(displayBadge || pkg.tag) ? `
          <div class="event-pkg-top-bar">
            ${displayBadge ? `<span class="event-pkg-badge">${displayBadge}</span>` : ''}
            ${pkg.tag ? `<span class="event-pkg-tag">${pkg.tag}</span>` : ''}
          </div>` : ''}

          <div class="event-pkg-header">
            <span class="event-pkg-icon">${pkg.icon || '🍽️'}</span>
            <div>
              <h4 class="event-pkg-title">${displayName}</h4>
              ${subTitle}
            </div>
          </div>

          <div class="event-pkg-pricing">
            <span class="pkg-price-currency">₹</span>
            <span class="pkg-price-val">${pkg.ratePerPax}</span>
            <span class="pkg-price-unit">/ person</span>
            <span class="pkg-pax-limit">${pkg.isBuyout ? 'Up to 40 Pax' : 'Min ' + (pkg.minPax || 15) + ' Pax'}</span>
          </div>

          <p class="event-pkg-desc">${pkg.desc}</p>

          ${amenitiesHtml}

          <div class="event-menu-choices-block">
            <div class="menu-choices-heading">🥗 Curated Pure Veg Spread & Services:</div>
            <ul class="event-menu-choices-list">
              ${(pkg.menuChoices || []).map(item => `<li><span class="choice-bullet">✦</span> <span>${item}</span></li>`).join('')}
            </ul>
          </div>

          <div class="event-pkg-actions">
            <button type="button" class="btn-select-event-pkg" onclick="window.app ? window.app.selectEventPackage('${pkg.id}') : null">
              <span>🧮 Calculate Quote ➔</span>
            </button>
            <button type="button" class="btn-whatsapp-event-pkg" onclick="window.app ? window.app.inquirePackageWhatsApp('${pkg.id}') : null">
              <span>💬 Inquire on WhatsApp</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  inquirePackageWhatsApp(pkgId) {
    const pkgs = this.getRestaurantEventPackages();
    const pkg = pkgs.find(p => p.id === pkgId) || pkgs[0];
    const msg = `*HOTEL PREMIER BHUSAWAL - RESTAURANT EVENT INQUIRY*%0A` +
      `---------------------------------------%0A` +
      `✨ *Package:* ${encodeURIComponent(pkg.name)}%0A` +
      `💰 *Rate:* ₹${pkg.ratePerPax}/person (${pkg.isBuyout ? 'Up to 40 Pax' : 'Min ' + (pkg.minPax || 15) + ' Pax'})%0A` +
      `🏢 *Venue:* Pride Pure Veg AC Restaurant, Hotel Premier (Max 40 Pax Seating • No Banquet Hall)%0A` +
      `⏰ *Timing:* Lunch Party (12:00 PM – 3:00 PM Only • Strictly Subject to Availability)%0A` +
      `---------------------------------------%0A` +
      `Hello Hotel Premier Management, I want to book/inquire about this event package for our upcoming gathering. Please share date availability and booking details!`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=919325375802&text=${msg}`;
    window.open(whatsappUrl, '_blank');
  }

  selectEventPackage(pkgId) {
    const pkgSelect = document.getElementById('calc-event-package');
    if (pkgSelect) {
      pkgSelect.value = pkgId;
    }
    const occasionSelect = document.getElementById('calc-event-occasion');
    if (pkgId === 'pkg-lunch-buyout' && occasionSelect) {
      occasionSelect.value = 'Full Restaurant Lunch Buyout';
      const slotSelect = document.getElementById('calc-event-timeslot');
      if (slotSelect) slotSelect.value = 'Lunch (12:00 PM - 3:00 PM)';
    } else if (pkgId === 'pkg-engagement' && occasionSelect) {
      occasionSelect.value = 'Engagement, Ring Ceremony & Roka';
    } else if (pkgId === 'pkg-corporate' && occasionSelect) {
      occasionSelect.value = 'Corporate Meeting / Seminar';
    } else if (pkgId === 'pkg-hightea' && occasionSelect) {
      occasionSelect.value = 'Kitty Party / High-Tea';
    } else if (pkgId === 'pkg-birthday' && occasionSelect) {
      occasionSelect.value = 'Birthday Celebration';
    }

    const paxInput = document.getElementById('calc-event-pax');
    if (paxInput) {
      const pkgs = this.getRestaurantEventPackages();
      const p = pkgs.find(x => x.id === pkgId);
      if (p && p.minPax && parseInt(paxInput.value) < p.minPax) {
        paxInput.value = p.minPax;
      }
    }

    this.calculateRestaurantEventQuote();
    const calc = document.getElementById('restaurant-event-calculator');
    if (calc) {
      calc.scrollIntoView({ behavior: 'smooth' });
    }
  }

  stepPax(delta) {
    const paxInput = document.getElementById('calc-event-pax');
    if (!paxInput) return;
    let current = parseInt(paxInput.value) || 20;
    current += delta;
    if (current < 15) current = 15;
    if (current > 40) current = 40;
    paxInput.value = current;
    this.calculateRestaurantEventQuote();
  }

  // ==================== EVENT DECORATIONS & AV SUPPLIES GALLERY ====================
  renderEventDecorations() {
    const container = document.getElementById('event-decorations-grid');
    if (!container) return;

    const items = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.eventDecorations) || [];
    if (!items.length) {
      container.innerHTML = '';
      return;
    }

    const decorToCheckboxMap = {
      'decor-balloon': 'addon-balloon-decor',
      'decor-floral-ring': 'addon-floral-ring',
      'decor-baby-shower': 'addon-baby-decor',
      'av-projector': 'addon-projector',
      'av-sound-mic': 'addon-sound-mic'
    };

    container.innerHTML = items.map(item => {
      const checkboxId = decorToCheckboxMap[item.id];
      const isChecked = checkboxId ? Boolean(document.getElementById(checkboxId)?.checked) : false;
      const btnLabel = isChecked ? '✓ Added to Quote' : '➕ Add to Quote';
      const btnClass = isChecked ? 'btn-decor-add added' : 'btn-decor-add';

      return `
        <div class="decor-card" id="card-${item.id}">
          <div class="decor-img-wrap">
            <img height="900" width="1200" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.onerror=null; this.src='assets/premier-original-logo.png'">
            <span class="decor-badge">${item.badge}</span>
            <span class="decor-chargeable-pill">💰 Chargeable Add-on</span>
          </div>
          <div class="decor-body">
            <div class="decor-meta-row">
              <span class="decor-category">${item.category}</span>
              <span class="decor-price">${item.priceDisplay}</span>
            </div>
            <h4 class="decor-title">${item.title}</h4>
            <p class="decor-desc">${item.desc}</p>
            <div class="decor-actions">
              <button type="button" class="${btnClass}" id="btn-toggle-${item.id}" onclick="window.app ? window.app.toggleDecorAddon('${item.id}') : null">
                <span>${btnLabel}</span>
              </button>
              <a href="https://api.whatsapp.com/send?phone=919325375802&text=${encodeURIComponent('Hello Hotel Premier Management, I want to inquire about custom decoration/AV supplies: ' + item.title + ' (' + item.priceDisplay + ')')}" target="_blank" class="btn-decor-inquire">
                <span>💬 Inquire</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  toggleDecorAddon(decorId) {
    const decorToCheckboxMap = {
      'decor-balloon': 'addon-balloon-decor',
      'decor-floral-ring': 'addon-floral-ring',
      'decor-baby-shower': 'addon-baby-decor',
      'av-projector': 'addon-projector',
      'av-sound-mic': 'addon-sound-mic'
    };

    const checkboxId = decorToCheckboxMap[decorId];
    if (!checkboxId) return;

    const cb = document.getElementById(checkboxId);
    if (cb) {
      cb.checked = !cb.checked;
      this.calculateRestaurantEventQuote();

      // Update button visual state
      const btn = document.getElementById(`btn-toggle-${decorId}`);
      if (btn) {
        if (cb.checked) {
          btn.classList.add('added');
          btn.innerHTML = '<span>✓ Added to Quote</span>';
          this.showToast('Added to Event Quote!', 'success');
        } else {
          btn.classList.remove('added');
          btn.innerHTML = '<span>➕ Add to Quote</span>';
          this.showToast('Removed from Event Quote', 'info');
        }
      }

      const calc = document.getElementById('restaurant-event-calculator');
      if (calc) {
        calc.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  calculateRestaurantEventQuote() {
    const pkgSelect = document.getElementById('calc-event-package');
    const occasionSelect = document.getElementById('calc-event-occasion');
    const paxInput = document.getElementById('calc-event-pax');
    const slotSelect = document.getElementById('calc-event-timeslot');
    const dateInput = document.getElementById('calc-event-date');

    if (!pkgSelect || !paxInput) return;

    const selectedPkgId = pkgSelect.value;
    const pkgs = this.getRestaurantEventPackages();
    const pkg = pkgs.find(p => p.id === selectedPkgId) || pkgs[0];

    const minPax = pkg.minPax || 15;
    let pax = parseInt(paxInput.value) || 20;
    if (pax < minPax) pax = minPax;
    if (pax > 40) pax = 40; // Pride Pure Veg AC Restaurant seating capacity max 40 Pax
    paxInput.value = pax;
    paxInput.min = minPax;

    const hintEl = document.getElementById('pax-range-hint');
    if (hintEl) {
      hintEl.innerText = `Pride AC Restaurant seating: ${minPax} to 40 Pax max`;
    }

    const occasion = occasionSelect ? occasionSelect.value : 'Birthday Celebration';
    const timeslot = slotSelect ? slotSelect.value : 'Lunch (12:00 PM - 3:00 PM)';
    const dateVal = (dateInput && dateInput.value) ? dateInput.value : 'To be confirmed';

    // Base menu calculation
    const ratePerPax = pkg.ratePerPax;
    const baseTotal = ratePerPax * pax;

    // Optional Theme Decor & AV Add-ons (Chargeable / Customizable)
    let addonsTotal = 0;
    const chosenAddons = [];

    const balloonDecor = document.getElementById('addon-balloon-decor');
    if (balloonDecor && balloonDecor.checked) {
      addonsTotal += 1500;
      chosenAddons.push('Theme Balloon & Cake Table Decor (+ ₹1,500)');
    }
    const floralRing = document.getElementById('addon-floral-ring');
    if (floralRing && floralRing.checked) {
      addonsTotal += 2800;
      chosenAddons.push('Floral Ring & Stage Backdrop (+ ₹2,800)');
    }
    const babyDecor = document.getElementById('addon-baby-decor');
    if (babyDecor && babyDecor.checked) {
      addonsTotal += 2200;
      chosenAddons.push('Baby Shower Dohale Jevan Theme Decor (+ ₹2,200)');
    }
    const projector = document.getElementById('addon-projector');
    if (projector && projector.checked) {
      addonsTotal += 1500;
      chosenAddons.push('HD Projector & Screen AV (+ ₹1,500)');
    }
    const soundMic = document.getElementById('addon-sound-mic');
    if (soundMic && soundMic.checked) {
      addonsTotal += 999;
      chosenAddons.push('Party Sound System & 2 Wireless Mics (+ ₹999)');
    }

    // Food / Beverage Extras
    const liveChaat = document.getElementById('addon-live-chaat');
    if (liveChaat && liveChaat.checked) {
      const chaatCost = 45 * pax;
      addonsTotal += chaatCost;
      chosenAddons.push(`Live Pani Puri / Chaat Counter (+ ₹${chaatCost})`);
    }
    const extraSweet = document.getElementById('addon-extra-sweet');
    if (extraSweet && extraSweet.checked) {
      const sweetCost = 35 * pax;
      addonsTotal += sweetCost;
      chosenAddons.push(`Extra Sweet / Ice Cream Cup (+ ₹${sweetCost})`);
    }
    const coldDrinks = document.getElementById('addon-cold-drinks');
    if (coldDrinks && coldDrinks.checked) {
      const drinksCost = 30 * pax;
      addonsTotal += drinksCost;
      chosenAddons.push(`Unlimited Soft Drinks / Cold Beverages (+ ₹${drinksCost})`);
    }

    const grandTotal = baseTotal + addonsTotal;
    const effectiveRate = Math.round(grandTotal / pax);

    // Update DOM
    const badgeEl = document.getElementById('event-quote-tier-badge');
    const rateEl = document.getElementById('event-effective-rate');
    const paxCountEl = document.getElementById('summary-pax-count');
    const slotEl = document.getElementById('summary-slot-name');
    const baseTotalEl = document.getElementById('summary-base-total');
    const addonsRowEl = document.getElementById('summary-addons-row');
    const addonsTotalEl = document.getElementById('summary-addons-total');
    const grandTotalEl = document.getElementById('event-grand-total');

    if (badgeEl) badgeEl.innerText = pkg.name.toUpperCase();
    if (rateEl) rateEl.innerText = effectiveRate;
    if (paxCountEl) paxCountEl.innerText = `${pax} Pax (Max 40 Pax)`;
    if (slotEl) slotEl.innerText = timeslot;
    if (baseTotalEl) baseTotalEl.innerText = `₹ ${baseTotal.toLocaleString('en-IN')}`;

    if (addonsRowEl && addonsTotalEl) {
      if (addonsTotal > 0) {
        addonsRowEl.style.display = 'flex';
        addonsTotalEl.innerText = `+ ₹ ${addonsTotal.toLocaleString('en-IN')}`;
      } else {
        addonsRowEl.style.display = 'none';
      }
    }

    if (grandTotalEl) grandTotalEl.innerText = `₹ ${grandTotal.toLocaleString('en-IN')}/-`;

    this.latestEventQuote = {
      pkgName: pkg.name,
      ratePerPax: ratePerPax,
      pax: pax,
      occasion: occasion,
      timeslot: timeslot,
      date: dateVal,
      baseTotal: baseTotal,
      addonsTotal: addonsTotal,
      chosenAddons: chosenAddons,
      grandTotal: grandTotal,
      effectiveRate: effectiveRate,
      isBuyout: pkg.isBuyout
    };
  }

  sendRestaurantEventWhatsAppInquiry() {
    if (!this.latestEventQuote) {
      this.calculateRestaurantEventQuote();
    }
    const q = this.latestEventQuote;
    const addonsText = (q.chosenAddons && q.chosenAddons.length > 0)
      ? q.chosenAddons.join(', ')
      : 'None selected';

    const eventName = document.getElementById('calc-event-guest-name')?.value.trim() || '';
    const eventPhone = document.getElementById('calc-event-guest-phone')?.value.trim() || '';
    if (eventName || eventPhone) {
      this.saveGuestProfile({ name: eventName, phone: eventPhone });
    }
    const guestContactLine = (eventName || eventPhone)
      ? `👤 *Booked By:* ${encodeURIComponent(eventName || 'Guest')} (${encodeURIComponent(eventPhone || 'Not provided')})%0A`
      : '';

    const msg = `*HOTEL PREMIER BHUSAWAL - RESTAURANT EVENT & LUNCH ENQUIRY*%0A` +
      `---------------------------------------%0A` +
      guestContactLine +
      `🎉 *Occasion:* ${encodeURIComponent(q.occasion)}%0A` +
      `🍽️ *Package:* ${encodeURIComponent(q.pkgName)}%0A` +
      `👥 *Number of Guests:* ${q.pax} Pax (Pride AC Restaurant Seating Capacity: Max 40 Pax)%0A` +
      `⏰ *Dining Time Slot:* ${encodeURIComponent(q.timeslot)}%0A` +
      `📅 *Preferred Date:* ${encodeURIComponent(q.date)}%0A` +
      `🎨 *Theme Decor & Add-ons (Chargeable):* ${encodeURIComponent(addonsText)}%0A` +
      `💰 *Estimated Total Quote:* ₹ ${q.grandTotal.toLocaleString('en-IN')}/- (Approx ₹ ${q.effectiveRate}/person)%0A` +
      `🏢 *Venue:* Pride Pure Veg AC Restaurant, Hotel Premier (Max 40 Pax Seating • No Venue Fee • No Banquet Hall)%0A` +
      `---------------------------------------%0A` +
      `Hello Hotel Premier Management, please check lunch/event availability and confirm our dining reservation!`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=919325375802&text=${msg}`;
    window.open(whatsappUrl, '_blank');
  }

  // ==================== 4. LOCATION HUB & GOOGLE MAPS QR ====================
  renderLocationQR() {
    const mount = document.getElementById('location-qr-mount');
    if (!mount) return;

    const mapsUrl = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.hotelInfo)
      ? window.HOTEL_PREMIER_HOTEL_DATA.hotelInfo.googleMapsUrl
      : 'https://www.google.com/maps/search/?api=1&query=Hotel+Premier+Jamner+Road+Bhusawal';

    mount.innerHTML = '';
    if (window.QRCode) {
      try {
        new QRCode(mount, {
          text: mapsUrl,
          width: 160,
          height: 160,
          colorDark: '#0E1D36',
          colorLight: '#FFFFFF',
          correctLevel: QRCode.CorrectLevel.H
        });
      } catch (e) {
        mount.innerHTML = `<img height="900" width="1200" class="hp-inline-0b224c744666" src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(mapsUrl)}" alt="Location QR">`;
      }
    } else {
      mount.innerHTML = `<img height="900" width="1200" class="hp-inline-0b224c744666" src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(mapsUrl)}" alt="Location QR">`;
    }
  }


  filterLocalAttractions(category) {
    this.currentAttractionFilter = category;

    // Update active state on filter chips
    const filterContainer = document.getElementById('attraction-filter-chips');
    if (filterContainer) {
      filterContainer.querySelectorAll('.attraction-filter-btn').forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    this.renderLocalAttractions(category);
  }

  renderLocalAttractions(categoryFilter = null) {
    const container = document.getElementById('local-attractions-feed');
    if (!container || !window.HOTEL_PREMIER_HOTEL_DATA || !window.HOTEL_PREMIER_HOTEL_DATA.localAttractions) return;

    const filter = categoryFilter || this.currentAttractionFilter || 'all';
    let attractions = window.HOTEL_PREMIER_HOTEL_DATA.localAttractions;

    if (filter !== 'all') {
      attractions = attractions.filter(item => item.category === filter);
    }

    container.innerHTML = attractions.map((item, cardIdx) => {
      const imgList = (item.images && item.images.length > 0)
        ? item.images
        : [{ url: item.image, caption: item.title }];
      const hasMultiple = imgList.length > 1;

      const slidesHtml = imgList.map((imgObj, sIdx) => `
        <div class="attraction-slide" data-slide-index="${sIdx}">
          <img height="900" width="1200" src="${imgObj.url}" alt="${imgObj.caption || item.title}" class="attraction-img" loading="lazy" onerror="this.onerror=null; this.src='assets/hotel-images/exterior-facade-twilight.jpg';">
          ${imgObj.caption ? `<span class="attraction-slide-caption">${imgObj.caption}</span>` : ''}
        </div>
      `).join('');

      const dotsHtml = hasMultiple ? `
        <div class="attraction-gallery-dots" id="dots-${item.id}">
          ${imgList.map((_, dIdx) => `
            <button type="button" class="attraction-dot ${dIdx === 0 ? 'active' : ''}" aria-label="Slide ${dIdx + 1}" onclick="window.app ? window.app.scrollAttractionSlide('${item.id}', ${dIdx}) : null"></button>
          `).join('')}
        </div>
      ` : '';

      const arrowsHtml = hasMultiple ? `
        <button type="button" class="attraction-nav-btn prev" aria-label="Previous Photo" onclick="window.app ? window.app.navAttractionSlide('${item.id}', -1) : null">&#10094;</button>
        <button type="button" class="attraction-nav-btn next" aria-label="Next Photo" onclick="window.app ? window.app.navAttractionSlide('${item.id}', 1) : null">&#10095;</button>
      ` : '';

      return `
        <div class="attraction-card" id="${item.id}">
          <div class="attraction-img-wrap">
            <div class="attraction-gallery-track" id="gallery-${item.id}" onscroll="window.app ? window.app.handleAttractionScroll('${item.id}') : null">
              ${slidesHtml}
            </div>
            ${arrowsHtml}
            ${dotsHtml}
            <span class="attraction-category-badge">${item.categoryLabel || item.category}</span>
            <span class="attraction-distance-badge">&#128663; ${item.distance}</span>
          </div>
          <div class="attraction-card-content">
            <h4 class="attraction-title">${item.title}</h4>
            <div class="attraction-marathi-title">${item.marathiTitle || ''}</div>
            <div class="attraction-timing-row">
              <span class="timing-icon">&#128197;</span>
              <div>
                <span class="hp-inline-f6edf7b1c1b5">Best Time / Season:</span>
                <span>${item.bestTime}</span>
              </div>
            </div>
            <p class="attraction-desc">${item.desc}</p>
            <div class="attraction-highlights-list">
              ${(item.highlights || []).map(h => `<span class="attraction-highlight-pill">&#10024; ${h}</span>`).join('')}
            </div>
            <div class="attraction-card-footer">
              <div class="attraction-travel-meta">
                <span>Drive: <strong>${item.time}</strong></span>
              </div>
              <a href="${item.mapUrl}" target="_blank" rel="noopener noreferrer" class="attraction-directions-btn">
                <span>&#129517; Live Directions &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  scrollAttractionSlide(cardId, slideIdx) {
    const track = document.getElementById(`gallery-${cardId}`);
    if (!track) return;
    const slides = track.querySelectorAll('.attraction-slide');
    if (slides[slideIdx]) {
      track.scrollTo({ left: slides[slideIdx].offsetLeft, behavior: 'smooth' });
    }
  }

  navAttractionSlide(cardId, direction) {
    const track = document.getElementById(`gallery-${cardId}`);
    if (!track) return;
    const slides = track.querySelectorAll('.attraction-slide');
    if (!slides.length) return;
    const currentScroll = track.scrollLeft;
    const slideWidth = track.clientWidth || 280;
    const currentIdx = Math.round(currentScroll / slideWidth);
    const nextIdx = Math.max(0, Math.min(slides.length - 1, currentIdx + direction));
    this.scrollAttractionSlide(cardId, nextIdx);
  }

  handleAttractionScroll(cardId) {
    const track = document.getElementById(`gallery-${cardId}`);
    const dotsWrap = document.getElementById(`dots-${cardId}`);
    if (!track || !dotsWrap) return;
    const slideWidth = track.clientWidth || 280;
    const currentIdx = Math.round(track.scrollLeft / slideWidth);
    const dots = dotsWrap.querySelectorAll('.attraction-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIdx);
    });
  }

  // Deprecated backwards-compatibility stub
  renderLocationDistances() {
    /* Legacy no-op stub to prevent cached PWA clients from throwing */
  }

  shareLocationOnWhatsApp() {
    const mapsUrl = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.hotelInfo)
      ? window.HOTEL_PREMIER_HOTEL_DATA.hotelInfo.googleMapsUrl
      : 'https://www.google.com/maps/search/?api=1&query=Hotel+Premier+Jamner+Road+Bhusawal';

    const msg = `*HOTEL PREMIER BHUSAWAL - LOCATION & GPS DIRECTIONS*%0A` +
      `---------------------------------------%0A` +
      `📍 *Address:* Near Nahata College, Saket Soc, Jamner Road, Bhusawal - 425 201%0A` +
      `🚆 *Landmark:* 15 Mins (2 KM) from Bhusawal Railway Junction%0A` +
      `📞 *Contact:* 09325375802 (Primary) / 09370848917 / (02582) 240422%0A` +
      `🗺️ *Live Google Maps Directions Link:*%0A${encodeURIComponent(mapsUrl)}%0A` +
      `---------------------------------------%0A` +
      `Please drive safely to Hotel Premier Bhusawal!`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${msg}`;
    window.open(whatsappUrl, '_blank');
  }

  // ==================== INTERACTIVE ROUTE SELECTION MODALS ====================
  openRouteOptionsModal(type) {
    const modal = document.getElementById('route-options-modal');
    const titleEl = document.getElementById('route-options-modal-title');
    const descEl = document.getElementById('route-options-modal-desc');
    const listEl = document.getElementById('route-options-list');
    if (!modal || !titleEl || !descEl || !listEl) return;

    const premierDest = 'Hotel+Premier,+Jamner+Road,+Bhusawal';

    let title = '';
    let desc = '';
    let options = [];

    if (type === 'wedding-lawns') {
      title = '🎉 Select Event Lawn or Hall';
      desc = 'Choose your event venue below to get direct GPS driving directions to Hotel Premier (approx. 8–10 mins):';
      options = [
        {
          name: 'Star Lawns',
          meta: 'Prime Wedding & Celebration Venue • Approx. 3.0 KM',
          icon: '✨',
          origin: 'Star+Lawns,+Bhusawal'
        },
        {
          name: 'Radhakrishna Lawns',
          meta: 'Famous Marriage & Family Function Lawn • Approx. 3.2 KM',
          icon: '🌸',
          origin: 'Radhakrishna+Lawns,+Bhusawal'
        },
        {
          name: 'Balaji Lawns',
          meta: 'Celebration & Wedding Lawn • Approx. 2.8 KM',
          icon: '🌺',
          origin: 'Balaji+Lawns,+Bhusawal'
        },
        {
          name: 'Aditya Lawns',
          meta: 'Reception & Grand Barat Destination • Approx. 3.5 KM',
          icon: '👑',
          origin: 'Aditya+Lawns,+Bhusawal'
        },
        {
          name: 'Morya Halls',
          meta: 'Banquet & Community Celebration Hall • Approx. 2.5 KM',
          icon: '🏛️',
          origin: 'Morya+Hall,+Bhusawal'
        }
      ];
    } else if (type === 'nh53') {
      title = '🚗 Select Your Highway Approach (NH-53)';
      desc = 'Which direction are you arriving from? Choose your highway approach for the smoothest turn into Hotel Premier:';
      options = [
        {
          name: 'Coming from Jalgaon / Dhule / Surat (West)',
          meta: 'Via Asian Highway 46 / NH-53 entering Bhusawal bypass • Approx. 5 mins',
          icon: '🛣️',
          origin: 'Jalgaon+Road+Bhusawal+Bypass,+NH+53,+Bhusawal'
        },
        {
          name: 'Coming from Nagpur / Akola / Amravati / Wardha (East)',
          meta: 'Via NH-53 Eastern Corridor straight onto Jamner Road • Approx. 5 mins',
          icon: '🚗',
          origin: 'Varangaon+Road+NH+53,+Bhusawal'
        },
        {
          name: 'Coming from Indore / Burhanpur / MP (North)',
          meta: 'Via MP State Highway / NH-53 junction • Approx. 6 mins',
          icon: '🧭',
          origin: 'Burhanpur+Road+Junction,+Bhusawal'
        },
        {
          name: 'Coming from Jamner / Ajanta Caves (South)',
          meta: 'Direct Jamner Road corridor past Nahata College • Approx. 3 mins',
          icon: '🏛️',
          origin: 'Jamner+Road+Bhusawal'
        }
      ];
    }

    titleEl.textContent = title;
    descEl.textContent = desc;

    listEl.innerHTML = options.map(opt => {
      const dirUrl = `https://www.google.com/maps/dir/${opt.origin}/${premierDest}`;
      return `
        <a href="${dirUrl}" target="_blank" rel="noopener noreferrer" class="route-option-btn" onclick="window.app ? window.app.closeRouteOptionsModal() : null">
          <div class="route-option-info">
            <span class="route-option-icon">${opt.icon}</span>
            <div class="route-option-title">
              <span class="route-option-name">${opt.name}</span>
              <span class="route-option-meta">${opt.meta}</span>
            </div>
          </div>
          <span class="route-option-arrow">➔</span>
        </a>
      `;
    }).join('');

    this.openGuestDialog(modal);
  }

  closeRouteOptionsModal() {
    this.closeGuestDialog(document.getElementById('route-options-modal'));
  }

  showToast(message, type = 'info') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'app-toast';
      document.body.appendChild(toast);
    }

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.textContent = `${icon} ${String(message)}`;
    toast.style.display = 'flex';
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 300);
    }, 2800);
  }

  bindMenuSearchEvents() {
    if (this.menuSearchEventsBound) return;
    this.menuSearchEventsBound = true;
    const searchInput = document.getElementById('menu-search-input');
    const clearBtn = document.getElementById('clear-search-btn');

    if (searchInput) {
      searchInput.addEventListener('focus', () => {
        clearTimeout(this.drawerNavigationTimer);
        if (!searchInput.value.trim()) {
          this.renderRecentSearches();
        }
      });

      searchInput.addEventListener('input', (e) => {
        clearTimeout(this._searchLogTimer);
        this.setMenuSearch(e.target.value);
        if (clearBtn) {
          clearBtn.style.display = this.searchQuery.length > 0 ? 'flex' : 'none';
        }

        if (this.searchQuery.trim().length > 0) {
          if (this.searchQuery.trim().length >= 2) {
            clearTimeout(this._searchLogTimer);
            this._searchLogTimer = setTimeout(() => {
              if (window.HOTEL_VAULT) {
                window.HOTEL_VAULT.recordSearchQuery(this.searchQuery);
              }
              this.saveRecentSearch(this.searchQuery);
            }, 1000);
          }
          this.viewMode = 'section';
          const homeView = document.getElementById('home-categories-view');
          const dishesView = document.getElementById('dishes-section-view');
          if (homeView) homeView.style.display = 'none';
          if (dishesView) dishesView.style.display = 'block';

          const titleEl = document.getElementById('active-category-title');
          const hindiEl = document.getElementById('active-category-hindi');
          const countEl = document.getElementById('active-category-count');
          if (titleEl) titleEl.innerText = `Search: "${this.searchQuery}"`;
          if (hindiEl) hindiEl.innerText = this.t('filterAll', 'Search Results');

          const filtered = this.getFilteredDishes();
          const itemsWord = this.t('itemsCount', 'Items');
          if (countEl) countEl.innerText = `${filtered.length} ${itemsWord}`;

          this.renderSectionSlideshow(null);
          this.renderMenu();
        } else if (this.viewMode === 'home') {
          this.showHomeCategories();
        } else {
          this.renderMenu();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.haptic(5);
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        clearBtn.style.display = 'none';
        if (this.viewMode === 'home') {
          this.showHomeCategories();
        } else {
          this.renderMenu();
        }
      });
    }
  }

  bindEvents() {
    this.bindMenuSearchEvents();

    // Modal backdrop click-to-close & body scroll unlock
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.dismissGuestOverlay(modal);
        }
      });
    });

    // Global Escape key listener to close modals & drawers
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const overlays = [...document.querySelectorAll('.modal-backdrop.active')];
        if (overlays.length) {
          this.dismissGuestOverlay(overlays[overlays.length - 1]);
          return;
        }
        const drawer = document.getElementById('menu-sections-drawer-modal');
        if (drawer && drawer.classList.contains('active')) {
          this.closeMenuSectionDrawer();
        }
      }

      // Keep keyboard focus inside an open dish sheet, just like a native dialog.
      if (e.key === 'Tab') {
        const overlays = [...document.querySelectorAll('.modal-backdrop.active')];
        const dishModal = overlays[overlays.length - 1];
        if (!dishModal) return;
        const focusable = [...dishModal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
          .filter(el => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Touch Swipe gestures for Restaurant Hero Carousel
    const heroWrapper = document.getElementById('restaurant-hero-carousel');
    if (heroWrapper) {
      let startX = 0;
      let startY = 0;
      let deltaX = 0;
      let isHorizontal = false;
      heroWrapper.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        deltaX = 0;
        isHorizontal = false;
        if (this.heroAutoInterval) clearInterval(this.heroAutoInterval);
      }, { passive: true });

      heroWrapper.addEventListener('touchmove', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        if (!isHorizontal && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
          isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        }
      }, { passive: true });

      heroWrapper.addEventListener('touchend', () => {
        if (isHorizontal && Math.abs(deltaX) > 40) {
          if (deltaX < 0) {
            this.nextHeroSlide();
          } else {
            this.prevHeroSlide();
          }
        }
        this.startHeroAutoSlide();
      }, { passive: true });
    }

    // Touch Swipe gestures for Section Dishes Slideshow
    const sectionContainer = document.getElementById('section-slideshow-container');
    if (sectionContainer) {
      let startX = 0;
      let startY = 0;
      let deltaX = 0;
      let isHorizontal = false;
      sectionContainer.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        deltaX = 0;
        isHorizontal = false;
        if (this.sectionAutoInterval) clearInterval(this.sectionAutoInterval);
      }, { passive: true });

      sectionContainer.addEventListener('touchmove', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        if (!isHorizontal && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
          isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        }
      }, { passive: true });

      sectionContainer.addEventListener('touchend', () => {
        if (isHorizontal && Math.abs(deltaX) > 40) {
          if (deltaX < 0) {
            this.nextSectionSlide();
          } else {
            this.prevSectionSlide();
          }
        }
        this.startSectionAutoSlide();
      }, { passive: true });
    }

    // Touch Swipe gestures for Room Carousels
    ['ac-super-deluxe', 'ac-deluxe-queen', 'ac-deluxe-twin'].forEach(roomId => {
      const roomEl = document.getElementById(`room-carousel-${roomId}`);
      if (roomEl) {
        let startX = 0;
        let startY = 0;
        let deltaX = 0;
        let isHorizontal = false;
        roomEl.addEventListener('touchstart', (e) => {
          if (!e.touches || e.touches.length === 0) return;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          deltaX = 0;
          isHorizontal = false;
        }, { passive: true });

        roomEl.addEventListener('touchmove', (e) => {
          if (!e.touches || e.touches.length === 0) return;
          deltaX = e.touches[0].clientX - startX;
          const deltaY = e.touches[0].clientY - startY;
          if (!isHorizontal && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
            isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
          }
        }, { passive: true });

        roomEl.addEventListener('touchend', () => {
          if (isHorizontal && Math.abs(deltaX) > 40) {
            if (deltaX < 0) {
              this.nextRoomSlide(roomId);
            } else {
              this.prevRoomSlide(roomId);
            }
          }
        }, { passive: true });
      }
    });

    // Browser URL Hash change listener for independent section navigation
    window.addEventListener('hashchange', () => {
      const rawHash = (window.location.hash || '').replace('#', '').toLowerCase();
      const hashToSection = {
        '': 'section-home',
        'home': 'section-home',
        'sanctuary': 'section-home',
        'stay': 'section-stay',
        'rooms': 'section-stay',
        'suites': 'section-stay',
        'tariffs': 'section-tariffs',
        'tariff': 'section-tariffs',
        'rates': 'section-tariffs',
        'dine': 'section-dine',
        'dining': 'section-dine',
        'food': 'section-dine',
        'celebrate': 'section-celebrate',
        'events': 'section-celebrate',
        'banquets': 'section-celebrate',
        'offers': 'section-celebrate',
        'explore': 'section-explore',
        'arrive': 'section-explore',
        'guide': 'section-explore',
        'location': 'section-explore',
        'reviews': 'guest-feedback-section',
        'feedback': 'guest-feedback-section',
        'contact': 'section-contact',
        'call': 'section-contact',
        'address': 'section-contact'
      };
      const target = window.HotelGuestNetwork ? window.HotelGuestNetwork.resolve(window.location) : (hashToSection[rawHash] || 'section-home');
      if (target !== this.activeSection) {
        this.switchSection(target, false);
      }
    });
  }

  // ==================== 5. STAFF ACCESS CONTROL (HIDDEN FROM GUESTS) ====================
  checkStaffModeAccess() {
    try {
      const params = new URLSearchParams(window.location.search);
      const isStaffUrl = params.has('staff') || params.has('admin') || params.has('manage') || params.has('cms') || window.location.hash === '#admin';
      const isStaff = isStaffUrl || sessionStorage.getItem('hp_staff_mode_active') === 'true';
      if (isStaff) {
        document.body.classList.add('staff-mode-active');
        this.ensureAdminLoaded();
      } else {
        document.body.classList.remove('staff-mode-active');
      }
      const settingsBtn = document.getElementById('cms-settings-admin-btn');
      if (settingsBtn) {
        settingsBtn.style.display = isStaff ? 'inline-flex' : 'none';
      }
    } catch (e) {}
  }

  handleBrandLogoTap(e) {
    if (!this.brandLogoTapCount) {
      this.brandLogoTapCount = 0;
      this.brandLogoTapTimer = null;
    }
    this.brandLogoTapCount++;
    if (this.brandLogoTapTimer) clearTimeout(this.brandLogoTapTimer);

    if (this.brandLogoTapCount >= 5) {
      this.brandLogoTapCount = 0;
      const settingsBtn = document.getElementById('cms-settings-admin-btn');
      if (settingsBtn) {
        const isCurrentlyVisible = settingsBtn.style.display !== 'none';
        if (isCurrentlyVisible) {
          settingsBtn.style.display = 'none';
          sessionStorage.removeItem('hp_staff_mode_active');
          this.showToast('Staff Settings Hidden', 'info');
        } else {
          settingsBtn.style.display = 'inline-flex';
          sessionStorage.setItem('hp_staff_mode_active', 'true');
          this.showToast('Staff Mode Activated ⚙️', 'success');
          this.ensureAdminLoaded();
        }
      }
    } else {
      this.brandLogoTapTimer = setTimeout(() => {
        this.brandLogoTapCount = 0;
      }, 2500);
    }
  }

  // ==================== 5b. SMART QR SCAN AUTO-FILL & PERSISTENT GUEST PROFILE ====================
  initGuestProfile() {
    try {
      // QR context is not a guest identity. Room concierge links must never persist
      // an occupant, room assignment or personal data supplied by URL parameters.
      if (window.HotelGuestNetwork?.resolve(window.location) === 'section-concierge') {
        this.applyGuestProfileToAllForms(this.getGuestProfile());
        this.updateHeaderGuestBadge(this.getGuestProfile());
        this.bindGuestProfileSync();
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const src = params.get('src') || '';
      const tableParam = params.get('table') || params.get('t') || '';
      const roomParam = params.get('room') || params.get('r') || '';
      const nameParam = params.get('name') || params.get('n') || '';
      const phoneParam = params.get('phone') || params.get('mobile') || params.get('p') || '';
      const regionParam = params.get('region') || '';

      let scannedTableOrRoom = '';
      if (src) {
        if (/^(table|room)\s*\w+/i.test(src.trim())) {
          scannedTableOrRoom = src.trim();
        } else if (/^\d+$/.test(src.trim())) {
          scannedTableOrRoom = `Table ${src.trim()}`;
        }
      } else if (tableParam) {
        scannedTableOrRoom = /^table/i.test(tableParam.trim()) ? tableParam.trim() : `Table ${tableParam.trim()}`;
      } else if (roomParam) {
        scannedTableOrRoom = /^room/i.test(roomParam.trim()) ? roomParam.trim() : `Room ${roomParam.trim()}`;
      }

      const existingProfile = this.getGuestProfile();
      const profileToSave = { ...existingProfile };

      if (scannedTableOrRoom) profileToSave.tableOrRoom = scannedTableOrRoom;
      if (nameParam) profileToSave.name = nameParam.trim();
      if (phoneParam) profileToSave.phone = phoneParam.trim();
      if (regionParam) profileToSave.region = regionParam.trim();

      if (scannedTableOrRoom || nameParam || phoneParam || regionParam) {
        this.saveGuestProfile(profileToSave);
      } else {
        this.applyGuestProfileToAllForms(existingProfile);
        this.updateHeaderGuestBadge(existingProfile);
      }

      this.bindGuestProfileSync();
    } catch (e) {
      console.error('Error initializing guest profile:', e);
    }
  }

  prefillFeedbackTableFromUrl() {
    this.initGuestProfile();
  }

  getGuestProfile() {
    try {
      const saved = localStorage.getItem('hp_guest_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { name: '', phone: '', tableOrRoom: '', region: 'Bhusawal Local' };
  }

  saveGuestProfile(data) {
    try {
      const current = this.getGuestProfile();
      const updated = {
        name: (data.name !== undefined ? data.name : current.name).trim(),
        phone: (data.phone !== undefined ? data.phone : current.phone).trim(),
        tableOrRoom: (data.tableOrRoom !== undefined ? data.tableOrRoom : current.tableOrRoom).trim(),
        region: data.region || current.region || 'Bhusawal Local',
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('hp_guest_profile', JSON.stringify(updated));
      this.applyGuestProfileToAllForms(updated);
      this.updateHeaderGuestBadge(updated);
      return updated;
    } catch (e) {
      console.error('Failed to save guest profile', e);
    }
  }

  applyGuestProfileToAllForms(profile) {
    const p = profile || this.getGuestProfile();

    // 1. Feedback form
    const fName = document.getElementById('feedback-guest-name');
    const fPhone = document.getElementById('feedback-guest-phone');
    const fRegion = document.getElementById('feedback-guest-region');
    const fTable = document.getElementById('feedback-table-num');
    if (fName && p.name && (!fName.value || document.activeElement !== fName)) fName.value = p.name;
    if (fPhone && p.phone && (!fPhone.value || document.activeElement !== fPhone)) fPhone.value = p.phone;
    if (fRegion && p.region && document.activeElement !== fRegion) fRegion.value = p.region;
    if (fTable && p.tableOrRoom && (!fTable.value || document.activeElement !== fTable)) fTable.value = p.tableOrRoom;

    // 2. Concierge Booking Wizard Form
    const bkgName = document.getElementById('booking-guest-name');
    const bkgPhone = document.getElementById('booking-guest-phone');
    if (bkgName && p.name && (!bkgName.value || document.activeElement !== bkgName)) bkgName.value = p.name;
    if (bkgPhone && p.phone && (!bkgPhone.value || document.activeElement !== bkgPhone)) bkgPhone.value = p.phone;

    // 3. Event Calculator
    const eName = document.getElementById('calc-event-guest-name');
    const ePhone = document.getElementById('calc-event-guest-phone');
    if (eName && p.name && (!eName.value || document.activeElement !== eName)) eName.value = p.name;
    if (ePhone && p.phone && (!ePhone.value || document.activeElement !== ePhone)) ePhone.value = p.phone;

    // 4. Bulk Marriage Calculator
    const bName = document.getElementById('calc-bulk-guest-name');
    const bPhone = document.getElementById('calc-bulk-guest-phone');
    if (bName && p.name && (!bName.value || document.activeElement !== bName)) bName.value = p.name;
    if (bPhone && p.phone && (!bPhone.value || document.activeElement !== bPhone)) bPhone.value = p.phone;

    // 5. Guest Profile Modal Form
    const pmName = document.getElementById('profile-modal-name');
    const pmPhone = document.getElementById('profile-modal-phone');
    const pmRegion = document.getElementById('profile-modal-region');
    const pmTable = document.getElementById('profile-modal-room-table');
    if (pmName && p.name && document.activeElement !== pmName) pmName.value = p.name;
    if (pmPhone && p.phone && document.activeElement !== pmPhone) pmPhone.value = p.phone;
    if (pmRegion && p.region && document.activeElement !== pmRegion) pmRegion.value = p.region;
    if (pmTable && p.tableOrRoom && document.activeElement !== pmTable) pmTable.value = p.tableOrRoom;
  }

  bindGuestProfileSync() {
    if (this._guestSyncBound) return;
    this._guestSyncBound = true;

    const fields = [
      { id: 'feedback-guest-name', key: 'name' },
      { id: 'booking-guest-name', key: 'name' },
      { id: 'calc-event-guest-name', key: 'name' },
      { id: 'calc-bulk-guest-name', key: 'name' },
      { id: 'profile-modal-name', key: 'name' },

      { id: 'feedback-guest-phone', key: 'phone' },
      { id: 'booking-guest-phone', key: 'phone' },
      { id: 'calc-event-guest-phone', key: 'phone' },
      { id: 'calc-bulk-guest-phone', key: 'phone' },
      { id: 'profile-modal-phone', key: 'phone' },

      { id: 'feedback-table-num', key: 'tableOrRoom' },
      { id: 'profile-modal-room-table', key: 'tableOrRoom' },

      { id: 'feedback-guest-region', key: 'region' },
      { id: 'profile-modal-region', key: 'region' }
    ];

    fields.forEach(({ id, key }) => {
      const el = document.getElementById(id);
      // Review edits stay in the form; they are not an implicit profile-save.
      if (id.startsWith('feedback-')) return;
      if (el) {
        if (key === 'phone') {
          el.setAttribute('inputmode', 'numeric');
          el.setAttribute('autocomplete', 'tel');
          el.addEventListener('blur', (e) => {
            const cleaned = this.sanitizeIndianMobile(e.target.value);
            if (e.target.value !== cleaned) {
              e.target.value = cleaned;
              this.onGuestFieldInput(key, cleaned);
            }
          });
        }
        el.addEventListener('input', (e) => {
          this.onGuestFieldInput(key, e.target.value);
        });
        el.addEventListener('change', (e) => {
          this.onGuestFieldInput(key, e.target.value);
        });
      }
    });
  }

  onGuestFieldInput(key, value) {
    clearTimeout(this._guestSyncTimer);
    this._guestSyncTimer = setTimeout(() => {
      const patch = {};
      patch[key] = (key === 'phone') ? this.sanitizeIndianMobile(value) : value;
      this.saveGuestProfile(patch);
    }, 350);
  }

  updateHeaderGuestBadge(profile) {
    const p = profile || this.getGuestProfile();
    const btn = document.getElementById('guest-profile-trigger-btn');
    if (btn) {
      if (p.name) {
        btn.setAttribute('title', `Guest Profile: ${p.name}`);
        btn.classList.add('has-profile');
      } else {
        btn.setAttribute('title', 'Guest Profile');
        btn.classList.remove('has-profile');
      }
    }
    const pill = document.getElementById('header-guest-name-pill');
    if (pill) {
      pill.remove();
    }
  }

  // ==================== PHONE & CONTACT HELPERS ====================
  sanitizeIndianMobile(raw) {
    if (!raw) return '';
    let digits = String(raw).replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = digits.replace(/^0+/, '');
    }
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.slice(2);
    }
    return digits.slice(0, 10);
  }

  isValidIndianMobile(digits) {
    return /^[6-9]\d{9}$/.test(digits);
  }

  openGuestDialog(modal) {
    if (!modal) return;
    if (!modal.classList.contains('active')) {
      const trigger = document.activeElement;
      // Settings closes before its child action opens this sheet; return to its visible summary.
      modal._premierOpener = trigger?.closest?.('details:not([open])')?.querySelector('summary') || trigger;
    }
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    modal.querySelector('.modal-close-btn')?.focus({ preventScroll:true });
  }

  closeGuestDialog(modal) {
    if (!modal) return;
    modal.classList.remove('active', 'closing');
    modal.style.display = 'none';
    if (!document.querySelector('.modal-backdrop.active')) {
      document.body.classList.remove('modal-open');
      if (modal._premierOpener?.isConnected) modal._premierOpener.focus({ preventScroll:true });
    }
    modal._premierOpener = null;
  }

  dismissGuestOverlay(modal) {
    if (!modal) return;
    if (modal.id === 'dish-detail-modal') return this.closeDishDetail();
    if (modal.id === 'menu-sections-drawer-modal') return this.closeMenuSectionDrawer();
    if (modal.id === 'route-options-modal') return this.closeRouteOptionsModal();
    if (modal.id === 'admin-modal-backdrop' && window.admin) return window.admin.closeAdminModal();
    if (modal.id === 'concierge-booking-modal') return this.closeConciergeBookingModal();
    if (modal.id === 'guest-profile-modal') return this.closeGuestProfileModal();
    modal.classList.remove('active', 'closing');
    modal.style.display = 'none';
    if (!document.querySelector('.modal-backdrop.active')) document.body.classList.remove('modal-open');
  }

  hotelToday(now = new Date()) {
    // Hotel-local date, not UTC (which is yesterday before 05:30 IST).
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const part = type => parts.find(p => p.type === type).value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  }

  prepareRestaurantEnquiry(type) {
    const panel = document.getElementById('restaurant-event-enquiry');
    if (!panel) return;
    panel.open = true;
    const occasion = document.getElementById('restaurant-event-type');
    const aliases = { 'Birthday Parties':'Birthday Celebration', 'Other Special Events':'Special Occasion / Other' };
    occasion.value = aliases[type] || type;
    if (!occasion.value) occasion.selectedIndex = 0;
    const date = document.getElementById('restaurant-event-date');
    date.min = this.hotelToday();
    const profile = this.getGuestProfile();
    for (const [id,value] of [['restaurant-event-name',profile.name],['restaurant-event-phone',profile.phone]]) {
      const field = document.getElementById(id); if (!field.value && value) field.value = value;
    }
    panel.scrollIntoView({behavior:'smooth',block:'start'});
  }

  sendRestaurantEventEnquiry() {
    const form = document.getElementById('restaurant-event-form');
    if (!form?.reportValidity()) return;
    const value = id => document.getElementById('restaurant-event-'+id)?.value?.trim() || '';
    if (value('date') < this.hotelToday()) { alert('Please choose today or a future date.'); return; }
    const phone = this.sanitizeIndianMobile(value('phone'));
    if (!this.isValidIndianMobile(phone)) { alert('Please enter a valid 10-digit mobile number.'); return; }
    const guests = Number(value('guests'));
    if (!Number.isInteger(guests) || guests < 1 || guests > 40 || !this.formatArrivalTime(value('time'))) { this.showToast('Please check the guest count and preferred time.','warning'); return; }
    const message = `HOTEL PREMIER — RESTAURANT EVENT ENQUIRY\nOccasion: ${value('type')}\nVenue: Inside Pride Pure Veg AC Restaurant only\nPreferred date: ${value('date')}\nPreferred time: ${this.formatArrivalTime(value('time'))}\nGuests: ${guests} (restaurant maximum: 40)\nName: ${value('name')}\nMobile: ${phone}\nFood preferences: ${value('food') || 'To be discussed'}\nRequests: ${value('notes') || 'None specified'}\nPlease confirm restaurant availability, menu, setup and final charges. This is an enquiry, not a confirmed booking.`;
    const waUrl = `https://wa.me/919325375802?text=${encodeURIComponent(message)}`;
    const waWin = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!waWin || waWin.closed || typeof waWin.closed === 'undefined') {
      window.location.href = waUrl;
    }
    this.showToast('Review the restaurant enquiry in WhatsApp, then send it to our team.','info');
  }

  formatArrivalTime(value) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value || '')) return '';
    const [hour, minute] = value.split(':').map(Number);
    return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'} IST`;
  }

  // ==================== GUIDED CONCIERGE BOOKING WIZARD ====================
  openConciergeBookingModal(preselectedRoomId) {
    const modal = document.getElementById('concierge-booking-modal');
    if (!modal) return;
    const viewport = document.querySelector?.('meta[name="viewport"]');
    if (viewport && !modal.classList.contains('active')) {
      this.enquiryViewportContent = viewport.getAttribute('content');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    }

    // Carry an explicit tariff plan into the inquiry without changing Stay defaults.
    if (this.activeSection === 'section-tariffs' && ['ro','cp'].includes(this.currentTariffPlan)) {
      const planSelect = document.getElementById('booking-meal-plan');
      if (planSelect) planSelect.value = this.currentTariffPlan.toUpperCase();
    }

    if (preselectedRoomId) {
      const roomSelect = document.getElementById('booking-room-type');
      if (roomSelect) roomSelect.value = preselectedRoomId;
    }

    const dateInput = document.getElementById('booking-checkin-date');
    const today = this.hotelToday();
    if (dateInput) {
      dateInput.min = today;
      if (!dateInput.value || dateInput.value < today) {
        dateInput.value = today;
      }
    }

    this.applyGuestProfileToAllForms();
    this.updateBookingEstimate();
    modal.classList.add('active');
    modal.style.display = 'flex';
    this.lastEnquiryTrigger = document.activeElement;
    document.body?.classList.add('modal-open');
    modal.querySelector?.('.modal-close-btn')?.focus({ preventScroll: true });
  }

  closeConciergeBookingModal() {
    const modal = document.getElementById('concierge-booking-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
      if (this.enquiryViewportContent !== undefined) {
        document.querySelector('meta[name="viewport"]')?.setAttribute('content', this.enquiryViewportContent);
        this.enquiryViewportContent = undefined;
      }
      if (!document.querySelector('.modal-backdrop.active')) document.body.classList.remove('modal-open');
      this.lastEnquiryTrigger?.focus?.({ preventScroll: true });
    }
  }

  updateBookingEstimate() {
    const roomType = document.getElementById('booking-room-type')?.value || 'ac-deluxe-queen';
    const nights = Math.max(1, Math.floor(Number(document.getElementById('booking-nights')?.value) || 1));
    const roomCategory = window.HOTEL_PREMIER_HOTEL_DATA?.roomCategories?.find(room => room.id === roomType);
    const categoryInventory = parseInt(roomCategory?.inventoryCount) || ({'ac-super-deluxe':2,'ac-deluxe-queen':4,'ac-deluxe-twin':8}[roomType] || 1);
    const maxRooms = Math.min(window.HotelGroupStays?.limits.rooms || 12, categoryInventory);
    const maxGroupGuests = window.HotelGroupStays?.limits.guests || 36;
    const roomsField = document.getElementById('booking-rooms-count');
    const roomsCount = Math.min(maxRooms, Math.max(1, Math.floor(Number(roomsField?.value) || 1)));
    if (roomsField) { roomsField.max=String(maxRooms); roomsField.value=String(roomsCount); }
    const guestsField = document.getElementById('booking-guests-count');
    const mealPlan = document.getElementById('booking-meal-plan')?.value || 'CP';

    // Room Capacity Policy Matrix:
    // Royale King: Can accommodate 2 to 3 extra persons (max 3/room)
    // Twin Room: Can accommodate up to 2 extra persons (max 2/room)
    // Queen Room: Restricted capacity; can accommodate only 1 extra person (max 1/room)
    const roomCapacityMatrix = {
      'ac-super-deluxe': { maxExtra: 3, label: 'Royale King: Accommodates 2 to 3 extra persons' },
      'ac-deluxe-twin': { maxExtra: 2, label: 'Companion Twin: Accommodates up to 2 extra persons' },
      'ac-deluxe-queen': { maxExtra: 1, label: 'Signature Queen: Restricted capacity; accommodates max 1 extra person' }
    };
    const roomPolicy = roomCapacityMatrix[roomType] || { maxExtra: 1, label: 'Accommodates 1 extra person' };
    const maxExtraPerRoom = roomPolicy.maxExtra;
    const extraBedLimit = Math.min(maxExtraPerRoom * roomsCount, Math.max(0, maxGroupGuests - roomsCount * 2));
    const maxGuests = Math.min(maxGroupGuests, roomsCount * 2 + extraBedLimit);

    const capacityBadge = document.getElementById('booking-room-capacity-badge');
    if (capacityBadge) {
      capacityBadge.textContent = `${roomPolicy.label} (${extraBedLimit} max extra guest limit for ${roomsCount} room${roomsCount > 1 ? 's' : ''})`;
    }

    const guestsCount = Math.min(maxGroupGuests, Math.max(roomsCount, Math.floor(Number(guestsField?.value) || roomsCount)));
    if (guestsField) { guestsField.min=String(roomsCount); guestsField.max=String(maxGuests); guestsField.value=String(guestsCount); }

    const extraBedsInput = document.getElementById('booking-extra-beds');
    const childBedsInput = document.getElementById('booking-child-extra-beds');
    const childExtraBeds = Math.min(extraBedLimit, Math.max(0, Math.floor(Number(childBedsInput?.value) || 0)));
    if (childBedsInput) {
      childBedsInput.max = String(extraBedLimit);
      childBedsInput.value = String(childExtraBeds);
    }
    const requestedExtraBeds = Number(extraBedsInput?.value) || 0;
    const extraBeds = Math.min(extraBedLimit - childExtraBeds, Math.max(0, Math.floor(requestedExtraBeds)));
    const valid = guestsCount <= roomsCount * 2 + extraBeds + childExtraBeds;
    if (extraBedsInput) {
      extraBedsInput.max = String(Math.max(0, extraBedLimit - childExtraBeds));
      extraBedsInput.value = String(extraBeds);
    }

    const rates = {
      'ac-super-deluxe': { RO: 2400, CP: 2600, doubleRO: 2600, doubleCP: 3000, name: 'Premier Royale King' },
      'ac-deluxe-queen': { RO: 2100, CP: 2300, doubleRO: 2400, doubleCP: 2700, name: 'Premier Signature Queen' },
      'ac-deluxe-twin': { RO: 2100, CP: 2300, doubleRO: 2400, doubleCP: 2700, name: 'Premier Companion Twin' }
    };

    const selected = { ...(rates[roomType] || rates['ac-deluxe-queen']) };
    if (roomCategory) {
      selected.name=roomCategory.name;
      for (const [key,value] of Object.entries({RO:roomCategory.tariff?.single?.roomOnly,CP:roomCategory.tariff?.single?.withBreakfast,doubleRO:roomCategory.tariff?.double?.roomOnly,doubleCP:roomCategory.tariff?.double?.withBreakfast})) {
        if (Number.isFinite(value) && value>=0) selected[key]=value;
      }
    }
    const baseRatePerNight = (mealPlan === 'CP') ? selected.CP : selected.RO;
    const doubleRatePerNight = mealPlan === 'CP' ? selected.doubleCP : selected.doubleRO;
    const doubleRooms = Math.min(roomsCount, Math.max(0, guestsCount - roomsCount));
    const roomTariffPerNight = baseRatePerNight * (roomsCount - doubleRooms) + doubleRatePerNight * doubleRooms;
    const extraBedRate = (mealPlan === 'CP') ? 500 : 300;

    const grossEstimate = (roomTariffPerNight + (extraBeds * extraBedRate)) * nights;
    const directDiscount = Math.min(200, grossEstimate);
    const totalEstimate = Math.max(0, grossEstimate - directDiscount);

    const roomNameEl = document.getElementById('booking-summary-room-name');
    const durationEl = document.getElementById('booking-summary-duration');
    const totalEl = document.getElementById('booking-summary-grand-total');

    if (roomNameEl) roomNameEl.textContent = `${roomsCount}x ${selected.name} (${mealPlan === 'CP' ? 'CP: fixed-menu breakfast; Terms & conditions apply. Speak to our staff for details.' : 'Room Only'})`;
    if (durationEl) durationEl.textContent = `${nights} Night(s) • 24-Hr Check-Out (Direct Bookings Only) ${extraBeds > 0 ? `• ${extraBeds} Paid Extra Bed(s)` : ''}${childExtraBeds > 0 ? ` • ${childExtraBeds} Complimentary Child Extra Bed(s), ages 5–10` : ''}`;
    const arrivalEl = document.getElementById('booking-summary-arrival');
    if (arrivalEl) {
      const date = document.getElementById('booking-checkin-date')?.value;
      const time = this.formatArrivalTime(document.getElementById('booking-checkin-time')?.value);
      const formattedDate = date ? new Intl.DateTimeFormat('en-IN', { day:'numeric', month:'short', year:'numeric', timeZone:'Asia/Kolkata' }).format(new Date(`${date}T12:00:00+05:30`)) : 'Choose a date';
      arrivalEl.textContent = `${formattedDate} · ${time || 'Choose arrival time'}`;
    }
    if (totalEl) {
      totalEl.innerHTML = `
        <div class="booking-price-summary">
          <div>
            <span class="booking-original-price">₹${grossEstimate.toLocaleString('en-IN')}</span>
            <span class="booking-final-price">₹ ${totalEstimate.toLocaleString('en-IN')}/-</span>
          </div>
          <span class="booking-savings-note">
            🎁 Flat ₹200 Direct Guest Discount Applied (You Save ₹${directDiscount.toLocaleString('en-IN')})
          </span>
        </div>
      `;
    }

    const occupancyEl = document.getElementById('booking-summary-occupancy');
    if (occupancyEl) occupancyEl.textContent = valid ? `Estimate: ${roomsCount - doubleRooms} single-occupancy + ${doubleRooms} double-occupancy room(s). Maximum ${maxRooms} rooms in this category. Include children in the guest count; exact allocation and final charges require staff confirmation.` : 'The guest count exceeds the selected beds. Add extra beds within the room limit, choose more rooms or reduce the guest count. Include children in your total.';
    const sendButton=document.getElementById('booking-send-enquiry');
    if (sendButton) sendButton.disabled=!valid;
    const capacityHelp=document.getElementById('booking-capacity-help');
    if (capacityHelp) capacityHelp.textContent=valid ? `Up to ${maxRooms} ${selected.name} room(s), subject to availability. Count all adults and children.` : 'Please adjust the guest count or extra beds to stay within the selected room capacity.';

    return { totalEstimate, grossEstimate, directDiscount, selected, nights, roomsCount, guestsCount, maxRooms, maxGuests, valid, mealPlan, extraBeds, childExtraBeds };
  }

  dispatchConciergeBooking() {
    const estimate = this.updateBookingEstimate();
    if (!estimate.valid) { this.showToast('Please check the guest count and extra beds before sending an enquiry.','warning'); document.getElementById('booking-guests-count')?.focus(); return; }
    const guestNameInput = document.getElementById('booking-guest-name');
    const guestPhoneInput = document.getElementById('booking-guest-phone');
    const checkInDateInput = document.getElementById('booking-checkin-date');

    const guestName = guestNameInput?.value.trim() || '';
    const rawGuestPhone = guestPhoneInput?.value.trim() || '';
    const cleanGuestPhone = this.sanitizeIndianMobile(rawGuestPhone);
    const checkInDate = checkInDateInput?.value;
    const timeInput = document.getElementById('booking-checkin-time');
    const checkInTime = this.formatArrivalTime(timeInput?.value);
    const guestsCount = estimate.guestsCount;
    const today = this.hotelToday();

    if (!guestName) {
      alert('Please enter your name so Hotel Premier Concierge can assist you.');
      guestNameInput?.focus();
      return;
    }

    if (!cleanGuestPhone || !this.isValidIndianMobile(cleanGuestPhone)) {
      alert('Please enter a valid 10-digit WhatsApp/mobile number (e.g., 9876543210).');
      if (guestPhoneInput) {
        guestPhoneInput.value = cleanGuestPhone;
        guestPhoneInput.focus();
      }
      return;
    }

    if (!checkInDate || checkInDate < today || !checkInDateInput.checkValidity()) {
      alert('Check-in date cannot be in the past. Please select today or a future date.');
      if (checkInDateInput) {
        checkInDateInput.value = today;
        checkInDateInput.focus();
      }
      return;
    }

    if (!checkInTime) {
      alert('Please choose your expected arrival time. All times are local to Hotel Premier (IST).');
      timeInput?.focus();
      return;
    }
    for (const id of ['booking-nights', 'booking-rooms-count', 'booking-guests-count']) {
      const field = document.getElementById(id);
      if (field && !field.reportValidity()) return;
    }

    if (guestPhoneInput) guestPhoneInput.value = cleanGuestPhone;
    this.saveGuestProfile({ name: guestName, phone: cleanGuestPhone });

    if (window.HOTEL_VAULT && typeof window.HOTEL_VAULT.recordBooking === 'function') {
      window.HOTEL_VAULT.recordBooking({
        name: guestName,
        phone: cleanGuestPhone,
        roomType: estimate.selected.name,
        checkInDate: checkInDate,
        checkInTime: checkInTime,
        nights: estimate.nights,
        roomsCount: estimate.roomsCount,
        guestsCount: guestsCount,
        mealPlan: estimate.mealPlan === 'CP' ? 'CP — Breakfast from a fixed menu; Terms & conditions apply. Speak to our staff for details.' : 'Room Only',
        extraBeds: estimate.extraBeds,
        childExtraBeds: estimate.childExtraBeds,
        status: 'Enquiry prepared — delivery unverified',
        estimatedTotal: estimate.totalEstimate
      });
    }

    let msg = `*🏨 HOTEL PREMIER, BHUSAWAL - ROOM ENQUIRY*\n`;
    msg += `--------------------------------------------------\n`;
    msg += `👤 *Guest Name:* ${guestName}\n`;
    msg += `📱 *Mobile / WhatsApp:* ${cleanGuestPhone}\n`;
    msg += `🛏️ *Suite:* ${estimate.roomsCount}x ${estimate.selected.name}\n`;
    msg += `📅 *Check-In Date:* ${checkInDate || 'Immediate'}\n`;
    msg += `⏰ *Arrival Time:* ${checkInTime}\n`;
    msg += `🌙 *Duration:* ${estimate.nights} Night(s) (24-Hour Check-Out (Direct Bookings Only))\n`;
    msg += `👥 *Total Guests:* ${guestsCount}\n`;
    msg += `🍽️ *Plan:* ${estimate.mealPlan === 'CP' ? 'CP — Breakfast from a fixed menu; Terms & conditions apply. Speak to our staff for details.' : 'Room Only (RO)'}\n`;
    if (estimate.extraBeds > 0) {
      msg += `🛏️ *Extra Beds:* ${estimate.extraBeds} Bed(s)\n`;
    }
    if (estimate.childExtraBeds > 0) {
      msg += `🧒 *Complimentary Extra Beds (ages 5–10 inclusive):* ${estimate.childExtraBeds}\nChildren's meals: please confirm charges separately.\n`;
    }
    msg += `💰 *Standard Tariff:* ₹ ${estimate.grossEstimate.toLocaleString('en-IN')}/-\n`;
    msg += `🎁 *Direct PWA Guest Privilege (Flat ₹200 Off):* -₹ ${estimate.directDiscount.toLocaleString('en-IN')}/-\n`;
    msg += `✨ *Estimated Total:* ₹ ${estimate.totalEstimate.toLocaleString('en-IN')}/- (Inclusive of all taxes; hotel to confirm occupancy and final rate)\n`;
    msg += `--------------------------------------------------\n`;
    msg += `Please check availability and confirm the final rate and stay details. This is an enquiry, not a confirmed reservation. Thank you!`;

    const encoded = encodeURIComponent(msg);
    const waUrl = `https://wa.me/919325375802?text=${encoded}`;
    const waWin = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!waWin || waWin.closed || typeof waWin.closed === 'undefined') {
      window.location.href = waUrl;
    }

    this.closeConciergeBookingModal();
  }

  // ==================== GUEST CONCIERGE PROFILE MODAL ====================
  openGuestProfileModal() {
    const modal = document.getElementById('guest-profile-modal');
    if (!modal) return;
    this.applyGuestProfileToAllForms();
    this.openGuestDialog(modal);
  }

  closeGuestProfileModal() {
    this.closeGuestDialog(document.getElementById('guest-profile-modal'));
  }

  saveGuestProfileFromModal() {
    const nameEl = document.getElementById('profile-modal-name');
    const phoneEl = document.getElementById('profile-modal-phone');
    const name = nameEl?.value.trim() || '';
    const rawPhone = phoneEl?.value.trim() || '';
    const cleanPhone = this.sanitizeIndianMobile(rawPhone);
    const region = document.getElementById('profile-modal-region')?.value.trim() || '';
    const tableOrRoom = document.getElementById('profile-modal-room-table')?.value.trim() || '';

    if (rawPhone && !this.isValidIndianMobile(cleanPhone)) {
      alert('Please enter a valid 10-digit WhatsApp/mobile number (e.g., 9876543210).');
      if (phoneEl) {
        phoneEl.value = cleanPhone;
        phoneEl.focus();
      }
      return;
    }

    if (cleanPhone && phoneEl) {
      phoneEl.value = cleanPhone;
    }

    this.saveGuestProfile({ name, phone: cleanPhone, region, tableOrRoom });
    this.closeGuestProfileModal();
    this.showToast('Guest details saved in this browser.', 'success');
  }

  clearGuestProfile() {
    if (confirm('Clear saved guest details? You can re-enter them anytime.')) {
      localStorage.removeItem('hp_guest_profile');
      ['feedback-guest-name', 'booking-guest-name', 'calc-event-guest-name', 'calc-bulk-guest-name',
       'profile-modal-name', 'feedback-guest-phone', 'booking-guest-phone', 'calc-event-guest-phone',
       'calc-bulk-guest-phone', 'profile-modal-phone'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      this.updateHeaderGuestBadge({ name: '', phone: '', tableOrRoom: '', region: 'Bhusawal Local' });
      this.closeGuestProfileModal();
      alert('Guest profile cleared.');
    }
  }

  openGuestPassModal() {
    const modal = document.getElementById('guest-pass-modal');
    if (!modal) return;
    this.applyGuestProfileToAllForms();
    modal.classList.add('active');
    const nameInput = document.getElementById('guest-pass-input-name');
    if (nameInput) setTimeout(() => nameInput.focus(), 150);
  }

  closeGuestPassModal() {
    const modal = document.getElementById('guest-pass-modal');
    if (modal) modal.classList.remove('active');
  }

  saveGuestPass(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('guest-pass-input-name')?.value.trim() || '';
    const phone = document.getElementById('guest-pass-input-phone')?.value.trim() || '';
    const table = document.getElementById('guest-pass-input-table')?.value.trim() || '';
    const region = document.getElementById('guest-pass-input-region')?.value || 'Bhusawal Local';

    if (!name) {
      alert('Please enter your name.');
      return false;
    }
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit WhatsApp number.');
      return false;
    }

    this.saveGuestProfile({ name, phone, tableOrRoom: table, region });
    this.dismissWelcomeBanner();
    this.closeGuestPassModal();
    const firstName = name.split(' ')[0];
    this.showToast(`Welcome, ${firstName}! Auto-Filled Everywhere ⚡`, 'success');
    return false;
  }

  clearGuestPass() {
    if (confirm('Clear saved guest details? You can re-enter them anytime.')) {
      localStorage.removeItem('hp_guest_profile');
      ['feedback-guest-name', 'feedback-guest-phone', 'calc-event-guest-name', 'calc-event-guest-phone',
       'calc-bulk-guest-name', 'calc-bulk-guest-phone', 'guest-pass-input-name', 'guest-pass-input-phone'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      this.updateHeaderGuestBadge({ name: '', phone: '', tableOrRoom: '', region: 'Bhusawal Local' });
      this.showToast('Guest details cleared', 'info');
      this.closeGuestPassModal();
    }
  }

  dismissWelcomeBanner() {
    const banner = document.getElementById('guest-scan-welcome-banner');
    if (banner) banner.style.display = 'none';
    try {
      sessionStorage.setItem('hp_dismiss_welcome_banner', 'true');
    } catch (e) {}
  }

  // ==================== 6. GUEST FEEDBACK & DINING RATINGS ====================
  setStarRating(rating) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;
    this.currentStarRating = rating;
    const input = document.getElementById('feedback-star-val');
    if (input) input.value = rating;
    const control = document.getElementById('feedback-star-control');
    if (control) control.setAttribute?.('data-rating', String(rating));
    document.querySelectorAll('#feedback-star-control input[type="radio"]').forEach(radio => {
      const value = Number(radio.value);
      radio.checked = value === rating;
      radio.parentElement?.classList.toggle('active', value <= rating);
    });
    const verdict = document.getElementById('feedback-rating-verdict');
    const words = ['','Needs improvement','Fair','Good','Very good','Excellent'];
    if (verdict) verdict.innerText = rating+' / 5 · '+words[rating];
  }

  editGuestFeedback() {
    const form = document.getElementById('dining-feedback-form');
    const handoff = document.getElementById('feedback-thankyou-card');
    if (handoff) handoff.style.display = 'none';
    document.getElementById('feedback-whatsapp-link')?.removeAttribute('href');
    if (form) form.style.display = '';
    document.getElementById('feedback-guest-comments')?.focus();
  }

  submitGuestFeedback(event) {
    if (event) event.preventDefault();
    const get = id => document.getElementById(id);
    const status = get('feedback-status');
    const fail = (message, field) => { if (status) status.textContent=message; get(field)?.focus(); return false; };
    const form = get('dining-feedback-form');
    if (!form?.reportValidity()) return false;
    const name = get('feedback-guest-name').value.trim();
    const rawPhone = get('feedback-guest-phone').value.trim();
    const phone = rawPhone ? this.sanitizeIndianMobile(rawPhone) : '';
    const comments = get('feedback-guest-comments').value.trim();
    const rating = Number(get('feedback-star-val').value);
    if (!Number.isInteger(rating) || rating<1 || rating>5) return fail('Please choose your rating.','feedback-star-control');
    if (!comments || comments.length>2000) return fail('Please add your feedback, up to 2,000 characters.','feedback-guest-comments');
    if (!name || name.length>100) return fail('Please enter your name, up to 100 characters.','feedback-guest-name');
    if (rawPhone && !this.isValidIndianMobile(phone)) return fail('Please check your mobile number, or leave it blank.','feedback-guest-phone');
    const entry = {
      name, phone, comments, rating,
      region:get('feedback-guest-region').value,
      tableOrRoom:get('feedback-table-num').value.trim(),
      tags:Array.from(document.querySelectorAll('#feedback-tags-container .feedback-chip.active')).map(chip=>chip.innerText.trim())
    };
    let copyMessage = 'No new feedback copy was saved in this step.';
    if (get('feedback-keep-copy').checked) {
      const fingerprint = JSON.stringify(entry);
      if (this.feedbackSavedFingerprint === fingerprint) copyMessage='Your feedback copy is saved in this browser only.';
      else {
        const record = window.HOTEL_VAULT?.recordFeedback(entry);
        if (record) { this.feedbackSavedFingerprint=fingerprint; copyMessage='A feedback copy is saved in this browser only. It has not been delivered to the hotel.'; }
        else copyMessage='A browser copy could not be saved. You can still send the feedback through WhatsApp.';
      }
    }
    const message = [
      'HOTEL PREMIER — GUEST FEEDBACK', 'Rating: '+rating+' / 5',
      'Feedback: '+comments, 'Name: '+name,
      phone ? 'Reply number: '+phone : '',
      entry.region ? 'City / region: '+entry.region : '',
      entry.tableOrRoom ? 'Room / table: '+entry.tableOrRoom : '',
      entry.tags.length ? 'Highlights: '+entry.tags.join(', ') : ''
    ].filter(Boolean).join('\n');
    const link = get('feedback-whatsapp-link');
    link.href='https://wa.me/919325375802?text='+encodeURIComponent(message);
    get('feedback-copy-status').textContent=copyMessage;
    if (status) status.textContent='';
    form.style.display='none';
    const handoff=get('feedback-thankyou-card');
    handoff.style.display='block'; handoff.focus();
    handoff.scrollIntoView({behavior:'smooth',block:'center'});
    return false;
  }

  // ==================== 7. MASTER DEVELOPER VAULT CONTROLS ====================
  async unlockDeveloperVault() {
    const input = document.getElementById('dev-vault-pin-input');
    const pin = input ? input.value : '';
    let valid = false;
    try {
      if (!window.HotelLocalLock?.status().configured) {
        this.ensureAdminLoaded(() => window.admin.openAdminModal());
        return;
      }
      valid = Boolean(window.HOTEL_VAULT && await window.HOTEL_VAULT.verifyMasterPin(pin));
    } catch (error) { this.showToast(error.message, 'error'); return; }
    if (valid) {
      const gate = document.getElementById('dev-vault-gate');
      const deck = document.getElementById('dev-vault-deck');
      if (gate) gate.style.display = 'none';
      if (deck) deck.style.display = 'block';
      this.renderDeveloperVaultUI();
      this.showToast('Master Vault Unlocked 🔓', 'success');
    } else {
      this.showToast('Incorrect local PIN. Repeated attempts are throttled.', 'error');
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  }

  renderDeveloperVaultUI() {
    if (!window.HOTEL_VAULT) return;
    const scans = window.HOTEL_VAULT.getLevel1Scans();
    const leads = window.HOTEL_VAULT.getFeedbackLeads();
    const avgRating = leads.length
      ? (leads.reduce((a, b) => a + (b.rating || 5), 0) / leads.length).toFixed(1)
      : '5.0';

    const scansEl = document.getElementById('vault-kpi-scans');
    const leadsEl = document.getElementById('vault-kpi-leads');
    const ratingEl = document.getElementById('vault-kpi-rating');

    if (scansEl) scansEl.innerText = scans.length;
    if (leadsEl) leadsEl.innerText = leads.length;
    if (ratingEl) ratingEl.innerText = `${avgRating}★`;
  }

  promptChangeDeveloperPin() {
    this.ensureAdminLoaded(() => window.admin.openAdminModal('backup'));
  }
}

// Global bootstrap
function initializeHotelPremierApp() {
  if (!window.app) {
    window.app = new HotelPremierApp();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHotelPremierApp);
} else {
  initializeHotelPremierApp();
}
