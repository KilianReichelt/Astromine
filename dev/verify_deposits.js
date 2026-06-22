const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let body=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function ctx(){const g={addColorStop(){}};return new Proxy({canvas:{width:1280,height:800}},{get:(t,p)=>p in t?t[p]:(p==='createRadialGradient'||p==='createLinearGradient')?()=>g:(p==='measureText')?()=>({width:8}):(p==='getImageData'||p==='createImageData')?()=>({data:new Uint8ClampedArray(4)}):()=>{},set:(t,p,v)=>{t[p]=v;return true}});}
function el(tag){const e={tagName:(tag||'div').toUpperCase(),width:300,height:150,value:'',checked:false,textContent:'',title:'',_html:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},removeEventListener(){},appendChild(c){return c},removeChild(c){return c},remove(){},insertBefore(c){return c},setAttribute(){},removeAttribute(){},getAttribute(){return null},focus(){},blur(){},click(){},closest(){return null},getBoundingClientRect(){return{left:0,top:0,right:100,bottom:100,width:100,height:100}},getContext(){return ctx()},querySelector(){return el('div')},querySelectorAll(){return[]},requestFullscreen(){},webkitRequestFullscreen(){}};Object.defineProperty(e,'innerHTML',{get(){return e._html},set(v){e._html=String(v)}});Object.defineProperty(e,'firstChild',{get(){return null}});return e;}
const cache={},doc={documentElement:el('html'),body:el('body'),head:el('head'),fullscreenElement:null,createElement:t=>el(t),createElementNS:()=>el('svg'),createTextNode:()=>el('text'),getElementById:id=>cache['#'+id]||(cache['#'+id]=el('div')),querySelector:s=>cache[s]||(cache[s]=el('div')),querySelectorAll:()=>[],addEventListener(){},removeEventListener(){},exitFullscreen(){},webkitExitFullscreen(){}};
let pt=0;const ls={},lsm={getItem:k=>k in ls?ls[k]:null,setItem:(k,v)=>{ls[k]=String(v)},removeItem:k=>{delete ls[k]},clear(){for(const k in ls)delete ls[k]}};
const GL={window:globalThis,self:globalThis,document:doc,localStorage:lsm,innerWidth:1280,innerHeight:800,devicePixelRatio:1,performance:{now:()=>(pt+=16.7)},requestAnimationFrame:()=>1,cancelAnimationFrame(){},addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}),navigator:{userAgent:'node',hardwareConcurrency:4,language:'en'},screen:{width:1280,height:800},alert(){},confirm:()=>true,prompt:()=>'',Image:function(){return el('img')},OffscreenCanvas:function(w,h){const c=el('canvas');c.width=w;c.height=h;return c},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){}};
for(const k in GL)try{globalThis[k]=GL[k]}catch(e){Object.defineProperty(globalThis,k,{value:GL[k],configurable:true,writable:true})}
body+=`\n;globalThis.__A={getSystem,SOL,NSTARS};`;
new Function(body)();
const A=globalThis.__A;
function bodies(sys){return sys.planets.concat(sys.moons||[],sys.comets||[],sys.beltBody?[sys.beltBody]:[]);}
// Sol-Abdeckung
const sol=A.getSystem(A.SOL), solRes=new Set(); let solSizes=[];
for(const b of bodies(sol)){if(b.comp){solSizes.push(b.comp.length);for(const c of b.comp)solRes.add(c[0]);}}
console.log('SOL Vorkommen-Union:', [...solRes].sort().join(', '));
console.log('SOL Ø Vorkommen/Körper:', (solSizes.reduce((a,c)=>a+c,0)/solSizes.length).toFixed(2), '(min', Math.min(...solSizes), 'max', Math.max(...solSizes)+')');
// Galaxie-Stichprobe
let sizes=[], spezial={kristall:0,seltenerd:0,exotic:0,biomasse:0,methan:0}, bodyCount=0, empty=0;
for(let i=0;i<A.NSTARS;i+=7){let sys;try{sys=A.getSystem(i)}catch(e){continue}
  for(const b of bodies(sys)){if(!b.comp)continue;bodyCount++;sizes.push(b.comp.length);if(b.comp.length===0)empty++;
    for(const c of b.comp)if(c[0] in spezial)spezial[c[0]]++;}}
const dist={1:0,2:0,3:0,4:0,5:0};sizes.forEach(s=>dist[s]=(dist[s]||0)+1);
console.log('\nGalaxie-Stichprobe ('+bodyCount+' Körper):');
console.log('  Ø Vorkommen/Körper:', (sizes.reduce((a,c)=>a+c,0)/sizes.length).toFixed(2));
console.log('  Verteilung (Anzahl Vorkommen):', JSON.stringify(dist), '| 0er:', empty);
console.log('  Spezial-Vorkommen-Anteil:', Object.fromEntries(Object.entries(spezial).map(([k,v])=>[k,(v/bodyCount*100).toFixed(1)+'%'])));
const needSol=['regolith','eisen','silikat','eis','nickel','kohlenstoff','biomasse','helium3','methan','kristall'];
const missing=needSol.filter(r=>!solRes.has(r));
console.log('\nSol deckt Bootstrap-Ressourcen ab:', missing.length===0?'JA ✓':'NEIN ✗ fehlt: '+missing.join(','));
process.exit(missing.length===0&&empty===0?0:1);
