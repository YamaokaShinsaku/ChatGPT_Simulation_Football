const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),docs=path.join(root,'docs');
const ctx=vm.createContext({console});for(const name of ['data.js','historical-data.js','engine.js'])vm.runInContext(fs.readFileSync(path.join(docs,name),'utf8'),ctx,{filename:name});
const fixtures=vm.runInContext('HISTORICAL_FIXTURES',ctx);assert.equal(fixtures.length,192);assert.equal(new Set(fixtures.map(f=>f.id)).size,192);
for(const [year,count] of [[2023,59],[2024,70],[2025,63]]){
 const data=JSON.parse(fs.readFileSync(path.join(docs,`data/fixtures-${year}-${String(year+1).slice(-2)}.json`),'utf8'));
 assert.equal(data.metadata.matchCount,count);const fsYear=fixtures.filter(f=>f.season===year);assert.equal(fsYear.length,count);assert.equal(JSON.stringify(fsYear),JSON.stringify(data.fixtures));
 assert.deepEqual(Array.from(fsYear.filter(f=>f.competition==='La Liga').map(f=>f.round)).sort((a,b)=>a-b),Array.from({length:38},(_,i)=>i+1));
 for(const f of fsYear){assert.equal(f.team,'club');assert.equal(f.sourceKind,'user-alternate-history');assert(!('goals' in f));assert.equal(f.locked,false);assert.equal(new Date(f.date).toISOString().slice(0,10),f.date);if(year!==2023)assert(f.venueUnknown);}
}
assert.equal(fixtures.filter(f=>f.season===2024&&f.competition==='FIFA Club World Cup').length,7);
assert.equal(fixtures.find(f=>f.season===2024&&f.date==='2025-07-13').opponent,'チェルシー');
assert.equal(fixtures.find(f=>f.season===2025&&f.opponent==='グアダラハラ').date,'2025-12-23');
assert.equal(fixtures.filter(f=>f.season===2023&&f.competition==='Supercopa').length,2);
let randomSeed=3;ctx.random=()=>{randomSeed=(randomSeed*1664525+1013904223)>>>0;return randomSeed/4294967296;};
for(let i=0;i<192;i++){ctx.index=i;const r=vm.runInContext("simulate(HISTORICAL_FIXTURES[index],{minutes:'75',style:'balanced',flair:'1'},random)",ctx);assert.equal(r.teams[0].possession+r.teams[1].possession,100);assert.equal(r.players.reduce((s,p)=>s+p.minutes,0),990);assert.equal(r.players.reduce((s,p)=>s+p.goals,0),r.teams[0].goals);for(const t of r.teams){assert(t.goals<=t.on&&t.on<=t.shots);}}
const html=fs.readFileSync(path.join(docs,'index.html'),'utf8');for(const [,asset]of html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css))"/g)){assert(!asset.startsWith('/'),'Pages assets must be relative');assert(fs.existsSync(path.join(docs,asset)));}
for(const name of fs.readdirSync(docs).filter(n=>n.endsWith('.js')))new vm.Script(fs.readFileSync(path.join(docs,name),'utf8'),{filename:name});
assert(fs.existsSync(path.join(docs,'.nojekyll')));
console.log('PASS: 192 fixture records; per-season counts and 38 rounds; IF date; 7 club World Cup games; no invented scores/venues; engine invariants; Pages-relative assets and JS syntax.');
