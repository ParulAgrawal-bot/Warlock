import React from 'react';
import { BACKGROUND_MODES } from './GameBackground';
import { THEMES } from '../constants/editorThemes';
import { soundEngine } from '../utils/audio';

export const GameHeader = ({
  playerLevel,
  playerXp,
  xpForNextLevel,
  combo,
  bgMode,
  setBgMode,
  editorTheme,
  setEditorTheme,
  isMuted,
  setIsMuted,
  powerModeEnabled,
  setPowerModeEnabled,
  onResetProgress
}) => {
  const xpPercent = Math.min(100, Math.round((playerXp / xpForNextLevel) * 100));

  const getRankTitle = (lvl) => {
    if (lvl >= 30) return '⚡ QUANTUM ARCHMAGE';
    if (lvl >= 20) return '🔥 CYBER SAMURAI';
    if (lvl >= 10) return '⚔️ BYTE WARRIOR';
    if (lvl >= 5) return '🛡️ CODE INFILTRATOR';
    return '🗡️ NOVICE WARLOCK';
  };

  const handleToggleSound = () => {
    const nextMute = soundEngine.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      soundEngine.playUiBlip(700);
    }
  };

  const handleFullscreen = () => {
    soundEngine.playUiBlip(800);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="game-header">
      {/* Brand & Gamer Title */}
      <div className="header-left">
        <div className="game-brand">
          <div className="brand-crest">
            <span className="crest-icon">⚔️</span>
            <span className="crest-pulse" />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">WARLOCK</h1>
            <span className="brand-subtitle">CYBER CODE STUDIO v2.4</span>
          </div>
        </div>

        {/* Player Stats HUD */}
        <div className="player-hud-card" title="Type code and run programs to gain XP and Level Up!">
          <div className="player-rank-row">
            <span className="player-level-badge">LVL {playerLevel}</span>
            <span className="player-rank-name">{getRankTitle(playerLevel)}</span>
            {combo > 5 && (
              <span className={`combo-badge ${combo >= 25 ? 'godlike' : combo >= 15 ? 'hyper' : 'active'}`}>
                🔥 x{combo} COMBO!
              </span>
            )}
          </div>
          <div className="xp-bar-container">
            <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }}>
              <div className="xp-bar-sheen" />
            </div>
          </div>
          <div className="xp-numbers">
            <span>XP: {playerXp} / {xpForNextLevel}</span>
            <span>{xpPercent}%</span>
          </div>
        </div>
      </div>

      {/* Center Controls: Game Environment Mode */}
      <div className="header-center">
        <div className="bg-mode-selector">
          <span className="hud-label">ENVIRONMENT:</span>
          <div className="bg-mode-buttons">
            {BACKGROUND_MODES.map((mode) => (
              <button
                key={mode.id}
                className={`bg-mode-btn ${bgMode === mode.id ? 'active' : ''}`}
                onClick={() => {
                  soundEngine.playUiBlip(550);
                  setBgMode(mode.id);
                }}
                title={mode.name}
              >
                <span className="mode-icon">{mode.icon}</span>
                <span className="mode-name">{mode.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Controls: Theme, SFX, PowerMode, Fullscreen */}
      <div className="header-right">
        {/* Editor Theme Dropdown */}
        <div className="theme-select-wrapper">
          <span className="hud-label">NEON THEME:</span>
          <select
            className="game-select"
            value={editorTheme}
            onChange={(e) => {
              soundEngine.playUiBlip(600);
              setEditorTheme(e.target.value);
            }}
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Power Mode Toggle */}
        <button
          className={`hud-icon-btn ${powerModeEnabled ? 'active' : ''}`}
          onClick={() => {
            soundEngine.playUiBlip(750);
            setPowerModeEnabled(!powerModeEnabled);
          }}
          title={powerModeEnabled ? 'PowerMode Sparks: ON' : 'PowerMode Sparks: OFF'}
        >
          <span className="btn-icon">⚡</span>
          <span className="btn-label">POWER FX</span>
        </button>

        {/* SFX Audio Toggle */}
        <button
          className={`hud-icon-btn ${!isMuted ? 'active' : 'muted'}`}
          onClick={handleToggleSound}
          title={isMuted ? 'Sound FX: MUTED' : 'Sound FX: ACTIVE'}
        >
          <span className="btn-icon">{isMuted ? '🔇' : '🔊'}</span>
          <span className="btn-label">{isMuted ? 'MUTED' : 'SFX ON'}</span>
        </button>

        {/* Fullscreen Button */}
        <button
          className="hud-icon-btn"
          onClick={handleFullscreen}
          title="Toggle Fullscreen Arena"
        >
          <span className="btn-icon">⛶</span>
          <span className="btn-label">EXPAND</span>
        </button>
      </div>
    </header>
  );
};
