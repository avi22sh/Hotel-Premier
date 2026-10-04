/**
 * HOTEL PREMIER - INTELLIGENT ASSET PIPELINE & IMAGE MANAGEMENT ENGINE
 * 
 * Category-Aware Image Processing:
 * - Authentic Photography (Rooms, Exterior, Restaurant Ambiance):
 *   Preserves natural environment, applies high-fidelity framing & aspect ratio handling.
 * - Isolated Assets & Promotional Items:
 *   Smart canvas-based background isolation, alpha feathering, uniform luxury backdrop
 *   pedestal gradient (#191D24 / #222B40 / #D5B77A glow), and 3D floating ambient drop shadow.
 * - Future-proof integration for Admin CMS uploads and dynamic runtime rendering.
 */

(function(window) {
  'use strict';

  class HotelAssetPipeline {
    constructor() {
      this.theme = {
        bgDeep: '#191D24',
        bgIndigo: '#222B40',
        goldAccent: '#D5B77A',
        goldGlow: 'rgba(213, 183, 122, 0.28)',
        shadowDark: 'rgba(0, 0, 0, 0.45)',
        emerald: '#1C7669'
      };

      // Image category classifications
      this.IMAGE_TYPES = {
        AUTHENTIC_ROOM: 'room',
        AUTHENTIC_EXTERIOR: 'exterior',
        AUTHENTIC_RESTAURANT: 'restaurant',
        AUTHENTIC_FOOD: 'food',
        ISOLATED_PRODUCT: 'isolated_product',
        BRANDING_LOGO: 'logo',
        PROMO_BANNER: 'promo'
      };

      this.processedCache = new Map();
    }

    /**
     * Determines whether an asset is an isolated subject candidate for background masking
     * Rooms, hotel architecture, and landscape photos MUST NOT have backgrounds removed!
     */
    shouldIsolateBackground(category, options = {}) {
      if (options.forceIsolation === true) return true;
      if (options.preserveEnvironment === true) return false;

      // Authentic photography preserves full environment
      if (
        category === this.IMAGE_TYPES.AUTHENTIC_ROOM ||
        category === this.IMAGE_TYPES.AUTHENTIC_EXTERIOR ||
        category === this.IMAGE_TYPES.AUTHENTIC_RESTAURANT
      ) {
        return false;
      }

      // Explicitly marked isolated items
      return category === this.IMAGE_TYPES.ISOLATED_PRODUCT;
    }

    /**
     * Loads an image URL into an HTMLImageElement
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
     * Client-side canvas preprocessing:
     * Analyzes image edges to detect plain/light/checkerboard backgrounds,
     * isolates foreground subject, creates smooth alpha feathering,
     * and mounts the subject onto a unified luxury gradient pedestal with ambient drop shadow.
     */
    async processIsolatedAsset(imageSource, options = {}) {
      const cacheKey = typeof imageSource === 'string' ? imageSource : imageSource.src;
      if (cacheKey && this.processedCache.has(cacheKey)) {
        return this.processedCache.get(cacheKey);
      }

      let img;
      if (typeof imageSource === 'string') {
        img = await this.loadImage(imageSource);
      } else {
        img = imageSource;
      }

      const canvas = document.createElement('canvas');
      const width = options.width || 600;
      const height = options.height || 600;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Draw unified luxury backdrop pedestal
      this.drawLuxuryBackdrop(ctx, width, height, options);

      // 2. Offscreen canvas for subject extraction
      const subjectCanvas = document.createElement('canvas');
      subjectCanvas.width = img.width;
      subjectCanvas.height = img.height;
      const subCtx = subjectCanvas.getContext('2d');
      subCtx.drawImage(img, 0, 0);

      // Perform intelligent edge-sampling background segmentation
      const imgData = subCtx.getImageData(0, 0, img.width, img.height);
      const data = imgData.data;

      // Sample border color (top-left, top-right, bottom-left, bottom-right corners)
      const cornerSamples = [
        [0, 0],
        [img.width - 1, 0],
        [0, img.height - 1],
        [img.width - 1, img.height - 1],
        [Math.floor(img.width / 2), 0]
      ];

      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (const [cx, cy] of cornerSamples) {
        const idx = (cy * img.width + cx) * 4;
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
        count++;
      }
      const bgR = rSum / count;
      const bgG = gSum / count;
      const bgB = bSum / count;

      const tolerance = options.tolerance || 38;
      const featherRadius = options.feather || 2;

      // Check if image corners indicate a uniform or light studio background
      const isPlainBg = (
        (bgR > 210 && bgG > 210 && bgB > 210) || // Light/white background
        (Math.abs(bgR - bgG) < 15 && Math.abs(bgG - bgB) < 15) // Neutral studio gray
      );

      if (isPlainBg) {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const diff = Math.sqrt(
            Math.pow(r - bgR, 2) +
            Math.pow(g - bgG, 2) +
            Math.pow(b - bgB, 2)
          );

          if (diff < tolerance) {
            data[i + 3] = 0; // Transparent
          } else if (diff < tolerance + 25) {
            // Feathered soft edge transition
            const alphaFactor = (diff - tolerance) / 25;
            data[i + 3] = Math.round(data[i + 3] * alphaFactor);
          }
        }
        subCtx.putImageData(imgData, 0, 0);
      }

      // 3. Compute fitting scale & centering
      const scale = Math.min((width * 0.82) / img.width, (height * 0.82) / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = (width - drawW) / 2;
      const drawY = (height - drawH) / 2;

      // 4. Render soft 3D ambient shadow underneath subject
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 16;
      ctx.drawImage(subjectCanvas, drawX, drawY, drawW, drawH);
      ctx.restore();

      // 5. Draw subject crisp on top
      ctx.drawImage(subjectCanvas, drawX, drawY, drawW, drawH);

      // 6. Subtle luxury gold vignette rim
      ctx.save();
      ctx.strokeStyle = 'rgba(213, 183, 122, 0.22)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);
      ctx.restore();

      const resultDataUrl = canvas.toDataURL('image/jpeg', options.quality || 0.88);
      if (cacheKey) {
        this.processedCache.set(cacheKey, resultDataUrl);
      }
      return resultDataUrl;
    }

    /**
     * Draws the unified luxury pedestal background matching the Hotel Premier theme
     */
    drawLuxuryBackdrop(ctx, width, height, options = {}) {
      // Base deep charcoal to midnight indigo gradient
      const baseGrad = ctx.createLinearGradient(0, 0, width, height);
      baseGrad.addColorStop(0, '#191D24');
      baseGrad.addColorStop(0.5, '#222B40');
      baseGrad.addColorStop(1, '#11141B');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Center radial champagne gold glow pedestal
      const radialGlow = ctx.createRadialGradient(
        width / 2, height * 0.58, 20,
        width / 2, height * 0.58, width * 0.65
      );
      radialGlow.addColorStop(0, 'rgba(213, 183, 122, 0.24)');
      radialGlow.addColorStop(0.45, 'rgba(28, 118, 105, 0.12)'); // Subtle emerald accent
      radialGlow.addColorStop(1, 'rgba(25, 29, 36, 0)');

      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Soft circular pedestal plate under the item
      const pedestalGrad = ctx.createRadialGradient(
        width / 2, height * 0.72, 10,
        width / 2, height * 0.72, width * 0.38
      );
      pedestalGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      pedestalGrad.addColorStop(0.7, 'rgba(213, 183, 122, 0.06)');
      pedestalGrad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.scale(1, 0.45);
      ctx.fillStyle = pedestalGrad;
      ctx.beginPath();
      ctx.arc(width / 2, (height * 0.72) / 0.45, width * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /**
     * Standardized Image Component Wrapper
     * Generates responsive, lazy-loaded, accessible image markup with fallback handling
     */
    createImageMarkup(config) {
      const {
        src,
        alt = 'Hotel Premier',
        className = 'hp-asset-img',
        category = this.IMAGE_TYPES.AUTHENTIC_FOOD,
        aspectRatio = '4/3',
        lazy = true,
        onError = "this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'"
      } = config;

      return `
        <div class="hp-image-frame ${category}" style="aspect-ratio: ${aspectRatio};">
          <img 
            src="${src}" 
            alt="${alt}" 
            class="${className}" 
            ${lazy ? 'loading="lazy"' : 'loading="eager" fetchpriority="high"'} 
            onerror="${onError}"
          >
          <div class="hp-image-shimmer" aria-hidden="true"></div>
        </div>
      `;
    }

    /**
     * Pipeline hook for Admin CMS file upload
     * Compresses, checks category, isolates background if applicable, and returns optimized dataURL
     */
    async processUploadFile(file, category = this.IMAGE_TYPES.AUTHENTIC_FOOD, options = {}) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
          try {
            const rawDataUrl = e.target.result;

            if (this.shouldIsolateBackground(category, options)) {
              const processed = await this.processIsolatedAsset(rawDataUrl, options);
              resolve(processed);
            } else {
              // Authentic photography: compress preserving natural environment
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
     * High-fidelity photo compression for authentic photography
     */
    compressPhoto(dataUrl, options = {}) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = options.maxDimension || 1200;
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

          resolve(canvas.toDataURL('image/jpeg', options.quality || 0.82));
        };
        img.onerror = (err) => reject(err);
        img.src = dataUrl;
      });
    }
  }

  // Expose as global singleton
  window.HotelAssetPipeline = HotelAssetPipeline;
  window.AssetPipeline = new HotelAssetPipeline();

})(window);
