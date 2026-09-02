import React, { useState } from 'react';
import { PROGRAMMING_LANGUAGES } from '../constants/languages';
import { soundEngine } from '../utils/audio';

export const EditorToolbar = ({
  currentLang,
  onChangeLanguage,
  onLoadTemplate,
  onRunCode,
  isRunning,
  onFormatCode,
  onCopyCode,
  onDownloadCode,
  onResetCode,
  fontSize,
  setFontSize,
  wordWrap,
  setWordWrap,
  showMinimap,
  setShowMinimap,
  showTerminal,
  setShowTerminal
}) => {
  const [copied, setCopied] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const selectedLangObj = PROGRAMMING_LANGUAGES.find((l) => l.id === currentLang) || PROGRAMMING_LANGUAGES[0];

  const filteredLanguages = PROGRAMMING_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.id.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.category.toLowerCase().includes(langSearch.toLowerCase())
  );

  const handleCopy = () => {
    onCopyCode();
    setCopied(true);
    soundEngine.playUiBlip(900);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTemplateSelect = (key) => {
    soundEngine.playUiBlip(700);
    onLoadTemplate(key);
  };

  return (
    <div className="editor-toolbar">
      {/* Left Area: Language Selector & Templates */}
      <div className="toolbar-left">
        {/* Language Picker Dropdown */}
        <div className="lang-picker-container">
          <button
            className="lang-picker-trigger"
            onClick={() => {
              soundEngine.playUiBlip(500);
              setIsLangOpen(!isLangOpen);
            }}
          >
            <span className="lang-dot" style={{ backgroundColor: selectedLangObj.color }} />
            <span className="lang-icon">{selectedLangObj.icon}</span>
            <span className="lang-title">{selectedLangObj.name}</span>
            <span className="lang-ext">{selectedLangObj.extension}</span>
            <span className="lang-arrow">{isLangOpen ? '▲' : '▼'}</span>
          </button>

          {isLangOpen && (
            <>
              <div className="lang-picker-backdrop" onClick={() => setIsLangOpen(false)} />
              <div className="lang-picker-dropdown">
                <div className="lang-search-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="lang-search-input"
                    placeholder="Search 16+ languages..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    autoFocus
                  />
                  {langSearch && (
                    <button className="clear-search-btn" onClick={() => setLangSearch('')}>
                      ✕
                    </button>
                  )}
                </div>

                <div className="lang-list">
                  {filteredLanguages.map((lang) => (
                    <button
                      key={lang.id}
                      className={`lang-option-item ${currentLang === lang.id ? 'selected' : ''}`}
                      onClick={() => {
                        soundEngine.playUiBlip(650);
                        onChangeLanguage(lang.id);
                        setIsLangOpen(false);
                        setLangSearch('');
                      }}
                    >
                      <div className="lang-option-left">
                        <span className="lang-dot" style={{ backgroundColor: lang.color }} />
                        <span className="lang-icon">{lang.icon}</span>
                        <span className="lang-name">{lang.name}</span>
                      </div>
                      <div className="lang-option-right">
                        <span className="lang-category">{lang.category}</span>
                        <span className="lang-tag">{lang.extension}</span>
                      </div>
                    </button>
                  ))}
                  {filteredLanguages.length === 0 && (
                    <div className="no-langs">No matching language found</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Game Templates / Snippets Quick Loader */}
        <div className="template-presets">
          <span className="toolbar-label">SNIPPETS:</span>
          {selectedLangObj.templates?.gameLoop && (
            <button
              className="preset-pill-btn"
              onClick={() => handleTemplateSelect('gameLoop')}
              title="Load Game Loop Simulation Template"
            >
              🎮 Game Loop
            </button>
          )}
          {selectedLangObj.templates?.algorithm && (
            <button
              className="preset-pill-btn"
              onClick={() => handleTemplateSelect('algorithm')}
              title="Load Pathfinding Algorithm Template"
            >
              🧠 Algorithm
            </button>
          )}
          {selectedLangObj.templates?.starter && (
            <button
              className="preset-pill-btn"
              onClick={() => handleTemplateSelect('starter')}
              title="Load Clean Starter Template"
            >
              ⚡ Starter
            </button>
          )}
        </div>
      </div>

      {/* Right Area: Action Buttons & Editor Preferences */}
      <div className="toolbar-right">
        {/* RUN CODE BUTTON */}
        <button
          className={`run-code-btn ${isRunning ? 'running' : ''}`}
          onClick={onRunCode}
          disabled={isRunning}
          title="Run Code (Ctrl + Enter)"
        >
          <span className="run-icon">{isRunning ? '⏳' : '▶'}</span>
          <span className="run-text">{isRunning ? 'EXECUTING...' : 'RUN SPELL'}</span>
          <span className="run-kbd">Ctrl+↵</span>
        </button>

        <div className="toolbar-divider" />

        {/* Format Code */}
        <button
          className="tool-action-btn"
          onClick={() => {
            soundEngine.playUiBlip(600);
            onFormatCode();
          }}
          title="Format Code (Shift + Alt + F)"
        >
          <span>🪄 FORMAT</span>
        </button>

        {/* Copy Code */}
        <button
          className={`tool-action-btn ${copied ? 'success' : ''}`}
          onClick={handleCopy}
          title="Copy Code to Clipboard"
        >
          <span>{copied ? '✅ COPIED!' : '📋 COPY'}</span>
        </button>

        {/* Download Code File */}
        <button
          className="tool-action-btn"
          onClick={() => {
            soundEngine.playUiBlip(700);
            onDownloadCode();
          }}
          title={`Download source file (${selectedLangObj.extension})`}
        >
          <span>💾 SAVE</span>
        </button>

        {/* Reset Code */}
        <button
          className="tool-action-btn danger"
          onClick={() => {
            soundEngine.playUiBlip(400);
            onResetCode();
          }}
          title="Reset to default template"
        >
          <span>↺ RESET</span>
        </button>

        <div className="toolbar-divider" />

        {/* Font Size Adjusters */}
        <div className="font-size-controls">
          <button
            className="font-btn"
            onClick={() => {
              soundEngine.playUiBlip(500);
              setFontSize(Math.max(11, fontSize - 1));
            }}
            title="Decrease Font Size"
          >
            A-
          </button>
          <span className="font-display">{fontSize}px</span>
          <button
            className="font-btn"
            onClick={() => {
              soundEngine.playUiBlip(550);
              setFontSize(Math.min(26, fontSize + 1));
            }}
            title="Increase Font Size"
          >
            A+
          </button>
        </div>

        {/* Word Wrap Toggle */}
        <button
          className={`tool-toggle-btn ${wordWrap === 'on' ? 'active' : ''}`}
          onClick={() => {
            soundEngine.playUiBlip(500);
            setWordWrap(wordWrap === 'on' ? 'off' : 'on');
          }}
          title="Toggle Word Wrap"
        >
          WRAP
        </button>

        {/* Minimap Toggle */}
        <button
          className={`tool-toggle-btn ${showMinimap ? 'active' : ''}`}
          onClick={() => {
            soundEngine.playUiBlip(500);
            setShowMinimap(!showMinimap);
          }}
          title="Toggle Minimap"
        >
          MAP
        </button>

        {/* Console / Terminal Toggle */}
        <button
          className={`terminal-toggle-btn ${showTerminal ? 'active' : ''}`}
          onClick={() => {
            soundEngine.playUiBlip(600);
            setShowTerminal(!showTerminal);
          }}
          title="Toggle Game Console Terminal"
        >
          📟 CONSOLE {showTerminal ? '▼' : '▲'}
        </button>
      </div>
    </div>
  );
};
