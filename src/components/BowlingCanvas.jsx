import React, { useEffect, useRef, useState } from 'react';
import pinSrc from '../assets/pin.png';
import ballSrc from '../assets/ball.png';
import ballMarkedSrc from '../assets/ball_marked.png';

const W = 480;
const H = 420;
const BALL_R = 22;
const PIN_W = 28;
const PIN_H = 48;
const LANE_LEFT = 90;
const LANE_RIGHT = 390;
const BALL_START_Y = 370;
const PIN_BASE_Y = 70;
const ANGLE_MIN = -35;
const ANGLE_MAX = 35;

function clampAngle(deg) {
  const n = Number(deg);
  if (Number.isNaN(n)) return 0;
  return Math.max(ANGLE_MIN, Math.min(ANGLE_MAX, n));
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Classic 10-pin triangle near the top of the lane */
function makePins() {
  const pins = [];
  let id = 1;
  const rows = [
    { y: PIN_BASE_Y, count: 4 },
    { y: PIN_BASE_Y + 38, count: 3 },
    { y: PIN_BASE_Y + 76, count: 2 },
    { y: PIN_BASE_Y + 114, count: 1 }
  ];
  const cx = W / 2;
  for (const row of rows) {
    const span = (row.count - 1) * 36;
    const startX = cx - span / 2;
    for (let i = 0; i < row.count; i++) {
      pins.push({
        id: id++,
        x: startX + i * 36,
        y: row.y,
        up: true,
        vx: 0,
        vy: 0,
        angle: 0,
        spin: 0
      });
    }
  }
  return pins;
}

function makeBallApi(s) {
  return {
    get x() {
      return s.ball.x;
    },
    get y() {
      return s.ball.y;
    },
    /** Aim angle in degrees: 0 = straight, negative = left, positive = right */
    get angle() {
      return s.ball.aimAngle;
    },
    get isIdle() {
      return s.mode === 'aim' || s.mode === 'done';
    },
    get isRolling() {
      return s.mode === 'rolling';
    },
    get pinsStanding() {
      return s.pins.filter((p) => p.up).length;
    },
    get pinsDown() {
      return s.pins.filter((p) => !p.up).length;
    },
    move(speed = 3) {
      if (s.mode !== 'aim') return;
      s.ball.x += speed;
      s.ball.x = Math.max(LANE_LEFT + 20, Math.min(LANE_RIGHT - 20, s.ball.x));
    },
    moveTo(x, speed = 3) {
      if (s.mode !== 'aim') return;
      const dx = x - s.ball.x;
      if (Math.abs(dx) <= speed) s.ball.x = x;
      else s.ball.x += Math.sign(dx) * speed;
      s.ball.x = Math.max(LANE_LEFT + 20, Math.min(LANE_RIGHT - 20, s.ball.x));
    },
    /** Set throw angle in degrees (-35 … 35) */
    setAngle(deg) {
      if (s.mode !== 'aim') return;
      s.ball.aimAngle = clampAngle(deg);
    },
    /** Nudge throw angle by deg (negative = more left) */
    turn(deg = 1) {
      if (s.mode !== 'aim') return;
      s.ball.aimAngle = clampAngle(s.ball.aimAngle + (Number(deg) || 0));
    },
    roll(power = 6) {
      if (s.mode !== 'aim') return;
      const p = Math.max(2, Math.min(12, Number(power) || 6));
      s.wantRoll = p;
    },
    resetLane() {
      if (s.mode === 'rolling') return;
      s.wantReset = true;
    }
  };
}

function playStrikeSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = playStrikeSound._ctx || (playStrikeSound._ctx = new Ctx());
    if (ctx.state === 'suspended') ctx.resume();
    [392, 523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.28);
    });
  } catch {
    // ignore
  }
}

function playBowlSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = playStrikeSound._ctx || (playStrikeSound._ctx = new Ctx());
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.42);
  } catch {
    // ignore
  }
}

/** Draw a coordinate grid overlay on a canvas context */
function drawCoords(ctx, W, H) {
  const STEP = 60;
  ctx.save();

  // Grid lines
  ctx.strokeStyle = 'rgba(0, 255, 204, 0.30)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 5]);
  for (let x = 0; x <= W; x += STEP) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += STEP) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.setLineDash([]);

  const FONT = 'bold 11px monospace';
  ctx.font = FONT;

  // X-axis labels along the bottom
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  for (let x = STEP; x < W; x += STEP) {
    const label = String(x);
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(10, 10, 20, 0.85)';
    ctx.fillRect(x - tw / 2 - 3, H - 17, tw + 6, 15);
    ctx.fillStyle = '#00ffcc';
    ctx.fillText(label, x, H - 4);
  }

  // Y-axis labels along the left
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

  // Origin label
  ctx.fillStyle = 'rgba(10,10,20,0.75)';
  ctx.fillRect(2, 2, 36, 16);
  ctx.fillStyle = 'rgba(0, 255, 204, 0.75)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('(0,0)', 4, 3);

  ctx.restore();
}

export function BowlingCanvas({ userCodeFnRef }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    mode: 'aim', // aim | rolling | done
    ball: { x: W / 2, y: BALL_START_Y, vx: 0, vy: 0, spin: 0, aimAngle: 0, power: 0 },
    pins: makePins(),
    wantRoll: 0,
    wantReset: false,
    score: 0,
    frameScore: 0
  });
  const imgsRef = useRef(null);
  const [score, setScore] = useState(0);
  const [standing, setStanding] = useState(10);
  const [ready, setReady] = useState(false);
  const [banner, setBanner] = useState(null);
  const [showCoords, setShowCoords] = useState(false);
  const showCoordsRef = useRef(false);
  showCoordsRef.current = showCoords;
  const bannerTimerRef = useRef(null);


  const showBanner = (type, title, text, ms = 2200) => {
    setBanner({ type, title, text });
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => setBanner(null), ms);
  };

  useEffect(() => {
    let alive = true;
    Promise.all([loadImage(pinSrc), loadImage(ballSrc), loadImage(ballMarkedSrc)]).then(
      ([pin, ball, ballMarked]) => {
        if (!alive) return;
        imgsRef.current = { pin, ball, ballMarked };
        setReady(true);
      }
    );
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame;

    const finishRoll = (s) => {
      const down = s.pins.filter((p) => !p.up).length;
      s.frameScore = down;
      s.score += down;
      setScore(s.score);
      setStanding(s.pins.filter((p) => p.up).length);
      s.mode = 'done';
      s.ball.vx = 0;
      s.ball.vy = 0;

      if (down === 10) {
        playStrikeSound();
        showBanner('win', 'STRIKE!', 'All 10 pins down — nice roll!');
      } else if (down > 0) {
        playStrikeSound();
        showBanner('hit', 'HIT!', `${down} pin${down === 1 ? '' : 's'} knocked down`);
      } else {
        showBanner('miss', 'GUTTER!', 'No pins hit — aim and roll again');
      }
    };

    const resetBallAndPins = (s, keepScore = true) => {
      s.pins = makePins();
      s.ball = {
        x: W / 2,
        y: BALL_START_Y,
        vx: 0,
        vy: 0,
        spin: 0,
        aimAngle: 0,
        power: 0
      };
      s.mode = 'aim';
      s.wantRoll = 0;
      s.frameScore = 0;
      if (!keepScore) {
        s.score = 0;
        setScore(0);
      }
      setStanding(10);
      setBanner(null);
    };

    const tick = () => {
      const s = stateRef.current;
      const imgs = imgsRef.current;
      const ballApi = makeBallApi(s);

      const fn = userCodeFnRef?.current;
      if (fn) {
        try {
          fn(ballApi);
        } catch {
          // ignore script errors
        }
      }

      if (s.wantReset) {
        s.wantReset = false;
        resetBallAndPins(s, true);
      }

      if (s.wantRoll && s.mode === 'aim') {
        const power = s.wantRoll;
        s.wantRoll = 0;
        s.mode = 'rolling';
        s.ball.power = power;
        const speed = 2.2 + power * 0.55;
        const rad = (s.ball.aimAngle * Math.PI) / 180;
        // 0° = straight up the lane; +angle curves right, -angle curves left
        s.ball.vx = Math.sin(rad) * speed;
        s.ball.vy = -Math.cos(rad) * speed;
        playBowlSound();
      }

      if (s.mode === 'rolling') {
        const b = s.ball;
        b.x += b.vx;
        b.y += b.vy;
        // roll spin — drives front/back face swaps
        b.spin += Math.hypot(b.vx, b.vy) * 0.14;
        // light friction
        b.vy *= 0.998;
        b.vx *= 0.995;

        // bounce off gutters
        if (b.x < LANE_LEFT + BALL_R) {
          b.x = LANE_LEFT + BALL_R;
          b.vx = Math.abs(b.vx) * 0.4;
        }
        if (b.x > LANE_RIGHT - BALL_R) {
          b.x = LANE_RIGHT - BALL_R;
          b.vx = -Math.abs(b.vx) * 0.4;
        }

        // hit pins
        for (const p of s.pins) {
          if (!p.up) continue;
          const dx = p.x - b.x;
          const dy = p.y - b.y;
          const dist = Math.hypot(dx, dy);
          const hitR = BALL_R + 14;
          if (dist < hitR) {
            p.up = false;
            const force = Math.hypot(b.vx, b.vy);
            p.vx = (dx / (dist || 1)) * force * 0.8 + b.vx * 0.5;
            p.vy = (dy / (dist || 1)) * force * 0.5 + b.vy * 0.3;
            p.spin = (Math.random() - 0.5) * 0.4;
            // ball deflects a little
            b.vx -= dx * 0.01;
            b.vy *= 0.92;
          }
        }

        // pin-pin knock
        for (let i = 0; i < s.pins.length; i++) {
          const a = s.pins[i];
          if (a.up) continue;
          for (let j = 0; j < s.pins.length; j++) {
            if (i === j) continue;
            const bPin = s.pins[j];
            if (!bPin.up) continue;
            const dx = bPin.x - a.x;
            const dy = bPin.y - a.y;
            if (Math.hypot(dx, dy) < 30 && Math.hypot(a.vx, a.vy) > 1.2) {
              bPin.up = false;
              bPin.vx = a.vx * 0.6 + (Math.random() - 0.5);
              bPin.vy = a.vy * 0.6;
              bPin.spin = (Math.random() - 0.5) * 0.35;
            }
          }
        }

        // fallen pins slide
        for (const p of s.pins) {
          if (p.up) continue;
          p.x += p.vx;
          p.y += p.vy;
          p.angle += p.spin;
          p.vx *= 0.96;
          p.vy *= 0.96;
        }

        // end when ball leaves lane or slows near pins
        if (b.y < 20 || (b.y < 160 && Math.hypot(b.vx, b.vy) < 0.8)) {
          finishRoll(s);
        }
      }

      // ---- draw ----
      ctx.clearRect(0, 0, W, H);

      // alley background
      ctx.fillStyle = '#1a1528';
      ctx.fillRect(0, 0, W, H);

      // gutters
      ctx.fillStyle = '#2a2038';
      ctx.fillRect(LANE_LEFT - 28, 20, 28, H - 40);
      ctx.fillRect(LANE_RIGHT, 20, 28, H - 40);

      // lane
      const laneGrad = ctx.createLinearGradient(0, 0, 0, H);
      laneGrad.addColorStop(0, '#c4a574');
      laneGrad.addColorStop(1, '#a88858');
      ctx.fillStyle = laneGrad;
      ctx.fillRect(LANE_LEFT, 20, LANE_RIGHT - LANE_LEFT, H - 40);

      // lane boards
      ctx.strokeStyle = 'rgba(80, 50, 20, 0.25)';
      ctx.lineWidth = 1;
      for (let x = LANE_LEFT + 20; x < LANE_RIGHT; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 20);
        ctx.lineTo(x, H - 20);
        ctx.stroke();
      }

      // approach arrows
      ctx.fillStyle = 'rgba(40, 30, 15, 0.35)';
      for (let i = 0; i < 5; i++) {
        const ay = 240 + i * 22;
        ctx.beginPath();
        ctx.moveTo(W / 2, ay);
        ctx.lineTo(W / 2 - 8, ay + 12);
        ctx.lineTo(W / 2 + 8, ay + 12);
        ctx.fill();
      }

      // Aim guide (shows throw angle while aiming)
      if (s.mode === 'aim') {
        const bAim = s.ball;
        const rad = (bAim.aimAngle * Math.PI) / 180;
        const len = 90;
        const ex = bAim.x + Math.sin(rad) * len;
        const ey = bAim.y - Math.cos(rad) * len;
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.75)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(bAim.x, bAim.y - BALL_R);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.setLineDash([]);
        // angle label
        ctx.fillStyle = '#00ffcc';
        ctx.font = '12px Share Tech Mono, monospace';
        ctx.fillText(`${bAim.aimAngle.toFixed(0)}°`, bAim.x + 18, bAim.y - 10);
      }

      // pins
      for (const p of s.pins) {
        if (!imgs.pin) continue;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        if (!p.up) ctx.globalAlpha = 0.9;
        ctx.drawImage(imgs.pin, -PIN_W / 2, -PIN_H / 2, PIN_W, PIN_H);
        ctx.restore();
      }

      // Ball: alternate front (ball) / back (ball_marked) as it rolls
      const b = s.ball;
      if (s.mode === 'aim' || s.mode === 'rolling' || s.mode === 'done') {
        const showBack =
          Math.floor((((b.spin % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / Math.PI) % 2 === 1;
        const ballImg = showBack
          ? imgs.ballMarked || imgs.ball
          : imgs.ball || imgs.ballMarked;
        if (ballImg) {
          ctx.save();
          ctx.translate(b.x, b.y);
          const faceSpin = (b.spin % Math.PI) - Math.PI / 2;
          ctx.rotate(s.mode === 'rolling' || s.mode === 'done' ? faceSpin * 0.35 : 0);
          ctx.drawImage(ballImg, -BALL_R, -BALL_R, BALL_R * 2, BALL_R * 2);
          ctx.restore();
        }
      }

      // Coordinate overlay (toggled by "Coords" button)
      if (showCoordsRef.current) drawCoords(ctx, W, H);

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, [ready]);

  const reset = () => {
    stateRef.current.wantReset = true;
    stateRef.current.score = 0;
    setScore(0);
    setStanding(10);
    setBanner(null);
    // full reset including score
    stateRef.current.pins = makePins();
    stateRef.current.ball = {
      x: W / 2,
      y: BALL_START_Y,
      vx: 0,
      vy: 0,
      spin: 0,
      aimAngle: 0,
      power: 0
    };
    stateRef.current.mode = 'aim';
    stateRef.current.wantRoll = 0;
  };

  return (
    <div className="game-panel">
      <div className="game-hud">
        <span>Bowling</span>
        <span>
          Score: {score} · Pins: {standing}
        </span>
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
          Reset lane
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
        Aim with move / setAngle, then ball.roll(power)
      </p>
    </div>
  );
}
