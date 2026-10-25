'use client';
import {resourceMatches} from '@/lib/paper-search';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { resourceUrl } from '@/lib/resource-url';
import { resourcesData } from './resources/data';
import { isWdc, siteBrand } from '@/lib/site-brand';

const workspaces = [
  ['IB past papers','Papers, mark schemes, and topic packs.','/past-papers'],
  ['Digital SAT','Practice tests, focused drills, and answer review.','/sat'],
  ['AMC 12','Lessons, worked solutions, and timed mock papers.','/amc12'],
  ['Subject library','Course guides, exercises, and reference material.','/thinkib'],
];
export default function PortalHome() {
  const [query,setQuery]=useState('');
  const [subject,setSubject]=useState('All subjects');
  const subjects=useMemo(()=>['All subjects',...Array.from(new Set(resourcesData.map(r=>r.subject))).sort()],[]);
  const filtered=useMemo(()=>resourcesData.filter(r=>(subject==='All subjects'||r.subject===subject)&&resourceMatches(`${r.name} ${r.subject} ${r.description}`,query)),[query,subject]);
  return <div className="study-home">
    <section className="study-intro"><div><span className="section-label">{isWdc?'A World Debate Collective project':'Your study library'}</span><h1>{siteBrand.name}</h1><p>{siteBrand.description}</p><div className="intro-links"><Link href="/past-papers" className="btn btn-ref-primary">Find a paper →</Link><Link href="/sat#history" className="text-link">Review your practice →</Link></div></div><aside><span className="section-label">Start with a task</span><p>Find the topic you’re studying. Try a few questions. Review what you missed.</p>{isWdc && <a href="https://www.worlddebatecollective.org/" className="text-link">Back to WDC ↗</a>}</aside></section>
    <section className="workspace-links" aria-label="Study workspaces">{workspaces.map(([title,desc,url],i)=><Link key={url} href={url}><span className="section-label">0{i+1}</span><h2>{title} <span aria-hidden="true">↗</span></h2><p>{desc}</p></Link>)}</section>
    <section className="library-section" aria-labelledby="library-title"><div className="library-heading"><div><span className="section-label">The resource shelf</span><h2 id="library-title">Notes, guides, and useful links.</h2></div><div className="library-controls"><label><span className="sr-only">Search resources</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the library…"/></label><label><span className="sr-only">Subject</span><select value={subject} onChange={e=>setSubject(e.target.value)}>{subjects.map(s=><option key={s}>{s}</option>)}</select></label></div></div><p className="result-count" role="status">{filtered.length} resources</p><div className="resource-shelf">{filtered.map((r,i)=><a key={`${r.url}-${i}`} href={resourceUrl(r.url)} target={r.url.startsWith('http')?'_blank':undefined} rel={r.url.startsWith('http')?'noopener noreferrer':undefined}><span className="section-label">{r.subject}</span><h3>{r.name} <span aria-hidden="true">↗</span></h3><p>{r.description}</p>{r.meta&&<small>{r.meta}</small>}</a>)}</div>{!filtered.length&&<p className="empty-state">No resources match. Try another topic or reset the subject filter.</p>}</section>
    <nav className="secondary-resources" aria-label="More resources"><Link href="/thinkib">Subject library →</Link><Link href="/savemyexams">Study notes →</Link><Link href="/math-mocks">Math mocks →</Link><Link href="/flashcards">Flashcards →</Link><Link href="/exemplars">Exemplars →</Link></nav>
  </div>;
}
