const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('royal.css','utf8'),html=fs.readFileSync('index.html','utf8');
let ratingAttribute;const radios=[1,2,3,4,5].map(value=>({value:String(value),parentElement:{classList:{toggle(){}}}}));
const c={window:{},document:{readyState:'loading',addEventListener(){},getElementById:id=>id==='feedback-star-control'?{setAttribute(k,v){ratingAttribute=v;}}:{},querySelectorAll:()=>radios},console};
vm.createContext(c);vm.runInContext(source+';window.App=HotelPremierApp;',c);
const app=Object.create(c.window.App.prototype);app.t=(key,fallback)=>fallback||key;app.currentLang='en';
const card=app.renderDishCard({id:'test',name:'Thali',price:100,image:'',tags:['online-exclusive']});
const info=card.match(/<button type="button" class="view-detail-link"[\s\S]*?<\/button>/)[0];
assert.match(info,/dish-info-symbol/);assert.doesNotMatch(info,/detailsBtn|<span>Details/);assert.match(info,/aria-label="View dish details"/);
assert.ok(card.indexOf('dish-badge-delivery-exclusive')>card.indexOf('dish-banner-bottom'),'Exclusive note belongs below the content');
for(const rating of [1,2,3,4,5]){app.setStarRating(rating);assert.equal(ratingAttribute,String(rating));assert.equal(radios.filter(r=>r.checked).length,1);}
assert.match(css,/prefers-reduced-motion:reduce[\s\S]*premier|prefers-reduced-motion:reduce\) \{ #feedback-star-control/);
assert.match(css,/animation:premier-star-shine 1\.6s ease-in-out 2/);
assert.equal(app.renderSubCategoryChips('morning-delights',[]),'','Guest subsection labels and counts are removed, not merely wrapped');
const reviews=html.slice(html.indexOf('external-review-quiet-block'),html.indexOf('<!-- 7.',html.indexOf('external-review-quiet-block')));
assert.doesNotMatch(reviews,/zomato\.com\/search/);
for(const asset of ['google-g','google-maps','makemytrip','goibibo-sprite','swiggy','zomato']){
 const file=`assets/brands/${asset}.png`;assert.deepEqual([...fs.readFileSync(file).subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.ok(fs.readFileSync('sw.js','utf8').includes(file));
}
assert.equal(html,require('./public-build-helper.cjs').fallbackHTML());
console.log('PASS: icon-only details, thali footer, five rating intensities, reduced motion, removed subsection strips and genuine local brand PNGs');
