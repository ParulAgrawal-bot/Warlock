import React, { useEffect, useRef } from 'react';

export const PowerModeSparks = ({ active = true, triggerCount = 0, combo = 0 }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const remaining = [];
      const colors = ['#00ffcc', '#ff007f', '#ffe600', '#39ff14', '#00d2ff', '#ffffff'];

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.alpha -= 0.025;
        p.size *= 0.96;

        if (p.alpha > 0.01 && p.size > 0.3) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          remaining.push(p);
        }
      }
      particlesRef.current = remaining;

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active]);

  // Spawn particles on keystroke trigger
  useEffect(() => {
    if (!active || triggerCount === 0) return;

    // Determine spawn coordinates near editor center or active cursor area
    const editorEl = document.querySelector('.monaco-editor');
    let originX = window.innerWidth / 2;
    let originY = window.innerHeight / 2;

    if (editorEl) {
      const cursorEl = editorEl.querySelector('.cursor');
      if (cursorEl) {
        const rect = cursorEl.getBoundingClientRect();
        if (rect.width || rect.height) {
          originX = rect.left;
          originY = rect.top;
        }
      } else {
        const rect = editorEl.getBoundingClientRect();
        originX = rect.left + rect.width * 0.45;
        originY = rect.top + rect.height * 0.4;
      }
    }

    const count = Math.min(12, 4 + Math.floor(combo / 10));
    const colors = combo > 30 
      ? ['#ff0055', '#ffe600', '#ff00aa', '#ffffff'] 
      : combo > 15 
      ? ['#00ffcc', '#00d2ff', '#ffe600'] 
      : ['#00ffcc', '#39ff14', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particlesRef.current.push({
        x: originX + (Math.random() - 0.5) * 10,
        y: originY + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 3.5 + 2,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }, [triggerCount, combo, active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="powermode-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};
