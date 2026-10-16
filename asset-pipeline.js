/**
 * HOTEL PREMIER - INTELLIGENT ASSET PIPELINE & IMAGE MANAGEMENT ENGINE (v7.0)
 * 
 * Automated Image Processing & Asset Pipeline:
 * 1. Dynamic Background Removal:
 *    Canvas-based chroma and luminance segmentation, edge-sampling border isolation,
 *    and alpha feathering to separate dishes/products from their original backgrounds.
 * 2. Consistent Background Masking:
 *    Automatically places subjects onto a uniform luxury backdrop matching the new
 *    premium theme (charcoal #0D111A, midnight indigo #162035, champagne gold #D5B77A glow,
 *    reflective pedestal plate, 3D ambient drop shadow, and sleek glass vignette).
 * 3. Future-Proofing:
 *    Every current rendered asset and any asset uploaded dynamically via Admin CMS
 *    automatically routes through this engine.
 * 4. Hotel Room Section Synchronization:
 *    Applies synchronized luxury panoramic frames, ambient vignettes, and gold borders.
 */

(function(window) {
  'use strict';

  /**
   * HOTEL PREMIER - OFFICIAL BRAND PHOTOGRAPHY STYLE PROFILE
   * The canonical master definition for all food & beverage photography across Hotel Premier.
   */
  const HOTEL_PREMIER_STYLE_PROFILE = {
    version: 'hp-studio-v2.0',
    brandName: 'Hotel Premier - Pride Pure Veg AC Restaurant, Bhusawal',
    lighting: {
      colorTemperatureK: 3200,      // Warm authentic golden restaurant key light
      keyFillRatio: 2.2,            // Soft directional key with gentle champagne fill
      specularPreservation: true,   // Retains glistening highlights on gravies, paneer, and butter
      vignetteFalloff: 'soft-radial'
    },
    canvas: {
      standardWidth: 960,
      standardHeight: 720,
      aspectRatio: '4:3',
      safeSubjectMargin: 0.12,       // 12% golden breathing room around plate edges
      maxBleedRatio: 1.15
    },
    surfaces: {
      // 1. Midnight Slate & Imperial Gold: For rich north Indian curries, paneer, koftas, and biryanis
      slate_gold: {
        id: 'slate_gold',
        name: 'Midnight Slate & Imperial Gold Pedestal',
        baseGradient: ['#0A0E17', '#141D2D', '#1A263C', '#0E1420'],
        accentGlow: 'rgba(213, 183, 122, 0.35)',
        plateTone: 'rgba(213, 183, 122, 0.16)',
        rimTone: 'rgba(213, 183, 122, 0.32)',
        warmthBoost: 8,
        contrast: 1.08,
        saturation: 1.12
      },
      // 2. Warm Teak & Dark Walnut Wood: For tandoori rotis, naans, parathas, snacks, and pakodas
      teak_wood: {
        id: 'teak_wood',
        name: 'Warm Teak & Dark Walnut Table',
        baseGradient: ['#1C120C', '#2C1B10', '#3E2718', '#1A1009'],
        accentGlow: 'rgba(224, 159, 102, 0.30)',
        plateTone: 'rgba(210, 160, 110, 0.14)',
        rimTone: 'rgba(217, 119, 6, 0.28)',
        warmthBoost: 10,
        contrast: 1.07,
        saturation: 1.10
      },
      // 3. Italian Cream Marble & Brushed Brass: For milkshakes, mastani, desserts, and chilled beverages
      cream_marble: {
        id: 'cream_marble',
        name: 'Refined Italian Cream Marble & Brass',
        baseGradient: ['#161922', '#222938', '#2C3549', '#181C26'],
        accentGlow: 'rgba(245, 230, 202, 0.28)',
        plateTone: 'rgba(255, 248, 235, 0.15)',
        rimTone: 'rgba(229, 213, 182, 0.35)',
        warmthBoost: 5,
        contrast: 1.06,
        saturation: 1.08
      }
    },
    foodCategories: {
      curry: {
        name: 'Rich Curries & Dals',
        surfaceKey: 'slate_gold',
        preserveGravyColor: true,
        enhanceGarnishClarity: true,
        warmth: 8,
        sharpness: 0.30
      },
      bread: {
        name: 'Tandoor & Tawa Breads',
        surfaceKey: 'teak_wood',
        preserveBrowningTexture: true,
        noArtificialButter: true,
        warmth: 10,
        sharpness: 0.35
      },
      rice: {
        name: 'Biryani & Pulao',
        surfaceKey: 'slate_gold',
        preserveGrainSeparation: true,
        warmth: 7,
        sharpness: 0.28
      },
      snack: {
        name: 'Crispy Snacks & Chaat',
        surfaceKey: 'teak_wood',
        enhanceCrispDetails: true,
        warmth: 9,
        sharpness: 0.32
      },
      beverage: {
        name: 'Beverages & Mastani',
        surfaceKey: 'cream_marble',
        preserveGlassClarity: true,
        noArtificialToppings: true,
        warmth: 5,
        sharpness: 0.25
      },
      dessert: {
        name: 'Desserts & Ice Cream',
        surfaceKey: 'cream_marble',
        preserveScoopForm: true,
        warmth: 6,
        sharpness: 0.26
      }
    },
    prohibitions: [
      'DO NOT alter the real type of dish or invent imaginary foods',
      'DO NOT invent toppings, fake cherries, or sauces not present in the original',
      'DO NOT artificially turn plain rotis into butter naans',
      'DO NOT distort plates or stretch aspects to force-fit',
      'DO NOT leave jagged pixel borders or halo artifacts'
    ]
  };

  class HotelAssetPipeline {
    constructor() {
      this.styleProfile = HOTEL_PREMIER_STYLE_PROFILE;
      this.theme = {
        bgCharcoal: '#0D111A',
        bgMidnight: '#162035',
        goldChampagne: '#D5B77A',
        goldGlow: 'rgba(213, 183, 122, 0.35)',
        emeraldAccent: '#1C7669',
        emeraldGlow: 'rgba(28, 118, 105, 0.25)',
        shadowDeep: 'rgba(0, 0, 0, 0.65)'
      };

      this.IMAGE_TYPES = {
        FOOD: 'food',
        ROOM: 'room',
        CATEGORY: 'category',
        PROMO: 'promo',
        LOGO: 'logo'
      };

      this.processedCache = new Map();
      this.processingQueue = new Set();
    }

    /**
     * Determines whether an asset category undergoes background isolation
     */
    shouldIsolateBackground(category, options = {}) {
      if (options.forceIsolation === true) return true;
      // Preserve authentic hotel food photography & real room photography
      return false;
    }

    /**
     * Helper to load an image source into HTMLImageElement
     */
    loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        if (src.startsWith('http://') || src.startsWith('https://')) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => resolve(img);
        img.onerror = () => {
          if (img.crossOrigin) {
            const fallbackImg = new Image();
            fallbackImg.onload = () => resolve(fallbackImg);
            fallbackImg.onerror = (e) => reject(e);
            fallbackImg.src = src;
          } else {
            reject(new Error('Failed to load image: ' + src));
          }
        };
        img.src = src;
      });
    }

    /**
     * Client-Side Automated Dynamic Background Removal & Pedestal Mounting
     * Isolates foreground subject from original background and places it on the luxury pedestal.
     */
    async processIsolatedAsset(imageSource, options = {}) {
      const cacheKey = typeof imageSource === 'string' ? imageSource : (imageSource.src || imageSource.currentSrc);
      if (cacheKey && this.processedCache.has(cacheKey)) {
        return this.processedCache.get(cacheKey);
      }

      // Check sessionStorage for previous processing
      if (cacheKey && !cacheKey.startsWith('data:')) {
        try {
          const stored = sessionStorage.getItem('hp_proc_' + cacheKey);
          if (stored) {
            this.processedCache.set(cacheKey, stored);
            return stored;
          }
        } catch (e) {}
      }

      let img;
      try {
        if (typeof imageSource === 'string') {
          img = await this.loadImage(imageSource);
        } else if (imageSource.naturalWidth) {
          img = imageSource;
        } else {
          img = await this.loadImage(imageSource.src || imageSource.currentSrc);
        }
      } catch (err) {
        // Return original source if loading fails
        return typeof imageSource === 'string' ? imageSource : imageSource.src;
      }

      try {
        // 2. Offscreen Canvas for Subject Segmentation (Safely capped to max 1280px to prevent mobile RAM limits)
        let sw = img.naturalWidth || img.width || 400;
        let sh = img.naturalHeight || img.height || 300;
        const maxIsoDim = 1280;
        if (sw > maxIsoDim || sh > maxIsoDim) {
          if (sw > sh) {
            sh = Math.round((sh * maxIsoDim) / sw);
            sw = maxIsoDim;
          } else {
            sw = Math.round((sw * maxIsoDim) / sh);
            sh = maxIsoDim;
          }
        }

        const subCanvas = document.createElement('canvas');
        subCanvas.width = sw;
        subCanvas.height = sh;
        const subCtx = subCanvas.getContext('2d');
        if (!subCtx) return typeof imageSource === 'string' ? imageSource : imageSource.src;
        subCtx.drawImage(img, 0, 0, sw, sh);

        // 3. Pixel Background Detection & Isolation
        const imgData = subCtx.getImageData(0, 0, sw, sh);
        const data = imgData.data;

        // Sample corner and perimeter pixels to determine background tone
        const samplePoints = [
          [2, 2],
          [sw - 3, 2],
          [2, sh - 3],
          [sw - 3, sh - 3],
          [Math.floor(sw / 2), 2],
          [2, Math.floor(sh / 2)],
          [sw - 3, Math.floor(sh / 2)]
        ];

        let rTotal = 0, gTotal = 0, bTotal = 0, sampleCount = 0;
        for (const [x, y] of samplePoints) {
          const px = Math.min(sw - 1, Math.max(0, x));
          const py = Math.min(sh - 1, Math.max(0, y));
          const idx = (py * sw + px) * 4;
          rTotal += data[idx];
          gTotal += data[idx + 1];
          bTotal += data[idx + 2];
          sampleCount++;
        }

        const bgR = rTotal / sampleCount;
        const bgG = gTotal / sampleCount;
        const bgB = bTotal / sampleCount;

        // Background classification
        const isLightOrStudio = (bgR > 180 && bgG > 180 && bgB > 180);
        const isDarkOrBlack = (bgR < 35 && bgG < 35 && bgB < 35);
        const isNeutral = (Math.abs(bgR - bgG) < 26 && Math.abs(bgG - bgB) < 26);

        const tolerance = options.tolerance || 42;
        const feather = 26;
        let isolatedCount = 0;

        if (isLightOrStudio || isDarkOrBlack || isNeutral || options.forceIsolation) {
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const colorDist = Math.sqrt(
              Math.pow(r - bgR, 2) +
              Math.pow(g - bgG, 2) +
              Math.pow(b - bgB, 2)
            );

            if (colorDist < tolerance) {
              data[i + 3] = 0; // Cut out background to pure transparency
              isolatedCount++;
            } else if (colorDist < tolerance + feather) {
              const alphaRatio = (colorDist - tolerance) / feather;
              data[i + 3] = Math.round(data[i + 3] * alphaRatio);
            }
          }
          subCtx.putImageData(imgData, 0, 0);
        }

        // 4. Tight Subject Bounding Box Crop (avoids squashed aspect ratios)
        let finalCanvas = subCanvas;
        if (isolatedCount > (data.length / 4) * 0.08) {
          let minX = sw, minY = sh, maxX = 0, maxY = 0;
          let hasForeground = false;
          for (let y = 0; y < sh; y++) {
            for (let x = 0; x < sw; x++) {
              const a = data[(y * sw + x) * 4 + 3];
              if (a > 25) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                hasForeground = true;
              }
            }
          }

          if (hasForeground && maxX > minX && maxY > minY) {
            const pad = Math.max(12, Math.round(Math.min(sw, sh) * 0.03));
            minX = Math.max(0, minX - pad);
            minY = Math.max(0, minY - pad);
            maxX = Math.min(sw - 1, maxX + pad);
            maxY = Math.min(sh - 1, maxY + pad);
            const trimW = maxX - minX + 1;
            const trimH = maxY - minY + 1;

            const trimCanvas = document.createElement('canvas');
            trimCanvas.width = trimW;
            trimCanvas.height = trimH;
            const trimCtx = trimCanvas.getContext('2d');
            trimCtx.drawImage(subCanvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH);
            finalCanvas = trimCanvas;
          }
        }

        // 5. Output pure transparent PNG of isolated subject
        const resultDataUrl = finalCanvas.toDataURL('image/png');
        if (cacheKey) {
          this.processedCache.set(cacheKey, resultDataUrl);
          try {
            if (!cacheKey.startsWith('data:') && resultDataUrl.length < 500000) {
              sessionStorage.setItem('hp_proc_' + cacheKey, resultDataUrl);
            }
          } catch (e) {}
        }
        return resultDataUrl;
      } catch (canvasErr) {
        // In case of canvas taint (external cross-origin), return original source safely
        return typeof imageSource === 'string' ? imageSource : (imageSource.src || imageSource.currentSrc);
      }
    }

    /**
     * Renders the Unified Luxury Backdrop Pedestal
     */
    drawLuxuryBackdrop(ctx, width, height, options = {}) {
      // 1. Deep Luxury Charcoal to Midnight Indigo Gradient
      const baseGrad = ctx.createLinearGradient(0, 0, width, height);
      baseGrad.addColorStop(0, '#0D111A');
      baseGrad.addColorStop(0.45, '#162035');
      baseGrad.addColorStop(0.85, '#0F1E2A');
      baseGrad.addColorStop(1, '#0A0D14');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Center Radial Champagne Gold & Emerald Glow
      const glowGrad = ctx.createRadialGradient(
        width / 2, height * 0.58, 15,
        width / 2, height * 0.58, width * 0.62
      );
      glowGrad.addColorStop(0, 'rgba(213, 183, 122, 0.32)');
      glowGrad.addColorStop(0.4, 'rgba(28, 118, 105, 0.20)');
      glowGrad.addColorStop(1, 'rgba(13, 17, 26, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Reflective Oval Pedestal Stage Plate
      const plateCenterX = width / 2;
      const plateCenterY = height * 0.74;
      const plateRadiusX = width * 0.40;
      const plateRadiusY = height * 0.16;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(plateCenterX, plateCenterY, plateRadiusX, plateRadiusY, 0, 0, Math.PI * 2);
      const plateGrad = ctx.createRadialGradient(
        plateCenterX, plateCenterY, 5,
        plateCenterX, plateCenterY, plateRadiusX
      );
      plateGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      plateGrad.addColorStop(0.3, 'rgba(213, 183, 122, 0.15)');
      plateGrad.addColorStop(0.7, 'rgba(28, 118, 105, 0.08)');
      plateGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = plateGrad;
      ctx.fill();

      // Subtle gold rim around the pedestal plate
      ctx.strokeStyle = 'rgba(213, 183, 122, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    /**
     * Sleek Blurred Glass Vignette Overlay
     */
    drawGlassVignette(ctx, width, height) {
      // Vignette shadow along borders
      const vigGrad = ctx.createRadialGradient(
        width / 2, height / 2, width * 0.35,
        width / 2, height / 2, width * 0.72
      );
      vigGrad.addColorStop(0, 'transparent');
      vigGrad.addColorStop(1, 'rgba(10, 13, 20, 0.75)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);

      // Delicate Champagne Gold Border Frame
      ctx.save();
      ctx.strokeStyle = 'rgba(213, 183, 122, 0.30)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);
      ctx.restore();
    }

    /**
     * Automatically processes an <img> tag in real time
     * Safe mode: preserves authentic high-resolution food photography without destructive canvas cutout
     */
    async autoProcessImage(imgElement, type = 'food') {
      if (!imgElement || imgElement.dataset.hpProcessed === 'true') return;
      imgElement.dataset.hpProcessed = 'true';
      // Mark element as ready and styled
      imgElement.classList.add('hp-showcase-ready');
    }

    /**
     * Standardized HTML Markup Generator for Dish Media
     */
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
          <img 
            src="${dish.image}" 
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
          <img 
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
          <img 
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
          <img 
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
            <img 
              src="${imgUrl}" 
              alt="${room.name} Photo ${idx + 1}" 
              class="room-card-img hp-room-asset" 
              loading="lazy" 
              onerror="this.src='${room.image}'"
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
          <div class="modal-dish-photo-wrap no-photo" style="height: 180px;">
            <div class="dish-no-photo-placeholder">
              <div class="no-photo-icon">🌱</div>
              <div class="no-photo-crest" style="font-size: 1rem;">HOTEL PREMIER</div>
              <div class="no-photo-sub" style="font-size: 0.75rem;">PRIDE PURE VEG AC RESTAURANT</div>
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
          <img 
            src="${dish.image}" 
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

    /**
     * Auto Adaptive Food & Background Engine (v8.0)
     * 
     * Key Capabilities:
     * 1. Auto Background Replacement:
     *    - Automatically detects background (studio white, flat tabletop, checkered, neutral).
     *    - Mounts subjects cleanly onto Hotel Premier's signature Luxury Midnight & Champagne Pedestal
     *      (charcoal-to-midnight gradient, radial champagne spotlight, reflective gold-rimmed pedestal base).
     * 2. View & Aspect Ratio Auto-Adjuster (Cropped, Distorted, or Flat Shots):
     *    - Measures subject boundary & aspect ratio.
     *    - Smart Safe-Frame: Centers dish with safe margin padding (prevents plate clipping).
     *    - Dual-Layer Ambient Fill: If aspect ratio doesn't match standard 4:3 / 16:10, creates
     *      a soft-blurred ambient warmth underlayer matching the food's natural colors + dark theme veil,
     *      so there are zero awkward black/white gaps or stretched pixels.
     * 3. 4K Studio Gourmet Calibration:
     *    - Dynamic range levels expansion
     *    - +8K amber warmth calibration for rich, appetizing curries & breads
     *    - 3x3 Laplacian unsharp masking for 4K clarity
     *    - Seamless edge vignette blending with PWA dark theme
     */
    async processAdaptiveDishImage(imageSource, userOptions = {}) {
      const defaults = {
        backgroundMode: 'harmonize', // 'harmonize' (auto blend) | 'pedestal' (cutout onto stage) | 'original'
        framingMode: 'smart',        // 'smart' (centers & preserves proportions) | 'fill' (bleed)
        brightness: 1.04,
        contrast: 1.08,
        saturation: 1.12,
        warmth: 8,
        sharpness: 0.28,
        vignetteStrength: 0.40,
        maxDimension: 1200,
        quality: 0.90
      };
      const opt = Object.assign({}, defaults, userOptions);

      let img;
      try {
        if (typeof imageSource === 'string') {
          img = await this.loadImage(imageSource);
        } else if (imageSource && imageSource.naturalWidth) {
          img = imageSource;
        } else if (imageSource && (imageSource.src || imageSource.currentSrc)) {
          img = await this.loadImage(imageSource.src || imageSource.currentSrc);
        } else {
          throw new Error('Invalid image source');
        }
      } catch (err) {
        console.warn('Failed to load image for adaptive processing:', err);
        return typeof imageSource === 'string' ? imageSource : (imageSource.src || '');
      }

      const origW = img.naturalWidth || img.width || 800;
      const origH = img.naturalHeight || img.height || 600;

      // Standard presentation resolution (4:3 canvas for optimal PWA & card rendering)
      let targetW = 960;
      let targetH = 720;
      if (opt.targetWidth && opt.targetHeight) {
        targetW = opt.targetWidth;
        targetH = opt.targetHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return typeof imageSource === 'string' ? imageSource : imageSource.src;

      // 1. Edge & Perimeter Analysis
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = origW;
      sampleCanvas.height = origH;
      const sCtx = sampleCanvas.getContext('2d');
      sCtx.drawImage(img, 0, 0);

      let isLightOrStudio = false;
      let edgeR = 0, edgeG = 0, edgeB = 0;
      let minX = origW, minY = origH, maxX = 0, maxY = 0;
      let hasCropBox = false;

      try {
        const origData = sCtx.getImageData(0, 0, origW, origH);
        const data = origData.data;

        // Sample perimeter points (corners + midpoints)
        const samplePoints = [
          [2, 2], [origW - 3, 2], [2, origH - 3], [origW - 3, origH - 3],
          [Math.floor(origW / 2), 2], [2, Math.floor(origH / 2)],
          [origW - 3, Math.floor(origH / 2)], [Math.floor(origW / 2), origH - 3]
        ];
        let rSum = 0, gSum = 0, bSum = 0;
        for (const [x, y] of samplePoints) {
          const idx = (y * origW + x) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
        }
        edgeR = rSum / samplePoints.length;
        edgeG = gSum / samplePoints.length;
        edgeB = bSum / samplePoints.length;

        isLightOrStudio = (edgeR > 180 && edgeG > 180 && edgeB > 180);

        // Find bounding box of foreground food subject
        const step = Math.max(1, Math.floor(Math.min(origW, origH) / 100));
        for (let y = 0; y < origH; y += step) {
          for (let x = 0; x < origW; x += step) {
            const idx = (y * origW + x) * 4;
            const a = data[idx + 3];
            if (a < 30) continue; // transparent
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const dist = Math.sqrt((r - edgeR) ** 2 + (g - edgeG) ** 2 + (b - edgeB) ** 2);
            if (dist > 35) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              hasCropBox = true;
            }
          }
        }
      } catch (e) {
        // Fallback for tainted canvas
      }

      // Add 4% padding around detected foreground subject
      if (hasCropBox && maxX > minX && maxY > minY) {
        const padX = Math.round((maxX - minX) * 0.04);
        const padY = Math.round((maxY - minY) * 0.04);
        minX = Math.max(0, minX - padX);
        minY = Math.max(0, minY - padY);
        maxX = Math.min(origW, maxX + padX);
        maxY = Math.min(origH, maxY + padY);
      } else {
        minX = 0; minY = 0; maxX = origW; maxY = origH;
      }

      const subjectW = maxX - minX;
      const subjectH = maxY - minY;

      // 2. Render Backdrop according to mode
      const shouldCutout = (opt.backgroundMode === 'pedestal') ||
                           (opt.backgroundMode === 'harmonize' && isLightOrStudio);

      if (shouldCutout) {
        // Draw Luxury Stage Pedestal
        this.drawLuxuryBackdrop(ctx, targetW, targetH);

        // Calculate placement for the dish plate on the pedestal
        const safeW = targetW * 0.84;
        const safeH = targetH * 0.74;
        const scale = Math.min(safeW / subjectW, safeH / subjectH, 1.25);
        const renderW = subjectW * scale;
        const renderH = subjectH * scale;
        const renderX = (targetW - renderW) / 2;
        const renderY = (targetH * 0.72) - renderH;

        // Contact shadow underneath the food/plate
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(targetW / 2, renderY + renderH - 8, renderW * 0.44, Math.max(12, renderH * 0.12), 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.60)';
        ctx.filter = 'blur(10px)';
        ctx.fill();
        ctx.restore();

        // Cutout foreground image drawing with alpha feathering
        const cutCanvas = document.createElement('canvas');
        cutCanvas.width = subjectW;
        cutCanvas.height = subjectH;
        const cutCtx = cutCanvas.getContext('2d');
        cutCtx.drawImage(img, minX, minY, subjectW, subjectH, 0, 0, subjectW, subjectH);

        try {
          const cutData = cutCtx.getImageData(0, 0, subjectW, subjectH);
          const cData = cutData.data;
          const tol = 38;
          const feather = 26;
          for (let i = 0; i < cData.length; i += 4) {
            const r = cData[i], g = cData[i + 1], b = cData[i + 2];
            const dist = Math.sqrt((r - edgeR) ** 2 + (g - edgeG) ** 2 + (b - edgeB) ** 2);
            if (dist < tol) {
              cData[i + 3] = 0;
            } else if (dist < tol + feather) {
              cData[i + 3] = Math.round(cData[i + 3] * ((dist - tol) / feather));
            }
          }
          cutCtx.putImageData(cutData, 0, 0);
        } catch (e) {}

        ctx.drawImage(cutCanvas, renderX, renderY, renderW, renderH);

      } else {
        // Universal Harmonization (works for ANY photo, cropped, flat, distorted, or full-scene)
        // A. Base Luxury Gradient
        this.drawLuxuryBackdrop(ctx, targetW, targetH);

        if (opt.framingMode === 'smart') {
          // B. Ambient Blurred Underlayer: fills non-standard proportions with matching warm ambient light
          ctx.save();
          const blurScale = Math.max(targetW / origW, targetH / origH) * 1.05;
          const bW = origW * blurScale;
          const bH = origH * blurScale;
          const bX = (targetW - bW) / 2;
          const bY = (targetH - bH) / 2;

          ctx.filter = 'blur(28px) saturate(1.25) brightness(0.65)';
          ctx.drawImage(img, bX, bY, bW, bH);
          ctx.filter = 'none';

          // Dark luxury veil over the blurred backdrop
          ctx.fillStyle = 'rgba(10, 14, 22, 0.55)';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.restore();

          // C. Pristine Foreground Dish with aspect-ratio preservation
          const scale = Math.min(targetW / origW, targetH / origH, 1.0);
          const fW = origW * scale;
          const fH = origH * scale;
          const fX = (targetW - fW) / 2;
          const fY = (targetH - fH) / 2;

          // Subtle soft ambient drop shadow behind the dish
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
          ctx.shadowBlur = 24;
          ctx.shadowOffsetY = 8;
          ctx.drawImage(img, fX, fY, fW, fH);
          ctx.restore();

        } else {
          // Full bleed with smart center 38%
          const coverScale = Math.max(targetW / origW, targetH / origH);
          const cW = origW * coverScale;
          const cH = origH * coverScale;
          const cX = (targetW - cW) / 2;
          const cY = (targetH - cH) * 0.38;
          ctx.drawImage(img, cX, cY, cW, cH);
        }
      }

      // 3. Pixel-level 4K Tone Mapping & Gourmet Warmth Calibration
      try {
        const outData = ctx.getImageData(0, 0, targetW, targetH);
        const data = outData.data;
        const len = data.length;

        const brightFactor = opt.brightness;
        const contrastFactor = opt.contrast;
        const satFactor = opt.saturation || 1.12;
        const warmthAdd = opt.warmth;

        for (let i = 0; i < len; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // Brightness & Contrast
          r *= brightFactor;
          g *= brightFactor;
          b *= brightFactor;
          r = (r - 128) * contrastFactor + 128;
          g = (g - 128) * contrastFactor + 128;
          b = (b - 128) * contrastFactor + 128;

          // Gourmet Warmth (+8K amber glow)
          r += warmthAdd * 1.1;
          g += warmthAdd * 0.45;
          b -= warmthAdd * 0.4;

          // Vibrance
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray + (r - gray) * satFactor;
          g = gray + (g - gray) * satFactor;
          b = gray + (b - gray) * satFactor;

          data[i] = Math.min(255, Math.max(0, r));
          data[i + 1] = Math.min(255, Math.max(0, g));
          data[i + 2] = Math.min(255, Math.max(0, b));
        }
        ctx.putImageData(outData, 0, 0);

        // 4. Laplacian 4K Sharpness
        if (opt.sharpness > 0) {
          const sharpAmount = Math.min(0.5, opt.sharpness);
          const copy = ctx.getImageData(0, 0, targetW, targetH);
          const cPx = copy.data;
          const sharpData = ctx.createImageData(targetW, targetH);
          const sPx = sharpData.data;
          const w = targetW, h = targetH;

          for (let y = 1; y < h - 1; y++) {
            const row = y * w;
            const top = (y - 1) * w;
            const btm = (y + 1) * w;
            for (let x = 1; x < w - 1; x++) {
              const idx = (row + x) * 4;
              const idxT = (top + x) * 4;
              const idxB = (btm + x) * 4;
              const idxL = (row + (x - 1)) * 4;
              const idxR = (row + (x + 1)) * 4;
              for (let c = 0; c < 3; c++) {
                const centerVal = cPx[idx + c];
                const blurVal = (cPx[idxT + c] + cPx[idxB + c] + cPx[idxL + c] + cPx[idxR + c]) * 0.25;
                const edge = centerVal - blurVal;
                sPx[idx + c] = Math.min(255, Math.max(0, centerVal + edge * sharpAmount * 1.6));
              }
              sPx[idx + 3] = cPx[idx + 3];
            }
          }
          ctx.putImageData(sharpData, 0, 0);
        }
      } catch (pixelErr) {}

      // 5. Studio Perimeter Vignette & Warm Spotlight
      if (opt.vignetteStrength > 0) {
        const vStr = opt.vignetteStrength;
        const vig = ctx.createRadialGradient(
          targetW * 0.5, targetH * 0.50, Math.min(targetW, targetH) * 0.35,
          targetW * 0.5, targetH * 0.50, Math.max(targetW, targetH) * 0.72
        );
        vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vig.addColorStop(0.65, `rgba(13, 17, 26, ${vStr * 0.38})`);
        vig.addColorStop(1, `rgba(8, 12, 18, ${vStr * 0.85})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, targetW, targetH);

        // Warm champagne spotlight centered at dish position
        const spot = ctx.createRadialGradient(
          targetW * 0.5, targetH * 0.48, 10,
          targetW * 0.5, targetH * 0.48, Math.min(targetW, targetH) * 0.48
        );
        spot.addColorStop(0, 'rgba(255, 238, 204, 0.08)');
        spot.addColorStop(0.6, 'rgba(213, 183, 122, 0.03)');
        spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // 6. Subtle Luxury Champagne Border Accent
      ctx.save();
      ctx.strokeStyle = 'rgba(213, 183, 122, 0.30)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, targetW - 2, targetH - 2);
      ctx.restore();

      return canvas.toDataURL('image/jpeg', opt.quality);
    }

    /**
     * Auto 4K Food Enhancement & Background Homogenization Engine
     */
    async enhanceFoodTo4K(imageSource, userOptions = {}) {
      return this.processAdaptiveDishImage(imageSource, userOptions);
    }

    /**
     * Semantic Dish Classifier & Photo Quality Analyzer
     * Evaluates dish type, background suitability, lighting, contrast, and clarity.
     * Guaranteed 100% authentic: Does not alter true dish food contents.
     */
    async analyzeDishAndImageQuality(imgOrSrc, dishMeta = {}) {
      let img;
      try {
        if (typeof imgOrSrc === 'string') {
          img = await this.loadImage(imgOrSrc);
        } else if (imgOrSrc && imgOrSrc.naturalWidth) {
          img = imgOrSrc;
        } else {
          img = await this.loadImage(imgOrSrc.src || imgOrSrc.currentSrc);
        }
      } catch (err) {
        return {
          category: 'curry',
          qualityScore: 70,
          backgroundType: 'neutral',
          isCluttered: false,
          needsBackgroundReplacement: false,
          flags: ['LOAD_FALLBACK']
        };
      }

      const w = img.naturalWidth || img.width || 400;
      const h = img.naturalHeight || img.height || 300;

      // Classify category based on dish metadata (name, categoryId, description)
      const name = ((dishMeta.name || '') + ' ' + (dishMeta.categoryId || '') + ' ' + (dishMeta.description || '')).toLowerCase();
      let category = 'curry';
      if (/roti|naan|paratha|kulcha|chapati|bhakri|bread/.test(name)) {
        category = 'bread';
      } else if (/biryani|pulao|rice|jeera rice|khichdi|fried rice/.test(name)) {
        category = 'rice';
      } else if (/snack|pakoda|bhajiya|chaat|samosa|tikki|crispy|starter|soup|salad|papad/.test(name)) {
        category = 'snack';
      } else if (/shake|mastani|juice|lassi|coffee|tea|beverage|drink|mocktail|sharbat/.test(name)) {
        category = 'beverage';
      } else if (/ice cream|dessert|gulab jamun|kulfi|halwa|sweet|falooda/.test(name)) {
        category = 'dessert';
      }

      // Analyze canvas pixels for background quality, exposure, contrast, and clutter
      const sampleCanvas = document.createElement('canvas');
      const sw = Math.min(w, 200);
      const sh = Math.min(h, 150);
      sampleCanvas.width = sw;
      sampleCanvas.height = sh;
      const ctx = sampleCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0, sw, sh);

      let isCluttered = false;
      let backgroundType = 'neutral';
      let qualityScore = 85;
      const flags = [];

      try {
        const imgData = ctx.getImageData(0, 0, sw, sh);
        const data = imgData.data;

        // Sample perimeter pixels
        const borderPixels = [];
        for (let x = 0; x < sw; x += 4) {
          borderPixels.push([x, 1], [x, sh - 2]);
        }
        for (let y = 0; y < sh; y += 4) {
          borderPixels.push([1, y], [sw - 2, y]);
        }

        let rSum = 0, gSum = 0, bSum = 0;
        const variances = [];
        for (const [bx, by] of borderPixels) {
          const idx = (by * sw + bx) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
        }
        const bLen = borderPixels.length || 1;
        const avgR = rSum / bLen;
        const avgG = gSum / bLen;
        const avgB = bLen ? bSum / bLen : 0;

        // Variance / Clutter score along border
        let varSum = 0;
        for (const [bx, by] of borderPixels) {
          const idx = (by * sw + bx) * 4;
          const diff = Math.abs(data[idx] - avgR) + Math.abs(data[idx + 1] - avgG) + Math.abs(data[idx + 2] - avgB);
          varSum += diff;
        }
        const borderVariance = varSum / bLen;

        if (borderVariance > 48) {
          isCluttered = true;
          flags.push('CLUTTERED_BACKGROUND');
          qualityScore -= 12;
        }

        if (avgR > 185 && avgG > 185 && avgB > 185) {
          backgroundType = 'light_studio';
        } else if (avgR < 40 && avgG < 40 && avgB < 40) {
          backgroundType = 'dark_studio';
        } else if (borderVariance > 45) {
          backgroundType = 'busy_environment';
        } else {
          backgroundType = 'neutral';
        }

        // Center brightness vs edge (vignette / center dish presence)
        const centerIdx = (Math.floor(sh / 2) * sw + Math.floor(sw / 2)) * 4;
        const centerBright = (data[centerIdx] + data[centerIdx + 1] + data[centerIdx + 2]) / 3;
        const edgeBright = (avgR + avgG + avgB) / 3;

        if (edgeBright < 30 && centerBright < 40) {
          flags.push('UNDEREXPOSED');
          qualityScore -= 15;
        } else if (edgeBright > 230 && centerBright > 230) {
          flags.push('OVEREXPOSED');
          qualityScore -= 10;
        }

        // Resolution score
        if (w < 400 || h < 300) {
          flags.push('LOW_RESOLUTION');
          qualityScore -= 18;
        } else if (w >= 1000 && h >= 750) {
          qualityScore += 5;
        }
      } catch (e) {
        flags.push('CANVAS_ANALYSIS_FAILED');
      }

      qualityScore = Math.max(20, Math.min(99, qualityScore));

      const needsBackgroundReplacement = isCluttered || backgroundType === 'light_studio' || backgroundType === 'busy_environment';

      return {
        category,
        qualityScore,
        backgroundType,
        isCluttered,
        needsBackgroundReplacement,
        flags
      };
    }

    /**
     * Surfaces Renderer for Hotel Premier Brand Aesthetics
     * Supported surfaces: 'slate_gold', 'teak_wood', 'cream_marble'
     */
    drawSurfaceBackdrop(ctx, width, height, surfaceKey = 'slate_gold') {
      if (surfaceKey === 'teak_wood') {
        // Warm Teak & Walnut Wood Surface
        const woodGrad = ctx.createLinearGradient(0, 0, width, height);
        woodGrad.addColorStop(0, '#1E150F');
        woodGrad.addColorStop(0.35, '#2A1D13');
        woodGrad.addColorStop(0.70, '#362417');
        woodGrad.addColorStop(1, '#1A120D');
        ctx.fillStyle = woodGrad;
        ctx.fillRect(0, 0, width, height);

        // Fine Wood Grain Texture Lines
        ctx.save();
        ctx.strokeStyle = 'rgba(213, 183, 122, 0.04)';
        ctx.lineWidth = 1;
        for (let y = 10; y < height; y += 14) {
          ctx.beginPath();
          ctx.moveTo(0, y + (Math.sin(y * 0.1) * 3));
          ctx.bezierCurveTo(
            width * 0.3, y + (Math.cos(y * 0.05) * 6),
            width * 0.7, y - (Math.sin(y * 0.05) * 6),
            width, y + (Math.cos(y * 0.1) * 3)
          );
          ctx.stroke();
        }
        ctx.restore();

        // Warm Amber Lighting Bloom
        const bloom = ctx.createRadialGradient(
          width * 0.5, height * 0.45, 10,
          width * 0.5, height * 0.45, width * 0.65
        );
        bloom.addColorStop(0, 'rgba(213, 183, 122, 0.22)');
        bloom.addColorStop(0.5, 'rgba(180, 110, 40, 0.12)');
        bloom.addColorStop(1, 'rgba(15, 10, 7, 0)');
        ctx.fillStyle = bloom;
        ctx.fillRect(0, 0, width, height);

      } else if (surfaceKey === 'cream_marble') {
        // Refined Italian Cream Marble with Brass Trim
        const marbleGrad = ctx.createLinearGradient(0, 0, width, height);
        marbleGrad.addColorStop(0, '#151A24');
        marbleGrad.addColorStop(0.4, '#1C2330');
        marbleGrad.addColorStop(0.8, '#18202C');
        marbleGrad.addColorStop(1, '#10141D');
        ctx.fillStyle = marbleGrad;
        ctx.fillRect(0, 0, width, height);

        // Delicate Marble Veining
        ctx.save();
        ctx.strokeStyle = 'rgba(213, 183, 122, 0.06)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(width * 0.1, 0);
        ctx.bezierCurveTo(width * 0.35, height * 0.3, width * 0.25, height * 0.7, width * 0.6, height);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width * 0.75, 0);
        ctx.bezierCurveTo(width * 0.55, height * 0.4, width * 0.8, height * 0.65, width * 0.9, height);
        ctx.stroke();
        ctx.restore();

        // Cool-Warm Studio Light Blend
        const glow = ctx.createRadialGradient(
          width * 0.5, height * 0.48, 15,
          width * 0.5, height * 0.48, width * 0.60
        );
        glow.addColorStop(0, 'rgba(240, 230, 210, 0.18)');
        glow.addColorStop(0.4, 'rgba(213, 183, 122, 0.14)');
        glow.addColorStop(1, 'rgba(16, 20, 29, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

      } else {
        // Default: Midnight Slate & Imperial Gold (Brand Signature)
        this.drawLuxuryBackdrop(ctx, width, height);
      }
    }

    /**
     * Natural 3D Contact Shadow Generator
     * Renders a soft double-ellipse shadow grounding the plate / vessel firmly on surface.
     */
    drawRealisticContactShadow(ctx, cx, cy, rx, ry) {
      ctx.save();

      // Deep direct contact shadow (dense, sharp occlusion)
      ctx.beginPath();
      ctx.ellipse(cx, cy + (ry * 0.15), rx * 0.82, ry * 0.5, 0, 0, Math.PI * 2);
      const innerShadow = ctx.createRadialGradient(cx, cy + (ry * 0.15), 2, cx, cy + (ry * 0.15), rx * 0.82);
      innerShadow.addColorStop(0, 'rgba(0, 0, 0, 0.82)');
      innerShadow.addColorStop(0.65, 'rgba(0, 0, 0, 0.45)');
      innerShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = innerShadow;
      ctx.fill();

      // Soft ambient diffuse falloff (light wrap)
      ctx.beginPath();
      ctx.ellipse(cx, cy + (ry * 0.35), rx * 1.18, ry * 0.85, 0, 0, Math.PI * 2);
      const outerShadow = ctx.createRadialGradient(cx, cy + (ry * 0.35), 5, cx, cy + (ry * 0.35), rx * 1.18);
      outerShadow.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      outerShadow.addColorStop(0.5, 'rgba(0, 0, 0, 0.20)');
      outerShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerShadow;
      ctx.fill();

      ctx.restore();
    }

    /**
     * Automatic Professional Food Photography Studio Pipeline
     * The master entry point for all uploads:
     * 1. Analyzes dish & original quality
     * 2. Selects category-specific brand surface
     * 3. Isolates dish or seamlessly harmonizes background
     * 4. Casts natural 3D contact shadows
     * 5. Calibrates gourmet warmth (3200K) and 4K clarity
     * 6. Returns { enhancedDataUrl, qualityScore, category, status, flags }
     */
    async processAutomaticStudioEnhancement(imageSource, dishMeta = {}, options = {}) {
      options = { backgroundMode: 'natural', ...options };
      let img;
      try {
        if (typeof imageSource === 'string') {
          img = await this.loadImage(imageSource);
        } else if (imageSource && imageSource.naturalWidth) {
          img = imageSource;
        } else if (imageSource && (imageSource.src || imageSource.currentSrc)) {
          img = await this.loadImage(imageSource.src || imageSource.currentSrc);
        } else {
          throw new Error('Invalid image source');
        }
      } catch (err) {
        throw new Error('Unable to load this photo. Upload a local JPG, PNG or WebP file, or check the image URL.');
      }

      // 1. Analyze Dish & Photo Quality
      const analysis = await this.analyzeDishAndImageQuality(img, dishMeta);
      const foodCategories = this.styleProfile.foodCategories || {};
      const catConfig = foodCategories[analysis.category] || foodCategories.curry || {};

      // Keeping the original is the safest default for real restaurant photography.
      // Canvas cannot reliably isolate every plate, garnish, reflection, and table edge.
      if (options.backgroundMode === 'original') {
        return {
          enhancedDataUrl: typeof imageSource === 'string' ? imageSource : (imageSource.src || imageSource.currentSrc || ''),
          qualityScore: analysis.qualityScore,
          category: analysis.category,
          surfaceKey: null,
          status: 'original',
          flags: analysis.flags
        };
      }
      const savedSettings = await window.HOTEL_STORAGE?.getAISettings?.() || {};
      const requestedSurface = options.surfaceKey || savedSettings.defaultStyle || catConfig.surfaceKey;
      const surfaceKey = ['slate_gold', 'teak_wood', 'cream_marble'].includes(requestedSurface)
        ? requestedSurface : 'slate_gold';

      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;
      const naturalMode = options.backgroundMode === 'natural';
      // V3 natural polish keeps camera framing intact. This is intentionally
      // separate from the stylised 4:3 studio and pedestal treatments.
      const naturalScale = Math.min(1, 1440 / Math.max(origW, origH));
      const targetW = naturalMode
        ? Math.max(1, Math.round(origW * naturalScale))
        : (options.targetWidth || 960);
      const targetH = naturalMode
        ? Math.max(1, Math.round(origH * naturalScale))
        : (options.targetHeight || 720);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 2. Render the untouched composition for Natural Polish, otherwise use
      // the selected studio surface.
      if (naturalMode) {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      } else {
        this.drawSurfaceBackdrop(ctx, targetW, targetH, surfaceKey);
      }

      // Determine background replacement / isolation
      const shouldCutout = options.backgroundMode === 'pedestal';

      if (naturalMode) {
        // The original composition is already drawn above; only apply the
        // restrained photo correction below.
      } else if (shouldCutout) {
        // Foreground Subject Extraction
        const isolatedDataUrl = await this.processIsolatedAsset(img, { forceIsolation: true });
        const isolatedImg = await this.loadImage(isolatedDataUrl);

        const isoW = isolatedImg.naturalWidth || isolatedImg.width;
        const isoH = isolatedImg.naturalHeight || isolatedImg.height;

        // Position dish safely with 12% golden breathing margin
        const maxPlateW = targetW * 0.78;
        const maxPlateH = targetH * 0.68;
        const scale = Math.min(maxPlateW / isoW, maxPlateH / isoH, 1.25);
        const renderW = isoW * scale;
        const renderH = isoH * scale;
        const renderX = (targetW - renderW) / 2;
        const renderY = (targetH * 0.74) - renderH;

        // Realistic 3D Contact Shadow
        this.drawRealisticContactShadow(
          ctx,
          targetW / 2,
          renderY + renderH - (renderH * 0.04),
          renderW * 0.44,
          Math.max(14, renderH * 0.14)
        );

        // Draw Pristine Isolated Dish
        ctx.drawImage(isolatedImg, renderX, renderY, renderW, renderH);

      } else {
        // Universal Ambient Harmonization (Ambient warm fill + Aspect Safe Frame)
        // A. Ambient fill underlayer
        ctx.save();
        const blurScale = Math.max(targetW / origW, targetH / origH) * 1.05;
        const bW = origW * blurScale;
        const bH = origH * blurScale;
        const bX = (targetW - bW) / 2;
        const bY = (targetH - bH) / 2;
        ctx.filter = 'blur(28px) saturate(1.22) brightness(0.60)';
        ctx.drawImage(img, bX, bY, bW, bH);
        ctx.filter = 'none';

        // Dark luxury veil
        ctx.fillStyle = 'rgba(10, 14, 22, 0.50)';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.restore();

        // B. Authentic Foreground Dish safely centered
        const safeScale = options.framingMode === 'fill'
          ? Math.max(targetW / origW, targetH / origH)
          : Math.min((targetW * 0.90) / origW, (targetH * 0.88) / origH, 1.0);
        const fW = origW * safeScale;
        const fH = origH * safeScale;
        const fX = (targetW - fW) / 2;
        const fY = (targetH - fH) / 2;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 8;
        ctx.drawImage(img, fX, fY, fW, fH);
        ctx.restore();
      }

      // 3. Pixel-Level Gourmet 3200K Color Calibration & 4K Unsharp Clarity
      try {
        const outData = ctx.getImageData(0, 0, targetW, targetH);
        const data = outData.data;
        const len = data.length;

        const warmthAdd = naturalMode
          ? Math.min(options.warmth !== undefined ? options.warmth : 2, 4)
          : (options.warmth !== undefined ? options.warmth : (catConfig.warmth || 8));
        const sharpAmount = naturalMode
          ? Math.min(options.sharpness !== undefined ? options.sharpness : 0.10, 0.16)
          : (options.sharpness !== undefined ? options.sharpness : (catConfig.sharpness || 0.28));
        const contrastFactor = naturalMode
          ? Math.min(options.contrast !== undefined ? options.contrast : 1.02, 1.05)
          : (options.contrast !== undefined ? options.contrast : 1.08);
        const brightFactor = naturalMode ? 1.01 : (options.brightness !== undefined ? options.brightness : 1.04);
        const satFactor = naturalMode ? 1.04 : (options.saturation !== undefined ? options.saturation : 1.12);

        for (let i = 0; i < len; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // Tone adjustment
          r *= brightFactor;
          g *= brightFactor;
          b *= brightFactor;
          r = (r - 128) * contrastFactor + 128;
          g = (g - 128) * contrastFactor + 128;
          b = (b - 128) * contrastFactor + 128;

          // Gourmet 3200K Warmth (+ amber glow)
          r += warmthAdd * 1.15;
          g += warmthAdd * 0.45;
          b -= warmthAdd * 0.40;

          // Vibrance
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray + (r - gray) * satFactor;
          g = gray + (g - gray) * satFactor;
          b = gray + (b - gray) * satFactor;

          data[i] = Math.min(255, Math.max(0, r));
          data[i + 1] = Math.min(255, Math.max(0, g));
          data[i + 2] = Math.min(255, Math.max(0, b));
        }
        ctx.putImageData(outData, 0, 0);

        // Laplacian 4K Sharpness Masking
        if (sharpAmount > 0) {
          const copy = ctx.getImageData(0, 0, targetW, targetH);
          const cPx = copy.data;
          const sharpData = ctx.createImageData(targetW, targetH);
          const sPx = sharpData.data;
          sPx.set(cPx); // Preserve border pixels instead of exporting a black rim.
          const w = targetW, h = targetH;

          for (let y = 1; y < h - 1; y++) {
            const row = y * w;
            const top = (y - 1) * w;
            const btm = (y + 1) * w;
            for (let x = 1; x < w - 1; x++) {
              const idx = (row + x) * 4;
              const idxT = (top + x) * 4;
              const idxB = (btm + x) * 4;
              const idxL = (row + (x - 1)) * 4;
              const idxR = (row + (x + 1)) * 4;
              for (let c = 0; c < 3; c++) {
                const centerVal = cPx[idx + c];
                const blurVal = (cPx[idxT + c] + cPx[idxB + c] + cPx[idxL + c] + cPx[idxR + c]) * 0.25;
                const edge = centerVal - blurVal;
                sPx[idx + c] = Math.min(255, Math.max(0, centerVal + edge * sharpAmount * 1.6));
              }
              sPx[idx + 3] = cPx[idx + 3];
            }
          }
          ctx.putImageData(sharpData, 0, 0);
        }
      } catch (e) {}

      // 4. Subtle Studio Spotlight & Champagne Vignette
      const vStr = naturalMode ? 0 : (options.vignetteStrength !== undefined ? options.vignetteStrength : 0.38);
      if (vStr > 0) {
        const vig = ctx.createRadialGradient(
          targetW * 0.5, targetH * 0.50, Math.min(targetW, targetH) * 0.35,
          targetW * 0.5, targetH * 0.50, Math.max(targetW, targetH) * 0.72
        );
        vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vig.addColorStop(0.65, `rgba(13, 17, 26, ${vStr * 0.38})`);
        vig.addColorStop(1, `rgba(8, 12, 18, ${vStr * 0.85})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, targetW, targetH);

        const spot = ctx.createRadialGradient(
          targetW * 0.5, targetH * 0.48, 10,
          targetW * 0.5, targetH * 0.48, Math.min(targetW, targetH) * 0.48
        );
        spot.addColorStop(0, 'rgba(255, 238, 204, 0.08)');
        spot.addColorStop(0.6, 'rgba(213, 183, 122, 0.03)');
        spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // 5. Delicate Gold Trim Rim belongs only to the stylised studio modes.
      if (!naturalMode) {
        ctx.save();
        ctx.strokeStyle = 'rgba(213, 183, 122, 0.30)';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, targetW - 2, targetH - 2);
        ctx.restore();
      }

      const quality = options.quality || 0.88;
      const enhancedDataUrl = canvas.toDataURL('image/jpeg', quality);

      return {
        enhancedDataUrl,
        qualityScore: analysis.qualityScore,
        category: analysis.category,
        surfaceKey,
        status: naturalMode ? 'natural' : 'enhanced',
        flags: analysis.flags
      };
    }

    /**
     * Cloud generation is intentionally disabled under the zero-paid-usage policy.
     * Keep the compatibility method so old callers fail clearly without sending photos or keys.
     */
    async callCloudAIEnhancer(base64Image, dishMeta = {}, apiKey = '') {
      throw new Error('Cloud image generation is disabled: this app uses local, no-API-fee photo processing.');
    }

    /**
     * Pipeline hook for Admin CMS file upload
     * Automatically runs raw uploads through the Studio Photography Engine
     */
    async processUploadFile(file, category = this.IMAGE_TYPES.FOOD, options = {}) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
          try {
            const rawDataUrl = e.target.result;
            const res = await this.processAutomaticStudioEnhancement(rawDataUrl, { categoryId: category }, options);
            resolve(res.enhancedDataUrl || rawDataUrl);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = (err) => reject(err);
      });
    }

    /**
     * High-fidelity photo compression for authentic environment photography
     */
    compressPhoto(dataUrl, options = {}) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = options.maxDimension || 1280;
          let w = img.width;
          let h = img.height;

          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);

          resolve(canvas.toDataURL('image/jpeg', options.quality || 0.85));
        };
        img.onerror = (err) => reject(err);
        img.src = dataUrl;
      });
    }
  }

  // Instantiate and expose global singleton
  window.HotelAssetPipeline = HotelAssetPipeline;
  window.AssetPipeline = new HotelAssetPipeline();

})(window);
