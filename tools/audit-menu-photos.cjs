const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const sharp = require(process.env.PREMIER_SHARP_MODULE || 'sharp');
const root = path.resolve(__dirname, '..');
const output = path.resolve(process.argv[2]);
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root,'data/menu-data.js'),'utf8'), context);
const menu = context.window.HOTEL_PREMIER_INITIAL_MENU;
const categories = context.window.HOTEL_PREMIER_CATEGORIES;
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]); }
const escape = s => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const files = walk(path.join(root,'assets/menu-images')).sort();
 const records=[];
 for(const [index,file] of files.entries()) {
  const relative=path.relative(root,file).replaceAll('\\','/');
  const matching=menu.filter(d=>d.image?.replaceAll('\\','/')===relative);
  const categoryMatches=categories.filter(d=>d.image?.replaceAll('\\','/')===relative);
  const record={index:index+1,path:relative,dishes:matching.map(d=>({id:d.id,name:d.name})),categories:categoryMatches.map(d=>d.id)};
  try {
   record.sha256=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
   const meta=await sharp(file).metadata();
   record.width=meta.width;record.height=meta.height;
   const thumb=await sharp(file).rotate().resize(190,170,{fit:'contain',background:'#ece9e2'}).jpeg({quality:82}).toBuffer();
   const title=`${record.index} ${matching.length?'MENU':'ALT'} ${path.basename(file).slice(0,28)}`;
   const label=Buffer.from(`<svg width="200" height="42"><rect width="200" height="42" fill="#ffffff"/><text x="5" y="15" font-size="11" font-family="Arial" fill="#111">${escape(title)}</text><text x="5" y="31" font-size="10" font-family="Arial" fill="#333">${escape(path.basename(path.dirname(file)).slice(0,28))}</text></svg>`);
   record.tile=await sharp({create:{width:200,height:215,channels:3,background:'#ece9e2'}}).composite([{input:thumb,left:5,top:0},{input:label,left:0,top:173}]).png().toBuffer();
  } catch(error) { record.error=error.message; }
  records.push(record);
 }
 for(let i=0;i<records.length;i+=30) {
  const batch=records.slice(i,i+30);
  await sharp({create:{width:1200,height:1075,channels:3,background:'#ece9e2'}}).composite(batch.filter(r=>r.tile).map(r=>({input:r.tile,left:((r.index-1)%30%6)*200,top:Math.floor(((r.index-1)%30)/6)*215}))).jpeg({quality:85}).toFile(path.join(output,`sheet-${String(i/30+1).padStart(2,'0')}.jpg`));
 }
 const serial=records.map(({tile,...rest})=>rest);
 const noPhoto=menu.filter(d=>!d.image).map(d=>({id:d.id,name:d.name}));
 const missing=menu.filter(d=>d.image && !records.some(r=>r.path===d.image.replaceAll('\\','/'))).map(d=>({id:d.id,name:d.name,image:d.image}));
 const summary={files:records.length,dishes:menu.length,menuImages:records.filter(r=>r.dishes.length).length,withoutPhoto:noPhoto.length,missing:missing.length,decodeErrors:records.filter(r=>r.error).length,uniqueFileHashes:new Set(records.map(r=>r.sha256)).size};
 fs.writeFileSync(path.join(output,'inventory.json'),JSON.stringify({summary,noPhoto,missing,images:serial},null,2));
 console.log(JSON.stringify(summary));
})().catch(e=>{console.error(e);process.exitCode=1});
