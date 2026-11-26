// Explicit owner export and 1-Click Direct Live Publishing.
// Publishes directly to GitHub without requiring a manual backup export or an external agent.
(() => {
  'use strict';

  // 1. Core Bundle Construction (shared by direct publish & backup export)
  async function buildBundle() {
    if (!window.admin?.isAuthenticated) throw Error('Unlock Admin Studio before publishing.');
    await window.HotelAdminWorkspace?.saveAll?.({notify:false});
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
    for (const dish of window.app.menuData) {
      // Individual child edits must reach their selectable option too. Match identity,
      // never array position; explicit option uploads remain selected.
      const variants=dish.variants?.map(variant=>{
        const matches=window.app.menuData.filter(child=>!child.notAvailable&&child.groupedUnder===dish.id&&(variant.id?child.id===variant.id:child.name===variant.name));
        const child=matches.length===1?matches[0]:null;
        if(child&&child.image!==undefined&&!/^(blob:|data:image\/)/.test(variant.image||''))return {...variant,image:child.image};
        return variant;
      });
      dishes[dish.id] = await publicData(variants?{...dish,variants}:dish);
    }

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
      roomDetails: window.HotelAdminWorkspace?.publicRooms?.() || window.HOTEL_PREMIER_PUBLISHED_OVERRIDES?.roomDetails || {},
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
              <div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:10px;">
                <span style="font-size:1.5rem; line-height:1;">🔑</span>
                <div>
                  <h5 style="margin:0 0 4px; font-size:1rem; color:var(--accent);">Connect Free GitHub Security Token (One-Time Setup)</h5>
                  <p style="margin:0; font-size:0.83rem; line-height:1.45; color:var(--muted);">
                    To publish directly from your phone or remote browser to GitHub Pages, GitHub requires a security access key.
                    <strong>This is 100% free</strong> (a standard GitHub developer key, NOT a paid coin or crypto) and only needs to be entered once.
                  </p>
                </div>
              </div>

              <div style="background:rgba(197, 168, 128, 0.12); border:1px solid rgba(197, 168, 128, 0.35); border-radius:8px; padding:10px 12px; margin:10px 0;">
                <p style="margin:0 0 6px; font-weight:700; font-size:0.86rem; color:var(--text);">How to get your free token in 3 easy steps:</p>
                <ol style="margin:0; padding-left:18px; font-size:0.82rem; line-height:1.55; color:var(--text);">
                  <li><a href="https://github.com/settings/tokens/new?scopes=repo&amp;description=Hotel+Premier+Live+Publish" target="_blank" rel="noopener" style="color:var(--accent); font-weight:700; text-decoration:underline;">👉 Tap here to open GitHub Token Generator</a> (sign in if asked).</li>
                  <li>Scroll to the bottom of that page and click the green <strong>"Generate token"</strong> button.</li>
                  <li>Copy your new token (starts with <code>ghp_...</code>) and paste it into the box below. It saves permanently on this device!</li>
                </ol>
              </div>

              <label class="form-label" for="direct-pub-gh-token-input" style="font-size:0.85rem; font-weight:700;">
                Paste GitHub Token (starts with ghp_...):
                <input type="password" id="direct-pub-gh-token-input" class="form-input" placeholder="ghp_..." autocomplete="off" style="margin-top:4px;">
              </label>

              <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;">
                <button type="button" class="btn-primary" id="direct-pub-token-submit" onclick="window.HotelDirectPublisher.submitToken()">Save &amp; Publish</button>
                <button type="button" class="btn-secondary" onclick="window.HotelPublishBundle.export().catch(e=>window.app.showToast(e.message,'error'))">📥 Download Backup File Instead</button>
                <button type="button" class="btn-secondary" onclick="window.HotelDirectPublisher.closeModal()">Cancel</button>
              </div>
              <p class="admin-text-hint" style="margin-top:10px; font-size:0.78rem;">
                💻 <strong>On your PC:</strong> Double-click <code>Start-QR-Menu-Server.bat</code> and open <code>http://localhost:8080</code> to publish with zero tokens required!
              </p>
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

    // Stage blobs without changing the live branch. Photos and content land together.
    const api = `https://api.github.com/repos/${repoOwner}/${repoName}`;
    async function github(path, body) {
      const response = await fetch(api + path, { headers, ...(body ? { method:'POST', body:JSON.stringify(body) } : {}), signal:AbortSignal.timeout(30000) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw Error(`GitHub could not save this release (HTTP ${response.status}): ${data.message || 'Please try again.'}`);
      return data;
    }
    const head = await github(`/git/ref/heads/${branch}`);
    const parent = await github(`/git/commits/${head.object.sha}`);
    const existingTree = await github(`/git/trees/${parent.tree.sha}?recursive=1`);
    if (existingTree.truncated) throw Error('The repository listing is incomplete. Download a backup and ask your developer to publish.');
    const existingPaths = new Set(existingTree.tree.filter(entry=>entry.type==='blob').map(entry=>entry.path));
    const treeEntries = [];
    let uploadedCount = 0;
    for (const img of bundle.images) {
      setPublishStage('📷', 'Uploading Photos', `Saving photo ${uploadedCount + 1} of ${bundle.images.length}...`, 40 + Math.round((uploadedCount / bundle.images.length) * 30));
      if (!existingPaths.has(img.path)) {
        const blob = await github('/git/blobs', { content:img.base64, encoding:'base64' });
        treeEntries.push({ path:img.path, mode:'100644', type:'blob', sha:blob.sha });
      }
      uploadedCount++;
    }

    // Update data/published-overrides.js
    setPublishStage('📜', 'Publishing Overrides', 'Updating published overrides file on GitHub...', 85);
    const overridesPath = 'data/published-overrides.js';
    bundle.overrides.publishedAt = Date.now();
    const code = `// Reviewed owner public export, ${new Date().toISOString()}.\nwindow.HOTEL_PREMIER_PUBLISHED_OVERRIDES = ${JSON.stringify(bundle.overrides, null, 2)};\n`;
    const contentBlob = await github('/git/blobs', { content:code, encoding:'utf-8' });
    treeEntries.push({ path:overridesPath, mode:'100644', type:'blob', sha:contentBlob.sha });
    const tree = await github('/git/trees', { base_tree:parent.tree.sha, tree:treeEntries });
    const commit = await github('/git/commits', { message:'Publish Hotel Premier owner updates', tree:tree.sha, parents:[head.object.sha] });
    const updateRes = await fetch(`${api}/git/refs/heads/${branch}`, {
      method:'PATCH', headers, body:JSON.stringify({sha:commit.sha,force:false}), signal:AbortSignal.timeout(30000)
    });
    if (!updateRes.ok) throw Error('Another update reached GitHub while this release was saving. Nothing was overwritten. Refresh after backing up your edits, then publish again.');
    return {
      success: true,
      commit: commit.sha,
      version: 'live-github',
      imagesSaved: uploadedCount,
      publishedAt:bundle.overrides.publishedAt,
      expectedContent:code,
      message: 'Saved to GitHub. Waiting for website deployment.'
    };
  }

  async function verifyLivePublication(result, bundle) {
    const publishedAt = result.publishedAt || bundle.overrides.publishedAt;
    const liveBase = 'https://avi22sh.github.io/Hotel-Premier/';
    for (let attempt=0; attempt<36; attempt++) {
      setPublishStage('⏳', 'Saved to GitHub · Checking Website', 'Your edits are saved. Waiting for GitHub Pages to make them visible to guests. Keep this page open.', 90);
      try {
        const response=await fetch(`${liveBase}data/published-overrides.js?publication=${publishedAt}&check=${attempt}`,{cache:'no-store',signal:AbortSignal.timeout(10000)});
        if(response.ok){
          const code=await response.text();
          const version=Number(code.match(/"publishedAt"\s*:\s*(\d+)/)?.[1]);
          if(publishedAt && version===publishedAt && (!result.expectedContent || code.replace(/\r\n/g,'\n')===result.expectedContent.replace(/\r\n/g,'\n')))return true;
        }
      } catch (_) { /* A temporary offline response is not a successful deployment. */ }
      if(result.commit && attempt%3===0){
        try{
          // Public status only; never send the publishing token to the guest website.
          const response=await fetch(`https://api.github.com/repos/avi22sh/Hotel-Premier/actions/runs?head_sha=${encodeURIComponent(result.commit)}&per_page=10`,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(10000)});
          if(response.ok){
            const runs=(await response.json()).workflow_runs||[];
            const deployment=runs.find(run=>run.path==='.github/workflows/deploy-pages.yml'||run.name==='Deploy Hotel Premier to GitHub Pages');
            if(deployment?.status==='completed' && ['failure','cancelled','timed_out','action_required'].includes(deployment.conclusion))return false;
          }
        }catch(_){ /* Live content verification still works if status lookup is unavailable. */ }
      }
      if(attempt<35)await new Promise(resolve=>setTimeout(resolve,5000));
    }
    return false;
  }

  async function showPublishOutcome(result, bundle) {
    window.HOTEL_PREMIER_PUBLISHED_OVERRIDES=bundle.overrides;
    const live=await verifyLivePublication(result,bundle);
    if(live){
      setPublishStage('🎉','Published and Verified Live',`Your updates (${result.imagesSaved||0} photos and saved menu changes) are now visible on the guest website. Guests with the app already open can refresh to see them.`,100,true);
      window.app.showToast('Published and verified on the guest website.','success');
    }else{
      setPublishStage('⏳','Saved · Website Update Not Yet Verified','Your edits are safely saved to GitHub, but the guest website has not updated yet. Check GitHub Actions for a deployment failure or wait and check again. Your local edits are retained.',100,true);
      window.app.showToast('Saved to GitHub; live deployment is not yet verified.','info');
    }
  }

  // 5. Direct Live Publishing Orchestrator
  let pendingBundle = null;
  let publishing = false;

  async function publish() {
    if (publishing) return;
    publishing = true;
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

      await showPublishOutcome(result,bundle);
    } catch (error) {
      console.error('Publish error:', error);
      setPublishStage('❌', 'Publish Failed', error.message || 'An error occurred during publish.', 100, true);
      window.app.showToast('Publish failed: ' + error.message, 'error');
    } finally {
      publishing = false;
    }
  }

  async function submitToken() {
    if (publishing) return;
    const input = document.getElementById('direct-pub-gh-token-input');
    const token = input ? input.value.trim() : '';
    if (!token) {
      window.app.showToast('Please enter a valid GitHub token.', 'error');
      return;
    }
    localStorage.setItem('hotel_premier_gh_token', token);
    const tokenBox = document.getElementById('direct-pub-token-prompt');
    if (tokenBox) tokenBox.style.display = 'none';

    publishing = true;
    try {
      setPublishStage('🚀', 'Pushing to GitHub', 'Committing updates directly to GitHub Pages repository...', 60);
      const result = await publishViaGitHubApi(pendingBundle, token);
      await showPublishOutcome(result,pendingBundle);
    } catch (error) {
      console.error('GitHub API Publish error:', error);
      setPublishStage('❌', 'Publish Failed', error.message || 'An error occurred during publish.', 100, true);
      window.app.showToast('Publish failed: ' + error.message, 'error');
    } finally {
      publishing = false;
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
