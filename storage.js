// ==========================================================================
// HOTEL PREMIER - UNIFIED SAFE STORAGE & PERSISTENCE ENGINE
// IndexedDB photo bytes, compact metadata, and explicit portable backups.
// Browser storage can be cleared by the user or OS; export backups regularly.
// ==========================================================================

class HotelPremierStorageManager {
  constructor() {
    this.dbName = 'HotelPremier_SecureDB';
    this.dbVersion = 1;
    this.db = null;
    this.isReady = false;
    this.initPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported, falling back to LocalStorage');
        this.isReady = true;
        resolve(null);
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Store 1: Dish overrides & high-res images
        if (!db.objectStoreNames.contains('dish_overrides')) {
          db.createObjectStore('dish_overrides', { keyPath: 'id' });
        }
        // Store 2: Room galleries (arrays of photos per room type)
        if (!db.objectStoreNames.contains('room_galleries')) {
          db.createObjectStore('room_galleries', { keyPath: 'id' });
        }
        // Store 3: Restaurant Section & Hero Slides
        if (!db.objectStoreNames.contains('section_slides')) {
          db.createObjectStore('section_slides', { keyPath: 'id' });
        }
        // Store 4: Custom bulk deals & settings
        if (!db.objectStoreNames.contains('hotel_settings')) {
          db.createObjectStore('hotel_settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.isReady = true;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB error, using LocalStorage:', event.target.error);
        this.isReady = true;
        resolve(null);
      };
    });
  }

  // ==================== DISH OVERRIDES, IMAGES & AI PHOTO LIFECYCLE ====================
  async persistPhotoRecord(storeName, id, data, options={}) {
    await this.initPromise;
    const photos = window.HotelPhotoStorage;
    if (!photos) throw Error('Photo storage is unavailable. Reload before saving.');
    window.HotelDataValidation?.validate(data);
    // Migrate only this record after a successful commit. Other legacy local photos stay intact.
    let legacy={};
    if(storeName==='dish_overrides') {
      try { legacy=JSON.parse(localStorage.getItem('hotel_premier_user_overrides_v1')||'{}')[id]||{}; } catch (_) {}
    }
    const existing=await this.readPhotoRecord(storeName,id);
    const originals=storeName==='dish_overrides'?{}:await photos.originalUploads(data);
    const initial=existing?{}:await photos.pack(legacy);
    const packed = await photos.pack({...data,originalPhotos:{...(data.originalPhotos||{}),...originals}});
    await photos.checkSpace({initial,packed});
    if (!this.db) throw Error('IndexedDB is unavailable. Export a backup and enable device storage before saving photos.');
    let written;
    await new Promise((resolve,reject) => {
      const tx=this.db.transaction(storeName,'readwrite');
      tx.oncomplete=resolve;
      let conflict;
      tx.onabort=()=>reject(conflict||tx.error||Error('Photo save was interrupted. Your earlier photo is unchanged.'));
      tx.onerror=()=>reject(tx.error||Error('Photo save failed. Export a backup and check device storage.'));
      const store=tx.objectStore(storeName), request=store.get(id);
      request.onsuccess=()=>{
        const current=request.result||{};
        if(options.expectedRevision!==undefined&&(current.revision||current.updatedAt||null)!==options.expectedRevision){conflict=Object.assign(Error('This photo changed while its preview was processing.'),{code:'PHOTO_CHANGED'});tx.abort();return;}
        written={...initial,...current,...packed,originalPhotos:{...(initial.originalPhotos||{}),...(current.originalPhotos||{}),...(packed.originalPhotos||{})},id,updatedAt:Date.now(),revision:window.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2)};
        store.put(written);
      };
    });
    return written;
  }

  async readPhotoRecord(storeName,id) {
    await this.initPromise;
    if (!this.db) return null;
    return new Promise((resolve,reject)=>{
      const tx=this.db.transaction(storeName,'readonly');
      const request=tx.objectStore(storeName).get(id);
      request.onsuccess=()=>resolve(request.result||null);
      request.onerror=()=>reject(request.error||Error('Device photos could not be read.'));
    });
  }

  hydratePhotoRecord(storeName,record) {
    if (!record) return null;
    return window.HotelPhotoStorage.normalizePaths(window.HotelPhotoStorage.hydrate(record,`${storeName}/${record.id}/${record.revision||record.updatedAt||0}`));
  }
  async originalForPhoto(storeName,id,source) {
    const record=await this.readPhotoRecord(storeName,id);
    if(!record?.originalPhotos)return null;
    const response=await fetch(source);if(!response.ok)throw Error('The selected photo is unavailable.');
    const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await response.arrayBuffer()))].map(b=>b.toString(16).padStart(2,'0')).join('');
    const original=record.originalPhotos[hash];
    return original?window.HotelPhotoStorage.hydrate(original,`${storeName}/${id}/original/${hash}`):null;
  }
  async saveDishOverride(dishId,data,options={}) {
    const record=await this.persistPhotoRecord('dish_overrides',dishId,data,options);
    // Commit bytes before changing the small cache; never prune originals to hide a quota error.
    try {
      const saved=JSON.parse(localStorage.getItem('hotel_premier_user_overrides_v1')||'{}');
      saved[dishId]=window.HotelPhotoStorage.compact(record);
      localStorage.setItem('hotel_premier_user_overrides_v1',JSON.stringify(saved));
    } catch (_) { /* IndexedDB is authoritative; a metadata-cache failure does not undo a committed photo. */ }
    return this.hydratePhotoRecord('dish_overrides',record);
  }

  /**
   * Saves a dish photo with complete AI lifecycle tracking
   */
  async saveDishPhotoLifecycle(dishId, photoRecord, options={}) {
    const data = {
      image: photoRecord.image || photoRecord.enhancedMasterImage,
      enhancedMasterImage: photoRecord.enhancedMasterImage || photoRecord.image,
      rawOriginalImage: photoRecord.rawOriginalImage || photoRecord.image,
      enhancementStatus: photoRecord.enhancementStatus || 'enhanced', // 'original'|'processing'|'enhanced'|'approved'|'flagged_review'
      foodCategory: photoRecord.foodCategory || 'general',
      qualityScore: photoRecord.qualityScore ?? 90,
      qualityFlags: photoRecord.qualityFlags || [],
      backgroundType: photoRecord.backgroundType || 'auto',
      imageOptions: photoRecord.imageOptions || null,
      styleVersion: photoRecord.styleVersion || 'hp-studio-v3.0',
      lastEnhancedAt: Date.now()
    };
    return this.saveDishOverride(dishId, data, options);
  }

  /**
   * Reverts a dish photo to its raw original photograph
   */
  async revertDishToOriginal(dishId) {
    let existing = await this.getDishOverride(dishId);
    if (!existing || !existing.rawOriginalImage) return null;
    const data = {
      image: existing.rawOriginalImage,
      enhancementStatus: 'original'
    };
    await this.saveDishOverride(dishId, data);
    return data;
  }

  /**
   * Approves an enhanced photo for publication
   */
  async approveDishEnhancedPhoto(dishId) {
    let existing = await this.getDishOverride(dishId);
    if (!existing) return null;
    const data = {
      image: existing.enhancedMasterImage || existing.image,
      enhancementStatus: 'approved'
    };
    await this.saveDishOverride(dishId, data);
    return data;
  }

  /**
   * Retrieves single dish override with full high-res data from IndexedDB
   */
  async getDishOverride(dishId) {
    const record=await this.readPhotoRecord('dish_overrides',dishId);
    if(record){window.HotelDataValidation?.validate(record);return this.hydratePhotoRecord('dish_overrides',record);}
    let legacy;
    try { legacy=JSON.parse(localStorage.getItem('hotel_premier_user_overrides_v1')||'{}')[dishId]||null; }
    catch (_) { return null; }
    if(legacy)window.HotelDataValidation?.validate(legacy);
    return legacy&&window.HotelPhotoStorage?window.HotelPhotoStorage.normalizePaths(legacy):legacy;
  }

  // ==================== AI STUDIO SETTINGS PERSISTENCE ====================
  async saveAISettings(settings) {
    // Provider credentials do not belong in this public, local-only PWA.
    settings = { ...settings };
    delete settings.cloudAiApiKey;
    delete settings.cloudAiModel;
    try {
      localStorage.setItem('hotel_premier_ai_settings_v1', JSON.stringify(settings));
    } catch (e) {}
    if (this.db) {
      try {
        const tx = this.db.transaction('hotel_settings', 'readwrite');
        const store = tx.objectStore('hotel_settings');
        store.put({ key: 'ai_studio_settings', value: settings, updatedAt: Date.now() });
      } catch (e) {}
    }
  }

  async getAISettings() {
    await this.initPromise;
    if (this.db) {
      try {
        const tx = this.db.transaction('hotel_settings', 'readonly');
        const store = tx.objectStore('hotel_settings');
        const req = store.get('ai_studio_settings');
        const res = await new Promise((resolve) => {
          req.onsuccess = () => resolve(req.result ? req.result.value : null);
          req.onerror = () => resolve(null);
        });
        if (res) return res;
      } catch (e) {}
    }
    try {
      const saved = localStorage.getItem('hotel_premier_ai_settings_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      autoEnhanceEnabled: true,
      defaultStyle: 'luxury-stage',
      autoReplaceClutteredBg: true,
      qualityThreshold: 60
    };
  }

  async getAllDishOverrides({forBackup=false,strict=false}={}) {
    await this.initPromise;
    let overrides = {};

    // First load from localStorage
    try {
      const saved = localStorage.getItem('hotel_premier_user_overrides_v1');
      if (saved) overrides = JSON.parse(saved);
    } catch (e) {}

    // Hydrate from IndexedDB if available
    if (this.db) {
      try {
        const tx = this.db.transaction('dish_overrides', 'readonly');
        const store = tx.objectStore('dish_overrides');
        const request = store.getAll();
        const items = await new Promise((resolve,reject) => {
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(Error('Local photo records could not be read.'));
        });

        items.forEach(stored => {
          const item=this.hydratePhotoRecord('dish_overrides',forBackup?stored:this.dishDisplayRecord(stored));
          if (item && item.id) {
            const resolvedImg = item.image !== undefined ? item.image : item.enhancedMasterImage || item.rawOriginalImage;
            overrides[item.id] = {
              ...(overrides[item.id] || {}),
              ...item,
              ...(resolvedImg ? { image: resolvedImg } : {})
            };
          }
        });
      } catch (e) { if(forBackup||strict)throw Error('Local photo records could not be read. Your saved photos are unchanged.'); }
    }

    if(!forBackup)overrides=Object.fromEntries(Object.entries(overrides).map(([id,record])=>[id,this.dishDisplayRecord(record)]));
    if(window.HotelPhotoStorage)overrides=window.HotelPhotoStorage.normalizePaths(overrides);
    if(!forBackup&&window.HotelDataValidation)for(const [id,record]of Object.entries(overrides)) {
      try{window.HotelDataValidation.validate(record);}catch(_){delete overrides[id];console.warn('A local menu record was not applied because its content is unsafe. It remains stored and is included in a full backup.');}
    }
    return overrides;
  }

  dishDisplayRecord(record) {
    if(!record||typeof record!=='object')return {};
    const {rawOriginalImage,enhancedMasterImage,originalPhotos,...display}=record;
    const image=record.image!==undefined?record.image:enhancedMasterImage||rawOriginalImage;
    if(image!==undefined)display.image=image;
    return display;
  }

  // ==================== ROOM GALLERIES (MULTI-PHOTO) ====================
  async saveRoomGallery(roomId,imagesArray) {
    const record=await this.persistPhotoRecord('room_galleries',roomId,{images:imagesArray});
    try {
      const metadata=JSON.parse(localStorage.getItem('hotel_premier_room_overrides')||'{}');
      if(metadata[roomId]){delete metadata[roomId].images;delete metadata[roomId].image;localStorage.setItem('hotel_premier_room_overrides',JSON.stringify(metadata));}
    }catch(_){/* The committed gallery remains authoritative. */}
    return record;
  }

  async getRoomGallery(roomId,defaultImages=[]) {
    const record=await this.readPhotoRecord('room_galleries',roomId);
    if(record&&Array.isArray(record.images)) {
      const images=this.hydratePhotoRecord('room_galleries',record).images;
      try {window.HotelDataValidation?.validate({images});return images;}catch(_){console.warn('An unsafe local room gallery was left stored but not displayed.');}
    }
    try {
      const legacy=JSON.parse(localStorage.getItem('hotel_premier_room_overrides')||'{}')[roomId];
      if(Array.isArray(legacy?.images))return legacy.images;
      if(legacy?.image)return [legacy.image];
    } catch (_) { /* Public fallback follows. */ }
    return window.HOTEL_PREMIER_PUBLISHED_OVERRIDES?.roomGalleries?.[roomId]||defaultImages;
  }

  // ==================== RESTAURANT SECTION & HERO SLIDES ====================
  async saveSectionSlides(sectionId,slidesArray) {
    const record=await this.persistPhotoRecord('section_slides',sectionId,{slides:slidesArray});
    try{localStorage.removeItem('hotel_premier_slides_'+sectionId);}catch(_){}
    return record;
  }

  async getSectionSlides(sectionId,defaultSlides=[]) {
    const record=await this.readPhotoRecord('section_slides',sectionId);
    if(record&&Array.isArray(record.slides)) {
      const slides=this.hydratePhotoRecord('section_slides',record).slides;
      try {window.HotelDataValidation?.validate(slides);return slides;}catch(_){console.warn('Unsafe local slides were left stored but not displayed.');}
    }
    try { const legacy=JSON.parse(localStorage.getItem('hotel_premier_slides_'+sectionId)||'null');if(legacy)return legacy; }
    catch (_) { /* Public fallback follows. */ }
    return window.HOTEL_PREMIER_PUBLISHED_OVERRIDES?.sectionSlides?.[sectionId]||defaultSlides;
  }

  // Local UI lock only; no default credentials and no server-authentication claim.
  async setAdminPin(newPin) {
    if (!window.HotelLocalLock) return { success:false, message:'Local lock is unavailable. Reload and retry.' };
    try { await window.HotelLocalLock.setPin(newPin); return { success:true, message:'Local PIN updated on this device.' }; }
    catch (error) { return { success:false, message:error.message }; }
  }

  async verifyAdminPin(pin) {
    if (!window.HotelLocalLock) throw Error('Local lock is unavailable. No fallback PIN is accepted.');
    return window.HotelLocalLock.verify(pin);
  }

  // ==================== 1-CLICK COMPLETE BACKUP EXPORT & IMPORT ====================
  async exportFullBackup() {
    await this.initPromise;

    const dishOverrides = await this.getAllDishOverrides({forBackup:true});
    const superDeluxeGallery = await this.getRoomGallery('ac-super-deluxe');
    const deluxeQueenGallery = await this.getRoomGallery('ac-deluxe-queen');
    const deluxeTwinGallery = await this.getRoomGallery('ac-deluxe-twin');

    // Collect all section slides (restaurant_hero + all category_* slides)
    let sectionSlidesMap = {};
    if (this.db) {
      try {
        const tx = this.db.transaction('section_slides', 'readonly');
        const store = tx.objectStore('section_slides');
        const request = store.getAll();
        const items = await new Promise((resolve) => {
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => resolve([]);
        });
        items.forEach(item => {
          if (item && item.id && item.slides) {
            sectionSlidesMap[item.id] = item.slides;
          }
        });
      } catch (e) {}
    }

    // Also check localStorage keys
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('hotel_premier_slides_')) {
          const sectionId = key.replace('hotel_premier_slides_', '');
          if (!sectionSlidesMap[sectionId]) {
            sectionSlidesMap[sectionId] = JSON.parse(localStorage.getItem(key));
          }
        }
      }
    } catch (e) {}

    // Ensure restaurant_hero is present
    if (!sectionSlidesMap['restaurant_hero']) {
      sectionSlidesMap['restaurant_hero'] = await this.getSectionSlides('restaurant_hero');
    }

    let bulkDeals = [];
    try {
      const savedDeals = localStorage.getItem('hotel_premier_bulk_deals_override');
      if (savedDeals) bulkDeals = JSON.parse(savedDeals);
    } catch (e) {}

    let roomOverrides = {};
    try {
      const savedRoomOverrides = localStorage.getItem('hotel_premier_room_overrides');
      if (savedRoomOverrides) roomOverrides = JSON.parse(savedRoomOverrides);
    } catch (e) {}

    const originalPhotoArchives={};
    if(this.db)for(const storeName of ['room_galleries','section_slides']) {
      const records=await new Promise((resolve,reject)=>{const request=this.db.transaction(storeName,'readonly').objectStore(storeName).getAll();request.onsuccess=()=>resolve(request.result||[]);request.onerror=()=>reject(Error('Original photos could not be read for backup.'));});
      originalPhotoArchives[storeName]=Object.fromEntries(records.filter(record=>record.originalPhotos).map(record=>[record.id,record.originalPhotos]));
    }
    const backupPayload = {
      app: 'Hotel Premier Bhusawal',
      version: '2.1.0',
      timestamp: new Date().toISOString(),
      dishOverrides: dishOverrides,
      roomGalleries: {
        'ac-super-deluxe': superDeluxeGallery,
        'ac-deluxe-queen': deluxeQueenGallery,
        'ac-deluxe-twin': deluxeTwinGallery
      },
      roomOverrides: roomOverrides,
      sectionSlides: sectionSlidesMap,
      originalPhotoArchives,
      bulkDeals: bulkDeals
    };

    const blob = new Blob([JSON.stringify(await window.HotelPhotoStorage.portable(backupPayload), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `Hotel_Premier_Full_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  }

  async importFullBackup(jsonData) {
    if (!jsonData) throw new Error('Invalid backup file');
    if(!window.HotelDataValidation)throw Error('Import validation is unavailable. Reload before restoring.');
    window.HotelDataValidation.validate(jsonData);
    for(const [name,records]of Object.entries(jsonData.originalPhotoArchives||{}))if(!['room_galleries','section_slides'].includes(name)||!records||typeof records!=='object'||Array.isArray(records))throw Error('Unsupported original-photo archive. Nothing has been restored.');

    // 1. Restore Dish Overrides
    if (jsonData.dishOverrides) {
      for (const [id, data] of Object.entries(jsonData.dishOverrides)) {
        await this.saveDishOverride(id, data);
      }
    }

    // 2. Restore Room Galleries & Overrides
    if(jsonData.roomOverrides)for(const [roomId,room]of Object.entries(jsonData.roomOverrides)) {
      if(jsonData.roomGalleries?.[roomId])continue;
      const legacy=Array.isArray(room.images)?room.images:room.image?[room.image]:null;
      if(legacy)await this.saveRoomGallery(roomId,legacy);
    }
    if (jsonData.roomGalleries) {
      for (const [roomId, images] of Object.entries(jsonData.roomGalleries)) {
        if (Array.isArray(images)) {
          await this.saveRoomGallery(roomId, images);
        }
      }
    }
    if(jsonData.roomOverrides)localStorage.setItem('hotel_premier_room_overrides',JSON.stringify(window.HotelPhotoStorage.compact(jsonData.roomOverrides)));

    // 3. Restore Section Slides (Hero + Sub-Sections)
    if (jsonData.sectionSlides) {
      for (const [sectionId, slides] of Object.entries(jsonData.sectionSlides)) {
        if (Array.isArray(slides)) {
          await this.saveSectionSlides(sectionId, slides);
        }
      }
    }

    // 4. Restore Bulk Deals
    for(const [storeName,records]of Object.entries(jsonData.originalPhotoArchives||{})) {
      if(!['room_galleries','section_slides'].includes(storeName))throw Error('Unsupported original-photo archive.');
      for(const [id,originalPhotos]of Object.entries(records))await this.persistPhotoRecord(storeName,id,{originalPhotos});
    }
    if (jsonData.bulkDeals && Array.isArray(jsonData.bulkDeals)) {
      localStorage.setItem('hotel_premier_bulk_deals_override', JSON.stringify(jsonData.bulkDeals));
    }

    return true;
  }
}

// Global Storage Singleton
window.HOTEL_STORAGE = new HotelPremierStorageManager();
