/* Native dialog supplies focus containment and Escape-to-close. */
(() => {
  const imageNote='Images are for reference. Actual presentation may vary.';
  const copy=text=>window.HotelGuestLanguage?.text?.(text,window.app?.currentLang||'en')||text;
  function initDishViewer(){
    const body=document.getElementById('dish-detail-body');if(!body)return;
    const dialog=document.createElement('dialog');dialog.className='dish-photo-viewer';dialog.setAttribute('aria-label','Expanded dish photo');
    const header=document.createElement('header'),title=document.createElement('h2'),close=document.createElement('button'),image=document.createElement('img'),note=document.createElement('p');
    close.type='button';close.textContent='×';close.setAttribute('aria-label','Close expanded photo');close.className='dish-photo-viewer-close';
    image.alt='';image.decoding='async';header.append(title,close);dialog.append(header,image,note);document.body.append(dialog);
    let opener;
    function open(button){const source=body.querySelector('img#detail-modal-img');if(!source||source.hidden||source.closest('.no-photo'))return;
      opener=button;title.textContent=source.alt||copy('Dish photo');image.src=source.getAttribute('src');image.alt=source.alt;note.textContent=copy(imageNote);dialog.showModal();
    }
    close.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
    dialog.addEventListener('close',()=>queueMicrotask(()=>{if(opener?.isConnected)opener.focus({preventScroll:true});image.removeAttribute('src');}));
    function sync(){const wrap=body.querySelector('.modal-dish-photo-wrap');if(!wrap)return;
      let expand=wrap.querySelector('.dish-photo-expand');if(!expand){expand=document.createElement('button');expand.type='button';expand.className='dish-photo-expand';expand.textContent='⛶';expand.addEventListener('click',event=>{event.stopPropagation();open(expand);});wrap.append(expand);}
      expand.setAttribute('aria-label',copy('Expand dish photo'));expand.title=copy('Expand dish photo');expand.hidden=!wrap.querySelector('img#detail-modal-img')||wrap.classList.contains('no-photo');
    }
    body.addEventListener('click',event=>{if(event.target.matches('img#detail-modal-img'))open(event.target.closest('.modal-dish-photo-wrap').querySelector('.dish-photo-expand'));});
    new MutationObserver(sync).observe(body,{childList:true,subtree:true,attributes:true,attributeFilter:['src','class']});sync();
  }
  function init() {
    initDishViewer();
    const cards=Array.from(document.querySelectorAll('.atmosphere-card'));
    if(!cards.length)return;
    const dialog=document.createElement('dialog');dialog.className='property-viewer';dialog.setAttribute('aria-label','Property Moments photo gallery');
    const image=document.createElement('img'),caption=document.createElement('p'),controls=document.createElement('div');
    image.width=1200;image.height=900;image.decoding='async';
    caption.setAttribute('aria-live','polite');controls.className='property-viewer-controls';
    let current=0,opener=null,start=null;
    function show(index){current=(index+cards.length)%cards.length;const source=cards[current].querySelector('img');image.src=source.currentSrc||source.src;image.alt=source.alt;caption.textContent=`${current+1} / ${cards.length} · ${cards[current].querySelector('.atmosphere-card-caption')?.textContent||source.alt}`;note.textContent=copy(imageNote);}
    function button(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);return b;}
    const header=document.createElement('header'),title=document.createElement('h2');
    header.className='property-viewer-header';title.textContent='Property Moments';
    const close=button('×',()=>dialog.close());close.className='property-viewer-close';close.setAttribute('aria-label','Close photo gallery');
    header.append(title,close);
    controls.append(button('Previous Photo',()=>show(current-1)),button('Next Photo',()=>show(current+1)));
    const note=document.createElement('p');note.className='photo-reference-note';note.textContent=copy(imageNote);
    dialog.append(header,image,caption,controls,note);document.body.append(dialog);
    dialog.addEventListener('close',()=>{opener?.focus();});
    dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(current-1);}if(e.key==='ArrowRight'){e.preventDefault();show(current+1);}});
    image.addEventListener('touchstart',e=>{start=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
    image.addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy))show(current+(dx<0?1:-1));start=null;},{passive:true});
    cards.forEach((card,index)=>{
      card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-haspopup','dialog');card.setAttribute('aria-label',`View photo: ${card.querySelector('img').alt}`);
      const open=()=>{opener=card;show(index);dialog.showModal();};
      card.addEventListener('click',open);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
