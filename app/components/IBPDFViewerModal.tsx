'use client';

import React, { useState } from 'react';
import { X, ExternalLink, Download, BookOpen, FileText, ChevronRight } from 'lucide-react';

export interface PDFDocument {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  page?: number;
  size: string;
  category: 'student_work' | 'textbook';
}

export const EE_VAULT_DOCUMENTS: PDFDocument[] = [
  {
    id: 'sevenoaks',
    title: 'Prized Writing: Sevenoaks School IB Extended Essays',
    subtitle: '10 Authentic Full-Text Grade A (4,000-word) Student EEs with Supervisor Comments',
    url: '/vault/ee-guides/sevenoaks-prized-ees-2015.pdf',
    size: '7.9 MB (284 Pages)',
    category: 'student_work'
  },
  {
    id: 'hodder-2025',
    title: 'Extended Essay for the IB Diploma: Skills for Success',
    subtitle: 'Paul Hoang & Joseph Koszary • Hodder Education (2025 Edition)',
    url: '/vault/ee-guides/ee-hodder-2025-hoang.pdf',
    size: '76.7 MB (Official Textbook)',
    category: 'textbook'
  },
  {
    id: 'oxford-2025',
    title: 'Extended Essay Course Companion',
    subtitle: 'Kosta Lekanides • Oxford University Press (2025 Edition)',
    url: '/vault/ee-guides/ee-oxford-2025-lekanides.pdf',
    size: '79.1 MB (Official Course Companion)',
    category: 'textbook'
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeDocId?: string;
  page?: number;
}

export default function IBPDFViewerModal({ isOpen, onClose, activeDocId = 'sevenoaks', page }: Props) {
  const [selectedDocId, setSelectedDocId] = useState<string>(activeDocId);
  const [currentPage, setCurrentPage] = useState<number | undefined>(page);

  // Sync if props change
  React.useEffect(() => {
    setSelectedDocId(activeDocId);
    setCurrentPage(page);
  }, [activeDocId, page]);

  if (!isOpen) return null;

  const currentDoc = EE_VAULT_DOCUMENTS.find(d => d.id === selectedDocId) || EE_VAULT_DOCUMENTS[0];
  const pdfSource = currentPage ? `${currentDoc.url}#page=${currentPage}` : currentDoc.url;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '92vh',
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            background: 'var(--panel-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'rgba(184, 74, 57, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--rust)'
              }}
            >
              <BookOpen size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {currentDoc.title}
                </h3>
                {currentPage && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: 'var(--rust)',
                      color: '#fff',
                      padding: '1px 6px',
                      borderRadius: '6px'
                    }}
                  >
                    Page {currentPage}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted)' }}>
                {currentDoc.subtitle} • {currentDoc.size}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Quick Switch Dropdown */}
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {EE_VAULT_DOCUMENTS.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocId(doc.id);
                    setCurrentPage(undefined);
                  }}
                  className={`filter-btn ${selectedDocId === doc.id ? 'active' : ''}`}
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <FileText size={12} />
                  {doc.id === 'sevenoaks' ? 'Sevenoaks EEs' : doc.id === 'hodder-2025' ? 'Hodder 2025' : 'Oxford 2025'}
                </button>
              ))}
            </div>

            {/* Direct Open in New Tab */}
            <a
              href={pdfSource}
              target="_blank"
              rel="noopener noreferrer"
              className="filter-btn"
              title="Open full PDF in a dedicated browser tab"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem'
              }}
            >
              <ExternalLink size={13} /> Full Tab
            </a>

            {/* Download Link */}
            <a
              href={currentDoc.url}
              download
              className="filter-btn active"
              title="Download file directly to computer"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem'
              }}
            >
              <Download size={13} /> Download
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div style={{ flex: 1, position: 'relative', background: '#2c2d30' }}>
          <iframe
            src={pdfSource}
            title={currentDoc.title}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block'
            }}
          />
        </div>

        {/* Footer Hint */}
        <div
          style={{
            padding: '0.45rem 1.25rem',
            background: 'var(--panel-light)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.72rem',
            color: 'var(--muted)'
          }}
        >
          <span>
            💡 <strong>Tip:</strong> If the PDF viewer does not render in your browser, click <strong>"Full Tab"</strong> or <strong>"Download"</strong> above.
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            ThinkIB Official Textbook & Exemplar Archive
          </span>
        </div>
      </div>
    </div>
  );
}
