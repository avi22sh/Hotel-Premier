'use strict';
self.onmessage = async event => {
  let bitmap;
  try {
    const { file, crop, maxDimension = 1600 } = event.data;
    bitmap = await createImageBitmap(file, { imageOrientation:'from-image' });
    const scale=Math.min(1,Math.min(1600,maxDimension)/Math.max(crop.width,crop.height));
    const canvas=new OffscreenCanvas(Math.max(1,Math.round(crop.width*scale)),Math.max(1,Math.round(crop.height*scale)));
    self.postMessage({progress:'Optimizing photo…'});
    canvas.getContext('2d').drawImage(bitmap,crop.x,crop.y,crop.width,crop.height,0,0,canvas.width,canvas.height);
    let blob=await canvas.convertToBlob({type:'image/webp',quality:.88});
    if(blob.type!=='image/webp') {
      // JPEG fallback has a neutral matte rather than unpredictable transparent-to-black conversion.
      const context=canvas.getContext('2d');context.globalCompositeOperation='destination-over';context.fillStyle='#eee8de';context.fillRect(0,0,canvas.width,canvas.height);context.globalCompositeOperation='source-over';
      blob=await canvas.convertToBlob({type:'image/jpeg',quality:.88});
    }
    self.postMessage({blob,width:canvas.width,height:canvas.height});
  } catch (_) { self.postMessage({error:'The photo could not be optimized. Try a JPG, PNG or WebP under 20 MB.'}); }
  finally { bitmap?.close(); }
};
