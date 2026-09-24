'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function CustomCursor() {
  const pathname = usePathname();

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const ringInnerRef = useRef<HTMLDivElement | null>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const isClickingRef = useRef(false);
  const hoverTypeRef = useRef<'none' | 'link' | 'card' | 'input' | 'reticle'>('none');

  // Page-specific vibrant cursor colors
  const pageColor = React.useMemo(() => {
    if (pathname.startsWith('/sat')) return '#b84a39'; // Terracotta Rust
    if (pathname.startsWith('/forum')) return '#4f46e5'; // Deep Indigo
    if (pathname.startsWith('/savemyexams')) return '#3b82f6'; // Electric Blue
    if (pathname.startsWith('/past-papers')) return '#10b981'; // Emerald Green
    if (pathname.startsWith('/math-mocks')) return '#a855f7'; // Neon Purple
    if (pathname.startsWith('/thinkib')) return '#f97316'; // Cyber Orange
    return '#b84a39'; // Editorial Rust for Home
  }, [pathname]);

  useEffect(() => {
    // Only activate for non-touch, fine-pointer devices
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    // Inject style to hide default cursor cleanly on desktop
    const styleEl = document.createElement('style');
    styleEl.id = 'kill-native-cursor';
    styleEl.innerHTML = `
      @media (pointer: fine) {
        body, a, button, input, select, textarea, [role="button"] {
          cursor: none !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    let animFrameId: number;

    // High performance render loop: pure DOM transform updates, 0 React re-renders
    const render = () => {
      // Snappy, fluid ring follow physics (0.35 lerp gives instant response without dragging)
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.35;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.35;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animFrameId = requestAnimationFrame(render);
    };

    const updateHoverVisuals = (type: 'none' | 'link' | 'card' | 'input' | 'reticle', clicking: boolean) => {
      if (!ringInnerRef.current) return;
      const el = ringInnerRef.current;
      const dot = dotRef.current;

      const scale = clicking ? 0.78 : 1;

      if (type === 'reticle') {
        el.className = 'cursor-reticle';
        el.style.width = '36px';
        el.style.height = '36px';
        el.style.borderRadius = '0';
        el.style.border = 'none';
        el.style.backgroundColor = 'transparent';
        el.style.boxShadow = 'none';
        el.style.transform = `translate(-50%, -50%) scale(${scale})`;
      } else if (type === 'card') {
        el.className = 'cursor-circle';
        el.style.width = '52px';
        el.style.height = '52px';
        el.style.borderRadius = '50%';
        el.style.border = `1.5px solid ${pageColor}`;
        el.style.backgroundColor = `${pageColor}15`;
        el.style.boxShadow = `0 0 24px ${pageColor}30`;
        el.style.transform = `translate(-50%, -50%) scale(${scale})`;
      } else if (type === 'input') {
        el.className = 'cursor-circle';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.borderRadius = '50%';
        el.style.border = '1.5px solid #eab308';
        el.style.backgroundColor = 'rgba(234, 179, 8, 0.08)';
        el.style.boxShadow = 'none';
        el.style.transform = `translate(-50%, -50%) scale(${scale})`;
      } else {
        el.className = 'cursor-circle';
        el.style.width = '26px';
        el.style.height = '26px';
        el.style.borderRadius = '50%';
        el.style.border = `1.5px solid ${pageColor}80`;
        el.style.backgroundColor = 'transparent';
        el.style.boxShadow = 'none';
        el.style.transform = `translate(-50%, -50%) scale(${scale})`;
      }

      if (dot) {
        dot.style.transform = `translate(-50%, -50%) scale(${clicking ? 0.6 : 1})`;
        dot.style.backgroundColor = type === 'input' ? '#eab308' : pageColor;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      // Center dot follows mouse instantly with zero frame lag
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }

      // Detect hover target
      const target = e.target as HTMLElement | null;
      if (!target) {
        hoverTypeRef.current = 'none';
        updateHoverVisuals('none', isClickingRef.current);
        return;
      }

      const interactiveEl = target.closest(
        'a, button, input, select, textarea, [data-cursor], .portal-card, .folder-grid-item, .resource-card, .filter-btn, .browser-panel div[style*="cursor"], .viewer-panel button, .viewer-panel a'
      );

      let newType: 'none' | 'link' | 'card' | 'input' | 'reticle' = 'none';
      if (interactiveEl) {
        if (interactiveEl.classList.contains('portal-card') || interactiveEl.classList.contains('resource-card')) {
          newType = 'card';
        } else if (interactiveEl.tagName === 'INPUT' || interactiveEl.tagName === 'SELECT' || interactiveEl.tagName === 'TEXTAREA') {
          newType = 'input';
        } else {
          newType = 'reticle';
        }
      }

      if (newType !== hoverTypeRef.current) {
        hoverTypeRef.current = newType;
        updateHoverVisuals(newType, isClickingRef.current);
      }
    };

    const handleMouseDown = () => {
      isClickingRef.current = true;
      updateHoverVisuals(hoverTypeRef.current, true);
    };

    const handleMouseUp = () => {
      isClickingRef.current = false;
      updateHoverVisuals(hoverTypeRef.current, false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    animFrameId = requestAnimationFrame(render);

    // Initial visuals
    updateHoverVisuals('none', false);

    return () => {
      const existing = document.getElementById('kill-native-cursor');
      if (existing) existing.remove();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animFrameId);
    };
  }, [pageColor]);

  return (
    <>
      {/* Reticle / Ring Follower Layer */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 999998,
          willChange: 'transform',
        }}
      >
        <div
          ref={ringInnerRef}
          style={{
            position: 'relative',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            border: `1.5px solid ${pageColor}80`,
            transform: 'translate(-50%, -50%)',
            transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s ease-out, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          {/* Camera Reticle Corners (Visible when hoverType === 'reticle') */}
          <div className="reticle-corner reticle-tl" style={{ borderColor: pageColor }} />
          <div className="reticle-corner reticle-tr" style={{ borderColor: pageColor }} />
          <div className="reticle-corner reticle-bl" style={{ borderColor: pageColor }} />
          <div className="reticle-corner reticle-br" style={{ borderColor: pageColor }} />
        </div>
      </div>

      {/* Center Core Dot (Instant Hardware Position) */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: -100,
          left: -100,
          pointerEvents: 'none',
          zIndex: 999999,
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: pageColor,
          transform: 'translate(-50%, -50%)',
          boxShadow: `0 0 8px ${pageColor}`,
          transition: 'transform 0.12s ease-out, background-color 0.2s ease',
          willChange: 'left, top',
        }}
      />
    </>
  );
}
