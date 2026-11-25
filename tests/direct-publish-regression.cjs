const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('publish-bundle.js','utf8').replace('window.HotelPublishBundle = Object.freeze','window.testPublisher={publishViaGitHubApi,verifyLivePublication};window.HotelPublishBundle = Object.freeze');
const ok=data=>({ok:true,status:200,json:async()=>data});
function setup(fetch){const element={classList:{add(){}},style:{}};const c={console,AbortSignal,setTimeout:fn=>fn(),fetch,document:{getElementById:()=>element,querySelector:()=>element},window:{}};vm.runInNewContext(source,c);return c.window.testPublisher;}
(async()=>{
 const calls=[];let conflict=false;
 const api=setup(async(url,options={})=>{
  const body=options.body?JSON.parse(options.body):null;calls.push({url,method:options.method||'GET',body});
  if(url.endsWith('/git/ref/heads/main'))return ok({object:{sha:'parent'}});
  if(url.endsWith('/git/commits/parent'))return ok({tree:{sha:'base-tree'}});
  if(url.includes('/git/trees/base-tree'))return ok({tree:[{type:'blob',path:'assets/existing.webp'}]});
  if(url.endsWith('/git/blobs'))return ok({sha:body.encoding==='base64'?'new-image':'content'});
  if(url.endsWith('/git/trees'))return ok({sha:'release-tree'});
  if(url.endsWith('/git/commits'))return ok({sha:'release-commit'});
  if(url.endsWith('/git/refs/heads/main'))return conflict?{ok:false,status:422}:ok({});
  throw Error('Unexpected API call '+url);
 });
 const bundle={overrides:{version:1,dishes:{}},images:[{path:'assets/existing.webp',base64:'existing'},{path:'assets/new.webp',base64:'new'}]};
 const result=await api.publishViaGitHubApi(bundle,'private-token');
 assert.equal(result.commit,'release-commit');assert.ok(result.publishedAt);assert.equal(calls.filter(c=>c.url.includes('/contents/')).length,0);
 const refs=calls.filter(c=>c.method==='PATCH');assert.equal(refs.length,1);assert.equal(refs[0].body.force,false);
 const tree=calls.find(c=>c.method==='POST'&&c.url.endsWith('/git/trees')).body;
 assert.deepEqual(tree.tree.map(e=>e.path),['assets/new.webp','data/published-overrides.js']);
 assert.equal(calls.filter(c=>c.url.endsWith('/git/blobs')).length,2,'Existing immutable photo is not reuploaded');
 conflict=true;await assert.rejects(api.publishViaGitHubApi(bundle,'private-token'),/Nothing was overwritten/);
 const pendingBundle={overrides:{publishedAt:123}};
 let requests=[];
 const live=setup(async(url,options={})=>{requests.push({url,options});return {ok:true,text:async()=>'window.HOTEL_PREMIER_PUBLISHED_OVERRIDES = {"publishedAt":123};'};});
 assert.equal(await live.verifyLivePublication({publishedAt:123,expectedContent:'window.HOTEL_PREMIER_PUBLISHED_OVERRIDES = {"publishedAt":123};'},pendingBundle),true);
 assert.ok(requests.every(r=>!r.options.headers?.Authorization),'Guest verification never receives the token');
 const failed=setup(async(url,options)=>url.includes('api.github.com')?ok({workflow_runs:[{name:'Deploy Hotel Premier to GitHub Pages',status:'completed',conclusion:'failure'}]}):{ok:true,text:async()=>'"publishedAt":122'});
 assert.equal(await failed.verifyLivePublication({publishedAt:123,commit:'abc'},pendingBundle),false,'Saved commit is not falsely reported live after failed deployment');
 const wrong=setup(async(url)=>url.includes('api.github.com')?ok({workflow_runs:[{name:'Deploy Hotel Premier to GitHub Pages',status:'completed',conclusion:'failure'}]}):{ok:true,text:async()=>'"publishedAt":123, "other":"content"'});
 assert.equal(await wrong.verifyLivePublication({publishedAt:123,expectedContent:'expected',commit:'abc'},pendingBundle),false,'Same timestamp alone does not verify different content');
 console.log('PASS: atomic photo/content release, safe non-force branch update, upload deduplication, concurrent-update rejection, exact live verification and failed-deployment handling');
})().catch(e=>{console.error(e);process.exitCode=1});
