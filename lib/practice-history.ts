'use client';
import type { SATQuestion } from './sat-types';
export interface ReviewQuestion {
  id: string; prompt: string; choices: string[]; answer: string; correctAnswer: string;
  correct: boolean; explanation: string; topic?: string; seconds?: number; unscored?: boolean; sat?: SATQuestion;
}
export interface PracticeSession {
  id: string; createdAt: string; kind: 'sat-exam' | 'sat-drill' | 'amc'; title: string;
  score?: number; maxScore?: number; correct: number; total: number;
  questions: ReviewQuestion[];
}
const DB='study-practice-history';
const FALLBACK='study_practice_sessions_v1';
export function makeSessionId(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`session-${Date.now()}-${Math.random().toString(36).slice(2)}`;}
function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{
  const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('sessions',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
});}
export async function saveSession(session:PracticeSession):Promise<void>{
  try{const db=await database();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('sessions','readwrite');tx.objectStore('sessions').put(session);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});db.close();}
  catch{const list=JSON.parse(localStorage.getItem(FALLBACK)||'[]') as PracticeSession[];localStorage.setItem(FALLBACK,JSON.stringify([session,...list.filter(x=>x.id!==session.id)]));}
  window.dispatchEvent(new Event('practice-history-updated'));
}
export async function readSessions():Promise<PracticeSession[]>{
  let stored:PracticeSession[]=[];
  try{const db=await database();stored=await new Promise((resolve,reject)=>{const r=db.transaction('sessions').objectStore('sessions').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});db.close();}catch{}
  try{const fallback=JSON.parse(localStorage.getItem(FALLBACK)||'[]');if(Array.isArray(fallback))stored.push(...fallback);}catch{}
  return Array.from(new Map(stored.map(s=>[s.id,s])).values()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}
export function validateSession(value:unknown):value is PracticeSession{
  const s=value as PracticeSession;
  return !!s&&typeof s.id==='string'&&s.id.length<200&&typeof s.title==='string'&&s.title.length<500&&typeof s.createdAt==='string'&&!Number.isNaN(Date.parse(s.createdAt))&&['sat-exam','sat-drill','amc'].includes(s.kind)&&Number.isFinite(s.correct)&&Number.isFinite(s.total)&&s.correct>=0&&s.total>=s.correct&&Array.isArray(s.questions)&&s.questions.length<=200&&s.questions.every(q=>q&&typeof q.id==='string'&&typeof q.prompt==='string'&&typeof q.answer==='string'&&typeof q.correctAnswer==='string'&&typeof q.explanation==='string'&&typeof q.correct==='boolean'&&Array.isArray(q.choices)&&q.choices.length<=10&&q.choices.every(c=>typeof c==='string'));
}
