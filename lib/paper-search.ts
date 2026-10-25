export type PaperRecord={name:string;path:string[]};
export type PaperFilters={subject?:string;year?:string;type?:string;level?:string};
const cachedText=new WeakMap<PaperRecord,string>();
const normalize=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function tokenMatches(token:string,text:string):boolean{
 const boundary=(s:string)=>new RegExp('(?:^| )'+s+'(?: |$)').test(text);
 if(token==='hl'||token==='sl')return boundary(token)||boundary('hlsl');
 if(token==='ms'||token==='markscheme')return /mark\s?scheme/.test(text);
 if(token==='qp')return !/mark\s?scheme|audio|listening audio/.test(text);
 if(token==='audio')return /audio|\bmp3\b/.test(text);
 if(token==='aa')return /analysis and approaches|\baa\b/.test(text);
 if(token==='ai')return /applications and interpretation|\bai\b/.test(text);
 if(token==='math'||token==='maths')return /mathematics|maths?/.test(text);
 if(token==='ess')return /environmental systems/.test(text);
 const p=token.match(/^p([123])$/);if(p)return new RegExp('paper '+p[1]+'(?: |$)').test(text);
 const session=token.match(/^([mn])(\d{2})$/);if(session)return text.includes('20'+session[2])&&text.includes(session[1]==='m'?'may':'november');
 if(/^\d+$/.test(token)||/^[a-z]$/.test(token)||/^tz\d$/.test(token))return boundary(token);
 return text.includes(token);
}
export function paperMatches(file:PaperRecord,query:string,filters:PaperFilters={}):boolean{
 let text=cachedText.get(file);if(!text){text=normalize(file.path.join(' '));cachedText.set(file,text);}
 const tokens=normalize(query.replace(/\bpaper[\s_-]*([1-3])\b/gi,'p$1')).split(' ').filter(Boolean);
 if(!tokens.every(t=>tokenMatches(t,text)))return false;
 if(filters.subject&&!normalize(filters.subject).split(' ').every(t=>tokenMatches(t,text)))return false;
 if(filters.year&&!tokenMatches(filters.year,text))return false;
 if(filters.level&&!tokenMatches(filters.level,text))return false;
 if(filters.type){
  const paper=filters.type.match(/^paper([123])$/);
  if(paper&&!new RegExp('paper '+paper[1]+'(?: |$)').test(text))return false;
  if(filters.type==='markscheme'&&!/mark\s?scheme/.test(text))return false;
  if(filters.type==='audio'&&!/\bmp3\b|listening audio/.test(text))return false;
 }
 return true;
}
export function resourceMatches(text:string,query:string):boolean{return normalize(query).split(' ').filter(Boolean).every(t=>normalize(text).includes(t));}
