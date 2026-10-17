const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Node {
  constructor(){this.events={};this.children=[];this.style={};}
  setAttribute(k,v){this[k]=v;}
  addEventListener(k,v){this.events[k]=v;}
  append(...nodes){this.children.push(...nodes);}
  showModal(){this.open=true;}
  close(){this.open=false;this.events.close();}
  focus(){this.focused=true;}
}
const cards=[0,1].map(i=>{const n=new Node();n.querySelector=s=>s==='img'?{src:`photo${i}.jpg`,alt:`Photo ${i}`}:{textContent:`Caption ${i}`};return n;});
const body=new Node();body.style.overflow='auto';
vm.runInNewContext(fs.readFileSync('property-gallery.js','utf8'),{document:{readyState:'complete',body,createElement:()=>new Node(),querySelectorAll:()=>cards}});
cards[0].events.click();
const dialog=body.children[0],image=dialog.children[0];
assert.equal(dialog.open,true);assert.equal(image.src,'photo0.jpg');
dialog.events.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(image.src,'photo1.jpg');
dialog.events.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(image.src,'photo0.jpg');
dialog.close();assert.equal(body.style.overflow,'auto');assert.equal(cards[0].focused,true);
assert.equal(cards[1].role,'button');assert.equal(cards[1]['aria-haspopup'],'dialog');
const html=fs.readFileSync('index.html','utf8');assert.match(html,/A Little Space to Pause/);assert.doesNotMatch(html,/Explore the two Premier Royale King balcony outlooks/);
console.log('PASS: property viewer opening, navigation wrapping, focus restoration and revised captions');
