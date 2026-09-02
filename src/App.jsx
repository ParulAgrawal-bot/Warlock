import React, { useState } from 'react';
import { MonacoEditor } from './components/MonacoEditor';
import { GameBackground, BG_MODES } from './components/GameBackground';
import { LANGUAGES, getLanguage } from './constants/languages';
import './App.css';

export function App() {
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [bgMode, setBgMode] = useState('synthwave');
  const [codeMap, setCodeMap] = useState(() => {
    const map = {};
    LANGUAGES.forEach((l) => {
      map[l.id] = l.code;
    });
    return map;
  });
  const [output, setOutput] = useState([
    { type: 'info', text: '⚡ Ready. Click [Run Code] or press Ctrl+Enter to execute.' }
  ]);
  const [copied, setCopied] = useState(false);

  const currentCode = codeMap[selectedLang] || '';
  const currentLangObj = getLanguage(selectedLang);

  // Handle Code Editing
  const handleCodeChange = (newCode) => {
    setCodeMap((prev) => ({ ...prev, [selectedLang]: newCode }));
  };

  // Switch Language
  const handleLanguageChange = (langId) => {
    setSelectedLang(langId);
  };

  // Reset to default starter code
  const handleResetCode = () => {
    setCodeMap((prev) => ({ ...prev, [selectedLang]: currentLangObj.code }));
    setOutput([{ type: 'info', text: `↺ Reset code for ${currentLangObj.name}.` }]);
  };

  // Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run Code
  const handleRunCode = () => {
    const logs = [];
    const log = (type, text) => logs.push({ type, text: String(text) });

    log('info', `🚀 Running ${currentLangObj.name}...`);

    if (selectedLang === 'javascript' || selectedLang === 'typescript') {
      try {
        const customConsole = {
          log: (...args) => log('log', args.join(' ')),
          error: (...args) => log('error', args.join(' ')),
          warn: (...args) => log('warn', args.join(' '))
        };

        // Simple TS type stripping for in-browser execution
        let codeToRun = currentCode;
        if (selectedLang === 'typescript') {
          codeToRun = currentCode.replace(/:\s*(string|number|boolean|any)/g, '');
        }

        const runFn = new Function('console', codeToRun);
        runFn(customConsole);
        log('success', '✅ Execution finished successfully.');
      } catch (err) {
        log('error', `💥 Error: ${err.message}`);
      }
    } else {
      // Simulated output for compiled/backend languages
      const lines = currentCode.split('\n');
      lines.forEach((line) => {
        const match = line.match(/(?:print|println!|System\.out\.println|Console\.WriteLine|fmt\.Println)\s*\((["'`]?.*?["'`]?)\)/);
        if (match) {
          log('log', `➜ ${match[1].replace(/["'`]/g, '')}`);
        }
      });
      log('success', `⚡ [${currentLangObj.name}] Simulation completed.`);
    }

    setOutput(logs);
  };

  return (
    <div className="app-container">
      {/* 1. Animated Game Background */}
      <GameBackground mode={bgMode} />

      {/* 2. Main Studio Window */}
      <div className="studio-card">
        {/* Header Bar */}
        <header className="studio-header">
          {/* Brand */}
          <div className="brand">
            <span className="brand-icon">⚔️</span>
            <span className="brand-name">WARLOCK</span>
          </div>

          {/* Controls: Language, Background, Run */}
          <div className="controls">
            {/* Language Selector */}
            <div className="select-group">
              <span className="select-icon">{currentLangObj.icon}</span>
              <select
                className="game-select"
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Background Mode Selector */}
            <div className="select-group">
              <span className="select-icon">🌌</span>
              <select
                className="game-select"
                value={bgMode}
                onChange={(e) => setBgMode(e.target.value)}
              >
                {BG_MODES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <button className="btn run-btn" onClick={handleRunCode} title="Ctrl + Enter">
              ▶ Run Code
            </button>
            <button className="btn" onClick={handleCopyCode}>
              {copied ? '✅ Copied' : '📋 Copy'}
            </button>
            <button className="btn" onClick={handleResetCode}>
              ↺ Reset
            </button>
          </div>
        </header>

        {/* Monaco Editor Container */}
        <main className="editor-section">
          <MonacoEditor
            language={currentLangObj.monacoLang}
            value={currentCode}
            onChange={handleCodeChange}
            onRun={handleRunCode}
          />
        </main>

        {/* Output Console */}
        <footer className="output-section">
          <div className="output-header">
            <span>📟 OUTPUT CONSOLE</span>
            <button className="clear-btn" onClick={() => setOutput([])}>
              Clear
            </button>
          </div>
          <div className="output-body">
            {output.map((item, idx) => (
              <div key={idx} className={`output-line ${item.type}`}>
                {item.text}
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
