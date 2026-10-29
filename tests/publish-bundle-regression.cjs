const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
let download;
const source=URL.createObjectURL(new Blob(['photo'],{type:'image/webp'}));
const c={Blob,fetch,crypto:crypto.webcrypto,URL:{createObjectURL:blob=>{download=blob;return 'blob:download';},revokeObjectURL(){}},FileReader:class{async readAsDataURL(blob){this.result='data:'+blob.type+';base64,'+Buffer.from(await blob.arrayBuffer()).toString('base64');this.onload();}},setTimeout:fn=>fn(),
 document:{createElement:()=>({click(){},remove(){}}),body:{append(){}}},window:{admin:{isAuthenticated:true},app:{menuData:[{id:'fixture',name:'Fixture dish',image:source,rawOriginalImage:source,_activeVariantImage:source,_activeVariantPrice:80,_activeVariantName:'Preview only',fieldUpdatedAt:{image:123}}],categories:[],showToast(){}},HOTEL_PREMIER_HOTEL_DATA:{roomCategories:[]},HOTEL_STORAGE:{getSectionSlides:async()=>null},HotelMenuStructure:{snapshot:()=>null}}};
vm.runInNewContext(fs.readFileSync('publish-bundle.js','utf8'),c);
(async()=>{
 await c.window.HotelPublishBundle.export();const bundle=JSON.parse(await download.text());
 assert.equal(bundle.images.length,1);assert.match(bundle.overrides.dishes.fixture.image,/^assets\/menu-uploads\/published-[a-f0-9]{24}\.webp$/);
 assert.ok(!('rawOriginalImage'in bundle.overrides.dishes.fixture));
 for(const key of ['_activeVariantImage','_activeVariantPrice','_activeVariantName','fieldUpdatedAt'])assert.ok(!(key in bundle.overrides.dishes.fixture),'Preview selection must not become published content');
 assert.equal(bundle.images[0].sha256,crypto.createHash('sha256').update('photo').digest('hex'));
 assert.ok(!/guestRecords|pinHash|cloudAiApiKey/.test(await download.text()));
 c.window.admin.isAuthenticated=false;await assert.rejects(c.window.HotelPublishBundle.export(),/Unlock/);URL.revokeObjectURL(source);
 const {validate}=require('../data-validation.js');
 for(const bad of [{name:'<img src=x onerror=alert(1)>'},{image:"https://example.test/a');alert(1);//"},JSON.parse('{"__proto__":{}}'),{roomGalleries:{'ac-super-deluxe':["x');alert(1);//"]}}])assert.throws(()=>validate(bad));
 const files=fs.readdirSync('dist');assert.ok(!files.includes('tests'));assert.ok(!files.includes('tools'));assert.ok(!files.some(file=>/\.(md|ps1|bat|csv)$/.test(file)));
 console.log('PASS: authenticated public-only bundle, digest filenames, originals excluded, unsafe import rejection and public dist boundary');
})().catch(error=>{console.error(error);process.exitCode=1;});
