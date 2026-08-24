'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function CustomCursor() {
  const [hoverType, setHoverType] = useState<'none' | 'link' | 'card' | 'input' | 'reticle'>('none');
  const [isClicking, setIsClicking] = useState(false);
  const pathname = usePathname();

  const mousePos = useRef({ x: -100, y: -100 });
  const cursorDotPos = useRef({ x: -100, y: -100 });
  const cursorRingPos = useRef({ x: -100, y: -100 });
  const [, setRenderTrigger] = useState(0);

  // Page-specific vibrant cursor colors
  const pageColor = React.useMemo(() => {
    if (pathname.includes('/savemyexams')) return '#3b82f6'; // Electric Blue
    if (pathname.includes('/past-papers')) return '#10b981'; // Emerald Green
    if (pathname.includes('/math-mocks')) return '#a855f7'; // Neon Purple
    if (pathname.includes('/thinkib')) return '#f97316'; // Cyber Orange
    return '#ec4899'; // Coral Accent for Home
  }, [pathname]);

  useEffect(() => {
    // Hide native cursor
    const styleEl = document.createElement('style');
    styleEl.id = 'kill-native-cursor';
    styleEl.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(styleEl);

    let animFrameId: number;

    const updatePosition = () => {
      // Fast dot tracking (0.4 lerp)
      cursorDotPos.current.x += (mousePos.current.x - cursorDotPos.current.x) * 0.4;
      cursorDotPos.current.y += (mousePos.current.y - cursorDotPos.current.y) * 0.4;

      // Smooth trailing ring/reticle tracking (0.18 lerp)
      cursorRingPos.current.x += (mousePos.current.x - cursorRingPos.current.x) * 0.18;
      cursorRingPos.current.y += (mousePos.current.y - cursorRingPos.current.y) * 0.18;

      setRenderTrigger(prev => prev + 1);
      animFrameId = requestAnimationFrame(updatePosition);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      const target = e.target as HTMLElement | null;
      if (!target) {
        setHoverType('none');
        return;
      }

      // Check hover element
      const interactiveEl = target.closest('a, button, input, select, [data-cursor], .portal-card, .folder-grid-item, .resource-card, .filter-btn, .browser-panel div[style*="cursor"], .viewer-panel button, .viewer-panel a');
      if (interactiveEl) {
        if (interactiveEl.classList.contains('portal-card') || interactiveEl.classList.contains('resource-card')) {
          setHoverType('card');
        } else if (interactiveEl.tagName === 'INPUT' || interactiveEl.tagName === 'SELECT') {
          setHoverType('input');
        } else {
          // All interactive buttons, files, list items, and links get camera reticle / link state
          setHoverType('reticle');
        }
      } else {
        setHoverType('none');
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    animFrameId = requestAnimationFrame(updatePosition);

    return () => {
      const existing = document.getElementById('kill-native-cursor');
      if (existing) existing.remove();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <>
      {/* Reticle / Ring Follower Layer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 999998,
          transform: `translate3d(${cursorRingPos.current.x}px, ${cursorRingPos.current.y}px, 0)`,
          willChange: 'transform'
        }}
      >
        {hoverType === 'reticle' ? (
          /* Exact Camera Reticle Brackets (4 corners + center space) */
          <div
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              transform: `translate(-50%, -50%) scale(${isClicking ? 0.82 : 1})`,
              transition: 'transform 0.15s ease-out'
            }}
          >
            {/* Top-Left Corner */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '10px', height: '10px', borderLeft: `2.5px solid ${pageColor}`, borderTop: `2.5px solid ${pageColor}` }} />
            {/* Top-Right Corner */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', borderRight: `2.5px solid ${pageColor}`, borderTop: `2.5px solid ${pageColor}` }} />
            {/* Bottom-Left Corner */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '10px', height: '10px', borderLeft: `2.5px solid ${pageColor}`, borderBottom: `2.5px solid ${pageColor}` }} />
            {/* Bottom-Right Corner */}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRight: `2.5px solid ${pageColor}`, borderBottom: `2.5px solid ${pageColor}` }} />
          </div>
        ) : (
          /* Card & Default Circle Lens */
          <div
            style={{
              position: 'relative',
              width: hoverType === 'card' ? '54px' : hoverType === 'input' ? '42px' : '26px',
              height: hoverType === 'card' ? '54px' : hoverType === 'input' ? '42px' : '26px',
              borderRadius: '50%',
              border: `1.5px solid ${hoverType === 'card' ? pageColor : hoverType === 'input' ? '#eab308' : pageColor}`,
              backgroundColor: hoverType === 'card' ? `${pageColor}15` : 'transparent',
              transform: `translate(-50%, -50%) scale(${isClicking ? 0.75 : 1})`,
              boxShadow: hoverType === 'card' ? `0 0 20px ${pageColor}40` : 'none',
              transition: 'width 0.25s cubic-bezier(0.25, 1, 0.5, 1), height 0.25s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.25s ease, border-color 0.25s ease, transform 0.15s ease-out'
            }}
          />
        )}
      </div>

      {/* Center Core Dot (Always Present) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 999999,
          transform: `translate3d(${cursorDotPos.current.x}px, ${cursorDotPos.current.y}px, 0)`,
          willChange: 'transform'
        }}
      >
        <div
          style={{
            width: isClicking ? '6px' : '7px',
            height: isClicking ? '6px' : '7px',
            borderRadius: '50%',
            backgroundColor: hoverType === 'input' ? '#eab308' : pageColor,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 10px ${pageColor}`,
            transition: 'width 0.15s ease, height 0.15s ease, background-color 0.2s ease'
          }}
        />
      </div>
    </>
  );
}
