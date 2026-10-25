'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './CommandPalette';

const primary = [['Papers','/past-papers'],['SAT','/sat'],['AMC 12','/amc12']];
const resources = [['Study notes','/savemyexams'],['Subject library','/thinkib'],['Math mocks','/math-mocks'],['Flashcards','/flashcards'],['Exemplars','/exemplars'],['Forum','/forum']];
export default function WdcHeader() {
  const path = usePathname();
  const [mobile, setMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const close = () => { setMobile(false); setExpanded(false); };
  useEffect(close, [path]);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node)) setExpanded(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, []);
  const link = ([label,href]:string[]) => <Link key={href} onClick={close} href={href} aria-current={path.startsWith(href) ? 'page' : undefined}>{label}</Link>;
  return <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="learn-header"><div className="learn-header-inner">
      <Link href="/" onClick={close} className="learn-brand"><img src="/wdc-mark.png" alt="" width="28" height="28"/><span>WDC <strong>Learn</strong></span></Link>
      <nav className="learn-desktop" aria-label="Study navigation">{primary.map(link)}
        <div ref={menu} className="resource-menu" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setExpanded(false);}}>
          <button className="resource-trigger" aria-expanded={expanded} aria-controls="resource-links" onClick={()=>setExpanded(v=>!v)}>Resources <ChevronDown size={13}/></button>
          {expanded&&<div id="resource-links">{resources.map(link)}</div>}
        </div>
      </nav>
      <nav className="ecosystem-links" aria-label="World Debate Collective"><a href="https://www.worlddebatecollective.org/">WDC ↗</a><a href="https://schl.worlddebatecollective.org/">Opportunities ↗</a></nav>
      <div className="learn-actions"><button aria-label="Search resources" onClick={()=>{close();window.dispatchEvent(new CustomEvent('open-command-palette'));}}><Search size={17}/></button><ThemeToggle/><button className="learn-menu-button" aria-expanded={mobile} aria-controls="mobile-nav" aria-label={mobile?'Close navigation':'Open navigation'} onClick={()=>{setMobile(!mobile);setExpanded(false);}}>{mobile?<X size={19}/>:<Menu size={19}/>}</button></div>
    </div>{mobile&&<nav id="mobile-nav" className="learn-mobile" aria-label="Study navigation">{[...primary,...resources].map(link)}</nav>}</header>
    <CommandPalette/>
  </>;
}
