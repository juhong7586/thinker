import React, { useEffect, useRef } from 'react';

// Reusable Bubbles component
// Props: count (number of particles), className (optional wrapper class), size (optional {width,height})
export default function Bubbles({ count = 30, className, style }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const parent = containerRef.current || document.body;
    const particleNodes = [];

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'particle';
      el.style.position = 'absolute';
      el.style.left = Math.random() * 100 + '%';
      el.style.top = Math.random() * 100 + '%';
      el.style.width = '4px';
      el.style.height = '4px';
      el.style.background = 'rgba(255, 255, 255, 0.4)';
      el.style.borderRadius = '50%';
      el.style.pointerEvents = 'none';

      const phase = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.8;
      const amp = 8 + Math.random() * 28;

      parent.appendChild(el);
      particleNodes.push({ el, phase, speed, amp });
    }

    let rafId = null;
    const start = performance.now();

    const tick = (now) => {
      const t = (now - start) / 1000;
      for (const p of particleNodes) {
        const dx = Math.sin(t * p.speed + p.phase) * p.amp;
        const dy = Math.cos(t * (p.speed * 0.9) + p.phase) * (p.amp * 0.7);
        p.el.style.transform = `translate(${dx}px, ${dy}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      for (const p of particleNodes) {
        if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
      }
    };
  }, [count]);

  return <div ref={containerRef} className={className} style={style} />;
}