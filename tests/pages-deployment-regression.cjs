const assert=require('node:assert/strict'),fs=require('fs');
const deploy=require('../tools/deploy-pages.cjs');
(async()=>{
 let calls=[],outputs=[],status='succeed';
 const input={artifactId:'15066706479',context:{repo:{owner:'avi22sh',repo:'Hotel-Premier'},sha:'release'},core:{getIDToken:async()=>'private-oidc',setOutput:(...args)=>outputs.push(args),info(){}},wait:async()=>{},github:{request:async(route,body)=>{calls.push({route,body});return route.startsWith('POST')?{data:{id:'42',page_url:'https://avi22sh.github.io/Hotel-Premier/'}}:{data:{status}};}}};
 await deploy(input);assert.equal(calls[0].body.artifact_id,15066706479);assert.equal(calls[0].body.pages_build_version,'release');assert.equal(calls[0].body.oidc_token,'private-oidc');assert.equal(outputs[0][0],'page_url');assert.equal(calls.length,2);assert.ok(!calls.some(c=>c.route.includes('artifacts')),'Never relies on a second artifact listing');
 status='deployment_content_failed';await assert.rejects(deploy(input),/deployment_content_failed/);
 await assert.rejects(deploy({...input,artifactId:''}),/Missing/);
 status='queued';calls=[];await assert.rejects(deploy(input),/five minutes/);assert.ok(calls.at(-1).route.endsWith('/cancel'));
 const workflow=fs.readFileSync('.github/workflows/deploy-pages.yml','utf8');assert.match(workflow,/steps\.pages-artifact\.outputs\.artifact_id/);assert.match(workflow,/id-token: write/);assert.match(workflow,/pages: write/);
 console.log('PASS: exact uploaded artifact ID, existing OIDC protection, deployment status/failure handling, timeout cancellation and workflow wiring');
})().catch(e=>{console.error(e);process.exitCode=1});
