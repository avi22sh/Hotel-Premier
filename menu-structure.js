/* Browser-local menu structure drafts. Export for review and public deployment. */
(() => {
  'use strict';
  const KEY='hp_menu_structure_v1';
  let draft={version:1,categories:null,subcategories:null,items:{},order:[]};
  const clone=value=>JSON.parse(JSON.stringify(value));
  function validate(value) {
    const safeText=(text,attribute=false)=>typeof text==='string' && text.length<=5000 && !/[<>]/.test(text) && (!attribute || !/"/.test(text));
    if (!value || value.version!==1 || !Array.isArray(value.categories) || !value.subcategories || !value.items || Array.isArray(value.items) || !Array.isArray(value.order)) throw Error('Invalid menu layout file.');
    const ids=new Set();
    for (const category of value.categories) {
      if (!/^[a-z0-9-]+$/.test(category.id) || ids.has(category.id) || !safeText(category.name,true) || !category.name.trim()) throw Error('Invalid or duplicate section.');
      if(category.description!==undefined&&!safeText(category.description))throw Error('Use plain text for section descriptions.');
      ids.add(category.id);
      const subs=value.subcategories[category.id] || [];
      const subIds=new Set();
      for (const sub of subs) {
        if (!/^[a-z0-9-]+$/.test(sub.id) || subIds.has(sub.id) || !safeText(sub.name,true) || !sub.name.trim() || (sub.dishIds && !Array.isArray(sub.dishIds))) throw Error('Invalid sub-section.');
        subIds.add(sub.id);
      }
    }
    for(const [id,item] of Object.entries(value.items)) {
      if (!/^[a-z0-9-]+$/.test(id) || !item || typeof item!=='object') throw Error('Invalid item.');
      if (item.name!==undefined && (typeof item.name!=='string' || !item.name.trim())) throw Error('Item name is required.');
      if (item.name!==undefined && !safeText(item.name,true)) throw Error('Use plain text for item names.');
      if (item.description!==undefined && !safeText(item.description)) throw Error('Use plain text for descriptions.');
      if (item.categoryId!==undefined && !ids.has(item.categoryId)) throw Error('Choose a valid section.');
      if (item.price!==undefined && item.price!==null && (!Number.isFinite(item.price) || item.price<0)) throw Error('Invalid price.');
      if (item.variants && (!Array.isArray(item.variants) || item.variants.some(v=>!safeText(v.name,true) || !v.name.trim() || (v.description!==undefined&&!safeText(v.description)) || (v.image && ((!safeText(v.image,true)&&!/^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(v.image))||!/^(assets\/|https:\/\/|data:image\/(?:png|jpeg|webp);base64,)/.test(v.image))) || (v.price!==null && v.price!==undefined && (!Number.isFinite(v.price) || v.price<0))))) throw Error('Invalid item option.');
      if (item.image && !safeText(item.image,true) && !/^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(item.image)) throw Error('Invalid image path.');
      if (item.image && !/^(assets\/|https:\/\/|data:image\/(?:png|jpeg|webp);base64,)/.test(item.image)) throw Error('Use a local asset path or HTTPS image.');
    }
    return clone(value);
  }
  try { const saved=localStorage.getItem(KEY); if(saved) draft=validate(JSON.parse(saved)); } catch(error){console.warn('Menu layout not loaded:',error.message);}
  function apply(app) {
    try { const saved=localStorage.getItem(KEY);if(saved)draft=validate(JSON.parse(saved)); } catch(error){console.warn('Menu layout refresh failed:',error.message);}
    applyLayout(app,draft);
  }
  function applyPublished(app) {
    const layout=window.HOTEL_PREMIER_PUBLISHED_OVERRIDES?.layout;
    if(layout)applyLayout(app,validate(layout));
  }
  function applyLayout(app,layout) {
    if (layout.categories) {
      app.categories=clone(layout.categories);
      window.HOTEL_PREMIER_CATEGORIES=clone(layout.categories);
      window.HOTEL_PREMIER_SUB_CATEGORIES=clone(layout.subcategories);
    }
    const map=new Map(app.menuData.map(d=>[d.id,d]));
    for(const [id,patch] of Object.entries(layout.items)) {
      if(['undefined','null'].includes(id))continue; // Keep malformed legacy records in the backup, outside the guest menu.
      if(patch._deleted){map.delete(id);continue;}
      const existing=map.get(id)||{};
      const merged={...existing,...clone(patch),id};
      if(patch.variants)merged.variants=patch.variants.map(v=>({...existing.variants?.find(old=>v.id?old.id===v.id:old.name===v.name),...v}));
      map.set(id,merged);
    }
    app.menuData=[...layout.order.filter(id=>map.has(id)).map(id=>{const d=map.get(id);map.delete(id);return d;}),...map.values()];
  }
  function snapshot(app) {
    return {...clone(draft),categories:clone(app.categories),subcategories:clone(window.HOTEL_PREMIER_SUB_CATEGORIES || {}),order:app.menuData.map(d=>d.id)};
  }
  function commit(next,app) {
    if(!window.admin?.isAuthenticated) throw Error('Sign in to Admin Studio first.');
    next=validate(next);
    localStorage.setItem(KEY,JSON.stringify(next)); // No visible changes if storage fails.
    draft=next; apply(app);
    app.activeSubCategories={}; app.currentCategory='all';
    app.renderMenu(); app.renderMenuSectionDrawer(); app.notifyMenuUpdate();
  }
  function capture(app) {
    if(!window.admin?.isAuthenticated)return;
    const next=snapshot(app), live=new Map(app.menuData.map(d=>[d.id,d]));
    for(const [id,patch] of Object.entries(next.items)) {
      const dish=live.get(id);if(!dish)continue;
      for(const key of Object.keys(patch))if(key!=='_deleted' && dish[key]!==undefined){const value=window.HotelPhotoStorage?window.HotelPhotoStorage.compact(dish[key]):clone(dish[key]);if(value===undefined)delete patch[key];else patch[key]=value;}
    }
    const originals=new Set((window.HOTEL_PREMIER_INITIAL_MENU || []).map(d=>d.id));
    for(const id of originals)if(!live.has(id))next.items[id]={_deleted:true};
    for(const dish of app.menuData)if(!originals.has(dish.id))next.items[dish.id]={...next.items[dish.id],...(window.HotelPhotoStorage?window.HotelPhotoStorage.compact(dish):clone(dish))};
    const checked=validate(next);localStorage.setItem(KEY,JSON.stringify(checked));draft=checked;
  }
  const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  function render(host) {
    if(!window.admin?.isAuthenticated)return;
    const openKeys=new Set([...(host.querySelectorAll?.('details[open][data-menu-key]') || [])].map(n=>n.dataset.menuKey));
    const scrollHost=host.closest?.('#admin-tab-content');
    const previousScrollTop=scrollHost?.scrollTop;
    const preserve=(element,key)=>{element.dataset ||= {};element.dataset.menuKey=key;if(openKeys.has(key))element.open=true;return element;};
    host.replaceChildren();host.className='menu-structure-studio';
    const app=window.app;
    const status=node('p','Changes save in this browser. Export the layout for developer review and publishing to all guests. No guest data is exported.');status.setAttribute('role','status');
    const run=async fn=>{try{await fn();}catch(error){status.textContent=`Not saved: ${error.message}`;}};
    const button=(text,fn)=>{const b=node('button',text);b.type='button';b.className='studio-button';b.addEventListener('click',()=>run(fn));return b;};
    const field=(label,value,tag='input')=>{const wrap=node('label'),input=node(tag);input.value=value??'';wrap.append(node('span',label),input);return {wrap,input};};
    const select=(label,options,value)=>{const f=field(label,'','select');for(const o of options){const option=node('option',o.name);option.value=o.id;f.input.append(option);}f.input.value=value;return f;};
    const save=next=>{commit(next,app);render(host);app.showToast('Menu changes saved in this browser. Export to publish.', 'success');};
    const editSection=(category)=>{
      const box=node('details');box.append(node('summary',category.name));
      const name=field('Section name',category.name),description=field('Section description',category.description,'textarea');box.append(name.wrap,description.wrap);
      box.append(button('Save section',async () => {const next=snapshot(app);Object.assign(next.categories.find(c=>c.id===category.id),{name:name.input.value.trim(),description:description.input.value});save(next);}));
      for(const [label,delta] of [['↑ Section',-1],['↓ Section',1]])box.append(button(label,async () => {const next=snapshot(app),i=next.categories.findIndex(c=>c.id===category.id),j=i+delta;if(j<0||j>=next.categories.length)return;[next.categories[i],next.categories[j]]=[next.categories[j],next.categories[i]];save(next);}));
      box.append(button('Delete section',async () => {
        if(app.menuData.some(d=>d.categoryId===category.id))throw Error('Move or delete this section’s items first.');
        if(!await window.HotelDialogs.confirm(`Delete section “${category.name}”? Export a backup first.`))return;
        const next=snapshot(app);next.categories=next.categories.filter(c=>c.id!==category.id);delete next.subcategories[category.id];save(next);
      }));
      const subs=(window.HOTEL_PREMIER_SUB_CATEGORIES?.[category.id] || []);
      box.append(node('h4','Sub-sections'));
      for(const sub of subs.filter(s=>s.id!=='all')) {
        const row=preserve(node('details'),'sub:'+category.id+':'+sub.id);row.append(node('summary',sub.name));
        const title=field('Sub-section name',sub.name),target=select('Move to section',app.categories,category.id);row.append(title.wrap,target.wrap);
        row.append(button('Save / move sub-section',async () => {
          const next=snapshot(app),list=next.subcategories[category.id],saved={...list.find(s=>s.id===sub.id),name:title.input.value.trim()};
          if(target.input.value===category.id)Object.assign(list.find(s=>s.id===sub.id),saved);
          else {
            next.subcategories[category.id]=list.filter(s=>s.id!==sub.id);
            const dest=next.subcategories[target.input.value] ||= [{id:'all',name:'All items'}];
            if(dest.some(s=>s.id===sub.id))throw Error('Destination already has this sub-section.');
            dest.push(saved);
            const moved=new Set(saved.dishIds || []);
            for(const dish of app.menuData)if(moved.has(dish.id)||moved.has(dish.groupedUnder))next.items[dish.id]={...next.items[dish.id],categoryId:target.input.value};
            for(const sc of next.subcategories[category.id])if(sc.dishIds)sc.dishIds=sc.dishIds.filter(id=>!moved.has(id));
          }save(next);
        }));
        for(const [label,delta] of [['↑ Sub-section',-1],['↓ Sub-section',1]])row.append(button(label,async () => {const next=snapshot(app),list=next.subcategories[category.id],i=list.findIndex(s=>s.id===sub.id),j=i+delta;if(j<0||j>=list.length||list[j].id==='all')return;[list[i],list[j]]=[list[j],list[i]];save(next);}));
        row.append(button('Delete sub-section',async () => {if(!await window.HotelDialogs.confirm(`Delete “${sub.name}”? Its items remain in the main section.`))return;const next=snapshot(app);next.subcategories[category.id]=next.subcategories[category.id].filter(s=>s.id!==sub.id);save(next);}));box.append(row);
      }
      box.append(button('Add sub-section',async () => {const name=await window.HotelDialogs.prompt('Sub-section name');if(!name?.trim())return;const next=snapshot(app);(next.subcategories[category.id] ||= [{id:'all',name:'All items'}]).push({id:'sub-'+crypto.randomUUID(),name:name.trim(),dishIds:[]});save(next);}));
      const dishes=app.menuData.filter(d=>d.categoryId===category.id && !d.groupedUnder);
      box.append(node('h4','Items & individual options'));
      for(const dish of dishes){
        const row=preserve(node('details'),'item:'+dish.id);row.append(node('summary',dish.name));
        const name=field('Item name',dish.name),price=field('Price · blank means on request',dish.price),desc=field('Description',dish.description,'textarea'),image=field('Image asset path or HTTPS URL',dish.image),target=select('Section',app.categories,category.id);
        const sub=select('Sub-section',[{id:'',name:'All items / no sub-section'},...Object.entries(window.HOTEL_PREMIER_SUB_CATEGORIES||{}).flatMap(([cat,items])=>items.filter(s=>s.id!=='all').map(s=>({id:cat+'::'+s.id,name:(app.categories.find(c=>c.id===cat)?.name||cat)+' / '+s.name})))],category.id+'::'+(subs.find(s=>s.id!=='all'&&s.dishIds?.includes(dish.id))?.id||''));
        target.input.addEventListener('change',async () => {sub.input.value='';});
        row.append(name.wrap,price.wrap,desc.wrap,image.wrap,target.wrap,sub.wrap);
        const variants=clone(dish.variants || []),variantFields=[];
        for(const [i,v] of variants.entries()){
          const vbox=preserve(node('details'),'option:'+dish.id+':'+(v.id || v.name));vbox.append(node('summary',v.name));const vn=field('Option name',v.name),vp=field('Option price',v.price),vd=field('Option description',v.description,'textarea'),vi=field('Option image',v.image);vbox.append(vn.wrap,vp.wrap,vd.wrap,vi.wrap);variantFields.push({v,vn,vp,vd,vi});
          for(const [label,delta] of [['↑ Option',-1],['↓ Option',1]])vbox.append(button(label,async () => {const next=snapshot(app),copy=clone(dish.variants),j=i+delta;if(j<0||j>=copy.length)return;[copy[i],copy[j]]=[copy[j],copy[i]];next.items[dish.id]={...next.items[dish.id],variants:copy};save(next);}));
          vbox.append(button('Delete option',async () => {if(!await window.HotelDialogs.confirm(`Delete option “${v.name}”?`))return;const next=snapshot(app);next.items[dish.id]={...next.items[dish.id],variants:variants.filter((_,idx)=>idx!==i)};save(next);}));row.append(vbox);
        }
        row.append(button('Save item & options',async () => {
          const next=snapshot(app);let destination=target.input.value;
          if(sub.input.value)destination=sub.input.value.split('::')[0];
          const patch={name:name.input.value.trim(),price:price.input.value.trim()===''?null:Number(price.input.value),description:desc.input.value,image:image.input.value.trim(),categoryId:destination};
          if(variants.length)patch.variants=variantFields.map(({v,vn,vp,vd,vi})=>({...v,name:vn.input.value.trim(),price:vp.input.value.trim()===''?null:Number(vp.input.value),description:vd.input.value,image:vi.input.value.trim()}));
          next.items[dish.id]={...next.items[dish.id],...patch};
          const related=new Set([dish.id,...app.menuData.filter(d=>d.groupedUnder===dish.id).map(d=>d.id)]);
          for(const child of related)if(child!==dish.id)next.items[child]={...next.items[child],categoryId:destination};
          for(const list of Object.values(next.subcategories))for(const sc of list)if(sc.dishIds)sc.dishIds=sc.dishIds.filter(id=>!related.has(id));
          if(sub.input.value){const [cat,id]=sub.input.value.split('::');const sc=next.subcategories[cat].find(s=>s.id===id);(sc.dishIds ||= []).push(...related);}save(next);
        }));
        row.append(button('Add option',async () => {const name=await window.HotelDialogs.prompt('Option name');if(!name?.trim())return;const next=snapshot(app);next.items[dish.id]={...next.items[dish.id],variants:[...variants,{id:'opt-'+crypto.randomUUID(),name:name.trim(),price:null,image:'',description:''}]};save(next);}));
        for(const [label,delta] of [['↑ Item',-1],['↓ Item',1]])row.append(button(label,async () => {const next=snapshot(app),peers=dishes.map(d=>d.id),j=peers.indexOf(dish.id)+delta;if(j<0||j>=peers.length)return;const a=next.order.indexOf(dish.id),b=next.order.indexOf(peers[j]);[next.order[a],next.order[b]]=[next.order[b],next.order[a]];save(next);}));
        row.append(button('Delete item',async () => {if(!await window.HotelDialogs.confirm(`Delete “${dish.name}” and its options? Export a backup first.`))return;const next=snapshot(app);for(const d of app.menuData)if(d.id===dish.id||d.groupedUnder===dish.id)next.items[d.id]={_deleted:true};save(next);}));box.append(row);
      }
      box.append(button('Add item',async () => {const name=await window.HotelDialogs.prompt('Item name');if(!name?.trim())return;const next=snapshot(app),id='item-'+crypto.randomUUID();next.items[id]={id,name:name.trim(),categoryId:category.id,price:null,image:'',description:''};next.order.push(id);save(next);}));return box;
    };
    const details=preserve(node('details'),'menu-editor');details.append(node('summary','Manage sections, sub-sections & item sequence'),status);
    details.append(button('Export menu layout',async () => {const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot(app),null,2)],{type:'application/json'}));const a=node('a');a.href=url;a.download='hotel-premier-menu-layout.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}));
    const input=node('input');input.type='file';input.accept='.json,application/json';input.setAttribute('aria-label','Import menu layout');input.addEventListener('change',async () => {try{const f=input.files[0];if(!f)return;if(f.size>20000000)throw Error('Layout exceeds 20 MB.');const next=validate(JSON.parse(await f.text()));if(await window.HotelDialogs.confirm('Replace this browser’s menu layout? Export a backup first.'))save(next);}catch(e){status.textContent=e.message;}});details.append(input);
    details.append(button('Add section',async () => {const name=await window.HotelDialogs.prompt('Section name');if(!name?.trim())return;const next=snapshot(app),id='section-'+crypto.randomUUID();next.categories.push({id,name:name.trim(),image:'',description:'',icon:'🍽️'});next.subcategories[id]=[{id:'all',name:'All items'}];save(next);}));
    for(const category of app.categories.filter(c=>!['all','chef-specials'].includes(c.id))){
      const lazy=preserve(node('details'),'section:'+category.id);lazy.append(node('summary',category.name));let loaded=false;
      const populate=async () => {if(!lazy.open||loaded)return;loaded=true;const built=editSection(category);for(const child of [...built.children].slice(1))lazy.append(child);};
      lazy.addEventListener('toggle',populate);details.append(lazy);if(lazy.open)populate();
    }host.append(details);
    if(scrollHost && previousScrollTop!==undefined)scrollHost.scrollTop=previousScrollTop;
  }
  window.HotelMenuStructure={apply,applyPublished,render,validate,capture,snapshot,saveDraft:commit,hasDraft:()=>Boolean(draft.categories)};
})();
