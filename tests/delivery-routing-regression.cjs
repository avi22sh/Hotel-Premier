const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{},document:{readyState:'loading',addEventListener(){}},console,URL};vm.runInNewContext(fs.readFileSync('app.js','utf8')+';window.App=HotelPremierApp;',c);
const app=Object.create(c.window.App.prototype);
assert.match(app.getDeliveryUrl('zomato'),/hotel-premier-bhusawal-locality\/order$/);
assert.match(app.getDeliveryUrl('swiggy'),/rest165366$/);
assert.equal(app.getDeliveryUrl('zomato',{zomatoOrderUrl:'https://www.zomato.com/example-item'}),'https://www.zomato.com/example-item');
assert.equal(app.getDeliveryUrl('swiggy',{swiggyOrderUrl:'https://swiggy.com.evil.example/item'}),app.getDeliveryUrl('swiggy'));
console.log('PASS: genuine restaurant delivery destinations and rejection of lookalike domains');
