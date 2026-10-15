'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  GitMerge, 
  Sparkles, 
  BookOpen, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { 
  getAllDomains, 
  getAllSynthesisRecipes, 
  getSynthesisRecipeBetween,
  getAllPastProblems,
  AMCSynthesisRecipe 
} from '@/lib/amc-aime';
import MathView from '@/app/components/MathView';

export default function AMCSynthesisMatrixPage() {
  const domains = getAllDomains();
  const allRecipes = getAllSynthesisRecipes();
  const allProblems = getAllPastProblems();

  const [selectedPair, setSelectedPair] = useState<{ domainA: string; domainB: string }>({
    domainA: 'geometry',
    domainB: 'complex-numbers',
  });

  const activeRecipe = getSynthesisRecipeBetween(selectedPair.domainA, selectedPair.domainB);

  // Find problems matching either or both of these domains
  const matchingProblems = allProblems.filter((p) => {
    const domainAObj = domains.find((d) => d.id === selectedPair.domainA);
    const domainBObj = domains.find((d) => d.id === selectedPair.domainB);
    const textA = domainAObj?.title.toLowerCase() || '';
    const textB = domainBObj?.title.toLowerCase() || '';
    const pText = (p.primaryTopic + ' ' + p.secondaryTopics.join(' ')).toLowerCase();
    return pText.includes(textA.split(' ')[0]) || pText.includes(textB.split(' ')[0]);
  });

  const handleCellClick = (idA: string, idB: string) => {
    setSelectedPair({ domainA: idA, domainB: idB });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #fbfbfa)', color: 'var(--ink, #1c1c1e)', paddingBottom: '5rem' }}>
      {/* Top Header */}
      <div 
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--panel, #ffffff)',
          padding: '1.25rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link 
              href="/amc-aime" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted, #666)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}
              className="hover:text-black"
            >
              <ArrowLeft size={16} /> Back to Hub
            </Link>
            <div style={{ height: '16px', width: '1px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitMerge size={18} color="#8250df" />
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                8×8 Cross-Topic Synthesis Matrix
              </span>
            </div>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #666)' }}>
            High-Value Olympiad Bridge Intersections
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto 0', padding: '0 1.5rem' }}>
        
        {/* Intro Banner */}
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(130, 80, 223, 0.08) 0%, rgba(9, 105, 218, 0.08) 100%)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.5rem 1.75rem',
            marginBottom: '2rem'
          }}
        >
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Olympiad Synthesis: Where Two Domains Collide
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #555)', lineHeight: 1.5, margin: 0 }}>
            AMC 12 questions 18–25 and AIME questions 8–15 almost never test a single isolated topic. 
            High-scoring competitors separate themselves by recognizing <strong>Bridge Identities</strong>—mathematical transformations 
            that turn intractable geometry into complex algebra, or combinatorial sums into polynomial generating functions.
          </p>
        </div>

        {/* 8x8 Intersection Grid */}
        <div 
          style={{
            background: 'var(--panel, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.75rem',
            marginBottom: '2.5rem',
            overflowX: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Interactive Domain Intersection Grid</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #666)' }}>
              Click any intersection cell to inspect the bridge identity
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted, #888)', borderBottom: '1px solid var(--border)' }}>
                  DOMAINS
                </th>
                {domains.map((col) => (
                  <th 
                    key={col.id} 
                    style={{ 
                      padding: '0.5rem 0.25rem', 
                      textAlign: 'center', 
                      fontSize: '0.7rem', 
                      fontWeight: 700,
                      color: 'var(--text-muted, #666)',
                      borderBottom: '1px solid var(--border)',
                      maxWidth: '85px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={col.title}
                  >
                    {col.id.slice(0, 7)}..
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {domains.map((row) => (
                <tr key={row.id}>
                  <td 
                    style={{ 
                      padding: '0.6rem 0.5rem', 
                      fontSize: '0.8rem', 
                      fontWeight: 600, 
                      color: 'var(--ink)',
                      borderBottom: '1px solid var(--border)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {row.title.split('&')[0]}
                  </td>

                  {domains.map((col) => {
                    const isSelf = row.id === col.id;
                    const recipe = getSynthesisRecipeBetween(row.id, col.id);
                    const isSelected = 
                      (selectedPair.domainA === row.id && selectedPair.domainB === col.id) ||
                      (selectedPair.domainA === col.id && selectedPair.domainB === row.id);

                    return (
                      <td 
                        key={col.id}
                        onClick={() => handleCellClick(row.id, col.id)}
                        style={{
                          textAlign: 'center',
                          padding: '0.4rem',
                          borderBottom: '1px solid var(--border)',
                          cursor: isSelf ? 'default' : 'pointer',
                          background: isSelected 
                            ? 'rgba(130, 80, 223, 0.2)' 
                            : recipe 
                              ? 'rgba(9, 105, 218, 0.08)' 
                              : isSelf 
                                ? 'var(--bg, #fbfbfa)' 
                                : 'transparent',
                          transition: 'background 0.15s'
                        }}
                      >
                        {isSelf ? (
                          <span style={{ color: 'var(--border)', fontSize: '0.75rem' }}>—</span>
                        ) : recipe ? (
                          <div 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '6px', 
                              background: '#8250df', 
                              color: '#fff',
                              fontSize: '0.7rem',
                              fontWeight: 700 
                            }}
                            title={`Recipe: ${recipe.title}`}
                          >
                            ⚡
                          </div>
                        ) : (
                          <div 
                            style={{ 
                              display: 'inline-block', 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%', 
                              background: 'var(--border)' 
                            }} 
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Intersection Bridge Card */}
        <div 
          style={{
            background: 'var(--panel, #ffffff)',
            border: '2px solid rgba(130, 80, 223, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '3rem',
            boxShadow: '0 8px 24px rgba(130, 80, 223, 0.05)'
          }}
        >
          {activeRecipe ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={22} color="#8250df" />
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8250df' }}>
                      Master Synthesis Bridge
                    </span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activeRecipe.title}</h3>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(130, 80, 223, 0.1)', padding: '0.35rem 0.8rem', borderRadius: '8px', color: '#8250df', fontSize: '0.85rem', fontWeight: 600 }}>
                  <TrendingUp size={16} /> Yield: {activeRecipe.yieldFrequency}
                </div>
              </div>

              {/* Core Bridge Identity LaTeX Box */}
              <div 
                style={{
                  background: 'var(--bg, #fbfbfa)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  fontSize: '1.25rem',
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted, #888)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Core Bridge Identity:
                </div>
                <MathView content={`$$${activeRecipe.coreBridgeIdentity}$$`} />
              </div>

              {/* Tactical Advice */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#0969da', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Zap size={16} /> Tactical Execution Advice:
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--ink)' }}>
                  {activeRecipe.tacticalAdvice}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <Info size={28} color="var(--text-muted, #888)" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Exploring Custom Synthesis Between {selectedPair.domainA} and {selectedPair.domainB}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #666)', maxWidth: '600px', margin: '0 auto' }}>
                Select highlighted grid cells marked with ⚡ to inspect vetted AoPS Volume 1 & 2 bridge formulas.
              </p>
            </div>
          )}
        </div>

        {/* Real Contest Problems Bridging Selected Topics */}
        {matchingProblems.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
              Authentic Contest Problems Applying This Synthesis
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {matchingProblems.map((prob) => (
                <div 
                  key={prob.id}
                  style={{
                    background: 'var(--panel, #ffffff)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{prob.id}</span>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(9, 105, 218, 0.1)', color: '#0969da', fontWeight: 600 }}>
                        {prob.contest} #{prob.problemNumber}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #666)', margin: 0 }}>
                      Topics: {prob.primaryTopic} • {prob.secondaryTopics.join(', ')}
                    </p>
                  </div>

                  <Link 
                    href={`/amc-aime/learn/polynomials`}
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
                    View in Deconstructor <ArrowRight size={15} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
