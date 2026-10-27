const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=[{nodeValue:'Arrival date',parentElement:{closest:()=>null}},{nodeValue:'Your preferences',parentElement:{closest:()=>null}},{nodeValue:'Arrival date',parentElement:{closest:()=>true}}];
const field={value:'Guest-entered name',attrs:{placeholder:'Full name','aria-label':'Share Paneer Butter Masala'},closest:()=>null,hasAttribute(k){return k in this.attrs;},getAttribute(k){return this.attrs[k];},setAttribute(k,v){this.attrs[k]=v;}};
const option={tagName:'OPTION',attrs:{},closest:()=>null,hasAttribute(k){return k in this.attrs;},setAttribute(k,v){this.attrs[k]=v;},get value(){return this.attrs.value||optionNode.nodeValue;}};
const optionNode={nodeValue:'Room only',parentElement:option};nodes.push(optionNode);
const root={querySelectorAll:()=>[field]};
const doc={readyState:'loading',documentElement:{lang:'en'},body:root,addEventListener(){},createTreeWalker(){let index=0;return {nextNode:()=>nodes[index++]||null};}};
const context={window:{},document:doc,console,queueMicrotask};vm.createContext(context);
for(const file of ['data/translations.js','data/menu-data.js','data/interface-copy.js','data/guest-localization.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const i18n=context.window.HOTEL_PREMIER_I18N,language=context.window.HotelGuestLanguage;
for(const lang of ['hi','mr']){
 i18n.currentLang=lang;language.sync();assert.equal(doc.documentElement.lang,lang);assert.match(nodes[0].nodeValue,/[\u0900-\u097f]/);assert.match(nodes[1].nodeValue,/[\u0900-\u097f]/);assert.match(field.attrs.placeholder,/[\u0900-\u097f]/);assert.equal(field.value,'Guest-entered name');assert.equal(nodes[2].nodeValue,'Arrival date','Admin text is excluded');
 assert.equal(option.value,'Room only','Translating a label must preserve its submitted option value');
 assert.ok(field.attrs['aria-label'].includes(lang==='hi'?'साझा':'शेअर'),'Dynamic accessible labels must also follow language changes');
 for(const category of Object.values(i18n.categories))assert.match(category[lang],/[\u0900-\u097f]/);
 for(const dish of context.window.HOTEL_PREMIER_INITIAL_MENU.filter(d=>!d.groupedUnder))assert.match(dish[lang==='hi'?'descriptionHi':'descriptionMr']||language.menuDescription(dish,lang),/[\u0900-\u097f]/,'Missing visible description: '+dish.id);
 assert.match(language.text('Up to 4 Premier Signature Queen room(s), subject to availability. Count all adults and children.',lang),/[\u0900-\u097f]/);
 assert.ok(!language.text('2 Night(s) • 24-Hr Check-Out (Direct Bookings Only) • 1 Paid Extra Bed(s)',lang).includes('Paid Extra Bed'));
}
i18n.currentLang='en';language.sync();assert.equal(nodes[0].nodeValue,'Arrival date');assert.equal(field.attrs.placeholder,'Full name');assert.equal(field.attrs['aria-label'],'Share Paneer Butter Masala');
nodes[0].nodeValue='Your name';i18n.currentLang='mr';language.sync();assert.equal(nodes[0].nodeValue,'तुमचे नाव','Freshly rendered strings follow current language');
const app=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('theme-tokens.css','utf8');
assert.doesNotMatch(app,/return variant\.descriptionMr \|\| variant\.descriptionHi/,'Marathi must not silently use Hindi');
assert.match(css,/\.modal-dish-detail-container > \* \{ flex-shrink:0;/);
assert.match(css,/#dish-detail-body \.modal-dish-header \{ contain:none;/);
assert.match(css,/#concierge-booking-modal \.enquiry-grid \{ grid-template-columns:minmax\(0,1fr\)/);
console.log('PASS: EN/HI/MR round trips, dynamic guest text, preserved field values/admin text, all visible menu descriptions and category names, no heading flex collapse, single-column mobile enquiry');
