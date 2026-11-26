(() => {
 'use strict';
 const panel=()=>document.getElementById('menu-tools-dialog');
 const close=()=>{panel()?.close();window.HotelOverlays?.sync();};
 const results=()=>{close();requestAnimationFrame(()=>{const target=document.getElementById('menu-items-grid');if(target)window.scrollTo({top:Math.max(0,target.getBoundingClientRect().top+scrollY-(document.querySelector('.app-header')?.getBoundingClientRect().height||0)-16),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});};
 window.HotelMenuTools={open(){if(!panel().open)panel().showModal();},close,results,collections(){close();window.app?.toggleMenuSectionDrawer();},favorites(){window.app?.toggleFavoritesFilter();results();}};
 panel()?.addEventListener('click',event=>{if(event.target===panel()){const r=panel().getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
})();
