(() => {
 'use strict';
 const owned=new Set();
 const originals=new Map();
 const makeURL=blob=>{const url=URL.createObjectURL(blob);owned.add(url);return url;};
 function release(url) { originals.delete(url);if(owned.delete(url))URL.revokeObjectURL(url); }
 function validate(file) {
  if(!file || !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size<=0 || file.size>20*1024*1024)throw Error('Choose a JPG, PNG or WebP photo smaller than 20 MB.');
 }
 function cropDialog(bitmap,aspect,signal) {
  return new Promise((resolve,reject)=>{
   const dialog=document.createElement('dialog');dialog.className='photo-crop-dialog';dialog.setAttribute('aria-label','Frame your photo');
   const title=document.createElement('h2');title.textContent='Frame your photo';
   const hint=document.createElement('p');hint.textContent='Check that the whole dish or room fits. The untouched original is kept for reverting.';
   const canvas=document.createElement('canvas');canvas.width=800;canvas.height=Math.round(800/aspect);canvas.setAttribute('aria-label','Live crop preview');
   let rect;
   const fields={};
   const controls=document.createElement('div');controls.className='photo-crop-controls';
   const fitLabel=document.createElement('label'),fit=document.createElement('input');fit.type='checkbox';fit.checked=true;fit.addEventListener('change',draw);fitLabel.append(fit,document.createTextNode('Keep the entire photo, with transparent margins where needed'));controls.append(fitLabel);
   for(const [name,label,min,max,value]of[['zoom','Zoom',1,2,1],['x','Horizontal position',0,100,50],['y','Vertical position',0,100,50]]) {
    const wrap=document.createElement('label');wrap.textContent=label;
    const input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.step=name==='zoom'?'.01':'1';input.value=value;input.setAttribute('aria-label',label);input.addEventListener('input',draw);fields[name]=input;wrap.append(input);controls.append(wrap);
   }
   function draw(){
    const width=(fit.checked?Math.max(bitmap.width,bitmap.height*aspect):Math.min(bitmap.width,bitmap.height*aspect))/Number(fields.zoom.value),height=width/aspect;
    rect={x:(bitmap.width-width)*Number(fields.x.value)/100,y:(bitmap.height-height)*Number(fields.y.value)/100,width,height};
    const context=canvas.getContext('2d');context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,rect.x,rect.y,width,height,0,0,canvas.width,canvas.height);
   }
   const actions=document.createElement('div');actions.className='photo-crop-actions';
   let finished=false;
   const finish=value=>{if(finished)return;finished=true;signal?.removeEventListener('abort',abort);dialog.close();dialog.remove();value?resolve(value):reject(new DOMException('Photo selection cancelled.','AbortError'));};
   const abort=()=>finish(null);
   for(const [label,action]of[['Cancel',abort],['Use this framing',()=>finish(rect)]]){const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',action);actions.append(button);}
   dialog.addEventListener('cancel',event=>{event.preventDefault();abort();});dialog.addEventListener('close',()=>{if(!finished)abort();});
   dialog.append(title,hint,canvas,controls,actions);document.body.append(dialog);signal?.addEventListener('abort',abort,{once:true});dialog.showModal();draw();
  });
 }
 async function optimize(file,crop,options) {
  if(typeof Worker!=='undefined' && typeof OffscreenCanvas!=='undefined') {
   return new Promise((resolve,reject)=>{
    const worker=new Worker('photo-worker.js?v=22.27');
    const cleanup=()=>{clearTimeout(timer);options.signal?.removeEventListener('abort',abort);worker.terminate();};
    const abort=()=>{cleanup();reject(new DOMException('Photo selection cancelled.','AbortError'));};
    const timer=setTimeout(()=>{cleanup();reject(Error('Photo optimization took too long. Try a smaller photo.'));},90000);
    options.signal?.addEventListener('abort',abort,{once:true});
    worker.onmessage=event=>{if(event.data.progress){options.onProgress?.(event.data.progress);return;}cleanup();event.data.error?reject(Error(event.data.error)):resolve(event.data);};
    worker.onerror=()=>{cleanup();reject(Error('Photo worker could not start. Reload and retry.'));};
    worker.postMessage({file,crop,maxDimension:Math.min(1600,options.maxDimension||1600)});
   });
  }
  // Older Safari: asynchronous decoding/encoding, with one bounded drawing operation.
  const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
  try {
   const scale=Math.min(1,Math.min(1600,options.maxDimension||1600)/Math.max(crop.width,crop.height));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(crop.width*scale));canvas.height=Math.max(1,Math.round(crop.height*scale));
   canvas.getContext('2d').drawImage(bitmap,crop.x,crop.y,crop.width,crop.height,0,0,canvas.width,canvas.height);
   let blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.88));
   if(blob?.type!=='image/webp') {
    const context=canvas.getContext('2d');context.globalCompositeOperation='destination-over';context.fillStyle='#eee8de';context.fillRect(0,0,canvas.width,canvas.height);context.globalCompositeOperation='source-over';
    blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.88));
   }
   if(!blob)throw Error('This browser could not encode the photo.');
   return {blob,width:canvas.width,height:canvas.height};
  } finally { bitmap.close(); }
 }
 async function ingest(file,options={}) {
  validate(file);if(options.signal?.aborted)throw new DOMException('Cancelled','AbortError');
  options.onProgress?.('Reading photo orientation…');
  if(typeof createImageBitmap!=='function')throw Error('Photo editing needs an up-to-date browser with image decoding support.');
  const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
  let crop;
  try {
   if(bitmap.width*bitmap.height>60e6)throw Error('This photo has too many pixels. Export a smaller version and retry.');
   crop=options.crop===false?{x:0,y:0,width:bitmap.width,height:bitmap.height}:await cropDialog(bitmap,options.aspect||4/3,options.signal);
  } finally { bitmap.close(); }
  const result=await optimize(file,crop,options);
  if(options.signal?.aborted)throw new DOMException('Cancelled','AbortError');
  const workingUrl=makeURL(result.blob);originals.set(workingUrl,file);
  return {...result,originalUrl:makeURL(file),workingUrl};
 }
 document.addEventListener('dragover',event=>{if(event.target.closest?.('#image-replace-modal'))event.preventDefault();});
 document.addEventListener('drop',event=>{
  if(!event.target.closest?.('#image-replace-modal'))return;event.preventDefault();
  if(event.dataTransfer.files.length===1) {
   const admin=window.admin,input={files:event.dataTransfer.files};
   if(admin?.activeImageDishId)admin.handleImageFileUpload(input);
   else if(admin?.activeRoomId)admin.handleRoomImageUpload(input);
   else admin?.handleHeroSlideUpload(input);
  }
 });
 window.addEventListener('pagehide',event=>{if(!event.persisted)for(const url of [...owned])release(url);});
 async function optimizeForPublish(blob) {
  validate(blob);const bitmap=await createImageBitmap(blob,{imageOrientation:'from-image'});
  const width=bitmap.width,height=bitmap.height;bitmap.close();
  if(Math.max(width,height)<=1600&&['image/webp','image/jpeg'].includes(blob.type))return blob;
  return (await optimize(blob,{x:0,y:0,width,height},{maxDimension:1600})).blob;
 }
 window.HotelPhotoWorkflow=Object.freeze({ingest,validate,release,createURL:makeURL,getOriginal:source=>originals.get(source),optimizeForPublish});
 if(typeof Worker!=='undefined'&&typeof OffscreenCanvas!=='undefined'&&window.AssetPipeline) {
  window.AssetPipeline.processAutomaticStudioEnhancement=async(source,dish={},options={})=>{
   const settings=await window.HOTEL_STORAGE?.getAISettings?.()||{};
   return new Promise((resolve,reject)=>{
    const worker=new Worker('photo-enhance-worker.js?v=22.27');
    const timer=setTimeout(()=>{worker.terminate();reject(Error('Photo enhancement took too long. Try a smaller photo.'));},90000);
    worker.onmessage=event=>{clearTimeout(timer);worker.terminate();const result=event.data;if(result.error){reject(Error(result.error));return;}const {blob,...metadata}=result;resolve({...metadata,enhancedDataUrl:makeURL(blob)});};
    worker.onerror=()=>{clearTimeout(timer);worker.terminate();reject(Error('Local photo tools could not start. Reload and retry.'));};
    worker.postMessage({source,dish:{id:dish.id,name:dish.name,categoryId:dish.categoryId},options,settings});
   });
  };
 }
})();
