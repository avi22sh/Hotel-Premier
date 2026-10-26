const fs=require('node:fs'),crypto=require('node:crypto');
function extract(source,styles,{admin=false}={}) {
 return source.replace(/<[A-Za-z][\w-]*(?:\s+(?:"[^"]*"|'[^']*'|[^'">])*)?>/g,tag=>{
  const match=tag.match(/\sstyle="([^"]*)"/);if(!match||match[1].includes('${')||match[1].includes('\\'))return tag;
  let css=match[1];
  if(admin)css=css.replace(/(^|;)\s*(color|background(?:-color)?|border(?:-(?:top|right|bottom|left))?(?:-color)?)\s*:\s*([^;]+)/gi,(all,separator,property,value)=>{
   const color=value.match(/#[a-f\d]{3,8}\b/i);if(!color)return all;
   const token=property.toLowerCase()==='color'?'--text':property.toLowerCase().startsWith('background')?'--surface':'--border';
   return separator+property+':'+value.replace(color[0],`var(${token})`);
  });
  const name='hp-inline-'+crypto.createHash('sha256').update(css).digest('hex').slice(0,12);styles.set(name,css);
  let result=tag.replace(match[0],'');
  if(/\sclass="[^"]*"/.test(result))result=result.replace(/(\sclass=")([^"]*)(")/,(_,a,b,c)=>a+b+' '+name+c);
  else result=result.replace(/^(<[A-Za-z][\w-]*)/,'$1 class="'+name+'"');
  return result;
 });
}
function migrate(){
 const styles=new Map();
 for(const file of ['index.html','admin.html','admin.js','app.js','asset-pipeline.js']){
  const source=fs.readFileSync(file,'utf8');fs.writeFileSync(file,extract(source,styles,{admin:file==='admin.js'}));
 }
 const target='inline-styles.css';
 const previous=fs.existsSync(target)?fs.readFileSync(target,'utf8').replace(/^\/\*[\s\S]*?\*\/\s*@layer premier-inline \{\n/,'').replace(/\n\}\s*$/,''):'';
 fs.writeFileSync(target,'/* Static inline presentation extracted from templates. Stateful geometry remains in JS. */\n@layer premier-inline {\n'+previous+'\n'+[...styles].map(([name,css])=>'.'+name+' { '+css+' }').join('\n')+'\n}\n');
 console.log(`Extracted ${styles.size} distinct static styles into theme-aware CSS.`);
}
if(require.main===module){if(!process.argv.includes('--apply'))throw Error('Use --apply to migrate static template attributes.');migrate();}
module.exports={extract};
