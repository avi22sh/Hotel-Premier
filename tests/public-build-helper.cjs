const fs=require('node:fs');
exports.fallbackHTML=()=>{
 const source=fs.readFileSync('index.html','utf8');
 if(!fs.existsSync('dist/404.html')||fs.readFileSync('dist/404.html','utf8')!==source) require('../tools/build-public-dist.cjs').build();
 return fs.readFileSync('dist/404.html','utf8');
};
