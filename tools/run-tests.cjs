const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
require('./build-public-dist.cjs').build();
const results=[];
for(const file of fs.readdirSync(path.join(root,'tests')).filter(name=>name.endsWith('-regression.cjs')).sort()){
 const result=cp.spawnSync(process.execPath,[path.join(root,'tests',file)],{cwd:root,encoding:'utf8',timeout:60000});
 const passed=result.status===0;
 results.push({file,passed,...(!passed?{details:(result.stderr||result.stdout||String(result.error)).slice(-4000)}:{})});
 console.log(`${passed?'PASS':'FAIL'} ${file}`);
 if(!passed)console.error(results.at(-1).details);
}
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
const report={createdAt:new Date().toISOString(),passed:results.filter(item=>item.passed).length,failed:results.filter(item=>!item.passed).map(item=>item.file),results};
fs.writeFileSync(path.join(root,'reports/regression-status.json'),JSON.stringify(report,null,2)+'\n');
console.log(`${report.passed}/${results.length} JavaScript regression suites passed. Browser/device/Lighthouse QA is separate.`);
if(report.failed.length)process.exitCode=1;
