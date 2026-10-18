// Publish only dish photo mappings; never copy the full backup or customer data.
const fs = require('node:fs');
const path = require('node:path');
const directory = process.argv[2];
if (!directory) throw new Error('Supply the extracted photo directory');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'photo-manifest.json'), 'utf8'));
const output = path.join(root, 'assets', 'menu-uploads', '2026-10-15');
fs.mkdirSync(output, {recursive:true});
const photos = {};
for (const record of manifest.records) {
  if (!/^[\w-]+$/.test(record.id)) throw new Error('Invalid ID');
  if (record.kind === 'no-photo') photos[record.id] = '';
  else if (record.kind === 'uploaded-photo') {
    if (!/^[\w-]+\.(jpg|png|webp)$/.test(record.file)) throw new Error('Invalid file');
    fs.copyFileSync(path.join(directory, record.file), path.join(output, record.file), fs.constants.COPYFILE_EXCL);
    photos[record.id] = `assets/menu-uploads/2026-10-15/${record.file}`;
  } else if (typeof record.source === 'string' && record.source.startsWith('assets/menu-images/') && !record.source.includes('..')) {
    if (!fs.existsSync(path.join(root,record.source))) throw new Error(`Missing original for ${record.id}`);
    photos[record.id] = record.source;
  }
}
fs.writeFileSync(path.join(root,'data','menu-photos.js'), '// Owner-selected photos, exported 2026-10-15. Originals preserved.\nwindow.HOTEL_PREMIER_PHOTOS = ' + JSON.stringify(photos,null,2) + ';\n', {flag:'wx'});
console.log(`Prepared ${Object.keys(photos).length} photo mappings; no prices, credentials or guest data included.`);
