// Read the same menu layers as a fresh guest, without touching browser drafts.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
async function loadMenu(root=path.resolve(__dirname,'..')) {
 const context={window:{},console,document:{readyState:'loading',addEventListener(){}},localStorage:{getItem:()=>null,setItem(){throw Error('Audit must not write browser storage');}}};
 vm.createContext(context);
 for(const file of ['data/menu-data.js','data/menu-photos.js','data/published-overrides.js','menu-structure.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+(file==='app.js'?';window.App=HotelPremierApp;':''),context,{filename:file});
 const app=Object.create(context.window.App.prototype);await app.loadMenuData();
 return {app,window:context.window,context};
}
module.exports={loadMenu};
