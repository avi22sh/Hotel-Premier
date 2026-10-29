// Explicit owner export. No guest records, PIN verifier, provider keys, or router settings.
(() => {
 'use strict';
 async function exportBundle() {
  if(!window.admin?.isAuthenticated)throw Error('Unlock Admin Studio before exporting.');
  const images=new Map();
  async function imagePath(source) {
   if(typeof source!=='string'||! /^(?:blob:|data:image\/)/.test(source))return source;
   const response=await fetch(source);if(!response.ok)throw Error('A local photo is unavailable. Select it again before publishing.');
   let blob=await response.blob();
   if(window.HotelPhotoWorkflow?.optimizeForPublish)blob=await window.HotelPhotoWorkflow.optimizeForPublish(blob);
   const extension=({'image/webp':'webp','image/jpeg':'jpg','image/png':'png','image/avif':'avif'})[blob.type];
   if(!extension)throw Error('A photo has an unsupported publish format.');
   const bytes=await blob.arrayBuffer();
   const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
   const path=`assets/menu-uploads/published-${digest.slice(0,24)}.${extension}`;
   if(!images.has(path)) {
    const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Photo export failed.'));reader.readAsDataURL(blob);});
    images.set(path,{path,sha256:digest,mime:blob.type,base64:data.slice(data.indexOf(',')+1)});
   }
   return path;
  }
  async function publicData(value,key='') {
   if(['rawOriginalImage','enhancedMasterImage','originalPhotos','imageOptions','qualityScore','qualityFlags','foodCategory','styleVersion','lastEnhancedAt','updatedAt','fieldUpdatedAt','mediaRevision','revision','_activeVariantImage','_activeVariantPrice','_activeVariantName'].includes(key))return undefined;
   if(typeof value==='string')return imagePath(value);
   if(Array.isArray(value))return Promise.all(value.map(item=>publicData(item)));
   if(value&&typeof value==='object')return Object.fromEntries((await Promise.all(Object.entries(value).map(async([name,item])=>[name,await publicData(item,name)]))).filter(([,item])=>item!==undefined));
   return value;
  }
  const dishes={};
  for(const dish of window.app.menuData)dishes[dish.id]=await publicData(dish);
  const roomGalleries={};
  for(const room of window.HOTEL_PREMIER_HOTEL_DATA.roomCategories)roomGalleries[room.id]=await publicData(await window.HOTEL_STORAGE.getRoomGallery(room.id,room.images||[room.image]));
  const sectionSlides={};
  for(const id of ['restaurant_hero',...window.app.categories.filter(c=>c.id!=='all').map(c=>'category_'+c.id)]) {
   const slides=await window.HOTEL_STORAGE.getSectionSlides(id,null);
   if(slides)sectionSlides[id]=await publicData(slides);
  }
  const overrides={version:1,dishes,roomGalleries,sectionSlides,editorial:window.HotelContentStudio?.snapshot?.()||null,layout:await publicData(window.HotelMenuStructure?.snapshot?.(window.app)||null)};
  const bundle={format:'hotel-premier-public-bundle',version:1,createdAt:new Date().toISOString(),overrides,images:[...images.values()],instructions:[
   'Keep your full local backup separately. This bundle intentionally excludes guest and lock data.',
   'Run: node tools/unpack-publish-bundle.cjs <downloaded-bundle.json>',
   'Review the generated publish-import folder. Copy its assets and data folders into the project.',
   'Run the asset gate, regression tests and public build. Commit the reviewed files to GitHub.',
   'Confirm GitHub Pages deploys dist, then verify the guest site. Until then these edits are device-local.'
  ]};
  const url=URL.createObjectURL(new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=`hotel-premier-publish-${new Date().toISOString().slice(0,10)}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  window.app.showToast('Publish bundle exported. Guests see it only after reviewed deployment.','success');
 }
 window.HotelPublishBundle=Object.freeze({export:exportBundle});
})();
