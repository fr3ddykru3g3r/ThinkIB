'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { readSessions, saveSession, validateSession, type PracticeSession } from '@/lib/practice-history';
import { getExamHistory, type ExamHistoryEntry } from '@/lib/sat-storage';
import MathView from './MathView';
import QuestionBody from './sat/QuestionBody';
import { Rationale } from './sat/SATContent';

const transferable=['sat_exam_history_v1','sat_mistake_vault_v1','sat_skill_stats_v1','sat_seen_ids_v1','thinkib:amc12-progress'];
export default function PracticeHistory({scope='all',embedded=false}:{scope?:'all'|'sat'|'amc';embedded?:boolean}){
  const [sessions,setSessions]=useState<PracticeSession[]>([]);
  const [legacy,setLegacy]=useState<ExamHistoryEntry[]>([]);
  const [kind,setKind]=useState('all');
  const [selected,setSelected]=useState<PracticeSession|null>(null);
  const [wrongOnly,setWrongOnly]=useState(false);
  const [status,setStatus]=useState('');
  const [loading,setLoading]=useState(true);
  const refresh=async()=>{try{const rows=await readSessions();setSessions(rows);setLegacy(getExamHistory().filter(e=>!rows.some(s=>s.id===e.reviewSessionId)));}catch{setStatus('This browser could not read saved practice.');}finally{setLoading(false);}};
  useEffect(()=>{void refresh();const update=()=>void refresh();window.addEventListener('practice-history-updated',update);return()=>window.removeEventListener('practice-history-updated',update);},[]);
  async function download(){try{
    const local=Object.fromEntries(transferable.map(key=>[key,localStorage.getItem(key)]).filter(([,v])=>v!==null));
    const blob=new Blob([JSON.stringify({format:'study-history-v1',exportedAt:new Date().toISOString(),sessions:await readSessions(),local},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`study-history-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('Backup downloaded. You can import this file on the other site.');
  }catch{setStatus('The backup could not be created. Your saved history has not been changed.');}}
  async function restore(file?:File){if(!file)return;try{
    if(file.size>30_000_000)throw new Error('Backup is too large.');
    const data=JSON.parse(await file.text());
    if(data.format!=='study-history-v1'||!Array.isArray(data.sessions)||data.sessions.length>10000||!data.sessions.every(validateSession))throw new Error('This is not a valid study history backup.');
    const updates:Array<[string,string]>=[];
    for(const key of transferable){if(typeof data.local?.[key]!=='string')continue;const incoming=JSON.parse(data.local[key]);const current=JSON.parse(localStorage.getItem(key)||(key.endsWith('progress')?'{}':'[]'));
      if(key==='thinkib:amc12-progress'){if(!incoming||Array.isArray(incoming)||typeof incoming!=='object'||Object.values(incoming).some(v=>v!=='correct'&&v!=='wrong'))throw new Error('Invalid progress data.');updates.push([key,JSON.stringify({...incoming,...current})]);}
      else {if(!Array.isArray(incoming)||incoming.some(v=>key==='sat_seen_ids_v1'?typeof v!=='string':!v||typeof v!=='object'))throw new Error('Invalid saved practice data.');
        const id=(v:any)=>key==='sat_seen_ids_v1'?v:key==='sat_skill_stats_v1'?`${v.section}|${v.domain}|${v.skill}`:v.id||v.questionId;
        const merged=Array.from(new Map([...incoming,...(Array.isArray(current)?current:[])].map(v=>[id(v),v])).values());
        if(key==='sat_exam_history_v1')merged.sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
        updates.push([key,JSON.stringify(merged)]);}}
    for(const s of data.sessions)await saveSession(s);
    for(const [key,value] of updates)localStorage.setItem(key,value);
    await refresh();setStatus(`Imported ${data.sessions.length} saved sessions. Existing sessions were kept.`);
  }catch(e){setStatus(e instanceof Error?e.message:'The backup could not be imported.');}}
  useEffect(()=>{if(selected){const heading=document.getElementById('review-heading');heading?.focus({preventScroll:true});heading?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}},[selected]);
  const filtered=sessions.filter(s=>(scope==='all'||(scope==='sat'?s.kind.startsWith('sat-'):s.kind==='amc'))&&(kind==='all'||s.kind===kind));
  const filters=scope==='sat'?[['all','All SAT practice'],['sat-exam','Tests'],['sat-drill','Drills']]:scope==='amc'?[['all','AMC practice']]:[['all','All practice'],['sat-exam','SAT tests'],['sat-drill','SAT drills'],['amc','AMC 12']];
  return <div className={`history-page ${embedded?'history-embedded':''}`}><header className="page-heading">{embedded?<h2>Previous practice</h2>:<><span className="section-label">Your practice</span><h1>Practice history</h1></>}<p>Review your answers from completed tests and drills.</p><details className="history-backup"><summary>Manage saved practice</summary><p>Saved in this browser. Export a backup to move your history to another device or site.</p><div className="history-tools"><button className="btn btn-ref-outline" onClick={download}>Export backup</button><label className="btn btn-ref-outline">Import backup<input className="sr-only" type="file" accept="application/json,.json" onChange={e=>{void restore(e.target.files?.[0]);e.target.value='';}}/></label></div></details>{status&&<p role="status" className="history-status">{status}</p>}</header>
    <div className="history-filters" role="group" aria-label="Filter history">{filters.map(([value,label])=><button key={value} aria-pressed={kind===value} onClick={()=>setKind(value)}>{label}</button>)}</div>
    {loading?<p role="status">Loading saved practice…</p>:!filtered.length?<div className="empty-state"><h2>No saved sessions here yet.</h2><p>Newly completed tests and checked drills appear here. Older SAT scores are listed below if this browser has them.</p><Link href="/sat/practice">Start SAT practice →</Link>{scope!=='sat'&&<Link href="/amc12">Study AMC 12 →</Link>}</div>:<div className="history-list">{filtered.map(s=><button key={s.id} onClick={()=>{setSelected(s);setWrongOnly(false);}} aria-label={`Review ${s.title}, ${new Date(s.createdAt).toLocaleString()}`}><div><small>{new Date(s.createdAt).toLocaleString()}</small><strong>{s.title}</strong><span>{s.correct}/{s.total} correct{typeof s.score==='number'?` · ${s.score}/${s.maxScore}${s.kind==='sat-exam'?' estimated':''}`:''}</span></div><span>Review →</span></button>)}</div>}
    {legacy.length>0&&(kind==='all'||kind==='sat-exam')&&<details className="legacy-history"><summary>Earlier SAT score summaries ({legacy.length})</summary><p>These scores were saved before question-by-question history was added. Their original questions and answers were not recorded, so they cannot be reconstructed.</p><div className="table-scroll"><table><thead><tr><th>Date</th><th>Estimate</th><th>Reading & writing</th><th>Math</th></tr></thead><tbody>{legacy.map(e=><tr key={e.id}><td>{e.date}</td><td>{e.totalScore}</td><td>{e.rwScore} · {e.rwCorrect}/{e.totalRW}</td><td>{e.mathScore} · {e.mathCorrect}/{e.totalMath}</td></tr>)}</tbody></table></div></details>}
    {selected&&<section className="saved-review" aria-labelledby="review-heading"><div className="review-heading"><div><span className="section-label">Saved review</span><h2 id="review-heading" tabIndex={-1}>{selected.title}</h2><p>{new Date(selected.createdAt).toLocaleString()} · {selected.correct}/{selected.total} correct</p></div><button className="btn btn-ref-outline" onClick={()=>setSelected(null)}>Close review</button></div><label className="review-filter"><input type="checkbox" checked={wrongOnly} onChange={e=>setWrongOnly(e.target.checked)}/> Incorrect and omitted only</label>{selected.questions.filter(q=>!wrongOnly||!q.correct).map((q,i)=><article key={`${q.id}-${i}`} className="review-question"><div className="review-question-meta"><strong>Question {selected.questions.indexOf(q)+1}</strong><span>{q.unscored?'Unscored item · ':''}{q.correct?'Correct':q.answer?'Incorrect':'Omitted'}{q.topic?` · ${q.topic}`:''}</span></div>{q.sat?<QuestionBody q={q.sat} answer={q.answer} onAnswer={()=>{}} reveal struck={{}} onStrike={()=>{}} split={false}/>:<><MathView content={q.prompt} block escapeHtml currency={false}/><ol type="A">{q.choices.map((choice,j)=><li key={j}><MathView content={choice} escapeHtml currency={false}/></li>)}</ol></>}<p className="answer-comparison">Your answer: <strong>{q.answer||'Omitted'}</strong> · Correct answer: <strong>{q.correctAnswer}</strong></p>{q.sat?<Rationale q={q.sat}/>:<details><summary>Worked solution</summary><MathView content={q.explanation} block escapeHtml currency={false}/></details>}</article>)}{wrongOnly&&selected.questions.every(q=>q.correct)&&<p>No incorrect answers in this session.</p>}</section>}
  </div>;
}
