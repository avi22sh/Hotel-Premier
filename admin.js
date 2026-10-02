// ==========================================================================
// HOTEL PREMIER - PRIDE PURE VEG AC RESTAURANT, BHUSAWAL
// Live Menu CMS, Multi-Photo Room & Slide Manager, Safe Backup & QR Studio
// ==========================================================================

class HotelPremierAdmin {
  constructor() {
    this.isAuthenticated = false;
    this.currentTab = 'menu';
    this.adminPin = 'admin123';
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
  openAdminModal() {
    const modal = document.getElementById('admin-modal-backdrop');
    if (!modal) return;

    if (!this.isAuthenticated) {
      document.getElementById('admin-auth-view').style.display = 'block';
      document.getElementById('admin-dashboard-view').style.display = 'none';
    } else {
      document.getElementById('admin-auth-view').style.display = 'none';
      document.getElementById('admin-dashboard-view').style.display = 'flex';
      this.switchTab(this.currentTab);
    }

    modal.classList.add('active');
  }

  closeAdminModal() {
    const modal = document.getElementById('admin-modal-backdrop');
    if (modal) modal.classList.remove('active');
  }

  verifyPin() {
    const pinInput = document.getElementById('admin-pin-input');
    if (pinInput.value === this.adminPin || pinInput.value === '1234') {
      this.isAuthenticated = true;
      pinInput.value = '';
      document.getElementById('admin-auth-view').style.display = 'none';
      document.getElementById('admin-dashboard-view').style.display = 'flex';
      this.switchTab('menu');
      window.app.showToast('Menu Manager unlocked!', 'success');
    } else {
      alert('Incorrect Security PIN. Default is admin123');
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

    if (tabName === 'menu') {
      this.renderMenuManager(contentContainer);
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

  // Client-side HTML5 Canvas Photo Compressor
  compressAndResizeImage(file, maxWidth = 800, maxHeight = 800, quality = 0.75) {
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
        <div style="display: flex; gap: 8px; flex-grow: 1; max-width: 480px;">
          <input type="text" id="admin-search-dish" placeholder="Search dish name to edit price, photo, or status..." class="form-input" style="padding: 7px 12px; font-size: 0.82rem;">
          <select id="admin-category-filter" class="form-select" style="padding: 7px 12px; font-size: 0.82rem; width: auto;">
            <option value="all">All Categories</option>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
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
              <th style="width: 100px;">Price (₹)</th>
              <th style="width: 70px; text-align: center;">Special</th>
              <th style="width: 90px; text-align: center;">Available</th>
              <th style="width: 70px; text-align: center;">Delete</th>
            </tr>
          </thead>
          <tbody id="admin-dish-tbody">
            ${this.generateDishTableRows(menu)}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('admin-search-dish').addEventListener('input', () => this.filterAdminDishes());
    document.getElementById('admin-category-filter').addEventListener('change', () => this.filterAdminDishes());
  }

  generateDishTableRows(dishes) {
    return dishes.map(dish => {
      const isSpecial = dish.tags && dish.tags.includes('chef-special');
      const isSoldOut = !!dish.isSoldOut;
      const hasPhoto = dish.image && dish.image.trim() !== '';

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
          </td>
          <td>
            <span style="font-size: 0.75rem; background: var(--cream-darker); padding: 3px 8px; border-radius: 4px; font-weight: 600;">${dish.categoryId}</span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 0.82rem; font-weight: 700;">₹</span>
              <input type="number" value="${dish.price}" style="width: 65px; padding: 4px 6px; font-size: 0.85rem; font-weight: 800; border: 1px solid var(--cream-border); border-radius: 4px;" onchange="window.admin.updatePrice('${dish.id}', this.value)">
            </div>
          </td>
          <td style="text-align: center;">
            <input type="checkbox" ${isSpecial ? 'checked' : ''} onchange="window.admin.toggleSpecial('${dish.id}', this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
          </td>
          <td style="text-align: center;">
            <label class="toggle-switch">
              <input type="checkbox" ${!isSoldOut ? 'checked' : ''} onchange="window.admin.toggleAvailability('${dish.id}', this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </td>
          <td style="text-align: center;">
            <button style="background: none; border: none; font-size: 1rem; cursor: pointer; opacity: 0.7;" onclick="window.admin.deleteDish('${dish.id}')" title="Delete Dish">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  filterAdminDishes() {
    const q = (document.getElementById('admin-search-dish').value || '').toLowerCase();
    const cat = document.getElementById('admin-category-filter').value;
    const tbody = document.getElementById('admin-dish-tbody');

    const filtered = window.app.menuData.filter(d => {
      const matchesQ = d.name.toLowerCase().includes(q) || (d.description && d.description.toLowerCase().includes(q));
      const matchesCat = (cat === 'all') || (d.categoryId === cat);
      return matchesQ && matchesCat;
    });

    if (tbody) {
      tbody.innerHTML = this.generateDishTableRows(filtered);
    }
  }

  async updatePrice(dishId, newPrice) {
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (dish) {
      dish.price = parseFloat(newPrice) || 0;
      window.app.saveMenuData();
      if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveDishOverride(dishId, { price: dish.price });
      }
      window.app.renderMenu();
      window.app.showToast(`Updated price for "${dish.name}" to ₹${dish.price}`, 'success');
    }
  }

  async toggleSpecial(dishId, isSpecial) {
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (dish) {
      if (!dish.tags) dish.tags = [];
      if (isSpecial && !dish.tags.includes('chef-special')) {
        dish.tags.push('chef-special');
      } else if (!isSpecial) {
        dish.tags = dish.tags.filter(t => t !== 'chef-special');
      }
      window.app.saveMenuData();
      if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveDishOverride(dishId, { tags: dish.tags });
      }
      window.app.renderMenu();
      window.app.showToast(`Updated Chef's Special status for "${dish.name}"`, 'info');
    }
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
  openImageModal(dishId) {
    this.activeImageDishId = dishId;
    const dish = window.app.menuData.find(d => d.id === dishId);
    if (!dish) return;

    const hasPhoto = dish.image && dish.image.trim() !== '';
    this.tempImageSource = dish.image || '';
    const titleEl = document.getElementById('image-modal-dish-name');
    if (titleEl) titleEl.innerText = `${hasPhoto ? 'Manage / Replace Photo' : 'Upload Photo'}: ${dish.name}`;

    const body = document.getElementById('image-modal-body');
    if (body) {
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Current Photo Status or Delete Option -->
          ${hasPhoto ? `
            <div style="background: #FEF2F2; border: 1.5px dashed #F87171; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
              <div>
                <div style="font-weight: 800; font-size: 0.85rem; color: #991B1B;">Want to remove this photo?</div>
                <div style="font-size: 0.72rem; color: #B91C1C;">The dish will be displayed in elegant Pure Veg text mode until you upload a new photo.</div>
              </div>
              <button class="slide-action-btn delete" style="padding: 6px 12px; font-size: 0.78rem; font-weight: 800; flex-shrink: 0;" onclick="window.admin.deleteDishPhoto('${dish.id}')">
                🗑️ Delete Photo
              </button>
            </div>

            <div style="text-align: center;">
              <div style="width: 100%; height: 180px; border-radius: 8px; overflow: hidden; border: 2px solid var(--gold-border); margin-bottom: 4px; background: var(--cream-darker);">
                <img id="image-preview-element" src="${dish.image}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              <span style="font-size: 0.72rem; color: var(--text-muted);">Current Active Photo Preview</span>
            </div>
          ` : `
            <div style="background: var(--cream-bg); border: 1.5px dashed var(--gold-primary); border-radius: 8px; padding: 12px; text-align: center;">
              <div style="font-size: 1.5rem; margin-bottom: 2px;">🌱</div>
              <div style="font-weight: 800; font-size: 0.85rem; color: var(--terracotta-dark);">No photo currently assigned</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Dish is displayed in Pure Veg text mode. Select or upload a photo below to attach an image.</div>
            </div>

            <div style="text-align: center;">
              <div style="width: 100%; height: 160px; border-radius: 8px; overflow: hidden; border: 2px solid var(--gold-border); margin-bottom: 4px; background: var(--cream-darker);">
                <img id="image-preview-element" src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              <span style="font-size: 0.72rem; color: var(--text-muted);">New Photo Preview to Apply</span>
            </div>
          `}

          <div>
            <label class="form-label">Option 1: Upload Photo from Phone / Camera</label>
            <input type="file" accept="image/*" class="form-input" style="padding: 6px;" onchange="window.admin.handleImageFileUpload(this)">
          </div>

          <div>
            <label class="form-label">Option 2: Paste Web Image URL</label>
            <input type="text" id="image-url-input-field" value="${hasPhoto && !dish.image.startsWith('data:') ? dish.image : ''}" class="form-input" placeholder="https://..." oninput="window.admin.updatePreviewFromUrl(this.value)">
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
            <button class="btn-primary" onclick="window.admin.saveReplacedImage()">Apply New Photo</button>
          </div>
        </div>
      `;
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
      this.closeImageModal();
      window.app.showToast(`Photo removed for "${dish.name}". Showing in text-only mode!`, 'info');
    }
  }

  closeImageModal() {
    const modal = document.getElementById('image-replace-modal');
    if (modal) modal.classList.remove('active');
    this.activeImageDishId = null;
    this.activeRoomId = null;
    this.activeRoomPhotoIndex = null;
    this.editingSlideContext = null;
  }

  async handleImageFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    try {
      window.app.showToast('Optimizing and loading photo...', 'info');
      const compressed = await this.compressAndResizeImage(file);
      this.tempImageSource = compressed;
      const preview = document.getElementById('image-preview-element');
      const urlInput = document.getElementById('image-url-input-field');
      if (preview) preview.src = this.tempImageSource;
      if (urlInput) urlInput.value = '(Uploaded Local Photo - Ready to Apply)';
      window.app.showToast('Photo ready! Click "Apply New Photo" to save.', 'success');
    } catch (err) {
      alert('Failed to process image file: ' + err.message);
    }
  }

  updatePreviewFromUrl(url) {
    this.tempImageSource = url.trim();
    const preview = document.getElementById('image-preview-element');
    if (preview && this.tempImageSource) preview.src = this.tempImageSource;
  }

  selectPresetImage(url) {
    this.tempImageSource = url;
    const preview = document.getElementById('image-preview-element');
    const urlInput = document.getElementById('image-url-input-field');
    if (preview) preview.src = url;
    if (urlInput) urlInput.value = url;
  }

  async saveReplacedImage() {
    if (!this.activeImageDishId || !this.tempImageSource) return;

    const dish = window.app.menuData.find(d => d.id === this.activeImageDishId);
    if (dish) {
      dish.image = this.tempImageSource;
      window.app.saveMenuData();

      // Permanent Storage in IndexedDB
      if (window.HOTEL_STORAGE) {
        await window.HOTEL_STORAGE.saveDishOverride(dish.id, { image: this.tempImageSource });
      }

      // Direct live DOM updates so changes reflect immediately without needing reload
      const cardImg = document.getElementById(`dish-img-el-${dish.id}`);
      if (cardImg) {
        if (cardImg.tagName === 'IMG') {
          cardImg.src = this.tempImageSource;
        } else {
          // Re-render menu to show img element
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
      this.closeImageModal();
      window.app.showToast(`Updated photo for "${dish.name}"!`, 'success');
    }
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
          Total Inventory: <strong>14 AC Rooms</strong> (2 Super Deluxe King Bed + 4 Deluxe Queen Bed + 8 Deluxe Twin Beds). Reorder, replace or add photos, update tariffs, and customize wedding bulk packages.
        </p>
      </div>

      <!-- Room Multi-Photo Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-bottom: 24px;">
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
                  <input type="number" id="bulk-deal-min-${idx}" value="${deal.minRooms}" class="form-input" style="padding: 6px 10px; font-size: 0.82rem;">
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
    const catId = this.selectedCategoryForSlides || (categories[0] ? categories[0].id : 'morning-delights');

    // Fetch custom slides or auto-derive from category dishes
    let currentSlides = null;
    if (window.HOTEL_STORAGE) {
      currentSlides = await window.HOTEL_STORAGE.getSectionSlides('category_' + catId, null);
    }

    if (!currentSlides || !Array.isArray(currentSlides) || currentSlides.length === 0) {
      const dishes = window.app.menuData.filter(d => d.categoryId === catId && d.image && d.image.trim() !== '');
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
        const dishes = window.app.menuData.filter(d => d.categoryId === targetId && d.image && d.image.trim() !== '');
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
        const dishes = window.app.menuData.filter(d => d.categoryId === targetId && d.image);
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
      const dishes = window.app.menuData.filter(d => d.categoryId === catId && d.image && d.image.trim() !== '');
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
      const dishes = window.app.menuData.filter(d => d.categoryId === catId && d.image && d.image.trim() !== '');
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
      const dishes = window.app.menuData.filter(d => d.categoryId === catId && d.image && d.image.trim() !== '');
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
      window.app.showToast('Optimizing photo...', 'info');
      const compressed = await this.compressAndResizeImage(file);
      this.newDishTempImage = compressed;
      const urlInput = document.getElementById('new-dish-image');
      if (urlInput) urlInput.value = '(Uploaded Local Photo)';
      window.app.showToast('Photo ready!', 'success');
    } catch (err) {
      alert('Failed to process photo: ' + err.message);
    }
  }

  async saveNewDish() {
    const name = document.getElementById('new-dish-name').value.trim();
    const categoryId = document.getElementById('new-dish-category').value;
    const price = parseFloat(document.getElementById('new-dish-price').value) || 0;
    const desc = document.getElementById('new-dish-desc').value.trim();
    const urlInput = document.getElementById('new-dish-image').value.trim();
    const isSpecial = document.getElementById('new-dish-special').checked;

    if (!name || !price) {
      alert('Please provide dish name and valid price.');
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
    const finalImage = this.newDishTempImage || (urlInput && !urlInput.startsWith('(') ? urlInput : defaultImg);

    const newDish = {
      id: `dish-custom-${Date.now()}`,
      name: name,
      categoryId: categoryId,
      price: price,
      description: desc || 'Prepared fresh in our Pride Pure Veg Kitchen in standard refined oil.',
      image: finalImage,
      rating: '4.9',
      isSoldOut: false,
      tags: isSpecial ? ['chef-special'] : []
    };

    window.app.menuData.unshift(newDish);
    window.app.saveMenuData();

    if (window.HOTEL_STORAGE) {
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
    const baseUrl = window.location.href.split('#')[0].split('?')[0];
    const isLocalFile = window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const savedCustomDomain = localStorage.getItem('hotel_premier_custom_qr_domain');
    const initialUrl = savedCustomDomain || (isLocalFile ? 'https://menu.hotelpremier.in' : baseUrl);

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <h4 style="font-family: var(--font-royal); color: var(--terracotta-dark); margin-bottom: 4px;">Table Standee & Room QR Studio</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted);">
            Generate, customize, download and print high-resolution royal QR codes for restaurant dining tables and hotel guest rooms.
          </p>
        </div>

        ${isLocalFile && !savedCustomDomain ? `
          <div style="background: #FFFBEB; border: 1.5px solid #F59E0B; border-radius: 8px; padding: 12px 14px; font-size: 0.78rem; color: #92400E; display: flex; gap: 10px; align-items: flex-start;">
            <span style="font-size: 1.2rem;">💡</span>
            <div>
              <strong>Notice for Mobile QR Scanning:</strong>
              <div style="margin-top: 2px; line-height: 1.4;">
                Phone cameras require a live <strong>https://</strong> web link (like your Netlify URL or <code>https://menu.hotelpremier.in</code>) to open the browser automatically. Enter your live website link below.
              </div>
            </div>
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: var(--cream-bg); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--cream-border);">
          <div>
            <label class="form-label">Select Table / Room / Counter</label>
            <select id="qr-table-select" class="form-select" onchange="window.admin.generateTableQR()">
              <option value="Main Restaurant QR">General Restaurant Menu (Default)</option>
              <option value="Table 1">Table 1 (Pure Veg AC Dining)</option>
              <option value="Table 2">Table 2 (Pure Veg AC Dining)</option>
              <option value="Table 3">Table 3 (Pure Veg AC Dining)</option>
              <option value="Table 4">Table 4 (Pure Veg AC Dining)</option>
              <option value="Table 5">Table 5 (Family AC Hall)</option>
              <option value="Table 6">Table 6 (Family AC Hall)</option>
              <option value="Table 7">Table 7 (Pure Veg AC Dining)</option>
              <option value="Table 8">Table 8 (Pure Veg AC Dining)</option>
              <option value="Reception Counter">Reception / Cashier Desk</option>
              <option value="Room 101">Room 101 (AC Super Deluxe King)</option>
              <option value="Room 102">Room 102 (AC Super Deluxe King)</option>
              <option value="Room 201">Room 201 (AC Deluxe Queen)</option>
              <option value="Room 202">Room 202 (AC Deluxe Queen)</option>
              <option value="Room 301">Room 301 (AC Deluxe Twin Beds)</option>
              <option value="Room 302">Room 302 (AC Deluxe Twin Beds)</option>
            </select>
          </div>
          <div>
            <label class="form-label">Live App URL / Custom Domain</label>
            <input type="text" id="qr-target-url" class="form-input" value="${initialUrl}" placeholder="https://menu-hotelpremier-bsl.netlify.app" oninput="window.admin.onCustomDomainInput(this.value)" style="font-size: 0.8rem; font-weight: 600;">
            <span style="font-size: 0.68rem; color: var(--text-muted); margin-top: 3px; display: block;">Permanently saved. Enter Netlify link or custom domain.</span>
          </div>
        </div>

        <!-- Standee Preview -->
        <div style="display: flex; justify-content: center; margin: 10px 0;">
          <div id="standee-print-card" style="width: 270px; background: #FFF; border: 3px solid var(--gold-primary); border-radius: 12px; padding: 18px 16px; text-align: center; box-shadow: var(--shadow-md);">
            <div style="font-family: var(--font-royal); font-weight: 900; font-size: 1.05rem; color: var(--terracotta-dark); letter-spacing: 0.5px;">HOTEL PREMIER</div>
            <div style="font-size: 0.65rem; color: var(--gold-primary); font-weight: 800; letter-spacing: 1px; margin-bottom: 10px;">PRIDE PURE VEG RESTAURANT</div>
            
            <div id="qr-canvas-holder" style="display: flex; justify-content: center; margin-bottom: 10px; padding: 10px; background: var(--cream-bg); border-radius: 8px; border: 1px solid var(--cream-border); min-height: 170px; align-items: center;">
              <!-- QR Rendered Here -->
            </div>

            <div id="qr-standee-label" style="font-family: var(--font-royal); font-weight: 900; font-size: 0.98rem; color: var(--terracotta-dark);">General Restaurant Menu</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px; line-height: 1.3;">Scan with any phone camera to view live menu, order food & explore hotel stays</div>
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
          <button class="btn-secondary" style="padding: 9px 18px;" onclick="window.admin.downloadQRImage()">
            📥 Download QR (PNG)
          </button>
          <button class="btn-primary" style="padding: 9px 20px;" onclick="window.admin.printStandee()">
            🖨️ Print Standee Card
          </button>
        </div>
      </div>
    `;

    setTimeout(() => this.generateTableQR(), 50);
  }

  onCustomDomainInput(val) {
    let clean = val.trim();
    // Auto-correct Netlify dashboard URLs: https://app.netlify.com/projects/site-name/overview -> https://site-name.netlify.app
    if (clean.includes('app.netlify.com/projects/') || clean.includes('app.netlify.com/sites/')) {
      const match = clean.match(/app\.netlify\.com\/(?:projects|sites)\/([^\/\?#]+)/);
      if (match && match[1]) {
        clean = `https://${match[1]}.netlify.app`;
        const inputEl = document.getElementById('qr-target-url');
        if (inputEl) inputEl.value = clean;
        if (window.app && typeof window.app.showToast === 'function') {
          window.app.showToast(`Auto-corrected to live website link: ${clean}`, 'info');
        }
      }
    }
    localStorage.setItem('hotel_premier_custom_qr_domain', clean);
    this.generateTableQR();
  }

  generateTableQR() {
    const tableSelect = document.getElementById('qr-table-select');
    const labelEl = document.getElementById('qr-standee-label');
    const qrHolder = document.getElementById('qr-canvas-holder');
    const urlInput = document.getElementById('qr-target-url');
    if (!tableSelect || !qrHolder) return;

    const selectedText = tableSelect.value;
    if (labelEl) labelEl.innerText = selectedText;

    const savedCustomDomain = localStorage.getItem('hotel_premier_custom_qr_domain');
    let base = (urlInput && urlInput.value.trim()) 
      ? urlInput.value.trim() 
      : (savedCustomDomain || window.location.href.split('#')[0].split('?')[0]);
    
    const targetUrl = base.includes('?') ? `${base}&src=${encodeURIComponent(selectedText)}` : `${base}?src=${encodeURIComponent(selectedText)}`;

    qrHolder.innerHTML = '';
    if (window.QRCode) {
      new QRCode(qrHolder, {
        text: targetUrl,
        width: 160,
        height: 160,
        colorDark: '#0E1D36',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      qrHolder.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(targetUrl)}" alt="QR Code" style="width: 160px; height: 160px;">`;
    }
  }

  downloadQRImage() {
    const qrHolder = document.getElementById('qr-canvas-holder');
    const tableSelect = document.getElementById('qr-table-select');
    const label = tableSelect ? tableSelect.value.replace(/[^a-zA-Z0-9]/g, '_') : 'hotel_premier_qr';

    if (!qrHolder) return;

    const canvas = qrHolder.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `Hotel_Premier_QR_${label}.png`;
      link.href = canvas.toDataURL('image/png');
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

        <div style="padding-top: 14px; border-top: 1px dashed var(--cream-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
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
