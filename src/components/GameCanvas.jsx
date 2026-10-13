import React, { useEffect, useRef, useState } from 'react';
import machineSrc from '../assets/machine.png';
import clawSrc from '../assets/claw.png';
import pandaSrc from '../assets/plushie_panda.png';
import pinkSrc from '../assets/plushie_pink.png';
import octopusSrc from '../assets/plushie_octopus.png';

const W = 480;
const H = 420;
const CLAW_W = 64;
const CLAW_H = 80;
const PLUSH = 52;
const TOP_Y = 36;
const BOTTOM_Y = 275; // claw top when fully down (tips reach plushies)
const MIN_X = 80;
const MAX_X = 400;
const CHUTE_X = 95;
const GRAB_RANGE_X = 50;
// Perfect center ≈ 55% hit; edge of range ≈ 20%. Never guaranteed.
const HIT_CHANCE_MAX = 0.55;
const HIT_CHANCE_MIN = 0.2;

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function makePlushies() {
  const kinds = ['panda', 'pink', 'octopus'];
  const list = [];
  let id = 1;
  // denser pit: 3 rows × mixed kinds
  const rows = [
    { y: 305, xs: [130, 175, 220, 265, 310, 355] },
    { y: 330, xs: [145, 195, 245, 295, 340] },
    { y: 352, xs: [160, 210, 260, 310] }
  ];
  for (const row of rows) {
    for (const x of row.xs) {
      list.push({
        id: id++,
        kind: kinds[(id + x) % kinds.length],
        x,
        y: row.y + ((id % 3) - 1) * 3,
        held: false,
        won: false
      });
    }
  }
  return list;
}

/** Simple API used by editor code each frame */
function makeClawApi(s) {
  const free = () => s.plushies.filter((p) => !p.held && !p.won);

  return {
    get x() {
      return s.clawX;
    },
    get y() {
      return s.clawY;
    },
    get isIdle() {
      return s.mode === 'idle';
    },
    get hasPlushie() {
      return s.heldId != null;
    },
    get atChute() {
      return Math.abs(s.clawX - CHUTE_X) < 28;
    },
    get nearestPlushie() {
      const list = free();
      if (!list.length) return null;
      let best = list[0];
      let bestD = Math.abs(best.x - s.clawX);
      for (const p of list) {
        const d = Math.abs(p.x - s.clawX);
        if (d < bestD) {
          best = p;
          bestD = d;
        }
      }
      return { x: best.x, y: best.y, kind: best.kind };
    },
    move(speed = 3) {
      if (s.mode !== 'idle') return;
      s.clawX += speed;
      s.clawX = Math.max(MIN_X, Math.min(MAX_X, s.clawX));
    },
    moveTo(x, speed = 3) {
      if (s.mode !== 'idle') return;
      const dx = x - s.clawX;
      if (Math.abs(dx) <= speed) s.clawX = x;
      else s.clawX += Math.sign(dx) * speed;
      s.clawX = Math.max(MIN_X, Math.min(MAX_X, s.clawX));
    },
    moveToChute(speed = 4) {
      this.moveTo(CHUTE_X, speed);
    },
    drop() {
      if (s.mode === 'idle' && s.heldId == null) s.wantDrop = true;
    },
    release() {
      if (s.mode === 'idle' && s.heldId != null) s.wantRelease = true;
    }
  };
}

function tryGrab(s) {
  // Find nearest plushie under the claw
  let best = null;
  let bestDx = GRAB_RANGE_X;
  for (const p of s.plushies) {
    if (p.held || p.won) continue;
    const dx = Math.abs(p.x - s.clawX);
    if (dx < bestDx) {
      bestDx = dx;
      best = p;
    }
  }

  if (!best) return 'empty';

  // Closer aim = better odds, but still can miss
  const accuracy = 1 - bestDx / GRAB_RANGE_X;
  const chance = HIT_CHANCE_MIN + accuracy * (HIT_CHANCE_MAX - HIT_CHANCE_MIN);
  const hit = Math.random() < chance;

  if (hit) {
    best.held = true;
    s.heldId = best.id;
    return 'hit';
  }

  // Miss: claw slips — nudge the plushie a bit
  best.x = Math.max(MIN_X, Math.min(MAX_X, best.x + (Math.random() - 0.5) * 28));
  best.y = Math.min(360, best.y + 4 + Math.random() * 8);
  return 'miss';
}

function playMissSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = playWinSound._ctx || (playWinSound._ctx = new Ctx());
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // ignore
  }
}

function playHitSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = playWinSound._ctx || (playWinSound._ctx = new Ctx());
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch {
    // ignore
  }
}

const KIND_LABEL = { panda: 'Panda', pink: 'Pink', octopus: 'Octopus' };

/** Short victory jingle (Web Audio — no file needed) */
function playWinSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = playWinSound._ctx || (playWinSound._ctx = new Ctx());
    if (ctx.state === 'suspended') ctx.resume();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch {
    // ignore audio errors
  }
}

/** Draw a coordinate grid overlay on a canvas context */
function drawCoords(ctx, W, H) {
  const STEP = 60;
  ctx.save();

  // --- Grid lines (brighter so they show through the machine image) ---
  ctx.strokeStyle = 'rgba(3, 13, 11, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 5]);
  for (let x = 0; x <= W; x += STEP) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += STEP) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.setLineDash([]);

  // Use a safe font that is always available in canvas (no web-font dependency)
  const FONT = 'bold 11px monospace';
  ctx.font = FONT;

  // --- X-axis labels along the bottom ---
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  for (let x = STEP; x < W; x += STEP) {
    const label = String(x);
    const tw = ctx.measureText(label).width;
    // solid dark pill
    ctx.fillStyle = 'rgba(10, 10, 20, 0.85)';
    ctx.fillRect(x - tw / 2 - 3, H - 17, tw + 6, 15);
    ctx.fillStyle = '#00ffcc';
    ctx.fillText(label, x, H - 4);
  }

  // --- Y-axis labels along the left ---
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let y = STEP; y < H; y += STEP) {
    const label = String(y);
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(10, 10, 20, 0.85)';
    ctx.fillRect(2, y - 8, tw + 6, 16);
    ctx.fillStyle = '#00ffcc';
    ctx.fillText(label, 4, y);
  }

  // --- Origin label ---
  ctx.fillStyle = 'rgba(10,10,20,0.75)';
  ctx.fillRect(2, 2, 36, 16);
  ctx.fillStyle = 'rgba(0, 255, 204, 0.75)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('(0,0)', 4, 3);

  ctx.restore();
}


export function GameCanvas({ userCodeFnRef }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    clawX: 240,
    clawY: TOP_Y,
    mode: 'idle',
    heldId: null,
    wantDrop: false,
    wantRelease: false,
    plushies: makePlushies(),
    score: 0
  });
  const imgsRef = useRef(null);
  const [score, setScore] = useState(0);
  const [ready, setReady] = useState(false);
  const [banner, setBanner] = useState(null); // { type, title, text }
  const [showCoords, setShowCoords] = useState(false);
  const showCoordsRef = useRef(false);
  showCoordsRef.current = showCoords;
  const bannerTimerRef = useRef(null);


  const showBanner = (type, title, text, ms = 1800) => {
    setBanner({ type, title, text });
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => setBanner(null), ms);
  };

  const celebrateWin = (kind, nextScore) => {
    playWinSound();
    showBanner(
      'win',
      'YOU WIN!',
      `You won a ${KIND_LABEL[kind] || 'plushie'}!  (${nextScore} total)`,
      2800
    );
  };

  useEffect(() => {
    let alive = true;
    Promise.all([
      loadImage(machineSrc),
      loadImage(clawSrc),
      loadImage(pandaSrc),
      loadImage(pinkSrc),
      loadImage(octopusSrc)
    ]).then(([machine, claw, panda, pink, octopus]) => {
      if (!alive) return;
      imgsRef.current = { machine, claw, panda, pink, octopus };
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame;

    const tick = () => {
      const s = stateRef.current;
      const imgs = imgsRef.current;
      const claw = makeClawApi(s);

      // Run editor script every frame
      const fn = userCodeFnRef?.current;
      if (fn) {
        try {
          fn(claw);
        } catch {
          // ignore runtime errors so the loop keeps going
        }
      }

      // Start drop from script
      if (s.wantDrop && s.mode === 'idle') {
        s.wantDrop = false;
        s.mode = 'down';
      }

      // Release held plushie from script (over chute = win, else drop in pit)
      if (s.wantRelease && s.mode === 'idle' && s.heldId != null) {
        s.wantRelease = false;
        const held = s.plushies.find((p) => p.id === s.heldId);
        if (held) {
          if (claw.atChute) {
            const kind = held.kind;
            held.won = true;
            held.held = false;
            s.score += 1;
            setScore(s.score);
            celebrateWin(kind, s.score);
          } else {
            held.held = false;
            held.x = s.clawX;
            held.y = 320 + Math.random() * 30;
          }
        }
        s.heldId = null;
      }

      if (s.mode === 'down') {
        s.clawY += 5;
        if (s.clawY >= BOTTOM_Y) {
          s.clawY = BOTTOM_Y;
          const result = tryGrab(s);
          if (result === 'hit') {
            playHitSound();
            showBanner('hit', 'HIT!', 'Got a plushie — take it to the chute!');
          } else if (result === 'miss') {
            playMissSound();
            showBanner('miss', 'MISS!', 'The claw slipped — try again');
          }
          s.mode = 'up';
        }
      } else if (s.mode === 'up') {
        s.clawY -= 5;
        if (s.clawY <= TOP_Y) {
          s.clawY = TOP_Y;
          s.mode = 'idle';
        }
      }

      // Stick grabbed plushie under claw tips
      for (const p of s.plushies) {
        if (p.held) {
          p.x = s.clawX;
          p.y = s.clawY + CLAW_H - 8;
        }
      }

      // Draw
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#1a1030';
      ctx.fillRect(0, 0, W, H);

      if (imgs.machine) ctx.drawImage(imgs.machine, 20, 10, W - 40, H - 30);

      // Plushies (draw held ones after claw so they look grabbed)
      for (const p of s.plushies) {
        if (p.won || p.held) continue;
        const img =
          p.kind === 'panda' ? imgs.panda : p.kind === 'pink' ? imgs.pink : imgs.octopus;
        if (img) ctx.drawImage(img, p.x - PLUSH / 2, p.y - PLUSH / 2, PLUSH, PLUSH);
      }

      // Cable + claw
      ctx.strokeStyle = '#5a4a7a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.clawX, 24);
      ctx.lineTo(s.clawX, s.clawY + 8);
      ctx.stroke();

      if (imgs.claw) {
        ctx.drawImage(imgs.claw, s.clawX - CLAW_W / 2, s.clawY, CLAW_W, CLAW_H);
      }

      for (const p of s.plushies) {
        if (!p.held) continue;
        const img =
          p.kind === 'panda' ? imgs.panda : p.kind === 'pink' ? imgs.pink : imgs.octopus;
        if (img) ctx.drawImage(img, p.x - PLUSH / 2, p.y - PLUSH / 2, PLUSH, PLUSH);
      }

      let prizeI = 0;
      for (const p of s.plushies) {
        if (!p.won) continue;
        const img =
          p.kind === 'panda' ? imgs.panda : p.kind === 'pink' ? imgs.pink : imgs.octopus;
        if (img) {
          ctx.drawImage(img, 28 + prizeI * 30, H - 58, 34, 34);
          prizeI += 1;
        }
      }

      // Coordinate overlay (toggled by "Coords" button)
      if (showCoordsRef.current) {
        drawCoords(ctx, W, H);

        // --- Live claw position crosshair ---
        ctx.save();
        // Vertical line at clawX
        ctx.strokeStyle = 'rgba(255, 220, 50, 0.65)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(s.clawX, 0);
        ctx.lineTo(s.clawX, H);
        ctx.stroke();
        // Horizontal line at clawY
        ctx.beginPath();
        ctx.moveTo(0, s.clawY);
        ctx.lineTo(W, s.clawY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small dot at exact claw origin (clawX, clawY)
        ctx.fillStyle = '#ffdc32';
        ctx.beginPath();
        ctx.arc(s.clawX, s.clawY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Live coordinate label — position it so it doesn't clip off edges
        const label = `x:${Math.round(s.clawX)}  y:${Math.round(s.clawY)}`;
        ctx.font = 'bold 11px monospace';
        const tw = ctx.measureText(label).width;
        let lx = s.clawX + 8;
        let ly = s.clawY - 22;
        if (lx + tw + 8 > W) lx = s.clawX - tw - 12;
        if (ly < 4) ly = s.clawY + 8;
        ctx.fillStyle = 'rgba(10, 10, 20, 0.88)';
        ctx.fillRect(lx - 4, ly - 2, tw + 8, 18);
        ctx.strokeStyle = '#ffdc32';
        ctx.lineWidth = 1;
        ctx.strokeRect(lx - 4, ly - 2, tw + 8, 18);
        ctx.fillStyle = '#ffdc32';
        ctx.textBaseline = 'top';
        ctx.fillText(label, lx, ly + 1);
        ctx.restore();
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, [ready]);

  const reset = () => {
    stateRef.current = {
      clawX: 240,
      clawY: TOP_Y,
      mode: 'idle',
      heldId: null,
      wantDrop: false,
      wantRelease: false,
      plushies: makePlushies(),
      score: 0
    };
    setScore(0);
    setBanner(null);
  };

  return (
    <div className="game-panel">
      <div className="game-hud">
        <span>Claw Game</span>
        <span>Score: {score}</span>
      </div>
      <div className="game-canvas-wrap">
        <canvas ref={canvasRef} width={W} height={H} className="game-canvas" />
        {banner && (
          <div className={`win-banner banner-${banner.type}`} role="status">
            <strong>{banner.title}</strong>
            <span>{banner.text}</span>
          </div>
        )}
      </div>
      <div className="game-controls">
        <button type="button" className="btn" onClick={reset}>
          Reset pit
        </button>
        <button
          type="button"
          className={`btn${showCoords ? ' game-active' : ''}`}
          onClick={() => setShowCoords((v) => !v)}
          title="Toggle coordinate grid overlay"
        >
          {showCoords ? '📐 Coords ON' : '📐 Coords'}
        </button>
      </div>
      <p className="game-hint">
        Write claw code in the editor → Run (Ctrl+Enter)
      </p>
    </div>
  );
}
