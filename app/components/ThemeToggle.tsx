'use client';
import {useEffect,useState} from 'react';
import {Sun,Moon} from 'lucide-react';
export default function ThemeToggle(){
 const [dark,setDark]=useState(false);
 const [mounted,setMounted]=useState(false);
 useEffect(()=>{let saved:string|null=null;try{saved=localStorage.getItem('thinkib_theme');}catch{}
  const preferred=saved==='dark'||(!saved&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  setDark(preferred);document.documentElement.toggleAttribute('data-theme',preferred);
  if(preferred)document.documentElement.setAttribute('data-theme','dark');
  setMounted(true);
  const update=(event:Event)=>setDark((event as CustomEvent).detail==='dark');window.addEventListener('theme-change',update);return()=>window.removeEventListener('theme-change',update);
 },[]);
 const toggle=()=>{const next=!dark;setDark(next);if(next)document.documentElement.setAttribute('data-theme','dark');else document.documentElement.removeAttribute('data-theme');try{localStorage.setItem('thinkib_theme',next?'dark':'light');}catch{}};
 if(!mounted)return <span style={{width:36,height:36}}/>;
 return <button type="button" onClick={toggle} aria-label={dark?'Switch to light theme':'Switch to dark theme'} title={dark?'Light theme':'Dark theme'} style={{display:'flex',alignItems:'center',justifyContent:'center',width:36,height:36,border:'1px solid var(--border)',borderRadius:7,background:'var(--surface)',color:'var(--ink)',cursor:'pointer'}}>{dark?<Sun size={17}/>:<Moon size={17}/>}</button>;
}
