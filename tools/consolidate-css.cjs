// One-time source migration. Preserve selector/order/media scope while separating legacy priority rules.
const fs=require('node:fs');
function splitTop(text,delimiter) {
 const result=[];let start=0,quote='',depth=0,comment=false;
 for(let i=0;i<text.length;i++){
  const c=text[i],next=text[i+1];
  if(comment){if(c==='*'&&next==='/'){comment=false;i++;}continue;}
  if(quote){if(c==='\\')i++;else if(c===quote)quote='';continue;}
  if(c==='/'&&next==='*'){comment=true;i++;continue;}
  if(c==='"'||c==="'"){quote=c;continue;}
  if(c==='('||c==='[')depth++;else if(c===')'||c===']')depth--;
  if(c===delimiter&&!depth){result.push(text.slice(start,i+1));start=i+1;}
 }
 if(start<text.length)result.push(text.slice(start));return result;
}
function partition(source) {
 let normal='',priority='',i=0;
 while(i<source.length){
  const start=i;let quote='',comment=false,open=-1;
  for(;i<source.length;i++){
   const c=source[i],next=source[i+1];
   if(comment){if(c==='*'&&next==='/'){comment=false;i++;}continue;}
   if(quote){if(c==='\\')i++;else if(c===quote)quote='';continue;}
   if(c==='/'&&next==='*'){comment=true;i++;continue;}
   if(c==='"'||c==="'"){quote=c;continue;}
   if(c==='{'){open=i++;break;}
  }
  if(open<0){normal+=source.slice(start);break;}
  const header=source.slice(start,open);let depth=1;const bodyStart=i;quote='';comment=false;
  for(;i<source.length;i++){
   const c=source[i],next=source[i+1];
   if(comment){if(c==='*'&&next==='/'){comment=false;i++;}continue;}
   if(quote){if(c==='\\')i++;else if(c===quote)quote='';continue;}
   if(c==='/'&&next==='*'){comment=true;i++;continue;}
   if(c==='"'||c==="'"){quote=c;continue;}
   if(c==='{')depth++;else if(c==='}'&&--depth===0)break;
  }
  if(depth)throw Error('Unbalanced CSS source.');
  const body=source.slice(bodyStart,i++),clean=header.replace(/\/\*[\s\S]*?\*\//g,'').trim();
  if(/^@(?:media|supports|container|layer|(?:-webkit-)?keyframes)\b/.test(clean)){
   const nested=partition(body);if(nested.normal.trim())normal+=header+'{'+nested.normal+'}';if(nested.priority.trim())priority+=header+'{'+nested.priority+'}';
  }else{
   const ordinary=[],important=[];
   for(const declaration of splitTop(body,';')){
    if(/!important\b/i.test(declaration))important.push(declaration.replace(/!important\b/gi,''));else ordinary.push(declaration);
   }
   if(ordinary.join('').trim())normal+=header+'{'+ordinary.join('')+'}';
   if(important.join('').trim())priority+=header+'{'+important.join('')+'}';
  }
 }
 return {normal,priority};
}
function migrate(file){const css=fs.readFileSync(file,'utf8');if(css.startsWith('/* Consolidated cascade'))throw Error('CSS is already consolidated.');const parts=partition(css);fs.writeFileSync(file,'/* Consolidated cascade: component styles, extracted inline styles, then legacy priority rules. */\n@layer premier-base, premier-inline, premier-priority;\n@layer premier-base {\n'+parts.normal+'\n}\n@layer premier-priority {\n'+parts.priority+'\n}\n');}
if(require.main===module){if(!process.argv.includes('--apply'))throw Error('Use --apply for the one-time migration.');for(const file of ['styles.css','royal.css'])migrate(file);}
module.exports={partition,splitTop};
