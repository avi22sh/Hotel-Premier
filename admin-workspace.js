// One focused editor for dishes, options and rooms. No private data is published.
(() => {
 'use strict';
 const roomFields=['name','hindiName','marathiName','description','descriptionHi','descriptionMr','bedType','areaSqFt','maxExtraBeds','features','tariff'];
 const textFields=['name','description','hindiName','marathiName','descriptionHi','descriptionMr'];
 const state={query:'',category:'all',status:'all',selected:null,limit:35};
 const editedRooms=new Set();
 const menuDrafts=new Map(),roomDrafts=new Map();
 let savingAll=null;
 const valuesOf=form=>Object.fromEntries([...form.elements].filter(e=>e.name).map(e=>[e.name,e.type==='checkbox'?e.checked:e.value]));
 function menuPatch(entry,values){
  const patch={};for(const key of textFields)patch[key]=String(values[key]??'').trim();
  patch.price=values.price===undefined?(entry.value.price??null):values.price===''?null:Number(values.price);
  if(values.categoryId)patch.categoryId=values.categoryId;
  const choices=['new-arrival','bestseller','chef-special','sweet'];
  patch.tags=[...(entry.value.tags||entry.child?.tags||[]).filter(tag=>!choices.includes(tag)),...choices.filter(tag=>values['tag-'+tag])];
  if(entry.value.portionOptions?.length){
   patch.portionOptions=entry.value.portionOptions.map((option,i)=>{const name=String(values['portion-name-'+i]??option.name).trim(),value=values['portion-price-'+i],price=value===undefined?option.price:value===''?null:Number(value);if(!name||price!==null&&(!Number.isFinite(price)||price<0))throw Error('Enter a valid serving name and price.');return {...option,name,price};});
   patch.price=(patch.portionOptions.find(option=>option.isDefault)||patch.portionOptions[0]).price;
  }
  patch.isSoldOut=values.visibility==='soldout';patch[entry.index===null?'notAvailable':'hidden']=values.visibility==='hidden';return patch;
 }
 async function saveMenuDraft(key,values){
  const entry=entries(window.app).find(e=>e.key===key);if(!entry)throw Error('This item changed. Search for it again before saving.');
  const patch=menuPatch(entry,values);await saveEntry(entry,patch);menuDrafts.delete(key);
  const fresh=entries(window.app).find(e=>e.dish.id===entry.dish.id&&e.index===entry.index);
  if(fresh&&state.selected===key)state.selected=fresh.key;
  return fresh;
 }
 async function saveRoomDraft(id,values){
  if(!allowed())throw Error('Unlock Admin to save.');
  const room=window.HOTEL_PREMIER_HOTEL_DATA.roomCategories.find(r=>r.id===id);if(!room)throw Error('Room not found.');
  const patch={};for(const key of ['name','description','bedType','hindiName','marathiName','descriptionHi','descriptionMr'])patch[key]=String(values[key]??'').trim();
  if(!patch.name)throw Error('Enter a room name.');for(const key of ['areaSqFt','maxExtraBeds'])patch[key]=Number(values[key]);
  patch.features=String(values.features||'').split('\n').map(s=>s.trim()).filter(Boolean);
  patch.tariff={single:{},double:{},extraBed:Number(values.extraBed)};for(const occupancy of ['single','double'])for(const plan of ['roomOnly','withBreakfast'])patch.tariff[occupancy][plan]=Number(values[occupancy+'-'+plan]);
  if([patch.areaSqFt,patch.maxExtraBeds,patch.tariff.extraBed,...Object.values(patch.tariff.single),...Object.values(patch.tariff.double)].some(n=>!Number.isFinite(n)||n<0))throw Error('Use valid room sizes and prices.');
  window.HotelDataValidation.validate(patch);const saved=JSON.parse(localStorage.getItem('hotel_premier_room_overrides')||'{}');saved[id]={...saved[id],...patch,updatedAt:Date.now()};localStorage.setItem('hotel_premier_room_overrides',JSON.stringify(saved));
  Object.assign(room,patch);editedRooms.add(id);roomDrafts.delete(id);window.app.notifyMenuUpdate?.('rooms');await window.app.renderRoomCarousels();
 }
 async function saveAll({notify=true}={}){
  if(savingAll)return savingAll;
  savingAll=(async()=>{
   if(!allowed())throw Error('Unlock Admin to save.');
   if(window.admin.photoUploadPending||window.admin.savingDishPhoto||window.admin.savingRoomPhoto)throw Error('Wait for the selected photo to finish processing or saving, then save again.');
   // Snapshot all changed editors, including drafts retained while switching items/tabs.
   for(const [key,values]of [...menuDrafts])await saveMenuDraft(key,values);
   for(const [id,values]of [...roomDrafts])await saveRoomDraft(id,values);
   await window.HotelContentStudio?.savePending?.();
   const modal=document.getElementById('image-replace-modal');
   if(modal?.classList.contains('active')){
    const admin=window.admin;
    if(admin.activeImageDishId){if(!await admin.saveReplacedImage())throw Error('Photo was not saved. Keep the editor open and try again.');}
    else if(admin.activeRoomId){if(Number.isInteger(admin.activeRoomPhotoIndex))await admin.saveReplacedRoomPhoto();else await admin.saveNewRoomPhoto();}
    else if(admin.editingSlideContext)await admin.saveEditedSlide();
    if(modal.classList.contains('active'))throw Error('Finish the open photo editor before publishing.');
   }
   refreshPhotos();renderList();const selected=entries(window.app).find(e=>e.key===state.selected);if(selected&&detail?.isConnected)openEntry(selected);
   for(const message of document.querySelectorAll('.workspace-save-status'))message.textContent='All changes saved on this device. Publish to update guests.';
   if(notify)window.app.showToast('All changes saved on this device. Publish to update guests.','success');
  })();try{return await savingAll;}finally{savingAll=null;}
 }
 let host,detail,list,status;
 const allowed=()=>Boolean(window.admin?.isAuthenticated&&window.HotelLocalLock?.isUnlocked());
 const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 const button=(text,run,cls='studio-button')=>{const e=node('button',text,cls);e.type='button';e.addEventListener('click',async()=>{try{if(!allowed())throw Error('Unlock Admin to edit.');await run();}catch(err){window.app.showToast(err.message,'error');}});return e;};
 function field(form,label,key,value,type='text'){
  const wrap=node('label',label,'studio-field'),input=node(type==='textarea'?'textarea':type==='select'?'select':'input');
  input.name=key;input.value=value??'';if(input.tagName==='INPUT')input.type=type;
  if(type==='number'){input.min='0';input.step='any';}if(type==='textarea')input.rows=3;
  input.setAttribute('aria-label',label);wrap.append(input);form.append(wrap);return input;
 }
 function entries(app){
  const result=[],represented=new Set();
  for(const dish of app.menuData){
   if(dish.groupedUnder)continue;
   result.push({key:dish.id,dish,value:dish,index:null});
   for(const [index,v]of(dish.variants||[]).entries()){
    const child=app.menuData.find(c=>c.groupedUnder===dish.id&&(v.id?c.id===v.id:c.name===v.name));
    if(child)represented.add(child.id);
    result.push({key:dish.id+'::'+(v.id||child?.id||v.name),dish,value:v,index,child});
   }
  }
  for(const dish of app.menuData)if(dish.groupedUnder&&!represented.has(dish.id))result.push({key:dish.id,dish,value:dish,index:null,unlisted:true});
  return result;
 }
 function matches(entry,query=state.query,category=state.category,visibility=state.status){
  const {dish,value}=entry,hidden=Boolean(dish.notAvailable||value.hidden||entry.unlisted);
  const haystack=[value.id,...textFields.map(k=>value[k]),dish.name,dish.categoryId].join(' ').toLocaleLowerCase();
  return (!query||haystack.includes(query.toLocaleLowerCase().trim()))&&(category==='all'||dish.categoryId===category)&&(visibility==='all'||(visibility==='hidden'?hidden:!hidden));
 }
 function photo(entry){return entry.value.image!==undefined?entry.value.image:entry.dish.image;}
 function image(entry){const e=node('img');e.src=photo(entry)||'assets/brand-placeholder.svg';e.alt=entry.value.name||'';e.loading='lazy';e.dataset.workspaceKey=entry.key;return e;}
 async function saveEntry(entry,patch){
  if(!allowed())throw Error('Unlock Admin to edit.');window.HotelDataValidation?.validate(patch);
  entry=entries(window.app).find(e=>e.key===entry.key);if(!entry)throw Error('This item changed. Search for it again before saving.');
  if(!patch.name?.trim())throw Error('Enter an item name.');
  if(patch.price!==null&&(!Number.isFinite(patch.price)||patch.price<0))throw Error('Enter a valid price or leave it blank.');
  const changes={};
  if(entry.index!==null){
   changes[entry.dish.id]={variants:entry.dish.variants.map((v,i)=>i===entry.index?{...v,...patch}:v)};
   if(entry.child)changes[entry.child.id]={...patch,notAvailable:Boolean(patch.hidden)};
  }else{
   changes[entry.dish.id]=patch;
   if(patch.categoryId)for(const child of window.app.menuData.filter(d=>d.groupedUnder===entry.dish.id))changes[child.id]={categoryId:patch.categoryId};
   if(entry.dish.groupedUnder){
    const parent=window.app.menuData.find(d=>d.id===entry.dish.groupedUnder);
    if(parent?.variants?.some(v=>v.id?v.id===entry.dish.id:v.name===entry.dish.name))changes[parent.id]={variants:parent.variants.map(v=>(v.id?v.id===entry.dish.id:v.name===entry.dish.name)?{...v,...patch,hidden:patch.notAvailable}:v)};
    else if(parent&&patch.notAvailable===false)changes[parent.id]={variants:[...(parent.variants||[]),{id:entry.dish.id,image:entry.dish.image,...patch,hidden:false}]};
   }
  }
  await window.HOTEL_STORAGE.saveDishEdits(changes);
  for(const [id,p]of Object.entries(changes))Object.assign(window.app.menuData.find(d=>d.id===id),p);
  window.app.saveMenuData();window.app.renderMenu();window.app.renderCategoryCards();
  window.dispatchEvent(new CustomEvent('hp-content-saved'));
 }
 async function saveOptions(parent,variants,childPatch=null){
  if(!allowed())throw Error('Unlock Admin to edit.');const changes={[parent.id]:{variants}};
  if(childPatch)changes[childPatch.id]={notAvailable:true};
  await window.HOTEL_STORAGE.saveDishEdits(changes);parent.variants=variants;
  if(childPatch)childPatch.notAvailable=true;window.app.saveMenuData();window.app.renderMenu();renderList();
 }
 function refreshPhotos(){
  if(!host?.isConnected)return;
  const all=entries(window.app);for(const img of host.querySelectorAll('img[data-workspace-key]')){const entry=all.find(e=>e.key===img.dataset.workspaceKey);if(entry)img.src=photo(entry)||'assets/brand-placeholder.svg';}
 }
 function renderList(){
  if(!list?.isConnected||!allowed())return;
  list.replaceChildren();const all=entries(window.app),filtered=all.filter(e=>matches(e)).sort((a,b)=>window.app.categories.findIndex(c=>c.id===a.dish.categoryId)-window.app.categories.findIndex(c=>c.id===b.dish.categoryId));
  const browsing=!state.query&&state.status==='all';
  const shown=(browsing?filtered.filter(e=>e.index===null&&!e.unlisted):filtered).slice(0,state.limit);
  status.textContent=`${browsing?filtered.filter(e=>e.index===null&&!e.unlisted).length:filtered.length} results · includes options and hidden items in search`;
  let category;
  for(const entry of shown){
   if(entry.dish.categoryId!==category){category=entry.dish.categoryId;list.append(node('h3',window.app.categories.find(c=>c.id===category)?.name||category,'workspace-section-title'));}
   const row=button('',()=>openEntry(entry),'workspace-result');row.append(image(entry));
   const copy=node('span'),name=node('strong',entry.value.name),meta=node('small',entry.index!==null?`Option in ${entry.dish.name}`:entry.unlisted?'Hidden source item':entry.dish.variants?.length?`${entry.dish.variants.length} options`:'Individual item');
   copy.append(name,meta);row.append(copy);row.setAttribute('aria-label',`Edit ${entry.value.name}${entry.index!==null?' option':''}`);row.setAttribute('aria-pressed',String(state.selected===entry.key));list.append(row);
  }
  const total=browsing?filtered.filter(e=>e.index===null&&!e.unlisted).length:filtered.length;
  if(shown.length<total)list.append(button('Show more',()=>{state.limit+=35;renderList();}));
  if(!shown.length)list.append(node('p','No matches. Choose All sections and All items to include hidden records.'));
 }
 function openEntry(entry){
  state.selected=entry.key;detail.replaceChildren();detail.hidden=false;renderList();
  const form=node('form',undefined,'workspace-edit-form'),head=node('div',undefined,'workspace-editor-head');
  head.append(image(entry),node('h3',entry.value.name));detail.append(head);
  if(entry.index!==null){detail.prepend(button('← '+entry.dish.name,()=>openEntry(entries(window.app).find(e=>e.key===entry.dish.id))));if(entry.dish.notAvailable)detail.append(node('p','The parent item is hidden. Make it visible from the parent editor to show this option to guests.'));}
  const actions=node('div',undefined,'workspace-actions');
  actions.append(button('Replace photo',()=>window.admin.openImageModal(entry.dish.id,entry.index)),button('Remove photo',async()=>{
   if(!await window.HotelDialogs.confirm('Remove this photo? The item will remain editable.'))return;
   const value={...Object.fromEntries(textFields.map(k=>[k,entry.value[k]||''])),price:entry.value.price??null,image:''};await saveEntry(entry,value);entry.value.image='';refreshPhotos();
  }));detail.append(actions,form);
  field(form,'Item name','name',entry.value.name);if(!entry.value.portionOptions?.length)field(form,'Price · ₹ (blank = on request)','price',entry.value.price,'number');field(form,'Description','description',entry.value.description,'textarea');
  if(entry.value.portionOptions?.length){const sizes=node('details',undefined,'workspace-serving-sizes');sizes.open=true;sizes.append(node('summary','Serving sizes & prices'),node('p','Menu uses the default serving price. Blank prices show “Price on request”.'));for(const [i,option]of entry.value.portionOptions.entries()){const row=node('div',undefined,'workspace-serving-row');field(row,'Serving '+(i+1),'portion-name-'+i,option.name);field(row,'Price · ₹','portion-price-'+i,option.price,'number');sizes.append(row);}form.append(sizes);}
  let section;if(entry.index===null&&!entry.dish.groupedUnder){section=field(form,'Menu section','categoryId','','select');for(const c of window.app.categories){const o=node('option',c.name);o.value=c.id;section.append(o);}section.value=entry.dish.categoryId;}
  const translations=node('details');translations.append(node('summary','Hindi & Marathi'));
  for(const [key,label]of [['hindiName','Name · Hindi'],['descriptionHi','Description · Hindi'],['marathiName','Name · Marathi'],['descriptionMr','Description · Marathi']])field(translations,label,key,entry.value[key],key.startsWith('description')?'textarea':'text');form.append(translations);
  const visibility=field(form,'Guest visibility','visibility','','select');for(const [value,label]of [['visible','Visible'],['soldout','Sold out'],['hidden','Hidden']]){const o=node('option',label);o.value=value;visibility.append(o);}visibility.value=entry.unlisted||entry.value.hidden||entry.dish.notAvailable?'hidden':entry.value.isSoldOut||entry.dish.isSoldOut?'soldout':'visible';
  if(entry.unlisted)form.append(node('p','This source item is not listed in its parent options. Choose Visible and save to restore it.'));
  const tagChoices=[['new-arrival','Fresh to the Menu'],['bestseller','Bestseller'],['chef-special','Chef special'],['sweet','Sweet']];const labels=node('fieldset',undefined,'workspace-labels');labels.append(node('legend','Menu labels'));for(const [tag,title]of tagChoices){const label=node('label',title),input=node('input');input.type='checkbox';input.name='tag-'+tag;input.checked=(entry.value.tags||entry.child?.tags||[]).includes(tag);label.prepend(input);labels.append(label);}form.append(labels);
  const message=node('p','Save on this device, then Publish to update all guests.','workspace-save-status');message.setAttribute('role','status');
  const save=node('button','Save changes','btn-primary');save.type='submit';form.append(save,message);
  for(const input of form.elements)if(menuDrafts.get(entry.key)?.[input.name]!==undefined){if(input.type==='checkbox')input.checked=menuDrafts.get(entry.key)[input.name];else input.value=menuDrafts.get(entry.key)[input.name];}
  form.addEventListener('input',()=>{menuDrafts.set(entry.key,valuesOf(form));message.textContent='Unsaved edits · choose Save changes or Save all.';});
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(save.disabled)return;save.disabled=true;
   try{const fresh=await saveMenuDraft(entry.key,valuesOf(form));if(fresh)openEntry(fresh);detail.querySelector('.workspace-save-status').textContent='Saved on this device. Publish when ready.';}catch(err){message.textContent='Not saved: '+err.message;}finally{save.disabled=false;}
  });
  if(entry.index===null&&!entry.dish.groupedUnder){
   const options=node('section',undefined,'workspace-options');options.append(node('h4','Options · select to edit everything'));
   for(const option of entries(window.app).filter(e=>e.dish.id===entry.dish.id&&e.index!==null)){const row=node('div'),b=button(option.value.name,()=>openEntry(option),'workspace-option');b.prepend(image(option));row.append(b);const actions=node('div',undefined,'workspace-actions');for(const [label,delta]of [['Move up',-1],['Move down',1]]){const move=button(label,async()=>{const copy=[...entry.dish.variants],index=option.index,next=index+delta;if(next<0||next>=copy.length)return;[copy[index],copy[next]]=[copy[next],copy[index]];await saveOptions(entry.dish,copy);openEntry(entries(window.app).find(e=>e.key===entry.dish.id));});move.disabled=option.index+delta<0||option.index+delta>=entry.dish.variants.length;actions.append(move);}actions.append(button('Remove option',async()=>{if(!await window.HotelDialogs.confirm('Remove this option from the guest menu? Its source item stays searchable in Admin.'))return;await saveOptions(entry.dish,entry.dish.variants.filter((_,i)=>i!==option.index),option.child);openEntry(entries(window.app).find(e=>e.key===entry.dish.id));}));row.append(actions);options.append(row);}
   options.append(button('Add option',async()=>{const name=await window.HotelDialogs.prompt('Name for the new option');if(!name?.trim())return;await saveOptions(entry.dish,[...(entry.dish.variants||[]),{id:'option-'+crypto.randomUUID(),name:name.trim(),price:null,image:'',description:''}]);openEntry(entries(window.app).find(e=>e.dish.id===entry.dish.id&&e.index===entry.dish.variants.length-1));}));
   detail.append(options);
  }
  if(innerWidth<800)detail.scrollIntoView({behavior:'smooth',block:'start'});
 }
 function renderMenu(container){
  if(!allowed())return;host=container;state.limit=35;container.replaceChildren();container.classList.add('workspace-host');
  const title=node('div',undefined,'workspace-heading');title.append(node('h2','Menu studio'),node('p','Find a dish or option. Edit its photo, details and price together.'));
  const actions=node('div',undefined,'workspace-actions');actions.append(button('Add item',()=>window.admin.openAddDishModal(),'btn-primary'));container.append(title,actions);
  const management=node('details');management.append(node('summary','Sections & display order'));const managementHost=node('div');management.addEventListener('toggle',()=>{if(management.open&&!managementHost.children.length)window.HotelMenuStructure.render(managementHost);});management.append(managementHost);container.append(management);
  const filters=node('div',undefined,'workspace-filters');const search=field(filters,'Search every item and option','workspace-search',state.query,'search');search.id='admin-search-dish';search.placeholder='Name, option, description or item ID';
  const category=field(filters,'Section','workspace-category','','select');for(const c of [{id:'all',name:'All sections'},...window.app.categories]){const o=node('option',c.name);o.value=c.id;category.append(o);}category.value=state.category;
  const visible=field(filters,'Status','workspace-status','','select');for(const [value,label]of [['all','All items · including hidden'],['visible','Visible'],['hidden','Hidden']]){const o=node('option',label);o.value=value;visible.append(o);}visible.value=state.status;
  search.addEventListener('input',()=>{state.query=search.value;state.limit=35;state.category='all';state.status='all';category.value='all';visible.value='all';renderList();});category.addEventListener('change',()=>{state.category=category.value;renderList();});visible.addEventListener('change',()=>{state.status=visible.value;renderList();});
  status=node('p',undefined,'workspace-status');status.setAttribute('role','status');const layout=node('div',undefined,'workspace-layout');list=node('div',undefined,'workspace-list');detail=node('section',undefined,'workspace-editor');detail.append(node('p','Select an item or option to edit.'));layout.append(list,detail);container.append(filters,status,layout);renderList();
  if(state.selected){const selected=entries(window.app).find(e=>e.key===state.selected);if(selected)openEntry(selected);}
 }
 function roomPatch(room){return Object.fromEntries(roomFields.filter(k=>room[k]!==undefined).map(k=>[k,room[k]]));}
 function applyRooms(){
  let local={};try{local=JSON.parse(localStorage.getItem('hotel_premier_room_overrides')||'{}');}catch(_){}
  const published=window.HOTEL_PREMIER_PUBLISHED_OVERRIDES;
  for(const room of window.HOTEL_PREMIER_HOTEL_DATA?.roomCategories||[]){
   const remote=published?.roomDetails?.[room.id];if(remote){Object.assign(room,roomPatch(remote));editedRooms.add(room.id);}
   if(local[room.id]&&(!remote||Number(local[room.id].updatedAt)>Number(published.publishedAt))){Object.assign(room,roomPatch(local[room.id]));editedRooms.add(room.id);}
  }
 }
 function syncRoomViews(){
  if(!editedRooms.size)return;const rooms=window.HOTEL_PREMIER_HOTEL_DATA.roomCategories,lang=window.app?.currentLang||'en';
  const money=n=>'₹'+Number(n).toLocaleString('en-IN');
  for(const room of rooms){if(!editedRooms.has(room.id))continue;const card=document.getElementById('room-card-'+room.id);if(card){
   const title=card.querySelector('.room-suite-title'),desc=card.querySelector('.room-editorial-desc'),price=card.querySelector('.tariff-val');if(title)title.textContent=(lang==='hi'?room.hindiName:lang==='mr'?room.marathiName:room.name)||room.name;if(desc)desc.textContent=(lang==='hi'?room.descriptionHi:lang==='mr'?room.descriptionMr:room.description)||room.description;if(price)price.textContent=money(room.tariff.single.roomOnly);
   const amenities=card.querySelector('.room-amenity-curation');if(amenities){amenities.replaceChildren();for(const feature of room.features||[])amenities.append(node('span',feature,'room-amenity-tag'));}
   const rates=card.querySelectorAll('.rate-prices');for(const [i,occupancy]of ['single','double'].entries())if(rates[i]){rates[i].replaceChildren(node('strong',money(room.tariff[occupancy].roomOnly)),document.createTextNode(' (Room Only) / '),node('strong',money(room.tariff[occupancy].withBreakfast)),document.createTextNode(' (CP)'));}const extra=rates[2]?.querySelector('strong');if(extra)extra.textContent=money(room.tariff.extraBed);
  }
  for(const option of document.querySelectorAll(`option[value="${room.id}"]`))option.textContent=room.name;
  }
  const legacy=document.querySelector('#section-tariffs .tariff-suites-grid');if(!legacy)return;legacy.hidden=true;
  let tariffs=document.getElementById('owner-room-tariffs');if(!tariffs){tariffs=node('div',undefined,'tariff-suites-grid');tariffs.id='owner-room-tariffs';legacy.after(tariffs);}tariffs.replaceChildren();
  for(const room of rooms){const card=node('article',undefined,'tariff-suite-card'),header=node('div',undefined,'tariff-suite-header');header.append(node('h3',room.name,'tariff-suite-name'),node('p',`${room.areaSqFt} sq.ft · ${room.bedType}`));card.append(header);const plans=node('div',undefined,'tariff-pricing-breakdown');for(const [key,title]of [['roomOnly','Room only'],['withBreakfast','With breakfast · fixed menu']]){const plan=node('div',undefined,'tariff-plan-box');plan.append(node('h4',title,key==='withBreakfast'?'plan-badge-label gold-badge':'plan-badge-label'),node('p',`Single ${money(room.tariff.single[key])} · Double ${money(room.tariff.double[key])}`));if(key==='withBreakfast')plan.append(node('small','Terms & conditions apply. Speak to our staff for details.'));plans.append(plan);}card.append(plans,button('Enquire about '+room.name,()=>window.app.openConciergeBookingModal(room.id),'btn-primary'));
   // Guest enquiry actions do not require an Admin session.
   const enquiry=card.querySelector('button');enquiry.replaceWith(Object.assign(node('button','Enquire about '+room.name,'btn-primary'),{type:'button',onclick:()=>window.app.openConciergeBookingModal(room.id)}));tariffs.append(card);}
 }
 async function renderRooms(container){
  const opened=new Set([...container.querySelectorAll('details.workspace-room[open]')].map(e=>e.dataset.roomId));
  const admin=window.admin,token=admin.beginAdminRender('rooms',container,'Loading rooms…');if(!token)return;
  const galleries=await Promise.all(window.HOTEL_PREMIER_HOTEL_DATA.roomCategories.map(async r=>[r,await window.HOTEL_STORAGE.getRoomGallery(r.id,r.images||[r.image])])).catch(()=>{if(admin.canRenderAdmin(token))admin.showAdminRenderStatus(token,'Rooms could not be loaded. Your saved details are unchanged.',true);return null;});if(!galleries||!admin.canRenderAdmin(token))return;
  container.replaceChildren();container.classList.add('workspace-host');container.append(node('h2','Room studio'),node('p','Room details, tariffs and gallery controls together. Save locally, then Publish.'));
  for(const [room,gallery]of galleries){
   const card=node('details',undefined,'workspace-room');card.dataset.roomId=room.id;card.open=opened.has(room.id);card.append(node('summary',room.name));
   const photos=node('div',undefined,'workspace-room-photos');for(const [index,src]of gallery.entries()){const tile=node('div');const img=node('img');img.src=src;img.alt=`${room.name} · photo ${index+1}`;img.loading='lazy';tile.append(img,node('small',index===0?'Cover photo':`Photo ${index+1}`));const controls=node('div',undefined,'workspace-actions');controls.append(button('Replace',()=>admin.openReplaceRoomPhotoModal(room.id,index)),button('Remove',()=>admin.removeRoomPhoto(room.id,index)));if(index>0)controls.append(button('←',()=>admin.moveRoomPhoto(room.id,index,-1)),button('Make cover',()=>admin.setRoomCoverPhoto(room.id,index)));if(index<gallery.length-1)controls.append(button('→',()=>admin.moveRoomPhoto(room.id,index,1)));tile.append(controls);photos.append(tile);}card.append(photos,button('Add room photo',()=>admin.openAddRoomPhotoModal(room.id)));
   const galleryDetails=node('details',undefined,'workspace-gallery-drawer');galleryDetails.append(node('summary',`Manage ${gallery.length} room photos`));const cover=node('img',undefined,'workspace-room-cover');cover.src=gallery[0]||room.image;cover.alt=room.name+' cover';card.insertBefore(cover,photos);card.insertBefore(galleryDetails,photos);galleryDetails.append(photos);
   const form=node('form',undefined,'workspace-room-form');field(form,'Room name','name',room.name);field(form,'Description','description',room.description,'textarea');field(form,'Bed type','bedType',room.bedType);field(form,'Area · sq ft','areaSqFt',room.areaSqFt,'number');field(form,'Maximum extra beds','maxExtraBeds',room.maxExtraBeds,'number');field(form,'Amenities · one per line','features',(room.features||[]).join('\n'),'textarea');
   for(const [key,label]of [['hindiName','Name · Hindi'],['marathiName','Name · Marathi'],['descriptionHi','Description · Hindi'],['descriptionMr','Description · Marathi']])field(form,label,key,room[key],key.startsWith('description')?'textarea':'text');
   for(const occupancy of ['single','double'])for(const plan of ['roomOnly','withBreakfast'])field(form,`${occupancy==='single'?'Single':'Double'} · ${plan==='roomOnly'?'Room only':'Breakfast'} · ₹`,occupancy+'-'+plan,room.tariff[occupancy][plan],'number');field(form,'Extra bed · ₹','extraBed',room.tariff.extraBed,'number');
   const save=node('button','Save room details','btn-primary');save.type='submit';const message=node('p',undefined,'workspace-save-status');message.setAttribute('role','status');form.append(save,message);card.append(form);container.append(card);
   for(const input of form.elements)if(roomDrafts.get(room.id)?.[input.name]!==undefined)input.value=roomDrafts.get(room.id)[input.name];
   form.addEventListener('input',()=>{roomDrafts.set(room.id,valuesOf(form));message.textContent='Unsaved edits · choose Save room details or Save all.';});
   form.addEventListener('submit',async e=>{e.preventDefault();if(!allowed()||save.disabled)return;save.disabled=true;try{
    await saveRoomDraft(room.id,valuesOf(form));card.querySelector('summary').textContent=room.name;message.textContent='Saved on this device. Publish to update guests.';
   }catch(err){message.textContent='Not saved: '+err.message;}finally{save.disabled=false;}});
  }
 }
 function publicRooms(){return Object.fromEntries((window.HOTEL_PREMIER_HOTEL_DATA?.roomCategories||[]).filter(room=>editedRooms.has(room.id)).map(room=>[room.id,roomPatch(room)]));}
 window.HotelAdminWorkspace={renderMenu,renderRooms,saveAll,refresh:refreshPhotos,entries,matches,saveEntry,applyRooms,roomPatch,syncRoomViews,publicRooms};
 applyRooms();window.addEventListener('hp-media-updated',refreshPhotos);
})();
