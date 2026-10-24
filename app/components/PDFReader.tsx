'use client';
import { resourceUrl } from '@/lib/resource-url';
import { useEffect, useRef, useState } from 'react';

/** Render nearby pages only; distant pages keep their height without retaining large canvases. */
function PDFPage({ document, number, width, zoom, scrollRoot, onVisible }: {
  document: any; number: number; width: number; zoom: number;
  scrollRoot: React.RefObject<HTMLDivElement>; onVisible: (page: number) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [nearby, setNearby] = useState(false);
  const [ratio, setRatio] = useState(1.4142);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!host.current) return;
    const observer = new IntersectionObserver(([entry]) => setNearby(entry.isIntersecting), { root: scrollRoot.current, rootMargin: '900px 0px' });
    const current = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) onVisible(number); }, { root: scrollRoot.current, rootMargin: '0px 0px -65% 0px', threshold: 0 });
    observer.observe(host.current); current.observe(host.current);
    return () => { observer.disconnect(); current.disconnect(); };
  }, [number, scrollRoot, onVisible]);
  useEffect(() => {
    let cancelled = false; let render: any;
    if (!nearby) return;
    setError(false);
    (async () => {
      const page = await document.getPage(number);
      if (cancelled || !canvas.current) return;
      const natural = page.getViewport({ scale: 1 });
      setRatio(natural.height / natural.width);
      const scale = width * zoom / natural.width;
      const density = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(8000000 / (natural.width * natural.height * scale * scale)));
      const viewport = page.getViewport({ scale: scale * density });
      const el = canvas.current;
      el.width = Math.floor(viewport.width); el.height = Math.floor(viewport.height);
      el.style.width = `${width * zoom}px`; el.style.height = `${viewport.height / density}px`;
      render = page.render({ canvasContext: el.getContext('2d')!, viewport });
      await render.promise;
    })().catch(err => { if (!cancelled && err?.name !== 'RenderingCancelledException') setError(true); });
    return () => { cancelled = true; render?.cancel(); };
  }, [document, number, width, zoom, nearby]);
  return <div ref={host} data-pdf-page={number} className="pdf-sheet" style={{ width: width * zoom, height: width * zoom * ratio }}>
    {nearby ? <canvas ref={canvas} role="img" aria-label={`Page ${number}`} /> : <span className="pdf-placeholder">Page {number}</span>}
    {error && <p role="alert">Page {number} could not render. Use Open PDF to view the original.</p>}
  </div>;
}

export default function PDFReader({ src, title = 'Document' }: { src: string; title?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const pages = useRef<HTMLDivElement>(null);
  const [document, setDocument] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(600);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(160, entry.contentRect.width - 32)));
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let stopped = false; let task: any;
    setDocument(null); setError(''); setPage(1);
    (async () => {
      if (!(Promise as any).withResolvers) (Promise as any).withResolvers = function () {
        let resolve: any, reject: any; const promise = new Promise((a, b) => { resolve = a; reject = b; });
        return { promise, resolve, reject };
      };
      const pdf = await import('pdfjs-dist/legacy/build/pdf.mjs');
      pdf.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      if (stopped) return;
      task = pdf.getDocument({ url: resourceUrl(src.split('#')[0]), isEvalSupported: false });
      const doc = await task.promise;
      if (!stopped) setDocument(doc);
    })().catch(() => { if (!stopped) setError('This document could not load. Retry, or open the PDF directly.'); });
    return () => { stopped = true; task?.destroy(); };
  }, [src, retry]);
  const jump = (n: number) => {
    const target = Math.min(document?.numPages || 1, Math.max(1, n || 1));
    setPage(target);
    const sheet = pages.current?.querySelector<HTMLElement>(`[data-pdf-page="${target}"]`);
    if (sheet && pages.current) pages.current.scrollTop = Math.max(0, sheet.offsetTop - 12);
  };
  useEffect(() => { if (document) jump(Number(src.match(/#page=(\d+)/)?.[1]) || 1); }, [document, src]); // eslint-disable-line react-hooks/exhaustive-deps
  return <section ref={host} className="pdf-reader" aria-label={title}>
    <div className="pdf-toolbar">
      <label>Page <input aria-label="Go to page" type="number" min="1" max={document?.numPages || 1} value={page} onChange={e => jump(Number(e.target.value))}/> of {document?.numPages || '…'}</label>
      <select aria-label="Document zoom" value={zoom} onChange={e => setZoom(Number(e.target.value))}><option value={1}>Fit width</option><option value={1.25}>125%</option><option value={1.5}>150%</option><option value={2}>200%</option></select>
      <a href={resourceUrl(src)} target="_blank" rel="noopener noreferrer">Open PDF ↗</a>
    </div>
    <div ref={pages} className="pdf-pages" tabIndex={0} aria-label={`${title}, scroll through pages`}>
      {!document && !error && <p role="status">Loading document…</p>}
      {error && <div role="alert"><p>{error}</p><button onClick={() => setRetry(n => n + 1)}>Retry</button></div>}
      {document && Array.from({ length: document.numPages }, (_, i) => <PDFPage key={i} document={document} number={i + 1} width={width} zoom={zoom} scrollRoot={pages} onVisible={setPage}/>)}
    </div>
  </section>;
}
