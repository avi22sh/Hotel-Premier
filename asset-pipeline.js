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

  class HotelAssetPipeline {
    constructor() {
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
      if (options.preserveEnvironment === true) return false;
      if (category === this.IMAGE_TYPES.ROOM) return false;
      return true; // Food, categories, products, and dishes are isolated
    }

    /**
     * Helper to load an image source into HTMLImageElement
     */
    loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
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

      const canvas = document.createElement('canvas');
      const width = options.width || 640;
      const height = options.height || 480;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Draw Unified Luxury Backdrop Pedestal
      this.drawLuxuryBackdrop(ctx, width, height, options);

      try {
        // 2. Offscreen Canvas for Subject Segmentation
        const subCanvas = document.createElement('canvas');
        subCanvas.width = img.naturalWidth || img.width;
        subCanvas.height = img.naturalHeight || img.height;
        const subCtx = subCanvas.getContext('2d');
        subCtx.drawImage(img, 0, 0);

        // 3. Pixel Background Detection & Isolation
        const imgData = subCtx.getImageData(0, 0, subCanvas.width, subCanvas.height);
        const data = imgData.data;

        // Sample corner and perimeter pixels to determine background tone
        const sw = subCanvas.width;
        const sh = subCanvas.height;
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
          const idx = (y * sw + x) * 4;
          rTotal += data[idx];
          gTotal += data[idx + 1];
          bTotal += data[idx + 2];
          sampleCount++;
        }

        const bgR = rTotal / sampleCount;
        const bgG = gTotal / sampleCount;
        const bgB = bTotal / sampleCount;

        // Background classification
        const isLightOrStudio = (bgR > 185 && bgG > 185 && bgB > 185);
        const isNeutral = (Math.abs(bgR - bgG) < 22 && Math.abs(bgG - bgB) < 22);

        const tolerance = options.tolerance || 42;
        const feather = 28;

        if (isLightOrStudio || isNeutral || options.forceIsolation) {
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
              data[i + 3] = 0; // Cut out background
            } else if (colorDist < tolerance + feather) {
              const alphaRatio = (colorDist - tolerance) / feather;
              data[i + 3] = Math.round(data[i + 3] * alphaRatio);
            }
          }
          subCtx.putImageData(imgData, 0, 0);
        }

        // 4. Calculate Fitted Subject Centering on Pedestal
        const maxDrawW = width * 0.84;
        const maxDrawH = height * 0.82;
        const scale = Math.min(maxDrawW / subCanvas.width, maxDrawH / subCanvas.height);
        const drawW = subCanvas.width * scale;
        const drawH = subCanvas.height * scale;
        const drawX = (width - drawW) / 2;
        const drawY = (height - drawH) / 2 - 8; // Float slightly above center

        // 5. Render 3D Soft Ambient Drop Shadow onto Backdrop
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 32;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 18;
        ctx.drawImage(subCanvas, drawX, drawY, drawW, drawH);
        ctx.restore();

        // 6. Draw Clean Crisp Foreground Subject
        ctx.drawImage(subCanvas, drawX, drawY, drawW, drawH);

        // 7. Add Sleek Blurred Glass Vignette & Champagne Gold Framing
        this.drawGlassVignette(ctx, width, height);

        const resultDataUrl = canvas.toDataURL('image/jpeg', options.quality || 0.90);
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
        // In case of canvas taint (external cross-origin), draw image directly inside the luxury backdrop
        ctx.drawImage(img, (width - (width * 0.9)) / 2, (height - (height * 0.9)) / 2, width * 0.9, height * 0.9);
        this.drawGlassVignette(ctx, width, height);
        return canvas.toDataURL('image/jpeg', 0.85);
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
     * Called from onload="window.AssetPipeline && window.AssetPipeline.autoProcessImage(this, 'food')"
     */
    async autoProcessImage(imgElement, type = 'food') {
      if (!imgElement || imgElement.dataset.hpProcessed === 'true') return;
      if (this.processingQueue.has(imgElement)) return;

      this.processingQueue.add(imgElement);

      try {
        const originalSrc = imgElement.src || imgElement.currentSrc;
        if (!originalSrc || originalSrc.startsWith('data:image/svg')) {
          this.processingQueue.delete(imgElement);
          return;
        }

        // Apply background isolation and luxury pedestal
        const processedUrl = await this.processIsolatedAsset(imgElement, {
          tolerance: 44,
          forceIsolation: type === 'food'
        });

        if (processedUrl && processedUrl !== originalSrc) {
          imgElement.dataset.hpProcessed = 'true';
          imgElement.classList.add('hp-isolated-processed');
          imgElement.src = processedUrl;
        }
      } catch (err) {
        console.warn('[AssetPipeline] Auto-process fallback applied:', err);
      } finally {
        this.processingQueue.delete(imgElement);
      }
    }

    /**
     * Standardized HTML Markup Generator for Dish Media
     */
    renderDishMedia(dish, options = {}) {
      const hasPhoto = dish.image && dish.image.trim() !== '';
      const badgesHtml = options.badgesHtml || '';
      const soldOutHtml = dish.isSoldOut ? `<div class="sold-out-overlay">${options.soldOutText || 'SOLD OUT'}</div>` : '';

      if (!hasPhoto) {
        return `
          <div class="dish-media hp-asset-pedestal no-photo" id="dish-media-${dish.id}">
            <div class="hp-pedestal-glow"></div>
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
        <div class="dish-media hp-asset-pedestal" id="dish-media-${dish.id}">
          <div class="hp-pedestal-glow" aria-hidden="true"></div>
          <div class="hp-pedestal-plate" aria-hidden="true"></div>
          <img 
            src="${dish.image}" 
            alt="${dish.name}" 
            class="dish-img hp-isolated-asset" 
            id="dish-img-el-${dish.id}" 
            loading="lazy" 
            crossorigin="anonymous"
            onload="window.AssetPipeline && window.AssetPipeline.autoProcessImage(this, 'food')"
            onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'"
          >
          <div class="hp-glass-vignette" aria-hidden="true"></div>
          ${soldOutHtml}
          <div class="dish-badges">${badgesHtml}</div>
          <div class="dish-veg-symbol" title="100% Pure Vegetarian"><div class="dish-veg-dot"></div></div>
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
    renderDetailMedia(dish) {
      const hasPhoto = dish.image && dish.image.trim() !== '';
      const soldOutHtml = dish.isSoldOut ? `<div class="sold-out-overlay">SOLD OUT</div>` : '';

      if (!hasPhoto) {
        return `
          <div class="dish-detail-media hp-asset-pedestal no-photo">
            <div class="hp-pedestal-glow"></div>
            <div class="dish-no-photo-placeholder" id="detail-modal-img">
              <div class="no-photo-icon">🌱</div>
              <div class="no-photo-crest" style="font-size: 1.1rem;">HOTEL PREMIER</div>
              <div class="no-photo-sub" style="font-size: 0.85rem;">Pride Pure Veg AC Restaurant</div>
            </div>
            <div class="dish-veg-symbol"><div class="dish-veg-dot"></div></div>
            ${soldOutHtml}
          </div>
        `;
      }

      return `
        <div class="dish-detail-media hp-asset-pedestal">
          <div class="hp-pedestal-glow" aria-hidden="true"></div>
          <div class="hp-pedestal-plate" aria-hidden="true"></div>
          <img 
            src="${dish.image}" 
            alt="${dish.name}" 
            id="detail-modal-img" 
            class="hp-detail-img hp-isolated-asset" 
            crossorigin="anonymous"
            onload="window.AssetPipeline && window.AssetPipeline.autoProcessImage(this, 'food')"
            onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'"
          >
          <div class="hp-glass-vignette" aria-hidden="true"></div>
          <div class="dish-veg-symbol"><div class="dish-veg-dot"></div></div>
          ${soldOutHtml}
          <button onclick="window.admin ? window.admin.openImageModal('${dish.id}') : null" class="btn-detail-photo-action">
            📷 Change / Upload Photo
          </button>
        </div>
      `;
    }

    /**
     * Pipeline hook for Admin CMS file upload
     * Compresses, isolates background, and returns optimized dataURL
     */
    async processUploadFile(file, category = this.IMAGE_TYPES.FOOD, options = {}) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
          try {
            const rawDataUrl = e.target.result;

            if (this.shouldIsolateBackground(category, options)) {
              const processed = await this.processIsolatedAsset(rawDataUrl, {
                ...options,
                forceIsolation: true
              });
              resolve(processed);
            } else {
              const compressed = await this.compressPhoto(rawDataUrl, options);
              resolve(compressed);
            }
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
