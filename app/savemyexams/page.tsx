'use client';
import { useMemo, useState } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import PDFReader from '@/app/components/PDFReader';
import rawMap from './map.json';
import { cleanNoteTitle, orderNotes, noteGroup } from '@/lib/note-catalog';

type Note = { name:string;path:string;size:number;subject:string;folders:string[] };
function collect(node:any,subject:string,folders:string[]=[]):Note[]{
  return [...(node.files||[]).map((n:any)=>({...n,subject,folders})),...Object.entries(node).filter(([key])=>key!=='files').flatMap(([key,value])=>collect(value,subject,[...folders,key]))];
}
const notes=orderNotes(Object.entries(rawMap).flatMap(([subject,node])=>collect(node,subject)));
const subjects=Object.keys(rawMap).sort();
const title=cleanNoteTitle;
const pdfUrl=(path:string)=>`https://worlddebatecollective-prep.web.app/${path.split('/').map(encodeURIComponent).join('/')}`;
export default function StudyNotes(){
  const [subject,setSubject]=useState('all');
  const [query,setQuery]=useState('');
  const [topic,setTopic]=useState('all');
  const topics=useMemo(()=>Array.from(new Set(notes.filter(n=>subject==='all'||n.subject===subject).map(n=>n.folders[0]||'General'))),[subject]);
  const [selected,setSelected]=useState<Note|null>(null);
  const filtered=useMemo(()=>{
    const tokens=query.toLowerCase().replace(/[_–-]/g,' ').split(/\s+/).filter(Boolean);
    return notes.filter(n=>(subject==='all'||n.subject===subject)&&(topic==='all'||(n.folders[0]||'General')===topic)&&tokens.every(t=>`${title(n.name)} ${n.subject} ${n.folders.join(' ')}`.toLowerCase().includes(t)));
  },[subject,topic,query]);
  return <div className="notes-page">
    <header className="compact-page-heading"><div><span className="section-label">IB resources</span><h1>Study notes</h1><p>Browse {notes.length} topic guides from SaveMyExams.</p></div></header>
    <div className="notes-controls"><label className="notes-search"><Search size={17}/><span className="sr-only">Search study notes</span><input type="search" placeholder="Find a topic…" value={query} onChange={e=>setQuery(e.target.value)}/></label><label><span className="sr-only">Subject</span><select value={subject} onChange={e=>{setSubject(e.target.value);setTopic('all');}}><option value="all">All subjects</option>{subjects.map(s=><option key={s}>{s}</option>)}</select></label><label><span className="sr-only">Topic group</span><select aria-label="Topic group" value={topic} onChange={e=>setTopic(e.target.value)}><option value="all">All topics</option>{topics.map(t=><option key={t}>{t}</option>)}</select></label><span className="notes-count" role="status">{filtered.length} notes</span></div>
    <div className={`notes-workspace ${selected?'has-document':''}`}>
      <div className="notes-index" aria-label="Revision notes">{filtered.map((n,i)=><div key={n.path}>{(i===0||noteGroup(filtered[i-1])!==noteGroup(n))&&<h2 className="note-group-heading">{subject==='all'?n.subject+' · ':''}{n.folders[0]||'General'}</h2>}<button aria-pressed={selected?.path===n.path} onClick={()=>setSelected(n)}><span><strong>{title(n.name)}</strong><small>{n.folders.slice(1).join(' / ')||n.subject}</small></span><ChevronRight size={15}/></button></div>)}{!filtered.length&&<p className="empty-state">No matches. Try a broader topic or another subject.</p>}</div>
      <div className="notes-document">{selected?<><div className="notes-document-title"><span>{title(selected.name)}</span><button aria-label="Close document" onClick={()=>setSelected(null)}><X size={17}/></button></div><PDFReader src={pdfUrl(selected.path)} title={title(selected.name)}/></>:<div className="notes-document-empty"><span className="section-label">Your reading space</span><h2>Choose a topic to begin.</h2><p>The notes open here, with continuous scrolling.</p></div>}</div>
    </div>
  </div>;
}
