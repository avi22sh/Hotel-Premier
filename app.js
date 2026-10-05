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
    this.viewMode = 'home'; // 'home' | 'section' | 'all' | 'search'
    this.mainMode = 'menu'; // 'menu' | 'hotel'
    this.isLargeFont = false;
    this.currentLang = 'en'; // 'en' | 'hi' | 'mr'

    // Storage Keys
    this.storageKeyMenu = 'hotel_premier_menu_v2';
    this.storageKeyOverrides = 'hotel_premier_user_overrides_v1';
    this.storageKeyFontSize = 'hotel_premier_font_size';
    this.storageKeyLang = 'hotel_premier_language';

    // Carousel States
    this.heroSlides = [];
    this.currentHeroSlideIndex = 0;
    this.heroAutoInterval = null;

    this.sectionSlides = [];
    this.currentSectionSlideIndex = 0;
    this.sectionAutoInterval = null;

    this.roomGalleries = {};
    this.roomSlideIndices = {
      'ac-super-deluxe': 0,
      'ac-deluxe-queen': 0,
      'ac-deluxe-twin': 0
    };

    this.init();
  }

  async init() {
    this.loadPreferences();
    await this.loadMenuData();
    this.updateUILanguage();
    this.renderCategoryCards();
    this.renderCategories();
    this.renderQuickFilters();
    this.renderMenu();
    this.renderMenuSectionDrawer();
    this.renderLocationQR();
    this.renderLocationDistances();
    await this.initHeroCarousel();
    await this.renderRoomCarousels();
    this.renderBulkDealsSection();
    this.calculateBulkQuote();
    this.renderRestaurantEventPackages();
    this.renderEventDecorations();
    this.calculateRestaurantEventQuote();
    this.checkStaffModeAccess();
    this.initGuestProfile();
    const urlParams = new URLSearchParams(window.location.search);
    let catParam = urlParams.get('category') || urlParams.get('cat') || urlParams.get('section');
    if (!catParam && window.location.hash) {
      const match = window.location.hash.match(/(?:category|section)=([a-zA-Z0-9_-]+)/);
      if (match) catParam = match[1];
    }
    if (catParam) {
      this.openCategorySection(catParam);
    }
    this.bindEvents();
    this.setupBroadcastChannel();
  }

  // ==================== USER PREFERENCES ====================
  loadPreferences() {
    try {
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
        if (btn) btn.innerHTML = '<span style="font-weight: 800; font-size: 0.85rem;">A-</span>';
      }
    } catch (e) {}
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

  // ==================== MULTILINGUAL SYSTEM ====================
  setLanguage(lang) {
    if (lang !== 'en' && lang !== 'hi' && lang !== 'mr') return;
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
      if (btn) btn.innerHTML = '<span style="font-weight: 800; font-size: 0.85rem;">A-</span>';
      localStorage.setItem(this.storageKeyFontSize, 'large');
      this.showToast(this.t('textSizeLarge'), 'info');
    } else {
      document.body.classList.remove('large-font-mode');
      if (btn) btn.innerHTML = '<span style="font-weight: 800; font-size: 0.85rem;">A+</span>';
      localStorage.setItem(this.storageKeyFontSize, 'normal');
      this.showToast(this.t('textSizeNormal'), 'info');
    }
  }

  async loadMenuData() {
    const initialMenu = window.HOTEL_PREMIER_INITIAL_MENU ? [...window.HOTEL_PREMIER_INITIAL_MENU] : [];
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
      if (overridesMap && overridesMap[dish.id]) {
        const ov = overridesMap[dish.id];
        if (ov.image !== undefined) copy.image = ov.image;
        if (ov.price !== undefined) copy.price = ov.price;
        if (ov.isSoldOut !== undefined) copy.isSoldOut = ov.isSoldOut;
        if (ov.tags !== undefined) copy.tags = ov.tags;
      }
      return copy;
    });

    // 3. Add custom dishes created by admin that are not in initialMenu
    if (overridesMap) {
      const initialIds = new Set(initialMenu.map(d => d.id));
      Object.keys(overridesMap).forEach(id => {
        if (!initialIds.has(id) && overridesMap[id].name) {
          this.menuData.push(overridesMap[id]);
        }
      });
    }

    if (!this.menuData || this.menuData.length === 0) {
      this.menuData = initialMenu;
    }

    this.categories = window.HOTEL_PREMIER_CATEGORIES ? [...window.HOTEL_PREMIER_CATEGORIES] : [];
    this.saveMenuData();
  }

  saveMenuData() {
    try {
      localStorage.setItem(this.storageKeyMenu, JSON.stringify(this.menuData));
      
      let overridesMap = {};
      this.menuData.forEach(dish => {
        overridesMap[dish.id] = {
          image: dish.image,
          price: dish.price,
          isSoldOut: dish.isSoldOut,
          tags: dish.tags
        };
      });
      localStorage.setItem(this.storageKeyOverrides, JSON.stringify(overridesMap));
      this.notifyMenuUpdate();
    } catch (e) {
      console.warn('Could not save to localStorage cache:', e);
    }
  }

  setupBroadcastChannel() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcast = new BroadcastChannel('hotel_premier_sync_channel');
        this.broadcast.onmessage = (event) => {
          if (event.data && event.data.type === 'MENU_UPDATED') {
            this.loadMenuData();
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
        window.HOTEL_STORAGE.saveSectionSlides('restaurant_hero', defaultSlides);
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
        <div class="hero-carousel-slide hp-asset-pedestal" data-slide-index="${idx}">
          <div class="hp-pedestal-glow" aria-hidden="true"></div>
          <div class="hp-pedestal-plate" aria-hidden="true"></div>
          <img src="${slide.image}" alt="${slide.title || 'Hotel Premier'}" class="hero-carousel-img hp-isolated-asset" loading="${idx === 0 ? 'eager' : 'lazy'}">
          <div class="hp-glass-vignette" aria-hidden="true"></div>
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
  async renderSectionSlideshow(catId) {
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
      slides = await window.HOTEL_STORAGE.getSectionSlides('category_' + catId, null);
    }

    // 2. If no custom slides stored, auto-derive by selecting random images from this section
    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      const dishes = this.menuData.filter(d => d.categoryId === catId && d.image && d.image.trim() !== '');
      // Shuffle and pick random 4-5 dishes from this section to display in the banner
      const shuffledDishes = [...dishes].sort(() => 0.5 - Math.random());
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
              <div class="section-slide-card hp-asset-pedestal" onclick="${slide.dishId ? `window.app.openDishDetail('${slide.dishId}')` : ''}">
                <div class="hp-pedestal-glow" aria-hidden="true"></div>
                <div class="hp-pedestal-plate" aria-hidden="true"></div>
                <img src="${slide.image}" alt="${slide.name || slide.title}" class="section-slide-img hp-isolated-asset" loading="${idx === 0 ? 'eager' : 'lazy'}" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'">
                <div class="hp-glass-vignette" aria-hidden="true"></div>
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
                <img src="${imgUrl}" alt="${room.name} Photo ${idx + 1}" class="room-card-img" loading="lazy" onerror="this.src='${room.image}'">
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
    const images = this.roomGalleries[roomId] || [];
    if (images.length <= 1) return;
    this.roomSlideIndices[roomId] = ((this.roomSlideIndices[roomId] || 0) + 1) % images.length;
    this.updateRoomSlidePosition(roomId);
  }

  prevRoomSlide(roomId, e) {
    if (e) e.stopPropagation();
    const images = this.roomGalleries[roomId] || [];
    if (images.length <= 1) return;
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

  // ==================== 1. HOME CATEGORY GRID VIEW ====================
  renderCategoryCards() {
    const container = document.getElementById('category-cards-grid');
    if (!container) return;

    if (!this.categories || this.categories.length === 0) {
      this.categories = window.HOTEL_PREMIER_CATEGORIES ? [...window.HOTEL_PREMIER_CATEGORIES] : [];
    }

    const cats = this.categories.filter(c => c.id !== 'all' && c.id !== 'chef-specials');
    const itemsWord = this.t('itemsCount', 'Items');
    const viewWord = this.t('viewSection', 'View Section ➔');

    container.innerHTML = cats.map(cat => {
      const catDishes = this.menuData.filter(d => d.categoryId === cat.id);
      const count = catDishes.length;
      const localizedTitle = this.getCategoryLocalizedName(cat.id);
      const localizedSubtitle = this.getCategoryLocalizedSubtitle(cat.id);
      const localizedDesc = this.getCategoryLocalizedDesc(cat.id);

      return `
        <div class="category-card" onclick="window.app.openCategorySection('${cat.id}')">
          ${(window.AssetPipeline && typeof window.AssetPipeline.renderCategoryCardMedia === 'function')
            ? window.AssetPipeline.renderCategoryCardMedia(cat, count, itemsWord, localizedTitle)
            : `
              <div class="category-card-media hp-asset-pedestal">
                <div class="hp-pedestal-glow" aria-hidden="true"></div>
                <div class="hp-pedestal-plate" aria-hidden="true"></div>
                <img src="${cat.image}" alt="${localizedTitle}" class="category-card-img hp-isolated-asset" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'">
                <div class="hp-glass-vignette" aria-hidden="true"></div>
                <div class="category-card-overlay"></div>
                <span class="category-card-badge">${count} ${itemsWord}</span>
              </div>
            `
          }
          <div class="category-card-content">
            <div>
              <h3 class="category-card-title">${localizedTitle}</h3>
              ${(this.currentLang !== 'en' && localizedSubtitle) ? `<span class="category-card-hindi">${localizedSubtitle}</span>` : ''}
              <p class="category-card-desc">${localizedDesc || 'Delicious vegetarian delicacies.'}</p>
            </div>
            <div class="category-card-footer">
              <span class="category-card-action">${viewWord}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  openCategorySection(catId) {
    if (window.HOTEL_VAULT) {
      window.HOTEL_VAULT.recordCategoryClick(catId);
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

    const titleEl = document.getElementById('active-category-title');
    const hindiEl = document.getElementById('active-category-hindi');
    const countEl = document.getElementById('active-category-count');
    const catDishes = this.menuData.filter(d => d.categoryId === catId);
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showHomeCategories() {
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

    this.renderSectionSlideshow(null);
    this.renderQuickFilters();
    this.renderCategoryCards();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showAllDishesView() {
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

    const titleEl = document.getElementById('active-category-title');
    const hindiEl = document.getElementById('active-category-hindi');
    const countEl = document.getElementById('active-category-count');
    const itemsWord = this.t('itemsCount', 'Items');

    if (titleEl) titleEl.innerText = this.t('allMenuTitle');
    if (hindiEl) hindiEl.innerText = this.t('allMenuSubtitle');
    if (countEl) countEl.innerText = `${this.menuData.length} ${itemsWord}`;

    this.renderQuickFilters();
    this.renderCategories();
    this.renderSectionSlideshow(null);
    this.renderMenu();

    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const allDishesCount = this.menuData ? this.menuData.length : 214;
    const isAllActive = (this.currentCategory === 'all' && this.viewMode === 'all');
    const dishesWord = this.t('itemsCount', 'Items');

    const items = [
      {
        id: 'all',
        name: this.t('filterAll', 'All Items'),
        subtitle: 'Complete Restaurant Menu • All ' + allDishesCount + ' Pure Veg Dishes',
        icon: '🍽️',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        count: allDishesCount,
        isActive: isAllActive,
        isAll: true
      },
      ...validCategories.map(cat => {
        const catDishes = this.menuData.filter(d => d.categoryId === cat.id);
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
      <div class="drawer-section-item ${item.isActive ? 'active' : ''} ${item.isAll ? 'all-items-row' : ''}" 
           data-section-id="${item.id}"
           onclick="window.app.selectCategoryFromDrawer('${item.id}')">
        <div class="drawer-item-media">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" class="drawer-item-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'">` : `<span class="drawer-fallback-icon">${item.icon}</span>`}
          <span class="drawer-item-badge-icon">${item.icon}</span>
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
          <span class="drawer-item-arrow">➔</span>
        </div>
      </div>
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
    const modal = document.getElementById('menu-sections-drawer-modal');
    if (!modal) return;
    this.renderMenuSectionDrawer();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const searchInput = document.getElementById('drawer-sections-search');
    if (searchInput) {
      searchInput.value = '';
      setTimeout(() => searchInput.focus(), 150);
    }
  }

  closeMenuSectionDrawer() {
    const modal = document.getElementById('menu-sections-drawer-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  selectCategoryFromDrawer(catId) {
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
    const target = document.getElementById('dishes-section-view');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  filterDrawerSections(query) {
    const q = (query || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#drawer-sections-list .drawer-section-item');
    rows.forEach(row => {
      if (!q) {
        row.style.display = 'flex';
        return;
      }
      const title = row.querySelector('.drawer-item-title') ? row.querySelector('.drawer-item-title').innerText.toLowerCase() : '';
      const sub = row.querySelector('.drawer-item-sub') ? row.querySelector('.drawer-item-sub').innerText.toLowerCase() : '';
      if (title.includes(q) || sub.includes(q)) {
        row.style.display = 'flex';
      } else {
        row.style.display = 'none';
      }
    });
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

    container.innerHTML = filters.map(f => `
      <button class="filter-pill ${this.currentFilter === f.id ? 'active' : ''}" data-filter-id="${f.id}">
        ${f.icon ? `<span>${f.icon}</span>` : ''}
        <span>${this.t(f.labelKey)}</span>
      </button>
    `).join('');

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

  getFilteredDishes() {
    if (!this.menuData || this.menuData.length === 0) {
      if (window.HOTEL_PREMIER_INITIAL_MENU && window.HOTEL_PREMIER_INITIAL_MENU.length > 0) {
        this.menuData = [...window.HOTEL_PREMIER_INITIAL_MENU];
      } else {
        return [];
      }
    }

    return this.menuData.filter(item => {
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
      if (this.currentFilter === 'under-150' && item.price > 150) return false;

      if (this.searchQuery && this.searchQuery.trim() !== '') {
        const q = this.searchQuery.toLowerCase().trim();
        const matchName = item.name && item.name.toLowerCase().includes(q);
        const matchDesc = item.description && item.description.toLowerCase().includes(q);
        const matchTag = item.tags && item.tags.some(t => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchTag) return false;
      }

      return true;
    });
  }

  renderMenu() {
    const container = document.getElementById('menu-items-grid');
    if (!container) return;

    const filtered = this.getFilteredDishes();
    const itemsWord = this.t('itemsCount', 'Items');

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px 16px; color: var(--text-muted); background: var(--cream-card); border-radius: var(--radius-md); border: 1.5px solid var(--cream-border); margin-top: 10px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🍲</div>
          <h3 style="font-family: var(--font-serif); color: var(--terracotta-dark); margin-bottom: 8px;">${this.t('noDishesFound')}</h3>
          <p style="font-size: 0.85rem;">${this.t('noDishesSub')}</p>
          <button class="btn-primary" style="margin: 16px auto 0; max-width: 220px;" onclick="window.app.showHomeCategories()">${this.t('viewAllCategoriesBtn')}</button>
        </div>
      `;
      return;
    }

    if (this.currentCategory === 'all' && this.searchQuery.trim() === '' && this.currentFilter === 'all') {
      let html = '';
      const activeCats = this.categories.filter(c => c.id !== 'all' && c.id !== 'chef-specials');
      
      activeCats.forEach(cat => {
        const catDishes = this.menuData.filter(d => d.categoryId === cat.id);
        if (catDishes.length > 0) {
          const locName = this.getCategoryLocalizedName(cat.id);
          const locSub = this.getCategoryLocalizedSubtitle(cat.id);
          html += `
            <div class="category-section" id="section-${cat.id}">
              <div class="section-header">
                <div>
                  <h3 class="section-title">${locName}</h3>
                  ${locSub ? `<span style="font-size: 0.8rem; color: var(--gold-primary); font-weight: 700;">${locSub}</span>` : ''}
                </div>
                <span class="section-count">${catDishes.length} ${itemsWord}</span>
              </div>
              <div class="dish-grid">
                ${catDishes.map(dish => this.renderDishCard(dish)).join('')}
              </div>
            </div>
          `;
        }
      });
      container.innerHTML = html;
    } else {
      container.innerHTML = `
        <div class="dish-grid">
          ${filtered.map(dish => this.renderDishCard(dish)).join('')}
        </div>
      `;
    }

    this.bindDishActions();
  }

  renderDishCard(dish) {
    const hasVariants = dish.variants && dish.variants.length > 0;
    const hasPhoto = dish.image && dish.image.trim() !== '';
    const isZomatoRated = (dish.tags && dish.tags.includes('zomato-top')) || Boolean(dish.zomatoRating);
    const zomatoScore = dish.zomatoRating || '4.2';
    const ratingHtml = isZomatoRated 
      ? `<button type="button" class="dish-rating zomato-rating" onclick="event.stopPropagation(); window.app ? window.app.routeToReview('zomato') : window.open('https://www.zomato.com/bhusawal/restaurants?q=Hotel+Premier', '_blank');" title="Hotel Premier Zomato Rating & Reviews - Tap to view">Zomato ${zomatoScore}★ ↗</button>` 
      : '';

    let badgesHtml = '';
    if (dish.tags && dish.tags.includes('swiggy-top')) {
      badgesHtml += `<span class="badge-tag swiggy" onclick="event.stopPropagation(); window.app ? window.app.routeToReview('swiggy') : window.open('https://www.swiggy.com/city/bhusawal/hotel-premier-saket-society-rest787948', '_blank');" title="Hotel Premier 4.2★ on Swiggy - Tap to view reviews & menu">${this.t('badgeSwiggy')} ↗</span>`;
    }
    if (dish.tags && dish.tags.includes('zomato-top')) {
      badgesHtml += `<span class="badge-tag zomato" onclick="event.stopPropagation(); window.app ? window.app.routeToReview('zomato') : window.open('https://www.zomato.com/bhusawal/restaurants?q=Hotel+Premier', '_blank');" title="Hotel Premier Zomato Reviews - Tap to view">${this.t('badgeZomato')} ↗</span>`;
    }
    if (dish.tags && dish.tags.includes('chef-special')) {
      badgesHtml += `<span class="badge-tag chef-special">${this.t('badgeChefSpecial')}</span>`;
    }
    if (dish.tags && dish.tags.includes('bestseller') && !dish.tags.includes('swiggy-top') && !dish.tags.includes('zomato-top')) {
      badgesHtml += `<span class="badge-tag bestseller">${this.t('badgeBestseller')}</span>`;
    }
    if (dish.tags && dish.tags.includes('khandeshi-special')) {
      badgesHtml += `<span class="badge-tag khandeshi">${this.t('badgeKhandeshi')}</span>`;
    }
    if (dish.tags && dish.tags.includes('spicy')) {
      badgesHtml += `<span class="badge-tag" style="background:#FFE4E6; color:#BE123C; border:1px solid #FB7185;">${this.t('badgeSpicy')}</span>`;
    }

    let variantsHtml = '';
    if (hasVariants) {
      variantsHtml = `
        <div class="dish-variants" data-dish-id="${dish.id}">
          ${dish.variants.map((v, i) => `
            <button class="variant-btn ${i === 0 ? 'selected' : ''}" data-variant-name="${v.name}" data-variant-price="${v.price}">
              ${v.name} ₹${v.price}
            </button>
          `).join('')}
        </div>
      `;
    }

    let dishTitleHtml = dish.name;
    if (this.currentLang === 'hi' && dish.hindiName) {
      dishTitleHtml = `${dish.name} <span class="dish-title-sub">(${dish.hindiName})</span>`;
    } else if (this.currentLang === 'mr' && (dish.marathiName || dish.hindiName)) {
      const subName = dish.marathiName || dish.hindiName;
      dishTitleHtml = `${dish.name} <span class="dish-title-sub">(${subName})</span>`;
    }

    const mediaHtml = (window.AssetPipeline && typeof window.AssetPipeline.renderDishMedia === 'function')
      ? window.AssetPipeline.renderDishMedia(dish, { badgesHtml, soldOutText: this.t('soldOut') })
      : `
        <div class="dish-media hp-asset-pedestal ${hasPhoto ? '' : 'no-photo'}">
          <div class="hp-pedestal-glow" aria-hidden="true"></div>
          ${hasPhoto ? `<div class="hp-pedestal-plate" aria-hidden="true"></div>` : ''}
          ${hasPhoto ? `
            <img src="${dish.image}" alt="${dish.name}" class="dish-img hp-isolated-asset" id="dish-img-el-${dish.id}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'">
            <div class="hp-glass-vignette" aria-hidden="true"></div>
          ` : `
            <div class="dish-no-photo-placeholder" id="dish-img-el-${dish.id}">
              <div class="no-photo-icon">🌱</div>
              <div class="no-photo-crest">HOTEL PREMIER</div>
              <div class="no-photo-sub">PRIDE PURE VEG AC RESTAURANT</div>
            </div>
          `}
          ${dish.isSoldOut ? `<div class="sold-out-overlay">${this.t('soldOut')}</div>` : ''}
          <div class="dish-badges">${badgesHtml}</div>
          <div class="dish-veg-symbol" title="100% Pure Vegetarian"><div class="dish-veg-dot"></div></div>
        </div>
      `;

    return `
      <div class="dish-card ${dish.isSoldOut ? 'sold-out' : ''}" id="dish-card-${dish.id}" onclick="window.app.openDishDetail('${dish.id}')">
        ${mediaHtml}
        <div class="dish-body">
          <div class="dish-header-row">
            <h4 class="dish-title">${dishTitleHtml}</h4>
            ${ratingHtml}
          </div>
          <p class="dish-desc">${dish.description || 'Prepared fresh in our Pride Pure Veg Kitchen in standard refined oil.'}</p>
          ${variantsHtml}
          <div class="dish-footer">
            <div class="dish-price-block">
              <span class="dish-price" id="price-display-${dish.id}">₹${dish.price}</span>
              <span class="dish-tax-note">${this.t('taxNote')}</span>
            </div>
            ${dish.isSoldOut ? `
              <span style="font-size: 0.75rem; font-weight: 800; color: var(--pure-red);">${this.t('soldOut')}</span>
            ` : `
              <span class="view-detail-link">${this.t('detailsBtn')}</span>
            `}
          </div>
        </div>
      </div>
    `;
  }

  bindDishActions() {
    document.querySelectorAll('.variant-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const parent = btn.closest('.dish-variants');
        const dishId = parent.getAttribute('data-dish-id');
        parent.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const newPrice = btn.getAttribute('data-variant-price');
        const priceDisplay = document.getElementById(`price-display-${dishId}`);
        if (priceDisplay) priceDisplay.innerText = `₹${newPrice}`;
      });
    });
  }

  // Dish Details Modal
  openDishDetail(dishId) {
    const dish = this.menuData.find(d => d.id === dishId);
    if (!dish) return;

    if (window.HOTEL_VAULT) {
      window.HOTEL_VAULT.recordDishView(dish.id, dish.name, dish.categoryId);
    }

    const modal = document.getElementById('dish-detail-modal');
    const body = document.getElementById('dish-detail-body');
    if (!modal || !body) return;

    const hasPhoto = dish.image && dish.image.trim() !== '';
    const isZomatoRated = (dish.tags && dish.tags.includes('zomato-top')) || Boolean(dish.zomatoRating);
    const zomatoScore = dish.zomatoRating || '4.2';

    let dishTitleHtml = dish.name;
    if (this.currentLang === 'hi' && dish.hindiName) {
      dishTitleHtml = `${dish.name} <span style="font-size: 0.95rem; font-weight: 600; color: #94A3B8; margin-left: 6px;">(${dish.hindiName})</span>`;
    } else if (this.currentLang === 'mr' && (dish.marathiName || dish.hindiName)) {
      const subName = dish.marathiName || dish.hindiName;
      dishTitleHtml = `${dish.name} <span style="font-size: 0.95rem; font-weight: 600; color: #94A3B8; margin-left: 6px;">(${subName})</span>`;
    }

    let variantsList = '';
    if (dish.variants && dish.variants.length > 0) {
      variantsList = `
        <div style="margin-bottom: 14px; background: var(--cream-bg); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--cream-border);">
          <div style="font-size: 0.8rem; font-weight: 800; color: var(--terracotta-dark); margin-bottom: 6px;">${this.t('variantsTitle')}</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${dish.variants.map(v => `<span style="font-size: 0.85rem; font-weight: 800; color: var(--terracotta); background: #FFF; padding: 4px 10px; border-radius: 6px; border: 1.5px solid var(--gold-primary);">${v.name}: ₹${v.price}</span>`).join('')}
          </div>
        </div>
      `;
    }

    const detailMediaHtml = (window.AssetPipeline && typeof window.AssetPipeline.renderDetailMedia === 'function')
      ? window.AssetPipeline.renderDetailMedia(dish)
      : `
        <div style="position: relative; height: 230px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 14px;">
          ${hasPhoto ? `
            <img src="${dish.image}" alt="${dish.name}" id="detail-modal-img" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'">
          ` : `
            <div class="dish-no-photo-placeholder" id="detail-modal-img">
              <div class="no-photo-icon">🌱</div>
              <div class="no-photo-crest" style="font-size: 1rem;">HOTEL PREMIER</div>
              <div class="no-photo-sub" style="font-size: 0.8rem;">Pride Pure Veg AC Restaurant</div>
            </div>
          `}
          <div class="dish-veg-symbol"><div class="dish-veg-dot"></div></div>
          ${dish.isSoldOut ? `<div class="sold-out-overlay">${this.t('soldOut')}</div>` : ''}
          <button onclick="window.admin ? window.admin.openImageModal('${dish.id}') : null" class="btn-detail-photo-action">
            ${hasPhoto ? '📷 Change Photo' : '➕ Upload Photo'}
          </button>
        </div>
      `;

    body.innerHTML = `
      ${detailMediaHtml}
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 12px 0 6px;">
        <div>
          <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: #FFFFFF; font-weight: 800; letter-spacing: 0.3px;">${dishTitleHtml}</h3>
          <div style="font-size: 0.84rem; color: var(--gold-light); font-weight: 600;">${this.t('servingTime')}</div>
        </div>
        <span style="font-family: var(--font-sans); font-size: 1.6rem; font-weight: 900; color: var(--champagne-gold);">₹${dish.price}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;">
        ${isZomatoRated ? `<a href="https://www.zomato.com/bhusawal/restaurants?q=Hotel+Premier" target="_blank" rel="noopener noreferrer" class="dish-rating zomato-rating" style="font-size: 0.82rem; padding: 4px 10px; border-radius: 8px; text-decoration: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Hotel Premier Zomato Rating & Reviews">Zomato ${zomatoScore}★ ↗</a>` : ''}
        ${dish.tags && dish.tags.includes('swiggy-top') ? `<a href="https://www.swiggy.com/city/bhusawal/hotel-premier-saket-society-rest787948" target="_blank" rel="noopener noreferrer" class="badge-tag swiggy" style="text-decoration: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Hotel Premier 4.2★ on Swiggy">🛵 4.2★ Swiggy Bestseller ↗</a>` : ''}
        ${dish.tags && dish.tags.includes('zomato-top') ? `<a href="https://www.zomato.com/bhusawal/restaurants?q=Hotel+Premier" target="_blank" rel="noopener noreferrer" class="badge-tag zomato" style="text-decoration: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">${this.t('badgeZomato')} ↗</a>` : ''}
        ${dish.tags && dish.tags.includes('chef-special') ? `<span class="badge-tag chef-special">${this.t('badgeChefSpecial')}</span>` : ''}
      </div>
      <p style="font-size: 0.94rem; color: #E2E8F0; line-height: 1.55; margin-bottom: 14px;">${dish.description || 'Prepared fresh in our Pride Pure Veg Kitchen in standard refined oil.'}</p>
      ${variantsList}
      <div style="background: rgba(22, 32, 53, 0.7); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--gold-border); font-size: 0.82rem; color: var(--gold-light); line-height: 1.45;">
        ${this.t('pureVegNote')}
      </div>
    `;

    modal.classList.add('active');
  }

  closeDishDetail() {
    const modal = document.getElementById('dish-detail-modal');
    if (modal) modal.classList.remove('active');
  }

  routeToReview(platform) {
    const urls = {
      google: 'https://www.google.com/search?q=Hotel+Premier+Jamner+Road+Bhusawal+reviews',
      zomato: 'https://www.zomato.com/bhusawal/restaurants?q=Hotel+Premier',
      swiggy: 'https://www.swiggy.com/city/bhusawal/hotel-premier-saket-society-rest787948'
    };
    const target = urls[platform] || urls.google;
    window.open(target, '_blank', 'noopener,noreferrer');
  }

  // ==================== 3. BULK BOOKING & CALCULATOR ENGINE (14 ROOMS PROPERTY) ====================
  getBulkDeals() {
    try {
      const saved = localStorage.getItem('hotel_premier_bulk_deals_override');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.bulkMarriageDeals)
      ? JSON.parse(JSON.stringify(window.HOTEL_PREMIER_HOTEL_DATA.bulkMarriageDeals))
      : [];
  }

  renderBulkDealsSection() {
    const container = document.getElementById('bulk-deals-tiers-container');
    if (!container) return;

    const deals = this.getBulkDeals();
    container.innerHTML = deals.map((deal, idx) => `
      <div class="bulk-tier-card ${idx === deals.length - 1 ? 'featured' : ''}">
        ${idx === deals.length - 1 ? '<div class="tier-badge-popular">👑 EXCLUSIVE FULL BUYOUT</div>' : ''}
        <div class="tier-tag">${deal.badge || `${deal.minRooms}+ ROOMS`}</div>
        <h4 class="tier-name">${deal.name}</h4>
        <div class="tier-discount">${deal.discountPercent}% OFF</div>
        <ul class="tier-perks">
          ${(deal.perks || []).map(p => `<li>✦ ${p}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  calculateBulkQuote() {
    const roomTypeSelect = document.getElementById('calc-room-type');
    const roomsInput = document.getElementById('calc-rooms-number');
    const nightsSelect = document.getElementById('calc-num-nights');
    const planRadios = document.getElementsByName('calc-plan');
    const extraBedsInput = document.getElementById('calc-extra-beds');

    if (!roomTypeSelect || !roomsInput || !nightsSelect) return;

    const roomType = roomTypeSelect.value;
    let numRooms = parseInt(roomsInput.value) || 14;
    if (numRooms > 14) numRooms = 14;
    const numNights = parseInt(nightsSelect.value) || 1;

    let numExtraBeds = parseInt(extraBedsInput ? extraBedsInput.value : 0) || 0;
    if (numExtraBeds < 0) numExtraBeds = 0;
    if (numExtraBeds > 26) numExtraBeds = 26;
    if (extraBedsInput) extraBedsInput.value = numExtraBeds;

    let plan = 'CP';
    planRadios.forEach(r => {
      if (r.checked) plan = r.value;
    });

    let baseRoomRegular = 0;

    if (roomType === 'full-14') {
      numRooms = 14;
      document.getElementById('calc-rooms-number').value = 14;
      const superDeluxeTotal = 2 * (plan === 'CP' ? 2600 : 2200);
      const deluxeTotal = 12 * (plan === 'CP' ? 2400 : 2000);
      baseRoomRegular = (superDeluxeTotal + deluxeTotal) * numNights;
    } else if (roomType === 'super-2') {
      if (numRooms > 2) numRooms = 2;
      document.getElementById('calc-rooms-number').value = numRooms;
      const rate = plan === 'CP' ? 2600 : 2200;
      baseRoomRegular = rate * numRooms * numNights;
    } else if (roomType === 'queen-4') {
      if (numRooms > 4) numRooms = 4;
      document.getElementById('calc-rooms-number').value = numRooms;
      const rate = plan === 'CP' ? 2400 : 2000;
      baseRoomRegular = rate * numRooms * numNights;
    } else if (roomType === 'twin-8') {
      if (numRooms > 8) numRooms = 8;
      document.getElementById('calc-rooms-number').value = numRooms;
      const rate = plan === 'CP' ? 2400 : 2000;
      baseRoomRegular = rate * numRooms * numNights;
    } else {
      const rate = plan === 'CP' ? 2400 : 2000;
      baseRoomRegular = rate * numRooms * numNights;
    }

    // Extra Bed Calculation @ Rs 300 per bed per night
    const extraBedRate = 300;
    const extraBedCost = numExtraBeds * extraBedRate * numNights;
    const totalRegular = baseRoomRegular + extraBedCost;

    const activeDeals = this.getBulkDeals().sort((a, b) => b.minRooms - a.minRooms);
    let matchedDeal = activeDeals.find(d => numRooms >= d.minRooms);
    let discountPercent = matchedDeal ? matchedDeal.discountPercent : (numRooms >= 5 ? 10 : 0);

    const savings = Math.round((totalRegular * discountPercent) / 100);
    const finalPrice = totalRegular - savings;

    const regPriceEl = document.getElementById('quote-regular-price');
    const discTagEl = document.getElementById('quote-discount-tag');
    const savingsEl = document.getElementById('quote-savings-amount');
    const finalPriceEl = document.getElementById('quote-final-price');

    const extraBedRowEl = document.getElementById('quote-extra-bed-row');
    const extraBedCountEl = document.getElementById('quote-extra-bed-count');
    const extraBedAmountEl = document.getElementById('quote-extra-bed-amount');

    if (regPriceEl) regPriceEl.innerText = `₹ ${totalRegular.toLocaleString('en-IN')}/-`;
    if (discTagEl) discTagEl.innerText = `${discountPercent}% OFF`;
    if (savingsEl) savingsEl.innerText = `- ₹ ${savings.toLocaleString('en-IN')}/-`;
    if (finalPriceEl) finalPriceEl.innerText = `₹ ${finalPrice.toLocaleString('en-IN')}/-`;

    if (extraBedRowEl && extraBedCountEl && extraBedAmountEl) {
      if (numExtraBeds > 0) {
        extraBedRowEl.style.display = 'flex';
        extraBedCountEl.innerText = numExtraBeds;
        extraBedAmountEl.innerText = `+ ₹ ${extraBedCost.toLocaleString('en-IN')}/-`;
      } else {
        extraBedRowEl.style.display = 'none';
      }
    }

    this.latestQuote = {
      roomType: roomTypeSelect.options[roomTypeSelect.selectedIndex].text,
      rooms: numRooms,
      extraBeds: numExtraBeds,
      extraBedCost: extraBedCost,
      nights: numNights,
      plan: plan === 'CP' ? 'Room with Breakfast (CP)' : 'Room Only (RO)',
      eventType: document.getElementById('calc-event-type') ? document.getElementById('calc-event-type').value : 'Marriage Event',
      baseRoomPrice: baseRoomRegular,
      regularPrice: totalRegular,
      discountPercent: discountPercent,
      finalPrice: finalPrice,
      savings: savings
    };
  }

  sendBulkWhatsAppInquiry() {
    if (!this.latestQuote) {
      this.calculateBulkQuote();
    }

    const q = this.latestQuote;
    const extraBedsLine = (q.extraBeds > 0)
      ? `🛏️ *Extra Beds:* ${q.extraBeds} Bed(s) @ ₹300/night (+ ₹ ${q.extraBedCost.toLocaleString('en-IN')}/-)%0A`
      : '';

    const bulkName = document.getElementById('calc-bulk-guest-name')?.value.trim() || '';
    const bulkPhone = document.getElementById('calc-bulk-guest-phone')?.value.trim() || '';
    if (bulkName || bulkPhone) {
      this.saveGuestProfile({ name: bulkName, phone: bulkPhone });
    }
    const guestContactLine = (bulkName || bulkPhone)
      ? `👤 *Organizer:* ${encodeURIComponent(bulkName || 'Guest')} (${encodeURIComponent(bulkPhone || 'Not provided')})%0A`
      : '';

    const msg = `*HOTEL PREMIER BHUSAWAL - ADVANCE BULK ROOM INQUIRY*%0A` +
      `---------------------------------------%0A` +
      guestContactLine +
      `🏨 *Event Type:* ${encodeURIComponent(q.eventType)}%0A` +
      `🛏️ *Room Category:* ${encodeURIComponent(q.roomType)}%0A` +
      `🔢 *Number of Rooms:* ${q.rooms} Rooms (Total 14 Available)%0A` +
      extraBedsLine +
      `🌙 *Duration of Stay:* ${q.nights} Night(s)%0A` +
      `🍽️ *Meal Plan:* ${encodeURIComponent(q.plan)}%0A` +
      `🏷️ *Bulk Discount Applied:* ${q.discountPercent}% OFF%0A` +
      `💰 *Estimated Deal Price:* ₹ ${q.finalPrice.toLocaleString('en-IN')}/- (Saved ₹ ${q.savings.toLocaleString('en-IN')})%0A` +
      `---------------------------------------%0A` +
      `Hello Hotel Premier Team, please confirm our reservation quote!`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=919325375802&text=${msg}`;
    window.open(whatsappUrl, '_blank');
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
            <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&auto=format&fit=crop&q=80'">
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

    const msg = `*HOTEL PREMIER BHUSAWAL - RESTAURANT EVENT & LUNCH BOOKING*%0A` +
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
      : 'https://www.google.com/maps/search/?api=1&query=Hotel+Premier+Jamner+Road+Near+Nahata+College+Bhusawal+425201';

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
        mount.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(mapsUrl)}" alt="Location QR" style="width: 160px; height: 160px; border-radius: 8px;">`;
      }
    } else {
      mount.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(mapsUrl)}" alt="Location QR" style="width: 160px; height: 160px; border-radius: 8px;">`;
    }
  }

  renderLocationDistances() {
    const container = document.getElementById('hotel-distances-list');
    if (!container || !window.HOTEL_PREMIER_HOTEL_DATA || !window.HOTEL_PREMIER_HOTEL_DATA.locationDistances) return;

    const distances = window.HOTEL_PREMIER_HOTEL_DATA.locationDistances;
    container.innerHTML = distances.map(item => `
      <div class="distance-item-row">
        <div class="distance-place-info">
          <span style="font-size: 1.25rem;">${item.icon}</span>
          <div>
            <div class="distance-place-name">${item.place}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${item.desc}</div>
          </div>
        </div>
        <div class="distance-metrics">
          <div class="distance-km">${item.distance}</div>
          <div class="distance-time">${item.time}</div>
        </div>
      </div>
    `).join('');
  }

  shareLocationOnWhatsApp() {
    const mapsUrl = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.hotelInfo) 
      ? window.HOTEL_PREMIER_HOTEL_DATA.hotelInfo.googleMapsUrl 
      : 'https://www.google.com/maps/search/?api=1&query=Hotel+Premier+Jamner+Road+Near+Nahata+College+Bhusawal+425201';

    const msg = `*HOTEL PREMIER BHUSAWAL - LOCATION & GPS DIRECTIONS*%0A` +
      `---------------------------------------%0A` +
      `📍 *Address:* Near Nahata College, Saket Soc, Jamner Road, Bhusawal - 425 201%0A` +
      `🚆 *Landmark:* 5 Mins (2 KM) from Bhusawal Railway Junction%0A` +
      `📞 *Contact:* 09325375802 (Primary) / 09370848917 / (02582) 240422%0A` +
      `🗺️ *Live Google Maps Directions Link:*%0A${encodeURIComponent(mapsUrl)}%0A` +
      `---------------------------------------%0A` +
      `Please drive safely to Hotel Premier Bhusawal!`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${msg}`;
    window.open(whatsappUrl, '_blank');
  }

  showToast(message, type = 'info') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #0E1D36;
        color: #F7C860;
        padding: 10px 20px;
        border-radius: 30px;
        font-family: 'Cinzel', serif;
        font-size: 0.85rem;
        font-weight: 800;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        border: 1.5px solid #D4901C;
        z-index: 9999;
        display: none;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(toast);
    }

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toast.style.display = 'flex';
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 300);
    }, 2800);
  }

  bindEvents() {
    const searchInput = document.getElementById('menu-search-input');
    const clearBtn = document.getElementById('clear-search-btn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (clearBtn) {
          clearBtn.style.display = this.searchQuery.length > 0 ? 'flex' : 'none';
        }

        if (this.searchQuery.trim().length > 0) {
          if (window.HOTEL_VAULT && this.searchQuery.trim().length >= 2) {
            clearTimeout(this._searchLogTimer);
            this._searchLogTimer = setTimeout(() => {
              window.HOTEL_VAULT.recordSearchQuery(this.searchQuery);
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

    // Modal backdrop click-to-close
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Touch Swipe gestures for Restaurant Hero Carousel
    const heroWrapper = document.getElementById('restaurant-hero-carousel');
    if (heroWrapper) {
      let touchStartX = 0;
      let touchEndX = 0;
      heroWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        if (this.heroAutoInterval) clearInterval(this.heroAutoInterval);
      }, { passive: true });

      heroWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 45) {
          this.nextHeroSlide();
        } else if (touchEndX - touchStartX > 45) {
          this.prevHeroSlide();
        }
        this.startHeroAutoSlide();
      }, { passive: true });
    }

    // Touch Swipe gestures for Section Dishes Slideshow
    const sectionContainer = document.getElementById('section-slideshow-container');
    if (sectionContainer) {
      let touchStartX = 0;
      let touchEndX = 0;
      sectionContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        if (this.sectionAutoInterval) clearInterval(this.sectionAutoInterval);
      }, { passive: true });

      sectionContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 45) {
          this.nextSectionSlide();
        } else if (touchEndX - touchStartX > 45) {
          this.prevSectionSlide();
        }
        this.startSectionAutoSlide();
      }, { passive: true });
    }

    // Touch Swipe gestures for Room Carousels
    ['ac-super-deluxe', 'ac-deluxe-queen', 'ac-deluxe-twin'].forEach(roomId => {
      const roomEl = document.getElementById(`room-carousel-${roomId}`);
      if (roomEl) {
        let touchStartX = 0;
        let touchEndX = 0;
        roomEl.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        roomEl.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].screenX;
          if (touchStartX - touchEndX > 45) {
            this.nextRoomSlide(roomId);
          } else if (touchEndX - touchStartX > 45) {
            this.prevRoomSlide(roomId);
          }
        }, { passive: true });
      }
    });
  }

  // ==================== 5. STAFF ACCESS CONTROL (HIDDEN FROM GUESTS) ====================
  checkStaffModeAccess() {
    try {
      const params = new URLSearchParams(window.location.search);
      const isStaffUrl = params.has('staff') || params.has('admin') || params.has('manage') || params.has('cms') || window.location.hash === '#admin';
      const settingsBtn = document.getElementById('cms-settings-admin-btn');
      if (settingsBtn) {
        if (isStaffUrl || sessionStorage.getItem('hp_staff_mode_active') === 'true') {
          settingsBtn.style.display = 'inline-flex';
        } else {
          settingsBtn.style.display = 'none';
        }
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

    // 2. Event Calculator
    const eName = document.getElementById('calc-event-guest-name');
    const ePhone = document.getElementById('calc-event-guest-phone');
    if (eName && p.name && (!eName.value || document.activeElement !== eName)) eName.value = p.name;
    if (ePhone && p.phone && (!ePhone.value || document.activeElement !== ePhone)) ePhone.value = p.phone;

    // 3. Bulk Marriage Calculator
    const bName = document.getElementById('calc-bulk-guest-name');
    const bPhone = document.getElementById('calc-bulk-guest-phone');
    if (bName && p.name && (!bName.value || document.activeElement !== bName)) bName.value = p.name;
    if (bPhone && p.phone && (!bPhone.value || document.activeElement !== bPhone)) bPhone.value = p.phone;

    // 4. Guest Pass Modal Form
    const mName = document.getElementById('guest-pass-input-name');
    const mPhone = document.getElementById('guest-pass-input-phone');
    const mTable = document.getElementById('guest-pass-input-table');
    const mRegion = document.getElementById('guest-pass-input-region');
    if (mName && p.name && document.activeElement !== mName) mName.value = p.name;
    if (mPhone && p.phone && document.activeElement !== mPhone) mPhone.value = p.phone;
    if (mTable && p.tableOrRoom && document.activeElement !== mTable) mTable.value = p.tableOrRoom;
    if (mRegion && p.region && document.activeElement !== mRegion) mRegion.value = p.region;
  }

  bindGuestProfileSync() {
    if (this._guestSyncBound) return;
    this._guestSyncBound = true;

    const fields = [
      { id: 'feedback-guest-name', key: 'name' },
      { id: 'calc-event-guest-name', key: 'name' },
      { id: 'calc-bulk-guest-name', key: 'name' },
      { id: 'guest-pass-input-name', key: 'name' },

      { id: 'feedback-guest-phone', key: 'phone' },
      { id: 'calc-event-guest-phone', key: 'phone' },
      { id: 'calc-bulk-guest-phone', key: 'phone' },
      { id: 'guest-pass-input-phone', key: 'phone' },

      { id: 'feedback-table-num', key: 'tableOrRoom' },
      { id: 'guest-pass-input-table', key: 'tableOrRoom' },

      { id: 'feedback-guest-region', key: 'region' },
      { id: 'guest-pass-input-region', key: 'region' }
    ];

    fields.forEach(({ id, key }) => {
      const el = document.getElementById(id);
      if (el) {
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
      patch[key] = value;
      this.saveGuestProfile(patch);
    }, 350);
  }

  updateHeaderGuestBadge(profile) {
    const p = profile || this.getGuestProfile();
    const pillText = document.getElementById('header-guest-pass-text');
    const pillBtn = document.getElementById('header-guest-pass-btn');
    if (!pillText) return;

    if (p.name) {
      const firstName = p.name.trim().split(' ')[0];
      pillText.innerText = `👋 ${firstName}`;
      if (pillBtn) pillBtn.classList.add('has-profile');
    } else if (p.tableOrRoom) {
      pillText.innerText = `📍 ${p.tableOrRoom}`;
      if (pillBtn) pillBtn.classList.remove('has-profile');
    } else {
      pillText.innerText = '⚡ Quick Pass';
      if (pillBtn) pillBtn.classList.remove('has-profile');
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
    this.currentStarRating = rating;
    const input = document.getElementById('feedback-star-val');
    if (input) input.value = rating;

    const btns = document.querySelectorAll('#feedback-star-control .star-btn');
    btns.forEach((b) => {
      const val = parseInt(b.getAttribute('data-value')) || 0;
      b.classList.toggle('active', val <= rating);
    });

    const verdicts = {
      1: '🙁 1 Star — Needs Improvement',
      2: '😐 2 Stars — Fair Dining Experience',
      3: '🙂 3 Stars — Good Meal',
      4: '😊 4 Stars — Very Good Quality & Taste',
      5: '🌟 5 Stars — Exceptional Dining & Service!'
    };
    const verdictEl = document.getElementById('feedback-rating-verdict');
    if (verdictEl) verdictEl.innerText = verdicts[rating] || '🌟 5 Stars';
  }

  submitGuestFeedback(e) {
    if (e) e.preventDefault();
    const nameEl = document.getElementById('feedback-guest-name');
    const phoneEl = document.getElementById('feedback-guest-phone');
    const regionEl = document.getElementById('feedback-guest-region');
    const tableEl = document.getElementById('feedback-table-num');
    const commentsEl = document.getElementById('feedback-guest-comments');
    const ratingEl = document.getElementById('feedback-star-val');

    const name = nameEl ? nameEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const region = regionEl ? regionEl.value : 'Bhusawal Local';
    const table = tableEl ? tableEl.value.trim() : '';
    const comments = commentsEl ? commentsEl.value.trim() : '';
    const rating = ratingEl ? parseInt(ratingEl.value) || 5 : 5;

    if (!name) {
      alert('Please enter your name.');
      if (nameEl) nameEl.focus();
      return false;
    }
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit WhatsApp/mobile number.');
      if (phoneEl) phoneEl.focus();
      return false;
    }

    this.saveGuestProfile({
      name: name,
      phone: phone,
      region: region,
      tableOrRoom: table
    });
    this.dismissWelcomeBanner();

    const selectedTags = [];
    document.querySelectorAll('#feedback-tags-container .feedback-chip.active').forEach(chip => {
      selectedTags.push(chip.innerText.trim());
    });

    if (window.HOTEL_VAULT) {
      window.HOTEL_VAULT.recordFeedback({
        name: name,
        phone: phone,
        region: region,
        tableOrRoom: table,
        rating: rating,
        tags: selectedTags,
        comments: comments
      });
    }

    const form = document.getElementById('dining-feedback-form');
    const thankyou = document.getElementById('feedback-thankyou-card');
    if (form) form.style.display = 'none';
    if (thankyou) {
      thankyou.style.display = 'block';
      thankyou.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    this.showToast('Thank you for your rating!', 'success');
    return false;
  }

  // ==================== 7. MASTER DEVELOPER VAULT CONTROLS ====================
  unlockDeveloperVault() {
    const input = document.getElementById('dev-vault-pin-input');
    const pin = input ? input.value : '';
    if (window.HOTEL_VAULT && window.HOTEL_VAULT.verifyMasterPin(pin)) {
      const gate = document.getElementById('dev-vault-gate');
      const deck = document.getElementById('dev-vault-deck');
      if (gate) gate.style.display = 'none';
      if (deck) deck.style.display = 'block';
      this.renderDeveloperVaultUI();
      this.showToast('Master Vault Unlocked 🔓', 'success');
    } else {
      alert('Incorrect Developer PIN. Access denied.');
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
    const currentPin = prompt('Enter Current Master Developer PIN:');
    if (!window.HOTEL_VAULT || !window.HOTEL_VAULT.verifyMasterPin(currentPin)) {
      alert('Authentication failed.');
      return;
    }
    const newPin = prompt('Enter New Master Developer PIN (at least 4 digits):');
    if (newPin && newPin.length >= 4) {
      window.HOTEL_VAULT.setMasterPin(newPin);
      alert('Master Developer PIN successfully updated!');
    } else if (newPin) {
      alert('PIN must be at least 4 digits.');
    }
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
