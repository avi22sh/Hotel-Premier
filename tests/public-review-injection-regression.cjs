const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function element(tag){return {tag,children:[],attrs:{},textContent:'',set innerHTML(value){throw Error('Untrusted HTML rendering is forbidden');},append(...items){this.children.push(...items);},appendChild(item){this.children.push(item);},replaceChildren(){this.children=[];},setAttribute(k,v){this.attrs[k]=v;}};}
const payload='<img src=x onerror=alert(1)>',grid=element('div'),status=element('p');let run;
const context={console,Date,AbortSignal,document:{addEventListener(event,fn){run=fn;},getElementById:id=>id==='public-review-grid'?grid:status,createElement:element},fetch:async()=>({ok:true,json:async()=>({updatedAt:new Date().toISOString(),reviews:[null,{approved:true,rating:4.5,author:payload,text:payload,stayType:payload,date:payload,source:payload,badge:payload},{approved:true,rating:5,author:{bad:true},text:'Valid review'}]})})};
vm.runInNewContext(fs.readFileSync('public-reviews.js','utf8'),context);
(async()=>{await run();assert.equal(grid.children.length,2);const nodes=[];function walk(e){nodes.push(e);e.children.forEach(walk);}walk(grid);
 assert.equal(nodes.filter(e=>e.tag==='img').length,0);assert.ok(nodes.some(e=>e.textContent===payload));assert.ok(nodes.some(e=>e.className==='review-source-tag review-source-other'));assert.ok(nodes.some(e=>e.textContent==='4.5'));assert.doesNotMatch(status.textContent,/temporarily unavailable/);
 console.log('PASS: hostile review fields stay literal, source classes are bounded, fractional ratings render and malformed authors cannot crash the feed');
})().catch(error=>{console.error(error);process.exitCode=1;});
