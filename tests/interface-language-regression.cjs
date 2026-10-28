const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const parent=(privateText=false,tagName='SPAN')=>({tagName,attrs:{},closest:()=>privateText?{}:null,hasAttribute(k){return k in this.attrs;},setAttribute(k,v){this.attrs[k]=v;}});
const nodes=[{nodeValue:'Save changes',parentElement:parent()},{nodeValue:'Arrival date',parentElement:parent(true)},{nodeValue:'Room only',parentElement:parent(false,'OPTION')}];
const field={value:'Private guest name',attrs:{placeholder:'Full name'},closest:()=>null,hasAttribute(k){return k in this.attrs;},getAttribute(k){return this.attrs[k];},setAttribute(k,v){this.attrs[k]=v;}};
const root={querySelectorAll:()=>[field]};
const c={window:{},document:{readyState:'loading',addEventListener(){},createTreeWalker(){let i=0;return{nextNode:()=>nodes[i++]||null};}},console};vm.createContext(c);
const files=['data/translations.js','data/menu-data.js','data/interface-copy.js','data/guest-localization.js','admin-localization.js'];
for(const f of files)vm.runInContext(fs.readFileSync(f,'utf8'),c);
const rows=c.window.HOTEL_PREMIER_INTERFACE_COPY,language=c.window.HotelGuestLanguage,i18n=c.window.HOTEL_PREMIER_I18N;
assert.ok(rows.length>550);for(const row of rows){assert.equal(row.length,3);assert.match(row[1],/[\u0900-\u097f]/,row[0]);assert.match(row[2],/[\u0900-\u097f]/,row[0]);}
const menu=c.window.HOTEL_PREMIER_INITIAL_MENU;const original=JSON.stringify(menu);
for(const lang of ['hi','mr']){
 for(const dish of menu.filter(d=>!d.groupedUnder)){
  assert.match(language.text(dish.name,lang),/[\u0900-\u097f]/,dish.name+' on first render');
  assert.match(dish[lang==='hi'?'descriptionHi':'descriptionMr']||language.menuDescription(dish,lang),/[\u0900-\u097f]/);
 }
 for(const text of ['All Categories','No Dishes Found','Your Premier Stay','Birthday Parties','Please choose today or a future date.','172 sq.ft','Guest Wi-Fi','Choose your area','Third floor'])assert.match(language.text(text,lang),/[\u0900-\u097f]/,text);
 assert.match(language.text('📅 Arrival date',lang),/^📅 [\u0900-\u097f]/);
 i18n.currentLang=lang;c.window.HotelAdminLanguage.sync(root);
 assert.match(nodes[0].nodeValue,/[\u0900-\u097f]/);assert.equal(nodes[1].nodeValue,'Arrival date');assert.equal(field.value,'Private guest name');assert.equal(nodes[2].parentElement.attrs.value,'Room only');
}
i18n.currentLang='en';c.window.HotelAdminLanguage.sync(root);assert.equal(nodes[0].nodeValue,'Save changes');assert.equal(field.attrs.placeholder,'Full name');assert.equal(JSON.stringify(menu),original);
const html=fs.readFileSync('index.html','utf8');assert.ok(html.indexOf('src="data/menu-data.js')<html.indexOf('src="data/guest-localization.js'));
assert.equal(i18n.translations.en.eventsBadge,'','Removed event badge must remain intentionally blank');
const css=fs.readFileSync('theme-tokens.css','utf8').split('/* Champagne glass')[1];assert.ok(css);assert.doesNotMatch(css,/body\.theme-dark/);assert.match(css,/forced-colors/);assert.doesNotMatch(css,/animation\s*:/);
// SSIDs and passwords can coincide with ordinary translated words: preserve their exact bytes.
const wifiNodes=[['First floor','.guest-network-ssid'],['Your room','.guest-network-secret'],['Choose your area','']].map(([nodeValue,selector])=>({nodeValue,parentElement:{tagName:'SPAN',closest:excluded=>selector&&excluded.includes(selector)?{}:null}}));
c.document.documentElement={};c.document.createTreeWalker=()=>{let n=0;return {nextNode:()=>wifiNodes[n++]||null};};
i18n.currentLang='hi';language.sync({querySelectorAll:()=>[]});
assert.equal(wifiNodes[0].nodeValue,'First floor');assert.equal(wifiNodes[1].nodeValue,'Your room');assert.match(wifiNodes[2].nodeValue,/[\u0900-\u097f]/);
i18n.currentLang='en';language.sync({querySelectorAll:()=>[]});assert.equal(wifiNodes[2].nodeValue,'Choose your area');
console.log('PASS: reviewed HI/MR catalogue, first-render menu translation, private records/field values preserved, Admin language round trips, light-only gold styling');
