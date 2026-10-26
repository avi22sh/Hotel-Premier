/* Explicit, recoverable bulk mechanical rename. Dry-run unless --apply is set.
 * Original bytes are preserved; only paths and their source references change. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const roots=['assets/menu-images','assets/dishes'];
const slug=value=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'image';
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function bounded(relative){
 const resolved=path.resolve(root,relative),assets=path.join(root,'assets')+path.sep;
 if(!resolved.startsWith(assets))throw Error('Asset target escapes the project: '+relative);
 return resolved;
}
function walk(relative){
 const directory=bounded(relative);if(!fs.existsSync(directory))return [];
 return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
  if(entry.isSymbolicLink())throw Error('Symbolic links are not supported in the rename set.');
  const child=relative+'/'+entry.name;return entry.isDirectory()?walk(child):[child];
 });
}
function plan(){
 const allocated=new Map();
 return roots.flatMap(walk).sort().map(old=>{
  const digest=hash(bounded(old)),segments=old.split('/'),file=segments.pop(),ext=path.extname(file).toLowerCase();
  const stem=slug(file.slice(0,file.length-ext.length));
  const directory=segments.map((s,i)=>i<2?s:slug(s)).join('/');
  let next=directory+'/'+stem+ext,n=0;
  while(allocated.has(next.toLowerCase()))next=directory+'/'+stem+'-'+digest.slice(0,12)+(n++?'-'+n:'')+ext;
  allocated.set(next.toLowerCase(),old);bounded(next);
  return {old,next,sha256:digest};
 });
}
function sourceFiles(directory=root){
 return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
  if(entry.name.startsWith('.')||['assets','scratch','reports','dist','node_modules'].includes(entry.name))return [];
  const file=path.join(directory,entry.name);
  return entry.isDirectory()?sourceFiles(file):/\.(?:js|cjs|html|css|json|md|ps1)$/.test(entry.name)?[file]:[];
 });
}
const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function apply(rows){
 if(!rows.some(row=>row.old!==row.next)){console.log('Already normalized; existing mapping CSV is retained.');return;}
 const stageRelative='assets/.menu-rename-stage-'+Date.now(),stage=bounded(stageRelative);
 fs.mkdirSync(stage);
 const reports=path.join(root,'reports');fs.mkdirSync(reports,{recursive:true});
 const journal=path.join(reports,'menu-image-rename-journal.json');
 fs.writeFileSync(journal,JSON.stringify({stage:stageRelative,rows},null,2));
 const rewrites=[];
 for(const file of sourceFiles()){
  const original=fs.readFileSync(file,'utf8');let updated=original;
  for(const row of rows){
   if(row.old===row.next)continue;
   for(const spelling of new Set([row.old,encodeURI(row.old),row.old.replaceAll('&','&amp;')]))updated=updated.replace(new RegExp(escape(spelling),'gi'),row.next);
  }
  if(updated!==original)rewrites.push({file,original,updated});
 }
 const moved=[],committed=[];
 try{
  // Stage every file first, so case-only directory changes are real on Windows.
  rows.forEach((row,index)=>{fs.renameSync(bounded(row.old),path.join(stage,String(index)));moved.push(index);});
  function removeEmpty(relative){const dir=bounded(relative);if(!fs.existsSync(dir))return;for(const entry of fs.readdirSync(dir,{withFileTypes:true}))if(entry.isDirectory())removeEmpty(relative+'/'+entry.name);if(!fs.readdirSync(dir).length)fs.rmdirSync(dir);}
  roots.forEach(removeEmpty);
  rows.forEach((row,index)=>{const target=bounded(row.next);fs.mkdirSync(path.dirname(target),{recursive:true});if(fs.existsSync(target))throw Error('Refusing to overwrite '+row.next);fs.renameSync(path.join(stage,String(index)),target);committed.push(index);if(hash(target)!==row.sha256)throw Error('Photo bytes changed unexpectedly: '+row.next);});
  // Bulk mechanical source rewrites are paired with the image rename transaction.
  rewrites.forEach(change=>fs.writeFileSync(change.file,change.updated));
  const quote=value=>'"'+value.replaceAll('"','""')+'"';
  fs.writeFileSync(path.join(reports,'menu-image-renames.csv'),['old_path,new_path,sha256',...rows.map(r=>[r.old,r.next,r.sha256].map(quote).join(','))].join('\n')+'\n');
  fs.rmdirSync(stage);fs.unlinkSync(journal);
  console.log(`Normalized ${rows.length} asset paths; updated ${rewrites.length} source files; original SHA-256 values preserved. Mapping: reports/menu-image-renames.csv`);
 }catch(error){
  for(const index of committed.reverse())if(fs.existsSync(bounded(rows[index].next)))fs.renameSync(bounded(rows[index].next),path.join(stage,String(index)));
  for(const index of moved){const file=path.join(stage,String(index));if(fs.existsSync(file)){const original=bounded(rows[index].old);fs.mkdirSync(path.dirname(original),{recursive:true});fs.renameSync(file,original);}}
  rewrites.forEach(change=>fs.writeFileSync(change.file,change.original));
  throw Error('Rename stopped and original files restored. Inspect '+journal+'. '+error.message);
 }
}
if(require.main===module){const rows=plan();if(process.argv.includes('--apply'))apply(rows);else console.log(JSON.stringify({files:rows.length,renames:rows.filter(r=>r.old!==r.next).length,sample:rows.slice(0,5)},null,2));}
module.exports={slug,plan};
