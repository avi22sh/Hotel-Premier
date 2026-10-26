// The same local pixel algorithm runs off the UI thread; no cloud API or credentials.
'use strict';
self.window=self;
self.document={createElement(tag){if(tag!=='canvas')throw Error('Unsupported worker operation.');return new OffscreenCanvas(1,1);}};
const bitmaps=[],urls=[];
self.HotelPhotoWorkflow={createURL(blob){const url=URL.createObjectURL(blob);urls.push(url);return url;}};
importScripts('asset-pipeline.js?v=22.19');
self.AssetPipeline.loadImage=async source=>{
 const response=await fetch(source);if(!response.ok)throw Error('Unable to load the selected photo.');
 const bitmap=await createImageBitmap(await response.blob(),{imageOrientation:'from-image'});bitmaps.push(bitmap);return bitmap;
};
self.onmessage=async event=>{
 try {
  const {source,dish,options,settings}=event.data;
  self.HOTEL_STORAGE={getAISettings:async()=>settings||{}};
  const result=await self.AssetPipeline.processAutomaticStudioEnhancement(source,dish,options);
  const photo=await fetch(result.enhancedDataUrl);if(!photo.ok)throw Error('The preview could not be encoded.');
  self.postMessage({...result,enhancedDataUrl:undefined,blob:await photo.blob()});
 }catch(error){self.postMessage({error:error.message||'Local photo enhancement failed. Your saved photo is unchanged.'});}
 finally {for(const bitmap of bitmaps)bitmap.close();for(const url of urls)URL.revokeObjectURL(url);}
};
