// ==========================================================================
// HOTEL PREMIER - PRIDE PURE VEG AC RESTAURANT, BHUSAWAL
// Live Menu CMS, Multi-Photo Room & Slide Manager, Safe Backup & QR Studio
// ==========================================================================

class HotelPremierAdmin {
  constructor() {
    this.isAuthenticated = false;
    window.HotelLocalLock?.onLock(reason => this.lockAdminSession(reason));
    this.currentTab = 'menu';
    this.activeImageDishId = null;
    this.tempImageSource = '';
    this.newDishTempImage = '';

    // Only authentic property and dish photography is offered as a preset.
    this.curatedPresets=[];
    const seenRooms=new Set();
    this.roomPresets=(window.HOTEL_PREMIER_HOTEL_DATA?.roomCategories||[]).flatMap(room=>(room.images||[room.image]).map((url,index)=>({name:room.name+' — photo '+(index+1),url}))).filter(photo=>photo.url&&!seenRooms.has(photo.url)&&seenRooms.add(photo.url));

    this.activeRoomId = null;
    this.activeRoomSlideMode = 'replace'; // 'replace' | 'add'
    this.activeRoomPhotoIndex = null;
    this.slidesSubTab = 'hero'; // 'hero' | 'category'
    this.selectedCategoryForSlides = 'morning-delights';
    this.editingSlideContext = null;

    this.init();
  }

  init() {
    this.bindEvents();
  }

  // Security Verification
  openAdminModal(initialTab = null, dishQuery = null) {
    const modal = document.getElementById('admin-modal-backdrop');
    if (!modal) return;

    if (!this.isAuthenticated) {
      document.getElementById('admin-auth-view').style.display = 'block';
      document.getElementById('admin-dashboard-view').style.display = 'none';
      this.configureAuthView();
    } else {
      document.getElementById('admin-auth-view').style.display = 'none';
      document.getElementById('admin-dashboard-view').style.display = 'flex';
      this.switchTab(initialTab || this.currentTab);
      if (dishQuery) {
        setTimeout(() => {
          const searchInput = document.getElementById('admin-search-dish');
          if (searchInput) {
            const dish = window.app.menuData.find(d => d.id === dishQuery);
            searchInput.value = dish ? dish.name : dishQuery;
            this.filterAdminDishes();
          }
        }, 100);
      }
    }

    modal.classList.add('active');
  }

  closeAdminModal() {
    this.invalidateAdminRenders();
    window.HotelLocalLock?.lock('Admin Studio was closed. Unlock again on this device to continue.');
    const modal = document.getElementById('admin-modal-backdrop');
    if (modal) modal.classList.remove('active');
  }

  get isAuthenticated() { return Boolean(this._authenticated && window.HotelLocalLock?.isUnlocked()); }
  set isAuthenticated(value) { this._authenticated = Boolean(value); }

  configureAuthView(message = '') {
    const status = document.getElementById('admin-auth-status');
    const confirmRow = document.getElementById('admin-pin-confirm-row');
    const input = document.getElementById('admin-pin-input');
    const button = document.getElementById('admin-unlock-btn');
    try {
      if (!window.HotelLocalLock) throw Error('Local lock could not be loaded. Reload; no fallback PIN is accepted.');
      const state = window.HotelLocalLock.status();
      if (confirmRow) confirmRow.hidden = state.configured;
      if (input) input.autocomplete = state.configured ? 'current-password' : 'new-password';
      if (button) { button.textContent = state.configured ? 'Unlock on this device' : 'Create local PIN'; button.disabled = false; }
      if (status) status.textContent = message || (state.retryAfterMs ? 'Unlock is temporarily throttled. Try again in '+Math.ceil(state.retryAfterMs/1000)+' seconds.' : state.configured ? 'Enter your local PIN. The session locks after 15 minutes without activity.' : 'First use on this device: create and confirm a new PIN with at least 6 digits. Previous default PINs are not accepted.');
    } catch (error) {
      if (status) status.textContent = error.message;
      if (button) button.disabled = true;
    }
  }

  lockAdminSession(reason) {
    this.invalidateAdminRenders();
    if(this.batchRun)this.batchRun.cancelled=true;
    this.isAuthenticated = false;
    const dashboard = document.getElementById('admin-dashboard-view');
    const auth = document.getElementById('admin-auth-view');
    if (dashboard) dashboard.style.display = 'none';
    if (auth) auth.style.display = 'block';
    document.getElementById('admin-tab-content')?.replaceChildren();
    for (const id of ['admin-pin-input','admin-pin-confirm-input']) { const el=document.getElementById(id); if(el)el.value=''; }
    if (this.activeImageDishId || this.activeRoomId || this.editingSlideContext) this.closeImageModal();
    this.closeAddDishModal();
    this.configureAuthView(reason);
  }

  async verifyPin() {
    if (this.authBusy) return;
    const input = document.getElementById('admin-pin-input');
    const confirmation = document.getElementById('admin-pin-confirm-input');
    const status = document.getElementById('admin-auth-status');
    const button = document.getElementById('admin-unlock-btn');
    if (!input) return;
    this.authBusy = true;
    if (button) button.disabled = true;
    try {
      if (!window.HotelLocalLock) throw Error('Local lock is unavailable. No fallback PIN is accepted.');
      const state = window.HotelLocalLock.status();
      let valid;
      if (!state.configured) {
        if (input.value !== confirmation?.value) throw Error('The PIN and confirmation must match.');
        valid = await window.HotelLocalLock.setPin(input.value);
      } else { valid = await window.HotelLocalLock.verify(input.value); }
      if (!valid) { input.value=''; throw Error('The local PIN is incorrect. Repeated attempts are throttled.'); }
      this.isAuthenticated = true;
      input.value = ''; if (confirmation) confirmation.value='';
      document.getElementById('admin-auth-view').style.display = 'none';
      document.getElementById('admin-dashboard-view').style.display = 'flex';
      this.switchTab('crm');
      window.app?.showToast('Admin Studio unlocked locally. Edits remain on this device.', 'success');
    } catch (error) {
      if (status) status.textContent = error.message;
      input.focus();
    } finally { this.authBusy = false; if (button) button.disabled = false; }
  }

  switchTab(tabName) {
    if (!this.isAuthenticated) { this.lockAdminSession('Unlock this device to continue.'); return; }
    this.adminViewGeneration=(this.adminViewGeneration||0)+1;
    this.currentTab = tabName;
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    const contentContainer = document.getElementById('admin-tab-content');
    if (!contentContainer) return;

    if (tabName === 'content') {
      window.HotelContentStudio?.render(contentContainer);
    } else if (tabName === 'crm') {
      this.renderCRMManager(contentContainer);
    } else if (tabName === 'menu') {
      this.renderMenuManager(contentContainer);
    } else if (tabName === 'ai-studio') {
      this.renderAIStudioManager(contentContainer);
    } else if (tabName === 'rooms') {
      this.renderRoomsManager(contentContainer);
    } else if (tabName === 'slides') {
      this.renderSlidesManager(contentContainer);
    } else if (tabName === 'qr') {
      this.renderQRStudio(contentContainer);
    } else if (tabName === 'backup') {
      this.renderBackupManager(contentContainer);
    }
  }

  invalidateAdminRenders() {
    this.adminSessionGeneration=(this.adminSessionGeneration||0)+1;
    this.adminViewGeneration=(this.adminViewGeneration||0)+1;
    this.adminRenderTokens=new WeakMap();
  }

  beginAdminRender(tab,container,message) {
    if(!container || !this.isAuthenticated || this.currentTab!==tab)return null;
    this.adminRenderTokens ||= new WeakMap();
    const token={tab,container,session:this.adminSessionGeneration||0,view:this.adminViewGeneration||0};
    this.adminRenderTokens.set(container,token);
    if(message)this.showAdminRenderStatus(token,message);
    return token;
  }

  canRenderAdmin(token) {
    return Boolean(token&&this.isAuthenticated&&this.currentTab===token.tab&&token.session===(this.adminSessionGeneration||0)&&token.view===(this.adminViewGeneration||0)&&this.adminRenderTokens?.get(token.container)===token&&token.container.isConnected!==false);
  }

  showAdminRenderStatus(token,message,error=false) {
    if(!this.canRenderAdmin(token))return;
    const text=document.createElement('p');text.className='studio-notice';text.textContent=message;text.setAttribute('role',error?'alert':'status');
    token.container.replaceChildren(text);
    if(error){const retry=document.createElement('button');retry.type='button';retry.className='studio-button';retry.textContent='Retry';retry.addEventListener('click',()=>{if(this.canRenderAdmin(token))this.switchTab(token.tab);});token.container.append(retry);}
  }

  // ==================== ENTERPRISE CUSTOMER CRM MANAGER ====================
  renderCRMManager(container) {
    container.replaceChildren();
    const vault = window.HOTEL_VAULT;
    const node = (tag, className, value) => {
      const element = document.createElement(tag); element.className = className;
      if (value !== undefined) element.textContent = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
      return element;
    };
    if (!vault) { container.append(node('p','crm-empty','Hotel Vault not loaded.')); return; }
    const stats = vault.getCRMStats();
    const bookings = vault.getBookings(), reviews = vault.getReviews();
    const intro=node('header','crm-intro');
    intro.append(node('h3','','Hotel Premier Customer Relationship Management'),node('p','','Device-local guest records. This is not a private server database. Export a backup before changing device or clearing browser data.'));
    container.append(intro);
    const kpis=node('div','crm-kpi-grid');
    for (const [label,value] of [['Registered Guests',stats.totalGuests],['Room Bookings',stats.totalBookings],['Guest Reviews',stats.totalReviews],['Banquet Enquiries',stats.totalEnquiries]]) {
      const card=node('div','crm-kpi-card');card.append(node('div','kpi-num',Number.isFinite(value)?value:0),node('div','kpi-label',label));kpis.append(card);
    }
    container.append(kpis);
    const actions=node('div','crm-export-actions-bar');
    for (const [label,method] of [['Export Guests CSV','exportGuestsCSV'],['Export Bookings CSV','exportBookingsCSV'],['Export Reviews CSV','exportReviewsCSV'],['Export Enquiries CSV','exportEnquiriesCSV'],['Master CRM JSON Backup','exportMasterVaultBackup']]) {
      const button=node('button','btn-crm-export',label);button.type='button';
      button.addEventListener('click',()=>{if(this.isAuthenticated)vault[method]();});actions.append(button);
    }
    container.append(actions);
    const table = (title, headers, rows, empty) => {
      const section=node('section','crm-records-section');section.append(node('h4','',title));
      if (!rows.length) {section.append(node('p','crm-empty',empty));container.append(section);return;}
      const grid=node('table','crm-records-table'),head=node('thead',''),headRow=node('tr','');
      for(const label of headers){const cell=node('th','',label);cell.scope='col';headRow.append(cell);}
      head.append(headRow);grid.append(head);const body=node('tbody','');
      for(const row of rows){
        const tr=node('tr','');
        row.forEach((value,index)=>{
          const phone=value&&typeof value==='object'&&Object.hasOwn(value,'phone');
          const cell=node('td','',phone?'':value);cell.setAttribute('data-label',headers[index]);
          if(phone){
            const text=typeof value.phone==='string'?value.phone:'';
            if(/^\+?[0-9 ()-]{6,25}$/.test(text)){const link=node('a','',text);link.href='tel:'+text.replace(/[^0-9+]/g,'');cell.append(link);}
            else cell.textContent=text;
          }
          tr.append(cell);
        });
        body.append(tr);
      }
      grid.append(body);section.append(grid);container.append(section);
    };
    const safeBookings=Array.isArray(bookings)?bookings:[],safeReviews=Array.isArray(reviews)?reviews:[];
    table('Recent Room Inquiries & Bookings ('+safeBookings.length+')',['Date','Guest Name','Phone','Suite','Check-In','Nights','Estimated Total'],safeBookings.slice(0,10).filter(Boolean).map(b=>[
      b.dateFormatted||'',b.guestName||'Valued Guest',{phone:b.guestPhone||''},b.roomType||'',b.checkInDate||'',b.nights,['string','number'].includes(typeof b.estimatedTotal)&&Number.isFinite(Number(b.estimatedTotal))?'₹ '+Number(b.estimatedTotal).toLocaleString('en-IN'):'—'
    ]),'No booking records yet.');
    table('Recent In-House Guest Reviews ('+safeReviews.length+')',['Date','Guest','Rating','Tags','Comment'],safeReviews.slice(0,10).filter(Boolean).map(r=>[
      r.dateFormatted||'',r.name||'Anonymous',Number.isFinite(r.rating)&&r.rating>=1&&r.rating<=5?r.rating+' / 5':'Not rated',Array.isArray(r.tags)?r.tags.filter(t=>typeof t==='string').join(', '):'',r.comment||''
    ]),'No reviews yet.');
  }

  // Client-side HTML5 Canvas Photo Compressor & Intelligent Asset Pipeline Hook
  async compressAndResizeImage(file,maxWidth=1600,maxHeight=1600,quality=.88,category='food',options={}) {
    if(!this.isAuthenticated)throw new DOMException('Unlock the editor before uploading.','AbortError');
    if(!window.HotelPhotoWorkflow)throw Error('Photo editor is unavailable. Reload and retry.');
    this.photoUploadController?.abort();const controller=new AbortController();this.photoUploadController=controller;
    const request=this.previewRequestId||0,session=this.adminSessionGeneration||0;this.photoUploadPending=true;
    try {
      const result=await window.HotelPhotoWorkflow.ingest(file,{signal:controller.signal,aspect:options.aspect||(this.activeRoomId?4/3:this.editingSlideContext?16/9:4/3),maxDimension:Math.min(1600,Math.max(maxWidth,maxHeight)),onProgress:message=>window.app?.showToast(message,'info')});
      window.HotelPhotoWorkflow.release(result.originalUrl);
      if(controller.signal.aborted||!this.isAuthenticated||request!==(this.previewRequestId||0)||session!==(this.adminSessionGeneration||0)){window.HotelPhotoWorkflow.release(result.workingUrl);throw new DOMException('Photo upload cancelled.','AbortError');}
      return result.workingUrl;
    }finally{if(this.photoUploadController===controller)this.photoUploadPending=false;}
  }

  async restorePhotoPreview() {
    if(!this.isAuthenticated)return;
    const session=this.adminSessionGeneration||0,view=this.adminViewGeneration||0,request=this.previewRequestId||0;
    const current=()=>this.isAuthenticated&&session===(this.adminSessionGeneration||0)&&view===(this.adminViewGeneration||0)&&request===(this.previewRequestId||0);
    try {
      let source=this.activeImageDishId?this.rawOriginalSource:null;
      const original=window.HotelPhotoWorkflow?.getOriginal?.(this.tempImageSource);
      if(!source&&original)source=window.HotelPhotoWorkflow.createURL(original);
      if(!source&&this.activeRoomId)source=await window.HOTEL_STORAGE.originalForPhoto('room_galleries',this.activeRoomId,this.tempImageSource);
      if(!source&&this.editingSlideContext){const context=this.editingSlideContext;source=await window.HOTEL_STORAGE.originalForPhoto('section_slides',context.type==='hero'?'restaurant_hero':'category_'+context.targetId,this.tempImageSource);}
      if(!current())return;
      if(!source){window.app.showToast('No earlier uploaded original is stored for this photo. Your saved photo is unchanged.','info');return;}
      clearTimeout(this.previewDebounceTimer);this.previewRequestId=(this.previewRequestId||0)+1;
      this.previewPending=false;this.isPreviewProcessing=false;this.previewFailed=false;this.tempImageSource=source;this.currentEnhancementStatus='original';
      const preview=document.getElementById('image-preview-element');if(preview)preview.src=source;
      const save=document.getElementById('apply-dish-photo-btn');if(save)save.disabled=false;
      window.app.showToast('Original preview restored. Save or apply it only when ready.','info');
    }catch(error){if(current())window.app.showToast(error.message||'The original could not be read.','error');}
  }

  // ==================== 1. MENU CMS TABLE & PRICING ====================
  renderMenuManager(container) {
    const menu = window.app.menuData;
    const categories = window.app.categories.filter(c => c.id !== 'all' && c.id !== 'chef-specials');

    container.innerHTML = `
      <div class="hp-inline-7c9898758083">
        <div class="hp-inline-f0d06bb1c7e8">
          <input type="text" id="admin-search-dish" placeholder="Search dish name to edit price, photo, or status..." class="form-input hp-inline-0482bc3dc754">
          <select id="admin-category-filter" class="form-select hp-inline-45db39f3253b">
            <option value="all">All Categories</option>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
          <button type="button" class="studio-button" onclick="document.getElementById('admin-category-filter').value='indo-chinese'; window.admin.filterAdminDishes()">Indo-Chinese</button>
          <button type="button" class="studio-button" onclick="document.getElementById('admin-category-filter').value='pasta-section'; window.admin.filterAdminDishes()">Pastas</button>
          <select id="admin-status-filter" class="form-select hp-inline-45db39f3253b">
            <option value="all">All Items</option>
            <option value="active">Active Only (Visible)</option>
            <option value="notAvailable">Not Available (Hidden)</option>
          </select>
        </div>
        <button class="btn-primary hp-inline-9cbb36e85504" onclick="window.admin.openAddDishModal()">
          <span>+ Add New Dish</span>
        </button>
      </div>

      <div class="hp-inline-84220f1ea983">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="hp-inline-e34b7515c2af">Photo</th>
              <th>Dish Name & Description</th>
              <th>Category</th>
              <th class="hp-inline-2612b3574623">Price (₹)</th>
              <th class="hp-inline-903a4fafb52d">Taste & Badges</th>
              <th class="hp-inline-4876e9236501">Sold Out</th>
              <th class="hp-inline-9b53fdfd2692">PWA Visibility</th>
              <th class="hp-inline-7ec424f60ba1">Order</th>
              <th class="hp-inline-88acb3aa6426">Delete</th>
            </tr>
          </thead>
          <tbody id="admin-dish-tbody">
            ${this.generateDishTableRows(menu)}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('admin-search-dish').addEventListener('input', () => this.filterAdminDishes());
    const structureHost = document.createElement('div');
    container.prepend(structureHost);
    window.HotelMenuStructure?.render(structureHost);
    document.getElementById('admin-category-filter').addEventListener('change', () => this.filterAdminDishes());
    document.getElementById('admin-status-filter').addEventListener('change', () => this.filterAdminDishes());
  }

  generateDishTableRows(dishes) {
    return dishes.map(dish => {
      const isSoldOut = !!dish.isSoldOut;
      const hasPhoto = dish.image && dish.image.trim() !== '';
      const tags = dish.tags || [];
      const isSweet = tags.includes('sweet');
      const isSpicy = tags.includes('spicy');
      const isChef = tags.includes('chef-special');
      const isBestseller = tags.includes('bestseller');
      const isKhandeshi = tags.includes('khandeshi-special');

      return `
        <tr id="admin-row-${dish.id}">
          <td class="hp-inline-fb5ec070f2bf">
            ${hasPhoto ? `
              <div class="hp-inline-1ee020b90672">
                <div class="hp-inline-cac5954f1be6" onclick="window.admin.openImageModal('${dish.id}')" title="Click to replace photo">
                  <img height="900" width="1200" class="hp-inline-059ba7fa4870" id="admin-dish-thumb-${dish.id}" src="${dish.image}" onerror="this.src='assets/brand-placeholder.svg'">
                  <div class="hp-inline-ce113b7e3400">📷</div>
                </div>
                <button class="hp-inline-c0c0f9190cfa" onclick="window.admin.deleteDishPhoto('${dish.id}')" title="Remove photo (switch to Pure Veg text mode)">
                  🗑️ Remove
                </button>
              </div>
            ` : `
              <div class="admin-no-photo-badge" onclick="window.admin.openImageModal('${dish.id}')" title="Click to upload or assign photo">
                <span>➕</span>
                <span>Photo</span>
              </div>
            `}
          </td>
          <td>
            <div class="hp-inline-fe673e261995">${dish.name}</div>
            <div class="hp-inline-ec98a14b02ca">${dish.description || ''}</div>
            ${dish.variants && dish.variants.length > 0 ? `
              <div class="hp-inline-273c6fc681ac">
                <button class="hp-inline-adfedf133787" type="button" onclick="window.app.openDishDetail('${dish.id}')">
                  🛠️ ${dish.variants.length} Options (Reorder / Manage)
                </button>
              </div>
            ` : ''}
          </td>
          <td>
            <span class="hp-inline-8a158b991469">${dish.categoryId}</span>
          </td>
          <td>
            <div class="hp-inline-c82cd24e1a2e">
              <span class="hp-inline-20ebd756b734">₹</span>
              <input class="hp-inline-fc0e22029128" type="number" value="${dish.price ?? ''}" placeholder="Unset" min="0" onchange="window.admin.updatePrice('${dish.id}', this.value)">
            </div>
          </td>
          <td>
            <div class="admin-taste-tags-wrap">
              <button type="button" class="admin-tag-toggle-chip ${isSweet ? 'active-sweet' : ''}" onclick="window.admin.toggleDishTag('${dish.id}', 'sweet')" title="Toggle Sweet (मीठा) Profile">
                🍯 Sweet
              </button>
              <button type="button" class="admin-tag-toggle-chip ${isSpicy ? 'active-spicy' : ''}" onclick="window.admin.toggleDishTag('${dish.id}', 'spicy')" title="Toggle Spicy (तीखा) Profile">
                🌶️ Spicy
              </button>
              <button type="button" class="admin-tag-toggle-chip ${isChef ? 'active-chef' : ''}" onclick="window.admin.toggleDishTag('${dish.id}', 'chef-special')" title="Toggle Chef's Special">
                👑 Chef
              </button>
              <button type="button" class="admin-tag-toggle-chip ${isBestseller ? 'active-bestseller' : ''}" onclick="window.admin.toggleDishTag('${dish.id}', 'bestseller')" title="Toggle Bestseller">
                🔥 Hot
              </button>
              <button type="button" class="admin-tag-toggle-chip ${isKhandeshi ? 'active-khandeshi' : ''}" onclick="window.admin.toggleDishTag('${dish.id}', 'khandeshi-special')" title="Toggle Khandeshi Special">
                🫕 Khandeshi
              </button>
            </div>
          </td>
          <td class="hp-inline-fb5ec070f2bf">
            <label class="toggle-switch" title="Mark dish Sold Out (shows Sold Out banner in PWA)">
              <input type="checkbox" ${!isSoldOut ? 'checked' : ''} onchange="window.admin.toggleAvailability('${dish.id}', this.checked)">
              <span class="toggle-slider"></span>
            </label>
            <div class="hp-inline-18434dccac85">${isSoldOut ? 'Sold Out' : 'In Stock'}</div>
          </td>
          <td class="hp-inline-fb5ec070f2bf">
            <label class="toggle-switch" title="Check to make invisible from customer PWA">
              <input type="checkbox" ${dish.notAvailable ? 'checked' : ''} onchange="window.admin.toggleNotAvailable('${dish.id}', this.checked)">
              <span class="toggle-slider toggle-slider-danger"></span>
            </label>
            <div class="admin-availability ${dish.notAvailable?'not-available':'available'}">
              ${dish.notAvailable ? '🚫 Hidden' : 'Active'}
            </div>
          </td>
          <td class="hp-inline-fb5ec070f2bf">
            <div class="hp-inline-09e6a15531c4">
              <button class="hp-inline-ed1c30c63caa" type="button" onclick="window.app.moveDish('${dish.id}', 'up')" title="Move Up in Category">▲</button>
              <button class="hp-inline-ed1c30c63caa" type="button" onclick="window.app.moveDish('${dish.id}', 'down')" title="Move Down in Category">▼</button>
            </div>
          </td>
          <td class="hp-inline-fb5ec070f2bf">
            <button class="hp-inline-3e03f20d9a66" onclick="window.admin.deleteDish('${dish.id}')" title="Delete Dish">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  filterAdminDishes() {
    const q = (document.getElementById('admin-search-dish')?.value || '').toLowerCase();
    const cat = document.getElementById('admin-category-filter')?.value || 'all';
    const status = document.getElementById('admin-status-filter')?.value || 'all';
    const tbody = document.getElementById('admin-dish-tbody');

    const filtered = window.app.menuData.filter(d => {
      const matchesQ = d.name.toLowerCase().includes(q) || (d.description && d.description.toLowerCase().includes(q));
      const matchesCat = (cat === 'all') || (d.categoryId === cat);
      let matchesStatus = true;
      if (status === 'active') matchesStatus = !d.notAvailable;
      if (status === 'notAvailable') matchesStatus = Boolean(d.notAvailable);
      return matchesQ && matchesCat && matchesStatus;
    });

    if (tbody) {
      tbody.innerHTML = this.generateDishTableRows(filtered);
    }
  }

  async updatePrice(dishId, newPrice) {
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (dish) {
      const parsedPrice = newPrice.trim() === '' ? null : Number(newPrice);
      if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) return;
      dish.price = parsedPrice;
      window.app.saveMenuData();
      if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveDishOverride(dishId, { price: dish.price });
      }
      window.app.renderMenu();
      window.app.showToast(`Updated price for "${dish.name}" to ${dish.price === null ? 'Price on request' : `₹${dish.price}`}`, 'success');
    }
  }

  async toggleDishTag(dishId, tagName) {
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (!dish) return;

    if (!dish.tags) dish.tags = [];

    const index = dish.tags.indexOf(tagName);
    if (index > -1) {
      dish.tags.splice(index, 1);
    } else {
      dish.tags.push(tagName);
    }

    window.app.saveMenuData();
    if (window.HOTEL_STORAGE) {
      await window.HOTEL_STORAGE.saveDishOverride(dishId, { tags: dish.tags });
    }

    // Refresh UI smoothly
    this.filterAdminDishes();
    window.app.renderMenu();

    // If modal is open for this dish, refresh modal tags as well
    const modal = document.getElementById('dish-detail-modal');
    if (modal && modal.classList.contains('active')) {
      window.app.openDishDetail(dishId);
    }

    const tagLabels = {
      'sweet': 'Sweet (मीठा)',
      'spicy': 'Spicy (तीखा)',
      'chef-special': "Chef's Special 👑",
      'bestseller': 'Bestseller 🔥',
      'khandeshi-special': 'Khandeshi Special 🫕'
    };
    const action = dish.tags.includes(tagName) ? 'Added' : 'Removed';
    window.app.showToast(`${action} ${tagLabels[tagName] || tagName} tag for "${dish.name}"`, 'success');
  }

  async toggleSpecial(dishId, isSpecial) {
    this.toggleDishTag(dishId, 'chef-special');
  }

  async toggleAvailability(dishId, isAvailable) {
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (dish) {
      dish.isSoldOut = !isAvailable;
      window.app.saveMenuData();
      if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveDishOverride(dishId, { isSoldOut: dish.isSoldOut });
      }
      window.app.renderMenu();
      const statusText = isAvailable ? 'Available' : 'Marked Sold Out';
      window.app.showToast(`"${dish.name}" is now ${statusText}!`, 'info');
    }
  }

  async toggleNotAvailable(dishId, isNotAvailable) {
    if (window.app && typeof window.app.toggleDishNotAvailable === 'function') {
      await window.app.toggleDishNotAvailable(dishId, isNotAvailable);
      this.filterAdminDishes();
    }
  }

  async deleteDish(dishId) {
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (!dish) return;

    if (await window.HotelDialogs.confirm(`Are you sure you want to remove "${dish.name}" from the menu?`)) {
      window.app.menuData = window.app.menuData.filter(d => d.id !== dishId);
      window.app.saveMenuData();
      window.app.renderCategoryCards();
      window.app.renderMenu();
      this.filterAdminDishes();
      window.app.showToast(`Removed "${dish.name}" from menu.`, 'info');
    }
  }

  // ==================== DISH PHOTO REPLACEMENT & DELETION MODAL ====================
  async openImageModal(dishId) {
    if(!this.isAuthenticated){window.app?.showToast('Unlock Admin Studio to edit photographs.','info');return;}
    clearTimeout(this.previewDebounceTimer);
    this.previewPending = false;
    this.previewRequestId = (this.previewRequestId || 0) + 1;
    const openingRequest = this.previewRequestId;
    const openingSession=this.adminSessionGeneration||0,openingView=this.adminViewGeneration||0;
    this.isPreviewProcessing = false;
    this.previewFailed = false;
    this.activeImageDishId = dishId;
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (!dish) return;

    // Load any existing photo lifecycle override record from IndexedDB
    let lifecycle = null;
    if (window.HOTEL_STORAGE && typeof window.HOTEL_STORAGE.getDishOverride === 'function') {
      try { lifecycle = await window.HOTEL_STORAGE.getDishOverride(dishId); }
      catch (_) { window.app.showToast('This photo record could not be opened safely. Export a backup before repairing it.','error');return; }
    }
    if (openingRequest !== this.previewRequestId || this.activeImageDishId !== dishId || !this.isAuthenticated || openingSession!==(this.adminSessionGeneration||0) || openingView!==(this.adminViewGeneration||0)) return;

    const savedOpts = (lifecycle && lifecycle.imageOptions) || {};
    this.activeImageOptions = {
      backgroundMode: (lifecycle && lifecycle.backgroundType) || 'original',
      tolerance: savedOpts.tolerance !== undefined ? savedOpts.tolerance : 42,
      feather: 26,
      rotation: savedOpts.rotation !== undefined ? savedOpts.rotation : 0,
      tilt: savedOpts.tilt !== undefined ? savedOpts.tilt : 0,
      yaw: savedOpts.yaw !== undefined ? savedOpts.yaw : 0,
      scale: savedOpts.scale !== undefined ? savedOpts.scale : 1.0,
      panX: savedOpts.panX !== undefined ? savedOpts.panX : 0,
      panY: savedOpts.panY !== undefined ? savedOpts.panY : 0,
      flipH: !!savedOpts.flipH,
      flipV: !!savedOpts.flipV
    };
    this.activeBackgroundMode = this.activeImageOptions.backgroundMode;
    this.activeFramingMode = 'smart';
    const hasPhoto = dish.image && dish.image.trim() !== '';

    this.rawOriginalSource = (lifecycle && lifecycle.rawOriginalImage) ? lifecycle.rawOriginalImage : (dish.image || '');
    this.enhanced4KSource = (lifecycle && lifecycle.enhancedMasterImage) ? lifecycle.enhancedMasterImage : (dish.image || '');
    // Reopening must select the saved current photo, not a previously enhanced
    // master after the owner has explicitly restored the original.
    this.tempImageSource = lifecycle?.image ?? dish.image ?? '';
    this.currentEnhancementStatus = (lifecycle && lifecycle.enhancementStatus) || (hasPhoto ? 'enhanced' : 'original');
    this.currentQualityScore = (lifecycle && lifecycle.qualityScore) || 92;

    const titleEl = document.getElementById('image-modal-dish-name');
    if (titleEl) titleEl.innerText = `${hasPhoto ? 'Culinary Photography Studio' : 'Upload Food Photo'}: ${dish.name}`;

    const body = document.getElementById('image-modal-body');
    if (body) {
      body.innerHTML = `
        <div class="hp-inline-ff69c307f153">
          <!-- Current Photo Status or Delete Option -->
          ${hasPhoto ? `
            <div class="hp-inline-aa27b27cabc1">
              <div>
                <div class="hp-inline-c8709ea6b52d">Want to remove this photo?</div>
                <div class="hp-inline-8bdb9af2323b">The dish will be displayed in elegant Pure Veg text mode until you upload a new photo.</div>
              </div>
              <button class="slide-action-btn delete hp-inline-6138abc8e5cd" onclick="window.admin.deleteDishPhoto('${dish.id}')">
                🗑️ Delete Photo
              </button>
            </div>
          ` : `
            <div class="hp-inline-3e82af662b2a">
              <div class="hp-inline-0cee4e0ca5cb">🌱</div>
              <div class="hp-inline-8abbf8312220">No photo currently assigned</div>
              <div class="hp-inline-8bdb9af2323b">Your original photo stays protected. Choose an optional studio treatment only after checking the preview.</div>
            </div>
          `}

          <!-- Interactive Before/After Studio Slider (Always in DOM for instant seamless upload preview) -->
          <div class="hp-inline-fb5ec070f2bf">
            <div class="hp-inline-afe7b8278545">
              <div class="hp-inline-a369aa7d8b48">
                <span class="hp-inline-45a770d78926">
                  ✨ <span>Studio Comparison</span>
                </span>
                <span id="lifecycle-status-badge" class="hp-status-pill hp-status-${this.currentEnhancementStatus}">
                  ${this.currentEnhancementStatus.toUpperCase()} (${this.currentQualityScore}%)
                </span>
              </div>
              <div class="hp-inline-008dae371a89">
                <button type="button" id="preview-tab-split" class="btn-preview-toggle active hp-inline-8c8b98d4fc6a" onclick="window.admin.toggleComparisonMode('split')">Split View</button>
                <button type="button" id="preview-tab-enhanced" class="btn-preview-toggle hp-inline-18a6d45e17f3" onclick="window.admin.toggleComparisonMode('enhanced')">Studio Master</button>
                <button type="button" id="preview-tab-original" class="btn-preview-toggle hp-inline-18a6d45e17f3" onclick="window.admin.toggleComparisonMode('original')">Raw Original</button>
              </div>
            </div>

            <!-- Dual Layer Split Slider Container -->
            <div class="hp-before-after-container" id="hp-slider-container">
              <!-- Underlayer: Raw Original Image -->
              <img height="900" width="1200" id="image-original-element" class="hp-slider-original-img" src="${this.rawOriginalSource || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}">
              <span class="hp-slider-label hp-slider-label-left">BEFORE (RAW)</span>

              <!-- Overlayer: Enhanced Studio Master (Clipped) -->
              <div class="hp-slider-enhanced-wrap hp-inline-a2dbdad5feb0" id="hp-enhanced-wrap">
                <img height="900" width="1200" id="image-preview-element" class="hp-slider-enhanced-img" src="${this.enhanced4KSource || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}">
                <span class="hp-slider-label hp-slider-label-right">AFTER (STUDIO)</span>
              </div>

              <!-- Draggable Divider Handle -->
              <div class="hp-slider-handle hp-inline-87ef736ccdbf" id="hp-slider-handle">
                <div class="hp-slider-handle-circle">‹ ›</div>
              </div>

              <!-- 4K Studio Quality Badge -->
              <div class="hp-inline-d1f46bc1e953" id="preview-4k-badge">
                LOCAL PHOTO PREVIEW
              </div>
            </div>

            <!-- Interactive Range Bar to adjust split -->
            <input type="range" min="0" max="100" value="50" class="hp-split-range-input" id="hp-split-range" oninput="window.admin.setSplitSliderPosition(this.value)">

            <div class="hp-inline-a5b10e156b8f">
              <span>Drag slider above or tap tabs to compare raw vs studio master</span>
              <span class="hp-inline-3e2bea1b64ec" id="preview-engine-status">● Studio Engine Active</span>
            </div>

            <!-- Revert / Approve / Download Action Bar -->
            <div class="hp-inline-2f9e06ea8cef">
              <button type="button" class="btn-theme-engine-chip" onclick="window.admin.revertActiveDishToOriginal()" title="Revert dish to untouched raw camera photo">
                &#x23EE;&#xFE0F; Revert to Raw Original
              </button>
              <button type="button" class="btn-theme-engine-chip" onclick="window.admin.downloadEnhancedAsset()" title="Download high-resolution image directly to disk">
                &#x1F4BE; Download Asset
              </button>
              <button type="button" class="btn-theme-engine-chip active" onclick="window.admin.approveActiveDishPhoto()" title="Mark enhanced photo as approved master">
                &#x2705; Approve Enhanced Master
              </button>
            </div>
          </div>
          <!-- 1. Background Removal & Luxury Surfaces Panel -->
          <div class="hp-inline-526432ad9145">
            <div class="hp-inline-cbaf771049d8">
              <span>&#x1F3A8; Background Removal & Surface Engine</span>
              <span class="hp-inline-6f3676152b73">Automatic plate segmentation</span>
            </div>
            <div class="hp-inline-4c9a8390658e" id="bg-engine-chips">
              <button type="button" class="btn-theme-engine-chip ${this.activeBackgroundMode === 'natural' ? 'active' : ''}" onclick="window.admin.setImageEngineOption('backgroundMode', 'natural', this)" title="Preserves original framing with subtle warmth and clarity">
                &#x1F33F; Natural Polish
              </button>
              <button type="button" class="btn-theme-engine-chip ${this.activeBackgroundMode === 'cutout' ? 'active' : ''}" onclick="window.admin.setImageEngineOption('backgroundMode', 'cutout', this)" title="Cuts out dish with 100% transparent PNG background">
                &#x2702;&#xFE0F; Transparent Cutout (Remove BG)
              </button>
              <button type="button" class="btn-theme-engine-chip ${this.activeBackgroundMode === 'slate_gold' ? 'active' : ''}" onclick="window.admin.setImageEngineOption('backgroundMode', 'slate_gold', this)" title="Midnight Slate & Imperial Gold luxury table surface">
                &#x1F30C; Midnight Slate & Gold
              </button>
              <button type="button" class="btn-theme-engine-chip ${this.activeBackgroundMode === 'teak_wood' ? 'active' : ''}" onclick="window.admin.setImageEngineOption('backgroundMode', 'teak_wood', this)" title="Warm Teak & Walnut dining table with fine grain">
                &#x1FAB5; Warm Teak Wood
              </button>
              <button type="button" class="btn-theme-engine-chip ${this.activeBackgroundMode === 'cream_marble' ? 'active' : ''}" onclick="window.admin.setImageEngineOption('backgroundMode', 'cream_marble', this)" title="Italian Cream Marble with delicate veining">
                &#x1F3DB;&#xFE0F; Italian Cream Marble
              </button>
              <button type="button" class="btn-theme-engine-chip ${this.activeBackgroundMode === 'pedestal' ? 'active' : ''}" onclick="window.admin.setImageEngineOption('backgroundMode', 'pedestal', this)" title="Unified 3D Gold Pedestal Mount">
                &#x1FA84; 3D Gold Pedestal
              </button>
              <button type="button" class="btn-theme-engine-chip ${(!this.activeBackgroundMode || this.activeBackgroundMode === 'original') ? 'active' : ''}" onclick="window.admin.setImageEngineOption('backgroundMode', 'original', this)" title="Original untouched photo">
                &#x1F4F7; Raw Original
              </button>
            </div>

            <!-- Edge Sensitivity / Tolerance Slider for Cutout & Surfaces -->
            <div id="cutout-tolerance-panel" class="cutout-controls ${['cutout', 'slate_gold', 'teak_wood', 'cream_marble', 'pedestal'].includes(this.activeBackgroundMode)?'':'is-hidden'}">
              <div class="hp-inline-6373eefbfece">
                <span>Edge Detection Sensitivity (Cutout Tolerance)</span>
                <span class="hp-inline-3bba3d8d303f" id="lbl-tolerance">${this.activeImageOptions.tolerance || 42}</span>
              </div>
              <input class="hp-inline-37ab52c9d67a" type="range" id="param-cutout-tolerance" min="15" max="90" value="${this.activeImageOptions.tolerance || 42}" oninput="window.admin.updateCutoutTolerance(this.value)">
              <div class="hp-inline-ed3e68e3d913">Slide right if background still shows; slide left if plate edges get clipped.</div>
            </div>
          </div>

          <!-- 2. Camera Angle, Tilt & View Engine Panel -->
          <div class="hp-inline-526432ad9145">
            <div class="hp-inline-cbaf771049d8">
              <span>&#x1F4D0; Camera Angle, Tilt & View Engine</span>
              <button type="button" class="slide-action-btn hp-inline-5d6f023a45b9" onclick="window.admin.resetAngleAndView()">&#x21BA; Reset View</button>
            </div>

            <!-- Rotation & Quick Turn -->
            <div class="hp-inline-50812c083b15">
              <div>
                <div class="hp-inline-1381aa38aeee">
                  <span>Plate Rotation</span>
                  <span class="hp-inline-3bba3d8d303f" id="lbl-angle-rotation">${this.activeImageOptions.rotation || 0}&deg;</span>
                </div>
                <input class="hp-inline-37ab52c9d67a" type="range" id="param-rotation" min="-45" max="45" value="${this.activeImageOptions.rotation || 0}" oninput="window.admin.updateAngleOption('rotation', this.value)">
              </div>
              <div class="hp-inline-3204b1d0bf89">
                <button type="button" class="btn-theme-engine-chip hp-inline-8f7d2c8525dd" onclick="window.admin.adjustRotation(-90)" title="Rotate 90 counter-clockwise">&#x27F2; -90&deg;</button>
                <button type="button" class="btn-theme-engine-chip hp-inline-8f7d2c8525dd" onclick="window.admin.adjustRotation(90)" title="Rotate 90 clockwise">&#x27F3; +90&deg;</button>
              </div>
            </div>

            <!-- 2.5D Camera Pitch (Tilt) & Yaw (Perspective) -->
            <div class="hp-inline-1dab30a14d80">
              <div>
                <div class="hp-inline-1381aa38aeee">
                  <span>Camera Pitch (Tilt)</span>
                  <span class="hp-inline-3bba3d8d303f" id="lbl-angle-tilt">${this.activeImageOptions.tilt || 0}&deg;</span>
                </div>
                <input class="hp-inline-37ab52c9d67a" type="range" id="param-tilt" min="-30" max="30" value="${this.activeImageOptions.tilt || 0}" oninput="window.admin.updateAngleOption('tilt', this.value)" title="Simulates overhead (flat) vs eye-level perspective angle">
              </div>
              <div>
                <div class="hp-inline-1381aa38aeee">
                  <span>Perspective (Yaw)</span>
                  <span class="hp-inline-3bba3d8d303f" id="lbl-angle-yaw">${this.activeImageOptions.yaw || 0}&deg;</span>
                </div>
                <input class="hp-inline-37ab52c9d67a" type="range" id="param-yaw" min="-30" max="30" value="${this.activeImageOptions.yaw || 0}" oninput="window.admin.updateAngleOption('yaw', this.value)" title="Simulates viewing the dish from left or right">
              </div>
            </div>

            <!-- Scale (Zoom) & Pan Position -->
            <div class="hp-inline-5f3e9e78ec66">
              <div>
                <div class="hp-inline-1381aa38aeee">
                  <span>Zoom</span>
                  <span class="hp-inline-3bba3d8d303f" id="lbl-angle-scale">${Number(this.activeImageOptions.scale || 1.0).toFixed(2)}x</span>
                </div>
                <input class="hp-inline-37ab52c9d67a" type="range" id="param-scale" min="0.5" max="1.8" step="0.05" value="${this.activeImageOptions.scale || 1.0}" oninput="window.admin.updateAngleOption('scale', this.value)">
              </div>
              <div>
                <div class="hp-inline-1381aa38aeee">
                  <span>Pan X</span>
                  <span class="hp-inline-3bba3d8d303f" id="lbl-angle-panX">${this.activeImageOptions.panX || 0}px</span>
                </div>
                <input class="hp-inline-37ab52c9d67a" type="range" id="param-pan-x" min="-120" max="120" value="${this.activeImageOptions.panX || 0}" oninput="window.admin.updateAngleOption('panX', this.value)">
              </div>
              <div>
                <div class="hp-inline-1381aa38aeee">
                  <span>Pan Y</span>
                  <span class="hp-inline-3bba3d8d303f" id="lbl-angle-panY">${this.activeImageOptions.panY || 0}px</span>
                </div>
                <input class="hp-inline-37ab52c9d67a" type="range" id="param-pan-y" min="-120" max="120" value="${this.activeImageOptions.panY || 0}" oninput="window.admin.updateAngleOption('panY', this.value)">
              </div>
            </div>

            <!-- Flip Buttons -->
            <div class="hp-inline-3633e433a162">
              <button type="button" id="btn-flip-h" class="btn-theme-engine-chip ${this.activeImageOptions.flipH ? 'active' : ''} hp-inline-126244f1351e" onclick="window.admin.toggleFlip('h', this)">
                &#x21C6; Flip Horizontal
              </button>
              <button type="button" id="btn-flip-v" class="btn-theme-engine-chip ${this.activeImageOptions.flipV ? 'active' : ''} hp-inline-126244f1351e" onclick="window.admin.toggleFlip('v', this)">
                &#x21C5; Flip Vertical
              </button>
            </div>
          </div>          <!-- Auto 4K Fine-Tuning Drawer / Sliders -->
          <div class="hp-inline-76da34c70e93">
            <div class="hp-inline-4e39d7201489" onclick="const d = document.getElementById('engine-fine-tuning-box'); d.style.display = d.style.display === 'none' ? 'block' : 'none';">
              <span class="hp-inline-992bc7e7b9de">⚙️ Photo tone & light controls</span>
              <span class="hp-inline-c72ba1f0c731">Toggle Adjustments ▼</span>
            </div>
            <div class="hp-inline-bd2072158c3f" id="engine-fine-tuning-box">
              <label class="hp-inline-73172889f7c7"><input type="checkbox" id="engine-adjust-colors" onchange="window.admin.recalculate4KLive()"> Adjust dish colors (optional). Leave off to preserve the original food colors.</label>
              <div class="hp-inline-61b90e9aec87">
                <div>
                  <label class="hp-inline-bee2e02a5dda">Warmth (Kelvin)</label>
                  <input class="hp-inline-37ab52c9d67a" type="range" id="param-warmth" min="0" max="20" value="8" oninput="window.admin.recalculate4KLive()">
                </div>
                <div>
                  <label class="hp-inline-bee2e02a5dda">Clarity (Sharpness)</label>
                  <input class="hp-inline-37ab52c9d67a" type="range" id="param-sharpness" min="0" max="50" value="28" oninput="window.admin.recalculate4KLive()">
                </div>
              </div>
              <div class="hp-inline-e4638dd958a7">
                <div>
                  <label class="hp-inline-bee2e02a5dda">Contrast & Depth</label>
                  <input class="hp-inline-37ab52c9d67a" type="range" id="param-contrast" min="95" max="125" value="108" oninput="window.admin.recalculate4KLive()">
                </div>
                <div>
                  <label class="hp-inline-bee2e02a5dda">Studio Vignette</label>
                  <input class="hp-inline-37ab52c9d67a" type="range" id="param-vignette" min="0" max="70" value="38" oninput="window.admin.recalculate4KLive()">
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="form-label">Option 1: Upload Raw Photo from Phone / Camera</label>
            <input type="file" accept="image/*" class="form-input hp-inline-847ff70267ce" onchange="window.admin.handleImageFileUpload(this)">
            <label class="studio-button">Take a photo<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" class="camera-photo-input" onchange="window.admin.handleImageFileUpload(this)"></label>
          </div>

          <div>
            <label class="form-label">Option 2: Paste Web Image URL</label>
            <input type="text" id="image-url-input-field" value="${hasPhoto && !dish.image.startsWith('data:') ? dish.image : ''}" class="form-input" placeholder="https://..." oninput="window.admin.updatePreviewFromUrl(this.value)">
          </div>

          <div>
            <label class="form-label">Option 3: Reuse This Dish’s Saved Photos</label>
            <p class="hp-inline-cce8e0fdaf9d">Only photos already assigned to this dish are shown; verify they depict the correct food. Upload a real dish photo if none matches.</p>
            <div id="dish-saved-photo-options" class="preset-image-grid hp-inline-59348a7fd19a"></div>
            <p class="hp-inline-cce8e0fdaf9d">Natural Polish adjusts lighting. Studio modes create local surface treatments, not AI-generated scenes. Saves stay on this device; cloud generation and publishing are not connected.</p>
          </div>

          <div class="hp-inline-4ad9f1568ce9">
            <button class="btn-secondary" onclick="window.admin.closeImageModal()">Cancel</button>
            <button class="btn-primary" id="apply-dish-photo-btn" onclick="window.admin.saveReplacedImage()">Save selected photo</button>
          </div>
        </div>
      `;
    }

    const presetGrid = document.getElementById('dish-saved-photo-options');
    if (presetGrid) {
      const seen = new Set();
      const candidates = [
        ['Saved original', lifecycle?.rawOriginalImage],
        ['Current dish photo', dish.image]
      ];
      for (const [label, source] of candidates) {
        if (typeof source !== 'string' || !/^(https?:\/\/|data:image\/|\.?\/?assets\/)/i.test(source) || seen.has(source)) continue;
        seen.add(source);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'preset-image-item';
        button.title = label;
        button.onclick = () => this.selectPresetImage(source);
        const img = document.createElement('img');
        img.src = source;
        img.alt = `${dish.name}: ${label}`;
        const caption = document.createElement('div');
        caption.className = 'preset-label';
        caption.textContent = label;
        button.append(img, caption);
        presetGrid.append(button);
      }
      if (!seen.size) presetGrid.textContent = 'No saved photo for this dish. Use Upload Photo above.';
    }
    const modal = document.getElementById('image-replace-modal');
    if (modal) modal.classList.add('active');
  }

  async deleteDishPhoto(dishId) {
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (!dish) return;

    if (await window.HotelDialogs.confirm(`Remove the photo for "${dish.name}"?\n\nThe dish will be shown in Pure Veg mode without photo until you upload a new one.`)) {
      if (window.AssetPipeline?.clearCacheForAsset) {
        window.AssetPipeline.clearCacheForAsset(dish.id);
        window.AssetPipeline.clearCacheForAsset(dish.image);
      }
      dish.image = '';
      window.app.saveMenuData();

      if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveDishOverride(dish.id, { image: '' });
      }

      window.app.renderCategoryCards();
      if (window.app.currentCategory && window.app.currentCategory !== 'all') {
        window.app.renderSectionSlideshow(window.app.currentCategory);
      }
      window.app.renderMenu();
      this.filterAdminDishes();
      if (document.getElementById('studio-dishes-grid')) {
        this.renderAIStudioManager(document.getElementById('admin-tab-content'));
      }
      window.dispatchEvent(new CustomEvent('hp-media-updated', { detail: { dishId: dish.id, image: '' } }));
      this.closeImageModal();
      window.app.showToast(`Photo removed for "${dish.name}". Showing in text-only mode!`, 'info');
    }
  }

  closeImageModal() {
    this.photoUploadPending=false;
    clearTimeout(this.previewDebounceTimer);
    this.previewPending = false;
    this.previewRequestId = (this.previewRequestId || 0) + 1;
    this.isPreviewProcessing = false;
    this.previewFailed = false;
    const modal = document.getElementById('image-replace-modal');
    if (modal) modal.classList.remove('active');
    this.activeImageDishId = null;
    this.activeRoomId = null;
    this.activeRoomPhotoIndex = null;
    this.editingSlideContext = null;
    this.photoUploadController?.abort();
    window.HotelPhotoWorkflow?.release(this.tempImageSource);
    window.HotelPhotoWorkflow?.release(this.enhanced4KSource);
    window.HotelPhotoWorkflow?.release(this.workingPhotoSource);
    window.HotelPhotoWorkflow?.release(this.rawOriginalSource);
    this.workingPhotoSource=null;
    this.rawOriginalSource = null;
    this.enhanced4KSource = null;
  }

  setSplitSliderPosition(percent) {
    const wrap = document.getElementById('hp-enhanced-wrap');
    const handle = document.getElementById('hp-slider-handle');
    const pct = Math.max(0, Math.min(100, percent));
    if (wrap) wrap.style.width = `${pct}%`;
    if (handle) handle.style.left = `${pct}%`;
  }

  toggleComparisonMode(mode) {
    const origImg = document.getElementById('image-original-element');
    const wrap = document.getElementById('hp-enhanced-wrap');
    const handle = document.getElementById('hp-slider-handle');
    const range = document.getElementById('hp-split-range');
    const badge = document.getElementById('preview-4k-badge');

    const btnSplit = document.getElementById('preview-tab-split');
    const btnEnhanced = document.getElementById('preview-tab-enhanced');
    const btnOriginal = document.getElementById('preview-tab-original');

    [btnSplit, btnEnhanced, btnOriginal].forEach(b => {
      if (b) {
        b.classList.remove('active');
      }
    });

    if (mode === 'original') {
      if (wrap) wrap.style.width = '0%';
      if (handle) handle.style.display = 'none';
      if (range) range.style.display = 'none';
      if (badge) badge.style.display = 'none';
      if (btnOriginal) {
        btnOriginal.classList.add('active');
      }
    } else if (mode === 'enhanced') {
      if (wrap) wrap.style.width = '100%';
      if (handle) handle.style.display = 'none';
      if (range) range.style.display = 'none';
      if (badge) badge.style.display = 'block';
      if (btnEnhanced) {
        btnEnhanced.classList.add('active');
      }
    } else {
      // Split view
      if (wrap) wrap.style.width = '50%';
      if (handle) {
        handle.style.display = 'block';
        handle.style.left = '50%';
      }
      if (range) {
        range.style.display = 'block';
        range.value = 50;
      }
      if (badge) badge.style.display = 'block';
      if (btnSplit) {
        btnSplit.classList.add('active');
      }
    }
  }

  async revertActiveDishToOriginal() {
    if (!this.activeImageDishId || this.previewPending || this.isPreviewProcessing || this.previewFailed || this.savingDishPhoto) return;
    if (!this.rawOriginalSource) {
      window.app.showToast('No original photo is available for this dish.', 'error');
      return;
    }
    if (await window.HotelDialogs.confirm('Revert this dish to its untouched original photo?')) {
      return this.saveReplacedImage({ image: this.rawOriginalSource, status: 'original', backgroundMode: 'original' });
    }
  }

  async approveActiveDishPhoto() {
    return this.saveReplacedImage({ status: 'approved' });
  }

  setImageEngineOption(key, val, btn) {
    if (!this.activeImageOptions) this.activeImageOptions = {};
    this.activeImageOptions[key] = val;
    if (key === 'backgroundMode') {
      this.activeBackgroundMode = val;
      const tolPanel = document.getElementById('cutout-tolerance-panel');
      if (tolPanel) {
        tolPanel.style.display = ['cutout', 'slate_gold', 'teak_wood', 'cream_marble', 'pedestal'].includes(val) ? 'block' : 'none';
      }
    }
    if (key === 'framingMode') this.activeFramingMode = val;
    if (btn && btn.parentElement) {
      btn.parentElement.querySelectorAll('.btn-theme-engine-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    this.recalculate4KLive();
  }

  updateCutoutTolerance(val) {
    if (!this.activeImageOptions) this.activeImageOptions = {};
    this.activeImageOptions.tolerance = parseInt(val, 10);
    const lbl = document.getElementById('lbl-tolerance');
    if (lbl) lbl.innerText = val;
    this.recalculate4KLive();
  }

  updateAngleOption(key, val) {
    if (!this.activeImageOptions) this.activeImageOptions = {};
    this.activeImageOptions[key] = parseFloat(val);
    const lbl = document.getElementById(`lbl-angle-${key}`);
    if (lbl) {
      if (key === 'scale') lbl.innerText = `${parseFloat(val).toFixed(2)}x`;
      else if (key === 'rotation' || key === 'tilt' || key === 'yaw') lbl.innerText = `${parseInt(val, 10)}\u00B0`;
      else if (key === 'panX' || key === 'panY') lbl.innerText = `${parseInt(val, 10)}px`;
    }
    this.recalculate4KLive();
  }

  adjustRotation(delta) {
    if (!this.activeImageOptions) this.activeImageOptions = {};
    let cur = parseInt(this.activeImageOptions.rotation || 0, 10);
    let next = cur + delta;
    if (next > 180) next -= 360;
    if (next < -180) next += 360;
    this.activeImageOptions.rotation = next;
    const input = document.getElementById('param-rotation');
    if (input) input.value = next;
    const lbl = document.getElementById('lbl-angle-rotation');
    if (lbl) lbl.innerText = `${next}\u00B0`;
    this.recalculate4KLive();
  }

  toggleFlip(axis, btn) {
    if (!this.activeImageOptions) this.activeImageOptions = {};
    if (axis === 'h') {
      this.activeImageOptions.flipH = !this.activeImageOptions.flipH;
      if (btn) btn.classList.toggle('active', !!this.activeImageOptions.flipH);
    } else if (axis === 'v') {
      this.activeImageOptions.flipV = !this.activeImageOptions.flipV;
      if (btn) btn.classList.toggle('active', !!this.activeImageOptions.flipV);
    }
    this.recalculate4KLive();
  }

  resetAngleAndView() {
    if (!this.activeImageOptions) this.activeImageOptions = {};
    this.activeImageOptions.rotation = 0;
    this.activeImageOptions.tilt = 0;
    this.activeImageOptions.yaw = 0;
    this.activeImageOptions.scale = 1.0;
    this.activeImageOptions.panX = 0;
    this.activeImageOptions.panY = 0;
    this.activeImageOptions.flipH = false;
    this.activeImageOptions.flipV = false;

    const rotEl = document.getElementById('param-rotation');
    if (rotEl) rotEl.value = 0;
    const tiltEl = document.getElementById('param-tilt');
    if (tiltEl) tiltEl.value = 0;
    const yawEl = document.getElementById('param-yaw');
    if (yawEl) yawEl.value = 0;
    const scaleEl = document.getElementById('param-scale');
    if (scaleEl) scaleEl.value = 1.0;
    const panXEl = document.getElementById('param-pan-x');
    if (panXEl) panXEl.value = 0;
    const panYEl = document.getElementById('param-pan-y');
    if (panYEl) panYEl.value = 0;

    const lblRot = document.getElementById('lbl-angle-rotation');
    if (lblRot) lblRot.innerText = '0\u00B0';
    const lblTilt = document.getElementById('lbl-angle-tilt');
    if (lblTilt) lblTilt.innerText = '0\u00B0';
    const lblYaw = document.getElementById('lbl-angle-yaw');
    if (lblYaw) lblYaw.innerText = '0\u00B0';
    const lblScale = document.getElementById('lbl-angle-scale');
    if (lblScale) lblScale.innerText = '1.00x';
    const lblPanX = document.getElementById('lbl-angle-panX');
    if (lblPanX) lblPanX.innerText = '0px';
    const lblPanY = document.getElementById('lbl-angle-panY');
    if (lblPanY) lblPanY.innerText = '0px';

    const flipHBtn = document.getElementById('btn-flip-h');
    if (flipHBtn) flipHBtn.classList.remove('active');
    const flipVBtn = document.getElementById('btn-flip-v');
    if (flipVBtn) flipVBtn.classList.remove('active');

    this.recalculate4KLive();
  }

  async downloadEnhancedAsset() {
    if (this.previewPending || this.isPreviewProcessing || this.previewFailed) {
      window.app?.showToast?.('Wait for a successful preview before downloading.', 'info');
      return;
    }
    if (!this.tempImageSource) {
      window.app?.showToast?.('No processed asset available to download.', 'warning');
      return;
    }
    const dish = window.app?.menuData?.find(d => d.id === this.activeImageDishId) || { name: 'dish' };
    let ext;
    try { const response=await fetch(this.tempImageSource);if(!response.ok)throw Error();ext=({'image/webp':'webp','image/png':'png','image/jpeg':'jpg'})[(await response.blob()).type]||'jpg'; }
    catch (_) { window.app?.showToast('The preview could not be downloaded. Retry after it finishes.','error');return; }
    const safeName = (dish.name || 'dish').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const mode = this.activeBackgroundMode || 'enhanced';
    const filename = `${safeName}-${mode.replaceAll('_','-')}.${ext}`;

    const a = document.createElement('a');
    a.href = this.tempImageSource;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.app?.showToast?.(`Downloaded ${filename}`, 'success');
  }

  recalculate4KLive() {
    clearTimeout(this.previewDebounceTimer);
    // Invalidate the previous render immediately, not after the debounce delay.
    this.previewRequestId = (this.previewRequestId || 0) + 1;
    this.previewPending = true;
    const saveButton = document.getElementById('apply-dish-photo-btn');
    if (saveButton) saveButton.disabled = true;
    this.previewDebounceTimer = setTimeout(() => {
      this.runImagePreview();
    }, 180);
  }

  async runImagePreview() {
    if (!this.rawOriginalSource) return;
    this.previewPending = false;
    const requestId = this.previewRequestId = (this.previewRequestId || 0) + 1;
    const source = this.workingPhotoSource || this.rawOriginalSource;
    const dishId = this.activeImageDishId;
    this.isPreviewProcessing = true;
    this.previewFailed = false;
    const saveButton = document.getElementById('apply-dish-photo-btn');
    if (saveButton) saveButton.disabled = true;
    const warmth = parseInt(document.getElementById('param-warmth')?.value || '8', 10);
    const sharpness = parseInt(document.getElementById('param-sharpness')?.value || '28', 10) / 100;
    const contrast = parseInt(document.getElementById('param-contrast')?.value || '108', 10) / 100;
    const vignetteStrength = parseInt(document.getElementById('param-vignette')?.value || '38', 10) / 100;

    const status = document.getElementById('preview-engine-status');
    if (status) status.innerText = this.activeBackgroundMode === 'original'
      ? '\u25CF Original photo preserved'
      : (this.activeBackgroundMode === 'cutout' ? '\u2702 Cutting out transparent background...' : '\u2699 Preparing studio preview...');

    const dish = window.app.menuData.find(d => d.id === this.activeImageDishId) || {};

    if (window.AssetPipeline && typeof window.AssetPipeline.processAutomaticStudioEnhancement === 'function') {
      try {
        const opts = this.activeImageOptions || {};
        const result = await window.AssetPipeline.processAutomaticStudioEnhancement(source, dish, {
          backgroundMode: this.activeBackgroundMode || 'original',
          enhanceColors: document.getElementById('engine-adjust-colors')?.checked === true,
          framingMode: this.activeFramingMode || 'smart',
          tolerance: opts.tolerance !== undefined ? opts.tolerance : 42,
          feather: opts.feather !== undefined ? opts.feather : 26,
          rotation: opts.rotation !== undefined ? opts.rotation : 0,
          tilt: opts.tilt !== undefined ? opts.tilt : 0,
          yaw: opts.yaw !== undefined ? opts.yaw : 0,
          scale: opts.scale !== undefined ? opts.scale : 1.0,
          panX: opts.panX !== undefined ? opts.panX : 0,
          panY: opts.panY !== undefined ? opts.panY : 0,
          flipH: !!opts.flipH,
          flipV: !!opts.flipV,
          warmth: warmth,
          sharpness: sharpness,
          contrast: contrast,
          vignetteStrength: vignetteStrength
        });
        if (requestId !== this.previewRequestId || source !== (this.workingPhotoSource || this.rawOriginalSource) || dishId !== this.activeImageDishId) { window.HotelPhotoWorkflow?.release(result.enhancedDataUrl); return; }
        if(this.enhanced4KSource!==this.workingPhotoSource && this.enhanced4KSource!==this.rawOriginalSource)window.HotelPhotoWorkflow?.release(this.enhanced4KSource);
        this.enhanced4KSource = result.enhancedDataUrl;
        this.tempImageSource = result.enhancedDataUrl;
        this.currentEnhancementStatus = result.status;
        const lifecycleBadge = document.getElementById('lifecycle-status-badge');
        if (lifecycleBadge) {
          lifecycleBadge.className = `hp-status-pill hp-status-${result.status}`;
          lifecycleBadge.innerText = result.status === 'natural' ? 'NATURAL POLISH' : result.status.toUpperCase();
        }
        this.currentQualityScore = result.qualityScore || 90;

        const preview = document.getElementById('image-preview-element');
        if (preview) preview.src = result.enhancedDataUrl;
        if (status) status.innerText = result.status === 'original'
          ? '● Original photo preserved'
          : result.status === 'natural'
            ? `● Natural Polish V3 ready (${this.currentQualityScore}%)`
            : `● Studio preview ready (${this.currentQualityScore}%)`;
        return result;
      } catch (e) {
        if (requestId === this.previewRequestId) this.previewFailed = true;
        if (requestId === this.previewRequestId && status) status.innerText = 'Preview failed. Try uploading the photo directly.';
      } finally {
        if (requestId === this.previewRequestId) {
          this.isPreviewProcessing = false;
          if (saveButton) saveButton.disabled = Boolean(this.previewFailed || this.savingDishPhoto);
        }
      }
    } else {
      this.isPreviewProcessing = false;
      this.previewFailed = true;
      if (status) status.innerText = 'Photo tools are unavailable. Reload and retry; your original has not been replaced.';
    }
  }

  async handleImageFileUpload(input) {
    const file = input && input.files ? input.files[0] : null;
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      window.app.showToast('Please choose a JPG, PNG or WebP photo.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      window.app.showToast('Please choose a photo smaller than 20 MB.');
      return;
    }
    this.previewFailed = false;
    clearTimeout(this.previewDebounceTimer);
    const uploadRequest = this.previewRequestId = (this.previewRequestId || 0) + 1;
    const uploadDishId = this.activeImageDishId;
    this.isPreviewProcessing = true;
    const saveButton = document.getElementById('apply-dish-photo-btn');
    if (saveButton) saveButton.disabled = true;
    try {
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast('Studio Engine: Ingesting raw photo...', 'info');
      }
      const status = document.getElementById('preview-engine-status');
      if (status) status.innerText = 'Reading your original photo…';

      if(!window.HotelPhotoWorkflow)throw Error('Photo editor is unavailable. Reload and retry.');
      this.photoUploadController?.abort();
      this.photoUploadController=new AbortController();
      const upload=await window.HotelPhotoWorkflow.ingest(file,{aspect:4/3,signal:this.photoUploadController.signal,onProgress:message=>{if(status)status.textContent=message;}});
      if(uploadRequest!==this.previewRequestId || uploadDishId!==this.activeImageDishId){window.HotelPhotoWorkflow.release(upload.originalUrl);window.HotelPhotoWorkflow.release(upload.workingUrl);return;}
      window.HotelPhotoWorkflow.release(this.workingPhotoSource);
      this.workingPhotoSource=upload.workingUrl;
      const rawDataUrl=upload.originalUrl;
      this.rawOriginalSource=rawDataUrl;
      // A new upload never inherits colour correction from the previous photo.
      const colorControl = document.getElementById('engine-adjust-colors');
      if (colorControl) colorControl.checked = false;

      const origEl = document.getElementById('image-original-element');
      if (origEl) origEl.src = this.workingPhotoSource || rawDataUrl;

      // Run live calibration with active image options (background, angle, tilt, tolerance, etc.)
      const result = await this.runImagePreview();
      if (!result || uploadDishId !== this.activeImageDishId || this.rawOriginalSource !== rawDataUrl) return;

      const urlInput = document.getElementById('image-url-input-field');
      if (urlInput) urlInput.value = '(Uploaded from device)';
      if (typeof this.toggleComparisonMode === 'function') {
        this.toggleComparisonMode('split');
      }
      window.app?.showToast(result.status === 'original'
        ? 'Original photo ready. Nothing is saved until you apply it.'
        : 'Preview ready. Check the dish and plate edges before applying.', 'success');
    } catch (err) {
      if (uploadRequest !== this.previewRequestId || uploadDishId !== this.activeImageDishId) return;
      console.error('handleImageFileUpload error:', err);
      this.isPreviewProcessing = false;
      this.previewFailed = err.name!=='AbortError';
      if(saveButton)saveButton.disabled=this.previewFailed;
      window.app?.showToast(err.name==='AbortError'?'Photo selection cancelled. The saved photo is unchanged.':err.message||'Photo could not be read. Please retry; the saved photo is unchanged.', err.name==='AbortError'?'info':'error');
    }
  }

  async updatePreviewFromUrl(url) {
    const trimmed = url.trim();
    if (!trimmed) return;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol!=='https:') return;
    } catch (e) { return; }
    window.HotelPhotoWorkflow?.release(this.workingPhotoSource);this.workingPhotoSource=null;
    this.rawOriginalSource = trimmed;
    this.tempImageSource = trimmed;
    const preview = document.getElementById('image-preview-element');
    const origEl = document.getElementById('image-original-element');
    if (preview) preview.src = trimmed;
    if (origEl) origEl.src = trimmed;

    await this.recalculate4KLive();
  }

  async selectPresetImage(url) {
    window.HotelPhotoWorkflow?.release(this.workingPhotoSource);this.workingPhotoSource=null;
    this.rawOriginalSource = url;
    this.tempImageSource = url;
    const preview = document.getElementById('image-preview-element');
    const origEl = document.getElementById('image-original-element');
    const urlInput = document.getElementById('image-url-input-field');
    if (preview) preview.src = url;
    if (origEl) origEl.src = url;
    if (urlInput) urlInput.value = url;

    await this.recalculate4KLive();
  }

  async saveReplacedImage(selection = {}) {
    if (this.previewPending || this.isPreviewProcessing || this.previewFailed || this.savingDishPhoto) return false;
    if (!this.activeImageDishId || !this.tempImageSource) return;

    const dish = window.app.menuData.find(d => d.id === this.activeImageDishId);
    if (dish) {
      let image = selection.image || this.tempImageSource;
      const status = selection.status || this.currentEnhancementStatus || 'enhanced';
      const requestId = this.previewRequestId;
      const saveButton = document.getElementById('apply-dish-photo-btn');
      this.savingDishPhoto = true;
      if (saveButton) saveButton.disabled = true;
      // Permanent Dual Photo Preservation in Storage with Lifecycle tracking
      try {
      if (window.HOTEL_STORAGE && typeof window.HOTEL_STORAGE.saveDishPhotoLifecycle === 'function') {
        const persisted=await window.HOTEL_STORAGE.saveDishPhotoLifecycle(dish.id, {
          enhancedMasterImage: status === 'original' ? (this.enhanced4KSource || image) : image,
          image,
          rawOriginalImage: this.rawOriginalSource || this.tempImageSource,
          enhancementStatus: status,
          qualityScore: this.currentQualityScore || 90,
          backgroundType: selection.backgroundMode || this.activeBackgroundMode || 'original',
          imageOptions: { ...(this.activeImageOptions || {}) },
          styleVersion: 'hp-studio-v3.0'
        });
        if(persisted?.image)image=persisted.image;
      } else if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveDishOverride(dish.id, { image });
      } else {
        throw new Error('Photo storage is not ready. Reload and retry.');
      }
      } catch (error) {
        window.app.showToast(error.message || 'Photo could not be saved. Please retry.', 'error');
        return false;
      } finally {
        this.savingDishPhoto = false;
        if (saveButton && requestId === this.previewRequestId && this.activeImageDishId === dish.id) {
          saveButton.disabled = Boolean(this.previewPending || this.isPreviewProcessing || this.previewFailed);
        }
      }
      if (window.AssetPipeline?.clearCacheForAsset) {
        window.AssetPipeline.clearCacheForAsset(dish.id);
        window.AssetPipeline.clearCacheForAsset(dish.image);
      }
      dish.image = image;
      window.app.saveMenuData();

      // Direct live DOM updates so changes reflect immediately without needing reload
      const cardImg = document.getElementById(`dish-img-el-${dish.id}`);
      if (cardImg) {
        if (cardImg.tagName === 'IMG') {
          cardImg.src = image;
        } else {
          window.app.renderMenu();
        }
      }

      const modalImg = document.getElementById('detail-modal-img');
      if (modalImg && modalImg.tagName === 'IMG' && window.app.currentDetailDishId === dish.id && !(window.app.currentDetailVariantIndex >= 0)) {
        modalImg.src = image;
      }

      const thumbImg = document.getElementById(`admin-dish-thumb-${dish.id}`);
      if (thumbImg) thumbImg.src = image;

      window.app.renderCategoryCards();
      if (window.app.currentCategory && window.app.currentCategory !== 'all') {
        window.app.renderSectionSlideshow(window.app.currentCategory);
      }
      window.app.renderMenu();
      this.filterAdminDishes();
      if (document.getElementById('studio-dishes-grid')) {
        this.renderAIStudioManager(document.getElementById('admin-tab-content'));
      }
      window.dispatchEvent(new CustomEvent('hp-media-updated', { detail: { dishId: dish.id, image } }));
      if (requestId === this.previewRequestId && this.activeImageDishId === dish.id) this.closeImageModal();
      window.app.showToast(`Photo ${status === 'approved' ? 'approved' : status === 'original' ? 'restored' : 'saved'} for "${dish.name}" in this browser.`, 'success');
      return true;
    }
  }

  // ==================== 1B. AI PHOTO STUDIO & BATCH PHOTOGRAPHY HUB ====================
  async renderAIStudioManager(container) {
    const view=this.beginAdminRender('ai-studio',container,'Loading your photo gallery…');if(!view)return;
    const renderId = this.studioRenderId = (this.studioRenderId || 0) + 1;
    const dishes = window.app.menuData || [];
    const withPhotos = dishes.filter(d => d.image && d.image.trim() !== '');
    const withoutPhotos = dishes.filter(d => !d.image || d.image.trim() === '');

    let settings = {
      autoEnhanceEnabled: true,
      defaultStyle: 'slate_gold',
      autoReplaceClutteredBg: true
    };
    if (window.HOTEL_STORAGE && typeof window.HOTEL_STORAGE.getAISettings === 'function') {
      try{settings = await window.HOTEL_STORAGE.getAISettings() || settings;}catch(_){this.showAdminRenderStatus(view,'Photo settings could not be loaded. Your saved photos are unchanged.',true);return;}
    }
    // Collect overrides from storage
    if(!this.canRenderAdmin(view))return;
    let overrides={};
    try{if(window.HOTEL_STORAGE?.getAllDishOverrides)overrides=await window.HOTEL_STORAGE.getAllDishOverrides({strict:true});}catch(_){this.showAdminRenderStatus(view,'The photo gallery could not be loaded. Your saved photos are unchanged.',true);return;}

    let approvedCount = 0;
    if (renderId !== this.studioRenderId || !this.canRenderAdmin(view)) return;
    let studioMasterCount = 0;
    let rawOriginalCount = 0;

    dishes.forEach(d => {
      const rec = overrides[d.id];
      if (rec) {
        if (rec.enhancementStatus === 'approved') approvedCount++;
        else if (['enhanced', 'natural'].includes(rec.enhancementStatus)) studioMasterCount++;
        else if (rec.enhancementStatus === 'original') rawOriginalCount++;
      } else if (d.image) {
        studioMasterCount++;
      }
    });

    container.innerHTML = `
      <div class="hp-inline-31cc15eda300">
        <div class="hp-inline-5b25aaafec70">
          <div class="hp-inline-48e15f2022cb">
            <div>
              <div class="hp-inline-1cecbf93fb57">
                ✨ HOTEL PREMIER CULINARY PHOTOGRAPHY ENGINE
              </div>
              <h3 class="hp-inline-76156c7b9d6c">
                Local Photo Enhancement
              </h3>
              <p class="hp-inline-8116afbbd360">
                Refine your own photographs on this device. Compare the preview, preserve the dish colours, and save only the results you approve. Background treatments are local effects; cloud image generation is disabled.
              </p>
            </div>
            <div class="hp-inline-a5afbd001684">
              <button type="button" id="batch-photo-start" class="btn-theme-engine-chip active hp-inline-64b3127e963e" ${this.batchRun?'disabled':''} onclick="window.admin.batchCalibrateAllDishes()">
                ⚡ Auto-Enhance All Dishes (${withPhotos.length})
              </button>
              <button type="button" id="batch-photo-stop" class="btn-theme-engine-chip" ${this.batchRun?'':'hidden'} onclick="window.admin.cancelBatchCalibration()">Stop batch</button>
              <p id="batch-photo-status" role="status" aria-live="polite">${this.batchRun?'Photo processing is running.':'Photos are saved only after each preview is successfully stored.'}</p>
            </div>
          </div>

          <!-- Studio KPI Statistics -->
          <div class="hp-inline-752a2434d948">
            <div class="hp-inline-5a2097e5172c">
              <div class="hp-inline-5ba4e2cfc529">${withPhotos.length} / ${dishes.length}</div>
              <div class="hp-inline-df830d40a623">Photos Assigned</div>
            </div>
            <div class="hp-inline-9f31e974b24e">
              <div class="hp-inline-5ba4e2cfc529">${studioMasterCount}</div>
              <div class="hp-inline-df830d40a623">Studio Masters</div>
            </div>
            <div class="hp-inline-9eb77b2a92bb">
              <div class="hp-inline-5ba4e2cfc529">${approvedCount}</div>
              <div class="hp-inline-df830d40a623">Approved Masters</div>
            </div>
            <div class="hp-inline-a8904a177abe">
              <div class="hp-inline-5ba4e2cfc529">${withoutPhotos.length}</div>
              <div class="hp-inline-df830d40a623">Awaiting Photos</div>
            </div>
          </div>
        </div>

        <!-- Studio Global Brand Surface Policy -->
        <div class="hp-inline-8c4dcb1fa279">
          <div class="hp-inline-91f70b3c0af0">
            <div>
              <div class="hp-inline-974e4b5f1ab3">
                <span>&#x2699;&#xFE0F;</span> <span>Signature Default Studio Surface</span>
              </div>
              <div class="hp-inline-8bdb9af2323b">New food uploads and batch calibrations will default to this luxury surface backdrop.</div>
            </div>
            <div class="hp-inline-d8c16219b6c4">
              <select id="ai-setting-surface" class="form-select hp-inline-8d19c5bdc9c7" onchange="window.admin.saveAIStudioSettings()">
                <option value="slate_gold" ${settings.defaultStyle === 'slate_gold' ? 'selected' : ''}>Midnight Slate & Imperial Gold (Brand Signature)</option>
                <option value="teak_wood" ${settings.defaultStyle === 'teak_wood' ? 'selected' : ''}>Warm Teak & Walnut Wood (Breads & Snacks)</option>
                <option value="cream_marble" ${settings.defaultStyle === 'cream_marble' ? 'selected' : ''}>Refined Italian Cream Marble (Beverages & Desserts)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="hp-inline-91f70b3c0af0">
          <div class="hp-inline-a5afbd001684">
            <button class="btn-theme-engine-chip active" id="studio-filter-all" onclick="window.admin.filterStudioGallery('all', this)">All Dishes (${dishes.length})</button>
            <button class="btn-theme-engine-chip" id="studio-filter-photos" onclick="window.admin.filterStudioGallery('with-photos', this)">With Photos (${withPhotos.length})</button>
            <button class="btn-theme-engine-chip" id="studio-filter-missing" onclick="window.admin.filterStudioGallery('missing-photos', this)">Needs Photo (${withoutPhotos.length})</button>
          </div>
          <button type="button" class="studio-button" onclick="window.admin.switchTab('slides')">Section photos & captions</button>
          <input type="text" placeholder="Search dishes..." class="form-input hp-inline-98d204a2469b" oninput="window.admin.searchStudioGallery(this.value)">
        </div>

        <!-- Gallery Grid -->
        <div class="hp-inline-4906e552c7c7" id="studio-dishes-grid">
          ${dishes.filter(dish => !dish.groupedUnder).map(dish => {
            const hasPhoto = dish.image && dish.image.trim() !== '';
            const rec = overrides[dish.id];
            const status = rec ? rec.enhancementStatus : (hasPhoto ? 'enhanced' : 'none');
            const score = rec ? rec.qualityScore : (hasPhoto ? 92 : null);

            return `
              <div class="studio-card-item hp-inline-4c736bb27469" data-has-photo="${hasPhoto ? '1' : '0'}" data-name="${dish.name.toLowerCase()}">
                <div class="hp-inline-ae1dc0da875b" onclick="window.admin.openImageModal('${dish.id}')">
                  ${hasPhoto ? `
                    <img height="900" width="1200" class="hp-inline-059ba7fa4870" src="${dish.image}" loading="lazy" decoding="async" alt="${dish.name}">
                    <span class="hp-status-pill hp-status-${status} hp-inline-26e0eee5872e">
                      ${status.toUpperCase()}${score ? ` (${score}%)` : ''}
                    </span>
                  ` : `
                    <div class="hp-inline-43948df75e15">
                      <span class="hp-inline-2319a2f6b70f">🌱</span>
                      <span class="hp-inline-e4892ccc9e68">No Photo</span>
                      <span class="hp-inline-f4d2f8fd9709">Tap to upload & calibrate</span>
                    </div>
                  `}
                  <button type="button" class="btn-detail-photo-action hp-inline-d33b2c980050" onclick="event.stopPropagation(); window.admin.openImageModal('${dish.id}')">
                    ${hasPhoto ? '✨ Studio A/B' : '📷 Upload'}
                  </button>
                </div>
                <div class="hp-inline-b67bd2e3f7d8">
                  <div>
                    <div class="hp-inline-0642912a45ab">${dish.categoryId}</div>
                    <div class="hp-inline-e7053b285727">${dish.name}</div>
                  </div>
                  <div class="hp-inline-177dffe40709">
                    <span class="hp-inline-df839eb48ba8">${dish.price === null ? 'Price on request' : `₹${dish.price}`}</span>
                    <button class="slide-action-btn hp-inline-a0c14f726dbd" onclick="window.admin.openImageModal('${dish.id}')">Calibrate ⚙️</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  filterStudioGallery(filterType, btn) {
    if (btn && btn.parentElement) {
      btn.parentElement.querySelectorAll('.btn-theme-engine-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    const cards = document.querySelectorAll('.studio-card-item');
    cards.forEach(c => {
      const hasPhoto = c.getAttribute('data-has-photo') === '1';
      if (filterType === 'all') c.style.display = 'flex';
      else if (filterType === 'with-photos') c.style.display = hasPhoto ? 'flex' : 'none';
      else if (filterType === 'missing-photos') c.style.display = !hasPhoto ? 'flex' : 'none';
    });
  }

  searchStudioGallery(query) {
    const q = query.trim().toLowerCase();
    const cards = document.querySelectorAll('.studio-card-item');
    cards.forEach(c => {
      const name = c.getAttribute('data-name') || '';
      c.style.display = name.includes(q) ? 'flex' : 'none';
    });
  }

  updateBatchStatus(run,message='') {
    const status=document.getElementById('batch-photo-status');
    if(status)status.textContent=message || (run.cancelled?'Stopping after the current preview. ':'')+run.processed+' saved, '+run.failed+' failed, '+run.skipped+' skipped, '+run.total+' total.';
    const start=document.getElementById('batch-photo-start'),stop=document.getElementById('batch-photo-stop');
    if(start)start.disabled=Boolean(this.batchRun);
    if(stop){stop.hidden=!this.batchRun;stop.disabled=Boolean(run.cancelled);}
  }

  cancelBatchCalibration() {
    if(!this.batchRun)return;
    this.batchRun.cancelled=true;
    this.updateBatchStatus(this.batchRun);
  }

  async batchCalibrateAllDishes() {
    if(!this.isAuthenticated || this.batchRun || this.batchConfirming)return;
    const dishes=(window.app.menuData||[]).filter(d=>d.image&&d.image.trim());
    if(!dishes.length){window.app.showToast('No dishes currently have photos to refine.','info');return;}
    const storage=window.HOTEL_STORAGE,engine=window.AssetPipeline;
    if(!storage?.saveDishPhotoLifecycle||!engine?.processAutomaticStudioEnhancement){window.app.showToast('Photo tools are unavailable. Reload and retry.','error');return;}
    this.batchConfirming=true;
    let approved=false;
    try{approved=await window.HotelDialogs.confirm('Prepare local previews for '+dishes.length+' dishes? Original photos and colours are preserved. Each result is saved only after storage confirms it. You can stop the remaining work.');}
    finally{this.batchConfirming=false;}
    if(!approved || !this.isAuthenticated)return;
    const run={processed:0,failed:0,skipped:0,total:dishes.length,cancelled:false};this.batchRun=run;
    this.updateBatchStatus(run);
    try {
      for(const dish of dishes) {
        if(run.cancelled || !this.isAuthenticated){run.cancelled=true;break;}
        let preview;
        const imageBefore=dish.image;
        try {
          const record=await storage.getDishOverride(dish.id);
          if(run.cancelled || !this.isAuthenticated){run.cancelled=true;break;}
          const rawOriginalImage=record?.rawOriginalImage||dish.image;
          preview=await engine.processAutomaticStudioEnhancement(rawOriginalImage,dish,{backgroundMode:'natural',framingMode:'smart',enhanceColors:false});
          if(run.cancelled || !this.isAuthenticated){run.cancelled=true;break;}
          if(!preview?.enhancedDataUrl)throw Error('No preview was produced.');
          const current=window.app.menuData.find(item=>item.id===dish.id);
          if(current!==dish || current.image!==imageBefore){run.skipped++;this.updateBatchStatus(run);continue;}
          const saved=await storage.saveDishPhotoLifecycle(dish.id,{image:preview.enhancedDataUrl,enhancedMasterImage:preview.enhancedDataUrl,rawOriginalImage,enhancementStatus:preview.status||'natural',qualityScore:preview.qualityScore??0,backgroundType:'natural',styleVersion:'hp-studio-v3.0'},{expectedRevision:record?.revision||record?.updatedAt||null});
          if(!saved?.image)throw Error('Photo storage did not confirm the saved image.');
          dish.image=saved.image;
          run.processed++;
        }catch(error){if(error.code==='PHOTO_CHANGED')run.skipped++;else run.failed++;console.warn('A batch photo could not be saved:',error.message);}
        finally{if(preview?.enhancedDataUrl&&preview.enhancedDataUrl!==dish.image)window.HotelPhotoWorkflow?.release(preview.enhancedDataUrl);}
        this.updateBatchStatus(run);
      }
      if(run.processed){window.app.saveMenuData();window.app.renderCategoryCards();window.app.renderMenu();}
    }finally{
      if(this.batchRun===run)this.batchRun=null;
      if(this.isAuthenticated&&this.currentTab==='ai-studio')try{await this.renderAIStudioManager(document.getElementById('admin-tab-content'));}catch(error){console.warn('The gallery could not refresh:',error.message);}
      const message=(run.cancelled?'Batch stopped. ':'Batch finished. ')+run.processed+' photos saved; '+run.failed+' failed; '+run.skipped+' skipped. Earlier saved photos are kept.';
      this.updateBatchStatus(run,message);
      window.app.showToast(message,run.failed?'warning':'info');
    }
  }

  // ==================== 2. ROOMS & TARIFF CMS & MULTI-PHOTO GALLERIES ====================
  async renderRoomsManager(container) {
    const view=this.beginAdminRender('rooms',container,'Loading room photographs…');if(!view)return;
    const rooms = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories) 
      ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories 
      : [];

    const bulkDeals = this.getBulkDeals();

    // Fetch live galleries and tariff overrides for each room
    const liveGalleries = {};
    for (const r of rooms) {
      const defaultImgs = (r.images && r.images.length > 0) ? r.images : [r.image];
      if (window.HOTEL_STORAGE) {
        try{liveGalleries[r.id] = await window.HOTEL_STORAGE.getRoomGallery(r.id, defaultImgs);}catch(_){this.showAdminRenderStatus(view,'Room photographs could not be loaded. Your saved galleries are unchanged.',true);return;}
      } else {
        liveGalleries[r.id] = defaultImgs;
      }
      if(!this.canRenderAdmin(view))return;
    }

    if(!this.canRenderAdmin(view))return;
    container.innerHTML = `
      <div class="hp-inline-4933c08820a9">
        <h4 class="hp-inline-2c9a95716cba">Hotel Premier Room Multi-Photo & Deals Manager</h4>
        <p class="hp-inline-36710daa019c">
          Total Inventory: <strong>14 AC Rooms</strong> (2 Royale King + 4 Signature Queen + 8 Companion Twin). Reorder, replace or add photos, update tariffs, and customize group packages. Saves apply to this browser; export a backup for publishing.
        </p>
      </div>

      <!-- Room Multi-Photo Cards Grid -->
      <div class="hp-inline-8572d3e26f66">
        ${rooms.map(room => {
          const gallery = liveGalleries[room.id] || [room.image];
          return `
            <div class="hp-inline-fbca957215f4">
              <div class="hp-inline-383f76fc920a">
                <div class="hp-inline-cbe46b2a5ef9">
                  <h5 class="hp-inline-cf3d2f440ac3">${room.name}</h5>
                  <span class="hp-inline-924769c4cbd6">${room.inventoryCount || ''}</span>
                </div>
                <div class="hp-inline-cbdc2b8b6db9">${room.bedType}</div>
              </div>

              <div class="hp-inline-d2922e99177e">
                <div class="hp-inline-3490dbc8a70a">
                  <span class="hp-inline-0f97100e2388">Room Slideshow Photos (${gallery.length})</span>
                  <button class="btn-primary hp-inline-0dc86974fb05" onclick="window.admin.openAddRoomPhotoModal('${room.id}')">
                    ➕ Add Photo
                  </button>
                </div>

                <!-- Thumbnails Gallery with Reorder, Replace & Cover Controls -->
                <div class="hp-inline-c75e7cb77e1d">
                  ${gallery.map((imgUrl, idx) => `
                    <div class="admin-tariff-plan ${idx===0?'admin-plan-primary':''}">
                      <div class="hp-inline-60698e97026a">
                        <img height="900" width="1200" class="hp-inline-059ba7fa4870" src="${imgUrl}" onerror="this.src='${room.image}'">
                        ${idx === 0 ? '<span class="hp-inline-4e2dc388b867">👑 COVER</span>' : ''}
                        <button class="hp-inline-501b92e084e0" onclick="window.admin.removeRoomPhoto('${room.id}', ${idx})" title="Delete this photo">✕</button>
                      </div>
                      <div class="hp-inline-30fc55c0be70">
                        <button class="slide-action-btn hp-inline-4001ac55971b" onclick="window.admin.openReplaceRoomPhotoModal('${room.id}', ${idx})" title="Change / Replace this photo">✏️ Replace</button>
                        ${idx > 0 ? `<button class="slide-action-btn hp-inline-4001ac55971b" onclick="window.admin.setRoomCoverPhoto('${room.id}', ${idx})" title="Make this cover photo">⭐ Cover</button>` : ''}
                        <div class="hp-inline-b22ee81459ed">
                          ${idx > 0 ? `<button class="slide-action-btn hp-inline-28c1816e14be" onclick="window.admin.moveRoomPhoto('${room.id}', ${idx}, -1)" title="Move Left">◀</button>` : ''}
                          ${idx < gallery.length - 1 ? `<button class="slide-action-btn hp-inline-28c1816e14be" onclick="window.admin.moveRoomPhoto('${room.id}', ${idx}, 1)" title="Move Right">▶</button>` : ''}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- Editable Room Tariffs -->
                <div class="hp-inline-4b32625d1bf7">
                  <div class="hp-inline-7ba7bc9ead12">Room Tariffs (Editable):</div>
                  <div class="hp-inline-61b90e9aec87">
                    <div>
                      <label class="form-label hp-inline-08724256bd38">Single RO (₹)</label>
                      <input type="number" id="room-s-ro-${room.id}" value="${room.tariff.single.roomOnly}" class="form-input hp-inline-ec996e1788fd">
                    </div>
                    <div>
                      <label class="form-label hp-inline-08724256bd38">Single CP (₹)</label>
                      <input type="number" id="room-s-cp-${room.id}" value="${room.tariff.single.withBreakfast}" class="form-input hp-inline-ec996e1788fd">
                    </div>
                    <div>
                      <label class="form-label hp-inline-08724256bd38">Double RO (₹)</label>
                      <input type="number" id="room-d-ro-${room.id}" value="${room.tariff.double.roomOnly}" class="form-input hp-inline-ec996e1788fd">
                    </div>
                    <div>
                      <label class="form-label hp-inline-08724256bd38">Double CP (₹)</label>
                      <input type="number" id="room-d-cp-${room.id}" value="${room.tariff.double.withBreakfast}" class="form-input hp-inline-ec996e1788fd">
                    </div>
                  </div>
                  <button class="slide-action-btn primary hp-inline-213b0c49f5cd" onclick="window.admin.saveRoomTariff('${room.id}')">
                    💾 Save ${room.name} Tariffs
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- ==================== EDITABLE BULK BOOKING DEALS CMS ==================== -->
      <div class="hp-inline-4e0577ca521a">
        <div class="hp-inline-0cf56f0842f3">
          <div>
            <h4 class="hp-inline-318c6b8f9c0f">💍 Edit Advance Bulk Marriage & Event Deals</h4>
            <p class="hp-inline-2c165704a5e0">
              Customize package names, discount percentages, and perks for wedding blocks & full property buyouts.
            </p>
          </div>
          <button class="btn-secondary hp-inline-7bd781743f0d" onclick="window.admin.resetBulkDealsToDefault()">
            🔄 Reset to Defaults
          </button>
        </div>

        <div class="hp-inline-ff69c307f153" id="admin-bulk-deals-list">
          ${bulkDeals.map((deal, idx) => `
            <div class="hp-inline-ed39fbbc4337">
              <div class="hp-inline-2fea27887dd4">
                <div>
                  <label class="form-label">Tier Name</label>
                  <input type="text" id="bulk-deal-name-${idx}" value="${deal.name}" class="form-input hp-inline-b66f3e0ad60e">
                </div>
                <div>
                  <label class="form-label">Discount (%)</label>
                  <input type="number" id="bulk-deal-disc-${idx}" value="${deal.discountPercent}" class="form-input hp-inline-43d98570a61b">
                </div>
                <div>
                  <label class="form-label">Min Rooms</label>
                  <input type="number" id="bulk-deal-min-${idx}" value="${deal.minRooms}" min="1" max="12" step="1" class="form-input hp-inline-b66f3e0ad60e">
                </div>
              </div>
              <div class="hp-inline-93e5d15d24f6">
                <label class="form-label">Badge Tag</label>
                <input type="text" id="bulk-deal-badge-${idx}" value="${deal.badge}" class="form-input hp-inline-b66f3e0ad60e">
              </div>
              <div>
                <label class="form-label">Perks & Inclusions (One per line)</label>
                <textarea id="bulk-deal-perks-${idx}" class="form-textarea hp-inline-0a0d7006d78e" rows="3">${(deal.perks || []).join('\n')}</textarea>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="hp-inline-a3f52d3c9c9c">
          <button class="btn-primary hp-inline-514da3b26a67" onclick="window.admin.saveBulkDeals()">
            💾 Save Bulk Booking Deals
          </button>
        </div>
      </div>
    `;
  }

  async saveRoomTariff(roomId) {
    const sRO = parseFloat(document.getElementById(`room-s-ro-${roomId}`).value) || 0;
    const sCP = parseFloat(document.getElementById(`room-s-cp-${roomId}`).value) || 0;
    const dRO = parseFloat(document.getElementById(`room-d-ro-${roomId}`).value) || 0;
    const dCP = parseFloat(document.getElementById(`room-d-cp-${roomId}`).value) || 0;

    const rooms = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories) ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories : [];
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      room.tariff.single.roomOnly = sRO;
      room.tariff.single.withBreakfast = sCP;
      room.tariff.double.roomOnly = dRO;
      room.tariff.double.withBreakfast = dCP;

      try {
        let roomOverrides = {};
        const saved = localStorage.getItem('hotel_premier_room_overrides');
        if (saved) roomOverrides = JSON.parse(saved);
        if (!roomOverrides[roomId]) roomOverrides[roomId] = {};
        roomOverrides[roomId].tariff = room.tariff;
        localStorage.setItem('hotel_premier_room_overrides', JSON.stringify(roomOverrides));
      } catch (e) {}

      if (window.app && typeof window.app.calculateBulkQuote === 'function') {
        window.app.calculateBulkQuote();
      }
      window.app.showToast(`Updated tariffs for ${room.name}!`, 'success');
    }
  }

  openReplaceRoomPhotoModal(roomId, index) {
    if(!this.isAuthenticated)return;
    this.activeRoomId = roomId;
    this.activeRoomPhotoIndex = index;
    const rooms = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories) ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories : [];
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const currentImg = (window.app && window.app.roomGalleries && window.app.roomGalleries[roomId]) 
      ? window.app.roomGalleries[roomId][index] 
      : room.image;

    this.tempImageSource = currentImg;
    const titleEl = document.getElementById('image-modal-dish-name');
    if (titleEl) titleEl.innerText = `Replace Photo #${index + 1}: ${room.name}`;

    const body = document.getElementById('image-modal-body');
    if (body) {
      body.innerHTML = `
        <div class="hp-inline-ff69c307f153">
          <div class="hp-inline-fb5ec070f2bf">
            <div class="hp-inline-783bdb778c85">
              <img height="900" width="1200" class="hp-inline-059ba7fa4870" id="image-preview-element" src="${currentImg}">
            </div>
            <span class="hp-inline-cce8e0fdaf9d">Current Photo Preview</span>
          </div>

          <div>
            <label class="form-label">Option 1: Upload Photo from Phone / Camera</label>
            <input type="file" accept="image/*" class="form-input hp-inline-847ff70267ce" onchange="window.admin.handleRoomImageUpload(this)">
          </div>

          <div>
            <label class="form-label">Option 2: Paste Web Image URL</label>
            <input type="text" id="image-url-input-field" class="form-input" value="${currentImg.startsWith('data:') ? '(Uploaded Local Photo)' : currentImg}" placeholder="https://..." oninput="window.admin.updatePreviewFromUrl(this.value)">
          </div>

          <div>
            <label class="form-label">Option 3: Choose Curated HD Room Preset</label>
            <div class="preset-image-grid">
              ${this.roomPresets.map(preset => `
                <div class="preset-image-item" onclick="window.admin.selectPresetImage('${preset.url}')" title="${preset.name}">
                  <img height="900" width="1200" src="${preset.url}" alt="${preset.name}">
                  <div class="preset-label">${preset.name}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="hp-inline-4ad9f1568ce9">
            <button class="btn-secondary" onclick="window.admin.closeImageModal()">Cancel</button>
            <button class="btn-primary" onclick="window.admin.saveReplacedRoomPhoto()">Apply Replaced Photo</button>
          </div>
        </div>
      `;
    }

    const modal = document.getElementById('image-replace-modal');
    if (modal) modal.classList.add('active');
  }

  async saveReplacedRoomPhoto() {
    if(!this.isAuthenticated||this.photoUploadPending){window.app.showToast('Wait for the photo preview to finish, then save.','info');return;}
    if (!this.activeRoomId || this.activeRoomPhotoIndex === null || !this.tempImageSource) return;

    const roomId = this.activeRoomId;
    const index = this.activeRoomPhotoIndex;

    const rooms = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories) ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories : [];
    const room = rooms.find(r => r.id === roomId);
    const defaultImgs = (room && room.images) ? room.images : [];

    let currentGallery = defaultImgs;
    if (window.HOTEL_STORAGE) {
      currentGallery = await window.HOTEL_STORAGE.getRoomGallery(roomId, defaultImgs);
    }

    const updatedGallery = [...currentGallery];
    updatedGallery[index] = this.tempImageSource;

    if (window.HOTEL_STORAGE) {
      await window.HOTEL_STORAGE.saveRoomGallery(roomId, updatedGallery);
    }

    if (window.app && typeof window.app.renderRoomCarousels === 'function') {
      await window.app.renderRoomCarousels();
    }

    this.closeImageModal();
    if (this.currentTab === 'rooms') {
      this.renderRoomsManager(document.getElementById('admin-tab-content'));
    }
    window.app.showToast('Room photo updated successfully!', 'success');
  }

  async setRoomCoverPhoto(roomId, index) {
    const rooms = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories) ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories : [];
    const room = rooms.find(r => r.id === roomId);
    const defaultImgs = (room && room.images) ? room.images : [];

    let currentGallery = defaultImgs;
    if (window.HOTEL_STORAGE) {
      currentGallery = await window.HOTEL_STORAGE.getRoomGallery(roomId, defaultImgs);
    }

    if (index > 0 && index < currentGallery.length) {
      const selected = currentGallery[index];
      const remaining = currentGallery.filter((_, i) => i !== index);
      const updatedGallery = [selected, ...remaining];

      if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveRoomGallery(roomId, updatedGallery);
      }
      if (window.app && typeof window.app.renderRoomCarousels === 'function') {
        await window.app.renderRoomCarousels();
      }
      if (this.currentTab === 'rooms') {
        this.renderRoomsManager(document.getElementById('admin-tab-content'));
      }
      window.app.showToast('Selected photo is now the COVER photo!', 'success');
    }
  }

  async moveRoomPhoto(roomId, index, direction) {
    const rooms = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories) ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories : [];
    const room = rooms.find(r => r.id === roomId);
    const defaultImgs = (room && room.images) ? room.images : [];

    let currentGallery = defaultImgs;
    if (window.HOTEL_STORAGE) {
      currentGallery = await window.HOTEL_STORAGE.getRoomGallery(roomId, defaultImgs);
    }

    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= currentGallery.length) return;

    const updatedGallery = [...currentGallery];
    const temp = updatedGallery[index];
    updatedGallery[index] = updatedGallery[targetIdx];
    updatedGallery[targetIdx] = temp;

    if (window.HOTEL_STORAGE) {
      await window.HOTEL_STORAGE.saveRoomGallery(roomId, updatedGallery);
    }
    if (window.app && typeof window.app.renderRoomCarousels === 'function') {
      await window.app.renderRoomCarousels();
    }
    if (this.currentTab === 'rooms') {
      this.renderRoomsManager(document.getElementById('admin-tab-content'));
    }
  }

  openAddRoomPhotoModal(roomId) {
    if(!this.isAuthenticated)return;
    this.activeRoomId = roomId;
    this.activeRoomPhotoIndex = null;
    const rooms = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories) ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories : [];
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    this.tempImageSource = '';
    const titleEl = document.getElementById('image-modal-dish-name');
    if (titleEl) titleEl.innerText = `Add Slide Photo: ${room.name}`;

    const body = document.getElementById('image-modal-body');
    if (body) {
      body.innerHTML = `
        <div class="hp-inline-ff69c307f153">
          <div class="hp-inline-fb5ec070f2bf">
            <div class="hp-inline-783bdb778c85">
              <img height="900" width="1200" class="hp-inline-059ba7fa4870" id="image-preview-element" src="${room.image}">
            </div>
            <span class="hp-inline-cce8e0fdaf9d">Photo Preview to Add</span>
          </div>

          <div>
            <label class="form-label">Option 1: Upload Room Photo from Phone / Camera</label>
            <input type="file" accept="image/*" class="form-input hp-inline-847ff70267ce" onchange="window.admin.handleRoomImageUpload(this)">
          </div>

          <div>
            <label class="form-label">Option 2: Paste Room Image URL</label>
            <input type="text" id="image-url-input-field" class="form-input" placeholder="https://..." oninput="window.admin.updatePreviewFromUrl(this.value)">
          </div>

          <div>
            <label class="form-label">Option 3: Choose Curated HD Room Preset</label>
            <div class="preset-image-grid">
              ${this.roomPresets.map(preset => `
                <div class="preset-image-item" onclick="window.admin.selectPresetImage('${preset.url}')" title="${preset.name}">
                  <img height="900" width="1200" src="${preset.url}" alt="${preset.name}">
                  <div class="preset-label">${preset.name}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="hp-inline-4ad9f1568ce9">
            <button class="btn-secondary" onclick="window.admin.closeImageModal()">Cancel</button>
            <button class="btn-primary" onclick="window.admin.saveNewRoomPhoto()">Add Photo to Room</button>
          </div>
        </div>
      `;
    }

    const modal = document.getElementById('image-replace-modal');
    if (modal) modal.classList.add('active');
  }

  async handleRoomImageUpload(input) {
    const file = input.files[0];
    if (!file) return;

    try {
      window.app.showToast('Optimizing room photo...', 'info');
      const compressed = await this.compressAndResizeImage(file);
      this.tempImageSource = compressed;
      const preview = document.getElementById('image-preview-element');
      const urlInput = document.getElementById('image-url-input-field');
      if (preview) preview.src = this.tempImageSource;
      if (urlInput) urlInput.value = '(Uploaded Local Photo - Ready to Save)';
      window.app.showToast('Photo ready! Click "Add Photo to Room".', 'success');
    } catch (err) {
      if(err.name!=='AbortError')window.app.showToast('Failed to process room photo: ' + err.message);
    }
  }

  async saveNewRoomPhoto() {
    if(!this.isAuthenticated||this.photoUploadPending){window.app.showToast('Wait for the photo preview to finish, then save.','info');return;}
    if (!this.activeRoomId || !this.tempImageSource) {
      window.app.showToast('Please choose or upload a photo first.');
      return;
    }
    const roomId=this.activeRoomId,image=this.tempImageSource,session=this.adminSessionGeneration||0,view=this.adminViewGeneration||0,request=this.previewRequestId||0;
    const current=()=>this.isAuthenticated&&this.activeRoomId===roomId&&session===(this.adminSessionGeneration||0)&&view===(this.adminViewGeneration||0)&&request===(this.previewRequestId||0);

    const rooms = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories) ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories : [];
    const room = rooms.find(r => r.id === roomId);
    const defaultImgs = (room && room.images) ? room.images : [];

    let currentGallery = defaultImgs;
    if (window.HOTEL_STORAGE) {
      currentGallery = await window.HOTEL_STORAGE.getRoomGallery(roomId, defaultImgs);
    }

    if(!current())return;
    const updatedGallery = [...currentGallery, image];

    if (window.HOTEL_STORAGE) {
      await window.HOTEL_STORAGE.saveRoomGallery(roomId, updatedGallery);
    }

    if (window.app && typeof window.app.renderRoomCarousels === 'function') {
      await window.app.renderRoomCarousels();
    }

    if(!current())return;
    this.closeImageModal();
    if (this.currentTab === 'rooms') {
      this.renderRoomsManager(document.getElementById('admin-tab-content'));
    }
    window.app.showToast('Photo added to Room slideshow successfully!', 'success');
  }

  async removeRoomPhoto(roomId, index) {
    const rooms = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories) ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories : [];
    const room = rooms.find(r => r.id === roomId);
    const defaultImgs = (room && room.images) ? room.images : [];

    let currentGallery = defaultImgs;
    if (window.HOTEL_STORAGE) {
      currentGallery = await window.HOTEL_STORAGE.getRoomGallery(roomId, defaultImgs);
    }

    if (currentGallery.length <= 1) {
      window.app.showToast('You must keep at least 1 photo for this room.');
      return;
    }

    if (await window.HotelDialogs.confirm('Delete this photo from room slide show?')) {
      const updatedGallery = currentGallery.filter((_, idx) => idx !== index);
      if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveRoomGallery(roomId, updatedGallery);
      }
      if (window.app && typeof window.app.renderRoomCarousels === 'function') {
        await window.app.renderRoomCarousels();
      }
      if (this.currentTab === 'rooms') {
        this.renderRoomsManager(document.getElementById('admin-tab-content'));
      }
      window.app.showToast('Photo removed from room.', 'info');
    }
  }

  getBulkDeals() {
    if (window.app?.getBulkDeals) return window.app.getBulkDeals();
    try {
      const saved = localStorage.getItem('hotel_premier_bulk_deals_override');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.bulkMarriageDeals)
      ? JSON.parse(JSON.stringify(window.HOTEL_PREMIER_HOTEL_DATA.bulkMarriageDeals))
      : [];
  }

  saveBulkDeals() {
    const deals = this.getBulkDeals();
    deals.forEach((deal, idx) => {
      const nameEl = document.getElementById(`bulk-deal-name-${idx}`);
      const discEl = document.getElementById(`bulk-deal-disc-${idx}`);
      const minEl = document.getElementById(`bulk-deal-min-${idx}`);
      const badgeEl = document.getElementById(`bulk-deal-badge-${idx}`);
      const perksEl = document.getElementById(`bulk-deal-perks-${idx}`);

      if (nameEl) deal.name = nameEl.value.trim();
      if (discEl) deal.discountPercent = parseFloat(discEl.value) || 0;
      if (minEl) deal.minRooms = parseInt(minEl.value) || 1;
      if (badgeEl) deal.badge = badgeEl.value.trim();
      if (perksEl) {
        deal.perks = perksEl.value.split('\n').map(p => p.trim()).filter(p => p.length > 0);
      }
    });

    if (deals.some(deal => !Number.isInteger(deal.minRooms) || deal.minRooms < 1 || deal.minRooms > 12 || /(?:all\s*14|full.property\s*buyout|10\s*[–-]\s*13|100%.*privacy)/i.test([deal.name,deal.badge,...(deal.perks || [])].join(' ')))) {
      window.app.showToast('Group accommodation is limited to 12 rooms and 36 guests, not a full-property buyout. Please correct the tier details.','warning');
      return;
    }

    localStorage.setItem('hotel_premier_bulk_deals_override', JSON.stringify(deals));
    if (window.app) {
      if (typeof window.app.renderBulkDealsSection === 'function') {
        window.app.renderBulkDealsSection();
      }
      if (typeof window.app.calculateBulkQuote === 'function') {
        window.app.calculateBulkQuote();
      }
    }
    window.app.showToast('Bulk Booking Deals saved permanently!', 'success');
  }

  async resetBulkDealsToDefault() {
    if (await window.HotelDialogs.confirm('Reset all bulk booking packages to original defaults?')) {
      localStorage.removeItem('hotel_premier_bulk_deals_override');
      this.renderRoomsManager(document.getElementById('admin-tab-content'));
      if (window.app) {
        if (typeof window.app.renderBulkDealsSection === 'function') {
          window.app.renderBulkDealsSection();
        }
        if (typeof window.app.calculateBulkQuote === 'function') {
          window.app.calculateBulkQuote();
        }
      }
      window.app.showToast('Bulk Deals reset to defaults.', 'info');
    }
  }

  // ==================== 3. EDITABLE SLIDES CMS (HERO & SUB-SECTIONS) ====================
  async renderSlidesManager(container) {
    const view=this.beginAdminRender('slides',container);if(!view)return;
    const categories = window.app.categories.filter(c => c.id !== 'all' && c.id !== 'chef-specials');
    if (!this.selectedCategoryForSlides && categories.length > 0) {
      this.selectedCategoryForSlides = categories[0].id;
    }

    container.innerHTML = `
      <div class="hp-inline-4933c08820a9">
        <div class="hp-inline-a6d4835d1954">
          <div>
            <h4 class="hp-inline-318c6b8f9c0f">Multi-Photo Slides Editor</h4>
            <p class="hp-inline-d3a2f6e902a3">
              Edit, replace images, customize titles/subtitles, and reorder slides across Restaurant Banner and Category Sub-Sections.
            </p>
          </div>
        </div>
      </div>

      <!-- Sub-Tabs: Hero Banner vs Sub-Section Slideshows -->
      <div class="slide-subnav-pills">
        <button class="slide-subnav-btn ${this.slidesSubTab === 'hero' ? 'active' : ''}" onclick="window.admin.setSlidesSubTab('hero')">
          🌟 Restaurant Main Hero Banner
        </button>
        <button class="slide-subnav-btn ${this.slidesSubTab === 'category' ? 'active' : ''}" onclick="window.admin.setSlidesSubTab('category')">
          🍲 Sub-Section Category Slideshows
        </button>
      </div>

      <div id="slide-subtab-container">
        <!-- Rendered dynamically below -->
      </div>
    `;

    const subtabContainer = document.getElementById('slide-subtab-container');
    if (this.slidesSubTab === 'hero') {
      await this.renderHeroSlidesCMS(subtabContainer);
    } else {
      await this.renderCategorySlidesCMS(subtabContainer, categories);
    }
  }

  setSlidesSubTab(tab) {
    this.slidesSubTab = tab;
    this.renderSlidesManager(document.getElementById('admin-tab-content'));
  }

  // 3A. HERO BANNER SLIDES CMS
  async renderHeroSlidesCMS(container) {
    const view=this.beginAdminRender('slides',container,'Loading restaurant banners…');if(!view)return;
    const defaultSlides = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides)
      ? window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides
      : [];

    let currentSlides = defaultSlides;
    if (window.HOTEL_STORAGE) {
      try{currentSlides = await window.HOTEL_STORAGE.getSectionSlides('restaurant_hero', defaultSlides);}catch(_){this.showAdminRenderStatus(view,'Restaurant banners could not be loaded. Your saved slides are unchanged.',true);return;}
    }

    if(!this.canRenderAdmin(view))return;
    container.innerHTML = `
      <div class="hp-inline-0cf56f0842f3">
        <span class="hp-inline-b5ba5eed138b">Main Restaurant Slides (${currentSlides.length})</span>
        <button class="btn-primary hp-inline-bff2ba508bb0" onclick="window.admin.openAddSlideModal()">
          ➕ Add New Hero Slide
        </button>
      </div>

      <div class="hp-inline-5ca3a744b509">
        ${currentSlides.map((slide, idx) => `
          <div class="slide-manage-card">
            <div class="slide-card-media">
              <img height="900" width="1200" class="hp-inline-059ba7fa4870" src="${slide.image}" onerror="this.src='assets/brand-placeholder.svg'">
              <span class="hp-inline-f041824a1785">SLIDE ${idx + 1}</span>
              <button class="hp-inline-141f9279a48d" onclick="window.admin.removeHeroSlide(${idx})" title="Delete this slide">✕</button>
            </div>
            <div class="hp-inline-e8056bac3adf">
              <div>
                <div class="hp-inline-8a60af77b8f2">${slide.title}</div>
                <div class="hp-inline-70873ac57437">${slide.subtitle}</div>
              </div>
              <div class="hp-inline-f85a890c8546">
                <button class="slide-action-btn primary" onclick="window.admin.openEditSlideModal('hero', 'restaurant_hero', ${idx})">
                  ✏️ Edit Slide Details
                </button>
                <div class="hp-inline-95e7b1fc4c0e">
                  ${idx > 0 ? `<button class="slide-action-btn" onclick="window.admin.moveHeroSlide(${idx}, -1)" title="Move Left">◀</button>` : ''}
                  ${idx < currentSlides.length - 1 ? `<button class="slide-action-btn" onclick="window.admin.moveHeroSlide(${idx}, 1)" title="Move Right">▶</button>` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 3B. CATEGORY SUB-SECTION SLIDES CMS
  async renderCategorySlidesCMS(container, categories) {
    const view=this.beginAdminRender('slides',container,'Loading collection slides…');if(!view)return;
    categories = categories.flatMap(category => [category, ...(window.HOTEL_PREMIER_SUB_CATEGORIES?.[category.id] || [])
      .filter(sub => sub.id !== 'all')
      .map(sub => ({...sub, id:`${category.id}::${sub.id}`, name:`${category.name} / ${sub.name}`}))]);
    const catId = this.selectedCategoryForSlides || (categories[0] ? categories[0].id : 'morning-delights');

    // Fetch custom slides or auto-derive from category dishes
    let currentSlides = null;
    if (window.HOTEL_STORAGE) {
      try{currentSlides = await window.HOTEL_STORAGE.getSectionSlides('category_' + catId, null);}catch(_){this.showAdminRenderStatus(view,'Collection slides could not be loaded. Your saved slides are unchanged.',true);return;}
    }

    if(!this.canRenderAdmin(view))return;
    if (!currentSlides || !Array.isArray(currentSlides) || currentSlides.length === 0) {
      const dishes = window.app.getSectionDishes(catId);
      currentSlides = dishes.map(d => ({
        id: d.id,
        dishId: d.id,
        name: d.name,
        title: d.name,
        price: d.price,
        image: d.image,
        badge: (d.tags && d.tags.includes('chef-special')) ? "👑 Chef's Special" : ((d.tags && d.tags.includes('bestseller')) ? "🔥 Bestseller" : "👑 SECTION HIGHLIGHT"),
        subtitle: d.description || '👆 Tap to view dish details & options'
      }));
    }

    container.innerHTML = `
      <div class="hp-inline-8c43b357e53f">
        <div class="hp-inline-91f70b3c0af0">
          <div class="hp-inline-d8ec4cd512cd">
            <label class="form-label hp-inline-99a69ac3de6c">Choose Sub-Section:</label>
            <select id="admin-category-slide-select" class="form-select hp-inline-2203347d0878" onchange="window.admin.changeCategorySlides(this.value)">
              ${categories.map(c => `<option value="${c.id}" ${c.id === catId ? 'selected' : ''}>${c.name} (${c.hindiName || ''})</option>`).join('')}
            </select>
          </div>
          <div class="hp-inline-a9c77021d675">
            <button class="slide-action-btn" onclick="window.admin.resetCategorySlidesToDishes('${catId}')" title="Reset this section to auto-derived dish photos">
              🔄 Reset to Dishes
            </button>
            <button class="btn-primary hp-inline-251214cb6461" onclick="window.admin.openAddCategorySlideModal('${catId}')">
              ➕ Add Slide to Section
            </button>
          </div>
        </div>
      </div>

      <div class="hp-inline-5ca3a744b509">
        ${currentSlides.map((slide, idx) => `
          <div class="slide-manage-card">
            <div class="slide-card-media">
              <img height="900" width="1200" class="hp-inline-059ba7fa4870" src="${slide.image}" onerror="this.src='assets/brand-placeholder.svg'">
              <span class="hp-inline-f041824a1785">${slide.badge || 'SLIDE ' + (idx + 1)}</span>
              ${slide.price !== undefined ? `<span class="hp-inline-3695e9ed5faa">₹${slide.price}/-</span>` : ''}
              <button class="hp-inline-141f9279a48d" onclick="window.admin.removeCategorySlide('${catId}', ${idx})" title="Remove this slide">✕</button>
            </div>
            <div class="hp-inline-e8056bac3adf">
              <div>
                <div class="hp-inline-8a60af77b8f2">${slide.title || slide.name}</div>
                <div class="hp-inline-70873ac57437">${slide.subtitle || ''}</div>
              </div>
              <div class="hp-inline-f85a890c8546">
                <button class="slide-action-btn primary" onclick="window.admin.openEditSlideModal('category', '${catId}', ${idx})">
                  ✏️ Edit Slide & Photo
                </button>
                <div class="hp-inline-95e7b1fc4c0e">
                  ${idx > 0 ? `<button class="slide-action-btn" onclick="window.admin.moveCategorySlide('${catId}', ${idx}, -1)" title="Move Up">▲</button>` : ''}
                  ${idx < currentSlides.length - 1 ? `<button class="slide-action-btn" onclick="window.admin.moveCategorySlide('${catId}', ${idx}, 1)" title="Move Down">▼</button>` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  changeCategorySlides(catId) {
    this.selectedCategoryForSlides = catId;
    this.renderSlidesManager(document.getElementById('admin-tab-content'));
  }

  // ==================== UNIFIED SLIDE EDIT & REORDER ACTIONS ====================
  async openEditSlideModal(type, targetId, slideIndex) {
    if(!this.isAuthenticated)return;
    const session=this.adminSessionGeneration||0,view=this.adminViewGeneration||0,request=this.previewRequestId=(this.previewRequestId||0)+1;
    const current=()=>this.isAuthenticated&&session===(this.adminSessionGeneration||0)&&view===(this.adminViewGeneration||0)&&request===this.previewRequestId;
    this.editingSlideContext = { type, targetId, slideIndex };

    let slide = null;
    if (type === 'hero') {
      const defaultSlides = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides) ? window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides : [];
      let slides = defaultSlides;
      if (window.HOTEL_STORAGE) {
        try{slides = await window.HOTEL_STORAGE.getSectionSlides('restaurant_hero', defaultSlides);}catch(_){if(current())window.app.showToast('This banner could not be loaded. Your saved slides are unchanged; please retry.','error');return;}
      }
      slide = slides[slideIndex];
    } else if (type === 'category') {
      let slides = null;
      if (window.HOTEL_STORAGE) {
        try{slides = await window.HOTEL_STORAGE.getSectionSlides('category_' + targetId, null);}catch(_){if(current())window.app.showToast('This collection slide could not be loaded. Your saved slides are unchanged; please retry.','error');return;}
      }
      if (!slides) {
        const dishes = window.app.getSectionDishes(targetId);
        slides = dishes.map(d => ({
          id: d.id,
          dishId: d.id,
          name: d.name,
          title: d.name,
          price: d.price,
          image: d.image,
          badge: (d.tags && d.tags.includes('chef-special')) ? "👑 Chef's Special" : "👑 SECTION HIGHLIGHT",
          subtitle: d.description || '👆 Tap to view dish details & options'
        }));
      }
      slide = slides[slideIndex];
    }

    if (!slide || !this.isAuthenticated || session!==(this.adminSessionGeneration||0) || view!==(this.adminViewGeneration||0) || request!==this.previewRequestId) return;

    this.tempImageSource = slide.image;
    const titleEl = document.getElementById('image-modal-dish-name');
    if (titleEl) titleEl.innerText = `Edit Slide: ${slide.title || slide.name || 'Slide ' + (slideIndex + 1)}`;

    const body = document.getElementById('image-modal-body');
    if (body) {
      body.innerHTML = `
        <div class="hp-inline-18809276c4d1">
          <div>
            <label class="form-label">Slide Main Title / Dish Name *</label>
            <input type="text" id="edit-slide-title" class="form-input" value="${slide.title || slide.name || ''}" placeholder="e.g. Special Pure Veg Handi">
          </div>

          ${type === 'category' ? `
            <div class="hp-inline-740ec417ea56">
              <div>
                <label class="form-label">Price (₹)</label>
                <input type="number" id="edit-slide-price" class="form-input" value="${slide.price !== undefined ? slide.price : ''}" placeholder="240">
              </div>
              <div>
                <label class="form-label">Badge Tag</label>
                <input type="text" id="edit-slide-badge" class="form-input" value="${slide.badge || '👑 SECTION HIGHLIGHT'}" placeholder="e.g. 🔥 Bestseller">
              </div>
            </div>
          ` : ''}

          <div>
            <label class="form-label">Slide Subtitle / Description</label>
            <input type="text" id="edit-slide-sub" class="form-input" value="${slide.subtitle || ''}" placeholder="e.g. Served fresh with unlimited sweets and desi ghee">
          </div>

          <div class="hp-inline-fb5ec070f2bf">
            <div class="hp-inline-e22a562d395b">
              <img height="900" width="1200" class="hp-inline-059ba7fa4870" id="image-preview-element" src="${slide.image}">
            </div>
            <span class="hp-inline-54c070391c85">Current Photo Preview</span>
          </div>

          <div>
            <label class="form-label">Option 1: Upload Photo from Phone / Camera</label>
            <input type="file" accept="image/*" class="form-input hp-inline-847ff70267ce" onchange="window.admin.handleHeroSlideUpload(this)">
          </div>

          <div>
            <label class="form-label">Option 2: Paste Web Image URL</label>
            <input type="text" id="image-url-input-field" class="form-input" value="${slide.image.startsWith('data:') ? '(Uploaded Local Photo)' : slide.image}" placeholder="https://..." oninput="window.admin.updatePreviewFromUrl(this.value)">
          </div>

          <div>
            <label class="form-label">Option 3: Choose Curated HD Food Preset</label>
            <div class="preset-image-grid hp-inline-59348a7fd19a">
              ${this.curatedPresets.map(preset => `
                <div class="preset-image-item" onclick="window.admin.selectPresetImage('${preset.url}')" title="${preset.name}">
                  <img height="900" width="1200" src="${preset.url}" alt="${preset.name}">
                  <div class="preset-label">${preset.name}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="hp-inline-4ad9f1568ce9">
            <button class="btn-secondary" onclick="window.admin.closeImageModal()">Cancel</button>
            <button class="btn-primary" onclick="window.admin.saveEditedSlide()">💾 Save Slide Changes</button>
          </div>
        </div>
      `;
    }

    const modal = document.getElementById('image-replace-modal');
    if (modal) modal.classList.add('active');
  }

  async saveEditedSlide() {
    if(!this.isAuthenticated||this.photoUploadPending){window.app.showToast('Wait for the photo preview to finish, then save.','info');return;}
    if (!this.editingSlideContext) return;
    const { type, targetId, slideIndex } = this.editingSlideContext;

    const title = (document.getElementById('edit-slide-title').value || '').trim();
    const sub = (document.getElementById('edit-slide-sub').value || '').trim();
    const priceEl = document.getElementById('edit-slide-price');
    const badgeEl = document.getElementById('edit-slide-badge');

    if (!title || !this.tempImageSource) {
      window.app.showToast('Please provide a title and select/upload an image.');
      return;
    }

    if (type === 'hero') {
      const defaultSlides = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides) ? window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides : [];
      let slides = defaultSlides;
      if (window.HOTEL_STORAGE) {
        slides = await window.HOTEL_STORAGE.getSectionSlides('restaurant_hero', defaultSlides);
      }
      if (slides[slideIndex]) {
        slides[slideIndex].title = title;
        slides[slideIndex].subtitle = sub;
        slides[slideIndex].image = this.tempImageSource;
      }
      if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveSectionSlides('restaurant_hero', slides);
      }
      if (window.app) {
        window.app.heroSlides = slides;
        window.app.renderHeroCarousel();
      }
    } else if (type === 'category') {
      let slides = null;
      if (window.HOTEL_STORAGE) {
        slides = await window.HOTEL_STORAGE.getSectionSlides('category_' + targetId, null);
      }
      if (!slides) {
        const dishes = window.app.getSectionDishes(targetId);
        slides = dishes.map(d => ({
          id: d.id,
          dishId: d.id,
          name: d.name,
          title: d.name,
          price: d.price,
          image: d.image,
          badge: (d.tags && d.tags.includes('chef-special')) ? "👑 Chef's Special" : "👑 SECTION HIGHLIGHT",
          subtitle: d.description || '👆 Tap to view dish details & options'
        }));
      }

      if (slides[slideIndex]) {
        slides[slideIndex].title = title;
        slides[slideIndex].name = title;
        slides[slideIndex].subtitle = sub;
        slides[slideIndex].image = this.tempImageSource;
        if (priceEl) slides[slideIndex].price = parseFloat(priceEl.value) || 0;
        if (badgeEl) slides[slideIndex].badge = badgeEl.value.trim() || '👑 SECTION HIGHLIGHT';
      }

      if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveSectionSlides('category_' + targetId, slides);
      }
      if (window.app) {
        await window.app.renderSectionSlideshow(targetId);
      }
    }

    this.closeImageModal();
    if (this.currentTab === 'slides') {
      this.renderSlidesManager(document.getElementById('admin-tab-content'));
    }
    window.app.showToast('Slide updated successfully!', 'success');
  }

  async moveHeroSlide(index, direction) {
    const defaultSlides = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides) ? window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides : [];
    let slides = defaultSlides;
    if (window.HOTEL_STORAGE) {
      slides = await window.HOTEL_STORAGE.getSectionSlides('restaurant_hero', defaultSlides);
    }

    const target = index + direction;
    if (target < 0 || target >= slides.length) return;

    const temp = slides[index];
    slides[index] = slides[target];
    slides[target] = temp;

    if (window.HOTEL_STORAGE) {
      await window.HOTEL_STORAGE.saveSectionSlides('restaurant_hero', slides);
    }
    if (window.app) {
      window.app.heroSlides = slides;
      window.app.renderHeroCarousel();
    }
    if (this.currentTab === 'slides') {
      this.renderSlidesManager(document.getElementById('admin-tab-content'));
    }
  }

  async removeHeroSlide(index) {
    const defaultSlides = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides) ? window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides : [];
    let slides = defaultSlides;
    if (window.HOTEL_STORAGE) {
      slides = await window.HOTEL_STORAGE.getSectionSlides('restaurant_hero', defaultSlides);
    }

    if (slides.length <= 1) {
      window.app.showToast('You must keep at least 1 hero banner slide.');
      return;
    }

    if (await window.HotelDialogs.confirm('Delete this slide from the main restaurant banner?')) {
      const updated = slides.filter((_, idx) => idx !== index);
      if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveSectionSlides('restaurant_hero', updated);
      }
      if (window.app) {
        window.app.heroSlides = updated;
        window.app.renderHeroCarousel();
      }
      if (this.currentTab === 'slides') {
        this.renderSlidesManager(document.getElementById('admin-tab-content'));
      }
      window.app.showToast('Hero slide removed.', 'info');
    }
  }

  openAddSlideModal() {
    if(!this.isAuthenticated)return;
    this.editingSlideContext = { type: 'add_hero', targetId: 'restaurant_hero' };
    this.tempImageSource = '';

    const titleEl = document.getElementById('image-modal-dish-name');
    if (titleEl) titleEl.innerText = 'Add New Restaurant Hero Banner Slide';

    const body = document.getElementById('image-modal-body');
    if (body) {
      body.innerHTML = `
        <div class="hp-inline-18809276c4d1">
          <div>
            <label class="form-label">Slide Main Heading *</label>
            <input type="text" id="new-hero-slide-title" class="form-input" placeholder="e.g. Authentic Khandeshi Delicacies & Unlimited Sweets">
          </div>

          <div>
            <label class="form-label">Slide Subtitle / Tagline</label>
            <input type="text" id="new-hero-slide-sub" class="form-input" placeholder="e.g. 100% Pure Vegetarian Pride • Since 2005">
          </div>

          <div class="hp-inline-fb5ec070f2bf">
            <div class="hp-inline-e22a562d395b">
              <img height="900" width="1200" class="hp-inline-059ba7fa4870" id="image-preview-element" src="assets/brand-placeholder.svg">
            </div>
            <span class="hp-inline-54c070391c85">Slide Image Preview</span>
          </div>

          <div>
            <label class="form-label">Option 1: Upload Photo from Phone / Camera</label>
            <input type="file" accept="image/*" class="form-input hp-inline-847ff70267ce" onchange="window.admin.handleHeroSlideUpload(this)">
          </div>

          <div>
            <label class="form-label">Option 2: Paste Web Image URL</label>
            <input type="text" id="image-url-input-field" class="form-input" placeholder="https://..." oninput="window.admin.updatePreviewFromUrl(this.value)">
          </div>

          <div>
            <label class="form-label">Option 3: Choose Curated HD Food Preset</label>
            <div class="preset-image-grid hp-inline-59348a7fd19a">
              ${this.curatedPresets.map(preset => `
                <div class="preset-image-item" onclick="window.admin.selectPresetImage('${preset.url}')" title="${preset.name}">
                  <img height="900" width="1200" src="${preset.url}" alt="${preset.name}">
                  <div class="preset-label">${preset.name}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="hp-inline-4ad9f1568ce9">
            <button class="btn-secondary" onclick="window.admin.closeImageModal()">Cancel</button>
            <button class="btn-primary" onclick="window.admin.saveNewHeroSlide()">Add Hero Slide</button>
          </div>
        </div>
      `;
    }

    const modal = document.getElementById('image-replace-modal');
    if (modal) modal.classList.add('active');
  }

  async handleHeroSlideUpload(input) {
    const file = input.files[0];
    if (!file) return;

    try {
      window.app.showToast('Optimizing slide photo...', 'info');
      const compressed = await this.compressAndResizeImage(file);
      this.tempImageSource = compressed;
      const preview = document.getElementById('image-preview-element');
      const urlInput = document.getElementById('image-url-input-field');
      if (preview) preview.src = this.tempImageSource;
      if (urlInput) urlInput.value = '(Uploaded Local Photo - Ready to Apply)';
      window.app.showToast('Photo ready! Click save to apply.', 'success');
    } catch (err) {
      if(err.name!=='AbortError')window.app.showToast('Failed to process image: ' + err.message);
    }
  }

  async saveNewHeroSlide() {
    if(!this.isAuthenticated||this.photoUploadPending){window.app.showToast('Wait for the photo preview to finish, then save.','info');return;}
    const title = (document.getElementById('new-hero-slide-title').value || '').trim();
    const sub = (document.getElementById('new-hero-slide-sub').value || '').trim();

    if (!title || !this.tempImageSource) {
      window.app.showToast('Please provide a heading and select/upload an image.');
      return;
    }

    const defaultSlides = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides) ? window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides : [];
    let slides = defaultSlides;
    if (window.HOTEL_STORAGE) {
      slides = await window.HOTEL_STORAGE.getSectionSlides('restaurant_hero', defaultSlides);
    }

    const newSlide = {
      title: title,
      subtitle: sub,
      image: this.tempImageSource
    };

    const updated = [...slides, newSlide];

    if (window.HOTEL_STORAGE) {
      await window.HOTEL_STORAGE.saveSectionSlides('restaurant_hero', updated);
    }
    if (window.app) {
      window.app.heroSlides = updated;
      window.app.renderHeroCarousel();
    }

    this.closeImageModal();
    if (this.currentTab === 'slides') {
      this.renderSlidesManager(document.getElementById('admin-tab-content'));
    }
    window.app.showToast('Added new slide to Main Hero Banner!', 'success');
  }

  async moveCategorySlide(catId, index, direction) {
    let slides = null;
    if (window.HOTEL_STORAGE) {
      slides = await window.HOTEL_STORAGE.getSectionSlides('category_' + catId, null);
    }
    if (!slides) {
      const dishes = window.app.getSectionDishes(catId);
      slides = dishes.map(d => ({
        id: d.id,
        dishId: d.id,
        name: d.name,
        title: d.name,
        price: d.price,
        image: d.image,
        badge: (d.tags && d.tags.includes('chef-special')) ? "👑 Chef's Special" : "👑 SECTION HIGHLIGHT",
        subtitle: d.description || '👆 Tap to view dish details & options'
      }));
    }

    const target = index + direction;
    if (target < 0 || target >= slides.length) return;

    const temp = slides[index];
    slides[index] = slides[target];
    slides[target] = temp;

    if (window.HOTEL_STORAGE) {
      await window.HOTEL_STORAGE.saveSectionSlides('category_' + catId, slides);
    }
    if (window.app) {
      await window.app.renderSectionSlideshow(catId);
    }
    if (this.currentTab === 'slides') {
      this.renderSlidesManager(document.getElementById('admin-tab-content'));
    }
  }

  async removeCategorySlide(catId, index) {
    let slides = null;
    if (window.HOTEL_STORAGE) {
      slides = await window.HOTEL_STORAGE.getSectionSlides('category_' + catId, null);
    }
    if (!slides) {
      const dishes = window.app.getSectionDishes(catId);
      slides = dishes.map(d => ({
        id: d.id,
        dishId: d.id,
        name: d.name,
        title: d.name,
        price: d.price,
        image: d.image,
        badge: "👑 SECTION HIGHLIGHT",
        subtitle: d.description || ''
      }));
    }

    if (slides.length <= 1) {
      window.app.showToast('You must keep at least 1 slide in this section.');
      return;
    }

    if (await window.HotelDialogs.confirm('Remove this slide from category slideshow?')) {
      const updated = slides.filter((_, idx) => idx !== index);
      if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveSectionSlides('category_' + catId, updated);
      }
      if (window.app) {
        await window.app.renderSectionSlideshow(catId);
      }
      if (this.currentTab === 'slides') {
        this.renderSlidesManager(document.getElementById('admin-tab-content'));
      }
      window.app.showToast('Slide removed from category slideshow.', 'info');
    }
  }

  async resetCategorySlidesToDishes(catId) {
    if (await window.HotelDialogs.confirm('Reset this category slideshow to auto-derived dish photos?')) {
      try {
        localStorage.removeItem(`hotel_premier_slides_category_${catId}`);
      } catch (e) {}

      if (window.HOTEL_STORAGE && window.HOTEL_STORAGE.db) {
        try {
          const tx = window.HOTEL_STORAGE.db.transaction('section_slides', 'readwrite');
          tx.objectStore('section_slides').delete('category_' + catId);
        } catch (e) {}
      }

      if (window.app) {
        await window.app.renderSectionSlideshow(catId);
      }
      if (this.currentTab === 'slides') {
        this.renderSlidesManager(document.getElementById('admin-tab-content'));
      }
      window.app.showToast('Category slides reset to dishes.', 'info');
    }
  }

  openAddCategorySlideModal(catId) {
    if(!this.isAuthenticated)return;
    this.editingSlideContext = { type: 'add_category', targetId: catId };
    this.tempImageSource = '';

    const cat = window.app.categories.find(c => c.id === catId);
    const catName = cat ? cat.name : catId;

    const titleEl = document.getElementById('image-modal-dish-name');
    if (titleEl) titleEl.innerText = `Add Slide to: ${catName}`;

    const body = document.getElementById('image-modal-body');
    if (body) {
      body.innerHTML = `
        <div class="hp-inline-18809276c4d1">
          <div>
            <label class="form-label">Slide Main Title / Dish Name *</label>
            <input type="text" id="new-cat-slide-title" class="form-input" placeholder="e.g. Special Khandeshi Thali">
          </div>

          <div class="hp-inline-740ec417ea56">
            <div>
              <label class="form-label">Price (₹)</label>
              <input type="number" id="new-cat-slide-price" class="form-input" placeholder="220">
            </div>
            <div>
              <label class="form-label">Badge Tag</label>
              <input type="text" id="new-cat-slide-badge" class="form-input" value="👑 SECTION HIGHLIGHT" placeholder="e.g. 🔥 Bestseller">
            </div>
          </div>

          <div>
            <label class="form-label">Slide Subtitle / Description</label>
            <input type="text" id="new-cat-slide-sub" class="form-input" placeholder="e.g. Prepared with authentic spices and pure ghee">
          </div>

          <div class="hp-inline-fb5ec070f2bf">
            <div class="hp-inline-e22a562d395b">
              <img height="900" width="1200" class="hp-inline-059ba7fa4870" id="image-preview-element" src="assets/brand-placeholder.svg">
            </div>
            <span class="hp-inline-54c070391c85">Photo Preview to Add</span>
          </div>

          <div>
            <label class="form-label">Option 1: Upload Photo from Phone / Camera</label>
            <input type="file" accept="image/*" class="form-input hp-inline-847ff70267ce" onchange="window.admin.handleHeroSlideUpload(this)">
          </div>

          <div>
            <label class="form-label">Option 2: Paste Web Image URL</label>
            <input type="text" id="image-url-input-field" class="form-input" placeholder="https://..." oninput="window.admin.updatePreviewFromUrl(this.value)">
          </div>

          <div>
            <label class="form-label">Option 3: Choose Curated HD Food Preset</label>
            <div class="preset-image-grid hp-inline-59348a7fd19a">
              ${this.curatedPresets.map(preset => `
                <div class="preset-image-item" onclick="window.admin.selectPresetImage('${preset.url}')" title="${preset.name}">
                  <img height="900" width="1200" src="${preset.url}" alt="${preset.name}">
                  <div class="preset-label">${preset.name}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="hp-inline-4ad9f1568ce9">
            <button class="btn-secondary" onclick="window.admin.closeImageModal()">Cancel</button>
            <button class="btn-primary" onclick="window.admin.saveNewCategorySlide('${catId}')">Add Slide to Section</button>
          </div>
        </div>
      `;
    }

    const modal = document.getElementById('image-replace-modal');
    if (modal) modal.classList.add('active');
  }

  async saveNewCategorySlide(catId) {
    if(!this.isAuthenticated||this.photoUploadPending){window.app.showToast('Wait for the photo preview to finish, then save.','info');return;}
    const title = (document.getElementById('new-cat-slide-title').value || '').trim();
    const sub = (document.getElementById('new-cat-slide-sub').value || '').trim();
    const price = parseFloat(document.getElementById('new-cat-slide-price').value) || 0;
    const badge = (document.getElementById('new-cat-slide-badge').value || '👑 SECTION HIGHLIGHT').trim();

    if (!title || !this.tempImageSource) {
      window.app.showToast('Please provide a title and select/upload an image.');
      return;
    }

    let slides = null;
    if (window.HOTEL_STORAGE) {
      slides = await window.HOTEL_STORAGE.getSectionSlides('category_' + catId, null);
    }
    if (!slides) {
      const dishes = window.app.getSectionDishes(catId);
      slides = dishes.map(d => ({
        id: d.id,
        dishId: d.id,
        name: d.name,
        title: d.name,
        price: d.price,
        image: d.image,
        badge: "👑 SECTION HIGHLIGHT",
        subtitle: d.description || '👆 Tap to view dish details & options'
      }));
    }

    const newSlide = {
      id: `catslide-${Date.now()}`,
      name: title,
      title: title,
      subtitle: sub,
      price: price,
      badge: badge,
      image: this.tempImageSource
    };

    const updated = [...slides, newSlide];

    if (window.HOTEL_STORAGE) {
      await window.HOTEL_STORAGE.saveSectionSlides('category_' + catId, updated);
    }
    if (window.app) {
      await window.app.renderSectionSlideshow(catId);
    }

    this.closeImageModal();
    if (this.currentTab === 'slides') {
      this.renderSlidesManager(document.getElementById('admin-tab-content'));
    }
  }

  // ==================== 4. ADD NEW DISH ====================
  openAddDishModal() {
    if(!this.isAuthenticated)return;
    const modal = document.getElementById('add-dish-modal');
    if (modal) {
      const catSelect = document.getElementById('new-dish-category');
      const previousCategory=catSelect.value;
      const cats = window.app.categories.filter(c => c.id !== 'all' && c.id !== 'chef-specials');
      catSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      if(cats.some(category=>category.id===previousCategory))catSelect.value=previousCategory;
      this.newDishTempImage ||= '';
      modal.classList.add('active');
    }
  }

  closeAddDishModal() {
    this.newDishUploadRequest=(this.newDishUploadRequest||0)+1;
    this.newDishUploadController?.abort();this.newDishPhotoPending=false;
    const modal = document.getElementById('add-dish-modal');
    if (modal) modal.classList.remove('active');
    const save=document.getElementById('save-new-dish-btn');if(save)save.disabled=Boolean(this.savingNewDish);
  }

  async handleNewDishImageUpload(input) {
    const file=input?.files?.[0];if(!file||!this.isAuthenticated)return;
    const modal=document.getElementById('add-dish-modal');
    if(!modal?.classList.contains('active'))return;
    const request=this.newDishUploadRequest=(this.newDishUploadRequest||0)+1,session=this.adminSessionGeneration||0;
    this.newDishUploadController?.abort();const controller=new AbortController();this.newDishUploadController=controller;
    const current=()=>this.isAuthenticated&&!controller.signal.aborted&&this.newDishUploadRequest===request&&session===(this.adminSessionGeneration||0)&&modal.classList.contains('active');
    this.newDishPhotoPending=true;const save=document.getElementById('save-new-dish-btn');if(save)save.disabled=true;
    let upload,preview,accepted=false;
    try {
      if(!window.HotelPhotoWorkflow)throw Error('Photo editor is unavailable. Reload and retry.');
      upload=await window.HotelPhotoWorkflow.ingest(file,{aspect:4/3,signal:controller.signal,onProgress:message=>{if(current())window.app.showToast(message,'info');}});
      if(!current())return;
      const dish={name:document.getElementById('new-dish-name')?.value?.trim()||'',categoryId:document.getElementById('new-dish-category')?.value||''};
      preview=window.AssetPipeline?.processAutomaticStudioEnhancement?await window.AssetPipeline.processAutomaticStudioEnhancement(upload.workingUrl,dish,{backgroundMode:'natural',enhanceColors:false}):null;
      if(!current())return;
      window.HotelPhotoWorkflow.release(this.newDishTempImage);window.HotelPhotoWorkflow.release(this.newDishRawOriginal);
      this.newDishRawOriginal=upload.originalUrl;this.newDishTempImage=preview?.enhancedDataUrl||upload.workingUrl;accepted=true;
      if(this.newDishTempImage!==upload.workingUrl)window.HotelPhotoWorkflow.release(upload.workingUrl);
      const field=document.getElementById('new-dish-image');if(field)field.value='(Photo preview ready — save to apply)';
      window.app.showToast('Photo preview ready. Nothing is saved until you save the dish.','info');
    }catch(error){if(current()&&error.name!=='AbortError')window.app.showToast(error.message||'Photo processing failed. The existing draft photo is unchanged.','error');}
    finally {
      if(!accepted){window.HotelPhotoWorkflow?.release(upload?.originalUrl);window.HotelPhotoWorkflow?.release(upload?.workingUrl);window.HotelPhotoWorkflow?.release(preview?.enhancedDataUrl);}
      if(this.newDishUploadRequest===request){this.newDishPhotoPending=false;if(save)save.disabled=Boolean(this.savingNewDish);}
    }
  }

  async saveNewDish() {
    if(!this.isAuthenticated||this.newDishPhotoPending||this.savingNewDish)return;
    const session=this.adminSessionGeneration||0,view=this.adminViewGeneration||0,draftRequest=this.newDishUploadRequest||0;
    const name = document.getElementById('new-dish-name').value.trim();
    const categoryId = document.getElementById('new-dish-category').value;
    const priceText=document.getElementById('new-dish-price').value.trim();
    const price=priceText===''?null:Number(priceText);
    const desc = document.getElementById('new-dish-desc').value.trim();
    const urlInput = document.getElementById('new-dish-image').value.trim();
    const isSpecial = document.getElementById('new-dish-special') ? document.getElementById('new-dish-special').checked : false;
    const isSweet = document.getElementById('new-dish-sweet') ? document.getElementById('new-dish-sweet').checked : false;
    const isSpicy = document.getElementById('new-dish-spicy') ? document.getElementById('new-dish-spicy').checked : false;
    const isBestseller = document.getElementById('new-dish-bestseller') ? document.getElementById('new-dish-bestseller').checked : false;
    const isKhandeshi = document.getElementById('new-dish-khandeshi') ? document.getElementById('new-dish-khandeshi').checked : false;

    if (!name || price!==null&&(!Number.isFinite(price)||price<0)) {
      window.app.showToast('Provide an item name and a non-negative price, or leave the price blank for now.');
      return;
    }

    const defaultImg = 'assets/brand-placeholder.svg';
    const finalImage = this.newDishTempImage || (urlInput && !urlInput.startsWith('(') ? urlInput : defaultImg);
    try{window.HotelDataValidation?.validate({name,description:desc,image:finalImage});}
    catch(error){window.app.showToast(error.message,'error');return;}

    const newTags = ['veg'];
    if (isSweet) newTags.push('sweet');
    if (isSpicy) newTags.push('spicy');
    if (isSpecial) newTags.push('chef-special');
    if (isBestseller) newTags.push('bestseller');
    if (isKhandeshi) newTags.push('khandeshi-special');

    const newDish = {
      id: 'dish-custom-'+(window.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2)),
      name: name,
      categoryId: categoryId,
      price: price,
      description: desc || 'Prepared fresh in our Pride Pure Veg Kitchen in standard refined oil.',
      image: finalImage,
      rating: '4.9',
      isSoldOut: false,
      tags: newTags
    };

    if(!window.HOTEL_STORAGE?.saveDishOverride){window.app.showToast('Photo storage is unavailable. Reload before saving.','error');return;}
    this.savingNewDish=true;const saveButton=document.getElementById('save-new-dish-btn');if(saveButton)saveButton.disabled=true;
    try {
      const record={...newDish};
      if(this.newDishTempImage)Object.assign(record,{rawOriginalImage:this.newDishRawOriginal||newDish.image,enhancedMasterImage:newDish.image,enhancementStatus:'natural'});
      const saved=await window.HOTEL_STORAGE.saveDishOverride(newDish.id,record);
      if(!saved?.image&&newDish.image)throw Error('Storage did not confirm the saved photo.');
      newDish.image=saved.image;window.app.menuData.unshift(newDish);window.app.saveMenuData();
    }catch(error){window.app.showToast(error.message||'The dish could not be saved. Your draft is unchanged.','error');return;}
    finally{this.savingNewDish=false;if(saveButton)saveButton.disabled=Boolean(this.newDishPhotoPending);}

    const flagsMatch=[['new-dish-special',isSpecial],['new-dish-sweet',isSweet],['new-dish-spicy',isSpicy],['new-dish-bestseller',isBestseller],['new-dish-khandeshi',isKhandeshi]].every(([id,value])=>Boolean(document.getElementById(id)?.checked)===value);
    const sameDraft=flagsMatch&&this.isAuthenticated&&session===(this.adminSessionGeneration||0)&&view===(this.adminViewGeneration||0)&&draftRequest===(this.newDishUploadRequest||0)&&document.getElementById('new-dish-name').value.trim()===name&&document.getElementById('new-dish-category').value===categoryId&&document.getElementById('new-dish-price').value.trim()===priceText&&document.getElementById('new-dish-desc').value.trim()===desc&&document.getElementById('new-dish-image').value.trim()===urlInput;
    window.app.renderCategoryCards();
    if (window.app.currentCategory && window.app.currentCategory !== 'all') {
      window.app.renderSectionSlideshow(window.app.currentCategory);
    }
    window.app.renderMenu();
    if(this.isAuthenticated&&this.currentTab==='menu'&&view===(this.adminViewGeneration||0))this.filterAdminDishes();
    if(!sameDraft){window.app.showToast(`Saved "${name}". Your current draft has been kept.`, 'success');return;}
    this.closeAddDishModal();

    // Reset inputs
    window.HotelPhotoWorkflow?.release(this.newDishTempImage);window.HotelPhotoWorkflow?.release(this.newDishRawOriginal);this.newDishRawOriginal='';
    document.getElementById('new-dish-name').value = '';
    document.getElementById('new-dish-price').value = '';
    document.getElementById('new-dish-desc').value = '';
    document.getElementById('new-dish-image').value = '';
    document.getElementById('new-dish-special').checked = false;
    this.newDishTempImage = '';

    window.app.showToast(`Added "${name}" to menu!`, 'success');
  }

  // ==================== 5. TABLE QR STUDIO ====================
  // ==================== 5. TABLE QR STUDIO ====================
  renderQRStudio(container) {
    container.innerHTML = `
      <div class="qr-studio-layout">
        <h4>Guest QR & Network Studio</h4>
        <p>Three clear destinations. Website QR codes never contain Wi-Fi passwords.</p>
        <div class="guest-network-notice"><strong>Network activation pending</strong>
          <p>No routers or POS settings have been changed. The five-router survey, actual room register, secure backend and isolation tests are required before guest access is enabled.</p>
          <p>HOTEL PREMIER GUEST is a proposed identity, not a verified network. The local Admin PIN cannot authorize server-side credential changes.</p>
          <details><summary>Equipment checklist & secure activation plan</summary><p>Record each router’s model, operating mode, SSIDs, LAN address and DHCP role; map verified room and restaurant coverage. Back up the existing configuration, document POS connectivity and prepare a rollback plan. Test guest isolation and POS communication on one noncritical network before requesting approval for any live router change. Keep administrator passwords outside this PWA.</p></details>
        </div>
        <div class="qr-studio-fields">
          <label>QR destination<select id="qr-table-select" class="form-select"><option value="restaurant">Restaurant Table → Food Menu (Direct)</option><option value="room">Hotel Room → Home & Concierge</option><option value="reception">Reception / General → Home</option></select></label>
          <label>Verified room<select id="qr-room-select" class="form-select" disabled><option value="">Awaiting verified room register</option></select></label>
          <label>Public HTTPS PWA address<input id="qr-target-url" class="form-input" type="url" spellcheck="false"></label>
        </div>
        <p id="qr-studio-status" role="status"></p>
        <div id="standee-print-card" class="qr-print-card">
          <img height="207" width="451" class="qr-brand" src="assets/premier-original-logo.png" alt="Hotel Premier">
          <h4 id="qr-standee-label"></h4><div id="qr-canvas-holder"></div>
          <p id="qr-card-instructions">Scan to discover Hotel Premier.</p><p>Hotel Premier · Bhusawal</p>
        </div>
        <div class="guest-network-actions"><button type="button" class="btn-secondary" id="qr-download">Download QR (PNG)</button><button type="button" class="btn-primary" id="qr-print">Print branded card</button></div>
        <p>Wi-Fi connection QR codes are separate from website links and require verified guest-network information. Opening a page cannot connect a phone automatically.</p>
      </div>`;
    document.getElementById('qr-target-url').value = localStorage.getItem('hotel_premier_custom_qr_domain') || 'https://avi22sh.github.io/Hotel-Premier/';
    const roomSelect = document.getElementById('qr-room-select');
    const refreshRooms = () => {
      const current = roomSelect.value; roomSelect.replaceChildren();
      const rooms = window.HotelGuestNetwork?.getRooms() || [];
      const blank = document.createElement('option'); blank.value = ''; blank.textContent = rooms.length ? 'Select verified room' : 'Awaiting verified room register'; roomSelect.append(blank);
      rooms.forEach(room => { const option = document.createElement('option'); option.value = room.id; option.textContent = room.label + ' · ' + room.category; roomSelect.append(option); });
      roomSelect.value = current; this.generateTableQR();
    };
    document.getElementById('qr-table-select').addEventListener('change', () => this.generateTableQR());
    roomSelect.addEventListener('change', () => this.generateTableQR());
    document.getElementById('qr-target-url').addEventListener('change', e => this.onCustomDomainInput(e.target.value));
    document.getElementById('qr-download').addEventListener('click', () => this.downloadQRImage());
    document.getElementById('qr-print').addEventListener('click', () => this.printStandee());
    if (this.qrRegisterListener) window.removeEventListener('premier-room-register-updated', this.qrRegisterListener);
    this.qrRegisterListener = () => { if (container.isConnected) refreshRooms(); };
    window.addEventListener('premier-room-register-updated', this.qrRegisterListener);
    refreshRooms();
  }

  onCustomDomainInput(value) {
    try {
      const url = new URL(value.trim());
      if (url.protocol !== 'https:' || url.username || url.password) throw Error();
      url.search = ''; url.hash = '';
      localStorage.setItem('hotel_premier_custom_qr_domain', url.href);
    } catch (_) { /* Invalid addresses are reported by the preview, never saved. */ }
    this.generateTableQR();
  }

  generateTableQR() {
    const select = document.getElementById('qr-table-select');
    const host = document.getElementById('qr-canvas-holder');
    if (!select || !host) return;
    const type = select.value;
    const room = document.getElementById('qr-room-select');
    if (room) room.disabled = type !== 'room';
    const status = document.getElementById('qr-studio-status');
    const title = document.getElementById('qr-standee-label');
    const help = document.getElementById('qr-card-instructions');
    host.replaceChildren(); this.currentGuestQR = null;
    if (title) title.textContent = type === 'restaurant' ? 'Pride Pure Veg AC Restaurant' : type === 'room' ? 'Hotel Premier · Room Guest' : 'Welcome to Hotel Premier';
    if (help) help.textContent = type === 'restaurant' ? 'Scan to explore our complete Food Menu.' : type === 'room' ? 'Scan for room amenities, stays and dining.' : 'Scan to discover our hotel, dining and stays.';
    try {
      if (!window.HotelGuestNetwork) throw Error('Please reload the updated QR tools.');
      const url = window.HotelGuestNetwork.destination(document.getElementById('qr-target-url').value.trim(), type, room?.value);
      window.HotelGuestNetwork.renderQR(host, url); this.currentGuestQR = url;
      if (status) status.textContent = 'Website QR ready. Check the destination on a phone before printing.';
    } catch (error) {
      if (status) status.textContent = error.message;
      host.textContent = 'QR unavailable until the destination is verified.';
    }
    for (const id of ['qr-download', 'qr-print']) {
      const button = document.getElementById(id); if (button) button.disabled = !this.currentGuestQR || !host.querySelector('canvas');
    }
  }

  downloadQRImage() {
    const qrHolder = document.getElementById('qr-canvas-holder');
    const tableSelect = document.getElementById('qr-table-select');
    const label = tableSelect ? tableSelect.value.replace(/[^a-zA-Z0-9]/g, '_') : 'hotel_premier_qr';

    if (!qrHolder) return;

    const canvas = qrHolder.querySelector('canvas');
    if (canvas) {
      // Include a quiet zone in the PNG, not only in its HTML wrapper.
      const printable = document.createElement('canvas');
      const margin = 28;
      printable.width = canvas.width + margin * 2; printable.height = canvas.height + margin * 2;
      const context = printable.getContext('2d');
      context.fillStyle = 'white'; context.fillRect(0, 0, printable.width, printable.height);
      context.drawImage(canvas, margin, margin);
      const link = document.createElement('a');
      link.download = `Hotel_Premier_QR_${label}.png`;
      link.href = printable.toDataURL('image/png');
      link.click();
      window.app.showToast('QR Code PNG downloaded successfully!', 'success');
      return;
    }

    const img = qrHolder.querySelector('img');
    if (img && img.src) {
      const link = document.createElement('a');
      link.download = `Hotel_Premier_QR_${label}.png`;
      link.href = img.src;
      link.click();
      window.app.showToast('QR Code image downloaded!', 'success');
    }
  }

  printStandee() {
    if (!this.currentGuestQR) return;
    document.body.classList.add('hp-qr-print');
    window.addEventListener('afterprint', () => document.body.classList.remove('hp-qr-print'), { once: true });
    window.print();
  }

  // ==================== 6. 100% SAFE BACKUP & RESTORE PANEL ====================
  renderBackupManager(container) {
    container.innerHTML = `
      <div class="backup-panel-card">
        <div class="backup-panel-header">
          <div>
            <h4 class="hp-inline-318c6b8f9c0f">🛡️ Device Backup & Photo Recovery</h4>
            <p class="hp-inline-d3a2f6e902a3">
              Edits and photo originals are stored in this browser when saving succeeds. Browser storage can be cleared by the device or its owner. Export a JSON backup regularly and keep it in a safe place.
            </p>
          </div>
        </div>

        <div class="hp-inline-41f7318817b8">
          <!-- Card 1: Export Backup -->
          <div class="hp-inline-48337c19753a">
            <div>
              <div class="hp-inline-10070a1fb162">📥</div>
              <h5 class="hp-inline-ed6ab11620aa">Download Full Backup (JSON)</h5>
              <p class="hp-inline-f49b99d517a0">
                Exports a complete backup file containing all dish photos, 14-room galleries, restaurant hero slides, and marriage deals.
              </p>
            </div>
            <button class="btn-backup-export hp-inline-f2fecb34dcad" onclick="window.admin.exportFullBackup()">
              📥 Export Full Backup Now
            </button>
          </div>

          <!-- Card 2: Restore Backup -->
          <div class="hp-inline-48337c19753a">
            <div>
              <div class="hp-inline-10070a1fb162">📤</div>
              <h5 class="hp-inline-ed6ab11620aa">Restore Backup from File</h5>
              <p class="hp-inline-f49b99d517a0">
                Select a previously exported JSON backup file to restore all photos, prices, and settings instantly.
              </p>
            </div>
            <div class="hp-inline-f2fecb34dcad">
              <input class="hp-inline-6e22c58a7a6a" type="file" id="backup-file-input" accept=".json" onchange="window.admin.handleBackupRestore(this)">
              <button class="btn-backup-import" onclick="document.getElementById('backup-file-input').click()">
                📤 Select File to Restore
              </button>
            </div>
          </div>
        </div>

        <!-- Security & PIN Management Section -->
        <section class="local-publish-card">
          <h4>Publish reviewed changes</h4>
          <p>Edits are saved on this device only. Export optimized photos and public overrides for developer review. Guest records and the local PIN are excluded.</p>
          <button type="button" class="btn-primary" onclick="window.HotelPublishBundle.export().catch(error=>window.app.showToast(error.message,'error'))">Export publish bundle</button>
          <p>After export: unpack with the included tool, review the files, commit to GitHub, then verify the deployed guest site.</p>
        </section>
        <div class="hp-inline-36b44b106533">
          <div class="hp-inline-5642aa0c3bb8">
            <span class="hp-inline-e135b6b4ead8">🔐</span>
            <h5 class="hp-inline-c57e1a0bcb5d">Restaurant Manager Security PIN</h5>
          </div>
          <p class="hp-inline-0fd1fa543f9f">
            Change the device-local PIN. A per-device random salt and PBKDF2-SHA-256 protect the PIN verifier; this is not server authentication or encryption of CRM records.
          </p>
          <div class="hp-inline-6a88ce3d43d2">
            <label class="local-lock-field" for="admin-new-pin-input">New local PIN (at least 6 digits)<input type="password" id="admin-new-pin-input" class="form-input" inputmode="numeric" autocomplete="new-password" minlength="6" maxlength="64" pattern="[0-9]{6,64}"></label>
            <button class="btn-primary hp-inline-d0b132dee226" onclick="window.admin.updateManagerPin()">
              🔒 Update Security PIN
            </button>
          </div>
        </div>

        <div class="hp-inline-ceaf1a4560c0">
          <div>
            <span class="hp-inline-161cc12072b2">Need to start fresh?</span>
            <p class="hp-inline-a1d6ae412e66">Resets all custom edits back to factory defaults.</p>
          </div>
          <button class="btn-secondary hp-inline-dd410829407c" onclick="window.admin.resetAllToDefaults()">
            🔄 Reset All to Original Defaults
          </button>
        </div>
      </div>
    `;
  }

  // ==================== 7. AI STUDIO GLOBAL POLICIES ====================
  async saveAIStudioSettings() {
    const surface = document.getElementById('ai-setting-surface')?.value || 'slate_gold';
    const clutter = document.getElementById('ai-setting-clutter')?.value === 'auto';

    const settings = {
      autoEnhanceEnabled: true,
      defaultStyle: surface,
      autoReplaceClutteredBg: clutter,
      qualityThreshold: 60
    };

    if (window.HOTEL_STORAGE && typeof window.HOTEL_STORAGE.saveAISettings === 'function') {
      await window.HOTEL_STORAGE.saveAISettings(settings);
    }
    window.app.showToast('Local photo settings saved!', 'success');
  }

  filterStudioDishes(q) {
    const term = (q || '').toLowerCase().trim();
    const items = document.querySelectorAll('.ai-studio-grid-item');
    items.forEach(el => {
      const txt = (el.innerText || '').toLowerCase();
      el.style.display = (!term || txt.includes(term)) ? 'block' : 'none';
    });
  }

  async updateManagerPin() {
    const input = document.getElementById('admin-new-pin-input');
    if (!input) return;
    const newPin = (input.value || '').trim();
    if (!/^\d{6,64}$/.test(newPin)) {
      window.app.showToast('Choose a local PIN containing 6 to 64 digits.', 'error');
      input.focus();
      return;
    }

    if (window.HOTEL_STORAGE && typeof window.HOTEL_STORAGE.setAdminPin === 'function') {
      const res = await window.HOTEL_STORAGE.setAdminPin(newPin);
      if (res.success) {
        input.value = '';
        window.app.showToast('Security PIN successfully updated & cryptographically hashed!', 'success');
      } else {
        window.app.showToast(res.message || 'Failed to update local PIN.', 'error');
      }
    } else {
      window.app.showToast('Storage engine unavailable to save the local PIN.', 'error');
    }
  }

  async exportFullBackup() {
    if (window.HOTEL_STORAGE) {
      window.app.showToast('Preparing full backup file...', 'info');
      await window.HOTEL_STORAGE.exportFullBackup();
      window.app.showToast('Backup downloaded successfully!', 'success');
    }
  }

  async handleBackupRestore(input) {
    const file = input.files[0];
    if (!file) return;

    try {
      window.app.showToast('Restoring backup data...', 'info');
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.importFullBackup(parsed);
      }

      await window.app.loadMenuData();
      await window.app.initHeroCarousel();
      await window.app.renderRoomCarousels();
      window.app.renderCategoryCards();
      window.app.renderMenu();
      window.app.renderBulkDealsSection();
      window.app.calculateBulkQuote();

      window.app.showToast('Backup restored successfully! All photos and deals are live.', 'success');
      this.switchTab('menu');
    } catch (err) {
      window.app.showToast('Failed to restore backup: ' + err.message);
    }
  }

  async resetAllToDefaults() {
    if (await window.HotelDialogs.confirm('Are you sure you want to reset all custom photos, prices, and deals back to original factory defaults?')) {
      localStorage.removeItem('hotel_premier_menu_v2');
      localStorage.removeItem('hotel_premier_user_overrides_v1');
      localStorage.removeItem('hotel_premier_room_overrides');
      localStorage.removeItem('hotel_premier_bulk_deals_override');
      localStorage.removeItem('hotel_premier_slides_restaurant_hero');

      window.location.reload();
    }
  }

  bindEvents() {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    if (window.location.hash === '#admin') {
      setTimeout(() => this.openAdminModal(), 200);
    }
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#admin') {
        this.openAdminModal();
      }
    });
  }
}

// Global bootstrap
function initializeHotelPremierAdmin() {
  if (!window.admin) {
    window.admin = new HotelPremierAdmin();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHotelPremierAdmin);
} else {
  initializeHotelPremierAdmin();
}
