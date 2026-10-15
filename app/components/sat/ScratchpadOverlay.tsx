'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PenTool, Highlighter, Eraser, RotateCcw, Trash2, X, Move } from 'lucide-react';

interface ScratchpadOverlayProps {
  questionId: string;
  isOpen: boolean;
  onClose: () => void;
  containerRef?: React.RefObject<HTMLElement>;
}

type ToolMode = 'pen' | 'highlighter' | 'eraser';

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  mode: ToolMode;
}

// In-memory cache per questionId so drawings persist across navigation
const questionDrawings: Record<string, Stroke[]> = {};

export default function ScratchpadOverlay({
  questionId,
  isOpen,
  onClose,
  containerRef,
}: ScratchpadOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<ToolMode>('pen');
  const [color, setColor] = useState<string>('#3b82f6'); // default blue
  const [size, setSize] = useState<number>(3);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const isDrawing = useRef<boolean>(false);
  const currentStroke = useRef<Stroke | null>(null);

  // Load existing strokes when question changes
  useEffect(() => {
    const saved = questionDrawings[questionId] || [];
    setStrokes(saved);
  }, [questionId]);

  // Synchronize canvas dimensions with container or viewport
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = containerRef?.current || canvas.parentElement;
    if (parent) {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }
  }, [containerRef]);

  // Redraw canvas whenever strokes change or on resize
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    for (const stroke of strokes) {
      if (stroke.points.length < 1) continue;
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.mode === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.size * 3;
      } else if (stroke.mode === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = stroke.size * 4;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = stroke.size;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    }
  }, [strokes]);

  useEffect(() => {
    if (isOpen) {
      resizeCanvas();
      redraw();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [isOpen, resizeCanvas, redraw]);

  useEffect(() => {
    if (isOpen) {
      redraw();
    }
  }, [strokes, isOpen, redraw]);

  // Drawing event handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const pt = getCoordinates(e);
    const stroke: Stroke = {
      points: [pt],
      color,
      size,
      mode: tool,
    };
    currentStroke.current = stroke;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current) return;
    const pt = getCoordinates(e);
    currentStroke.current.points.push(pt);

    // Live stroke drawing on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = size * 3;
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = size * 4;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = size;
    }

    const pts = currentStroke.current.points;
    if (pts.length > 1) {
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  };

  const stopDrawing = () => {
    if (!isDrawing.current || !currentStroke.current) return;
    isDrawing.current = false;
    const updated = [...strokes, currentStroke.current];
    setStrokes(updated);
    questionDrawings[questionId] = updated;
    currentStroke.current = null;
  };

  const handleClear = () => {
    setStrokes([]);
    questionDrawings[questionId] = [];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    questionDrawings[questionId] = updated;
  };

  // Keyboard shortcut for Alt+H (highlight text) and Alt+S (strike text)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        applySelectionStyle('sat-highlight');
      } else if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        applySelectionStyle('sat-strikethrough');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const applySelectionStyle = (className: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);

    const span = document.createElement('span');
    span.className = className;
    if (className === 'sat-highlight') {
      span.style.backgroundColor = 'rgba(250, 204, 21, 0.4)';
      span.style.borderRadius = '3px';
      span.style.padding = '1px 2px';
    } else if (className === 'sat-strikethrough') {
      span.style.textDecoration = 'line-through';
      span.style.opacity = '0.55';
    }

    try {
      range.surroundContents(span);
      sel.removeAllRanges();
    } catch {
      // surroundContents may fail if range partially splits non-text nodes
    }
  };

  if (!isOpen) return null;

  const colorPalette = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#0f172a'];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 900,
        pointerEvents: 'none',
      }}
    >
      {/* Drawing Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'auto',
          cursor: tool === 'eraser' ? 'crosshair' : tool === 'highlighter' ? 'text' : 'crosshair',
        }}
      />

      {/* Floating Toolbar */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          pointerEvents: 'auto',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '8px 12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 910,
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Tool selector */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => setTool('pen')}
            title="Pen (Alt+W)"
            style={{
              padding: '6px 8px',
              borderRadius: 6,
              border: tool === 'pen' ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              background: tool === 'pen' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              color: tool === 'pen' ? 'var(--accent)' : 'var(--ink)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <PenTool size={15} />
          </button>

          <button
            type="button"
            onClick={() => setTool('highlighter')}
            title="Highlighter"
            style={{
              padding: '6px 8px',
              borderRadius: 6,
              border: tool === 'highlighter' ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              background: tool === 'highlighter' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              color: tool === 'highlighter' ? 'var(--accent)' : 'var(--ink)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Highlighter size={15} />
          </button>

          <button
            type="button"
            onClick={() => setTool('eraser')}
            title="Eraser"
            style={{
              padding: '6px 8px',
              borderRadius: 6,
              border: tool === 'eraser' ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              background: tool === 'eraser' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              color: tool === 'eraser' ? 'var(--accent)' : 'var(--ink)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Eraser size={15} />
          </button>
        </div>

        {/* Color Palette (hidden in eraser mode) */}
        {tool !== 'eraser' && (
          <div style={{ display: 'flex', gap: 5, padding: '0 6px', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            {colorPalette.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: c,
                  border: color === c ? '2px solid var(--ink)' : '1px solid rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transform: color === c ? 'scale(1.2)' : 'none',
                  transition: 'transform 0.1s ease',
                }}
              />
            ))}
          </div>
        )}

        {/* Actions: Undo, Clear, Close */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            title="Undo"
            style={{
              background: 'none',
              border: 'none',
              color: strokes.length === 0 ? 'var(--muted)' : 'var(--ink)',
              cursor: strokes.length === 0 ? 'default' : 'pointer',
              padding: 4,
            }}
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={strokes.length === 0}
            title="Clear all"
            style={{
              background: 'none',
              border: 'none',
              color: strokes.length === 0 ? 'var(--muted)' : 'var(--ink)',
              cursor: strokes.length === 0 ? 'default' : 'pointer',
              padding: 4,
            }}
          >
            <Trash2 size={15} />
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Close scratchpad"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              padding: 4,
              marginLeft: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
