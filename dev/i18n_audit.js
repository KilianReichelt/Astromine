/* i18n-Audit (v2): belastbare Vollständigkeitskontrolle für die EN/DE-Übersetzung.
   Findet:
    (A) t("…")-Argumente OHNE TR-Eintrag  -> würden im EN-Modus deutsch erscheinen (echtes Misch-Risiko)
    (B) umlaut-/ß-haltige String-Literale, die weder TR-Schlüssel noch t()-gewrappt noch
        in STATICUI/STSEC sind            -> noch ungewrappter deutscher Text
   Ziel: beide Listen leer (bzw. nur bewusste Ausnahmen). Nicht-destruktiv.
   Aufruf: <node> dev/i18n_audit.js [datei.html]  (Default ../index.html). */
const fs=require('fs'),path=require('path');
const FILE=process.argv[2]?path.resolve(process.cwd(),process.argv[2]):path.join(__dirname,'..','index.html');
const html=fs.readFileSync(FILE,'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];

function decode(s){return s.replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)))
  .replace(/\\n/g,'\n').replace(/\\t/g,'\t').replace(/\\"/g,'"').replace(/\\'/g,"'").replace(/\\\\/g,'\\');}

// Kommentare grob entfernen (Audit ist nicht-destruktiv)
const code=script.replace(/\/\*[\s\S]*?\*\//g,' ').replace(/(^|[^:"'`\\])\/\/[^\n]*/g,'$1');

// (1) TR-Schlüssel: alle "…": (linke Seite eines Doppelpunkts)
const TRkeys=new Set();
{let m,re=/"((?:\\.|[^"\\])*)"\s*:/g;while((m=re.exec(code)))TRkeys.add(decode(m[1]));}

// (2) Bereits via applyLang abgedeckt: deutsche Strings in STATICUI[] und STSEC[]
const covered=new Set();
for(const name of ['STATICUI','STSEC']){
  const m=new RegExp('const '+name+'=\\[([\\s\\S]*?)\\];').exec(code);
  if(m){let s,re=/"((?:\\.|[^"\\])*)"/g;while((s=re.exec(m[1])))covered.add(decode(s[1]));}
}

// (3) t("…")-Literale einsammeln
const tArgs=[];{let m,re=/(?<![\w$])t\(\s*"((?:\\.|[^"\\])*)"/g;while((m=re.exec(code)))tArgs.push(decode(m[1]));}

// (4) alle String-Literale (für unwrapped-Suche)
const lits=[];for(const re of [/"((?:\\.|[^"\\])*)"/g,/'((?:\\.|[^'\\])*)'/g]){let m;while((m=re.exec(code)))lits.push(decode(m[1]));}

const UML=/[äöüÄÖÜß]/;
const tWrapped=new Set(tArgs);

// (A) t()-Argumente ohne Übersetzung
const missing=new Map();
for(const s of tArgs){ if(!TRkeys.has(s)) missing.set(s,(missing.get(s)||0)+1); }

// (B) ungewrappte deutsche Literale
const unwrapped=new Map();
for(const s of lits){
  if(!UML.test(s))continue;
  if(TRkeys.has(s)||tWrapped.has(s)||covered.has(s))continue;
  if(/^[#.][\w-]+$/.test(s))continue;
  unwrapped.set(s,(unwrapped.get(s)||0)+1);
}

const show=(t,map)=>{const l=[...map.entries()].sort((a,b)=>b[1]-a[1]);
  console.log('\n'+t+': '+map.size+' verschieden');
  for(const[s,n]of l.slice(0,60))console.log('  ['+n+'] '+(s.length>100?s.slice(0,100)+'…':s));};

console.log('===== i18n-AUDIT v2 '+path.basename(FILE)+' =====');
console.log('t("…")-Aufrufe: '+tArgs.length+' · TR-Schlüssel: '+TRkeys.size+' · STATICUI/STSEC: '+covered.size);
show('(A) t()-Argumente OHNE TR-Eintrag (Misch-Risiko EN)',missing);
show('(B) Ungewrappte deutsche Literale (Umlaut/ß)',unwrapped);
const total=missing.size+unwrapped.size;
console.log('\n>>> Offen gesamt: '+total+(total===0?'  ✓ VOLLSTÄNDIG':''));
process.exit(0);
