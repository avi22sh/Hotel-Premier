const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.env.PREMIER_SHARP_MODULE || 'sharp');
const sourceRoot = process.argv[2];
const output = path.resolve(__dirname, '../assets/menu-uploads/approved');
const inputs = {
  'ic-10': 'exec-ac0a3946-86d1-45cc-9580-94eea53133f6.png',
  'ms-7': 'exec-e95c4fe6-5390-4e2a-a69e-834cc2c9f8db.png'
};
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  for(const [id,file] of Object.entries(inputs)) {
    for(const size of [640,1280]) {
      const target=path.join(output,`${id}-v1-${size}.webp`);
      if(fs.existsSync(target)) throw Error('Refusing to overwrite '+target);
      await sharp(path.join(sourceRoot,file)).rotate().resize(size,size,{fit:'inside',withoutEnlargement:true}).webp({quality:85}).toFile(target);
      console.log(`${id} ${size}px: ${fs.statSync(target).size} bytes`);
    }
  }
})().catch(e=>{console.error(e.message);process.exitCode=1;});
