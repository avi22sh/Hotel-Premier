/* Native dialog supplies focus containment and Escape-to-close. */
(() => {
  function init() {
    const cards=Array.from(document.querySelectorAll('.atmosphere-card'));
    if(!cards.length)return;
    const dialog=document.createElement('dialog');dialog.className='property-viewer';dialog.setAttribute('aria-label','Property Moments photo gallery');
    const image=document.createElement('img'),caption=document.createElement('p'),controls=document.createElement('div');
    image.width=1200;image.height=900;image.decoding='async';
    caption.setAttribute('aria-live','polite');controls.className='property-viewer-controls';
    let current=0,opener=null,start=null;
    function show(index){current=(index+cards.length)%cards.length;const source=cards[current].querySelector('img');image.src=source.currentSrc||source.src;image.alt=source.alt;caption.textContent=`${current+1} / ${cards.length} · ${cards[current].querySelector('.atmosphere-card-caption')?.textContent||source.alt}`;}
    function button(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);return b;}
    controls.append(button('← Previous',()=>show(current-1)),button('Next →',()=>show(current+1)),button('Close ×',()=>dialog.close()));
    dialog.append(image,caption,controls);document.body.append(dialog);
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
