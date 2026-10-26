/* Remove only unreferenced, byte-identical copies with a retained counterpart.
 * No unique photographs are deleted. Dry-run unless --apply is supplied. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{if(e.isSymbolicLink())throw Error('Symlink in asset set');return e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)];});
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const relative=file=>path.relative(root,file).split(path.sep).join('/');
const bounded=relative=>{const file=path.resolve(root,relative);if(!file.startsWith(path.join(root,'assets')+path.sep))throw Error('Invalid duplicate target');return file;};
const mappingFile=path.join(root,'reports/menu-image-renames.csv');
const mapping=fs.readFileSync(mappingFile,'utf8').trim().split(/\r?\n/).slice(1).map(line=>(line.match(/"(?:[^"]|"")*"/g)||[]).map(s=>s.slice(1,-1).replaceAll('""','"')));
const tracked=new Set(execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0'));
const sources=fs.readdirSync(root).filter(f=>/\.(?:js|html|css|json)$/.test(f)).map(f=>path.join(root,f)).concat(walk(path.join(root,'data')).filter(f=>/\.(?:js|json)$/.test(f)));
const contents=sources.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const files=['assets/menu-images','assets/dishes'].flatMap(dir=>fs.existsSync(bounded(dir))?walk(bounded(dir)):[]).filter(f=>/\.(?:jpe?g|avif|jfif|png|webp)$/i.test(f));
const groups=new Map();for(const file of files){const digest=hash(file);if(!groups.has(digest))groups.set(digest,[]);groups.get(digest).push(relative(file));}
const candidates=[];
for(const [sha256,group] of groups){
 if(group.length<2)continue;
 const used=group.filter(f=>contents.includes(f));
 const keep=used[0]||group.find(f=>f.startsWith('assets/menu-images/'))||group[0];
 for(const file of group){
  if(file===keep||used.includes(file))continue;
  const original=mapping.find(row=>row[1]===file&&row[2]===sha256);
  if(!original||!tracked.has(original[0]))continue;
  candidates.push({removed:file,retained:keep,original:original[0],sha256,bytes:fs.statSync(bounded(file)).size});
 }
}
if(process.argv.includes('--apply')){
 for(const c of candidates)if(hash(bounded(c.removed))!==c.sha256||hash(bounded(c.retained))!==c.sha256)throw Error('Duplicate bytes changed; nothing should be deleted.');
 const replacements=new Map(candidates.map(c=>[c.removed,c.retained]));
 const quote=value=>'"'+value.replaceAll('"','""')+'"';
 fs.writeFileSync(mappingFile,['old_path,new_path,sha256',...mapping.map(row=>[row[0],replacements.get(row[1])||row[1],row[2]].map(quote).join(','))].join('\n')+'\n');
 fs.writeFileSync(path.join(root,'reports/pruned-image-copies.json'),JSON.stringify({recovery:'Restore the original paths from Git baseline b154ef4 or hotel-premier-qr-menu.zip. Retained copies have identical SHA-256 values.',files:candidates},null,2)+'\n');
 for(const c of candidates)fs.unlinkSync(bounded(c.removed));
 console.log(`Removed ${candidates.length} unreferenced byte-identical copies (${candidates.reduce((n,c)=>n+c.bytes,0)} bytes). Unique photographs retained; Git/ZIP recovery is documented in reports/pruned-image-copies.json.`);
}else console.log(JSON.stringify({files:candidates.length,bytes:candidates.reduce((n,c)=>n+c.bytes,0),sample:candidates.slice(0,4)},null,2));
