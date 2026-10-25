'use client';
import { useEffect, useState } from 'react';
/** Reserve the reading area and keep recovery controls available while a provider responds. */
export default function WebEmbed({src,title,video=false}:{src:string;title:string;video?:boolean}) {
 const [state,setState]=useState<'loading'|'ready'|'slow'>('loading');
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{setState('loading');const timer=setTimeout(()=>setState(s=>s==='ready'?s:'slow'),15000);return()=>clearTimeout(timer)},[src,attempt]);
 return <div className={`web-embed ${video?'web-embed-video':''}`}>
  {!video&&<div className="embed-tools"><span>{title}</span><a href={src} target="_blank" rel="noopener noreferrer">Open separately ↗</a></div>}
  {state!=='ready'&&<div className="embed-status" role="status">{state==='slow'?'This is taking longer than expected.':'Loading…'} {state==='slow'&&<><button onClick={()=>setAttempt(n=>n+1)}>Retry</button><a href={src} target="_blank" rel="noopener noreferrer">Open separately ↗</a></>}</div>}
  <iframe key={`${src}-${attempt}`} src={src} title={title} onLoad={()=>setState('ready')} onError={()=>setState('slow')} referrerPolicy="strict-origin-when-cross-origin" allow={video?'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen':undefined} allowFullScreen={video}/>
 </div>;
}
