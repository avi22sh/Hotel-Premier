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
    contentContainer.scrollTop=0;

    if (tabName === 'content') {
      window.HotelContentStudio?.render(contentContainer);
    } else if (tabName === 'crm') {
      this.renderCRMManager(contentContainer);
    } else if (tabName === 'menu') {
      this.renderMenuManager(contentContainer);
    } else if (tabName === 'photos') {
      this.renderPhotoLibrary(contentContainer);
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
    const exports=node('details','crm-export-drawer');exports.append(node('summary','','Export & backup records'),actions);container.append(exports);
    const table = (title, headers, rows, empty) => {
      const section=node('details','crm-records-section');section.open=title.startsWith('Recent Room');section.append(node('summary','',title));
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
    this.adminVisibleCount=40;
    const categories = window.app.categories.filter(c => c.id !== 'all' && c.id !== 'chef-specials');

    container.innerHTML = `
      <div class="hp-inline-7c9898758083 admin-menu-toolbar">
        <div class="hp-inline-f0d06bb1c7e8 admin-menu-filters">
          <input type="search" id="admin-search-dish" aria-label="Search menu items" placeholder="Search dishes or descriptions…" class="form-input hp-inline-0482bc3dc754">
          <select id="admin-category-filter" class="form-select hp-inline-45db39f3253b">
            <option value="all">All Categories</option>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
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
          <thead><tr><th>Photo</th><th>Item & description</th><th>Price & availability</th><th>Actions</th></tr></thead>
          <tbody id="admin-dish-tbody">
            ${this.generateDishTableRows(menu.slice(0,this.adminVisibleCount))}
          </tbody>
        </table>
        <div class="admin-list-footer"><p id="admin-menu-count" role="status">Showing ${Math.min(menu.length,this.adminVisibleCount)} of ${menu.length} items</p><button type="button" class="studio-button" id="admin-show-more" onclick="window.admin.adminVisibleCount+=40; window.admin.filterAdminDishes()">Show more items</button></div>
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
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  return dishes.map(dish=>{
    const id=escape(dish.id),arg=escape(JSON.stringify(dish.id)),tags=dish.tags||[];
    const category=window.app.categories.find(item=>item.id===dish.categoryId)?.name||dish.categoryId;
    return `<tr id="admin-row-${id}">
      <td><button type="button" class="admin-photo-button" onclick="window.admin.openImageModal(${arg})" aria-label="Edit photo for ${escape(dish.name)}"><img width="80" height="80" loading="lazy" src="${escape(dish.image||'assets/brand-placeholder.svg')}" alt="${escape(dish.name)}"><span>Photo</span></button></td>
      <td><strong class="admin-item-name">${escape(dish.name)}</strong><p class="admin-item-description">${escape(dish.description)}</p><span class="admin-item-category">${escape(category)}</span>${dish.variants?.length?`<button type="button" class="studio-button" onclick="window.app.openDishDetail(${arg})">${dish.variants.length} item options</button>`:''}</td>
      <td><label class="studio-field">Price (₹)<input type="number" min="0" value="${dish.price??''}" placeholder="On request" onchange="window.admin.updatePrice(${arg},this.value)"></label><label class="admin-check"><input type="checkbox" ${dish.isSoldOut?'checked':''} onchange="window.admin.toggleAvailability(${arg},!this.checked)"> Sold out</label><label class="admin-check"><input type="checkbox" ${dish.notAvailable?'checked':''} onchange="window.admin.toggleNotAvailable(${arg},this.checked)"> Hide from menu</label></td>
      <td><details class="admin-item-actions"><summary>Manage item</summary><div class="admin-taste-tags-wrap">${[['sweet','Sweet'],['spicy','Spicy'],['chef-special','Chef special'],['bestseller','Bestseller'],['khandeshi-special','Khandeshi']].map(([tag,label])=>`<button type="button" class="studio-button" aria-pressed="${tags.includes(tag)}" onclick="window.admin.toggleDishTag(${arg},'${tag}')">${label}</button>`).join('')}</div><div class="studio-action-row"><button type="button" class="studio-button" onclick="window.app.moveDish(${arg},'up')">↑ Move up</button><button type="button" class="studio-button" onclick="window.app.moveDish(${arg},'down')">↓ Move down</button></div><button type="button" class="studio-button admin-delete-button" onclick="window.admin.deleteDish(${arg})">Remove item</button></details></td>
    </tr>`;
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
      tbody.innerHTML = this.generateDishTableRows(filtered.slice(0,this.adminVisibleCount||40));
      const count=document.getElementById('admin-menu-count');if(count)count.textContent=`Showing ${Math.min(filtered.length,this.adminVisibleCount||40)} of ${filtered.length} items`;
      const more=document.getElementById('admin-show-more');if(more)more.hidden=filtered.length<=(this.adminVisibleCount||40);
    }
  }

  async updatePrice(dishId, newPrice) {
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (dish) {
      const parsedPrice = newPrice.trim() === '' ? null : Number(newPrice);
      if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) return;
      try { await window.HOTEL_STORAGE.saveDishOverride(dishId, { price: parsedPrice }); }
      catch(error){window.app.showToast('Price not saved. The previous price has been kept.','error');return false;}
      dish.price = parsedPrice;
      window.app.saveMenuData();
      window.app.renderMenu();
      window.app.showToast(`Updated price for "${dish.name}" to ${dish.price === null ? 'Price on request' : `₹${dish.price}`}`, 'success');
    }
  }

  async toggleDishTag(dishId, tagName) {
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (!dish) return;

    const tags=[...(dish.tags||[])];
    const index = tags.indexOf(tagName);
    if (index > -1) {
      tags.splice(index, 1);
    } else {
      tags.push(tagName);
    }

    try { await window.HOTEL_STORAGE.saveDishOverride(dishId, { tags }); }
    catch(error){window.app.showToast('Tags not saved. The previous selection has been kept.','error');return false;}
    dish.tags=tags;
    window.app.saveMenuData();

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
      try { await window.HOTEL_STORAGE.saveDishOverride(dishId, { isSoldOut: !isAvailable }); }
      catch(error){window.app.showToast('Availability not saved. The previous state has been kept.','error');return false;}
      dish.isSoldOut = !isAvailable;
      window.app.saveMenuData();
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
    if(!this.isAuthenticated)return;
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (!dish) return;

    if (await window.HotelDialogs.confirm(`Are you sure you want to remove "${dish.name}" from the menu?`)) {
      try{
        const next=window.HotelMenuStructure.snapshot(window.app);
        const ids=new Set([dishId,...window.app.menuData.filter(item=>item.groupedUnder===dishId).map(item=>item.id)]);
        for(const id of ids)next.items[id]={_deleted:true};
        next.order=next.order.filter(id=>!ids.has(id));
        window.HotelMenuStructure.saveDraft(next,window.app);
      }catch(error){window.app.showToast('Item not removed. The saved menu is unchanged.','error');return false;}
      window.app.renderCategoryCards();
      window.app.renderMenu();
      this.filterAdminDishes();
      window.app.showToast(`Removed "${dish.name}" from menu.`, 'info');
    }
  }

  // ==================== DISH PHOTO REPLACEMENT & DELETION MODAL ====================
  async openImageModal(dishId) {
    if(!this.isAuthenticated)return;
    const request=this.previewRequestId=(this.previewRequestId||0)+1,session=this.adminSessionGeneration||0;
    this.photoUploadController?.abort();this.activeImageDishId=dishId;this.activeRoomId=null;this.editingSlideContext=null;
    const dish=window.app.menuData.find(item=>item.id===dishId);if(!dish)return;
    let saved;try{saved=await window.HOTEL_STORAGE.getDishOverride(dishId);}catch(error){window.app.showToast('Photo could not be opened. Your saved image is unchanged.','error');return;}
    if(!this.isAuthenticated||request!==this.previewRequestId||session!==(this.adminSessionGeneration||0))return;
    this.tempImageSource=saved?.image??dish.image??'';this.rawOriginalSource=saved?.rawOriginalImage||this.tempImageSource;
    this.previewFailed=false;this.photoUploadPending=false;
    document.getElementById('image-modal-dish-name').textContent='Photo · '+dish.name;
    const body=document.getElementById('image-modal-body');body.replaceChildren();
    const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
    const preview=node('div','','photo-editor-preview'),image=node('img');image.id='image-preview-element';image.alt=dish.name;image.src=this.tempImageSource||'assets/brand-placeholder.svg';preview.append(image);
    const hint=node('p','Upload your own photo. Framing and file-size optimization preserve the food and colours. Saving updates this device; use a publish bundle for the public site.','studio-notice');
    const label=node('label','Upload or replace photo','studio-field'),upload=node('input');upload.type='file';upload.accept='image/jpeg,image/png,image/webp';upload.addEventListener('change',()=>this.handleImageFileUpload(upload));label.append(upload);
    const actions=node('div','','studio-action-row');
    for(const [text,run] of [['Cancel',()=>this.closeImageModal()],['Save photo',()=>this.saveReplacedImage()],['Remove photo',()=>this.deleteDishPhoto(dishId)]]){const button=node('button',text,'studio-button');button.type='button';if(text==='Save photo')button.id='apply-dish-photo-btn';if(text==='Remove photo')button.disabled=!this.tempImageSource;button.addEventListener('click',run);actions.append(button);}
    body.append(preview,hint,label,actions);document.getElementById('image-replace-modal').classList.add('active');
  }

  async deleteDishPhoto(dishId) {
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (!dish) return;

    if (!this.isAuthenticated) return;
    if (await window.HotelDialogs.confirm(`Remove the photo for "${dish.name}"?\n\nThe dish will be shown in Pure Veg mode without photo until you upload a new one.`)) {
      try { await window.HOTEL_STORAGE.saveDishOverride(dish.id, { image: '' }); }
      catch(error) { window.app.showToast('Photo could not be removed. Your saved photo is unchanged.','error');return false; }
      if (window.AssetPipeline?.clearCacheForAsset) {
        window.AssetPipeline.clearCacheForAsset(dish.id);
        window.AssetPipeline.clearCacheForAsset(dish.image);
      }
      dish.image = '';
      window.app.saveMenuData();

      window.app.renderCategoryCards();
      if (window.app.currentCategory && window.app.currentCategory !== 'all') {
        window.app.renderSectionSlideshow(window.app.currentCategory);
      }
      window.app.renderMenu();
      this.filterAdminDishes();
      if (document.getElementById('studio-dishes-grid')) {
        this.renderPhotoLibrary(document.getElementById('admin-tab-content'));
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



  async handleImageFileUpload(input) {
    const file=input?.files?.[0];if(!file||!this.isAuthenticated||!this.activeImageDishId)return;
    const id=this.activeImageDishId,request=this.previewRequestId=(this.previewRequestId||0)+1,session=this.adminSessionGeneration||0;
    this.photoUploadController?.abort();const controller=new AbortController();this.photoUploadController=controller;
    const current=()=>this.isAuthenticated&&!controller.signal.aborted&&id===this.activeImageDishId&&request===this.previewRequestId&&session===(this.adminSessionGeneration||0);
    this.photoUploadPending=true;const save=document.getElementById('apply-dish-photo-btn');if(save)save.disabled=true;
    let result,accepted=false;
    try{
      result=await window.HotelPhotoWorkflow.ingest(file,{aspect:4/3,signal:controller.signal});if(!current())return;
      window.HotelPhotoWorkflow.release(this.tempImageSource);window.HotelPhotoWorkflow.release(this.rawOriginalSource);
      this.tempImageSource=result.workingUrl;this.rawOriginalSource=result.originalUrl;this.previewFailed=false;accepted=true;
      const preview=document.getElementById('image-preview-element');if(preview)preview.src=this.tempImageSource;
      window.app.showToast('Photo ready. Save to apply it.','info');
    }catch(error){if(current()&&error.name!=='AbortError')window.app.showToast(error.message||'Photo could not be read. The saved photo is unchanged.','error');}
    finally{if(!accepted){window.HotelPhotoWorkflow?.release(result?.workingUrl);window.HotelPhotoWorkflow?.release(result?.originalUrl);}if(current()){this.photoUploadPending=false;if(save)save.disabled=false;}}
  }

  async updatePreviewFromUrl(url) {
    if(!this.isAuthenticated||! /^(?:https:\/\/|assets\/)/.test(url))return;
    this.tempImageSource=url;const preview=document.getElementById('image-preview-element');if(preview)preview.src=url;
  }

  async selectPresetImage(url) { return this.updatePreviewFromUrl(url); }

  async saveReplacedImage() {
    if(!this.isAuthenticated||this.photoUploadPending||this.savingDishPhoto||!this.activeImageDishId||!this.tempImageSource)return false;
    const dish=window.app.menuData.find(item=>item.id===this.activeImageDishId);if(!dish)return false;
    const request=this.previewRequestId;this.savingDishPhoto=true;
    const save=document.getElementById('apply-dish-photo-btn');if(save)save.disabled=true;
    try{
      const record=await window.HOTEL_STORAGE.saveDishOverride(dish.id,{image:this.tempImageSource,rawOriginalImage:this.rawOriginalSource||this.tempImageSource,enhancementStatus:'original'});
      dish.image=record.image;window.app.saveMenuData();window.app.renderCategoryCards();window.app.renderMenu();
      if(window.app.currentCategory&&window.app.currentCategory!=='all')await window.app.renderSectionSlideshow(window.app.currentCategory);
      window.dispatchEvent(new CustomEvent('hp-media-updated',{detail:{dishId:dish.id,image:dish.image}}));
      if(request===this.previewRequestId){this.closeImageModal();if(this.currentTab==='photos')this.renderPhotoLibrary(document.getElementById('admin-tab-content'));else this.filterAdminDishes();}
      window.app.showToast('Photo saved on this device. Export reviewed changes to publish.','success');return true;
    }catch(error){window.app.showToast(error.message||'Not saved. The earlier photo has been kept.','error');return false;}
    finally{this.savingDishPhoto=false;if(save)save.disabled=false;}
  }

  async renderPhotoLibrary(container) {
    if(!this.isAuthenticated||this.currentTab!=='photos')return;
    const previousScroll=container.scrollTop;
    container.replaceChildren();
    const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
    const header=node('header','','studio-section-header');header.append(node('h3','Dish photo library'),node('p','Your uploaded photos only. Upload, replace or remove an image; no generation or colour changes.','studio-notice'));
    const search=node('input');search.type='search';search.placeholder='Search photos by dish name';search.setAttribute('aria-label','Search dish photos');
    const grid=node('div','','photo-library-grid');grid.id='studio-dishes-grid';
    for(const dish of window.app.menuData){const card=node('article','','photo-library-card');card.dataset.name=dish.name.toLowerCase();const image=node('img');image.src=dish.image||'assets/brand-placeholder.svg';image.alt=dish.name;image.loading='lazy';const title=node('h4',dish.name);const edit=node('button',dish.image?'Replace photo':'Upload photo','studio-button');edit.type='button';edit.addEventListener('click',()=>this.openImageModal(dish.id));card.append(image,title,edit);grid.append(card);}
    search.addEventListener('input',()=>{const query=search.value.trim().toLowerCase();for(const card of grid.children)card.hidden=!card.dataset.name.includes(query);});container.append(header,search,grid);container.scrollTop=previousScroll;
  }

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
    let upload,accepted=false;
    try {
      if(!window.HotelPhotoWorkflow)throw Error('Photo editor is unavailable. Reload and retry.');
      upload=await window.HotelPhotoWorkflow.ingest(file,{aspect:4/3,signal:controller.signal,onProgress:message=>{if(current())window.app.showToast(message,'info');}});
      if(!current())return;
      const dish={name:document.getElementById('new-dish-name')?.value?.trim()||'',categoryId:document.getElementById('new-dish-category')?.value||''};
      if(!current())return;
      window.HotelPhotoWorkflow.release(this.newDishTempImage);window.HotelPhotoWorkflow.release(this.newDishRawOriginal);
      this.newDishRawOriginal=upload.originalUrl;this.newDishTempImage=upload.workingUrl;accepted=true;
      if(this.newDishTempImage!==upload.workingUrl)window.HotelPhotoWorkflow.release(upload.workingUrl);
      const field=document.getElementById('new-dish-image');if(field)field.value='(Photo preview ready — save to apply)';
      window.app.showToast('Photo preview ready. Nothing is saved until you save the dish.','info');
    }catch(error){if(current()&&error.name!=='AbortError')window.app.showToast(error.message||'Photo processing failed. The existing draft photo is unchanged.','error');}
    finally {
      if(!accepted){window.HotelPhotoWorkflow?.release(upload?.originalUrl);window.HotelPhotoWorkflow?.release(upload?.workingUrl);}
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
