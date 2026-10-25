export type StudyNote = {name:string;path:string;size:number;subject:string;folders:string[]};
export function cleanNoteTitle(value:string):string {
 let text=value.normalize('NFC').replace(/\.pdf$/i,'').replace(/[_–-]+/g,' ').replace(/\s+/g,' ').trim();
 text=text.replace(/l['’]h(?:ã|a)[^\s)]*pital(?:['’]s)?/gi,'L’Hôpital’s').replace(/\b3d\b/gi,'3D').replace(/\bmaclaurin\b/gi,'Maclaurin');
 return text.replace(/^(\d+(?:\.\d+)*\s+)?([a-z])/,(_,n,c)=>(n||'')+c.toUpperCase());
}
const collator=new Intl.Collator('en',{numeric:true,sensitivity:'base'});
export function orderNotes(notes:StudyNote[]):StudyNote[]{return [...notes].sort((a,b)=>collator.compare(a.subject,b.subject)||collator.compare(a.folders.join('/'),b.folders.join('/'))||collator.compare(a.name,b.name));}
export function noteGroup(note:StudyNote):string {return note.subject+' / '+(note.folders[0]||'General');}
