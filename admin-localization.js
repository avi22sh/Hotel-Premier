/* Localize interface copy only. Never touch PINs, field values, guest records or authored menu content. */
(() => {
 'use strict';
 const originals=new WeakMap(),attributes=new WeakMap();
 const privateCopy='.crm-records-table tbody,.admin-item-name,.admin-item-description,.admin-item-category,.photo-library-card h4,.preset-label';
 const excluded='input,textarea,script,style,[contenteditable],'+privateCopy;
 function sync(root){
  if(!window.HotelGuestLanguage||!document.createTreeWalker)return;
  const lang=window.HOTEL_PREMIER_I18N?.currentLang||'en';
  const roots=root?[root]:document.querySelectorAll('#admin-modal-backdrop.active,#image-replace-modal.active,#add-dish-modal.active');
  for(const host of roots){
   const walker=document.createTreeWalker(host,4);let node;
   while((node=walker.nextNode())){
    const parent=node.parentElement;if(!parent||parent.closest(excluded)||!node.nodeValue.trim())continue;
    const previous=originals.get(node),source=previous&&previous.applied===node.nodeValue?previous.source:node.nodeValue;
    const translated=window.HotelGuestLanguage.text(source.trim(),lang);
    const next=source.match(/^\s*/)[0]+translated+source.match(/\s*$/)[0];
    if(parent.tagName==='OPTION'&&!parent.hasAttribute('value'))parent.setAttribute('value',source.trim());
    originals.set(node,{source,applied:next});if(node.nodeValue!==next)node.nodeValue=next;
   }
   for(const field of host.querySelectorAll('[placeholder],[aria-label],[title]')){
    if(field.closest(privateCopy))continue;
    const saved=attributes.get(field)||{};
    for(const name of ['placeholder','aria-label','title']){
     if(!field.hasAttribute(name))continue;
     const value=field.getAttribute(name),old=saved[name],source=old&&old.applied===value?old.source:value;
     const translated=window.HotelGuestLanguage.text(source,lang);saved[name]={source,applied:translated};if(value!==translated)field.setAttribute(name,translated);
    }attributes.set(field,saved);
   }
  }
 }
 function init(){
  let scheduled=false;const queue=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;sync();});};
  new MutationObserver(queue).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  new MutationObserver(queue).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});sync();
 }
 window.HotelAdminLanguage=Object.freeze({sync});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
