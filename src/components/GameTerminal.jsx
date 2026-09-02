import React, { useState } from 'react';
import { soundEngine } from '../utils/audio';

export const GameTerminal = ({
  logs = [],
  onClearLogs,
  codeStats,
  achievements = [],
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'stats' | 'quests' | 'ai'

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="game-terminal-panel">
      {/* Terminal Tab Bar */}
      <div className="terminal-header">
        <div className="terminal-tabs">
          <button
            className={`terminal-tab-btn ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playUiBlip(600);
              setActiveTab('output');
            }}
          >
            <span className="tab-icon">📟</span>
            <span className="tab-title">OUTPUT STREAM</span>
            {logs.length > 0 && <span className="tab-badge">{logs.length}</span>}
          </button>

          <button
            className={`terminal-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playUiBlip(600);
              setActiveTab('stats');
            }}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-title">TELEMETRY</span>
          </button>

          <button
            className={`terminal-tab-btn ${activeTab === 'quests' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playUiBlip(600);
              setActiveTab('quests');
            }}
          >
            <span className="tab-icon">🏆</span>
            <span className="tab-title">ACHIEVEMENTS ({unlockedCount}/{achievements.length})</span>
          </button>

          <button
            className={`terminal-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playUiBlip(600);
              setActiveTab('ai');
            }}
          >
            <span className="tab-icon">🤖</span>
            <span className="tab-title">WARLOCK AI COMPANION</span>
          </button>
        </div>

        <div className="terminal-controls">
          {activeTab === 'output' && (
            <button
              className="terminal-ctrl-btn"
              onClick={() => {
                soundEngine.playUiBlip(400);
                onClearLogs();
              }}
              title="Clear Terminal Output"
            >
              🧹 CLEAR
            </button>
          )}
          <button
            className="terminal-ctrl-btn close"
            onClick={() => {
              soundEngine.playUiBlip(500);
              onClose();
            }}
            title="Minimize Console"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Terminal Body Content */}
      <div className="terminal-body">
        {/* TAB 1: OUTPUT */}
        {activeTab === 'output' && (
          <div className="terminal-output-container">
            {logs.length === 0 ? (
              <div className="terminal-empty-state">
                <div className="empty-glyph">⚔️</div>
                <div className="empty-title">CYBER TERMINAL READY</div>
                <div className="empty-hint">Press [RUN SPELL] or Ctrl+Enter to execute current script</div>
              </div>
            ) : (
              <div className="logs-stream">
                {logs.map((log, idx) => (
                  <div key={idx} className={`log-entry ${log.type}`}>
                    <span className="log-timestamp">[{log.time}]</span>
                    <span className="log-type-tag">[{log.type.toUpperCase()}]</span>
                    <span className="log-content">{log.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TELEMETRY & STATS */}
        {activeTab === 'stats' && (
          <div className="terminal-stats-grid">
            <div className="stat-card">
              <span className="stat-label">LINES OF CODE</span>
              <span className="stat-value">{codeStats.lines}</span>
              <span className="stat-sub">Active buffer</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">TOTAL CHARACTERS</span>
              <span className="stat-value">{codeStats.characters}</span>
              <span className="stat-sub">Bytes of pure power</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">KEYSTROKE COMBO</span>
              <span className="stat-value combo-glow">x{codeStats.combo}</span>
              <span className="stat-sub">Active typing heat</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">TYPING SPEED</span>
              <span className="stat-value">{codeStats.wpm || 0} WPM</span>
              <span className="stat-sub">Words Per Minute</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">SPELLS CAST</span>
              <span className="stat-value">{codeStats.runsCount}</span>
              <span className="stat-sub">Program executions</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">SESSION XP GAINED</span>
              <span className="stat-value xp-glow">+{codeStats.sessionXp} XP</span>
              <span className="stat-sub">Rank progression</span>
            </div>
          </div>
        )}

        {/* TAB 3: ACHIEVEMENTS & QUESTS */}
        {activeTab === 'quests' && (
          <div className="achievements-grid">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">{ach.icon}</div>
                <div className="achievement-info">
                  <div className="achievement-title-row">
                    <span className="achievement-name">{ach.name}</span>
                    <span className="achievement-xp">+{ach.xp} XP</span>
                  </div>
                  <div className="achievement-desc">{ach.description}</div>
                  <div className="achievement-status">
                    {ach.unlocked ? '✅ UNLOCKED' : '🔒 IN PROGRESS'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: AI COMPANION */}
        {activeTab === 'ai' && (
          <div className="ai-companion-view">
            <div className="ai-avatar-card">
              <div className="hologram-ring">
                <span className="avatar-icon">🔮</span>
              </div>
              <div className="avatar-details">
                <h3>K.A.E.L.A. // Holographic Coding Familiar</h3>
                <span className="ai-status-online">● PROTOCOL: ONLINE & SYNCHRONIZED</span>
              </div>
            </div>
            <div className="ai-dialogue-box">
              <p>
                "Greetings, Operative. I am your Warlock Cyber Core AI. I monitor your syntax
                frequencies, memory buffers, and typing combos."
              </p>
              <div className="ai-quick-tips">
                <h4>⚡ SYSTEM TRANSMISSION TIPS:</h4>
                <ul>
                  <li>Press <strong>Ctrl + Enter</strong> (or <strong>Cmd + Enter</strong>) to instantly cast/run your code.</li>
                  <li>Hit <strong>Shift + Alt + F</strong> to invoke auto-formatting magic.</li>
                  <li>Type at speed to unleash <strong>PowerMode Spark Bursts</strong> and boost your XP combo multiplier.</li>
                  <li>Switch between <strong>16+ programming languages</strong> in the top toolbar to unlock the <em>Polyglot Master</em> achievement.</li>
                  <li>Explore all 5 game environments to sync with different cyberspace matrix frequencies.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
