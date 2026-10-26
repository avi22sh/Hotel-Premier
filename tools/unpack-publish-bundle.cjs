// Stage for review; never overwrite project data or publish automatically.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function unpack(input) {
 const file=path.resolve(input),root=path.resolve(__dirname,'..'),output=path.join(root,'publish-import');
 if(fs.statSync(file).size>250*1024*1024)throw Error('Bundle exceeds 250 MB.');
 const bundle=JSON.parse(fs.readFileSync(file,'utf8'));
 if(bundle.format!=='hotel-premier-public-bundle'||bundle.version!==1||bundle.overrides?.version!==1||!Array.isArray(bundle.images))throw Error('Invalid publish bundle.');
 require('../data-validation.js').validate(bundle.overrides);
 if(fs.existsSync(output))throw Error('publish-import already exists. Review or move it before importing another bundle.');
 const images=bundle.images.map(image=>{
  if(!/^assets\/menu-uploads\/published-[a-f0-9]{24}\.(?:webp|jpg|png|avif)$/.test(image.path)||!/^[a-f0-9]{64}$/.test(image.sha256)||typeof image.base64!=='string'||!/^[A-Za-z0-9+/]*={0,2}$/.test(image.base64))throw Error('Unsafe image entry.');
  const bytes=Buffer.from(image.base64,'base64');
  if(bytes.length>20*1024*1024||crypto.createHash('sha256').update(bytes).digest('hex')!==image.sha256||!image.path.includes(image.sha256.slice(0,24)))throw Error('Photo bytes do not match the bundle digest.');
  return {...image,bytes};
 });
 fs.mkdirSync(path.join(output,'assets/menu-uploads'),{recursive:true});fs.mkdirSync(path.join(output,'data'));
 for(const image of images)fs.writeFileSync(path.join(output,image.path),image.bytes,{flag:'wx'});
 fs.writeFileSync(path.join(output,'data/published-overrides.js'),'// Owner-exported public overrides. Review before committing.\nwindow.HOTEL_PREMIER_PUBLISHED_OVERRIDES = '+JSON.stringify(bundle.overrides,null,2)+';\n',{flag:'wx'});
 console.log(`Staged ${images.length} images and public overrides in publish-import. Review before copying or committing.`);
 return output;
}
if(require.main===module){if(!process.argv[2])throw Error('Supply the exported publish-bundle JSON path.');unpack(process.argv[2]);}
module.exports={unpack};
