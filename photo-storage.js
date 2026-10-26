// Photo bytes live in IndexedDB records. localStorage contains compact metadata only.
(() => {
  'use strict';
  const urls = new Map();
  const isLocalPhoto = value => typeof value === 'string' && /^(?:data:image\/|blob:)/.test(value);
  function normalizePaths(value) {
    if(typeof value==='string'&&value.startsWith('assets/')) {
      let source=value.split('?')[0];try{source=decodeURIComponent(source);}catch(_){}
      return window.HOTEL_PREMIER_LEGACY_PHOTO_PATHS?.[source.slice(7).toLowerCase()]||value;
    }
    if(typeof Blob!=='undefined'&&value instanceof Blob)return value;
    if(Array.isArray(value))return value.map(normalizePaths);
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,normalizePaths(item)]));
    return value;
  }
  function compact(value) {
    if (isLocalPhoto(value) || (typeof Blob !== 'undefined' && value instanceof Blob)) return undefined;
    if (Array.isArray(value)) return value.map(compact).filter(item => item !== undefined);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key,item]) => [key,compact(item)]).filter(([,item]) => item !== undefined));
    return value;
  }
  async function pack(value) {
    if (isLocalPhoto(value)) {
      const response = await fetch(value);
      if (!response.ok) throw Error('The selected local photo is no longer available. Please select it again.');
      const blob = await response.blob();
      if (!/^image\/(?:jpeg|png|webp|avif|gif)$/.test(blob.type) || blob.size > 20*1024*1024) throw Error('Photo format or size cannot be stored safely.');
      return blob;
    }
    if (typeof Blob !== 'undefined' && value instanceof Blob) return value;
    if (Array.isArray(value)) return Promise.all(value.map(pack));
    if (value && typeof value === 'object') return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([key,item]) => [key,await pack(item)])));
    return value;
  }
  async function originalUploads(value) {
    const result={},seen=new Set();
    async function visit(item){
      if(typeof item==='string'&&!seen.has(item)){
        seen.add(item);const original=window.HotelPhotoWorkflow?.getOriginal?.(item);
        if(original){const bytes=await(await fetch(item)).arrayBuffer();const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');result[hash]=original;}
      }else if(Array.isArray(item))for(const child of item)await visit(child);
      else if(item&&typeof item==='object'&&!(item instanceof Blob))for(const child of Object.values(item))await visit(child);
    }
    await visit(value);return result;
  }
  function hydrate(value, key) {
    if (typeof Blob !== 'undefined' && value instanceof Blob) {
      if (!urls.has(key)) urls.set(key, URL.createObjectURL(value));
      return urls.get(key);
    }
    if (Array.isArray(value)) return value.map((item,index) => hydrate(item,key+'/'+index));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([name,item]) => [name,hydrate(item,key+'/'+name)]));
    return value;
  }
  async function portable(value) {
    if (typeof Blob !== 'undefined' && value instanceof Blob || typeof value === 'string' && value.startsWith('blob:')) {
      const blob = typeof value === 'string' ? await (await fetch(value)).blob() : value;
      return new Promise((resolve,reject) => {
        const reader = new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=()=>reject(Error('A photo could not be included in the backup. Nothing was deleted.')); reader.readAsDataURL(blob);
      });
    }
    if (Array.isArray(value)) return Promise.all(value.map(portable));
    if (value && typeof value === 'object') return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([key,item]) => [key,await portable(item)])));
    return value;
  }
  function bytes(value) {
    if (typeof Blob !== 'undefined' && value instanceof Blob) return value.size;
    if (Array.isArray(value)) return value.reduce((sum,item)=>sum+bytes(item),0);
    return value && typeof value === 'object' ? Object.values(value).reduce((sum,item)=>sum+bytes(item),0) : 0;
  }
  async function checkSpace(value) {
    if(!bytes(value))return;
    const storage = window.navigator?.storage;
    const estimate = await storage?.estimate?.().catch(()=>null);
    if (estimate?.quota && estimate.quota - (estimate.usage || 0) < Math.max(bytes(value)*2, 5*1024*1024)) {
      window.dispatchEvent(new Event('hp-storage-pressure'));
      throw Error('Device storage is low. Export a backup, free some space, then retry. Your saved photo is unchanged.');
    }
    // This runs only from an explicit Save action, never while a guest browses.
    const persistent=storage?.persisted ? await storage.persisted().catch(()=>false) : false;
    if (storage?.persist && !persistent) await storage.persist().catch(()=>false);
  }
  window.addEventListener('pagehide', event => { if (!event.persisted) release(''); });
  function release(prefix) {
    for (const [key,url] of urls) if (key.startsWith(prefix)) { URL.revokeObjectURL(url); urls.delete(key); }
  }
  window.HotelPhotoStorage = Object.freeze({ compact, pack, hydrate, portable, checkSpace, release, normalizePaths, originalUploads });
})();
