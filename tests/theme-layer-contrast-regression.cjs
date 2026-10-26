const fs=require('node:fs'),assert=require('node:assert/strict');
const {partition}=require('../tools/consolidate-css.cjs');
const fixture='@media(max-width:600px){.x{color:red!important;background:url("a;b}");}@supports(display:grid){#x{height:12px!important;display:grid;}}}';
const parts=partition(fixture);assert.ok(parts.normal.includes('url("a;b}")'));assert.ok(parts.normal.includes('display:grid'));assert.ok(parts.priority.includes('@supports'));assert.ok(parts.priority.includes('height:12px'));assert.doesNotMatch(parts.priority,/!important/);
const files=['styles.css','royal.css','inline-styles.css','local-admin.css','overlays.css','theme-tokens.css'];
assert.ok(files.reduce((sum,file)=>sum+(fs.readFileSync(file,'utf8').match(/!important/g)||[]).length,0)<50);
for(const file of ['styles.css','royal.css'])assert.match(fs.readFileSync(file,'utf8'),/@layer premier-base, premier-inline, premier-priority;/);
const css=fs.readFileSync('theme-tokens.css','utf8');
function luminance(hex){const rgb=hex.replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
for(const [name,block,bg] of [['light',css.split('body.theme-dark')[0],'#faf7f0'],['dark',css.split('body.theme-dark')[1].split('}')[0],'#18202c']]) {
 for(const token of ['text','muted','accent','danger']){const value=block.match(new RegExp('--'+token+':(#[a-f0-9]{6})'))?.[1];assert.ok(value,token);assert.ok(contrast(value,bg)>=4.5,`${name} ${token}: ${contrast(value,bg)}`);}
 const border=block.match(/--border:(#[a-f0-9]{6})/)[1];assert.ok(contrast(border,bg)>=3);
}
assert.match(fs.readFileSync('overlays.css','utf8'),/prefers-reduced-motion/);
assert.match(css,/:focus-visible/);
console.log('PASS: nested cascade partition, fewer than 50 priority escapes, semantic text/accent/error AA pairs and visible focus tokens (not a full rendered-page contrast audit)');
