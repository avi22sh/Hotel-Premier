// Explicit owner export and 1-Click Direct Live Publishing.
// Publishes directly to GitHub without requiring a manual backup export or an external agent.
(() => {
  'use strict';

  // 1. Core Bundle Construction (shared by direct publish & backup export)
  async function buildBundle() {
    if (!window.admin?.isAuthenticated) throw Error('Unlock Admin Studio before publishing.');
    const images = new Map();

    async function imagePath(source) {
      if (typeof source !== 'string' || !/^(?:blob:|data:image\/)/.test(source)) return source;
      const response = await fetch(source);
      if (!response.ok) throw Error('A local photo is unavailable. Select it again before publishing.');
      let blob = await response.blob();
      if (window.HotelPhotoWorkflow?.optimizeForPublish) {
        blob = await window.HotelPhotoWorkflow.optimizeForPublish(blob);
      }
      const extension = ({ 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/avif': 'avif' })[blob.type];
      if (!extension) throw Error('A photo has an unsupported publish format.');
      const bytes = await blob.arrayBuffer();
      const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
      const path = `assets/menu-uploads/published-${digest.slice(0, 24)}.${extension}`;
      if (!images.has(path)) {
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(Error('Photo export failed.'));
          reader.readAsDataURL(blob);
        });
        images.set(path, { path, sha256: digest, mime: blob.type, base64: data.slice(data.indexOf(',') + 1) });
      }
      return path;
    }

    async function publicData(value, key = '') {
      if (['rawOriginalImage', 'enhancedMasterImage', 'originalPhotos', 'imageOptions', 'qualityScore', 'qualityFlags', 'foodCategory', 'styleVersion', 'lastEnhancedAt', 'updatedAt', 'fieldUpdatedAt', 'mediaRevision', 'revision', '_activeVariantImage', '_activeVariantPrice', '_activeVariantName'].includes(key)) return undefined;
      if (typeof value === 'string') return imagePath(value);
      if (Array.isArray(value)) return Promise.all(value.map(item => publicData(item)));
      if (value && typeof value === 'object') {
        return Object.fromEntries(
          (await Promise.all(Object.entries(value).map(async ([name, item]) => [name, await publicData(item, name)])))
            .filter(([, item]) => item !== undefined)
        );
      }
      return value;
    }

    const dishes = {};
    for (const dish of window.app.menuData) dishes[dish.id] = await publicData(dish);

    const roomGalleries = {};
    for (const room of window.HOTEL_PREMIER_HOTEL_DATA.roomCategories) {
      roomGalleries[room.id] = await publicData(await window.HOTEL_STORAGE.getRoomGallery(room.id, room.images || [room.image]));
    }

    const sectionSlides = {};
    for (const id of ['restaurant_hero', ...window.app.categories.filter(c => c.id !== 'all').map(c => 'category_' + c.id)]) {
      const slides = await window.HOTEL_STORAGE.getSectionSlides(id, null);
      if (slides) sectionSlides[id] = await publicData(slides);
    }

    const overrides = {
      version: 1,
      dishes,
      roomGalleries,
      sectionSlides,
      editorial: window.HotelContentStudio?.snapshot?.() || null,
      layout: await publicData(window.HotelMenuStructure?.snapshot?.(window.app) || null)
    };

    if (window.HotelDataValidation?.validate) {
      window.HotelDataValidation.validate(overrides);
    }

    return {
      format: 'hotel-premier-public-bundle',
      version: 1,
      createdAt: new Date().toISOString(),
      overrides,
      images: [...images.values()]
    };
  }

  // 2. Legacy Export (Downloads JSON bundle file for device backup/migration)
  async function exportBundle() {
    window.app.showToast('Packaging backup bundle...', 'info');
    const bundle = await buildBundle();
    bundle.instructions = [
      'Keep your full local backup separately. This bundle intentionally excludes guest and lock data.',
      'One-click direct publish is also available in CRM without downloading files.'
    ];
    const url = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `hotel-premier-publish-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    window.app.showToast('Backup bundle exported successfully.', 'success');
  }

  // 3. UI Helpers: Modal & Status Display
  function ensurePublishModal() {
    let modal = document.getElementById('direct-publish-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'direct-publish-modal';
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal-sheet direct-publish-sheet" role="dialog" aria-modal="true" aria-labelledby="direct-pub-title">
          <div class="modal-header">
            <div class="modal-title" id="direct-pub-title"><span>🚀</span> <span>1-Click Live Publish</span></div>
            <button type="button" class="modal-close-btn" aria-label="Close publish dialog" onclick="window.HotelDirectPublisher.closeModal()">✕</button>
          </div>
          <div class="modal-body direct-publish-body">
            <div id="direct-pub-stage-icon" class="direct-pub-stage-icon">⚡</div>
            <h4 id="direct-pub-heading">Publishing to Live Website</h4>
            <p id="direct-pub-desc">Preparing your latest dish prices, photos, and room updates...</p>
            <div id="direct-pub-progress" class="direct-pub-progress-bar"><div class="direct-pub-progress-fill"></div></div>
            <div id="direct-pub-token-prompt" class="direct-pub-token-box" style="display:none;">
              <p>To publish directly from this remote browser/phone to GitHub Pages, enter your GitHub Token once:</p>
              <label class="form-label" for="direct-pub-gh-token-input">GitHub Personal Access Token (repo scope)
                <input type="password" id="direct-pub-gh-token-input" class="form-input" placeholder="ghp_..." autocomplete="off">
              </label>
              <div style="display:flex; gap:8px; margin-top:10px;">
                <button type="button" class="btn-primary" id="direct-pub-token-submit" onclick="window.HotelDirectPublisher.submitToken()">Save & Publish</button>
                <button type="button" class="btn-secondary" onclick="window.HotelDirectPublisher.closeModal()">Cancel</button>
              </div>
              <p class="admin-text-hint" style="margin-top:8px;">Tip: When running locally on PC with Start-QR-Menu-Server.bat, no token is needed!</p>
            </div>
            <div id="direct-pub-actions" style="margin-top:18px; display:none;">
              <button type="button" class="btn-primary" onclick="window.HotelDirectPublisher.closeModal()">Done</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
    return modal;
  }

  function setPublishStage(icon, heading, desc, progressPercent, showActions = false) {
    const modal = ensurePublishModal();
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.getElementById('direct-pub-stage-icon').textContent = icon;
    document.getElementById('direct-pub-heading').textContent = heading;
    document.getElementById('direct-pub-desc').textContent = desc;
    const bar = document.querySelector('.direct-pub-progress-fill');
    if (bar) bar.style.width = `${progressPercent}%`;
    const actions = document.getElementById('direct-pub-actions');
    if (actions) actions.style.display = showActions ? 'block' : 'none';
    const tokenBox = document.getElementById('direct-pub-token-prompt');
    if (tokenBox) tokenBox.style.display = 'none';
  }

  function closeModal() {
    const modal = document.getElementById('direct-pub-modal') || document.getElementById('direct-publish-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  }

  // 4. GitHub REST API Publisher (for remote devices / GitHub Pages)
  async function publishViaGitHubApi(bundle, token) {
    const repoOwner = 'avi22sh';
    const repoName = 'Hotel-Premier';
    const branch = 'main';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };

    // Upload any new images
    let uploadedCount = 0;
    for (const img of bundle.images) {
      setPublishStage('📷', 'Uploading Photos', `Saving photo ${uploadedCount + 1} of ${bundle.images.length}...`, 40 + Math.round((uploadedCount / bundle.images.length) * 30));
      const getUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${img.path}?ref=${branch}`;
      let existingSha = null;
      try {
        const checkRes = await fetch(getUrl, { headers });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          existingSha = checkData.sha;
        }
      } catch (_) {}

      const putRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${img.path}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `chore(photos): publish ${img.path.split('/').pop()}`,
          content: img.base64,
          branch,
          ...(existingSha ? { sha: existingSha } : {})
        })
      });
      if (!putRes.ok && putRes.status !== 422) {
        throw Error(`Failed to upload ${img.path}: HTTP ${putRes.status}`);
      }
      uploadedCount++;
    }

    // Update data/published-overrides.js
    setPublishStage('📜', 'Publishing Overrides', 'Updating published overrides file on GitHub...', 85);
    const overridesPath = 'data/published-overrides.js';
    const getOverridesUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${overridesPath}?ref=${branch}`;
    let overridesSha = null;
    const checkOverrides = await fetch(getOverridesUrl, { headers });
    if (checkOverrides.ok) {
      const data = await checkOverrides.json();
      overridesSha = data.sha;
    } else {
      throw Error('Could not find published-overrides.js on repository.');
    }

    bundle.overrides.publishedAt = Date.now();
    const code = `// Reviewed owner public export, ${new Date().toISOString()}.\nwindow.HOTEL_PREMIER_PUBLISHED_OVERRIDES = ${JSON.stringify(bundle.overrides, null, 2)};\n`;
    const encodedContent = btoa(unescape(encodeURIComponent(code)));

    const updateRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${overridesPath}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'feat(crm): 1-click live publish from Admin Studio',
        content: encodedContent,
        sha: overridesSha,
        branch
      })
    });

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      throw Error(`GitHub API update failed: ${errData.message || updateRes.status}`);
    }

    const resData = await updateRes.json();
    return {
      success: true,
      commit: resData.commit?.sha?.slice(0, 7) || 'latest',
      version: 'live-github',
      imagesSaved: uploadedCount,
      message: 'Published directly to GitHub Pages! Deployment in progress (~60s).'
    };
  }

  // 5. Direct Live Publishing Orchestrator
  let pendingBundle = null;

  async function publish() {
    try {
      if (!window.admin?.isAuthenticated) {
        window.app.showToast('Please unlock Admin Studio before publishing.', 'error');
        return;
      }

      setPublishStage('⚡', 'Collecting Edits', 'Gathering all dish edits, new prices, photos and room deals...', 15);
      const bundle = await buildBundle();
      pendingBundle = bundle;

      // Channel A: Try Local Dev Server First
      const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.port === '8080';
      const localEndpoints = isLocalHost
        ? ['/api/publish-direct', 'http://localhost:8080/api/publish-direct']
        : ['http://localhost:8080/api/publish-direct'];

      let localPublished = false;
      let result = null;

      for (const endpoint of localEndpoints) {
        try {
          setPublishStage('🔄', 'Contacting Local Server', 'Connecting to zero-click publishing service on localhost:8080...', 35);
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 65000); // allow git commit/push to finish

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bundle),
            signal: controller.signal
          });
          clearTimeout(timer);

          if (res.ok) {
            result = await res.json();
            if (result.success) {
              localPublished = true;
              break;
            } else {
              throw Error(result.error || 'Server reported publish failure.');
            }
          }
        } catch (fetchErr) {
          // If aborted or failed, try next or fallback
          console.warn('Local endpoint attempt failed:', endpoint, fetchErr.message);
        }
      }

      // Channel B: Fallback to GitHub REST API if not on local server
      if (!localPublished) {
        let ghToken = localStorage.getItem('hotel_premier_gh_token') || '';
        if (!ghToken) {
          // Prompt user in the modal
          setPublishStage('🔐', 'Remote Direct Publish', 'Publishing from a remote device requires a GitHub Token once.', 40);
          const tokenBox = document.getElementById('direct-pub-token-prompt');
          if (tokenBox) tokenBox.style.display = 'block';
          return; // Wait for submitToken()
        }

        setPublishStage('🚀', 'Pushing to GitHub', 'Committing updates directly to GitHub Pages repository...', 60);
        result = await publishViaGitHubApi(bundle, ghToken);
      }

      // Success Display
      window.HOTEL_PREMIER_PUBLISHED_OVERRIDES = bundle.overrides;
      setPublishStage(
        '🎉',
        'Published Successfully!',
        `Your updates (${result.imagesSaved || 0} photos, all dish & room changes) are live on GitHub! Cache version: ${result.version || 'v22'}. Guest devices will refresh automatically.`,
        100,
        true
      );
      window.app.showToast('Published to live site successfully!', 'success');
    } catch (error) {
      console.error('Publish error:', error);
      setPublishStage('❌', 'Publish Failed', error.message || 'An error occurred during publish.', 100, true);
      window.app.showToast('Publish failed: ' + error.message, 'error');
    }
  }

  async function submitToken() {
    const input = document.getElementById('direct-pub-gh-token-input');
    const token = input ? input.value.trim() : '';
    if (!token) {
      window.app.showToast('Please enter a valid GitHub token.', 'error');
      return;
    }
    localStorage.setItem('hotel_premier_gh_token', token);
    const tokenBox = document.getElementById('direct-pub-token-prompt');
    if (tokenBox) tokenBox.style.display = 'none';

    try {
      setPublishStage('🚀', 'Pushing to GitHub', 'Committing updates directly to GitHub Pages repository...', 60);
      const result = await publishViaGitHubApi(pendingBundle, token);
      window.HOTEL_PREMIER_PUBLISHED_OVERRIDES = pendingBundle.overrides;
      setPublishStage(
        '🎉',
        'Published Successfully!',
        `Your updates (${result.imagesSaved || 0} photos, all dish & room changes) are live on GitHub! Guest devices will refresh automatically.`,
        100,
        true
      );
      window.app.showToast('Published to live site successfully!', 'success');
    } catch (error) {
      console.error('GitHub API Publish error:', error);
      setPublishStage('❌', 'Publish Failed', error.message || 'An error occurred during publish.', 100, true);
      window.app.showToast('Publish failed: ' + error.message, 'error');
    }
  }

  function openSettings() {
    const current = localStorage.getItem('hotel_premier_gh_token') || '';
    const modal = ensurePublishModal();
    setPublishStage('⚙️', 'Direct Publish Settings', 'Manage your Direct Publishing connection and tokens.', 100);
    const tokenBox = document.getElementById('direct-pub-token-prompt');
    if (tokenBox) {
      tokenBox.style.display = 'block';
      const input = document.getElementById('direct-pub-gh-token-input');
      if (input) input.value = current;
    }
  }

  window.HotelPublishBundle = Object.freeze({
    export: exportBundle,
    publish: publish,
    buildBundle: buildBundle,
    closeModal: closeModal,
    submitToken: submitToken,
    openSettings: openSettings
  });
  window.HotelDirectPublisher = window.HotelPublishBundle;
})();
