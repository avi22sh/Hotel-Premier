/* Guest section navigation. Forms, horizontal galleries and Admin own their gestures. */
(() => {
 'use strict';
 const sections=[['section-home','home'],['section-stay','stay'],['section-tariffs','tariffs'],['section-dine','dine'],['section-celebrate','celebrate'],['section-explore','explore'],['guest-feedback-section','reviews'],['section-contact','contact']];
 const protectedSelector='button,a,input,select,textarea,summary,label,[contenteditable],[role="slider"],form,.form-group,.quantity-stepper,.calculator-card,.wizard-summary-card,#group-stay-enquiry,.dish-card-variant-chips,.dish-card-chip,.room-carousel-container,.attraction-img-wrap,.atmosphere-card,#restaurant-hero-carousel,#section-slideshow-container,.hero-carousel-wrapper,.section-slideshow-container,.section-carousel-container,.section-slides-container,.app-header,.app-footer,img,video,canvas,svg';
 let current='section-home',start=null,ghost=null;
 const say=value=>window.HotelGuestLanguage?.text(value)||value;
 const index=()=>sections.findIndex(([id])=>id===current);
 const label=id=>{const row=sections.find(([key])=>key===id);return row?(document.getElementById('tab-nav-'+row[1])?.textContent||'').replace(/\s+/g,' ').trim().replace(/^[^\p{L}\p{N}]+/u,''):'';};
 function blocked(){return Boolean(document.querySelector('.modal-backdrop.active,dialog[open],#guest-settings[open]'))||/^#admin(?:$|[/?])/i.test(window.location.hash||'');}
 function sync(id=window.app?.activeSection||current){
  current=id;const at=index();
  for(const [name,step] of [['previous',-1],['next',1]]){
   const button=document.getElementById('section-'+name);if(!button)continue;
   const next=sections[at+step],disabled=at<0||!next;
   button.disabled=disabled;
   const text=say(name==='previous'?'Previous section':'Next section')+(disabled?'':': '+label(next[0]));
   button.setAttribute('aria-label',text);button.setAttribute('title',text);
  }
 }
 function move(step){
  if(blocked()||!window.app?.switchSection)return false;
  sync();const at=index(),next=sections[at+step];if(at<0||!next)return false;
  window.app.switchSection(next[0]);sync(next[0]);
  const status=document.getElementById('section-navigation-status');if(status)status.textContent=label(next[0]);
  return true;
 }
 function protectedTarget(target,root){
  if(!target?.closest||target.closest(protectedSelector))return true;
  for(let node=target;node&&node!==root;node=node.parentElement){
   const overflow=getComputedStyle(node).overflowX;
   if(/auto|scroll/.test(overflow)&&node.scrollWidth>node.clientWidth+2)return true;
  }
  return false;
 }
 function direction({dx,dy,elapsed,scrolled}){
  return elapsed>=0&&elapsed<=800&&Math.abs(scrolled)<=24&&Math.abs(dx)>=72&&Math.abs(dy)<80&&Math.abs(dx)>Math.abs(dy)*1.7?(dx<0?1:-1):0;
 }
 function touchStart(event){
  start=null;if(blocked()||event.touches?.length!==1)return;
  const target=event.target?.nodeType===3?event.target.parentElement:event.target;
  const root=target?.closest?.('.section-wrapper,#guest-feedback-section');
  sync();if(!root||root.id!==current||index()<0||protectedTarget(target,root))return;
  if(document.activeElement?.matches?.('input,select,textarea,[contenteditable]'))return;
  const touch=event.touches[0];if(touch.clientX<24||touch.clientX>window.innerWidth-24)return;
  start={x:touch.clientX,y:touch.clientY,time:Date.now(),scroll:window.scrollY||0,section:current,target};
 }
 function touchEnd(event){
  const gesture=start;start=null;
  if(!gesture||blocked()||event.touches?.length||event.changedTouches?.length!==1||gesture.target.isConnected===false)return;
  sync();if(current!==gesture.section)return;
  const touch=event.changedTouches[0],step=direction({dx:touch.clientX-gesture.x,dy:touch.clientY-gesture.y,elapsed:Date.now()-gesture.time,scrolled:(window.scrollY||0)-gesture.scroll});
  if(step&&move(step)){
   if(event.cancelable)event.preventDefault();
   ghost={target:gesture.target,until:Date.now()+400};
  }
 }
 function init(){
  document.getElementById('section-previous')?.addEventListener('click',()=>move(-1));
  document.getElementById('section-next')?.addEventListener('click',()=>move(1));
  document.addEventListener('touchstart',touchStart,{passive:true,capture:true});
  document.addEventListener('touchmove',event=>{if(event.touches?.length!==1)start=null;},{passive:true,capture:true});
  document.addEventListener('touchcancel',()=>{start=null;},{passive:true,capture:true});
  document.addEventListener('touchend',touchEnd,{passive:false,capture:true});
  document.addEventListener('click',event=>{
   if(ghost&&Date.now()<ghost.until&&event.detail!==0&&(event.target===ghost.target||ghost.target.contains?.(event.target))){event.preventDefault();event.stopImmediatePropagation();ghost=null;}
  },true);
  let width=document.querySelector('.hotel-nav-inner')?.clientWidth||0,queued=false;
  window.addEventListener('resize',()=>{
   if(queued)return;queued=true;
   requestAnimationFrame(()=>{
    queued=false;const nextWidth=document.querySelector('.hotel-nav-inner')?.clientWidth||0;
    if(nextWidth===width)return;width=nextWidth;
    const row=sections[index()];if(row&&!blocked())document.getElementById('tab-nav-'+row[1])?.scrollIntoView({inline:'center',block:'nearest',behavior:'auto'});
   });
  });
  sync();
 }
 window.HotelSectionNavigation=Object.freeze({sync,move,direction});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
