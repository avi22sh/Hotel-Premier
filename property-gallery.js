/* Native dialog supplies focus containment and Escape-to-close. */
(() => {
  const imageNote='Images are for reference. Actual presentation may vary.';
  const copy=text=>window.HotelGuestLanguage?.text?.(text,window.app?.currentLang||'en')||text;
  function collectDishPhotos(app){
    const result=[];
    const order=new Map((app?.categories||[]).map((category,index)=>[category.id,index]));
    const dishes=[...(app?.getVisibleMenuItems?.()||[])].sort((a,b)=>(order.get(a.categoryId)??999)-(order.get(b.categoryId)??999));
    for(const dish of dishes){
      const options=dish.variants?.length?dish.variants.map((value,index)=>({value,index})).filter(({value})=>!value.hidden):[{value:dish,index:null}];
      for(const {value,index}of options){const source=value.image!==undefined?value.image:dish.image;
        if(!source||source.includes('brand-placeholder.svg'))continue;
        const lang=app.currentLang||'en';result.push({dishId:dish.id,variantIndex:index,source,name:(lang==='hi'?value.hindiName:lang==='mr'?value.marathiName:value.name)||value.name||dish.name,price:value.price===undefined?dish.price:value.price,category:app.categories?.find(c=>c.id===dish.categoryId)?.name||''});
      }
    }
    return result;
  }
  window.HotelDishPhotoBrowser={collect:collectDishPhotos};
  function initDishViewer(){
    const body=document.getElementById('dish-detail-body');if(!body)return;
    const dialog=document.createElement('dialog');dialog.className='dish-photo-viewer';dialog.setAttribute('aria-label','Expanded dish photo');
    const header=document.createElement('header'),heading=document.createElement('div'),title=document.createElement('h2'),meta=document.createElement('p'),close=document.createElement('button');
    const stage=document.createElement('div'),image=document.createElement('img'),error=document.createElement('p'),controls=document.createElement('nav'),counter=document.createElement('span'),note=document.createElement('p');
    meta.className='dish-photo-meta';stage.className='dish-photo-stage';controls.className='dish-photo-controls';counter.setAttribute('aria-live','polite');error.hidden=true;
    const control=(label,symbol,action)=>{const b=document.createElement('button');b.type='button';b.textContent=symbol;b.setAttribute('aria-label',label);b.addEventListener('click',action);return b;};
    close.type='button';close.textContent='×';close.setAttribute('aria-label','Close expanded photo');close.className='dish-photo-viewer-close';
    const previous=control('Previous dish photo','←',()=>move(-1)),next=control('Next dish photo','→',()=>move(1));
    heading.append(title,meta);header.append(heading,close);image.alt='';image.decoding='async';image.draggable=false;stage.append(image,error);controls.append(previous,counter,next);note.className='photo-reference-note';dialog.append(header,stage,controls,note);document.body.append(dialog);
    let opener,photos=[],current=0,initial,gesture=null;
    function show(index){
      current=(index+photos.length)%photos.length;const item=photos[current];title.textContent=item.name;meta.textContent=[item.category,Number.isFinite(item.price)?'₹'+item.price:''].filter(Boolean).join(' · ');
      image.src=window.AssetPipeline?.versionedPhotoSource(item.source)||item.source;image.alt=item.name;image.hidden=false;error.hidden=true;stage.scrollTo(0,0);
      counter.textContent=(current+1)+' / '+photos.length;previous.disabled=next.disabled=photos.length<2;note.textContent=copy(imageNote);
    }
    function move(delta){if(photos.length>1)show(current+delta);}
    function open(button){const source=body.querySelector('img#detail-modal-img');if(!source||source.hidden||source.closest('.no-photo'))return;
      opener=button;photos=collectDishPhotos(window.app);current=photos.findIndex(item=>item.dishId===window.app.currentDetailDishId&&(item.variantIndex===window.app.currentDetailVariantIndex||item.variantIndex===null));
      if(current<0)current=photos.findIndex(item=>item.source.split('?')[0]===source.getAttribute('src').split('?')[0]&&item.name===source.alt);
      if(current<0){photos.unshift({source:source.getAttribute('src'),name:source.alt,dishId:window.app.currentDetailDishId,variantIndex:window.app.currentDetailVariantIndex});current=0;}
      previous.setAttribute('aria-label',copy('Previous dish photo'));next.setAttribute('aria-label',copy('Next dish photo'));initial=photos[current];show(current);dialog.showModal();
    }
    image.addEventListener('error',()=>{image.hidden=true;error.hidden=false;error.textContent=copy('Photo unavailable. Use the arrows to continue.');});
    close.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();event.stopPropagation();move(event.key==='ArrowLeft'?-1:1);}});
    stage.addEventListener('touchstart',event=>{gesture=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
    stage.addEventListener('touchmove',event=>{if(event.touches.length!==1)gesture=null;},{passive:true});
    stage.addEventListener('touchend',event=>{if(!gesture)return;const point=event.changedTouches[0],dx=point.clientX-gesture.x,dy=point.clientY-gesture.y;gesture=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)move(dx<0?1:-1);},{passive:true});
    stage.addEventListener('touchcancel',()=>gesture=null,{passive:true});
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
    dialog.addEventListener('close',()=>{const selected=photos[current];if(selected&&selected!==initial&&selected.dishId)window.app.openDishDetail(selected.dishId,selected.variantIndex);queueMicrotask(()=>{const target=selected!==initial?body.querySelector('.dish-photo-expand'):opener;if(target?.isConnected)target.focus({preventScroll:true});image.removeAttribute('src');});});
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
