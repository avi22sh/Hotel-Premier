const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let copied=[],shared=[],mode='success';
const context={window:{location:{origin:'https://example.com',pathname:'/hotel/room.html'},HotelGuestForms:{shareLink:async url=>copied.push(url)}},document:{readyState:'loading',addEventListener(){},querySelector:()=>({href:'https://example.com/hotel/'})},navigator:{share:async value=>{if(mode==='cancel')throw Object.assign(Error(),{name:'AbortError'});if(mode==='fail')throw Error('Unavailable');shared.push(value);}},console};
vm.createContext(context);vm.runInContext(fs.readFileSync('app.js','utf8')+';window.App=HotelPremierApp;',context);
const app=Object.create(context.window.App.prototype);app.haptic=()=>{};
(async()=>{
 await app.shareHotel();assert.equal(shared.length,1);assert.equal(shared[0].url,'https://example.com/hotel/');
 mode='cancel';await app.shareHotel();assert.equal(copied.length,0,'Cancelling share must not launch another app or copy');
 mode='fail';await app.shareHotel();assert.deepEqual(copied,['https://example.com/hotel/']);
 vm.runInContext(fs.readFileSync('guest-forms.js','utf8'),context);
 const error=context.window.HotelGuestForms.numberError;
 assert.ok(error({value:'',min:'2',max:'12'}));assert.ok(error({value:'1',min:'2',max:'12'}));assert.ok(error({value:'13',min:'2',max:'12'}));assert.ok(error({value:'2.5',min:'2',max:'12'}));assert.equal(error({value:'12',min:'2',max:'12'}),'');assert.equal(error({value:'0',min:'0',max:'2'}),'');
 console.log('PASS: canonical native sharing, safe cancellation/copy fallback and strict editable number boundaries');
})().catch(error=>{console.error(error);process.exitCode=1;});
