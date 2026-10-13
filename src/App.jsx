import React, { useRef, useState, useEffect, useCallback } from 'react';
import { MonacoEditor } from './components/MonacoEditor';
import { GameCanvas } from './components/GameCanvas';
import {CodingGameArena} from './components/dual_player'
import { BowlingCanvas } from './components/BowlingCanvas';
import './App.css';


const CLAW_MANUAL = `/*
================================================
  CLAW GAME — INSTRUCTION MANUAL
================================================

HOW TO PLAY
  1. Read the commands below.
  2. Click Run (or Ctrl+Enter) to start the example.
  3. Edit the code and Run again anytime.
  4. Grab plushies → LEFT chute → release to win.
  5. Drops can HIT or MISS (closer aim = better odds).

COMMANDS
  claw.move(speed)         Move (negative = left)
  claw.moveTo(x, speed)    Move toward x
  claw.moveToChute(speed)  Move to prize chute
  claw.drop()              Lower claw (may miss!)
  claw.release()           Drop held plushie

SENSORS
  claw.x  claw.y  claw.isIdle  claw.hasPlushie
  claw.atChute  claw.nearestPlushie
================================================
*/

`;

const BOWLING_MANUAL = `/*
================================================
  BOWLING GAME — INSTRUCTION MANUAL
================================================

HOW TO PLAY
  1. Read the commands below.
  2. Click Run (or Ctrl+Enter) to start the example.
  3. The ball rolls and flips front/back faces.
  4. Knock pins down — all 10 = STRIKE!

COMMANDS
  ball.move(speed)       Aim left/right (negative = left)
  ball.moveTo(x, speed)  Aim toward an x position
  ball.setAngle(deg)     Set throw angle (-35 … 35)
  ball.turn(deg)         Nudge angle (negative = left)
  ball.roll(power)       Roll! power 2–12
  ball.resetLane()       Reset pins + ball (keeps score)

SENSORS
  ball.x  ball.y  ball.angle
  ball.isIdle            Ready to aim / roll
  ball.isRolling         Ball is moving
  ball.pinsStanding      Pins still up
  ball.pinsDown          Pins already down
================================================
*/
`;

const MANUALS = { claw: CLAW_MANUAL, bowling: BOWLING_MANUAL };

/* ─────────────────────────────────────────────────────── */
/*  MODE SELECTION LOBBY                                   */
/* ─────────────────────────────────────────────────────── */
function ModeSelectionScreen({ onSelect }) {
  const [selectedGame, setSelectedGame] = useState('claw');

  return (
    <div className="lobby">
      <div className="lobby-header">
        <div className="lobby-title">GAME STUDIO</div>
        <div className="lobby-subtitle">Choose your play style</div>
      </div>

      {/* Game type selection */}
      <div className="lobby-section">
        <div className="lobby-section-label">Select Game</div>
        <div className="lobby-game-cards">
          {[
            { id: 'claw',    icon: '🎮', label: 'Claw Machine', desc: 'Code the claw to grab plushies' },
            { id: 'bowling', icon: '🎳', label: 'Bowling',       desc: 'Roll the ball to knock pins down' },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              className={`lobby-game-card${selectedGame === g.id ? ' lobby-game-card--active' : ''}`}
              onClick={() => setSelectedGame(g.id)}
            >
              <span className="lobby-card-icon">{g.icon}</span>
              <span className="lobby-card-label">{g.label}</span>
              <span className="lobby-card-desc">{g.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode selection */}
      <div className="lobby-section">
        <div className="lobby-section-label">Select Mode</div>
        <div className="lobby-mode-cards">
          {[
            {
              id: 'single',
              icon: '👤',
              label: 'Single Player',
              desc: 'One editor · one game\nWrite code to control the game.',
              tag: null,
            },
            {
              id: 'dual',
              icon: '⚔️',
              label: 'Double Player',
              desc: '1v1 coding battle\nSolve a random LeetCode-style problem.',
              tag: 'VS',
            },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              className="lobby-mode-card"
              onClick={() => onSelect(m.id, selectedGame)}
            >
              {m.tag && <div className="lobby-vs-tag">{m.tag}</div>}
              <span className="lobby-mode-icon">{m.icon}</span>
              <span className="lobby-mode-label">{m.label}</span>
              <span className="lobby-mode-desc">{m.desc}</span>
              <span className="lobby-mode-cta">Play →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────── */
/*  MAIN APP                                               */
/* ─────────────────────────────────────────────────────── */
export function App() {
  // mode: null = lobby | 'single' | 'dual'
  const [mode, setMode] = useState(null);
  const [game, setGame] = useState('claw');

  /* ── single-player state ── */
  const [code, setCode]     = useState(CLAW_MANUAL);
  const [copied, setCopied] = useState(false);
  const [runMsg, setRunMsg] = useState('Manual loaded — click Run to try the example');
  const userCodeFnRef = useRef(null);
  const codeRef       = useRef(CLAW_MANUAL);
  const gameRef       = useRef('claw');
  codeRef.current = code;
  gameRef.current = game;

  const handleLobbySelect = (selectedMode, selectedGame) => {
    setMode(selectedMode);
    if (selectedMode !== 'dual') {
      setGame(selectedGame);
      setCode(MANUALS[selectedGame]);
      userCodeFnRef.current = null;
      setRunMsg(selectedGame === 'claw'
        ? 'Claw manual loaded — click Run to try the example'
        : 'Bowling manual loaded — click Run to try the example');
    }
  };

  const compileAndRun = (source, whichGame) => {
    try {
      const arg = whichGame === 'claw' ? 'claw' : 'ball';
      userCodeFnRef.current = new Function(arg, source);
      setRunMsg(whichGame === 'claw' ? 'Script running — claw follows your code' : 'Script running — ball follows your code');
      return true;
    } catch (err) {
      userCodeFnRef.current = null;
      setRunMsg('Syntax error: ' + err.message);
      return false;
    }
  };

  const switchGame = (next) => {
    setGame(next);
    setCode(MANUALS[next]);
    userCodeFnRef.current = null;
    setRunMsg(next === 'claw' ? 'Claw manual loaded — click Run to try the example' : 'Bowling manual loaded — click Run to try the example');
  };

  const handleRun    = () => compileAndRun(codeRef.current, gameRef.current);
  const handleManual = () => { const m = MANUALS[game]; setCode(m); compileAndRun(m, game); setRunMsg('Manual example running — edit code anytime, then Run'); };
  const handleCopy   = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  /* ── LOBBY ── */
  if (mode === null) {
    return <ModeSelectionScreen onSelect={handleLobbySelect} />;
  }

  /* ── DOUBLE PLAYER / DUALS ── */
  if (mode === 'dual') {
    return (
      <div className="app">
        <header className="toolbar">
          <div className="brand">Game Studio</div>
          <div className="toolbar-actions">
            <span className="mode-badge mode-badge--dual">⚔️ Double Player</span>
            <button type="button" className="btn lobby-back-btn" onClick={() => setMode(null)}>← Lobby</button>
          </div>
        </header>
        <main className="duals-section">
          <CodingGameArena />
        </main>
      </div>
    );
  }

  const GameSwitcher = () => (
    <div className="game-switch">
      <button type="button" className={`btn ${game === 'claw'    ? 'game-active' : ''}`} onClick={() => switchGame('claw')}>Claw</button>
      <button type="button" className={`btn ${game === 'bowling' ? 'game-active' : ''}`} onClick={() => switchGame('bowling')}>Bowling</button>
    </div>
  );

  /* ── SINGLE PLAYER ── */
  return (
    <div className="app">
      <header className="toolbar">
        <div className="brand">Game Studio</div>
        <div className="toolbar-actions">
          <span className="mode-badge">👤 Single Player</span>
          <GameSwitcher />
          <button type="button" className="btn run-btn" onClick={handleRun}>▶ Run</button>
          <button type="button" className="btn" onClick={handleCopy}>{copied ? 'Copied' : 'Copy'}</button>
          <button type="button" className="btn" onClick={handleManual}>Manual</button>
          <button type="button" className="btn lobby-back-btn" onClick={() => setMode(null)}>← Lobby</button>
        </div>
      </header>
      <main className="workspace">
        <section className="editor-panel">
          <div className="editor-status">{runMsg}</div>
          <div className="editor-body">
            <MonacoEditor language="Javascript" value={code} onChange={setCode} onRun={handleRun} />
          </div>
        </section>
        <section className="game-side">
          {game === 'claw' ? <GameCanvas userCodeFnRef={userCodeFnRef} /> : <BowlingCanvas userCodeFnRef={userCodeFnRef} />}
        </section>
      </main>
    </div>
  );
}

export default App;
