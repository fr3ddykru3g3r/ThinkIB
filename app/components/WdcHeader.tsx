'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './CommandPalette';
import { isWdc, siteBrand } from '@/lib/site-brand';

const primary = [['Past papers','/past-papers'],['SAT','/sat'],['AMC 12','/amc12'],['History','/history']];
const resources = [['Study notes','/savemyexams'],['Subject library','/thinkib'],['Math mocks','/math-mocks'],['Flashcards','/flashcards'],['Exemplars','/exemplars'],['Forum','/forum']];
export default function HeaderNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  const link = ([label,href]:string[]) => <Link key={href} href={href} aria-current={path.startsWith(href) ? 'page' : undefined}>{label}</Link>;
  return <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="learn-header">
      <div className="learn-header-inner">
        <Link href="/" className="learn-brand">{isWdc && <img src="/wdc-mark.png" alt="" width="32" height="32" />}<span>{siteBrand.name}<small>{isWdc ? 'World Debate Collective' : 'A student study library'}</small></span></Link>
        <nav className="learn-desktop" aria-label="Main navigation">{primary.map(link)}<details className="resource-menu"><summary>Resources</summary><div>{resources.map(link)}</div></details></nav>
        <div className="learn-actions"><button aria-label="Search resources" onClick={()=>window.dispatchEvent(new CustomEvent('open-command-palette'))}><Search size={17}/></button><ThemeToggle/><button className="learn-menu-button" aria-expanded={open} aria-controls="mobile-nav" aria-label={open?'Close navigation':'Open navigation'} onClick={()=>setOpen(!open)}>{open?<X size={20}/>:<Menu size={20}/>}</button></div>
      </div>
      {open && <nav id="mobile-nav" className="learn-mobile" aria-label="Mobile navigation">{[...primary,...resources].map(link)}</nav>}
    </header>
    <CommandPalette/>
  </>;
}
