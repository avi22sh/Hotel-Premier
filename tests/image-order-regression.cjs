const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
let exported;
const document = {
  readyState: 'loading', addEventListener() {},
  createElement() {
    const canvas = { width: 0, height: 0 };
    let pixels;
    canvas.getContext = () => ({
      drawImage() { pixels = new Uint8ClampedArray(canvas.width * canvas.height * 4); for(let i=0;i<pixels.length;i+=4) pixels.set([50,100,180,128],i); }, save() {}, restore() {}, fillRect() {}, clearRect() {}, strokeRect() {}, translate() {}, scale() {}, rotate() {}, transform() {},
      getImageData() { return { data: pixels || new Uint8ClampedArray(canvas.width * canvas.height * 4).fill(128) }; },
      createImageData(w, h) { return { data: new Uint8ClampedArray(w * h * 4) }; },
      putImageData(data) { pixels = data.data; }
    });
    canvas.toDataURL = () => { exported = { width: canvas.width, height: canvas.height, pixels }; return 'data:image/jpeg;base64,preview'; };
    return canvas;
  }
};
const context = vm.createContext({ window: {}, document, console, URL, Uint8ClampedArray });
vm.runInContext(fs.readFileSync(path.join(root, 'asset-pipeline.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8') + ';window.App = HotelPremierApp;', context);
(async () => {
  const pipeline = context.window.AssetPipeline;
  let externalCalls = 0;
  context.fetch = () => { externalCalls++; throw Error('Unexpected network request'); };
  await assert.rejects(() => pipeline.callCloudAIEnhancer('photo', {}, 'test-key'), /Cloud image generation is disabled/);
  assert.equal(externalCalls, 0, 'Disabled cloud adapter must never send photos or keys');
  pipeline.analyzeDishAndImageQuality = async () => ({ category: 'curry', qualityScore: 80, flags: [] });
  pipeline.loadImage = async () => ({ naturalWidth: 8, naturalHeight: 12 });
  const original = await pipeline.processAutomaticStudioEnhancement('original.jpg', {}, { backgroundMode: 'original' });
  assert.equal(original.enhancedDataUrl, 'original.jpg');
  const natural = await pipeline.processAutomaticStudioEnhancement('original.jpg');
  assert.equal(natural.status, 'natural');
  assert.equal(exported.width, 8);
  assert.equal(exported.height, 12);
  assert.equal(exported.pixels[3], 128, 'Sharpening must preserve border alpha');
  assert.deepEqual(Array.from(exported.pixels.slice(0,4)),[50,100,180,128], 'Default processing must preserve foreground RGB');
  await pipeline.processAutomaticStudioEnhancement('original.jpg', {}, {enhanceColors:true,brightness:1,contrast:1,saturation:1,warmth:0,sharpness:0});
  assert.deepEqual(Array.from(exported.pixels.slice(0,4)),[50,100,180,128], 'Neutral controls must preserve independent blue channel');
  pipeline.processIsolatedAsset = async () => 'isolated.png';
  pipeline.drawSurfaceBackdrop = () => {};
  pipeline.drawRealisticContactShadow = () => {};
  for (const backgroundMode of ['slate_gold','cream_marble','cutout']) {
    await pipeline.processAutomaticStudioEnhancement('original.jpg', {}, {backgroundMode,targetWidth:8,targetHeight:12});
    assert.deepEqual(Array.from(exported.pixels.slice(0,4)),[50,100,180,128], `${backgroundMode} must not apply a color grade`);
  }
  context.window.HOTEL_STORAGE = { getAISettings: async () => ({ defaultStyle: 'cream_marble' }) };
  assert.equal((await pipeline.processAutomaticStudioEnhancement('original.jpg')).surfaceKey, 'cream_marble');
  assert.equal((await pipeline.processAutomaticStudioEnhancement('original.jpg', {}, { surfaceKey: 'teak_wood' })).surfaceKey, 'teak_wood');
  assert.equal((await pipeline.processAutomaticStudioEnhancement('original.jpg', {}, { surfaceKey: 'invalid' })).surfaceKey, 'slate_gold');
  pipeline.loadImage = async () => ({ naturalWidth: 100, naturalHeight: 3000 });
  await pipeline.processAutomaticStudioEnhancement('portrait.jpg');
  assert.equal(exported.height, 1440);
  assert.equal(exported.width, 48);
  pipeline.loadImage = async () => { throw Error('Network error'); };
  await assert.rejects(() => pipeline.processAutomaticStudioEnhancement('broken.jpg'), /Unable to load/);
  const app = Object.create(context.window.App.prototype);
  assert.match(app.getDeliveryUrl('zomato'), /hotel-premier-bhusawal-locality\/order$/);
  assert.match(app.getDeliveryUrl('swiggy'), /rest165366$/);
  assert.equal(app.getDeliveryUrl('zomato', { zomatoOrderUrl: 'https://www.zomato.com/example-item' }), 'https://www.zomato.com/example-item');
  assert.equal(app.getDeliveryUrl('swiggy', { swiggyOrderUrl: 'https://swiggy.com.evil.example/item' }), app.getDeliveryUrl('swiggy'));
  console.log('PASS: original preservation, natural framing, portrait bounds, border pixels, load failures and delivery routing');
})().catch(error => { console.error(error); process.exitCode = 1; });
