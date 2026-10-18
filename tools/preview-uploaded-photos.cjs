const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.env.PREMIER_SHARP_MODULE || 'sharp');
const directory = process.argv[2];
const records = JSON.parse(fs.readFileSync(path.join(directory,'photo-manifest.json'),'utf8')).records.filter(r=>r.file);
(async()=>{
  const tiles=[];
  for (const [i, record] of records.entries()) {
    const input=await sharp(path.join(directory,record.file)).rotate().resize(240,200,{fit:'contain',background:'#d9d2c5'}).png().toBuffer();
    tiles.push({input,left:(i%4)*240,top:Math.floor(i/4)*200});
    console.log(`${i+1}. ${record.name} (${record.id})`);
  }
  await sharp({create:{width:960,height:Math.ceil(records.length/4)*200,channels:3,background:'#d9d2c5'}}).composite(tiles).png().toFile(path.join(directory,'uploaded-photo-sheet.png'));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
