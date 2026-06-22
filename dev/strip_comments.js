/* Entfernt Kommentare aus dem <script>-Block von index.html – string-, regex- und
   kommentar-bewusst (echter Tokenizer). Behalten werden nur Section-Header-Blöcke,
   die "=====" enthalten (die sparsamen strukturellen Hinweise). Schreibt index.html.
   Danach UNBEDINGT die Verify-Suite + Fuzzer laufen lassen. */
const fs=require('fs'),path=require('path');
const FILE=path.join(__dirname,'..','index.html');
const html=fs.readFileSync(FILE,'utf8');
const m=html.match(/<script>([\s\S]*?)<\/script>/);
const src=m[1];

const KW=new Set(['return','typeof','instanceof','in','of','new','delete','void','throw','case','do','else','yield','await']);
function strip(src){
  let out='',i=0;const n=src.length;let last='';
  const prevWord=()=>{let j=out.length;while(j>0&&/[A-Za-z0-9_$]/.test(out[j-1]))j--;return out.slice(j);};
  while(i<n){
    const c=src[i],d=src[i+1];
    if(c==='"'||c==="'"||c==='`'){const q=c;out+=c;i++;
      while(i<n){const ch=src[i];out+=ch;i++;if(ch==='\\'){if(i<n){out+=src[i];i++;}continue}if(ch===q)break;}
      last=q;continue;}
    if(c==='/'&&d==='/'){i+=2;while(i<n&&src[i]!=='\n')i++;continue;}
    if(c==='/'&&d==='*'){let j=i+2;while(j<n&&!(src[j]==='*'&&src[j+1]==='/'))j++;const body=src.slice(i,j+2);i=j+2;
      if(/=====/.test(body)){out+=body;last='/';}else{out+=' ';}continue;}
    if(c==='/'){
      let isRe;
      if(last==='')isRe=true;
      else if('([{,;:=+-*/%&|^!~<>?'.includes(last))isRe=true;
      else if(/[A-Za-z0-9_$)\]]/.test(last))isRe=KW.has(prevWord());
      else isRe=false;
      if(isRe){out+=c;i++;let inClass=false;
        while(i<n){const ch=src[i];out+=ch;i++;if(ch==='\\'){if(i<n){out+=src[i];i++;}continue}
          if(ch==='[')inClass=true;else if(ch===']')inClass=false;else if(ch==='/'&&!inClass)break;else if(ch==='\n')break;}
        while(i<n&&/[a-z]/i.test(src[i])){out+=src[i];i++;}
        last='/';continue;}
      out+=c;i++;last='/';continue;
    }
    out+=c;i++;if(!/\s/.test(c))last=c;
  }
  // mehrfache Leerzeilen zusammenfassen (durch entfernte Kommentarzeilen)
  return out.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n');
}
const stripped=strip(src);
const before=(src.match(/^\s*\/\//gm)||[]).length;
const out=html.slice(0,m.index)+'<script>'+stripped+'</script>'+html.slice(m.index+m[0].length);
fs.writeFileSync(FILE,out,'utf8');
console.log('Script vorher:',src.length,'Zeichen -> nachher:',stripped.length,'(', (src.length-stripped.length),'entfernt )');
