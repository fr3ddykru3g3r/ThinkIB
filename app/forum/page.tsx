'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  PlusCircle,
  ThumbsUp,
  Tag,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock4,
  ArrowRight,
  Filter,
  RefreshCw,
  Send,
  AlertCircle,
} from 'lucide-react';
import { ForumThread, ForumReply, ResourceSubmission } from '@/lib/db';
import MathView from '@/app/components/MathView';

const CHANNELS = [
  { id: 'all', label: 'All Discussions' },
  { id: 'sat-prep', label: 'SAT Prep & Desmos' },
  { id: 'math-analysis', label: 'Math AA/AI HL/SL' },
  { id: 'sciences', label: 'Natural Sciences' },
  { id: 'humanities', label: 'Humanities & Econ' },
  { id: 'general', label: 'General Revision' },
];

export default function ForumPage() {
  const [activeTab, setActiveTab] = useState<'discussions' | 'submissions'>('discussions');
  const [channel, setChannel] = useState<string>('all');
  const [search, setSearch] = useState('');
  
  // Threads state
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [threadReplies, setThreadReplies] = useState<ForumReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [newReplyText, setNewReplyText] = useState('');
  const [newReplyAuthor, setNewReplyAuthor] = useState('');

  // Submissions state
  const [submissions, setSubmissions] = useState<ResourceSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [curating, setCurating] = useState(false);
  const [curateMessage, setCurateMessage] = useState<string | null>(null);

  // New Thread Modal state
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newChannel, setNewChannel] = useState<ForumThread['channel']>('sat-prep');
  const [newTags, setNewTags] = useState('');
  const [threadError, setThreadError] = useState<string | null>(null);
  const [submittingThread, setSubmittingThread] = useState(false);
  const [threadHoneypot, setThreadHoneypot] = useState('');

  // Reply anti-spam & error state
  const [replyError, setReplyError] = useState<string | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyHoneypot, setReplyHoneypot] = useState('');

  // Fetch threads
  const fetchThreads = async () => {
    setLoadingThreads(true);
    try {
      const url = new URL('/api/forum/threads', window.location.origin);
      if (channel !== 'all') url.searchParams.set('channel', channel);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setThreads(data.threads);
      }
    } catch (e) {
      console.error('Failed to load threads', e);
    } finally {
      setLoadingThreads(false);
    }
  };

  // Fetch submissions
  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const url = new URL('/api/forum/submissions', window.location.origin);
      if (submissionFilter !== 'all') url.searchParams.set('status', submissionFilter);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (e) {
      console.error('Failed to load submissions', e);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [channel, search]);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab, submissionFilter]);

  // Load single thread with replies
  const openThread = async (t: ForumThread) => {
    setSelectedThread(t);
    setLoadingReplies(true);
    try {
      const res = await fetch(`/api/forum/threads/${t.id}`);
      const data = await res.json();
      if (data.success) {
        setThreadReplies(data.replies);
      }
    } catch (e) {
      console.error('Failed to fetch thread replies', e);
    } finally {
      setLoadingReplies(false);
    }
  };

  // Upvote
  const handleUpvote = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/forum/threads/${threadId}/upvote`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setThreads((prev) =>
          prev.map((t) => (t.id === threadId ? { ...t, upvotes: data.upvotes } : t))
        );
        if (selectedThread && selectedThread.id === threadId) {
          setSelectedThread((prev) => (prev ? { ...prev, upvotes: data.upvotes } : null));
        }
      }
    } catch (err) {
      console.error('Upvote error', err);
    }
  };

  // Submit reply
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !newReplyText.trim() || submittingReply) return;
    setReplyError(null);
    setSubmittingReply(true);

    try {
      const res = await fetch(`/api/forum/threads/${selectedThread.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: newReplyAuthor.trim() || 'Anonymous Scholar',
          content: newReplyText.trim(),
          hp_field: replyHoneypot,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setReplyError(data.error || 'Failed to submit reply');
        return;
      }
      setThreadReplies((prev) => [...prev, data.reply]);
      setNewReplyText('');
      setReplyHoneypot('');
      setReplyError(null);
      // Update reply count in thread
      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedThread.id ? { ...t, repliesCount: t.repliesCount + 1 } : t
        )
      );
    } catch (err: any) {
      console.error('Failed to submit reply', err);
      setReplyError(err.message || 'Network error while submitting reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Create new thread
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || submittingThread) return;
    setThreadError(null);
    setSubmittingThread(true);

    try {
      const tagList = newTags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          author: newAuthor.trim() || 'Anonymous Scholar',
          channel: newChannel,
          tags: tagList,
          hp_field: threadHoneypot,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setThreadError(data.error || 'Failed to create discussion');
        return;
      }
      setShowNewThreadModal(false);
      setNewTitle('');
      setNewContent('');
      setNewAuthor('');
      setNewTags('');
      setThreadHoneypot('');
      setThreadError(null);
      fetchThreads();
    } catch (err: any) {
      console.error('Failed to create thread', err);
      setThreadError(err.message || 'Network error while creating thread.');
    } finally {
      setSubmittingThread(false);
    }
  };

  // Trigger Weekly Curation Pipeline
  const handleRunCuration = async () => {
    setCurating(true);
    setCurateMessage(null);
    try {
      const res = await fetch('/api/forum/curate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCurateMessage(
          `Weekly Curation Check Complete: Processed ${data.processedCount} pending submission(s).`
        );
        fetchSubmissions();
      } else {
        setCurateMessage('Curation error: ' + (data.error || 'Failed'));
      }
    } catch (e: any) {
      setCurateMessage('Error running curation check: ' + e.message);
    } finally {
      setCurating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Editorial Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="section-label">COMMUNITY</span>
        <h1 style={{ marginBottom: '0.5rem' }}>Forum & Submissions</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '75ch' }}>
          Discuss exam problems, share solutions, and submit study resources for weekly review.
        </p>
      </div>

      {/* Main Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('discussions'); setSelectedThread(null); }}
          style={{
            fontSize: '0.92rem',
            padding: '0.65rem 1.1rem',
            background: activeTab === 'discussions' ? 'rgba(184, 74, 57, 0.08)' : 'transparent',
            color: activeTab === 'discussions' ? 'var(--accent)' : 'var(--muted)',
            border: 'none',
            borderBottom: activeTab === 'discussions' ? '2px solid var(--accent)' : '2px solid transparent',
            borderRadius: '8px 8px 0 0',
            fontWeight: activeTab === 'discussions' ? 600 : 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <MessageSquare size={16} />
          <span>Discussions ({threads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('submissions'); setSelectedThread(null); }}
          style={{
            fontSize: '0.92rem',
            padding: '0.65rem 1.1rem',
            background: activeTab === 'submissions' ? 'rgba(184, 74, 57, 0.08)' : 'transparent',
            color: activeTab === 'submissions' ? 'var(--accent)' : 'var(--muted)',
            border: 'none',
            borderBottom: activeTab === 'submissions' ? '2px solid var(--accent)' : '2px solid transparent',
            borderRadius: '8px 8px 0 0',
            fontWeight: activeTab === 'submissions' ? 600 : 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Sparkles size={16} />
          <span>Curated Submissions ({submissions.length})</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: DISCUSSIONS */}
      {/* ==================================================== */}
      {activeTab === 'discussions' && (
        <div>
          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '420px' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder="Search problems, topics, formulas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.5rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                href="/forum/submit"
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.65rem 1rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--ink)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <PlusCircle size={15} style={{ color: 'var(--accent)' }} />
                <span>Submit Resource for Review</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowNewThreadModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.65rem 1.1rem',
                  background: 'var(--accent)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <MessageSquare size={15} />
                <span>New Discussion</span>
              </button>
            </div>
          </div>

          {/* Channel Filters */}
          <div className="filter-container" style={{ margin: '0 0 1.5rem 0' }}>
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                className={`filter-btn ${channel === ch.id ? 'active' : ''}`}
                onClick={() => setChannel(ch.id)}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* Detail View of a Selected Thread */}
          {selectedThread ? (
            <div className="panel" style={{ padding: '2rem' }}>
              <button
                type="button"
                onClick={() => setSelectedThread(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '1.25rem',
                }}
              >
                &larr; Back to discussion list
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <span className="section-label" style={{ marginBottom: '0.4rem' }}>
                    #{selectedThread.channel.toUpperCase()}
                  </span>
                  <h2 style={{ fontSize: '1.8rem', margin: '0.2rem 0 0.8rem' }}>{selectedThread.title}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.82rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{selectedThread.author}</span>
                    {selectedThread.authorBadge && (
                      <span style={{ background: 'rgba(28,28,30,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                        {selectedThread.authorBadge}
                      </span>
                    )}
                    <span>• {new Date(selectedThread.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleUpvote(selectedThread.id, e)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.6rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    cursor: 'pointer',
                  }}
                >
                  <ThumbsUp size={15} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{selectedThread.upvotes}</span>
                </button>
              </div>

              {/* Thread Content */}
              <div
                style={{
                  margin: '1.5rem 0',
                  padding: '1.25rem',
                  background: 'rgba(28,28,30,0.02)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.96rem',
                }}
              >
                <MathView content={selectedThread.content} />
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {selectedThread.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      color: 'var(--muted)',
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Replies Section */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>
                  Community Responses & Solutions ({threadReplies.length})
                </h3>

                {loadingReplies ? (
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Loading responses...</p>
                ) : threadReplies.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    No responses yet. Be the first to share an answer or technique!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {threadReplies.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          padding: '1rem',
                          borderRadius: '10px',
                          border: r.isSolution ? '1px solid var(--accent)' : '1px solid var(--border)',
                          background: r.isSolution ? 'rgba(184, 74, 57, 0.03)' : '#fff',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.author}</span>
                            {r.authorBadge && (
                              <span style={{ background: 'rgba(28,28,30,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                                {r.authorBadge}
                              </span>
                            )}
                            <span style={{ color: 'var(--muted)' }}>• {new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                          {r.isSolution && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>
                              VERIFIED SOLUTION
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.92rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                          <MathView content={r.content} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <form onSubmit={handleSubmitReply} style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Add to this discussion</h4>

                  {replyError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#991b1b',
                        fontSize: '0.85rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <AlertCircle size={15} style={{ flexShrink: 0 }} />
                      <span>{replyError}</span>
                    </div>
                  )}

                  {/* Anti-spam honeypot */}
                  <input
                    type="text"
                    name="hp_field"
                    value={replyHoneypot}
                    onChange={(e) => setReplyHoneypot(e.target.value)}
                    style={{ display: 'none', position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="Your Name / Callout (e.g. Alex • Math AA 7)"
                      value={newReplyAuthor}
                      onChange={(e) => setNewReplyAuthor(e.target.value)}
                      style={{
                        flex: '1',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Write a clear response, worked solution, or question..."
                    value={newReplyText}
                    onChange={(e) => setNewReplyText(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      marginBottom: '0.75rem',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submittingReply}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.6rem 1.25rem',
                      background: submittingReply ? 'var(--muted)' : 'var(--ink)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: submittingReply ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Send size={13} />
                    <span>{submittingReply ? 'Posting...' : 'Post Response'}</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Threads List */
            <div>
              {loadingThreads ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted)' }}>
                  Loading discussions...
                </div>
              ) : threads.length === 0 ? (
                <div
                  className="panel"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '3.5rem 1.5rem',
                  }}
                >
                  <MessageSquare size={32} style={{ color: 'var(--muted)', opacity: 0.4, marginBottom: '0.75rem' }} />
                  <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.4rem' }}>No discussions yet</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: '0 auto 1.25rem', maxWidth: '440px' }}>
                    Start a discussion or ask about an exam problem.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowNewThreadModal(true)}
                    style={{
                      padding: '0.65rem 1.35rem',
                      background: 'var(--accent)',
                      color: '#ffffff',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    Start a Discussion
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {threads.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => openThread(t)}
                      style={{
                        padding: '1.4rem',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        background: 'var(--surface)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--ink)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                color: 'var(--accent)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              #{t.channel}
                            </span>
                            {t.pinned && (
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.65rem',
                                  background: 'rgba(184, 74, 57, 0.1)',
                                  color: 'var(--accent)',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                }}
                              >
                                PINNED
                              </span>
                            )}
                          </div>

                          <h3 style={{ fontSize: '1.25rem', margin: '0.2rem 0 0.5rem', color: 'var(--ink)' }}>
                            {t.title}
                          </h3>

                          <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                            <MathView content={t.content.length > 170 ? t.content.substring(0, 170) + '...' : t.content} />
                          </div>

                          {/* Footer Meta */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                            <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{t.author}</span>
                            <span>• {new Date(t.createdAt).toLocaleDateString()}</span>
                            <span>• {t.repliesCount} {t.repliesCount === 1 ? 'response' : 'responses'}</span>
                          </div>
                        </div>

                        {/* Upvote Pill */}
                        <button
                          type="button"
                          onClick={(e) => handleUpvote(t.id, e)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.5rem 0.8rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            cursor: 'pointer',
                          }}
                        >
                          <ThumbsUp size={14} style={{ color: 'var(--accent)' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{t.upvotes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: WEEKLY CURATED SUBMISSIONS TRACKER */}
      {/* ==================================================== */}
      {activeTab === 'submissions' && (
        <div>
          {/* Header Card explaining the weekly AI check */}
          <div className="panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(184, 74, 57, 0.03)', borderColor: 'rgba(184, 74, 57, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="section-label" style={{ color: 'var(--accent)', marginBottom: '0.3rem' }}>
                  WEEKLY AUTONOMOUS CURATION ENGINE
                </span>
                <h3 style={{ fontSize: '1.3rem', margin: '0.2rem 0 0.5rem' }}>
                  How Resource Curation Works
                </h3>
                <p style={{ color: 'var(--ink)', opacity: 0.88, fontSize: '0.92rem', maxWidth: '70ch', margin: 0 }}>
                  Any student can submit study notes, portals, or videos. Every week, our automated AI curation loop verifies the links, checks syllabus alignment with Digital SAT & IB standards, standardizes the title, and approves or rejects items into the official archive directory.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <Link
                  href="/forum/submit"
                  style={{
                    textDecoration: 'none',
                    textAlign: 'center',
                    padding: '0.6rem 1.1rem',
                    background: 'var(--accent)',
                    color: '#fff',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  + Submit a Resource
                </Link>

                <button
                  type="button"
                  onClick={handleRunCuration}
                  disabled={curating}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '0.6rem 1.1rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: curating ? 'wait' : 'pointer',
                  }}
                >
                  <RefreshCw size={13} className={curating ? 'animate-spin' : ''} />
                  <span>{curating ? 'Curating Queue...' : 'Run Curation Check Now'}</span>
                </button>
              </div>
            </div>

            {curateMessage && (
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--ink)' }}>
                {curateMessage}
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                type="button"
                className={`filter-btn ${submissionFilter === st ? 'active' : ''}`}
                onClick={() => setSubmissionFilter(st)}
              >
                {st === 'all' ? 'All Submissions' : st === 'pending' ? '⏳ Under Review' : st === 'approved' ? '✓ Verified in Vault' : '✕ Rejected'}
              </button>
            ))}
          </div>

          {/* Submissions List */}
          {loadingSubmissions ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted)' }}>
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div
              className="panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '3.5rem 1.5rem',
              }}
            >
              <Sparkles size={32} style={{ color: 'var(--muted)', opacity: 0.4, marginBottom: '0.75rem' }} />
              <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.4rem' }}>No resources found for this filter</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: '0 auto', maxWidth: '440px' }}>
                Submit a new link or study guide to have it reviewed.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {submissions.map((sub) => {
                const isApproved = sub.status === 'approved';
                const isRejected = sub.status === 'rejected';
                const isPending = sub.status === 'pending';

                return (
                  <div
                    key={sub.id}
                    style={{
                      padding: '1.5rem',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      background: 'var(--surface)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        {/* Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.68rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              background: isApproved
                                ? 'rgba(16, 185, 129, 0.1)'
                                : isRejected
                                ? 'rgba(239, 68, 68, 0.1)'
                                : 'rgba(234, 179, 8, 0.1)',
                              color: isApproved
                                ? '#059669'
                                : isRejected
                                ? '#dc2626'
                                : '#b45309',
                            }}
                          >
                            {isApproved ? '✓ Approved in Vault' : isRejected ? '✕ Declined' : '⏳ Pending Review'}
                          </span>

                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>
                            [{sub.exam}] {sub.subject} • {sub.resourceType.toUpperCase()}
                          </span>

                          {sub.qualityScore !== undefined && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>
                              Score: {sub.qualityScore}/100
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.2rem', margin: '0.1rem 0 0.3rem' }}>
                          {sub.title}
                        </h3>

                        {sub.standardizedTitle && sub.standardizedTitle !== sub.originalTitle && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                            Original submission: <em>&ldquo;{sub.originalTitle}&rdquo;</em>
                          </div>
                        )}
                      </div>

                      <a
                        href={sub.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.82rem',
                          color: 'var(--ink)',
                          fontWeight: 600,
                          textDecoration: 'none',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                          background: 'var(--surface)',
                        }}
                      >
                        Visit Source <ExternalLink size={12} />
                      </a>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--ink)', opacity: 0.88, marginBottom: '0.75rem', lineHeight: '1.5' }}>
                      <strong>Submitter Rationale:</strong> {sub.rationale}
                    </p>

                    {/* Curator Notes Box */}
                    {sub.reviewNotes && (
                      <div
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '4px',
                          fontSize: '0.82rem',
                          fontFamily: 'var(--font-mono)',
                          background: isApproved ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                          border: isApproved ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                          color: isApproved ? '#065f46' : '#991b1b',
                        }}
                      >
                        <strong>AI CURATOR VERDICT:</strong> {sub.reviewNotes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: NEW DISCUSSION */}
      {/* ==================================================== */}
      {showNewThreadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowNewThreadModal(false)}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: '8px',
              maxWidth: '620px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="section-label">NEW ACADEMIC DISCUSSION</span>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>Ask a Question or Share a Breakdown</h2>

            {threadError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{threadError}</span>
              </div>
            )}

            <form onSubmit={handleCreateThread}>
              {/* Anti-spam honeypot */}
              <input
                type="text"
                name="hp_field"
                value={threadHoneypot}
                onChange={(e) => setThreadHoneypot(e.target.value)}
                style={{ display: 'none', position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--muted)' }}>
                  CHANNEL
                </label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value as any)}
                  className="select-input"
                  style={{ width: '100%' }}
                >
                  <option value="sat-prep">SAT Prep & Desmos Strategies</option>
                  <option value="math-analysis">Math AA / AI (HL/SL)</option>
                  <option value="sciences">Natural Sciences (Bio, Chem, Physics)</option>
                  <option value="humanities">Humanities, History & Economics</option>
                  <option value="general">General Academic Revision</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--muted)' }}>
                  PROBLEM OR TOPIC TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. How to solve circular motion questions with friction in Physics HL?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--muted)' }}>
                  YOUR NAME / SCHOLAR CALLOUT (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elena V. • SAT 1560 or Chem HL 7"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--muted)' }}>
                  CONTENT (SUPPORTS MARKDOWN, CODE, AND MATH)
                </label>
                <textarea
                  rows={6}
                  placeholder="Detail your question or share your step-by-step problem walkthrough..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-body)',
                    lineHeight: '1.6',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--muted)' }}>
                  TAGS (COMMA-SEPARATED)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paper 2, Kinematics, Circular Motion"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNewThreadModal(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingThread}
                  style={{
                    padding: '0.65rem 1.4rem',
                    background: submittingThread ? 'var(--muted)' : 'var(--ink)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: submittingThread ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {submittingThread ? 'Publishing...' : 'Publish Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
