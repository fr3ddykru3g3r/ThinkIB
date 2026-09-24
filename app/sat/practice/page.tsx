'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Target, ArrowRight } from 'lucide-react';

export default function SATPracticeHubPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '5rem' }}>
      <Link
        href="/sat"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--muted)',
          textDecoration: 'none',
          marginBottom: '2rem',
        }}
      >
        <ArrowLeft size={14} /> Back to SAT Portal
      </Link>

      <span className="section-label">DIAGNOSTIC & DRILL ENGINE</span>
      <h1 style={{ fontSize: '2.8rem', marginBottom: '0.6rem' }}>Select Practice Mode</h1>
      <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Choose between a full-length timed diagnostic exam or targeted domain and skill drills.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Full Exam */}
        <Link href="/sat/practice/exam" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div
            className="portal-card"
            style={{
              padding: '2.5rem',
              borderColor: 'var(--rust)',
              background: 'rgba(184, 74, 57, 0.04)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="section-label" style={{ color: 'var(--rust)', margin: 0 }}>
                  TIMED SIMULATION
                </span>
                <Clock size={20} style={{ color: 'var(--rust)' }} />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>Full-Length Test Simulator</h2>
              <p style={{ color: 'var(--card-desc, #52525b)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Complete 4 modules (2 Reading/Writing + 2 Math) under strict exam timing with Desmos, formula sheets, question review, and standard 400–1600 scaled scoring.
              </p>
            </div>
            <div className="portal-card-arrow" style={{ color: 'var(--rust)', borderBottomColor: 'var(--rust)', marginTop: '2rem' }}>
              Launch Full Exam <ArrowRight size={15} style={{ display: 'inline', marginLeft: '4px' }} />
            </div>
          </div>
        </Link>

        {/* Targeted Drill */}
        <Link href="/sat/practice/drill" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div
            className="portal-card"
            style={{
              padding: '2.5rem',
              borderColor: 'var(--ink)',
              background: 'rgba(28, 28, 30, 0.02)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="section-label" style={{ color: 'var(--ink)', margin: 0 }}>
                  FOCUSED MASTERY
                </span>
                <Target size={20} style={{ color: 'var(--ink)' }} />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>Targeted Skill Practice</h2>
              <p style={{ color: 'var(--card-desc, #52525b)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Drill individual domains, specific grammar boundaries, non-linear equations, or vocabulary-in-context with instant check answer and official explanations.
              </p>
            </div>
            <div className="portal-card-arrow" style={{ marginTop: '2rem' }}>
              Start Skill Drills <ArrowRight size={15} style={{ display: 'inline', marginLeft: '4px' }} />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
