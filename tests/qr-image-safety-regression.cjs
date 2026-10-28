const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const events={};let observer;
const canvas={width:160,style:{display:'none'}};
const host={querySelector:()=>canvas};
function image(qr=false){return {tagName:'IMG',attrs:{src:'data:image/png;base64,fixture'},closest:s=>qr&&s.includes('#location-qr-mount')?host:null,hasAttribute(k){return k in this.attrs;},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},removeAttribute(k){delete this.attrs[k];},dataset:{}};}
const code=fs.readFileSync('image-safety.js','utf8');
const qr=image(true),photo=image();
const context={document:{readyState:'complete',body:{},addEventListener:(name,fn)=>events[name]=fn,querySelectorAll:()=>[qr,photo],getElementById:()=>null},MutationObserver:class{constructor(fn){observer=fn;}observe(){}}};
vm.runInNewContext(code,context);
assert.equal(qr.attrs.width,'160');assert.equal(qr.attrs.height,'160');assert.equal(qr.alt,'Scan QR code');assert.equal(qr.attrs.loading,undefined);
assert.equal(photo.attrs.width,'1200');assert.equal(photo.attrs.height,'900');assert.equal(photo.attrs.loading,'lazy');
const later=image(true);later.nodeType=1;later.querySelectorAll=()=>[];observer([{addedNodes:[later]}]);assert.equal(later.attrs.height,'160');
events.error({target:qr});assert.equal(qr.hidden,true);assert.equal(canvas.style.display,'block');assert.notEqual(qr.src,'assets/brand-placeholder.svg');
events.error({target:photo});assert.equal(photo.src,'assets/brand-placeholder.svg');
console.log('PASS: static/dynamic QR dimensions stay square, accessible scan label, canvas fallback and ordinary photo fallback preserved');
