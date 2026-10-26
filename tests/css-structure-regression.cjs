const fs=require('node:fs'),assert=require('node:assert/strict');
// Catch stray braces which can silently end a layer and discard later rules in browsers.
function structure(source){
 let depth=0,quote='',comment=false,closes=0;
 for(let i=0;i<source.length;i++){
  const c=source[i],next=source[i+1];
  if(comment){if(c==='*'&&next==='/'){comment=false;i++;}continue;}
  if(quote){if(c==='\\')i++;else if(c===quote)quote='';continue;}
  if(c==='/'&&next==='*'){comment=true;i++;continue;}
  if(c==='"'||c==="'"){quote=c;continue;}
  if(c==='{')depth++;
  if(c==='}'){depth--;assert.ok(depth>=0,'Unexpected closing CSS brace');if(depth===0)closes++;}
 }
 assert.equal(depth,0,'Unclosed CSS block');assert.equal(quote,'','Unclosed CSS string');assert.equal(comment,false,'Unclosed CSS comment');
 return closes;
}
assert.throws(()=>structure('@layer base { .x {color:red;} } }'));
assert.equal(structure('/* } */ @layer base { .x {content:"}";} }'),1);
for(const file of ['styles.css','royal.css','inline-styles.css','theme-tokens.css','overlays.css','local-admin.css']){
 const closes=structure(fs.readFileSync(file,'utf8'));
 if(file==='styles.css'||file==='royal.css')assert.equal(closes,2,file+' must retain both complete cascade-layer blocks');
}
console.log('PASS: balanced stylesheet blocks, strings/comments and intact component/priority layers');
