'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  GitMerge, 
  Timer, 
  Compass, 
  Sparkles, 
  Calculator, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { getAllDomains, getAllPastProblems, getAllSynthesisRecipes } from '@/lib/amc-aime';
import MathView from '@/app/components/MathView';

export default function AMCAIMEHubPage() {
  const domains = getAllDomains();
  const problems = getAllPastProblems();
  const recipes = getAllSynthesisRecipes();

  const [amcScoreInput, setAmcScoreInput] = useState<number>(96);
  const [aimeScoreInput, setAimeScoreInput] = useState<number>(7);

  const calculatedUsamoIndex = amcScoreInput + 10 * aimeScoreInput;
  const usamoCutoffEstimate = 225;
  const usajmoCutoffEstimate = 205;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #fbfbfa)', color: 'var(--ink, #1c1c1e)', paddingBottom: '5rem' }}>
      {/* Top Hero Section */}
      <div 
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(180deg, rgba(20, 110, 180, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
          padding: '3rem 1.5rem 2.5rem',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.8rem', borderRadius: '9999px', background: 'rgba(20, 110, 180, 0.1)', color: '#0969da', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
            <Sparkles size={14} />
            MAA Contest Engine • AoPS Volumes 1 & 2 Aligned
          </div>
          <h1 
            style={{ 
              fontFamily: 'var(--font-display, Cormorant Garamond, serif)', 
              fontSize: '2.75rem', 
              fontWeight: 700, 
              lineHeight: 1.15,
              marginBottom: '0.75rem' 
            }}
          >
            AMC 12 & AIME Concept-to-Synthesis Hub
          </h1>
          <p style={{ maxWidth: '800px', fontSize: '1.1rem', color: 'var(--text-muted, #666)', lineHeight: 1.5, marginBottom: '2rem' }}>
            Master competition mathematics from fundamental trigger signals to cross-topic Olympiad synthesis. 
            Deconstruct authentic contest problems, explore multi-domain bridges, and test with official EV-aware game theory scoring.
          </p>

          {/* Quick Hub Navigation Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <Link 
              href="/amc-aime/learn/polynomials"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                background: 'var(--panel, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
              className="hover:scale-[1.01] hover:shadow-md"
            >
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(9, 105, 218, 0.1)', color: '#0969da', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <BookOpen size={20} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Anatomy Deconstructor</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #666)', lineHeight: 1.4 }}>
                  4-stage problem breakdowns: stem signal detection, synthesis bridges, progressive step-by-step KaTeX reveals, and dual solution paths.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0969da', fontWeight: 600, fontSize: '0.9rem', marginTop: '1.25rem' }}>
                Explore Curriculum <ArrowRight size={16} />
              </div>
            </Link>

            <Link 
              href="/amc-aime/synthesis"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                background: 'var(--panel, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
              className="hover:scale-[1.01] hover:shadow-md"
            >
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(130, 80, 223, 0.1)', color: '#8250df', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <GitMerge size={20} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>8×8 Synthesis Matrix</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #666)', lineHeight: 1.4 }}>
                  Interactive topic intersections. Discover the bridge identities connecting Number Theory & Logs, Geometry & Complex bash, and more.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#8250df', fontWeight: 600, fontSize: '0.9rem', marginTop: '1.25rem' }}>
                Launch Matrix <ArrowRight size={16} />
              </div>
            </Link>

            <Link 
              href="/amc-aime/simulator"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                background: 'var(--panel, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
              className="hover:scale-[1.01] hover:shadow-md"
            >
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(235, 87, 87, 0.1)', color: '#eb5757', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Timer size={20} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Contest Simulator</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #666)', lineHeight: 1.4 }}>
                  Authentic AMC 12 (75 min, +6 correct, +1.5 blank) with live EV guessing analysis, and AIME (180 min, 3-digit integers).
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#eb5757', fontWeight: 600, fontSize: '0.9rem', marginTop: '1.25rem' }}>
                Start Timed Exam <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1200px', margin: '2.5rem auto 0', padding: '0 1.5rem' }}>
        
        {/* USA(J)MO Index & Cutoff Calibration Widget */}
        <div 
          style={{
            background: 'var(--panel, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.75rem',
            marginBottom: '3rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Award size={24} color="#f59f00" />
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>USA(J)MO Index Calculator & Qualification Radar</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #666)' }}>
                  <MathView content="Official Formula: $\text{Index} = \text{AMC 12} + 10 \times \text{AIME}$" />
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: calculatedUsamoIndex >= usamoCutoffEstimate ? 'rgba(46, 160, 67, 0.1)' : 'rgba(200, 200, 200, 0.1)', color: calculatedUsamoIndex >= usamoCutoffEstimate ? '#2ea043' : 'var(--text-muted, #666)', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                USAMO Cutoff (~225): {calculatedUsamoIndex >= usamoCutoffEstimate ? 'QUALIFIED' : `-${usamoCutoffEstimate - calculatedUsamoIndex} pts`}
              </div>
              <div style={{ background: calculatedUsamoIndex >= usajmoCutoffEstimate ? 'rgba(9, 105, 218, 0.1)' : 'rgba(200, 200, 200, 0.1)', color: calculatedUsamoIndex >= usajmoCutoffEstimate ? '#0969da' : 'var(--text-muted, #666)', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                USAJMO Cutoff (~205): {calculatedUsamoIndex >= usajmoCutoffEstimate ? 'QUALIFIED' : `-${usajmoCutoffEstimate - calculatedUsamoIndex} pts`}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Projected AMC 12 Score (0–150): <span style={{ color: '#0969da' }}>{amcScoreInput}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="150" 
                step="1.5"
                value={amcScoreInput}
                onChange={(e) => setAmcScoreInput(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted, #888)' }}>
                <span>0 (Min)</span>
                <span>~90 (AIME Cutoff)</span>
                <span>150 (Perfect)</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Projected AIME Score (0–15): <span style={{ color: '#8250df' }}>{aimeScoreInput}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="15" 
                step="1"
                value={aimeScoreInput}
                onChange={(e) => setAimeScoreInput(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted, #888)' }}>
                <span>0</span>
                <span>7 (Honors)</span>
                <span>15 (Max)</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #666)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Composite USAMO Index</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: calculatedUsamoIndex >= usamoCutoffEstimate ? '#2ea043' : '#0969da', lineHeight: 1.1 }}>
                {calculatedUsamoIndex}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #666)' }}>
                {amcScoreInput} + 10 × {aimeScoreInput}
              </div>
            </div>
          </div>
        </div>

        {/* 8 Curriculum Domains Mastery Section */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>AoPS & MAA Curriculum Taxonomy</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #666)' }}>
                Comprehensive mastery paths categorized by primary competition branch, with trigger signal lists and subtopic deconstructions.
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted, #666)' }}>
              8 Core Domains • {domains.reduce((acc, d) => acc + d.subtopics.length, 0)} Subtopics
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {domains.map((domain) => (
              <div 
                key={domain.id}
                style={{
                  background: 'var(--panel, #ffffff)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0969da' }}>
                      {domain.id}
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--border)', color: 'var(--text-muted, #666)' }}>
                      {domain.subtopics.length} subtopics
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.25 }}>
                    {domain.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #666)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                    {domain.description}
                  </p>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted, #888)', marginBottom: '0.5rem' }}>
                      Key Subtopics & AoPS References:
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {domain.subtopics.map((sub) => (
                        <li key={sub.id} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <CheckCircle2 size={15} color="#2ea043" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <span style={{ fontWeight: 600 }}>{sub.title}</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted, #888)' }}>
                              {sub.aopsVolRef}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Link 
                    href={`/amc-aime/learn/${domain.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0969da',
                      textDecoration: 'none'
                    }}
                    className="hover:underline"
                  >
                    Open Deconstructor <ChevronRight size={16} />
                  </Link>
                  <Link
                    href={`/amc-aime/synthesis?domain=${domain.id}`}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted, #666)',
                      textDecoration: 'none'
                    }}
                    className="hover:underline"
                  >
                    View Synthesis Bridges →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expected Value & Game Theory Strategy Guide */}
        <div 
          style={{
            background: 'var(--panel, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '3rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Calculator size={22} color="#0969da" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>AMC 12 Game Theory: When to Guess vs. Leave Blank</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #666)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            The AMC 12 awards <strong>+6 points</strong> for a correct answer, <strong>+1.5 points</strong> for leaving a question blank, 
            and <strong>0 points</strong> for an incorrect response. Because a blank has non-zero value, blind guessing is mathematically penalized.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', background: 'rgba(235, 87, 87, 0.05)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#eb5757', textTransform: 'uppercase' }}>0 Choices Eliminated (5 Left)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0' }}>
                <MathView content="$\mathbb{E}[\text{guess}] = 1.20\text{ pts}$" />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #666)' }}>
                1.20 &lt; 1.50 pts. Blind guessing yields an expected loss of 0.30 points per problem. <strong>LEAVE BLANK.</strong>
              </p>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', background: 'rgba(245, 159, 0, 0.05)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59f00', textTransform: 'uppercase' }}>1 Choice Eliminated (4 Left)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0' }}>
                <MathView content="$\mathbb{E}[\text{guess}] = 1.50\text{ pts}$" />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #666)' }}>
                1.50 = 1.50 pts. Neutral EV. Blank is strictly preferred to minimize variance unless close to cutoff.
              </p>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', background: 'rgba(46, 160, 67, 0.05)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2ea043', textTransform: 'uppercase' }}>2 Choices Eliminated (3 Left)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0' }}>
                <MathView content="$\mathbb{E}[\text{guess}] = 2.00\text{ pts}$" />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #666)' }}>
                2.00 &gt; 1.50 pts. +0.50 expected gain. <strong>MATHEMATICALLY FAVORABLE TO GUESS.</strong>
              </p>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', background: 'rgba(9, 105, 218, 0.05)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0969da', textTransform: 'uppercase' }}>3 Choices Eliminated (2 Left)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0' }}>
                <MathView content="$\mathbb{E}[\text{guess}] = 3.00\text{ pts}$" />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #666)' }}>
                3.00 &gt;&gt; 1.50 pts. 50/50 coin flip gives twice the blank value. <strong>ALWAYS GUESS.</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
