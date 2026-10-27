// Photo display only; no generation or enhancement.
(function(window){
class HotelAssetPipeline {
constructor(){this.processedCache=new Map();}
    clearCacheForAsset(imageOrDishId) {
      if (!imageOrDishId) {
        this.processedCache.clear();
        try {
          for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const k = sessionStorage.key(i);
            if (k && k.startsWith('hp_proc_')) sessionStorage.removeItem(k);
          }
        } catch (_) {}
        return;
      }
      const searchKey = String(imageOrDishId);
      for (const key of this.processedCache.keys()) {
        if (key.includes(searchKey)) {
          this.processedCache.delete(key);
        }
      }
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith('hp_proc_') && k.includes(searchKey)) {
            sessionStorage.removeItem(k);
          }
        }
      } catch (_) {}
    }

    handleImageError(image) {
      image.onerror = null;
      image.hidden = true;
      const wrapper = image.parentElement;
      if (!wrapper) return;
      wrapper.classList.add('no-photo');
      // Preserve upload controls, sold-out state and badges. Never substitute food.
      if (!wrapper.querySelector('.dish-no-photo-placeholder')) {
        const placeholder = document.createElement('div');
        placeholder.className = 'dish-no-photo-placeholder';
        placeholder.textContent = 'Photo coming soon';
        placeholder.setAttribute('role', 'status');
        wrapper.appendChild(placeholder);
      }
    }

    versionedPhotoSource(source) {
      if (typeof source !== 'string' || !source.startsWith('assets/')) return source || '';
      const clean = source.split('?')[0];
      const hash = window.HOTEL_PREMIER_IMAGE_SIZES?.[clean]?.[0]?.src?.match(/\/([a-f0-9]+)-\d+\.webp$/)?.[1];
      return `${clean}?v=${hash || '22.41'}`;
    }

    responsivePhotoAttributes(source, detail = false, compact = false) {
      const sizes = window.HOTEL_PREMIER_IMAGE_SIZES?.[source];
      if (Array.isArray(sizes) && sizes.length) {
        const unique = sizes.filter((entry, i) => sizes.findIndex(other => other.width === entry.width) === i);
        return `srcset="${unique.map(entry => `${entry.src} ${entry.width}w`).join(', ')}" sizes="${compact ? '(max-width: 400px) 72px, 80px' : detail ? '(max-width: 640px) 92vw, 640px' : '(max-width: 640px) 92vw, 540px'}"`;
      }
      // Only approved build-generated assets have these companion sizes.
      if (!/^assets\/menu-uploads\/approved\/(ic-10|ms-7)-v1-1280\.webp$/.test(source || '')) return '';
      const small = source.replace('-1280.webp', '-640.webp');
      return `srcset="${small} 640w, ${source} 1280w" sizes="${detail ? '(max-width: 640px) 92vw, 640px' : '(max-width: 640px) 92vw, 540px'}"`;
    }

    renderDishMedia(dish, options = {}) {
      const hasPhoto = dish.image && dish.image.trim() !== '';
      const badgesHtml = options.badgesHtml || '';
      const soldOutHtml = dish.isSoldOut ? `<div class="sold-out-overlay">${options.soldOutText || 'SOLD OUT'}</div>` : '';

      if (!hasPhoto) {
        return `
          <div class="dish-media no-photo" id="dish-media-${dish.id}">
            <div class="dish-no-photo-placeholder" id="dish-img-el-${dish.id}">
              <div class="no-photo-icon">🌱</div>
              <div class="no-photo-crest">HOTEL PREMIER</div>
              <div class="no-photo-sub">PRIDE PURE VEG AC RESTAURANT</div>
            </div>
            ${soldOutHtml}
            <div class="dish-badges">${badgesHtml}</div>
            <div class="dish-veg-symbol" title="100% Pure Vegetarian"><div class="dish-veg-dot"></div></div>
          </div>
        `;
      }

      return `
        <div class="dish-media" id="dish-media-${dish.id}">
          <div class="hp-dish-pedestal-backdrop" aria-hidden="true"></div>
          <img height="900" width="1200"
            src="${this.versionedPhotoSource(dish.image)}"
            ${this.responsivePhotoAttributes(dish.image)}
            alt="${dish.name}"
            class="dish-img"
            id="dish-img-el-${dish.id}"
            loading="lazy"
            decoding="async"
            onerror="window.AssetPipeline.handleImageError(this)"
          >
          <div class="hp-glass-vignette" aria-hidden="true"></div>
          ${soldOutHtml}
          <div class="dish-badges">${badgesHtml}</div>
          <div class="dish-veg-symbol" title="100% Pure Vegetarian"><div class="dish-veg-dot"></div></div>
        </div>
      `;
    }

    /**
     * Standardized HTML Markup Generator for Sub-Section Multi-Photo Slide Card
     */
    renderSectionSlideMedia(slide, idx) {
      const clickAttr = slide.dishId ? `onclick="window.app ? window.app.openDishDetail('${slide.dishId}') : null"` : '';
      const badgeText = slide.badge || '👑 SECTION HIGHLIGHT';
      const priceHtml = (slide.price !== undefined && slide.price !== null) ? `<span class="section-slide-price-pill">₹${slide.price}/-</span>` : '';
      const subtitleText = slide.subtitle || '👆 Tap to view dish details & options';
      const slideTitle = slide.name || slide.title || 'Hotel Premier Special';

      return `
        <div class="section-slide-card" ${clickAttr}>
          <img height="900" width="1200"
            src="${slide.image}"
            alt="${slideTitle}"
            class="section-slide-img"
            loading="${idx === 0 ? 'eager' : 'lazy'}"
            decoding="async"
            onerror="window.AssetPipeline.handleImageError(this)"
          >
          <div class="section-slide-overlay">
            <div class="section-slide-badge-row">
              <span class="section-slide-badge">${badgeText}</span>
            </div>
            <div class="section-slide-title-row">
              <div>
                <h3 class="section-slide-title">${slideTitle}</h3>
                <div class="section-slide-action-hint">${subtitleText}</div>
              </div>
              ${priceHtml}
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Standardized HTML Markup Generator for Main Restaurant Hero Carousel Slide
     */
    renderHeroSlideMedia(slide, idx) {
      const slideTitle = slide.title || 'Culinary Delights of Hotel Premier';
      const slideSubtitle = slide.subtitle || 'Prepared fresh in standard refined oil • 100% Pure Veg';

      return `
        <div class="hero-carousel-slide" data-slide-index="${idx}">
          <img height="675" width="1200"
            src="${slide.image}"
            alt="${slideTitle}"
            class="hero-carousel-img"
            loading="${idx === 0 ? 'eager' : 'lazy'}"
            onerror="window.AssetPipeline.handleImageError(this)"
          >
          <div class="hero-carousel-overlay">
            <span class="hero-slide-badge" data-i18n="heroBadge">PRIDE PURE VEG AC RESTAURANT</span>
            <h2 class="hero-slide-title">${slideTitle}</h2>
            <p class="hero-slide-subtitle">${slideSubtitle}</p>
          </div>
        </div>
      `;
    }

    /**
     * Standardized HTML Markup Generator for Category Cards Media
     */
    renderCategoryCardMedia(cat, count, itemsWord, localizedTitle) {
      return `
        <div class="category-card-media">
          <img height="900" width="1200"
            src="${cat.image}"
            alt="${localizedTitle}"
            class="category-card-img"
            loading="lazy"
            onerror="window.AssetPipeline.handleImageError(this)"
          >
          <div class="category-card-overlay" aria-hidden="true"></div>
          <div class="category-crest-emblem" aria-hidden="true">${cat.icon || '🍽️'}</div>
          <span class="category-card-badge">${count} ${itemsWord}</span>
        </div>
      `;
    }

    /**
     * Standardized HTML Markup Generator for Room Slides
     */
    renderRoomMedia(imgUrl, room, idx) {
      return `
        <div class="room-carousel-slide hp-room-pedestal">
          <div class="hp-room-frame">
            <img height="900" width="1200"
              src="${imgUrl}"
              alt="${room.name} Photo ${idx + 1}"
              class="room-card-img hp-room-asset"
              loading="lazy"
              onerror="window.AssetPipeline.handleImageError(this)"
            >
            <div class="hp-room-vignette" aria-hidden="true"></div>
            <div class="hp-room-ambient-glow" aria-hidden="true"></div>
          </div>
        </div>
      `;
    }

    /**
     * Standardized HTML Markup Generator for Dish Detail Modal
     */
    /**
     * Standardized HTML Markup Generator for Dish Detail Modal
     */
    renderDetailMedia(dish, options = {}) {
      const hasPhoto = dish.image && dish.image.trim() !== '';
      const soldOutHtml = dish.isSoldOut ? `<div class="sold-out-overlay">${options.soldOutText || 'SOLD OUT'}</div>` : '';
      const badgesHtml = options.badgesHtml || '';

      if (!hasPhoto) {
        return `
          <div class="modal-dish-photo-wrap no-photo">
            <div class="dish-no-photo-placeholder">
              <div class="no-photo-icon">🌱</div>
              <div class="no-photo-crest hp-inline-2e72acd64782">HOTEL PREMIER</div>
              <div class="no-photo-sub hp-inline-8b511f076fb1">PRIDE PURE VEG AC RESTAURANT</div>
            </div>
            <div class="dish-veg-symbol" title="100% Pure Vegetarian"><div class="dish-veg-dot"></div></div>
            ${badgesHtml ? `<div class="dish-badges">${badgesHtml}</div>` : ''}
            ${soldOutHtml}
            <button onclick="window.admin ? window.admin.openImageModal('${dish.id}') : null" class="btn-detail-photo-action">
              📷 Upload Photo
            </button>
          </div>
        `;
      }

      return `
        <div class="modal-dish-photo-wrap">
          <div class="hp-dish-pedestal-backdrop" aria-hidden="true"></div>
          <img height="900" width="1200"
            src="${this.versionedPhotoSource(dish.image)}"
            alt="${dish.name}"
            id="detail-modal-img"
            ${this.responsivePhotoAttributes(dish.image, true)}
            class="modal-dish-img"
            loading="eager"
            onerror="window.AssetPipeline.handleImageError(this)"
          >
          <div class="hp-glass-vignette" aria-hidden="true"></div>
          <div class="dish-veg-symbol" title="100% Pure Vegetarian"><div class="dish-veg-dot"></div></div>
          ${badgesHtml ? `<div class="dish-badges">${badgesHtml}</div>` : ''}
          ${soldOutHtml}
          <button onclick="window.admin ? window.admin.openImageModal('${dish.id}') : null" class="btn-detail-photo-action">
            📷 Change / Upload Photo
          </button>
        </div>
      `;
    }


}
window.HotelAssetPipeline=HotelAssetPipeline;window.AssetPipeline=new HotelAssetPipeline();
})(window);
