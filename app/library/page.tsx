'use client';
import {Suspense} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import guides from '@/data/english-guides.json';
import PDFReader from '@/app/components/PDFReader';
function EnglishLibrary(){
 const params=useSearchParams();const selected=guides.find(g=>g.id===params.get('doc'));
 return <div><header className="compact-page-heading"><div><span className="section-label">IB English Guys</span><h1>English study guides</h1><p>Written papers, course texts and the Individual Oral.</p></div></header><div className="guide-library"><nav aria-label="English guides">{guides.map(g=><Link key={g.id} href={'/library?doc='+g.id} aria-current={selected?.id===g.id?'page':undefined}>{g.name}<small>{g.meta}</small></Link>)}</nav><div className="guide-reader">{selected?<PDFReader key={selected.id} src={selected.pdfUrl} title={selected.name}/>:<div className="guide-empty"><h2>Choose a guide.</h2><p>PDFs open here with continuous scrolling. Only the pages you read are loaded.</p></div>}</div></div></div>;
}
export default function Page(){return <Suspense fallback={<p>Loading library…</p>}><EnglishLibrary/></Suspense>}
