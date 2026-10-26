// Plain-data boundary for local imports and owner-edited photo records.
// Rich HTML is never accepted as menu/slide text.
(() => {
 'use strict';
 function validate(value,key='',depth=0) {
  if(depth>15)throw Error('The imported data is nested too deeply.');
  if(typeof value==='string') {
   if(value.length>30*1024*1024)throw Error('A photo or text field is too large.');
   if(/\bon[a-z]+\s*=|javascript\s*:/i.test(value))throw Error('Executable content is not allowed in imported data.');
   const image=/^(?:image|url|rawOriginalImage|enhancedMasterImage)$/i.test(key)||/^(?:assets\/|https:\/\/|blob:|data:image\/)/.test(value);
   if(image && value) {
    if(/^data:image\/(?:jpeg|png|webp|avif|gif);base64,[A-Za-z0-9+/]*={0,2}$/.test(value))return value;
    if(!/^(?:assets\/|https:\/\/|blob:)/.test(value)||/[<>"'`\u0000-\u001f]/.test(value))throw Error('Use a local photo, a safe HTTPS address, or an uploaded image.');
   }else if(/[<>]/.test(value))throw Error('Use plain text without HTML markup.');
   if(/^(?:name|title|subtitle|badge|badgeText|tagText)$/i.test(key)&&/"/.test(value))throw Error('Use plain text without double quotation marks in names and banner labels.');
   if(/^(?:id|categoryId|groupedUnder)$/i.test(key)&&value&&!/^[A-Za-z0-9_-]{1,100}$/.test(value))throw Error('An item identifier is invalid.');
   return value;
  }
  if(typeof Blob!=='undefined'&&value instanceof Blob)return value;
  if(Array.isArray(value)){if(value.length>10000)throw Error('Too many imported entries.');for(const item of value)validate(item,typeof item==='string'&&(/^(?:images|ac-super-deluxe|ac-deluxe-queen|ac-deluxe-twin)$/.test(key))?'image':key,depth+1);}
  else if(value&&typeof value==='object')for(const [name,item]of Object.entries(value)){
   if(['__proto__','prototype','constructor'].includes(name))throw Error('Unsafe data key.');
   validate(item,name,depth+1);
  }
  return value;
 }
 const api=Object.freeze({validate});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else window.HotelDataValidation=api;
})();
