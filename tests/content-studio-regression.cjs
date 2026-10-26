const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
class Element {
  constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.events={};this.textContent='';}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setAttribute(){}
  hasAttribute(){return false;}
  addEventListener(name,callback){this.events[name]=callback;}
  remove(){}
  async click(){return this.events.click?.();}
}
const heading=new Element('h2');heading.textContent='Welcome';
const sections=Object.fromEntries(['home','stay','tariffs','dine','celebrate','explore','contact'].map(id=>[`section-${id}`,new Element('section')]));
let saved,failSave=false;
const context={window:{admin:{isAuthenticated:true}},console,confirm:()=>true,crypto:{randomUUID:()=> 'card-1'},localStorage:{getItem:()=>saved,setItem:(key,value)=>{if(failSave)throw Error('Storage full');saved=value;}},document:{readyState:'complete',createElement:tag=>new Element(tag),getElementById:id=>sections[id],querySelectorAll:selector=>selector.startsWith('#section-home ')?[heading]:[]}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('content-studio.js','utf8'),context);
const studio=context.window.HotelContentStudio;
assert.equal(studio.validate({version:1,text:{},cards:[],privateData:'must not export'}).privateData,undefined);
(async()=>{
context.window.HotelDialogs={confirm:async()=>true};
const container=new Element('div');
const all=node=>[node,...node.children.flatMap(all)];
const button=label=>all(container).find(node=>node.tag==='button' && node.textContent===label);
studio.render(container);
const text=all(container).find(node=>node.tag==='textarea');
text.value='<img src=x onerror=alert(1)>';
await button('Save text').click();
assert.equal(heading.textContent,text.value,'Editor uses textContent, never HTML');
assert.equal(heading.children.length,0);
assert.match(saved,/onerror/,'Literal text remains literal in storage');
failSave=true;text.value='Must not apply';await button('Save text').click();
assert.notEqual(heading.textContent,text.value,'Failed persistence must not alter page');
failSave=false;await button('Restore text').click();
assert.equal(heading.textContent,'Welcome');
await button('Add content card').click();
assert.equal(JSON.parse(saved).cards.length,1);
await button('Remove card').click();
assert.equal(JSON.parse(saved).cards.length,0);
assert.throws(()=>studio.validate({version:1,text:{unknown:'x'},cards:[]}));
assert.throws(()=>studio.validate({version:1,text:{},cards:[{id:'x',section:'crm',title:'x',body:''}]}));
assert.throws(()=>studio.validate({version:1,text:{},cards:[{id:'x',section:'home',title:'',body:''}]}));
context.window.admin.isAuthenticated=false;
const old=saved;
await button('Add content card').click();
assert.equal(saved,old,'Unauthenticated actions must not save');
console.log('PASS: content editing, literal text safety, add/remove, restore, storage failure, validation and local authentication guard');

})().catch(error=>{console.error(error);process.exitCode=1;});
