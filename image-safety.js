// Applies equally to static photos, dynamically rendered cards, and admin previews.
(() => {
 'use strict';
 const fallback='assets/brand-placeholder.svg';
 document.addEventListener('error',event=>{
  const image=event.target;
  if(image?.tagName!=='IMG'||image.getAttribute('src')===fallback)return;
  image.onerror=null;image.removeAttribute('srcset');image.removeAttribute('sizes');
  image.hidden=false;image.src=fallback;image.dataset.photoUnavailable='true';
 },true);
 function prepare(image){
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
