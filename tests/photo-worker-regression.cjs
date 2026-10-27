const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let result,closed=0,draw;
class Canvas { constructor(width,height){this.width=width;this.height=height;}getContext(){return {drawImage(...args){draw=args;}};}async convertToBlob({type}){return new Blob(['optimized'],{type});} }
const c={Blob,Response,URL,OffscreenCanvas:Canvas,createImageBitmap:async()=>({width:3000,height:2000,close(){closed++;}}),postMessage:value=>{result=value;},fetch:async()=>new Response(new Blob(['original'],{type:'image/jpeg'})),console};c.self=c;
vm.createContext(c);
(async()=>{
 vm.runInContext(fs.readFileSync('photo-worker.js','utf8'),c);
 await c.onmessage({data:{file:new Blob(['photo'],{type:'image/jpeg'}),crop:{x:20,y:30,width:2400,height:1800}}});
 assert.equal(result.width,1600);assert.equal(result.height,1200);assert.equal(result.blob.type,'image/webp');assert.equal(closed,1);assert.deepEqual(draw.slice(1,5),[20,30,2400,1800]);
 assert.equal(fs.existsSync('photo-enhance-worker.js'),false,'The unwanted enhancement worker must be removed');
 assert.doesNotMatch(fs.readFileSync('photo-workflow.js','utf8'),/processAutomaticStudioEnhancement|photo-enhance-worker/);
 console.log('PASS: bounded upload optimization and bitmap cleanup; enhancement worker and hooks removed');
})().catch(error=>{console.error(error);process.exitCode=1;});
