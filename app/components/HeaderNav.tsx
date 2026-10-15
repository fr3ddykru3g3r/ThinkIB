'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import PongPopup from './PongPopup';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './CommandPalette';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Past Papers', href: '/past-papers' },
  { label: 'Digital SAT', href: '/sat' },
  { label: 'SaveMyExams', href: '/savemyexams' },
  { label: 'InThinking', href: '/thinkib' },
  { label: 'Math Mocks', href: '/math-mocks' },
  { label: 'Flashcards', href: '/flashcards' },
  { label: 'Exemplars', href: '/exemplars' },
  { label: 'Forum', href: '/forum' },
];

export default function HeaderNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header
      className="site-header"
      style={{
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.05)' : 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div
        className="header-container"
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0.65rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        {/* Left: Brand / Logo */}
        <div className="header-brand-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            href="/"
            className="header-logo"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: 'var(--font-display, Cormorant Garamond, serif)',
              fontSize: '1.35rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--ink)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            THE ARCHIVE
          </Link>
        </div>

        {/* Center: Clean Direct Desktop Navigation */}
        <nav
          className="desktop-nav"
          aria-label="Main Navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            flexWrap: 'wrap',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? 'nav-link-active' : ''}`}
                style={{
                  fontFamily: 'var(--font-body, Plus Jakarta Sans, sans-serif)',
                  fontSize: '0.84rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--accent)' : 'var(--ink)',
                  opacity: active ? 1 : 0.85,
                  background: active ? 'rgba(194, 65, 12, 0.08)' : 'transparent',
                  textDecoration: 'none',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions (Search, Theme Toggle, Arcade, Mobile Toggle) */}
        <div
          className="header-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="header-search-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--surface-inset, rgba(0, 0, 0, 0.04))',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.35rem 0.6rem',
              color: 'var(--muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Search Archive (⌘K or Ctrl+K)"
          >
            <Search size={14} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--ink)' }}>Search</span>
            <kbd
              style={{
                fontSize: '0.66rem',
                fontFamily: 'var(--font-mono)',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
              }}
            >
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
          <PongPopup />
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.35rem',
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer"
          style={{
            background: 'var(--header-bg)',
            borderTop: '1px solid var(--border)',
            padding: '0.75rem 1.25rem 1.25rem',
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
              marginBottom: '0.75rem',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--surface-inset, rgba(0, 0, 0, 0.04))',
              color: 'var(--ink)',
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={15} style={{ color: 'var(--accent)' }} /> Quick Search
            </span>
            <kbd style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              ⌘K
            </kbd>
          </button>
          <nav className="mobile-nav-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-nav-link ${active ? 'mobile-nav-link-active' : ''}`}
                  style={{
                    display: 'block',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? 'var(--accent)' : 'var(--ink)',
                    background: active ? 'rgba(194, 65, 12, 0.08)' : 'transparent',
                    textDecoration: 'none',
                  }}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Global Command Palette Mounted Everywhere */}
      <CommandPalette />
    </header>
  );
}
