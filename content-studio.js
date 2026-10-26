/* Browser-local editorial drafts. No credentials or guest records are exported. */
(() => {
  'use strict';
  const KEY = 'hotel_premier_content_draft_v1';
  const sections = ['home','stay','tariffs','dine','celebrate','explore','contact'];
  const selector = '.editorial-title,.editorial-subtitle,.home-pillar-desc,.atmosphere-gallery-title,.atmosphere-gallery-subtitle';
  const targets = new Map();
  let draft = {version:1, text:{}, cards:[]};
  const valid = value => {
    if (!value || value.version !== 1 || !value.text || typeof value.text !== 'object' || Array.isArray(value.text) || !Array.isArray(value.cards) || value.cards.length > 100) throw Error('Invalid content file.');
    for (const [key, text] of Object.entries(value.text)) {
      if (!targets.has(key) || typeof text !== 'string' || text.length > 3000) throw Error('This file contains unsupported page text.');
    }
    const ids = new Set();
    for (const card of value.cards) {
      if (!card || typeof card.id !== 'string' || !/^[a-z0-9-]+$/.test(card.id) || ids.has(card.id) || !sections.includes(card.section) || typeof card.title !== 'string' || !card.title.trim() || card.title.length > 120 || typeof card.body !== 'string' || card.body.length > 3000) throw Error('Invalid content card.');
      ids.add(card.id);
    }
    return {version:1,text:Object.fromEntries(Object.entries(value.text)),cards:value.cards.map(({id,section,title,body})=>({id,section,title,body}))};
  };
  const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  function apply() {
    for (const [key, target] of targets) target.node.textContent = Object.hasOwn(draft.text,key) ? draft.text[key] : target.original;
    document.querySelectorAll('[data-content-studio-cards]').forEach(node => node.remove());
    for (const section of sections) {
      const host = document.getElementById(`section-${section}`);
      if (!host) continue;
      const grid = el('div',undefined,'content-card-grid');
      grid.dataset.contentStudioCards = section;
      for (const card of draft.cards.filter(item => item.section === section)) {
        const article = el('article',undefined,'content-editorial-card');
        article.append(el('h3',card.title),el('p',card.body));
        grid.append(article);
      }
      if (grid.children.length) host.append(grid);
    }
  }
  function save(next) {
    if (!window.admin?.isAuthenticated) throw Error('Open the developer studio and sign in first.');
    next = valid(next);
    localStorage.setItem(KEY,JSON.stringify(next)); // Commit before changing the visible draft.
    draft = next;
    apply();
  }
  function render(container) {
    if (!window.admin?.isAuthenticated) return;
    container.replaceChildren();
    const panel = el('div',undefined,'content-studio');
    const status = el('p','Changes are saved only in this browser. Export the content file for developer review and publishing. No guest records or credentials are included.','studio-notice');
    status.setAttribute('role','status');
    const run = async action => { try { await action(); status.textContent = 'Saved locally. Export when ready to publish.'; } catch(error) { status.textContent = `Not saved: ${error.message}`; } };
    const button = (label,action) => {
      const node = el('button',label,'studio-button');
      node.type = 'button'; node.addEventListener('click',() => run(action)); return node;
    };
    panel.append(el('h3','Content Studio'),status);
    const toolbar = el('div',undefined,'studio-toolbar');
    toolbar.append(button('Export content',async () => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)],{type:'application/json'}));
      const link = el('a'); link.href=url; link.download='hotel-premier-content.json'; link.click();
      setTimeout(() => URL.revokeObjectURL(url),1000);
    }));
    const upload = el('input'); upload.type='file'; upload.accept='.json,application/json'; upload.setAttribute('aria-label','Import content draft');
    upload.addEventListener('change',async () => {
      try {
        const file=upload.files[0]; if (!file) return;
        if (file.size > 500000) throw Error('Content file exceeds 500 KB.');
        const next=valid(JSON.parse(await file.text()));
        if (!await window.HotelDialogs.confirm('Replace this browser’s content draft? Export it first if you need a backup.')) return;
        save(next); render(container);
      } catch(error) { status.textContent=`Import failed: ${error.message}`; }
    });
    toolbar.append(upload,button('Restore original text & remove custom cards',async () => {
      if (!await window.HotelDialogs.confirm('Restore original page text and remove all custom cards in this browser? Export a backup first.')) return;
      save({version:1,text:{},cards:[]}); render(container);
    }));
    panel.append(toolbar,el('p','Use Menu, Rooms and Slides for prices, dishes and photos. This editor changes editorial copy and custom cards—not booking rules, navigation or customer reviews.'));
    for (const section of sections) {
      const details=el('details',undefined,'studio-section');
      details.append(el('summary',section.charAt(0).toUpperCase()+section.slice(1)));
      for (const [key,target] of targets) {
        if (target.section !== section) continue;
        const field=el('label',undefined,'studio-field');
        field.append(el('span',target.original.slice(0,85)));
        const input=el('textarea'); input.rows=3; input.maxLength=3000;
        input.value=Object.hasOwn(draft.text,key) ? draft.text[key] : target.original;
        field.append(input);
        details.append(field,button('Save text',() => save({...draft,text:{...draft.text,[key]:input.value}})),button('Restore text',async () => {
          const text={...draft.text}; delete text[key]; save({...draft,text}); input.value=target.original;
        }));
      }
      const cards=el('div');
      for (const card of draft.cards.filter(item => item.section===section)) {
        const box=el('div',undefined,'studio-card');
        const title=el('input'); title.value=card.title; title.maxLength=120; title.setAttribute('aria-label','Card title');
        const body=el('textarea'); body.value=card.body; body.rows=3; body.maxLength=3000; body.setAttribute('aria-label','Card description');
        box.append(title,body,button('Save card',() => save({...draft,cards:draft.cards.map(item => item.id===card.id ? {...item,title:title.value.trim(),body:body.value} : item)})));
        for (const [label,offset] of [['Move up',-1],['Move down',1]]) box.append(button(label,async () => {
          const next=draft.cards.slice(), peers=next.filter(item => item.section===section);
          const other=peers[peers.findIndex(item=>item.id===card.id)+offset]; if (!other) return;
          const a=next.findIndex(item=>item.id===card.id),b=next.findIndex(item=>item.id===other.id);
          [next[a],next[b]]=[next[b],next[a]]; save({...draft,cards:next}); render(container);
        }));
        box.append(button('Remove card',async () => {
          if (!await window.HotelDialogs.confirm(`Remove “${card.title}”? Export a backup first if needed.`)) return;
          save({...draft,cards:draft.cards.filter(item=>item.id!==card.id)}); render(container);
        })); cards.append(box);
      }
      details.append(cards,button('Add content card',async () => {
        save({...draft,cards:[...draft.cards,{id:crypto.randomUUID(),section,title:'New information',body:'Edit this card in Content Studio.'}]}); render(container);
      })); panel.append(details);
    }
    container.append(panel);
  }
  function init() {
    for (const section of sections) {
      document.querySelectorAll(`#section-${section} ${selector.split(',').join(`,#section-${section} `)}`).forEach((node,index) => {
        // Only plain editorial text; never erase nested links, buttons or form controls.
        if (node.children.length || node.hasAttribute('data-i18n')) return;
        targets.set(`${section}-${index}`,{node,section,original:node.textContent.trim()});
      });
    }
    try { const saved=localStorage.getItem(KEY); if(saved) draft=valid(JSON.parse(saved)); }
    catch(error) { console.warn('Content draft not loaded:',error.message); }
    apply();
  }
  window.HotelContentStudio={render,validate:valid};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
