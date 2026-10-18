// Extract an exported menu backup without changing the live menu or originals.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const [backupPath, outputDir] = process.argv.slice(2);
if (!backupPath || !outputDir) throw new Error('Usage: node extract-photo-backup.cjs backup.json output-directory');
const root = path.resolve(__dirname, '..');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
if (backup.app !== 'Hotel Premier Bhusawal' || !backup.dishOverrides) throw new Error('Not a Premier photo backup');
const context = {window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'data/menu-data.js'), 'utf8'), context);
const names = new Map(context.window.HOTEL_PREMIER_INITIAL_MENU.map(d => [d.id, d.name]));
fs.mkdirSync(outputDir, {recursive:true});
const records = [];
for (const [id, record] of Object.entries(backup.dishOverrides)) {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Invalid dish ID');
  const src = record.image;
  let kind = src === '' ? 'no-photo' : 'existing-reference';
  let file = null;
  const match = typeof src === 'string' && src.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=\r\n]+)$/);
  if (match) {
    kind = 'uploaded-photo';
    file = `${id}.${match[1] === 'jpeg' ? 'jpg' : match[1]}`;
    fs.writeFileSync(path.join(outputDir,file), Buffer.from(match[2], 'base64'), {flag:'wx'});
  } else if (typeof src === 'string' && src.startsWith('data:')) {
    throw new Error(`Unsupported uploaded photo for ${id}`);
  }
  records.push({id, name:names.get(id) || id, kind, file, source:match ? undefined : src});
}
fs.writeFileSync(path.join(outputDir, 'photo-manifest.json'), JSON.stringify({backupDate:backup.timestamp, records}, null, 2), {flag:'wx'});
console.log(JSON.stringify({total:records.length, uploads:records.filter(r=>r.kind==='uploaded-photo').length, noPhoto:records.filter(r=>r.kind==='no-photo').length, outputDir}));
