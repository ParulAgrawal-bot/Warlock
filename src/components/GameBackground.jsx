import React, { useEffect, useRef } from 'react';

export const BG_MODES = [
  { id: 'synthwave', name: 'Synthwave', icon: '🌆' },
  { id: 'matrix', name: 'Matrix Rain', icon: '🟢' },
  { id: 'starfield', name: 'Deep Space', icon: '🌌' },
  { id: 'grid', name: 'Cyber Grid', icon: '⚡' }
];

export const GameBackground = ({ mode = 'synthwave' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Matrix Rain state
    const chars = '0123456789ABCDEFWARLOCK<>{}[]*+=#';
    const fontSize = 16;
    const cols = Math.floor(width / fontSize) + 1;
    const drops = Array.from({ length: cols }, () => Math.floor(Math.random() * -30));

    // Starfield state
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * width,
      color: ['#00ffff', '#ff00aa', '#00ff66', '#ffffff'][Math.floor(Math.random() * 4)]
    }));

    // Synthwave state
    let gridOffset = 0;
    let animId;

    const render = () => {
      if (mode === 'matrix') {
        ctx.fillStyle = 'rgba(4, 7, 5, 0.15)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px monospace`;
        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          ctx.fillStyle = '#ffffff';
          ctx.fillText(char, x, y);
          ctx.fillStyle = '#00ff66';
          ctx.fillText(char, x, y - fontSize);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      } else if (mode === 'starfield') {
        ctx.fillStyle = 'rgba(6, 8, 16, 0.3)';
        ctx.fillRect(0, 0, width, height);

        stars.forEach((star) => {
          star.z -= 4;
          if (star.z <= 0) {
            star.z = width;
            star.x = (Math.random() - 0.5) * width * 2;
            star.y = (Math.random() - 0.5) * height * 2;
          }

          const k = 250 / star.z;
          const px = star.x * k + width / 2;
          const py = star.y * k + height / 2;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            const size = Math.max(1, (1 - star.z / width) * 2.5);
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      } else if (mode === 'grid') {
        ctx.fillStyle = '#090b14';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(0, 255, 204, 0.08)';
        ctx.lineWidth = 1;
        const size = 40;
        for (let x = 0; x < width; x += size) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += size) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      } else {
        // Synthwave (Default)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, '#0a0316');
        skyGrad.addColorStop(0.6, '#350b44');
        skyGrad.addColorStop(1, '#120021');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        const horizon = height * 0.6;
        const sunRadius = Math.min(width, height) * 0.18;
        const sunX = width / 2;
        const sunY = horizon - sunRadius * 0.3;

        // Glowing Sun
        const sunGrad = ctx.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY + sunRadius);
        sunGrad.addColorStop(0, '#ffe600');
        sunGrad.addColorStop(0.5, '#ff007f');
        sunGrad.addColorStop(1, '#7928ca');

        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fillStyle = sunGrad;
        ctx.fill();

        // Sun Bars
        ctx.fillStyle = '#1c072c';
        for (let i = 0; i < 6; i++) {
          const barY = sunY + (i / 6) * sunRadius;
          ctx.fillRect(sunX - sunRadius - 10, barY, (sunRadius + 10) * 2, 3 + i * 2);
        }

        // Perspective Ground Grid
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, horizon, width, height - horizon);
        ctx.clip();

        gridOffset = (gridOffset + 1.2) % 30;

        ctx.strokeStyle = '#ff00aa';
        ctx.lineWidth = 1.2;
        const groundH = height - horizon;

        for (let i = 0; i < 15; i++) {
          const p = Math.pow((i + gridOffset / 30) / 15, 2.2);
          const y = horizon + p * groundH;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        const vLines = 24;
        for (let i = -vLines; i <= vLines; i++) {
          const startX = width / 2 + i * 15;
          const endX = width / 2 + i * (width / 10);
          ctx.beginPath();
          ctx.moveTo(startX, horizon);
          ctx.lineTo(endX, height);
          ctx.stroke();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [mode]);

  return (
    <div className="game-bg-root">
      <canvas ref={canvasRef} className="game-bg-canvas" />
      <div className="game-vignette" />
    </div>
  );
};
