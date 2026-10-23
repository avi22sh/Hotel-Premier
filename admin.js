// ==========================================================================
// HOTEL PREMIER - PRIDE PURE VEG AC RESTAURANT, BHUSAWAL
// Live Menu CMS, Multi-Photo Room & Slide Manager, Safe Backup & QR Studio
// ==========================================================================

class HotelPremierAdmin {
  constructor() {
    this.isAuthenticated = false;
    this.currentTab = 'menu';
    this.activeImageDishId = null;
    this.tempImageSource = '';
    this.newDishTempImage = '';

    // Curated high-definition food presets for 1-click replacement
    this.curatedPresets = [
      { name: 'Paneer Butter Masala', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80' },
      { name: 'Palak / Kadai Paneer', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80' },
      { name: 'Tandoori Paneer Tikka', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80' },
      { name: 'Dal Tadka / Desi Ghee', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80' },
      { name: 'Veg Biryani / Pulao', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80' },
      { name: 'Shev Bhaji / Khandeshi', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80' },
      { name: 'Indo-Chinese Noodles', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80' },
      { name: 'Manchurian / Crispy', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80' },
      { name: 'Premier Hot Tea / Coffee', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80' },
      { name: 'Morning Poori Bhaji', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80' },
      { name: 'Pakoda / Finger Chips', url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80' },
      { name: 'Hot Sizzling Soup', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80' },
      { name: 'Malai / Cheese Kofta', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80' },
      { name: 'Roti / Butter Naan', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80' },
      { name: 'Desi Masala Pasta', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80' },
      { name: 'Chilli Chinese Pasta', url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281e8e?w=600&auto=format&fit=crop&q=80' },
      { name: 'Ice Cream / Dessert', url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80' }
    ];

    this.roomPresets = [
      { name: 'Super Deluxe King Bed Suite', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=80' },
      { name: 'Luxury Modern Bathroom', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=700&auto=format&fit=crop&q=80' },
      { name: 'Smart TV & Lounge Seating', url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=700&auto=format&fit=crop&q=80' },
      { name: 'AC Deluxe Queen Bed', url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=700&auto=format&fit=crop&q=80' },
      { name: 'Clean Modern Attached Bath', url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=700&auto=format&fit=crop&q=80' },
      { name: 'AC Deluxe Twin Beds (2 Beds)', url: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=700&auto=format&fit=crop&q=80' },
      { name: 'Spacious Twin Room Interior', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=700&auto=format&fit=crop&q=80' },
      { name: 'Hotel Premier Reception', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&auto=format&fit=crop&q=80' },
      { name: 'Pride Pure Veg Dining Hall', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80' }
    ];

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
    const modal = document.getElementById('admin-modal-backdrop');
    if (modal) modal.classList.remove('active');
  }

  async verifyPin() {
    const pinInput = document.getElementById('admin-pin-input');
    if (!pinInput) return;
    const enteredPin = (pinInput.value || '').trim();
    if (!enteredPin) {
      alert('Please enter a PIN.');
      pinInput.focus();
      return;
    }

    let isMatch = false;
    if (window.HOTEL_STORAGE && typeof window.HOTEL_STORAGE.verifyAdminPin === 'function') {
      isMatch = await window.HOTEL_STORAGE.verifyAdminPin(enteredPin);
    } else if (window.HOTEL_VAULT && typeof window.HOTEL_VAULT.verifyMasterPin === 'function') {
      isMatch = window.HOTEL_VAULT.verifyMasterPin(enteredPin);
    } else {
      // Fallback
      isMatch = (enteredPin === 'admin123' || enteredPin === '9325');
    }

    if (isMatch) {
      this.isAuthenticated = true;
      pinInput.value = '';
      document.getElementById('admin-auth-view').style.display = 'none';
      document.getElementById('admin-dashboard-view').style.display = 'flex';
      this.switchTab('crm');
      window.app.showToast('Hotel Premier Admin Studio unlocked!', 'success');
    } else {
      alert('Incorrect Security PIN. If forgotten, contact your Hotel Premier administrator.');
      pinInput.value = '';
      pinInput.focus();
    }
  }

  switchTab(tabName) {
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

  // ==================== ENTERPRISE CUSTOMER CRM MANAGER ====================
  renderCRMManager(container) {
    if (!window.HOTEL_VAULT) {
      container.innerHTML = '<p>Hotel Vault not loaded.</p>';
      return;
    }

    const stats = window.HOTEL_VAULT.getCRMStats();
    const guests = window.HOTEL_VAULT.getGuests();
    const bookings = window.HOTEL_VAULT.getBookings();
    const reviews = window.HOTEL_VAULT.getReviews();
    const enquiries = window.HOTEL_VAULT.getEnquiries();

    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-family: var(--font-royal); font-size: 1.25rem; color: var(--burgundy-deep); margin-bottom: 4px;">
          👥 Hotel Premier Customer Relationship Management
        </h3>
        <p style="font-size: 0.80rem; color: var(--text-muted-dark);">
          Centralized private database of hotel guests, room reservation inquiries, in-house reviews, and banquet requests.
        </p>
      </div>

      <!-- CRM KPI Grid -->
      <div class="crm-kpi-grid">
        <div class="crm-kpi-card">
          <div class="kpi-num">${stats.totalGuests}</div>
          <div class="kpi-label">Registered Guests</div>
        </div>
        <div class="crm-kpi-card">
          <div class="kpi-num">${stats.totalBookings}</div>
          <div class="kpi-label">Room Bookings</div>
        </div>
        <div class="crm-kpi-card">
          <div class="kpi-num">${stats.totalReviews} (${stats.averageRating}★)</div>
          <div class="kpi-label">Guest Reviews</div>
        </div>
        <div class="crm-kpi-card">
          <div class="kpi-num">${stats.totalEnquiries}</div>
          <div class="kpi-label">Banquet Enquiries</div>
        </div>
      </div>

      <!-- Export Actions Bar -->
      <div class="crm-export-actions-bar">
        <button type="button" class="btn-crm-export" onclick="window.HOTEL_VAULT.exportGuestsCSV()">
          <span>📥 Export Guests CSV</span>
        </button>
        <button type="button" class="btn-crm-export" onclick="window.HOTEL_VAULT.exportBookingsCSV()">
          <span>📥 Export Bookings CSV</span>
        </button>
        <button type="button" class="btn-crm-export" onclick="window.HOTEL_VAULT.exportReviewsCSV()">
          <span>📥 Export Reviews CSV</span>
        </button>
        <button type="button" class="btn-crm-export" onclick="window.HOTEL_VAULT.exportEnquiriesCSV()">
          <span>📥 Export Enquiries CSV</span>
        </button>
        <button type="button" class="btn-crm-export" style="background: var(--brass-shimmer); font-weight: 800;" onclick="window.HOTEL_VAULT.exportMasterVaultBackup()">
          <span>💾 Master CRM JSON Backup</span>
        </button>
      </div>

      <!-- Recent Bookings Table -->
      <div style="background: #FFFFFF; border: 1px solid var(--ivory-border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px;">
        <h4 style="font-family: var(--font-royal); font-size: 0.95rem; color: var(--burgundy-deep); margin-bottom: 10px;">
          🛎️ Recent Room Inquiries & Bookings (${bookings.length})
        </h4>
        ${bookings.length === 0 ? '<p style="font-size: 0.8rem; color: #8C9BAE;">No booking records yet.</p>' : `
          <div style="overflow-x: auto;">
            <table style="width: 100%; font-size: 0.8rem; border-collapse: collapse;">
              <thead>
                <tr style="background: #FAF7F0; text-align: left; border-bottom: 1.5px solid rgba(197, 168, 128, 0.3);">
                  <th style="padding: 8px;">Date</th>
                  <th style="padding: 8px;">Guest Name</th>
                  <th style="padding: 8px;">Phone</th>
                  <th style="padding: 8px;">Suite</th>
                  <th style="padding: 8px;">Check-In</th>
                  <th style="padding: 8px;">Nights</th>
                  <th style="padding: 8px;">Estimated Total</th>
                </tr>
              </thead>
              <tbody>
                ${bookings.slice(0, 10).map(b => `
                  <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                    <td style="padding: 8px;">${b.dateFormatted || ''}</td>
                    <td style="padding: 8px; font-weight: 700;">${b.guestName || 'Valued Guest'}</td>
                    <td style="padding: 8px;"><a href="tel:${b.guestPhone}" style="color: var(--burgundy-primary);">${b.guestPhone}</a></td>
                    <td style="padding: 8px;">${b.roomType}</td>
                    <td style="padding: 8px;">${b.checkInDate}</td>
                    <td style="padding: 8px;">${b.nights}</td>
                    <td style="padding: 8px; font-weight: 800; color: var(--burgundy-deep);">₹ ${Number(b.estimatedTotal || 0).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Recent Reviews Table -->
      <div style="background: #FFFFFF; border: 1px solid var(--ivory-border); border-radius: var(--radius-md); padding: 16px;">
        <h4 style="font-family: var(--font-royal); font-size: 0.95rem; color: var(--burgundy-deep); margin-bottom: 10px;">
          ⭐ Recent In-House Guest Reviews (${reviews.length})
        </h4>
        ${reviews.length === 0 ? '<p style="font-size: 0.8rem; color: #8C9BAE;">No reviews yet.</p>' : `
          <div style="overflow-x: auto;">
            <table style="width: 100%; font-size: 0.8rem; border-collapse: collapse;">
              <thead>
                <tr style="background: #FAF7F0; text-align: left; border-bottom: 1.5px solid rgba(197, 168, 128, 0.3);">
                  <th style="padding: 8px;">Date</th>
                  <th style="padding: 8px;">Guest</th>
                  <th style="padding: 8px;">Rating</th>
                  <th style="padding: 8px;">Tags</th>
                  <th style="padding: 8px;">Comment</th>
                </tr>
              </thead>
              <tbody>
                ${reviews.slice(0, 10).map(r => `
                  <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                    <td style="padding: 8px;">${r.dateFormatted || ''}</td>
                    <td style="padding: 8px; font-weight: 700;">${r.name || 'Anonymous'}</td>
                    <td style="padding: 8px; color: #D97706; font-weight: 800;">${'★'.repeat(r.rating || 5)}</td>
                    <td style="padding: 8px;">${(r.tags || []).join(', ')}</td>
                    <td style="padding: 8px; font-style: italic;">"${r.comment || ''}"</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  // Client-side HTML5 Canvas Photo Compressor & Intelligent Asset Pipeline Hook
  async compressAndResizeImage(file, maxWidth = 800, maxHeight = 800, quality = 0.75, category = 'food', options = {}) {
    if (window.AssetPipeline && typeof window.AssetPipeline.processUploadFile === 'function') {
      try {
        const processed = await window.AssetPipeline.processUploadFile(file, category, {
          maxDimension: Math.max(maxWidth, maxHeight),
          quality: quality,
          ...options
        });
        return processed;
      } catch (err) {
        console.warn('AssetPipeline preprocessing fallback to standard compression:', err);
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }

  // ==================== 1. MENU CMS TABLE & PRICING ====================
  renderMenuManager(container) {
    const menu = window.app.menuData;
    const categories = window.app.categories.filter(c => c.id !== 'all' && c.id !== 'chef-specials');

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; gap: 8px; flex-grow: 1; max-width: 620px; flex-wrap: wrap;">
          <input type="text" id="admin-search-dish" placeholder="Search dish name to edit price, photo, or status..." class="form-input" style="padding: 7px 12px; font-size: 0.82rem; min-width: 220px; flex: 1;">
          <select id="admin-category-filter" class="form-select" style="padding: 7px 12px; font-size: 0.82rem; width: auto;">
            <option value="all">All Categories</option>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
          <button type="button" class="studio-button" onclick="document.getElementById('admin-category-filter').value='indo-chinese'; window.admin.filterAdminDishes()">Indo-Chinese</button>
          <button type="button" class="studio-button" onclick="document.getElementById('admin-category-filter').value='pasta-section'; window.admin.filterAdminDishes()">Pastas</button>
          <select id="admin-status-filter" class="form-select" style="padding: 7px 12px; font-size: 0.82rem; width: auto;">
            <option value="all">All Items</option>
            <option value="active">Active Only (Visible)</option>
            <option value="notAvailable">Not Available (Hidden)</option>
          </select>
        </div>
        <button class="btn-primary" style="padding: 8px 16px; font-size: 0.82rem;" onclick="window.admin.openAddDishModal()">
          <span>+ Add New Dish</span>
        </button>
      </div>

      <div style="overflow-x: auto; width: 100%; border: 1.5px solid var(--cream-border); border-radius: var(--radius-sm); margin-bottom: 24px; box-shadow: var(--shadow-sm);">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 60px;">Photo</th>
              <th>Dish Name & Description</th>
              <th>Category</th>
              <th style="width: 90px;">Price (₹)</th>
              <th style="min-width: 170px;">Taste & Badges</th>
              <th style="width: 80px; text-align: center;">Sold Out</th>
              <th style="width: 110px; text-align: center;">PWA Visibility</th>
              <th style="width: 75px; text-align: center;">Order</th>
              <th style="width: 50px; text-align: center;">Delete</th>
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
          <td style="text-align: center;">
            ${hasPhoto ? `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
                <div style="position: relative; width: 44px; height: 44px; margin: 0 auto; cursor: pointer; border-radius: 4px; overflow: hidden; border: 1px solid var(--gold-border);" onclick="window.admin.openImageModal('${dish.id}')" title="Click to replace photo">
                  <img id="admin-dish-thumb-${dish.id}" src="${dish.image}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'">
                  <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: #FFF;">📷</div>
                </div>
                <button onclick="window.admin.deleteDishPhoto('${dish.id}')" style="background: rgba(220,38,38,0.1); color: #DC2626; border: 1px solid rgba(220,38,38,0.3); border-radius: 3px; font-size: 0.62rem; font-weight: 800; padding: 1px 4px; cursor: pointer;" title="Remove photo (switch to Pure Veg text mode)">
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
            <div style="font-weight: 700; color: var(--terracotta-dark); font-size: 0.88rem;">${dish.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${dish.description || ''}</div>
            ${dish.variants && dish.variants.length > 0 ? `
              <div style="margin-top: 3px;">
                <button type="button" onclick="window.app.openDishDetail('${dish.id}')" style="background: rgba(180, 140, 75, 0.15); border: 1px solid rgba(180, 140, 75, 0.4); color: var(--gold-dark); border-radius: 4px; font-size: 0.68rem; font-weight: 700; padding: 2px 6px; cursor: pointer;">
                  🛠️ ${dish.variants.length} Options (Reorder / Manage)
                </button>
              </div>
            ` : ''}
          </td>
          <td>
            <span style="font-size: 0.75rem; background: var(--cream-darker); padding: 3px 8px; border-radius: 4px; font-weight: 600;">${dish.categoryId}</span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 0.82rem; font-weight: 700;">₹</span>
              <input type="number" value="${dish.price ?? ''}" placeholder="Unset" min="0" style="width: 65px; padding: 4px 6px; font-size: 0.85rem; font-weight: 800; border: 1px solid var(--cream-border); border-radius: 4px;" onchange="window.admin.updatePrice('${dish.id}', this.value)">
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
          <td style="text-align: center;">
            <label class="toggle-switch" title="Mark dish Sold Out (shows Sold Out banner in PWA)">
              <input type="checkbox" ${!isSoldOut ? 'checked' : ''} onchange="window.admin.toggleAvailability('${dish.id}', this.checked)">
              <span class="toggle-slider"></span>
            </label>
            <div style="font-size: 0.62rem; color: var(--text-muted); margin-top: 2px;">${isSoldOut ? 'Sold Out' : 'In Stock'}</div>
          </td>
          <td style="text-align: center;">
            <label class="toggle-switch" title="Check to make invisible from customer PWA">
              <input type="checkbox" ${dish.notAvailable ? 'checked' : ''} onchange="window.admin.toggleNotAvailable('${dish.id}', this.checked)">
              <span class="toggle-slider toggle-slider-danger"></span>
            </label>
            <div style="font-size: 0.65rem; font-weight: 800; color: ${dish.notAvailable ? '#EF4444' : '#10B981'}; margin-top: 2px;">
              ${dish.notAvailable ? '🚫 Hidden' : 'Active'}
            </div>
          </td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 3px; justify-content: center;">
              <button type="button" onclick="window.app.moveDish('${dish.id}', 'up')" style="background: rgba(0,0,0,0.06); border: 1px solid var(--cream-border); border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 0.72rem; font-weight: 700;" title="Move Up in Category">▲</button>
              <button type="button" onclick="window.app.moveDish('${dish.id}', 'down')" style="background: rgba(0,0,0,0.06); border: 1px solid var(--cream-border); border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 0.72rem; font-weight: 700;" title="Move Down in Category">▼</button>
            </div>
          </td>
          <td style="text-align: center;">
            <button style="background: none; border: none; font-size: 1rem; cursor: pointer; opacity: 0.7;" onclick="window.admin.deleteDish('${dish.id}')" title="Delete Dish">🗑️</button>
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

  deleteDish(dishId) {
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (!dish) return;

    if (confirm(`Are you sure you want to remove "${dish.name}" from the menu?`)) {
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
    this.previewRequestId = (this.previewRequestId || 0) + 1;
    this.isPreviewProcessing = false;
    this.previewFailed = false;
    this.activeImageDishId = dishId;
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (!dish) return;

    // Load any existing photo lifecycle override record from IndexedDB
    let lifecycle = null;
    if (window.HOTEL_STORAGE && typeof window.HOTEL_STORAGE.getDishOverride === 'function') {
      lifecycle = await window.HOTEL_STORAGE.getDishOverride(dishId);
    }

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
    this.tempImageSource = this.enhanced4KSource || this.rawOriginalSource;
    this.currentEnhancementStatus = (lifecycle && lifecycle.enhancementStatus) || (hasPhoto ? 'enhanced' : 'original');
    this.currentQualityScore = (lifecycle && lifecycle.qualityScore) || 92;

    const titleEl = document.getElementById('image-modal-dish-name');
    if (titleEl) titleEl.innerText = `${hasPhoto ? 'Culinary Photography Studio' : 'Upload Food Photo'}: ${dish.name}`;

    const body = document.getElementById('image-modal-body');
    if (body) {
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Current Photo Status or Delete Option -->
          ${hasPhoto ? `
            <div style="background: #FEF2F2; border: 1.5px dashed #F87171; border-radius: 8px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
              <div>
                <div style="font-weight: 800; font-size: 0.82rem; color: #991B1B;">Want to remove this photo?</div>
                <div style="font-size: 0.70rem; color: #B91C1C;">The dish will be displayed in elegant Pure Veg text mode until you upload a new photo.</div>
              </div>
              <button class="slide-action-btn delete" style="padding: 5px 10px; font-size: 0.75rem; font-weight: 800; flex-shrink: 0;" onclick="window.admin.deleteDishPhoto('${dish.id}')">
                🗑️ Delete Photo
              </button>
            </div>
          ` : `
            <div style="background: rgba(14,22,34,0.6); border: 1.5px dashed var(--brass-primary); border-radius: 8px; padding: 10px 12px; text-align: center;">
              <div style="font-size: 1.3rem; margin-bottom: 2px;">🌱</div>
              <div style="font-weight: 800; font-size: 0.82rem; color: var(--brass-light);">No photo currently assigned</div>
              <div style="font-size: 0.70rem; color: #8C9BAE;">Your original photo stays protected. Choose an optional studio treatment only after checking the preview.</div>
            </div>
          `}

          <!-- Interactive Before/After Studio Slider (Always in DOM for instant seamless upload preview) -->
          <div style="text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <div style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="font-size: 0.76rem; font-weight: 800; color: var(--brass-light); display: inline-flex; align-items: center; gap: 4px;">
                  ✨ <span>Studio Comparison</span>
                </span>
                <span id="lifecycle-status-badge" class="hp-status-pill hp-status-${this.currentEnhancementStatus}">
                  ${this.currentEnhancementStatus.toUpperCase()} (${this.currentQualityScore}%)
                </span>
              </div>
              <div style="display: inline-flex; background: rgba(0,0,0,0.4); border-radius: 20px; padding: 2px; border: 1px solid rgba(213,183,122,0.3);">
                <button type="button" id="preview-tab-split" class="btn-preview-toggle active" onclick="window.admin.toggleComparisonMode('split')" style="padding: 2px 8px; font-size: 0.68rem; border-radius: 14px; border: none; background: var(--brass-primary); color: #000; font-weight: 800; cursor: pointer;">Split View</button>
                <button type="button" id="preview-tab-enhanced" class="btn-preview-toggle" onclick="window.admin.toggleComparisonMode('enhanced')" style="padding: 2px 8px; font-size: 0.68rem; border-radius: 14px; border: none; background: transparent; color: #B2C0D1; font-weight: 700; cursor: pointer;">Studio Master</button>
                <button type="button" id="preview-tab-original" class="btn-preview-toggle" onclick="window.admin.toggleComparisonMode('original')" style="padding: 2px 8px; font-size: 0.68rem; border-radius: 14px; border: none; background: transparent; color: #B2C0D1; font-weight: 700; cursor: pointer;">Raw Original</button>
              </div>
            </div>

            <!-- Dual Layer Split Slider Container -->
            <div class="hp-before-after-container" id="hp-slider-container">
              <!-- Underlayer: Raw Original Image -->
              <img id="image-original-element" class="hp-slider-original-img" src="${this.rawOriginalSource || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'}">
              <span class="hp-slider-label hp-slider-label-left">BEFORE (RAW)</span>

              <!-- Overlayer: Enhanced Studio Master (Clipped) -->
              <div class="hp-slider-enhanced-wrap" id="hp-enhanced-wrap" style="width: 50%;">
                <img id="image-preview-element" class="hp-slider-enhanced-img" src="${this.enhanced4KSource || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'}">
                <span class="hp-slider-label hp-slider-label-right">AFTER (STUDIO)</span>
              </div>

              <!-- Draggable Divider Handle -->
              <div class="hp-slider-handle" id="hp-slider-handle" style="left: 50%;">
                <div class="hp-slider-handle-circle">‹ ›</div>
              </div>

              <!-- 4K Studio Quality Badge -->
              <div id="preview-4k-badge" style="position: absolute; bottom: 8px; left: 8px; z-index: 10; background: rgba(14,22,34,0.88); backdrop-filter: blur(6px); border: 1px solid rgba(213,183,122,0.6); color: #D5B77A; padding: 3px 8px; border-radius: 12px; font-size: 0.64rem; font-weight: 800; letter-spacing: 0.5px;">
                ✨ AUTO STUDIO PHOTOGRAPHY CALIBRATED
              </div>
            </div>

            <!-- Interactive Range Bar to adjust split -->
            <input type="range" min="0" max="100" value="50" class="hp-split-range-input" id="hp-split-range" oninput="window.admin.setSplitSliderPosition(this.value)">

            <div style="font-size: 0.70rem; color: #8C9BAE; display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
              <span>Drag slider above or tap tabs to compare raw vs studio master</span>
              <span id="preview-engine-status" style="color: #4ADE80; font-weight: 700;">● Studio Engine Active</span>
            </div>

            <!-- Revert / Approve / Download Action Bar -->
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 8px;">
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
          <div style="background: rgba(14,22,34,0.7); border: 1px solid rgba(213,183,122,0.3); border-radius: 8px; padding: 10px;">
            <div style="font-size: 0.74rem; font-weight: 800; color: var(--brass-light); margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
              <span>&#x1F3A8; Background Removal & Surface Engine</span>
              <span style="font-size: 0.68rem; color: #94A3B8;">Automatic plate segmentation</span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;" id="bg-engine-chips">
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
            <div id="cutout-tolerance-panel" style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(213,183,122,0.2); ${['cutout', 'slate_gold', 'teak_wood', 'cream_marble', 'pedestal'].includes(this.activeBackgroundMode) ? 'display: block;' : 'display: none;'}">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.70rem; color: #CBD5E1; margin-bottom: 3px;">
                <span>Edge Detection Sensitivity (Cutout Tolerance)</span>
                <span id="lbl-tolerance" style="font-weight: 800; color: var(--brass-light);">${this.activeImageOptions.tolerance || 42}</span>
              </div>
              <input type="range" id="param-cutout-tolerance" min="15" max="90" value="${this.activeImageOptions.tolerance || 42}" style="width: 100%;" oninput="window.admin.updateCutoutTolerance(this.value)">
              <div style="font-size: 0.65rem; color: #8C9BAE; margin-top: 2px;">Slide right if background still shows; slide left if plate edges get clipped.</div>
            </div>
          </div>

          <!-- 2. Camera Angle, Tilt & View Engine Panel -->
          <div style="background: rgba(14,22,34,0.7); border: 1px solid rgba(213,183,122,0.3); border-radius: 8px; padding: 10px;">
            <div style="font-size: 0.74rem; font-weight: 800; color: var(--brass-light); margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
              <span>&#x1F4D0; Camera Angle, Tilt & View Engine</span>
              <button type="button" class="slide-action-btn" style="padding: 2px 8px; font-size: 0.65rem;" onclick="window.admin.resetAngleAndView()">&#x21BA; Reset View</button>
            </div>

            <!-- Rotation & Quick Turn -->
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; margin-bottom: 8px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.70rem; color: #CBD5E1; margin-bottom: 2px;">
                  <span>Plate Rotation</span>
                  <span id="lbl-angle-rotation" style="font-weight: 800; color: var(--brass-light);">${this.activeImageOptions.rotation || 0}&deg;</span>
                </div>
                <input type="range" id="param-rotation" min="-45" max="45" value="${this.activeImageOptions.rotation || 0}" style="width: 100%;" oninput="window.admin.updateAngleOption('rotation', this.value)">
              </div>
              <div style="display: flex; gap: 4px; padding-top: 14px;">
                <button type="button" class="btn-theme-engine-chip" style="padding: 3px 7px; font-size: 0.68rem;" onclick="window.admin.adjustRotation(-90)" title="Rotate 90 counter-clockwise">&#x27F2; -90&deg;</button>
                <button type="button" class="btn-theme-engine-chip" style="padding: 3px 7px; font-size: 0.68rem;" onclick="window.admin.adjustRotation(90)" title="Rotate 90 clockwise">&#x27F3; +90&deg;</button>
              </div>
            </div>

            <!-- 2.5D Camera Pitch (Tilt) & Yaw (Perspective) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.70rem; color: #CBD5E1; margin-bottom: 2px;">
                  <span>Camera Pitch (Tilt)</span>
                  <span id="lbl-angle-tilt" style="font-weight: 800; color: var(--brass-light);">${this.activeImageOptions.tilt || 0}&deg;</span>
                </div>
                <input type="range" id="param-tilt" min="-30" max="30" value="${this.activeImageOptions.tilt || 0}" style="width: 100%;" oninput="window.admin.updateAngleOption('tilt', this.value)" title="Simulates overhead (flat) vs eye-level perspective angle">
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.70rem; color: #CBD5E1; margin-bottom: 2px;">
                  <span>Perspective (Yaw)</span>
                  <span id="lbl-angle-yaw" style="font-weight: 800; color: var(--brass-light);">${this.activeImageOptions.yaw || 0}&deg;</span>
                </div>
                <input type="range" id="param-yaw" min="-30" max="30" value="${this.activeImageOptions.yaw || 0}" style="width: 100%;" oninput="window.admin.updateAngleOption('yaw', this.value)" title="Simulates viewing the dish from left or right">
              </div>
            </div>

            <!-- Scale (Zoom) & Pan Position -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 8px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.70rem; color: #CBD5E1; margin-bottom: 2px;">
                  <span>Zoom</span>
                  <span id="lbl-angle-scale" style="font-weight: 800; color: var(--brass-light);">${Number(this.activeImageOptions.scale || 1.0).toFixed(2)}x</span>
                </div>
                <input type="range" id="param-scale" min="0.5" max="1.8" step="0.05" value="${this.activeImageOptions.scale || 1.0}" style="width: 100%;" oninput="window.admin.updateAngleOption('scale', this.value)">
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.70rem; color: #CBD5E1; margin-bottom: 2px;">
                  <span>Pan X</span>
                  <span id="lbl-angle-panX" style="font-weight: 800; color: var(--brass-light);">${this.activeImageOptions.panX || 0}px</span>
                </div>
                <input type="range" id="param-pan-x" min="-120" max="120" value="${this.activeImageOptions.panX || 0}" style="width: 100%;" oninput="window.admin.updateAngleOption('panX', this.value)">
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.70rem; color: #CBD5E1; margin-bottom: 2px;">
                  <span>Pan Y</span>
                  <span id="lbl-angle-panY" style="font-weight: 800; color: var(--brass-light);">${this.activeImageOptions.panY || 0}px</span>
                </div>
                <input type="range" id="param-pan-y" min="-120" max="120" value="${this.activeImageOptions.panY || 0}" style="width: 100%;" oninput="window.admin.updateAngleOption('panY', this.value)">
              </div>
            </div>

            <!-- Flip Buttons -->
            <div style="display: flex; gap: 6px;">
              <button type="button" id="btn-flip-h" class="btn-theme-engine-chip ${this.activeImageOptions.flipH ? 'active' : ''}" style="flex: 1;" onclick="window.admin.toggleFlip('h', this)">
                &#x21C6; Flip Horizontal
              </button>
              <button type="button" id="btn-flip-v" class="btn-theme-engine-chip ${this.activeImageOptions.flipV ? 'active' : ''}" style="flex: 1;" onclick="window.admin.toggleFlip('v', this)">
                &#x21C5; Flip Vertical
              </button>
            </div>
          </div>          <!-- Auto 4K Fine-Tuning Drawer / Sliders -->
          <div style="background: rgba(14,22,34,0.5); border: 1px solid rgba(213,183,122,0.2); border-radius: 8px; padding: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; cursor: pointer;" onclick="const d = document.getElementById('engine-fine-tuning-box'); d.style.display = d.style.display === 'none' ? 'block' : 'none';">
              <span style="font-size: 0.75rem; font-weight: 800; color: var(--brass-light);">⚙️ 4K Studio Tone & Light Parameters</span>
              <span style="font-size: 0.70rem; color: var(--brass-light); text-decoration: underline;">Toggle Adjustments ▼</span>
            </div>
            <div id="engine-fine-tuning-box" style="display: none; padding-top: 6px; font-size: 0.72rem;">
              <label style="display:block;color:#eee8de;margin-bottom:10px;"><input type="checkbox" id="engine-adjust-colors" onchange="window.admin.recalculate4KLive()"> Adjust dish colors (optional). Leave off to preserve the original food colors.</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 6px;">
                <div>
                  <label style="color: #CBD5E1; display: block; margin-bottom: 2px;">Warmth (Kelvin)</label>
                  <input type="range" id="param-warmth" min="0" max="20" value="8" style="width: 100%;" oninput="window.admin.recalculate4KLive()">
                </div>
                <div>
                  <label style="color: #CBD5E1; display: block; margin-bottom: 2px;">4K Clarity (Sharpness)</label>
                  <input type="range" id="param-sharpness" min="0" max="50" value="28" style="width: 100%;" oninput="window.admin.recalculate4KLive()">
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div>
                  <label style="color: #CBD5E1; display: block; margin-bottom: 2px;">Contrast & Depth</label>
                  <input type="range" id="param-contrast" min="95" max="125" value="108" style="width: 100%;" oninput="window.admin.recalculate4KLive()">
                </div>
                <div>
                  <label style="color: #CBD5E1; display: block; margin-bottom: 2px;">Studio Vignette</label>
                  <input type="range" id="param-vignette" min="0" max="70" value="38" style="width: 100%;" oninput="window.admin.recalculate4KLive()">
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="form-label">Option 1: Upload Raw Photo from Phone / Camera</label>
            <input type="file" accept="image/*" class="form-input" style="padding: 6px;" onchange="window.admin.handleImageFileUpload(this)">
          </div>

          <div>
            <label class="form-label">Option 2: Paste Web Image URL</label>
            <input type="text" id="image-url-input-field" value="${hasPhoto && !dish.image.startsWith('data:') ? dish.image : ''}" class="form-input" placeholder="https://..." oninput="window.admin.updatePreviewFromUrl(this.value)">
          </div>

          <div>
            <label class="form-label">Option 3: Reuse This Dish’s Saved Photos</label>
            <p style="font-size: 0.75rem; color: var(--text-muted);">Only photos already assigned to this dish are shown; verify they depict the correct food. Upload a real dish photo if none matches.</p>
            <div id="dish-saved-photo-options" class="preset-image-grid" style="max-height: 120px; overflow-y: auto;"></div>
            <p style="font-size: 0.75rem; color: var(--text-muted);">Natural Polish adjusts lighting. Studio modes create local surface treatments, not AI-generated scenes. Saves stay on this device; cloud generation and publishing are not connected.</p>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px;">
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

    if (confirm(`Remove the photo for "${dish.name}"?\n\nThe dish will be shown in Pure Veg mode without photo until you upload a new one.`)) {
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
      this.closeImageModal();
      window.app.showToast(`Photo removed for "${dish.name}". Showing in text-only mode!`, 'info');
    }
  }

  closeImageModal() {
    this.previewRequestId = (this.previewRequestId || 0) + 1;
    this.isPreviewProcessing = false;
    this.previewFailed = false;
    const modal = document.getElementById('image-replace-modal');
    if (modal) modal.classList.remove('active');
    this.activeImageDishId = null;
    this.activeRoomId = null;
    this.activeRoomPhotoIndex = null;
    this.editingSlideContext = null;
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
        b.style.background = 'transparent';
        b.style.color = '#B2C0D1';
      }
    });

    if (mode === 'original') {
      if (wrap) wrap.style.width = '0%';
      if (handle) handle.style.display = 'none';
      if (range) range.style.display = 'none';
      if (badge) badge.style.display = 'none';
      if (btnOriginal) {
        btnOriginal.style.background = 'var(--brass-primary)';
        btnOriginal.style.color = '#000';
      }
    } else if (mode === 'enhanced') {
      if (wrap) wrap.style.width = '100%';
      if (handle) handle.style.display = 'none';
      if (range) range.style.display = 'none';
      if (badge) badge.style.display = 'block';
      if (btnEnhanced) {
        btnEnhanced.style.background = 'var(--brass-primary)';
        btnEnhanced.style.color = '#000';
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
        btnSplit.style.background = 'var(--brass-primary)';
        btnSplit.style.color = '#000';
      }
    }
  }

  async revertActiveDishToOriginal() {
    if (!this.activeImageDishId) return;
    if (!this.rawOriginalSource) {
      alert('No raw original photo found for this dish.');
      return;
    }

    if (confirm('Revert this dish to its untouched original photo?')) {
      this.tempImageSource = this.rawOriginalSource;
      this.currentEnhancementStatus = 'original';

      if (window.HOTEL_STORAGE && typeof window.HOTEL_STORAGE.revertDishToOriginal === 'function') {
        await window.HOTEL_STORAGE.revertDishToOriginal(this.activeImageDishId);
      }

      const dish = window.app.menuData.find(d => d.id === this.activeImageDishId);
      if (dish) {
        dish.image = this.rawOriginalSource;
        window.app.saveMenuData();
        window.app.renderMenu();
      }

      this.toggleComparisonMode('original');
      const badge = document.getElementById('lifecycle-status-badge');
      if (badge) {
        badge.className = 'hp-status-pill hp-status-original';
        badge.innerText = 'RAW ORIGINAL';
      }
      window.app.showToast('Reverted to raw camera photo!', 'info');
    }
  }

  async approveActiveDishPhoto() {
    if (!this.activeImageDishId || this.isPreviewProcessing || this.previewFailed) return;

    const dishId = this.activeImageDishId;
    this.currentEnhancementStatus = 'approved';
    await this.saveReplacedImage();

    this.currentEnhancementStatus = 'approved';
    if (window.HOTEL_STORAGE && typeof window.HOTEL_STORAGE.approveDishEnhancedPhoto === 'function') {
      await window.HOTEL_STORAGE.approveDishEnhancedPhoto(dishId);
    }

    const badge = document.getElementById('lifecycle-status-badge');
    if (badge) {
      badge.className = 'hp-status-pill hp-status-approved';
      badge.innerText = `APPROVED MASTER (${this.currentQualityScore}%)`;
    }
    window.app.showToast('Enhanced photo approved as official menu master!', 'success');
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

  downloadEnhancedAsset() {
    if (!this.tempImageSource) {
      window.app?.showToast?.('No processed asset available to download.', 'warning');
      return;
    }
    const dish = window.app?.menuData?.find(d => d.id === this.activeImageDishId) || { name: 'dish' };
    const isPng = (this.activeBackgroundMode === 'cutout') || (typeof this.tempImageSource === 'string' && this.tempImageSource.startsWith('data:image/png'));
    const ext = isPng ? 'png' : 'jpg';
    const safeName = (dish.name || 'dish').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const mode = this.activeBackgroundMode || 'enhanced';
    const filename = `${safeName}_${mode}.${ext}`;

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
    const saveButton = document.getElementById('apply-dish-photo-btn');
    if (saveButton) saveButton.disabled = true;
    this.previewDebounceTimer = setTimeout(() => {
      if (this.isPreviewProcessing) { this.previewQueued = true; return; }
      this.runImagePreview();
    }, 180);
  }

  async runImagePreview() {
    if (!this.rawOriginalSource) return;
    const requestId = this.previewRequestId = (this.previewRequestId || 0) + 1;
    const source = this.rawOriginalSource;
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
        const result = await window.AssetPipeline.processAutomaticStudioEnhancement(this.rawOriginalSource, dish, {
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
        if (requestId !== this.previewRequestId || source !== this.rawOriginalSource || dishId !== this.activeImageDishId) return;
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
      } catch (e) {
        if (requestId === this.previewRequestId) this.previewFailed = true;
        if (requestId === this.previewRequestId && status) status.innerText = 'Preview failed. Try uploading the photo directly.';
      } finally {
        if (requestId === this.previewRequestId) {
          this.isPreviewProcessing = false;
          if (saveButton) saveButton.disabled = this.previewFailed;
          if (this.previewQueued) {
            this.previewQueued = false;
            this.recalculate4KLive();
          }
        }
      }
    }
  }

  async handleImageFileUpload(input) {
    const file = input && input.files ? input.files[0] : null;
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please choose a JPG, PNG or WebP photo.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('Please choose a photo smaller than 20 MB.');
      return;
    }
    this.previewFailed = false;

    try {
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast('Studio Engine: Ingesting raw photo...', 'info');
      }
      const status = document.getElementById('preview-engine-status');
      if (status) status.innerText = '⚙️ Analyzing Food & Calibrating 3200K Studio...';

      // Read raw source for instant A/B comparison
      const rawDataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      this.rawOriginalSource = rawDataUrl;

      const origEl = document.getElementById('image-original-element');
      if (origEl) origEl.src = rawDataUrl;

      const dish = (window.app && window.app.menuData ? window.app.menuData.find(d => d.id === this.activeImageDishId) : null) || {};

      // Run live calibration with active image options (background, angle, tilt, tolerance, etc.)
      await this.recalculate4KLive();

      const urlInput = document.getElementById('image-url-input-field');
      if (urlInput) urlInput.value = '(Uploaded from device)';
      if (typeof this.toggleComparisonMode === 'function') {
        this.toggleComparisonMode('split');
      }
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast(this.currentEnhancementStatus === 'original'
          ? 'Original photo ready. Select a studio treatment only if needed.'
          : this.currentEnhancementStatus === 'natural'
            ? `Natural Polish V3 ready. Category: ${category}, Score: ${qualityScore}%.`
            : `Studio preview ready. Category: ${category}, Score: ${qualityScore}%.`, 'success');
      }
    } catch (err) {
      console.error('handleImageFileUpload error:', err);
      // Fallback: never block the user from uploading an image
      try {
        const fallback = await this.compressAndResizeImage(file);
        this.tempImageSource = fallback;
        this.enhanced4KSource = fallback;
        const preview = document.getElementById('image-preview-element');
        if (preview) preview.src = fallback;
        if (window.app && typeof window.app.showToast === 'function') {
          window.app.showToast('Photo uploaded successfully (standard compression mode)', 'success');
        }
      } catch (fallbackErr) {
        alert('Failed to process image file: ' + err.message);
      }
    }
  }

  async updatePreviewFromUrl(url) {
    const trimmed = url.trim();
    if (!trimmed) return;
    try {
      const parsed = new URL(trimmed);
      if (!['https:', 'http:'].includes(parsed.protocol)) return;
    } catch (e) { return; }
    this.rawOriginalSource = trimmed;
    this.tempImageSource = trimmed;
    const preview = document.getElementById('image-preview-element');
    const origEl = document.getElementById('image-original-element');
    if (preview) preview.src = trimmed;
    if (origEl) origEl.src = trimmed;

    await this.recalculate4KLive();
  }

  async selectPresetImage(url) {
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

  async saveReplacedImage() {
    if (this.isPreviewProcessing || this.previewFailed) return;
    if (!this.activeImageDishId || !this.tempImageSource) return;

    const dish = window.app.menuData.find(d => d.id === this.activeImageDishId);
    if (dish) {
      // Permanent Dual Photo Preservation in Storage with Lifecycle tracking
      try {
      if (window.HOTEL_STORAGE && typeof window.HOTEL_STORAGE.saveDishPhotoLifecycle === 'function') {
        await window.HOTEL_STORAGE.saveDishPhotoLifecycle(dish.id, {
          enhancedMasterImage: this.tempImageSource,
          rawOriginalImage: this.rawOriginalSource || this.tempImageSource,
          enhancementStatus: this.currentEnhancementStatus || 'enhanced',
          qualityScore: this.currentQualityScore || 90,
          backgroundType: this.activeBackgroundMode || 'original',
          imageOptions: { ...(this.activeImageOptions || {}) },
          styleVersion: 'hp-studio-v3.0'
        });
      } else if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveDishOverride(dish.id, { image: this.tempImageSource });
      } else {
        throw new Error('Photo storage is not ready. Reload and retry.');
      }
      } catch (error) {
        window.app.showToast(error.message || 'Photo could not be saved. Please retry.', 'error');
        throw error;
      }
      dish.image = this.tempImageSource;
      window.app.saveMenuData();

      // Direct live DOM updates so changes reflect immediately without needing reload
      const cardImg = document.getElementById(`dish-img-el-${dish.id}`);
      if (cardImg) {
        if (cardImg.tagName === 'IMG') {
          cardImg.src = this.tempImageSource;
        } else {
          window.app.renderMenu();
        }
      }

      const modalImg = document.getElementById('detail-modal-img');
      if (modalImg && modalImg.tagName === 'IMG') {
        modalImg.src = this.tempImageSource;
      }

      const thumbImg = document.getElementById(`admin-dish-thumb-${dish.id}`);
      if (thumbImg) thumbImg.src = this.tempImageSource;

      window.app.renderCategoryCards();
      if (window.app.currentCategory && window.app.currentCategory !== 'all') {
        window.app.renderSectionSlideshow(window.app.currentCategory);
      }
      window.app.renderMenu();
      this.filterAdminDishes();
      if (document.getElementById('studio-dishes-grid')) {
        this.renderAIStudioManager(document.getElementById('admin-tab-content'));
      }
      this.closeImageModal();
      window.app.showToast(`Updated studio photo for "${dish.name}"!`, 'success');
    }
  }

  // ==================== 1B. AI PHOTO STUDIO & BATCH PHOTOGRAPHY HUB ====================
  async renderAIStudioManager(container) {
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
      settings = await window.HOTEL_STORAGE.getAISettings() || settings;
    }
    // Collect overrides from storage
    const overrides = (window.HOTEL_STORAGE && typeof window.HOTEL_STORAGE.getAllDishOverrides === 'function')
      ? await window.HOTEL_STORAGE.getAllDishOverrides()
      : {};

    let approvedCount = 0;
    if (renderId !== this.studioRenderId || this.currentTab !== 'ai-studio') return;
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
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: linear-gradient(135deg, rgba(14,22,34,0.95), rgba(22,32,53,0.92)); border: 1.5px solid var(--brass-primary); border-radius: var(--radius-md); padding: 18px; color: #FFF;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
            <div>
              <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(213,183,122,0.15); border: 1px solid rgba(213,183,122,0.4); border-radius: 20px; padding: 3px 10px; font-size: 0.68rem; color: #D5B77A; font-weight: 800; margin-bottom: 6px;">
                ✨ HOTEL PREMIER CULINARY PHOTOGRAPHY ENGINE
              </div>
              <h3 style="font-family: var(--font-royal); font-size: 1.35rem; color: #FFF; margin: 0 0 4px;">
                Automated 3200K Food Photography Studio
              </h3>
              <p style="font-size: 0.80rem; color: #94A3B8; margin: 0; max-width: 680px; line-height: 1.4;">
                Automatically identifies dishes, preserves authentic food ingredients, isolates messy table backgrounds onto luxury midnight slate or warm teak tables, casts realistic 3D contact shadows, and standardizes all menu imagery to Hotel Premier's 5-star brand identity.
              </p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn-theme-engine-chip active" style="padding: 8px 14px; font-size: 0.78rem;" onclick="window.admin.batchCalibrateAllDishes()">
                ⚡ Auto-Enhance All Dishes (${withPhotos.length})
              </button>
            </div>
          </div>

          <!-- Studio KPI Statistics -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
            <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(213,183,122,0.25); border-radius: 8px; padding: 10px; text-align: center;">
              <div style="font-size: 1.3rem; font-weight: 900; color: #D5B77A;">${withPhotos.length} / ${dishes.length}</div>
              <div style="font-size: 0.70rem; color: #94A3B8; text-transform: uppercase;">Photos Assigned</div>
            </div>
            <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(74,222,128,0.25); border-radius: 8px; padding: 10px; text-align: center;">
              <div style="font-size: 1.3rem; font-weight: 900; color: #4ADE80;">${studioMasterCount}</div>
              <div style="font-size: 0.70rem; color: #94A3B8; text-transform: uppercase;">Studio Masters</div>
            </div>
            <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(56,189,248,0.25); border-radius: 8px; padding: 10px; text-align: center;">
              <div style="font-size: 1.3rem; font-weight: 900; color: #38BDF8;">${approvedCount}</div>
              <div style="font-size: 0.70rem; color: #94A3B8; text-transform: uppercase;">Approved Masters</div>
            </div>
            <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(248,113,113,0.25); border-radius: 8px; padding: 10px; text-align: center;">
              <div style="font-size: 1.3rem; font-weight: 900; color: #F87171;">${withoutPhotos.length}</div>
              <div style="font-size: 0.70rem; color: #94A3B8; text-transform: uppercase;">Awaiting Photos</div>
            </div>
          </div>
        </div>

        <!-- Studio Global Brand Surface Policy -->
        <div style="background: rgba(14,22,34,0.6); border: 1px solid rgba(213,183,122,0.3); border-radius: 8px; padding: 12px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="font-weight: 800; font-size: 0.82rem; color: var(--brass-light); display: flex; align-items: center; gap: 6px;">
                <span>&#x2699;&#xFE0F;</span> <span>Signature Default Studio Surface</span>
              </div>
              <div style="font-size: 0.70rem; color: #8C9BAE;">New food uploads and batch calibrations will default to this luxury surface backdrop.</div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <select id="ai-setting-surface" class="form-select" style="min-width: 260px; font-size: 0.75rem;" onchange="window.admin.saveAIStudioSettings()">
                <option value="slate_gold" ${settings.defaultStyle === 'slate_gold' ? 'selected' : ''}>Midnight Slate & Imperial Gold (Brand Signature)</option>
                <option value="teak_wood" ${settings.defaultStyle === 'teak_wood' ? 'selected' : ''}>Warm Teak & Walnut Wood (Breads & Snacks)</option>
                <option value="cream_marble" ${settings.defaultStyle === 'cream_marble' ? 'selected' : ''}>Refined Italian Cream Marble (Beverages & Desserts)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Filter Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn-theme-engine-chip active" id="studio-filter-all" onclick="window.admin.filterStudioGallery('all', this)">All Dishes (${dishes.length})</button>
            <button class="btn-theme-engine-chip" id="studio-filter-photos" onclick="window.admin.filterStudioGallery('with-photos', this)">With Photos (${withPhotos.length})</button>
            <button class="btn-theme-engine-chip" id="studio-filter-missing" onclick="window.admin.filterStudioGallery('missing-photos', this)">Needs Photo (${withoutPhotos.length})</button>
          </div>
          <button type="button" class="studio-button" onclick="window.admin.switchTab('slides')">Section photos & captions</button>
          <input type="text" placeholder="Search dishes..." class="form-input" style="max-width: 240px; padding: 6px 12px; font-size: 0.8rem;" oninput="window.admin.searchStudioGallery(this.value)">
        </div>

        <!-- Gallery Grid -->
        <div id="studio-dishes-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
          ${dishes.filter(dish => !dish.groupedUnder).map(dish => {
            const hasPhoto = dish.image && dish.image.trim() !== '';
            const rec = overrides[dish.id];
            const status = rec ? rec.enhancementStatus : (hasPhoto ? 'enhanced' : 'none');
            const score = rec ? rec.qualityScore : (hasPhoto ? 92 : null);

            return `
              <div class="studio-card-item" data-has-photo="${hasPhoto ? '1' : '0'}" data-name="${dish.name.toLowerCase()}" style="background: #FFF; border: 1.5px solid var(--cream-border); border-radius: var(--radius-sm); overflow: hidden; display: flex; flex-direction: column; box-shadow: var(--shadow-sm);">
                <div style="position: relative; height: 140px; background: #0D111A; overflow: hidden; cursor: pointer;" onclick="window.admin.openImageModal('${dish.id}')">
                  ${hasPhoto ? `
                    <img src="${dish.image}" loading="lazy" decoding="async" style="width: 100%; height: 100%; object-fit: cover;" alt="${dish.name}">
                    <span class="hp-status-pill hp-status-${status}" style="position: absolute; top: 6px; left: 6px; font-size: 0.60rem;">
                      ${status.toUpperCase()}${score ? ` (${score}%)` : ''}
                    </span>
                  ` : `
                    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #8C9BAE; padding: 10px; text-align: center;">
                      <span style="font-size: 1.8rem;">🌱</span>
                      <span style="font-size: 0.72rem; font-weight: 700; color: var(--brass-light); margin-top: 2px;">No Photo</span>
                      <span style="font-size: 0.62rem; color: #64748B;">Tap to upload & calibrate</span>
                    </div>
                  `}
                  <button type="button" class="btn-detail-photo-action" style="position: absolute; bottom: 6px; right: 6px; font-size: 0.68rem; padding: 4px 8px;" onclick="event.stopPropagation(); window.admin.openImageModal('${dish.id}')">
                    ${hasPhoto ? '✨ Studio A/B' : '📷 Upload'}
                  </button>
                </div>
                <div style="padding: 10px; display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1;">
                  <div>
                    <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">${dish.categoryId}</div>
                    <div style="font-weight: 800; font-size: 0.85rem; color: var(--terracotta-dark); margin: 2px 0 4px; line-height: 1.2;">${dish.name}</div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; border-top: 1px solid var(--cream-border); padding-top: 6px;">
                    <span style="font-weight: 800; color: var(--burgundy-deep); font-size: 0.85rem;">${dish.price === null ? 'Price on request' : `₹${dish.price}`}</span>
                    <button class="slide-action-btn" style="font-size: 0.70rem; padding: 2px 6px;" onclick="window.admin.openImageModal('${dish.id}')">Calibrate ⚙️</button>
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

  async batchCalibrateAllDishes() {
    const dishesWithPhotos = (window.app.menuData || []).filter(d => d.image && d.image.trim() !== '');
    if (dishesWithPhotos.length === 0) {
      alert('No dishes currently have photos to calibrate.');
      return;
    }

    if (!confirm(`Apply Natural Polish to ${dishesWithPhotos.length} dishes? Original framing is preserved, with gentle tone and clarity adjustments. Originals remain available to restore.`)) {
      return;
    }

    window.app.showToast(`Batch calibrating ${dishesWithPhotos.length} dishes in background...`, 'info');
    let processed = 0;

    for (const dish of dishesWithPhotos) {
      try {
        if (window.AssetPipeline && typeof window.AssetPipeline.processAutomaticStudioEnhancement === 'function') {
          const record = await window.HOTEL_STORAGE?.getDishOverride(dish.id);
          const rawOriginalImage = record?.rawOriginalImage || dish.image;
          const res = await window.AssetPipeline.processAutomaticStudioEnhancement(rawOriginalImage, dish, {
            backgroundMode: 'natural',
            framingMode: 'smart'
          });
          if (res && res.enhancedDataUrl) {
            dish.image = res.enhancedDataUrl;
            if (window.HOTEL_STORAGE) {
              await window.HOTEL_STORAGE.saveDishPhotoLifecycle(dish.id, {
                enhancedMasterImage: res.enhancedDataUrl,
                rawOriginalImage,
                enhancementStatus: res.status,
                qualityScore: res.qualityScore || 92,
                backgroundType: 'natural',
                styleVersion: 'hp-studio-v3.0'
              });
            }
            processed++;
          }
        }
      } catch (e) {
        console.warn(`Could not enhance dish ${dish.id}:`, e);
      }
    }

    window.app.saveMenuData();
    window.app.renderCategoryCards();
    window.app.renderMenu();
    this.renderAIStudioManager(document.getElementById('admin-tab-content'));
    window.app.showToast(`Batch studio calibration complete! ${processed} dishes upgraded.`, 'success');
  }

  // ==================== 2. ROOMS & TARIFF CMS & MULTI-PHOTO GALLERIES ====================
  async renderRoomsManager(container) {
    const rooms = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories) 
      ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories 
      : [];

    const bulkDeals = this.getBulkDeals();

    // Fetch live galleries and tariff overrides for each room
    const liveGalleries = {};
    for (const r of rooms) {
      const defaultImgs = (r.images && r.images.length > 0) ? r.images : [r.image];
      if (window.HOTEL_STORAGE) {
        liveGalleries[r.id] = await window.HOTEL_STORAGE.getRoomGallery(r.id, defaultImgs);
      } else {
        liveGalleries[r.id] = defaultImgs;
      }
    }

    container.innerHTML = `
      <div style="margin-bottom: 16px;">
        <h4 style="font-family: var(--font-royal); font-size: 1.15rem; color: var(--terracotta-dark); margin-bottom: 4px;">Hotel Premier Room Multi-Photo & Deals Manager</h4>
        <p style="font-size: 0.8rem; color: var(--text-muted);">
          Total Inventory: <strong>14 AC Rooms</strong> (2 Royale King + 4 Signature Queen + 8 Companion Twin). Reorder, replace or add photos, update tariffs, and customize group packages. Saves apply to this browser; export a backup for publishing.
        </p>
      </div>

      <!-- Room Multi-Photo Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 16px; margin-bottom: 24px;">
        ${rooms.map(room => {
          const gallery = liveGalleries[room.id] || [room.image];
          return `
            <div style="background: #FFF; border: 1.5px solid var(--cream-border); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column;">
              <div style="padding: 14px; border-bottom: 1px solid var(--cream-border); background: var(--cream-bg);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                  <h5 style="font-family: var(--font-royal); font-size: 1.05rem; color: var(--terracotta-dark); margin: 0;">${room.name}</h5>
                  <span style="background: var(--terracotta-dark); color: var(--gold-light); font-size: 0.68rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;">${room.inventoryCount || ''}</span>
                </div>
                <div style="font-size: 0.75rem; color: var(--gold-primary); font-weight: 800;">${room.bedType}</div>
              </div>

              <div style="padding: 14px; flex-grow: 1; display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.78rem; font-weight: 800; color: var(--terracotta-dark);">Room Slideshow Photos (${gallery.length})</span>
                  <button class="btn-primary" style="font-size: 0.72rem; padding: 4px 10px;" onclick="window.admin.openAddRoomPhotoModal('${room.id}')">
                    ➕ Add Photo
                  </button>
                </div>

                <!-- Thumbnails Gallery with Reorder, Replace & Cover Controls -->
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px;">
                  ${gallery.map((imgUrl, idx) => `
                    <div style="background: var(--cream-bg); border: 1.5px solid ${idx === 0 ? 'var(--gold-primary)' : 'var(--cream-border)'}; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column;">
                      <div style="position: relative; height: 85px;">
                        <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='${room.image}'">
                        ${idx === 0 ? '<span style="position: absolute; top: 3px; left: 3px; background: var(--gold-primary); color: #FFF; font-size: 0.58rem; font-weight: 900; padding: 1px 5px; border-radius: 3px;">👑 COVER</span>' : ''}
                        <button onclick="window.admin.removeRoomPhoto('${room.id}', ${idx})" style="position: absolute; top: 3px; right: 3px; background: rgba(220,38,38,0.85); color: #FFF; border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center;" title="Delete this photo">✕</button>
                      </div>
                      <div style="padding: 5px; display: flex; justify-content: space-between; gap: 3px; background: #FFF; border-top: 1px solid var(--cream-border);">
                        <button class="slide-action-btn" style="padding: 2px 5px; font-size: 0.65rem;" onclick="window.admin.openReplaceRoomPhotoModal('${room.id}', ${idx})" title="Change / Replace this photo">✏️ Replace</button>
                        ${idx > 0 ? `<button class="slide-action-btn" style="padding: 2px 5px; font-size: 0.65rem;" onclick="window.admin.setRoomCoverPhoto('${room.id}', ${idx})" title="Make this cover photo">⭐ Cover</button>` : ''}
                        <div style="display: flex; gap: 2px;">
                          ${idx > 0 ? `<button class="slide-action-btn" style="padding: 2px 4px; font-size: 0.65rem;" onclick="window.admin.moveRoomPhoto('${room.id}', ${idx}, -1)" title="Move Left">◀</button>` : ''}
                          ${idx < gallery.length - 1 ? `<button class="slide-action-btn" style="padding: 2px 4px; font-size: 0.65rem;" onclick="window.admin.moveRoomPhoto('${room.id}', ${idx}, 1)" title="Move Right">▶</button>` : ''}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- Editable Room Tariffs -->
                <div style="background: var(--cream-bg); padding: 10px; border-radius: 6px; border: 1px solid var(--cream-border); font-size: 0.75rem;">
                  <div style="font-weight: 800; color: var(--terracotta-dark); margin-bottom: 6px;">Room Tariffs (Editable):</div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 6px;">
                    <div>
                      <label class="form-label" style="font-size: 0.7rem;">Single RO (₹)</label>
                      <input type="number" id="room-s-ro-${room.id}" value="${room.tariff.single.roomOnly}" class="form-input" style="padding: 4px 6px; font-size: 0.8rem; font-weight: 800;">
                    </div>
                    <div>
                      <label class="form-label" style="font-size: 0.7rem;">Single CP (₹)</label>
                      <input type="number" id="room-s-cp-${room.id}" value="${room.tariff.single.withBreakfast}" class="form-input" style="padding: 4px 6px; font-size: 0.8rem; font-weight: 800;">
                    </div>
                    <div>
                      <label class="form-label" style="font-size: 0.7rem;">Double RO (₹)</label>
                      <input type="number" id="room-d-ro-${room.id}" value="${room.tariff.double.roomOnly}" class="form-input" style="padding: 4px 6px; font-size: 0.8rem; font-weight: 800;">
                    </div>
                    <div>
                      <label class="form-label" style="font-size: 0.7rem;">Double CP (₹)</label>
                      <input type="number" id="room-d-cp-${room.id}" value="${room.tariff.double.withBreakfast}" class="form-input" style="padding: 4px 6px; font-size: 0.8rem; font-weight: 800;">
                    </div>
                  </div>
                  <button class="slide-action-btn primary" style="width: 100%; justify-content: center; padding: 6px;" onclick="window.admin.saveRoomTariff('${room.id}')">
                    💾 Save ${room.name} Tariffs
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- ==================== EDITABLE BULK BOOKING DEALS CMS ==================== -->
      <div style="background: #FFF; border: 2px solid var(--gold-primary); border-radius: var(--radius-md); padding: 18px; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h4 style="font-family: var(--font-royal); font-size: 1.15rem; color: var(--terracotta-dark); margin: 0;">💍 Edit Advance Bulk Marriage & Event Deals</h4>
            <p style="font-size: 0.78rem; color: var(--text-muted); margin: 2px 0 0;">
              Customize package names, discount percentages, and perks for wedding blocks & full property buyouts.
            </p>
          </div>
          <button class="btn-secondary" style="font-size: 0.75rem; padding: 5px 12px;" onclick="window.admin.resetBulkDealsToDefault()">
            🔄 Reset to Defaults
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;" id="admin-bulk-deals-list">
          ${bulkDeals.map((deal, idx) => `
            <div style="background: var(--cream-bg); border: 1px solid var(--cream-border); border-radius: var(--radius-sm); padding: 12px;">
              <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; margin-bottom: 8px;">
                <div>
                  <label class="form-label">Tier Name</label>
                  <input type="text" id="bulk-deal-name-${idx}" value="${deal.name}" class="form-input" style="padding: 6px 10px; font-size: 0.82rem;">
                </div>
                <div>
                  <label class="form-label">Discount (%)</label>
                  <input type="number" id="bulk-deal-disc-${idx}" value="${deal.discountPercent}" class="form-input" style="padding: 6px 10px; font-size: 0.82rem; font-weight: 800;">
                </div>
                <div>
                  <label class="form-label">Min Rooms</label>
                  <input type="number" id="bulk-deal-min-${idx}" value="${deal.minRooms}" min="1" max="12" step="1" class="form-input" style="padding: 6px 10px; font-size: 0.82rem;">
                </div>
              </div>
              <div style="margin-bottom: 8px;">
                <label class="form-label">Badge Tag</label>
                <input type="text" id="bulk-deal-badge-${idx}" value="${deal.badge}" class="form-input" style="padding: 6px 10px; font-size: 0.82rem;">
              </div>
              <div>
                <label class="form-label">Perks & Inclusions (One per line)</label>
                <textarea id="bulk-deal-perks-${idx}" class="form-textarea" rows="3" style="font-size: 0.78rem;">${(deal.perks || []).join('\n')}</textarea>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="margin-top: 14px; text-align: right;">
          <button class="btn-primary" style="padding: 10px 24px;" onclick="window.admin.saveBulkDeals()">
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
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="text-align: center;">
            <div style="width: 100%; height: 180px; border-radius: 8px; overflow: hidden; border: 2px solid var(--gold-border); margin-bottom: 8px; background: var(--cream-darker);">
              <img id="image-preview-element" src="${currentImg}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Current Photo Preview</span>
          </div>

          <div>
            <label class="form-label">Option 1: Upload Photo from Phone / Camera</label>
            <input type="file" accept="image/*" class="form-input" style="padding: 6px;" onchange="window.admin.handleRoomImageUpload(this)">
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
                  <img src="${preset.url}" alt="${preset.name}">
                  <div class="preset-label">${preset.name}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px;">
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
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="text-align: center;">
            <div style="width: 100%; height: 180px; border-radius: 8px; overflow: hidden; border: 2px solid var(--gold-border); margin-bottom: 8px; background: var(--cream-darker);">
              <img id="image-preview-element" src="${room.image}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Photo Preview to Add</span>
          </div>

          <div>
            <label class="form-label">Option 1: Upload Room Photo from Phone / Camera</label>
            <input type="file" accept="image/*" class="form-input" style="padding: 6px;" onchange="window.admin.handleRoomImageUpload(this)">
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
                  <img src="${preset.url}" alt="${preset.name}">
                  <div class="preset-label">${preset.name}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px;">
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
      alert('Failed to process room photo: ' + err.message);
    }
  }

  async saveNewRoomPhoto() {
    if (!this.activeRoomId || !this.tempImageSource) {
      alert('Please choose or upload a photo first.');
      return;
    }

    const rooms = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.roomCategories) ? window.HOTEL_PREMIER_HOTEL_DATA.roomCategories : [];
    const room = rooms.find(r => r.id === this.activeRoomId);
    const defaultImgs = (room && room.images) ? room.images : [];

    let currentGallery = defaultImgs;
    if (window.HOTEL_STORAGE) {
      currentGallery = await window.HOTEL_STORAGE.getRoomGallery(this.activeRoomId, defaultImgs);
    }

    const updatedGallery = [...currentGallery, this.tempImageSource];

    if (window.HOTEL_STORAGE) {
      await window.HOTEL_STORAGE.saveRoomGallery(this.activeRoomId, updatedGallery);
    }

    if (window.app && typeof window.app.renderRoomCarousels === 'function') {
      await window.app.renderRoomCarousels();
    }

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
      alert('You must keep at least 1 photo for this room.');
      return;
    }

    if (confirm('Delete this photo from room slide show?')) {
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

  resetBulkDealsToDefault() {
    if (confirm('Reset all bulk booking packages to original defaults?')) {
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
    const categories = window.app.categories.filter(c => c.id !== 'all' && c.id !== 'chef-specials');
    if (!this.selectedCategoryForSlides && categories.length > 0) {
      this.selectedCategoryForSlides = categories[0].id;
    }

    container.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <h4 style="font-family: var(--font-royal); font-size: 1.15rem; color: var(--terracotta-dark); margin: 0;">Multi-Photo Slides Editor</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 2px 0 0;">
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
    const defaultSlides = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides)
      ? window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides
      : [];

    let currentSlides = defaultSlides;
    if (window.HOTEL_STORAGE) {
      currentSlides = await window.HOTEL_STORAGE.getSectionSlides('restaurant_hero', defaultSlides);
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
        <span style="font-size: 0.85rem; font-weight: 800; color: var(--terracotta-dark);">Main Restaurant Slides (${currentSlides.length})</span>
        <button class="btn-primary" style="font-size: 0.82rem; padding: 6px 14px;" onclick="window.admin.openAddSlideModal()">
          ➕ Add New Hero Slide
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
        ${currentSlides.map((slide, idx) => `
          <div class="slide-manage-card">
            <div class="slide-card-media">
              <img src="${slide.image}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80'">
              <span style="position: absolute; top: 8px; left: 8px; background: rgba(14,29,54,0.85); color: var(--gold-light); font-size: 0.68rem; font-weight: 900; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--gold-primary);">SLIDE ${idx + 1}</span>
              <button onclick="window.admin.removeHeroSlide(${idx})" style="position: absolute; top: 8px; right: 8px; background: rgba(220,38,38,0.85); color: #FFF; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center;" title="Delete this slide">✕</button>
            </div>
            <div style="padding: 12px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="font-weight: 800; font-family: var(--font-royal); font-size: 0.95rem; color: var(--terracotta-dark); margin-bottom: 2px;">${slide.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.3;">${slide.subtitle}</div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--cream-border);">
                <button class="slide-action-btn primary" onclick="window.admin.openEditSlideModal('hero', 'restaurant_hero', ${idx})">
                  ✏️ Edit Slide Details
                </button>
                <div style="display: flex; gap: 4px;">
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
    categories = categories.flatMap(category => [category, ...(window.HOTEL_PREMIER_SUB_CATEGORIES?.[category.id] || [])
      .filter(sub => sub.id !== 'all')
      .map(sub => ({...sub, id:`${category.id}::${sub.id}`, name:`${category.name} / ${sub.name}`}))]);
    const catId = this.selectedCategoryForSlides || (categories[0] ? categories[0].id : 'morning-delights');

    // Fetch custom slides or auto-derive from category dishes
    let currentSlides = null;
    if (window.HOTEL_STORAGE) {
      currentSlides = await window.HOTEL_STORAGE.getSectionSlides('category_' + catId, null);
    }

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
      <div style="background: var(--cream-bg); border: 1.5px solid var(--cream-border); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-grow: 1; max-width: 400px;">
            <label class="form-label" style="margin: 0; white-space: nowrap;">Choose Sub-Section:</label>
            <select id="admin-category-slide-select" class="form-select" style="padding: 6px 12px; font-weight: 700;" onchange="window.admin.changeCategorySlides(this.value)">
              ${categories.map(c => `<option value="${c.id}" ${c.id === catId ? 'selected' : ''}>${c.name} (${c.hindiName || ''})</option>`).join('')}
            </select>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="slide-action-btn" onclick="window.admin.resetCategorySlidesToDishes('${catId}')" title="Reset this section to auto-derived dish photos">
              🔄 Reset to Dishes
            </button>
            <button class="btn-primary" style="font-size: 0.78rem; padding: 6px 12px;" onclick="window.admin.openAddCategorySlideModal('${catId}')">
              ➕ Add Slide to Section
            </button>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
        ${currentSlides.map((slide, idx) => `
          <div class="slide-manage-card">
            <div class="slide-card-media">
              <img src="${slide.image}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'">
              <span style="position: absolute; top: 8px; left: 8px; background: rgba(14,29,54,0.85); color: var(--gold-light); font-size: 0.68rem; font-weight: 900; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--gold-primary);">${slide.badge || 'SLIDE ' + (idx + 1)}</span>
              ${slide.price !== undefined ? `<span style="position: absolute; bottom: 8px; right: 8px; background: var(--terracotta-dark); color: var(--gold-light); font-weight: 900; font-size: 0.85rem; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--gold-primary);">₹${slide.price}/-</span>` : ''}
              <button onclick="window.admin.removeCategorySlide('${catId}', ${idx})" style="position: absolute; top: 8px; right: 8px; background: rgba(220,38,38,0.85); color: #FFF; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center;" title="Remove this slide">✕</button>
            </div>
            <div style="padding: 12px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="font-weight: 800; font-family: var(--font-royal); font-size: 0.95rem; color: var(--terracotta-dark); margin-bottom: 2px;">${slide.title || slide.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.3;">${slide.subtitle || ''}</div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--cream-border);">
                <button class="slide-action-btn primary" onclick="window.admin.openEditSlideModal('category', '${catId}', ${idx})">
                  ✏️ Edit Slide & Photo
                </button>
                <div style="display: flex; gap: 4px;">
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
    this.editingSlideContext = { type, targetId, slideIndex };

    let slide = null;
    if (type === 'hero') {
      const defaultSlides = (window.HOTEL_PREMIER_HOTEL_DATA && window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides) ? window.HOTEL_PREMIER_HOTEL_DATA.restaurantHeroSlides : [];
      let slides = defaultSlides;
      if (window.HOTEL_STORAGE) {
        slides = await window.HOTEL_STORAGE.getSectionSlides('restaurant_hero', defaultSlides);
      }
      slide = slides[slideIndex];
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
      slide = slides[slideIndex];
    }

    if (!slide) return;

    this.tempImageSource = slide.image;
    const titleEl = document.getElementById('image-modal-dish-name');
    if (titleEl) titleEl.innerText = `Edit Slide: ${slide.title || slide.name || 'Slide ' + (slideIndex + 1)}`;

    const body = document.getElementById('image-modal-body');
    if (body) {
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label class="form-label">Slide Main Title / Dish Name *</label>
            <input type="text" id="edit-slide-title" class="form-input" value="${slide.title || slide.name || ''}" placeholder="e.g. Special Pure Veg Handi">
          </div>

          ${type === 'category' ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
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

          <div style="text-align: center;">
            <div style="width: 100%; height: 160px; border-radius: 8px; overflow: hidden; border: 2px solid var(--gold-border); margin-bottom: 4px; background: var(--cream-darker);">
              <img id="image-preview-element" src="${slide.image}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Current Photo Preview</span>
          </div>

          <div>
            <label class="form-label">Option 1: Upload Photo from Phone / Camera</label>
            <input type="file" accept="image/*" class="form-input" style="padding: 6px;" onchange="window.admin.handleHeroSlideUpload(this)">
          </div>

          <div>
            <label class="form-label">Option 2: Paste Web Image URL</label>
            <input type="text" id="image-url-input-field" class="form-input" value="${slide.image.startsWith('data:') ? '(Uploaded Local Photo)' : slide.image}" placeholder="https://..." oninput="window.admin.updatePreviewFromUrl(this.value)">
          </div>

          <div>
            <label class="form-label">Option 3: Choose Curated HD Food Preset</label>
            <div class="preset-image-grid" style="max-height: 120px; overflow-y: auto;">
              ${this.curatedPresets.map(preset => `
                <div class="preset-image-item" onclick="window.admin.selectPresetImage('${preset.url}')" title="${preset.name}">
                  <img src="${preset.url}" alt="${preset.name}">
                  <div class="preset-label">${preset.name}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px;">
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
    if (!this.editingSlideContext) return;
    const { type, targetId, slideIndex } = this.editingSlideContext;

    const title = (document.getElementById('edit-slide-title').value || '').trim();
    const sub = (document.getElementById('edit-slide-sub').value || '').trim();
    const priceEl = document.getElementById('edit-slide-price');
    const badgeEl = document.getElementById('edit-slide-badge');

    if (!title || !this.tempImageSource) {
      alert('Please provide a title and select/upload an image.');
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
      alert('You must keep at least 1 hero banner slide.');
      return;
    }

    if (confirm('Delete this slide from the main restaurant banner?')) {
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
    this.editingSlideContext = { type: 'add_hero', targetId: 'restaurant_hero' };
    this.tempImageSource = '';

    const titleEl = document.getElementById('image-modal-dish-name');
    if (titleEl) titleEl.innerText = 'Add New Restaurant Hero Banner Slide';

    const body = document.getElementById('image-modal-body');
    if (body) {
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label class="form-label">Slide Main Heading *</label>
            <input type="text" id="new-hero-slide-title" class="form-input" placeholder="e.g. Authentic Khandeshi Delicacies & Unlimited Sweets">
          </div>

          <div>
            <label class="form-label">Slide Subtitle / Tagline</label>
            <input type="text" id="new-hero-slide-sub" class="form-input" placeholder="e.g. 100% Pure Vegetarian Pride • Since 2005">
          </div>

          <div style="text-align: center;">
            <div style="width: 100%; height: 160px; border-radius: 8px; overflow: hidden; border: 2px solid var(--gold-border); margin-bottom: 4px; background: var(--cream-darker);">
              <img id="image-preview-element" src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Slide Image Preview</span>
          </div>

          <div>
            <label class="form-label">Option 1: Upload Photo from Phone / Camera</label>
            <input type="file" accept="image/*" class="form-input" style="padding: 6px;" onchange="window.admin.handleHeroSlideUpload(this)">
          </div>

          <div>
            <label class="form-label">Option 2: Paste Web Image URL</label>
            <input type="text" id="image-url-input-field" class="form-input" placeholder="https://..." oninput="window.admin.updatePreviewFromUrl(this.value)">
          </div>

          <div>
            <label class="form-label">Option 3: Choose Curated HD Food Preset</label>
            <div class="preset-image-grid" style="max-height: 120px; overflow-y: auto;">
              ${this.curatedPresets.map(preset => `
                <div class="preset-image-item" onclick="window.admin.selectPresetImage('${preset.url}')" title="${preset.name}">
                  <img src="${preset.url}" alt="${preset.name}">
                  <div class="preset-label">${preset.name}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px;">
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
      alert('Failed to process image: ' + err.message);
    }
  }

  async saveNewHeroSlide() {
    const title = (document.getElementById('new-hero-slide-title').value || '').trim();
    const sub = (document.getElementById('new-hero-slide-sub').value || '').trim();

    if (!title || !this.tempImageSource) {
      alert('Please provide a heading and select/upload an image.');
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
      alert('You must keep at least 1 slide in this section.');
      return;
    }

    if (confirm('Remove this slide from category slideshow?')) {
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
    if (confirm('Reset this category slideshow to auto-derived dish photos?')) {
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
    this.editingSlideContext = { type: 'add_category', targetId: catId };
    this.tempImageSource = '';

    const cat = window.app.categories.find(c => c.id === catId);
    const catName = cat ? cat.name : catId;

    const titleEl = document.getElementById('image-modal-dish-name');
    if (titleEl) titleEl.innerText = `Add Slide to: ${catName}`;

    const body = document.getElementById('image-modal-body');
    if (body) {
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label class="form-label">Slide Main Title / Dish Name *</label>
            <input type="text" id="new-cat-slide-title" class="form-input" placeholder="e.g. Special Khandeshi Thali">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
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

          <div style="text-align: center;">
            <div style="width: 100%; height: 160px; border-radius: 8px; overflow: hidden; border: 2px solid var(--gold-border); margin-bottom: 4px; background: var(--cream-darker);">
              <img id="image-preview-element" src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Photo Preview to Add</span>
          </div>

          <div>
            <label class="form-label">Option 1: Upload Photo from Phone / Camera</label>
            <input type="file" accept="image/*" class="form-input" style="padding: 6px;" onchange="window.admin.handleHeroSlideUpload(this)">
          </div>

          <div>
            <label class="form-label">Option 2: Paste Web Image URL</label>
            <input type="text" id="image-url-input-field" class="form-input" placeholder="https://..." oninput="window.admin.updatePreviewFromUrl(this.value)">
          </div>

          <div>
            <label class="form-label">Option 3: Choose Curated HD Food Preset</label>
            <div class="preset-image-grid" style="max-height: 120px; overflow-y: auto;">
              ${this.curatedPresets.map(preset => `
                <div class="preset-image-item" onclick="window.admin.selectPresetImage('${preset.url}')" title="${preset.name}">
                  <img src="${preset.url}" alt="${preset.name}">
                  <div class="preset-label">${preset.name}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px;">
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
    const title = (document.getElementById('new-cat-slide-title').value || '').trim();
    const sub = (document.getElementById('new-cat-slide-sub').value || '').trim();
    const price = parseFloat(document.getElementById('new-cat-slide-price').value) || 0;
    const badge = (document.getElementById('new-cat-slide-badge').value || '👑 SECTION HIGHLIGHT').trim();

    if (!title || !this.tempImageSource) {
      alert('Please provide a title and select/upload an image.');
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
    const modal = document.getElementById('add-dish-modal');
    if (modal) {
      const catSelect = document.getElementById('new-dish-category');
      const cats = window.app.categories.filter(c => c.id !== 'all' && c.id !== 'chef-specials');
      catSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      this.newDishTempImage = '';
      modal.classList.add('active');
    }
  }

  closeAddDishModal() {
    const modal = document.getElementById('add-dish-modal');
    if (modal) modal.classList.remove('active');
  }

  async handleNewDishImageUpload(input) {
    const file = input.files[0];
    if (!file) return;

    try {
      window.app.showToast('AI Studio: Processing raw food photo...', 'info');

      const rawDataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.onerror = rej;
        r.readAsDataURL(file);
      });

      this.newDishRawOriginal = rawDataUrl;

      const catSelect = document.getElementById('new-dish-category');
      const catId = catSelect ? catSelect.value : 'curry';
      const dishName = (document.getElementById('new-dish-name')?.value || '').trim();

      let enhanced = rawDataUrl;
      let score = 90;
      let cat = 'curry';

      try {
        if (window.AssetPipeline && typeof window.AssetPipeline.processAutomaticStudioEnhancement === 'function') {
          const res = await window.AssetPipeline.processAutomaticStudioEnhancement(rawDataUrl, { name: dishName, categoryId: catId });
          if (res && res.enhancedDataUrl) {
            enhanced = res.enhancedDataUrl;
            score = res.qualityScore || 90;
            cat = res.category || 'curry';
          }
        } else {
          enhanced = await this.compressAndResizeImage(file);
        }
      } catch (pipelineErr) {
        console.warn('New dish studio pipeline fallback:', pipelineErr);
        try {
          enhanced = await this.compressAndResizeImage(file);
        } catch (compErr) {
          enhanced = rawDataUrl;
        }
      }

      this.newDishTempImage = enhanced;
      const urlInput = document.getElementById('new-dish-image');
      if (urlInput) urlInput.value = `(AI Studio Enhanced • ${cat.toUpperCase()} • ${score}%)`;
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast(`Studio Master photo ready (${score}%)!`, 'success');
      }
    } catch (err) {
      console.error('handleNewDishPhotoUpload error:', err);
      try {
        const fallback = await this.compressAndResizeImage(file);
        this.newDishTempImage = fallback;
        const urlInput = document.getElementById('new-dish-image');
        if (urlInput) urlInput.value = '(Photo uploaded)';
        if (window.app && typeof window.app.showToast === 'function') {
          window.app.showToast('Photo uploaded successfully', 'success');
        }
      } catch (e) {
        alert('Failed to process photo: ' + err.message);
      }
    }
  }

  async saveNewDish() {
    const name = document.getElementById('new-dish-name').value.trim();
    const categoryId = document.getElementById('new-dish-category').value;
    const price = parseFloat(document.getElementById('new-dish-price').value) || 0;
    const desc = document.getElementById('new-dish-desc').value.trim();
    const urlInput = document.getElementById('new-dish-image').value.trim();
    const isSpecial = document.getElementById('new-dish-special') ? document.getElementById('new-dish-special').checked : false;
    const isSweet = document.getElementById('new-dish-sweet') ? document.getElementById('new-dish-sweet').checked : false;
    const isSpicy = document.getElementById('new-dish-spicy') ? document.getElementById('new-dish-spicy').checked : false;
    const isBestseller = document.getElementById('new-dish-bestseller') ? document.getElementById('new-dish-bestseller').checked : false;
    const isKhandeshi = document.getElementById('new-dish-khandeshi') ? document.getElementById('new-dish-khandeshi').checked : false;

    if (!name || !price) {
      alert('Please provide dish name and valid price.');
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
    const finalImage = this.newDishTempImage || (urlInput && !urlInput.startsWith('(') ? urlInput : defaultImg);

    const newTags = ['veg'];
    if (isSweet) newTags.push('sweet');
    if (isSpicy) newTags.push('spicy');
    if (isSpecial) newTags.push('chef-special');
    if (isBestseller) newTags.push('bestseller');
    if (isKhandeshi) newTags.push('khandeshi-special');

    const newDish = {
      id: `dish-custom-${Date.now()}`,
      name: name,
      categoryId: categoryId,
      price: price,
      description: desc || 'Prepared fresh in our Pride Pure Veg Kitchen in standard refined oil.',
      image: finalImage,
      rating: '4.9',
      isSoldOut: false,
      tags: newTags
    };

    window.app.menuData.unshift(newDish);
    window.app.saveMenuData();

    if (window.HOTEL_STORAGE && typeof window.HOTEL_STORAGE.saveDishPhotoLifecycle === 'function' && this.newDishTempImage) {
      await window.HOTEL_STORAGE.saveDishPhotoLifecycle(newDish.id, {
        image: newDish.image,
        enhancedMasterImage: newDish.image,
        rawOriginalImage: this.newDishRawOriginal || newDish.image,
        enhancementStatus: 'enhanced',
        qualityScore: 92,
        foodCategory: categoryId,
        price: newDish.price,
        tags: newDish.tags,
        isSoldOut: false
      });
    } else if (window.HOTEL_STORAGE) {
      await window.HOTEL_STORAGE.saveDishOverride(newDish.id, {
        image: newDish.image,
        price: newDish.price,
        tags: newDish.tags,
        isSoldOut: false
      });
    }

    window.app.renderCategoryCards();
    if (window.app.currentCategory && window.app.currentCategory !== 'all') {
      window.app.renderSectionSlideshow(window.app.currentCategory);
    }
    window.app.renderMenu();
    this.filterAdminDishes();
    this.closeAddDishModal();

    // Reset inputs
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
          <a href="GUEST-NETWORK-SETUP.md" target="_blank" rel="noopener">Equipment checklist & secure activation plan</a>
        </div>
        <div class="qr-studio-fields">
          <label>QR destination<select id="qr-table-select" class="form-select"><option value="reception">Reception → Home</option><option value="restaurant">Restaurant → Culinary Collection</option><option value="room">Room → Digital Concierge</option></select></label>
          <label>Verified room<select id="qr-room-select" class="form-select" disabled><option value="">Awaiting verified room register</option></select></label>
          <label>Public HTTPS PWA address<input id="qr-target-url" class="form-input" type="url" spellcheck="false"></label>
        </div>
        <p id="qr-studio-status" role="status"></p>
        <div id="standee-print-card" class="qr-print-card">
          <img class="qr-brand" src="assets/premier-original-logo.png" alt="Hotel Premier">
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
    if (title) title.textContent = type === 'restaurant' ? 'Pride Pure Veg AC Restaurant' : type === 'room' ? 'Your Room Concierge' : 'Welcome to Hotel Premier';
    if (help) help.textContent = type === 'restaurant' ? 'Scan to explore our Culinary Collection.' : type === 'room' ? 'Scan for your room guide, dining and assistance.' : 'Scan to discover our hotel, dining and stays.';
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
      context.fillStyle = '#ffffff'; context.fillRect(0, 0, printable.width, printable.height);
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
            <h4 style="font-family: var(--font-royal); font-size: 1.15rem; color: var(--terracotta-dark); margin: 0;">🛡️ 100% Permanent Data & Photo Safeguard</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 2px 0 0;">
              All your custom uploaded photos, room slideshows, dish prices, and bulk deals are safely saved in high-capacity storage. Export a standalone JSON file anytime as an off-site backup.
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin: 16px 0;">
          <!-- Card 1: Export Backup -->
          <div style="background: var(--cream-bg); border: 1.5px solid var(--cream-border); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 1.5rem; margin-bottom: 6px;">📥</div>
              <h5 style="font-family: var(--font-royal); color: var(--terracotta-dark); margin-bottom: 4px;">Download Full Backup (JSON)</h5>
              <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">
                Exports a complete backup file containing all dish photos, 14-room galleries, restaurant hero slides, and marriage deals.
              </p>
            </div>
            <button class="btn-backup-export" style="margin-top: 12px;" onclick="window.admin.exportFullBackup()">
              📥 Export Full Backup Now
            </button>
          </div>

          <!-- Card 2: Restore Backup -->
          <div style="background: var(--cream-bg); border: 1.5px solid var(--cream-border); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 1.5rem; margin-bottom: 6px;">📤</div>
              <h5 style="font-family: var(--font-royal); color: var(--terracotta-dark); margin-bottom: 4px;">Restore Backup from File</h5>
              <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">
                Select a previously exported JSON backup file to restore all photos, prices, and settings instantly.
              </p>
            </div>
            <div style="margin-top: 12px;">
              <input type="file" id="backup-file-input" accept=".json" style="display: none;" onchange="window.admin.handleBackupRestore(this)">
              <button class="btn-backup-import" onclick="document.getElementById('backup-file-input').click()">
                📤 Select File to Restore
              </button>
            </div>
          </div>
        </div>

        <!-- Security & PIN Management Section -->
        <div style="background: var(--cream-bg); border: 1.5px solid var(--cream-border); border-radius: var(--radius-md); padding: 16px; margin-top: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 1.3rem;">🔐</span>
            <h5 style="font-family: var(--font-royal); color: var(--terracotta-dark); margin: 0;">Restaurant Manager Security PIN</h5>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
            Update the Security PIN used by restaurant staff and managers to unlock this Admin Studio. PINs are securely hashed using cryptographic SHA-256 before storage.
          </p>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <input type="password" id="admin-new-pin-input" class="form-input" placeholder="New PIN (min. 4 characters)" style="max-width: 240px; font-size: 0.95rem; letter-spacing: 1.5px;">
            <button class="btn-primary" style="padding: 9px 16px; font-size: 0.85rem;" onclick="window.admin.updateManagerPin()">
              🔒 Update Security PIN
            </button>
          </div>
        </div>

        <div style="padding-top: 14px; margin-top: 14px; border-top: 1px dashed var(--cream-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <span style="font-size: 0.8rem; font-weight: 800; color: var(--pure-red);">Need to start fresh?</span>
            <p style="font-size: 0.72rem; color: var(--text-muted); margin: 0;">Resets all custom edits back to factory defaults.</p>
          </div>
          <button class="btn-secondary" style="color: var(--pure-red); border-color: #FECDD3;" onclick="window.admin.resetAllToDefaults()">
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
    window.app.showToast('AI Studio settings saved!', 'success');
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
    if (!newPin || newPin.length < 4) {
      alert('Security PIN must be at least 4 characters or digits long.');
      input.focus();
      return;
    }

    if (window.HOTEL_STORAGE && typeof window.HOTEL_STORAGE.setAdminPin === 'function') {
      const res = await window.HOTEL_STORAGE.setAdminPin(newPin);
      if (res.success) {
        input.value = '';
        window.app.showToast('Security PIN successfully updated & cryptographically hashed!', 'success');
      } else {
        alert(res.message || 'Failed to update PIN.');
      }
    } else {
      alert('Storage engine unavailable to save new PIN.');
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
      alert('Failed to restore backup: ' + err.message);
    }
  }

  resetAllToDefaults() {
    if (confirm('Are you sure you want to reset all custom photos, prices, and deals back to original factory defaults?')) {
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
