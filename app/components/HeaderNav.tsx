'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Search, 
  ChevronDown, 
  Sparkles, 
  Clock, 
  Layers, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Award, 
  MessageSquare,
  GraduationCap,
  type LucideIcon
} from 'lucide-react';
import PongPopup from './PongPopup';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './CommandPalette';

interface SubNavItem {
  label: string;
  href: string;
  desc: string;
  badge: string;
  icon: LucideIcon;
}

const TEST_ENGINES: SubNavItem[] = [
  { 
    label: 'Digital SAT 2.0', 
    href: '/sat', 
    desc: '3,443 items, 4 difficulty modes & Gauntlet', 
    badge: 'Adaptive',
    icon: Clock
  },
  { 
    label: 'AMC 12 & AIME Hub', 
    href: '/amc-aime', 
    desc: 'AoPS synthesis matrix & USA(J)MO index', 
    badge: 'Contest',
    icon: Sparkles
  },
  { 
    label: 'Memory Flashcards', 
    href: '/flashcards', 
    desc: '3D active recall retrieval cards', 
    badge: 'FSRS',
    icon: Layers
  },
];

const IB_ARCHIVE: SubNavItem[] = [
  { 
    label: 'Past Papers 2010–2025', 
    href: '/past-papers', 
    desc: '3,786 official papers & markschemes with split-screen', 
    badge: 'May 2025',
    icon: FileText
  },
  { 
    label: 'SaveMyExams Notes', 
    href: '/savemyexams', 
    desc: '295 concise topic revision guides with diagrams', 
    badge: 'Notes',
    icon: BookOpen
  },
  { 
    label: 'InThinking Database', 
    href: '/thinkib', 
    desc: 'Curriculum mirrors, teacher keys & lab guides', 
    badge: 'Mirror',
    icon: GraduationCap
  },
  { 
    label: 'Math AA Mocks', 
    href: '/math-mocks', 
    desc: '61 simulated exam papers with worked solutions', 
    badge: 'Mocks',
    icon: Sparkles
  },
  { 
    label: 'IA & EE Exemplars', 
    href: '/exemplars', 
    desc: 'Grade 7 sample IAs & Grade A Extended Essays', 
    badge: '7 / A',
    icon: Award
  },
  { 
    label: 'Syllabus Tracker', 
    href: '/syllabus-tracker', 
    desc: 'Interactive mastery checklist linked to Revision Village', 
    badge: 'RV',
    icon: CheckCircle2
  },
];

export default function HeaderNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'engines' | 'archive' | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (menu: 'engines' | 'archive') => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const isTestEnginesActive = pathname.startsWith('/sat') || pathname.startsWith('/amc-aime') || pathname.startsWith('/flashcards');
  const isIBArchiveActive = pathname.startsWith('/past-papers') || 
                            pathname.startsWith('/savemyexams') || 
                            pathname.startsWith('/thinkib') || 
                            pathname.startsWith('/math-mocks') || 
                            pathname.startsWith('/exemplars') || 
                            pathname.startsWith('/syllabus-tracker');
  const isDirectoryActive = pathname === '/';
  const isForumActive = pathname.startsWith('/forum');

  return (
    <header
      className="site-header"
      style={{
        borderBottom: '1px solid var(--border)',
        background: scrolled 
          ? 'var(--surface, #ffffff)' 
          : 'rgba(250, 248, 245, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.04)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="header-container"
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0.65rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          position: 'relative',
        }}
      >
        {/* Left: Brand Masthead Logo */}
        <div className="header-brand-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Link
            href="/"
            className="header-logo"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: 'var(--font-display, Cormorant Garamond, serif)',
              fontSize: '1.35rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              color: 'var(--ink)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>THE ARCHIVE</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                padding: '0.12rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(194, 65, 12, 0.08)',
                border: '1px solid rgba(194, 65, 12, 0.2)',
              }}
            >
              STUDIO
            </span>
          </Link>
        </div>

        {/* Center: Clustered Navigation Pills (Never wraps awkwardly on 13-inch laptops) */}
        <nav
          className="desktop-nav"
          aria-label="Main Navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          {/* 1. Directory link */}
          <Link
            href="/"
            className={`nav-link ${isDirectoryActive ? 'nav-link-active' : ''}`}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.84rem',
              fontWeight: isDirectoryActive ? 600 : 500,
              color: isDirectoryActive ? 'var(--accent)' : 'var(--muted)',
              background: isDirectoryActive ? 'rgba(194, 65, 12, 0.08)' : 'transparent',
              textDecoration: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            Directory
          </Link>

          {/* 2. Test Engines Cluster Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => handleMouseEnter('engines')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'engines' ? null : 'engines')}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.84rem',
                fontWeight: isTestEnginesActive ? 600 : 500,
                color: isTestEnginesActive ? 'var(--accent)' : 'var(--muted)',
                background: isTestEnginesActive ? 'rgba(194, 65, 12, 0.08)' : 'transparent',
                border: 'none',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Test Engines</span>
              <ChevronDown 
                size={13} 
                style={{ 
                  transform: activeDropdown === 'engines' ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                  opacity: 0.7
                }} 
              />
            </button>

            {/* Test Engines Popover Menu */}
            {activeDropdown === 'engines' && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  width: '320px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '0.6rem',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04)',
                  zIndex: 110,
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                <div style={{ padding: '0.35rem 0.6rem 0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Interactive Practice Engines
                  </span>
                </div>
                {TEST_ENGINES.map((item) => {
                  const Icon = item.icon;
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.6rem 0.7rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        background: active ? 'rgba(194, 65, 12, 0.06)' : 'transparent',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-inset)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = active ? 'rgba(194, 65, 12, 0.06)' : 'transparent')}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: 'rgba(194, 65, 12, 0.08)',
                          color: 'var(--accent)',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Icon size={15} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--ink)' }}>{item.label}</span>
                          <span className="badge" style={{ fontSize: '0.64rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                            {item.badge}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: 'var(--muted)', margin: '0.15rem 0 0', lineHeight: 1.3 }}>
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. IB Archive Cluster Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => handleMouseEnter('archive')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'archive' ? null : 'archive')}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.84rem',
                fontWeight: isIBArchiveActive ? 600 : 500,
                color: isIBArchiveActive ? 'var(--accent)' : 'var(--muted)',
                background: isIBArchiveActive ? 'rgba(194, 65, 12, 0.08)' : 'transparent',
                border: 'none',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>IB Archive</span>
              <ChevronDown 
                size={13} 
                style={{ 
                  transform: activeDropdown === 'archive' ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                  opacity: 0.7
                }} 
              />
            </button>

            {/* IB Archive Popover Menu */}
            {activeDropdown === 'archive' && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  width: '360px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '0.6rem',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04)',
                  zIndex: 110,
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                <div style={{ padding: '0.35rem 0.6rem 0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Complete IB Diploma Vaults
                  </span>
                </div>
                {IB_ARCHIVE.map((item) => {
                  const Icon = item.icon;
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.55rem 0.7rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        background: active ? 'rgba(194, 65, 12, 0.06)' : 'transparent',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-inset)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = active ? 'rgba(194, 65, 12, 0.06)' : 'transparent')}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: 'rgba(194, 65, 12, 0.08)',
                          color: 'var(--accent)',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Icon size={15} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--ink)' }}>{item.label}</span>
                          <span className="badge" style={{ fontSize: '0.64rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                            {item.badge}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: 'var(--muted)', margin: '0.15rem 0 0', lineHeight: 1.3 }}>
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Forum link */}
          <Link
            href="/forum"
            className={`nav-link ${isForumActive ? 'nav-link-active' : ''}`}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.84rem',
              fontWeight: isForumActive ? 600 : 500,
              color: isForumActive ? 'var(--accent)' : 'var(--muted)',
              background: isForumActive ? 'rgba(194, 65, 12, 0.08)' : 'transparent',
              textDecoration: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            Forum
          </Link>
        </nav>

        {/* Right: Quick Utilities (⌘K Search with .kbd-badge, Arcade, Theme) */}
        <div
          className="header-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {/* Prominent ⌘K Search Trigger Button with .kbd-badge */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="header-search-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--surface-inset)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.38rem 0.65rem',
              color: 'var(--muted)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Search Archive (⌘K or Ctrl+K)"
          >
            <Search size={14} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--ink)' }}>Search</span>
            <kbd className="kbd-badge">⌘K</kbd>
          </button>

          <ThemeToggle />
          <PongPopup />

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.4rem',
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Active Route Indicator Bar */}
      <div 
        className="header-active-indicator"
        style={{
          opacity: isDirectoryActive ? 0.3 : 1,
        }}
      />

      {/* Mobile Drawer with Grouped Sections */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer"
          style={{
            background: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            padding: '1rem 1.5rem 1.75rem',
            maxHeight: 'calc(100vh - 60px)',
            overflowY: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              window.dispatchEvent(new CustomEvent('open-command-palette'));
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: '1rem',
              padding: '0.65rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--surface-inset)',
              color: 'var(--ink)',
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={15} style={{ color: 'var(--accent)' }} /> Quick Search
            </span>
            <kbd className="kbd-badge">⌘K</kbd>
          </button>

          {/* Directory Quick Link */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'block',
              padding: '0.55rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.92rem',
              fontWeight: isDirectoryActive ? 600 : 500,
              color: isDirectoryActive ? 'var(--accent)' : 'var(--ink)',
              background: isDirectoryActive ? 'rgba(194, 65, 12, 0.08)' : 'transparent',
              textDecoration: 'none',
              marginBottom: '0.75rem',
            }}
          >
            Directory Home
          </Link>

          {/* Test Engines Section */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
              Test Engines
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {TEST_ENGINES.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      fontWeight: active ? 600 : 500,
                      color: active ? 'var(--accent)' : 'var(--ink)',
                      background: active ? 'rgba(194, 65, 12, 0.08)' : 'transparent',
                      textDecoration: 'none',
                    }}
                  >
                    <span>{item.label}</span>
                    <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                      {item.badge}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* IB Archive Section */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
              IB Archive Vaults
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {IB_ARCHIVE.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      fontWeight: active ? 600 : 500,
                      color: active ? 'var(--accent)' : 'var(--ink)',
                      background: active ? 'rgba(194, 65, 12, 0.08)' : 'transparent',
                      textDecoration: 'none',
                    }}
                  >
                    <span>{item.label}</span>
                    <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                      {item.badge}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Forum */}
          <Link
            href="/forum"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'block',
              padding: '0.55rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.88rem',
              fontWeight: isForumActive ? 600 : 500,
              color: isForumActive ? 'var(--accent)' : 'var(--ink)',
              background: isForumActive ? 'rgba(194, 65, 12, 0.08)' : 'transparent',
              textDecoration: 'none',
            }}
          >
            Discussion Forum
          </Link>
        </div>
      )}

      {/* Global Command Palette */}
      <CommandPalette />
    </header>
  );
}

