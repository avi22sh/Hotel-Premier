(() => {
 'use strict';
 const panel=()=>document.getElementById('menu-tools-dialog');
 const text=value=>window.HotelGuestLanguage?.text?.(value,window.app?.currentLang||'en')||value;
 const make=(tag,value,cls)=>{const node=document.createElement(tag);if(value!==undefined)node.textContent=value;if(cls)node.className=cls;return node;};
 const close=()=>{panel()?.close();window.HotelOverlays?.sync();};
 function findMatches(app,query){
  const tokens=query.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);if(!tokens.length)return [];
  const matches=[];
  for(const dish of app?.getVisibleMenuItems?.()||[]){const choices=dish.variants?.length?dish.variants.map((value,index)=>({value,index})).filter(({value})=>!value.hidden):[{value:dish,index:null}];
   for(const {value,index}of choices){const haystack=[value.name,value.hindiName,value.marathiName,value.description,value.descriptionHi,value.descriptionMr,dish.name].filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase();if(!tokens.every(token=>haystack.includes(token)))continue;
    const lang=app.currentLang||'en';matches.push({dishId:dish.id,variantIndex:index,name:(lang==='hi'?value.hindiName:lang==='mr'?value.marathiName:value.name)||value.name,price:value.price===undefined?dish.price:value.price,category:app.getCategoryLocalizedName?.(dish.categoryId)||app.categories?.find(c=>c.id===dish.categoryId)?.name||''});
   }
  }
  return matches.sort((a,b)=>Number(!a.name.toLocaleLowerCase().startsWith(tokens.join(' ')))-Number(!b.name.toLocaleLowerCase().startsWith(tokens.join(' '))));
 }
 function sections(){const host=document.getElementById('menu-tools-sections');if(!host)return;host.replaceChildren();
  for(const [index,item]of (window.app?.getMenuCollections?.()||[]).entries()){const b=make('button',undefined,'menu-section-choice');b.type='button';b.append(make('span',String(index+1).padStart(2,'0'),'menu-section-number'),make('span',item.name));b.addEventListener('click',()=>section(item.id));if(window.app.collectionAnchor===item.id)b.setAttribute('aria-current','location');host.append(b);}
 }
 function section(id){close();window.app?.selectCategoryFromDrawer(id);}
 function updateMatches(){const input=document.getElementById('menu-search-input'),host=document.getElementById('menu-tools-matches'),list=document.getElementById('menu-tools-sections'),all=document.getElementById('menu-tools-results');if(!input||!host)return;
  const query=input.value.trim();host.replaceChildren();if(list)list.hidden=Boolean(query);if(all)all.hidden=!query;if(!query)return;
  const matches=findMatches(window.app,query);
  if(!matches.length)host.append(make('p',text('No quick matches. Try another word or view all results.'),'menu-match-empty'));
  for(const match of matches.slice(0,8)){const b=make('button',undefined,'menu-match-choice'),copy=make('span');b.type='button';copy.append(make('strong',match.name),make('small',match.category));b.append(copy,make('span',Number.isFinite(match.price)?'₹'+match.price:text('Price on request')));b.addEventListener('click',()=>{close();requestAnimationFrame(()=>window.app.openDishDetail(match.dishId,match.variantIndex));});host.append(b);}
 }
 function search(){const region=document.getElementById('menu-tools-search-panel'),button=document.getElementById('menu-search-toggle'),input=document.getElementById('menu-search-input');if(!region)return;region.hidden=!region.hidden;button?.setAttribute('aria-expanded',String(!region.hidden));
  if(!region.hidden){updateMatches();requestAnimationFrame(()=>input?.focus());}else if(input?.value){input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));updateMatches();}
 }
 const results=()=>{clearTimeout(window.app?._searchRenderTimer);window.app?.renderMenu();close();requestAnimationFrame(()=>{const target=document.getElementById('menu-items-grid');if(target)window.scrollTo({top:Math.max(0,target.getBoundingClientRect().top+scrollY-(document.querySelector('.app-header')?.getBoundingClientRect().height||0)-16),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});};
 window.HotelMenuTools={open(){sections();const p=panel();if(!p)return;const input=document.getElementById('menu-search-input'),region=document.getElementById('menu-tools-search-panel');if(region)region.hidden=!input?.value.trim();document.getElementById('menu-search-toggle')?.setAttribute('aria-expanded',String(!region?.hidden));updateMatches();if(!p.open)p.showModal();},close,results,section,search,findMatches,collections(){close();window.app?.toggleMenuSectionDrawer();},favorites(){window.app?.toggleFavoritesFilter();results();}};
 document.getElementById('menu-search-input')?.addEventListener('input',updateMatches);
 document.getElementById('menu-search-input')?.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();results();}});
 document.getElementById('clear-search-btn')?.addEventListener('click',()=>queueMicrotask(updateMatches));
 panel()?.addEventListener('click',event=>{if(event.target===panel()){const r=panel().getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
})();
