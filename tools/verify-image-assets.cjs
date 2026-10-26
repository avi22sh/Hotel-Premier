/* Dependency-free, case-sensitive asset gate. Runs identically on Windows/Linux. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const walk=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(directory,e.name)):[path.join(directory,e.name)]);
const relative=file=>path.relative(root,file).split(path.sep).join('/');
function auditTrackedPaths(files,tracked){
 const folded=new Map(files.map(file=>[file.toLowerCase(),file]));
 return tracked.filter(file=>folded.has(file.toLowerCase())&&folded.get(file.toLowerCase())!==file).map(file=>({file:'Git index',path:file,cause:'git-case-mismatch',suggestion:folded.get(file.toLowerCase())}));
}
function audit(base=root){
 const walkHere=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walkHere(path.join(directory,e.name)):[path.join(directory,e.name)]);
 const files=walkHere(path.join(base,'assets')).map(f=>path.relative(base,f).split(path.sep).join('/'));
 const exact=new Set(files),folded=new Map(files.map(f=>[f.toLowerCase(),f]));
 const sources=fs.readdirSync(base).filter(f=>/\.(?:js|html|css|json)$/.test(f)).map(f=>path.join(base,f));
 if(fs.existsSync(path.join(base,'data')))sources.push(...walkHere(path.join(base,'data')).filter(f=>/\.(?:js|json)$/.test(f)));
 const failures=[],seen=new Set();
 if(base===root&&fs.existsSync(path.join(base,'.git'))){
  const tracked=cp.execFileSync('git',['ls-files','-z','--','assets'],{cwd:base,encoding:'utf8'}).split('\0').filter(Boolean);
  failures.push(...auditTrackedPaths(files,tracked));
 }
 for(const file of sources){
  const text=fs.readFileSync(file,'utf8');
  for(const match of text.matchAll(/['"`](assets\/[^'"`\r\n<>]*?\.(?:jpe?g|png|webp|avif|jfif|svg))(?:\?[^'"`\r\n]*)?['"`]/gi)){
   const source=match[1];if(source.includes('${'))continue;
   let asset;try{asset=decodeURIComponent(source.replace(/&amp;/g,'&'));}catch{asset=source;}
   const key=file+':'+asset;if(seen.has(key))continue;seen.add(key);
   if(!exact.has(asset))failures.push({file:path.relative(base,file).split(path.sep).join('/'),path:asset,cause:folded.has(asset.toLowerCase())?'case-mismatch':'missing',suggestion:folded.get(asset.toLowerCase())||''});
   if(/^assets\/(?:menu-images|menu-uploads|dishes)\//.test(asset)&&!asset.split('/').every(segment=>/^[a-z0-9]+(?:[-.][a-z0-9]+)*$/.test(segment)))failures.push({file:path.relative(base,file).split(path.sep).join('/'),path:asset,cause:'non-normalized-menu-path',suggestion:''});
  }
 }
 return {references:seen.size,files:files.length,failures};
}
if(require.main===module){const result=audit();if(result.failures.length){console.error(JSON.stringify(result,null,2));process.exitCode=1;}else console.log(`PASS: ${result.references} image references exist with exact case and normalized menu paths (${result.files} asset files).`);}
module.exports={audit,auditTrackedPaths};
