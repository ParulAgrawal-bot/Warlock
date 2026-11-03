import React, { useRef, useState, useEffect, useCallback } from 'react';
import { MonacoEditor } from './components/MonacoEditor';
import { GameCanvas } from './components/GameCanvas';
import { DualRoom } from './components/DualRoom';
import { BowlingCanvas } from './components/BowlingCanvas';
import './App.css';


const CLAW_MANUAL = `/*
Claw commands: move, moveTo, moveToChute, drop, release.
Sensors: x, isIdle, hasPlushie, atChute, nearestPlushie.
Define a function, then call it each frame. state persists between frames.
*/
function controlClaw(claw, state) {
  if (!state.finished && claw.isIdle) {
    if (claw.hasPlushie) {
      if (claw.atChute) {
        claw.release();
        state.finished = true;
      } else {
        claw.moveToChute(4);
      }
    } else {
      const target = claw.nearestPlushie;
      if (target && Math.abs(claw.x - target.x) > 5) {
        claw.moveTo(target.x, 4);
      } else if (target) {
        claw.drop();
      }
    }
  }
}
controlClaw(claw, state);`;

const BOWLING_MANUAL = `/*
Bowling commands: move, moveTo, setAngle, turn, roll, resetLane.
Sensors: x, y, angle, isIdle, isRolling, pinsStanding, pinsDown.
Define a function, then call it each frame. state persists between frames.
*/
function playBowling(ball, state) {
  if (!state.thrown && ball.isIdle) {
    ball.setAngle(0);
    ball.roll(9);
    state.thrown = true;
  }
}
playBowling(ball, state);`;

const MANUALS = { claw: CLAW_MANUAL, bowling: BOWLING_MANUAL };

function ManualDialog({ game, onClose }) {
  const isBowling = game === 'bowling';
  return (
    <div className="manual-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="manual-dialog" role="dialog" aria-modal="true" aria-labelledby="manual-title">
        <header className="manual-dialog-header">
          <div>
            <h2 id="manual-title">{isBowling ? 'Bowling' : 'Claw Machine'} Manual</h2>
            <p>Function reference for the code editor</p>
          </div>
          <button type="button" className="btn" onClick={onClose} aria-label="Close manual">Close</button>
        </header>
        <div className="manual-dialog-content">
          <p>Your code runs once on every animation frame. The game provides an API object ({isBowling ? <code>ball</code> : <code>claw</code>}) and a <code>state</code> object. Put your logic in a function and call it at the bottom of the editor. Values saved on <code>state</code> persist between frames, which lets you perform one-time actions only once.</p>
          <h3>How to structure your code</h3>
          <pre><code>{isBowling
            ? 'function playBowling(ball, state) {\n  if (!state.thrown && ball.isIdle) {\n    ball.setAngle(-4);\n    ball.roll(8);\n    state.thrown = true;\n  }\n}\nplayBowling(ball, state);'
            : 'function controlClaw(claw, state) {\n  if (claw.isIdle && !state.finished) {\n    // choose an action using the sensors below\n  }\n}\ncontrolClaw(claw, state);'}</code></pre>
          <p>Press <strong>Run</strong> to execute the editor contents. The <strong>Manual</strong> button only opens this reference; it does not replace your code.</p>
          <h3>{isBowling ? 'Bowling functions' : 'Claw functions'}</h3>
          {isBowling ? (
            <dl className="manual-function-list">
              <dt><code>ball.move(speed)</code></dt><dd>Move the ball horizontally while it is ready to aim. Negative speed moves left; positive speed moves right.</dd>
              <dt><code>ball.moveTo(x, speed)</code></dt><dd>Move toward a lane x-coordinate. The ball stops at the target instead of stepping past it.</dd>
              <dt><code>ball.setAngle(degrees)</code></dt><dd>Set the throw direction: negative angles go left, positive angles go right, and 0 goes straight. The supported range is −35° to 35°.</dd>
              <dt><code>ball.turn(degrees)</code></dt><dd>Adjust the current angle by the given amount.</dd>
              <dt><code>ball.roll(power)</code></dt><dd>Start a throw when the ball is ready. Power is limited to 2–10; aim and set the angle before calling it.</dd>
              <dt><code>ball.resetLane()</code></dt><dd>Replace the pins and return the ball to the start after a roll. The score is kept.</dd>
            </dl>
          ) : (
            <dl className="manual-function-list">
              <dt><code>claw.move(speed)</code></dt><dd>Move the claw horizontally. Negative speed moves left; positive speed moves right.</dd>
              <dt><code>claw.moveTo(x, speed)</code></dt><dd>Move toward a target x-coordinate, stopping when the claw reaches it.</dd>
              <dt><code>claw.moveToChute(speed)</code></dt><dd>Move toward the prize chute on the left side of the machine.</dd>
              <dt><code>claw.drop()</code></dt><dd>Lower the claw to try to grab the nearest plushie. A grab can miss, especially when the claw is off-center.</dd>
              <dt><code>claw.release()</code></dt><dd>Release a held plushie. It scores only when the claw is over the chute.</dd>
            </dl>
          )}
          <h3>Sensor values</h3>
          <p>{isBowling
            ? <><code>ball.x</code> and <code>ball.y</code> are the ball coordinates; <code>ball.angle</code> is its aim angle. <code>ball.isIdle</code> is true while ready to aim or after a throw; <code>ball.isRolling</code> is true during a throw. <code>ball.pinsStanding</code> and <code>ball.pinsDown</code> report pin counts.</>
            : <><code>claw.x</code> and <code>claw.y</code> are the claw coordinates. <code>claw.isIdle</code> is true when the claw can take an action; <code>claw.hasPlushie</code> reports whether it is holding a prize; <code>claw.atChute</code> reports whether it is near the chute. <code>claw.nearestPlushie</code> returns the closest available prize's <code>{'{ x, y, kind }'}</code> or <code>null</code>.</>}</p>
          <h3>Tips</h3>
          <ul>
            <li>Check <code>isIdle</code> before issuing an action; movement and drop/roll commands are ignored while an animation is in progress.</li>
            <li>Use flags such as <code>state.thrown</code> or <code>state.finished</code> so your function does not repeat a completed action every frame.</li>
            <li>Use <strong>Stop</strong> to stop the script and <strong>Reset Game</strong> to restore the game and its example code.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

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
  const [resetKey, setResetKey] = useState(0);
  const [manualOpen, setManualOpen] = useState(false);
  const userCodeFnRef = useRef(null);
  const userCodeStateRef = useRef({});
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
      const compiled = new Function(arg, 'state', source);
      userCodeStateRef.current = {};
      userCodeFnRef.current = (gameApi) => {
        try {
          compiled(gameApi, userCodeStateRef.current);
        } catch (err) {
          userCodeFnRef.current = null;
          setRunMsg(`Runtime error: ${err.message}`);
        }
      };
      setRunMsg(whichGame === 'claw' ? 'Script running — claw follows your code' : 'Script running — ball follows your code');
      return true;
    } catch (err) {
      userCodeFnRef.current = null;
      userCodeStateRef.current = {};
      setRunMsg('Syntax error: ' + err.message);
      return false;
    }
  };

  const switchGame = (next) => {
    setGame(next);
    setCode(MANUALS[next]);
    userCodeFnRef.current = null;
    userCodeStateRef.current = {};
    setRunMsg(next === 'claw' ? 'Claw manual loaded — click Run to try the example' : 'Bowling manual loaded — click Run to try the example');
  };

  const handleRun    = () => compileAndRun(codeRef.current, gameRef.current);
  const handleStop = () => {
    userCodeFnRef.current = null;
    userCodeStateRef.current = {};
    setRunMsg('Script stopped');
  };
  const handleReset = () => {
    userCodeFnRef.current = null;
    userCodeStateRef.current = {};
    setCode(MANUALS[gameRef.current]);
    setResetKey((key) => key + 1);
    setRunMsg('Game reset — manual loaded; click Run to start');
  };
  const handleManual = () => setManualOpen(true);
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
          <DualRoom />
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
          <button type="button" className="btn" onClick={handleStop}>■ Stop</button>
          <button type="button" className="btn" onClick={handleReset}>↻ Reset Game</button>
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
          {game === 'claw' ? <GameCanvas userCodeFnRef={userCodeFnRef} resetKey={resetKey} onReset={handleReset} /> : <BowlingCanvas userCodeFnRef={userCodeFnRef} resetKey={resetKey} onReset={handleReset} />}
        </section>
      </main>
      {manualOpen && <ManualDialog game={game} onClose={() => setManualOpen(false)} />}
    </div>
  );
}

export default App;
