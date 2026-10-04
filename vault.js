// ==========================================================================
// HOTEL PREMIER & PRIDE PURE VEG, BHUSAWAL
// MASTER DEVELOPER VAULT & TELEMETRY ENGINE
// Architected & Maintained Exclusively for: Avinash Hedawoo
// Contact: +91 89837 03702 | avinash.hedawoo@gmail.com
// Provides:
//   - Level 1 Scan Logs (Table, Room, Source, Device, OS, Timestamp)
//   - Level 3 Browsing Analytics (Dish Views, Searches, Categories, Dwell Time)
//   - Customer Leads & Dining Feedback (Name, Phone, Region, Star Rating)
//   - Master Vault Exports (CSV, JSON, WhatsApp & Email Dispatch)
// ==========================================================================

class HotelPremierDeveloperVault {
  constructor() {
    this.storageKeyLevel1 = 'hp_vault_level1_scans';
    this.storageKeyLevel3 = 'hp_vault_level3_analytics';
    this.storageKeyFeedback = 'hp_vault_feedback_leads';
    this.storageKeyMasterPin = 'hp_vault_master_pin';

    this.defaultPin = '9325'; // Master Developer Secret PIN
    this.isVaultUnlocked = false;

    this.sessionScanId = null;
    this.sessionStartTime = Date.now();
    this.sessionTable = null;
    this.sessionRoom = null;
    this.sessionSource = null;

    this.init();
  }

  init() {
    this.parseQueryParams();
    this.recordCurrentScan();
    this.setupDwellTimeTracker();
  }

  // Parse URL query parameters (?table=5, ?room=201, ?source=reception)
  parseQueryParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      this.sessionTable = params.get('table') || params.get('t') || null;
      this.sessionRoom = params.get('room') || params.get('r') || null;
      this.sessionSource = params.get('source') || params.get('s') || (this.sessionTable ? 'Table QR' : (this.sessionRoom ? 'Room Standee' : 'Direct Link'));
    } catch (e) {
      console.warn('[Vault] Error parsing query params:', e);
    }
  }

  // Detect client device and browser environment
  getDeviceInfo() {
    const ua = navigator.userAgent || '';
    let os = 'Unknown OS';
    if (/android/i.test(ua)) os = 'Android';
    else if (/iPad|iPhone|iPod/.test(ua)) os = 'iOS';
    else if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    let browser = 'Unknown Browser';
    if (/samsung/i.test(ua)) browser = 'Samsung Internet';
    else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/edg/i.test(ua)) browser = 'Edge';

    return {
      os: os,
      browser: browser,
      screenResolution: `${window.screen ? window.screen.width : window.innerWidth}x${window.screen ? window.screen.height : window.innerHeight}`,
      language: navigator.language || 'en'
    };
  }

  // ========================================================================
  // LEVEL 1: AUTOMATIC SCAN DATA LOGGING
  // ========================================================================
  recordCurrentScan() {
    try {
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeFormatted = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

      const device = this.getDeviceInfo();
      this.sessionScanId = 'HP-SCN-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100);

      const scanEntry = {
        scanId: this.sessionScanId,
        timestamp: now.toISOString(),
        date: dateFormatted,
        time: timeFormatted,
        table: this.sessionTable ? `Table ${this.sessionTable}` : 'Unassigned / Walk-in',
        room: this.sessionRoom ? `Room ${this.sessionRoom}` : 'N/A',
        source: this.sessionSource,
        deviceOS: device.os,
        browser: device.browser,
        screen: device.screenResolution,
        lang: device.language,
        url: window.location.href
      };

      let scans = this.getLevel1Scans();
      scans.unshift(scanEntry);

      // Keep up to 1000 scans safely in storage
      if (scans.length > 1000) scans = scans.slice(0, 1000);
      localStorage.setItem(this.storageKeyLevel1, JSON.stringify(scans));
    } catch (e) {
      console.warn('[Vault] Level 1 logging notice:', e);
    }
  }

  getLevel1Scans() {
    try {
      const saved = localStorage.getItem(this.storageKeyLevel1);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  // ========================================================================
  // LEVEL 3: BROWSING BEHAVIOR & MENU ENGAGEMENT ANALYTICS
  // ========================================================================
  getLevel3Data() {
    try {
      const saved = localStorage.getItem(this.storageKeyLevel3);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return {
      dishViews: {},      // { [dishId]: { name, category, views } }
      categoryClicks: {}, // { [categoryId]: count }
      searchQueries: {},  // { [queryText]: count }
      filterClicks: {},   // { [filterName]: count }
      totalDwellSeconds: 0,
      sessionVisits: 0
    };
  }

  saveLevel3Data(data) {
    try {
      localStorage.setItem(this.storageKeyLevel3, JSON.stringify(data));
    } catch (e) {
      console.warn('[Vault] Level 3 save notice:', e);
    }
  }

  recordDishView(dishId, dishName, categoryId) {
    if (!dishId) return;
    try {
      const l3 = this.getLevel3Data();
      if (!l3.dishViews[dishId]) {
        l3.dishViews[dishId] = {
          id: dishId,
          name: dishName || dishId,
          category: categoryId || 'general',
          views: 0,
          lastViewed: new Date().toISOString()
        };
      }
      l3.dishViews[dishId].views += 1;
      l3.dishViews[dishId].lastViewed = new Date().toISOString();
      this.saveLevel3Data(l3);
    } catch (e) {}
  }

  recordCategoryClick(categoryId) {
    if (!categoryId) return;
    try {
      const l3 = this.getLevel3Data();
      l3.categoryClicks[categoryId] = (l3.categoryClicks[categoryId] || 0) + 1;
      this.saveLevel3Data(l3);
    } catch (e) {}
  }

  recordSearchQuery(query) {
    const trimmed = (query || '').trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) return;
    try {
      const l3 = this.getLevel3Data();
      l3.searchQueries[trimmed] = (l3.searchQueries[trimmed] || 0) + 1;
      this.saveLevel3Data(l3);
    } catch (e) {}
  }

  recordFilterClick(filterName) {
    if (!filterName) return;
    try {
      const l3 = this.getLevel3Data();
      l3.filterClicks[filterName] = (l3.filterClicks[filterName] || 0) + 1;
      this.saveLevel3Data(l3);
    } catch (e) {}
  }

  setupDwellTimeTracker() {
    // Record dwell time periodically (every 30 seconds)
    setInterval(() => {
      try {
        const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        if (elapsed > 0 && elapsed < 7200) { // Limit to 2 hours per session
          const l3 = this.getLevel3Data();
          l3.totalDwellSeconds = (l3.totalDwellSeconds || 0) + 30;
          this.saveLevel3Data(l3);
        }
      } catch (e) {}
    }, 30000);
  }

  // ========================================================================
  // CUSTOMER LEADS & DINING FEEDBACK (Name, Contact, Region, Ratings)
  // ========================================================================
  recordFeedback(entry) {
    try {
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeFormatted = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

      const feedbackRecord = {
        id: 'HP-FB-' + Date.now().toString(36).toUpperCase(),
        timestamp: now.toISOString(),
        date: dateFormatted,
        time: timeFormatted,
        name: (entry.name || '').trim(),
        phone: (entry.phone || '').trim(),
        region: (entry.region || 'Bhusawal Local').trim(),
        tableOrRoom: entry.tableOrRoom || (this.sessionTable ? `Table ${this.sessionTable}` : 'Dine-In'),
        rating: Number(entry.rating) || 5,
        tags: Array.isArray(entry.tags) ? entry.tags : [],
        comments: (entry.comments || '').trim(),
        scanId: this.sessionScanId
      };

      let leads = this.getFeedbackLeads();
      leads.unshift(feedbackRecord);
      localStorage.setItem(this.storageKeyFeedback, JSON.stringify(leads));

      return feedbackRecord;
    } catch (e) {
      console.warn('[Vault] Feedback save notice:', e);
      return null;
    }
  }

  getFeedbackLeads() {
    try {
      const saved = localStorage.getItem(this.storageKeyFeedback);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  // Record an Event or Room Inquiry as a Customer Lead
  recordLeadFromInquiry(name, phone, region, details, type) {
    return this.recordFeedback({
      name: name,
      phone: phone,
      region: region,
      tableOrRoom: type || 'Inquiry',
      rating: 5,
      tags: [type || 'Event / Room Inquiry'],
      comments: details || ''
    });
  }

  // ========================================================================
  // DEVELOPER VAULT AUTHENTICATION & SECURITY
  // ========================================================================
  getMasterPin() {
    return localStorage.getItem(this.storageKeyMasterPin) || this.defaultPin;
  }

  setMasterPin(newPin) {
    if (newPin && newPin.length >= 4) {
      localStorage.setItem(this.storageKeyMasterPin, newPin);
      return true;
    }
    return false;
  }

  verifyMasterPin(enteredPin) {
    if ((enteredPin || '').trim() === this.getMasterPin()) {
      this.isVaultUnlocked = true;
      return true;
    }
    return false;
  }

  // ========================================================================
  // DEVELOPER EXPORT & DISPATCH MECHANISMS (CSV, JSON, WhatsApp, Email)
  // ========================================================================

  // Download helper for browser
  triggerDownload(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 1. Export Level 1 CSV
  exportLevel1CSV() {
    const scans = this.getLevel1Scans();
    if (!scans || scans.length === 0) {
      alert('No Level 1 scan records found yet.');
      return;
    }

    const headers = ['Scan ID', 'Date', 'Time', 'Table', 'Room', 'Source', 'OS', 'Browser', 'Screen', 'Language'];
    const rows = scans.map(s => [
      `"${s.scanId || ''}"`,
      `"${s.date || ''}"`,
      `"${s.time || ''}"`,
      `"${s.table || ''}"`,
      `"${s.room || ''}"`,
      `"${s.source || ''}"`,
      `"${s.deviceOS || ''}"`,
      `"${s.browser || ''}"`,
      `"${s.screen || ''}"`,
      `"${s.lang || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const dateStr = new Date().toISOString().slice(0, 10);
    this.triggerDownload(`HotelPremier_Level1_Scans_${dateStr}.csv`, csvContent, 'text/csv;charset=utf-8;');
  }

  // 2. Export Level 1 JSON
  exportLevel1JSON() {
    const scans = this.getLevel1Scans();
    const payload = {
      vault: 'Hotel Premier Developer Vault - Level 1 Scans',
      developer: 'Avinash Hedawoo',
      timestamp: new Date().toISOString(),
      totalScans: scans.length,
      scans: scans
    };
    const dateStr = new Date().toISOString().slice(0, 10);
    this.triggerDownload(`HotelPremier_Level1_Scans_${dateStr}.json`, JSON.stringify(payload, null, 2), 'application/json');
  }

  // 3. Export Level 3 CSV
  exportLevel3CSV() {
    const l3 = this.getLevel3Data();
    const dishList = Object.values(l3.dishViews || {}).sort((a, b) => b.views - a.views);

    const headers = ['Dish ID', 'Dish Name', 'Category', 'Total Views', 'Last Viewed'];
    const rows = dishList.map(d => [
      `"${d.id}"`,
      `"${(d.name || '').replace(/"/g, '""')}"`,
      `"${d.category || ''}"`,
      d.views,
      `"${d.lastViewed || ''}"`
    ]);

    const csvContent = ['--- TOP VIEWED DISHES ---', headers.join(','), ...rows.map(r => r.join(',')), '', '--- TOP SEARCH QUERIES ---', 'Keyword,Searches', ...Object.entries(l3.searchQueries || {}).map(([k, v]) => `"${k}",${v}`)].join('\n');
    const dateStr = new Date().toISOString().slice(0, 10);
    this.triggerDownload(`HotelPremier_Level3_Analytics_${dateStr}.csv`, csvContent, 'text/csv;charset=utf-8;');
  }

  // 4. Export Level 3 JSON
  exportLevel3JSON() {
    const l3 = this.getLevel3Data();
    const payload = {
      vault: 'Hotel Premier Developer Vault - Level 3 Browsing Analytics',
      developer: 'Avinash Hedawoo',
      timestamp: new Date().toISOString(),
      analytics: l3
    };
    const dateStr = new Date().toISOString().slice(0, 10);
    this.triggerDownload(`HotelPremier_Level3_Analytics_${dateStr}.json`, JSON.stringify(payload, null, 2), 'application/json');
  }

  // 5. Export Customer Leads & Feedback CSV
  exportFeedbackCSV() {
    const leads = this.getFeedbackLeads();
    if (!leads || leads.length === 0) {
      alert('No customer feedback or lead entries found yet.');
      return;
    }

    const headers = ['Feedback ID', 'Date', 'Time', 'Guest Name', 'Phone / WhatsApp', 'Region / City', 'Table / Room', 'Rating', 'Tags', 'Comments'];
    const rows = leads.map(f => [
      `"${f.id || ''}"`,
      `"${f.date || ''}"`,
      `"${f.time || ''}"`,
      `"${(f.name || '').replace(/"/g, '""')}"`,
      `"${f.phone || ''}"`,
      `"${(f.region || '').replace(/"/g, '""')}"`,
      `"${f.tableOrRoom || ''}"`,
      f.rating,
      `"${(f.tags || []).join('; ')}"`,
      `"${(f.comments || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const dateStr = new Date().toISOString().slice(0, 10);
    this.triggerDownload(`HotelPremier_Customer_Leads_${dateStr}.csv`, csvContent, 'text/csv;charset=utf-8;');
  }

  // 6. Export Customer Leads & Feedback JSON
  exportFeedbackJSON() {
    const leads = this.getFeedbackLeads();
    const payload = {
      vault: 'Hotel Premier Developer Vault - Customer Leads & Dining Feedback',
      developer: 'Avinash Hedawoo',
      timestamp: new Date().toISOString(),
      totalEntries: leads.length,
      leads: leads
    };
    const dateStr = new Date().toISOString().slice(0, 10);
    this.triggerDownload(`HotelPremier_Customer_Leads_${dateStr}.json`, JSON.stringify(payload, null, 2), 'application/json');
  }

  // 7. Complete Master System Backup (Developer Only)
  exportMasterVaultBackup() {
    const scans = this.getLevel1Scans();
    const l3 = this.getLevel3Data();
    const leads = this.getFeedbackLeads();

    let menuOverrides = {};
    try {
      const saved = localStorage.getItem('hotel_premier_user_overrides_v1');
      if (saved) menuOverrides = JSON.parse(saved);
    } catch (e) {}

    let roomOverrides = {};
    try {
      const saved = localStorage.getItem('hotel_premier_room_overrides');
      if (saved) roomOverrides = JSON.parse(saved);
    } catch (e) {}

    let bulkDeals = [];
    try {
      const saved = localStorage.getItem('hotel_premier_bulk_deals_override');
      if (saved) bulkDeals = JSON.parse(saved);
    } catch (e) {}

    const masterBackup = {
      app: 'Hotel Premier & Pride Pure Veg, Bhusawal',
      vaultVersion: '3.0.0-DeveloperOnly',
      architect: 'Avinash Hedawoo',
      contact: '+91 89837 03702',
      email: 'avinash.hedawoo@gmail.com',
      backupTimestamp: new Date().toISOString(),
      telemetry: {
        totalScans: scans.length,
        totalFeedbackLeads: leads.length,
        averageRating: leads.length ? (leads.reduce((a, b) => a + (b.rating || 5), 0) / leads.length).toFixed(1) : '5.0'
      },
      level1Scans: scans,
      level3Analytics: l3,
      customerFeedbackLeads: leads,
      menuOverrides: menuOverrides,
      roomOverrides: roomOverrides,
      bulkDeals: bulkDeals
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    this.triggerDownload(`HotelPremier_MASTER_VAULT_BACKUP_${dateStr}.json`, JSON.stringify(masterBackup, null, 2), 'application/json');
  }

  // 8. 1-Click WhatsApp Dispatch to Developer
  sendTelemetryToDeveloperWhatsApp() {
    const scans = this.getLevel1Scans();
    const l3 = this.getLevel3Data();
    const leads = this.getFeedbackLeads();

    const topDishes = Object.values(l3.dishViews || {}).sort((a, b) => b.views - a.views).slice(0, 5);
    const topSearches = Object.entries(l3.searchQueries || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const avgRating = leads.length ? (leads.reduce((a, b) => a + (b.rating || 5), 0) / leads.length).toFixed(1) : '5.0';

    let msg = `*🏨 HOTEL PREMIER - DEVELOPER TELEMETRY REPORT*\n`;
    msg += `*Architect:* Avinash Hedawoo\n`;
    msg += `*Date:* ${new Date().toLocaleDateString('en-IN')}\n\n`;

    msg += `*📊 1. LEVEL 1 SCAN SUMMARY:*\n`;
    msg += `• Total Scans: ${scans.length}\n`;
    const lastScan = scans[0];
    if (lastScan) {
      msg += `• Latest Scan: ${lastScan.table} (${lastScan.deviceOS}, ${lastScan.time})\n`;
    }

    msg += `\n*📈 2. LEVEL 3 ENGAGEMENT & POPULARITY:*\n`;
    if (topDishes.length > 0) {
      msg += `• Top Viewed Dishes:\n`;
      topDishes.forEach((d, i) => {
        msg += `   ${i + 1}. ${d.name} (${d.views} views)\n`;
      });
    } else {
      msg += `• Top Dishes: Gathering browse traffic...\n`;
    }

    if (topSearches.length > 0) {
      msg += `• Top Searches: ${topSearches.map(([k, v]) => `${k} (${v})`).join(', ')}\n`;
    }

    msg += `\n*⭐ 3. CUSTOMER LEADS & FEEDBACK:*\n`;
    msg += `• Total Reviews / Leads: ${leads.length}\n`;
    msg += `• Average Guest Rating: ${avgRating} / 5.0 ⭐\n`;
    if (leads.length > 0) {
      const recent = leads[0];
      msg += `• Latest Review: "${recent.name}" (${recent.region}, ${recent.phone}) -> ${recent.rating}★\n`;
    }

    const encoded = encodeURIComponent(msg);
    const waUrl = `https://wa.me/918983703702?text=${encoded}`;
    window.open(waUrl, '_blank');
  }

  // 9. 1-Click Email Dispatch to Developer
  sendTelemetryToDeveloperEmail() {
    const scans = this.getLevel1Scans();
    const l3 = this.getLevel3Data();
    const leads = this.getFeedbackLeads();
    const avgRating = leads.length ? (leads.reduce((a, b) => a + (b.rating || 5), 0) / leads.length).toFixed(1) : '5.0';

    const subject = encodeURIComponent(`Hotel Premier Telemetry & Vault Report - ${new Date().toISOString().slice(0, 10)}`);
    let body = `Dear Avinash,\n\nHere is your private Hotel Premier & Pride Pure Veg telemetry summary:\n\n`;
    body += `1. Total Level 1 Scans: ${scans.length}\n`;
    body += `2. Total Customer Leads / Reviews: ${leads.length}\n`;
    body += `3. Average Dining Star Rating: ${avgRating} / 5.0\n`;
    body += `4. Unique Searched Keywords: ${Object.keys(l3.searchQueries || {}).length}\n\n`;
    body += `You can download full CSV/JSON datasets anytime using your Developer PIN (9325) inside the Developer Modal.\n\nBest regards,\nHotel Premier System Engine`;

    const mailto = `mailto:avinash.hedawoo@gmail.com?subject=${subject}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  // Developer Purge / Reset Test Data
  purgeDeveloperLogs() {
    if (confirm('Are you sure you want to purge all Level 1 scans, Level 3 analytics, and Customer Leads? This cannot be undone.')) {
      localStorage.removeItem(this.storageKeyLevel1);
      localStorage.removeItem(this.storageKeyLevel3);
      localStorage.removeItem(this.storageKeyFeedback);
      alert('All telemetry logs have been reset to clean state.');
      if (window.app && typeof window.app.renderDeveloperVaultUI === 'function') {
        window.app.renderDeveloperVaultUI();
      }
    }
  }
}

// Instantiate Global Developer Vault Singleton
window.HOTEL_VAULT = new HotelPremierDeveloperVault();
