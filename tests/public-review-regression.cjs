const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
function element() { return {children:[],append(...items){this.children.push(...items);},textContent:''}; }
(async()=>{
  let callback;
  const grid = element(), status = element();
  const context = {console,Date,document:{addEventListener(event,fn){callback=fn;},getElementById:id=>id==='public-review-grid'?grid:status,createElement:element},fetch:async()=>({ok:true,json:async()=>({updatedAt:new Date().toISOString(),reviews:[1,2,3,4,5,6].map(rating=>({rating,approved:true,text:'Guest text',author:'Guest',source:'Google'})).concat([{rating:5,approved:false,text:'Private'}])})})};
  vm.runInNewContext(fs.readFileSync('public-reviews.js','utf8'),context);
  await callback();
  assert.equal(grid.children.length,3);
  assert.match(status.textContent,/Guest review highlights/);
  assert.doesNotMatch(status.textContent,/Selected|3–5|3-5/);
  assert.match(status.textContent,/Last updated/);
  assert.doesNotMatch(status.textContent,/refresh is pending/);
  console.log('PASS: only approved 3–5-star reviews displayed, source and freshness disclosed');
})().catch(e=>{console.error(e);process.exitCode=1;});
