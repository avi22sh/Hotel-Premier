const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function element(tag){return {tag,children:[],textContent:'',append(...items){this.children.push(...items);},appendChild(item){this.children.push(item);},replaceChildren(){this.children=[];},setAttribute(){}};}
async function render(data){let run;const grid=element('div'),status=element('p');vm.runInNewContext(fs.readFileSync('public-reviews.js','utf8'),{Date,AbortSignal,document:{addEventListener(_,fn){run=fn;},getElementById:id=>id==='public-review-grid'?grid:status,createElement:element},fetch:async()=>({ok:true,json:async()=>data})});await run();return {grid,status};}
(async()=>{
 const current=JSON.parse(fs.readFileSync('data/public-reviews.json','utf8'));
 assert.deepEqual(current.reviews,[],'Unverified local testimonials must not masquerade as an authorized feed');
 const empty=await render(current);assert.equal(empty.grid.children.length,0);assert.match(empty.status.textContent,/Google, MakeMyTrip and Goibibo/);assert.doesNotMatch(empty.status.textContent,/Loading|Last updated|Verified/);
 const fixture=await render({reviews:[{rating:5,approved:true,text:'Fixture',badge:'Verified Booking'}]});
 const all=[];function walk(n){all.push(n);n.children.forEach(walk);}walk(fixture.grid);
 assert.equal(all.filter(n=>n.className==='review-verified-pill').length,0,'An approved flag or arbitrary badge is not verification evidence');
 console.log('PASS: empty feed offers real source links and arbitrary review badges cannot claim verification');
})().catch(e=>{console.error(e);process.exitCode=1;});
