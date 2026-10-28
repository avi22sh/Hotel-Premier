// Applies equally to static photos, dynamically rendered cards, and admin previews.
(() => {
 'use strict';
 const fallback='assets/brand-placeholder.svg';
 document.addEventListener('error',event=>{
  const image=event.target;
  if(image?.tagName!=='IMG'||image.getAttribute('src')===fallback)return;
  const qr=image.closest('#location-qr-mount,#qr-canvas-holder,.guest-network-qr');
  if(qr){
   const canvas=qr.querySelector('canvas');
   image.hidden=true;
   if(canvas)canvas.style.display='block';
   return;
  }
  image.onerror=null;image.removeAttribute('srcset');image.removeAttribute('sizes');
  image.hidden=false;image.src=fallback;image.dataset.photoUnavailable='true';
 },true);
 function prepare(image){
  const qr=image.closest('#location-qr-mount,#qr-canvas-holder,.guest-network-qr');
  if(qr){
   const size=qr.querySelector('canvas')?.width||220;
   image.setAttribute('width',String(size)); image.setAttribute('height',String(size));
   if(!image.hasAttribute('alt'))image.alt='Scan QR code';
   image.setAttribute('decoding','sync');
   return;
  }
  if(!image.hasAttribute('width'))image.setAttribute('width','1200');
  if(!image.hasAttribute('height'))image.setAttribute('height','900');
  if(!image.hasAttribute('decoding'))image.setAttribute('decoding','async');
  if(!image.hasAttribute('alt')) {
   const title=document.getElementById('image-modal-dish-name')?.textContent||'Hotel Premier photo';
   image.alt=(image.id==='image-original-element'?'Original: ':image.id==='image-preview-element'?'Preview: ':'')+title;
  }
  if(!image.hasAttribute('loading')&&!image.closest('dialog,.modal-backdrop'))image.setAttribute('loading','lazy');
 }
 function init(){
  document.querySelectorAll('img').forEach(prepare);
  new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType!==1)continue;if(node.tagName==='IMG')prepare(node);node.querySelectorAll?.('img').forEach(prepare);}}).observe(document.body,{subtree:true,childList:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
