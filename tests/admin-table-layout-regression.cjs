const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={console,window:{app:{categories:[{id:'c',name:'Section'}]}},document:{readyState:'loading',addEventListener(){}}};
vm.runInNewContext(fs.readFileSync('admin.js','utf8')+';window.Admin=HotelPremierAdmin;',c);
const admin=Object.create(c.window.Admin.prototype),row=admin.generateDishTableRows([{id:'id',name:'<bad name>',description:'<script>bad</script>',price:80,categoryId:'c',image:'',tags:[]}]);
assert.equal((row.match(/<td>/g)||[]).length,4);assert.doesNotMatch(row,/<script>|<bad name>/);assert.match(row,/&lt;bad name&gt;/);assert.match(row,/Section/);assert.match(row,/moveDish\(&quot;id&quot;,'up'\)/);assert.match(row,/moveDish\(&quot;id&quot;,'down'\)/);
assert.match(row,/Manage item/);assert.match(row,/Hide from menu/);assert.match(row,/Sold out/);
const source=fs.readFileSync('admin.js','utf8');assert.match(source,/contentContainer\.scrollTop=0/);assert.match(source,/aria-label="Search menu items"/);
console.log('PASS: four-column admin table, safe text rendering, real category names, correct reorder actions and tab scroll reset');
