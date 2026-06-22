const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let body=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function ctx(){const g={addColorStop(){}};return new Proxy({canvas:{width:1280,height:800}},{get:(t,p)=>p in t?t[p]:(p==='createRadialGradient'||p==='createLinearGradient')?()=>g:(p==='measureText')?()=>({width:8}):(p==='getImageData'||p==='createImageData')?()=>({data:new Uint8ClampedArray(4)}):()=>{},set:(t,p,v)=>{t[p]=v;return true}});}
function el(tag){const e={tagName:(tag||'div').toUpperCase(),width:300,height:150,value:'',checked:false,textContent:'',title:'',_html:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){},contains(){return true}},addEventListener(){},removeEventListener(){},appendChild(c){return c},removeChild(c){return c},remove(){},insertBefore(c){return c},setAttribute(){},removeAttribute(){},getAttribute(){return null},focus(){},blur(){},click(){},closest(){return null},getBoundingClientRect(){return{left:0,top:0,right:100,bottom:100,width:100,height:100}},getContext(){return ctx()},querySelector(){return el('div')},querySelectorAll(){return[]},requestFullscreen(){},webkitRequestFullscreen(){}};Object.defineProperty(e,'innerHTML',{get(){return e._html},set(v){e._html=String(v)}});Object.defineProperty(e,'firstChild',{get(){return null}});return e;}
const cache={},doc={documentElement:el('html'),body:el('body'),head:el('head'),fullscreenElement:null,createElement:t=>el(t),createElementNS:()=>el('svg'),createTextNode:()=>el('text'),getElementById:id=>cache['#'+id]||(cache['#'+id]=el('div')),querySelector:s=>cache[s]||(cache[s]=el('div')),querySelectorAll:()=>[],addEventListener(){},removeEventListener(){},exitFullscreen(){},webkitExitFullscreen(){}};
let pt=0;const ls={},lsm={getItem:k=>k in ls?ls[k]:null,setItem:(k,v)=>{ls[k]=String(v)},removeItem:k=>{delete ls[k]},clear(){for(const k in ls)delete ls[k]}};
const GL={window:globalThis,self:globalThis,document:doc,localStorage:lsm,innerWidth:1280,innerHeight:800,devicePixelRatio:1,performance:{now:()=>(pt+=16.7)},requestAnimationFrame:()=>1,cancelAnimationFrame(){},addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}),navigator:{userAgent:'node',hardwareConcurrency:4,language:'de'},screen:{width:1280,height:800},alert(){},confirm:()=>true,prompt:()=>'',Image:function(){return el('img')},OffscreenCanvas:function(w,h){const c=el('canvas');c.width=w;c.height=h;return c},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){}};
for(const k in GL)try{globalThis[k]=GL[k]}catch(e){Object.defineProperty(globalThis,k,{value:GL[k],configurable:true,writable:true})}
body+=`\n;globalThis.__U={setLang,openCodex,openUps,openStats,renderMega,renderCargo,showProdTip,SOL,openMega,openCargo,G};`;
new Function(body)();
const U=globalThis.__U;
U.G().station[U.SOL]={}; // Station setzen, damit der Routenplaner einen gültigen Start hat
const errs=[];
function run(name,fn){try{fn()}catch(e){errs.push(name+': '+e.message)}}
for(const lang of ['en','de']){
  U.setLang(lang);
  run(lang+' openCodex',()=>U.openCodex());
  run(lang+' openUps',()=>U.openUps());
  run(lang+' openStats',()=>U.openStats());
  run(lang+' openMega',()=>U.openMega());
  run(lang+' openCargo',()=>U.openCargo(U.SOL));
  run(lang+' showProdTip',()=>U.showProdTip({clientX:10,clientY:10},'eisen'));
}
if(errs.length){console.log('✗ UI-FEHLER:');errs.forEach(e=>console.log('  '+e));process.exit(1);}
console.log('✓ UI-Funktionen laufen in EN+DE ohne Fehler (Kodex/Ausbau/Statistik/Mega/Cargo/Tooltip)');
process.exit(0);
