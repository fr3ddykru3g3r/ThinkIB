'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import PongPopup from './PongPopup';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { label: 'Directory', href: '/' },
  { label: 'SAT Prep', href: '/sat' },
  { label: 'Flashcards', href: '/flashcards' },
  { label: 'Syllabus & RV', href: '/syllabus-tracker' },
  { label: 'IA Vault', href: '/exemplars' },
  { label: 'SaveMyExams', href: '/savemyexams' },
  { label: 'InThinking', href: '/thinkib' },
  { label: 'Past Papers', href: '/past-papers' },
  { label: 'Math Mocks', href: '/math-mocks' },
  { label: 'Forum', href: '/forum' },
];

export default function HeaderNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header
      className="site-header"
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--panel)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%'
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
          gap: '0.75rem'
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
              color: 'var(--ink, #1c1c1e)',
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            THE ARCHIVE
          </Link>
        </div>

        {/* Center / Right: Desktop Navigation */}
        <nav
          className="desktop-nav"
          aria-label="Main Navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            flexWrap: 'wrap'
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
                  fontSize: '0.82rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--rust, #b84a39)' : 'var(--muted, #767679)',
                  background: active ? 'rgba(184, 74, 57, 0.08)' : 'transparent',
                  textDecoration: 'none',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action / Mobile Toggle */}
        <div
          className="header-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
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
              borderRadius: '6px',
              padding: '0.35rem',
              color: 'var(--ink)',
              cursor: 'pointer'
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
            background: 'var(--panel)',
            borderTop: '1px solid var(--border)',
            padding: '0.75rem 1.25rem 1.25rem'
          }}
        >
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
                    color: active ? 'var(--rust)' : 'var(--ink)',
                    background: active ? 'rgba(184, 74, 57, 0.08)' : 'transparent',
                    textDecoration: 'none'
                  }}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
