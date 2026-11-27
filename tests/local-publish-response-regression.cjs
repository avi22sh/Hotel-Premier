const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),assert=require('node:assert/strict');
const script=fs.readFileSync('tools/publish-direct.ps1','utf8'),server=fs.readFileSync('Start-QR-Menu-Server.ps1','utf8');
assert.match(script,/Write-PublishResult \$result/);assert.match(server,/-ResultFile/);assert.match(server,/File.ReadAllText\(resultFile/);assert.match(server,/ReadToEndAsync/);
if(process.platform==='win32'){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'premier-publish-result-'));for(const d of ['tools','data','assets/menu-uploads','dist'])fs.mkdirSync(path.join(root,d),{recursive:true});
 fs.writeFileSync(path.join(root,'tools/publish-direct.ps1'),script);
 fs.writeFileSync(path.join(root,'tools/build-public-dist.cjs'),'console.log("Build output must not pollute JSON");');
 fs.writeFileSync(path.join(root,'git.cmd'),'@echo off\r\nif "%1"=="status" exit /b 0\r\nif "%1"=="diff" exit /b 1\r\nif "%1"=="rev-parse" (echo abc123& exit /b 0)\r\necho Git output must not pollute JSON\r\nexit /b 0\r\n');
 fs.writeFileSync(path.join(root,'sw.js'),"const CACHE_NAME = 'hotel-premier-v22.0';");for(const f of ['app.js','asset-pipeline.js','photo-workflow.js','public-reviews.js','pwa-updates.js','index.html'])fs.writeFileSync(path.join(root,f),'// 22.0');
 fs.writeFileSync(path.join(root,'data/published-overrides.js'),'window.HOTEL_PREMIER_PUBLISHED_OVERRIDES={"layout":{"items":{"removed":{"_deleted":true}}}};');
 const input=path.join(root,'input.json'),resultFile=path.join(root,'result.json');fs.writeFileSync(input,JSON.stringify({overrides:{version:1,dishes:{test:{name:'गुलाब जामुन',price:30}},layout:{items:{}}},images:[]}));
 const result=cp.spawnSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(root,'tools/publish-direct.ps1'),'-InputFile',input,'-ResultFile',resultFile],{encoding:'utf8',env:{...process.env,PATH:root+path.delimiter+process.env.PATH},timeout:30000});
 assert.equal(result.status,0,result.stderr||result.stdout);const reply=JSON.parse(fs.readFileSync(resultFile,'utf8'));assert.equal(reply.success,true);assert.equal(reply.version,'v22.1');assert.ok(reply.expectedContent.includes('गुलाब जामुन'));assert.equal(reply.commit,'abc123');assert.ok(!fs.readFileSync(resultFile,'utf8').includes('output must not pollute'));const published=JSON.parse(reply.expectedContent.slice(reply.expectedContent.indexOf('=')+1).trim().replace(/;$/,''));assert.equal(published.layout.items.removed._deleted,true,'Older open tabs cannot discard committed removals');
}
console.log('PASS: local publishing uses an isolated UTF-8 JSON result channel; Windows worker round-trip preserves Hindi');
