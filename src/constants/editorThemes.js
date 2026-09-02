// Custom Monaco Editor Themes for Gaming Aesthetic

export const THEMES = [
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    accentColor: '#00ffcc',
    secondaryColor: '#ff007f',
    bg: '#0c0d14',
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: '00ffcc', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'f8f8f2' },
        { token: 'string', foreground: 'ff007f' },
        { token: 'number', foreground: 'ffe600' },
        { token: 'type', foreground: '39ff14' },
        { token: 'delimiter', foreground: '8be9fd' },
        { token: 'operator', foreground: 'ff79c6' },
        { token: 'function', foreground: '00e5ff', fontStyle: 'bold' }
      ],
      colors: {
        'editor.background': '#0b0c16ee',
        'editor.foreground': '#f8f8f2',
        'editorCursor.foreground': '#00ffcc',
        'editor.lineHighlightBackground': '#181a2e88',
        'editorLineNumber.foreground': '#4f5b82',
        'editorLineNumber.activeForeground': '#00ffcc',
        'editor.selectionBackground': '#ff007f44',
        'editor.inactiveSelectionBackground': '#ff007f22',
        'editorIndentGuide.background': '#1e2238',
        'editorIndentGuide.activeBackground': '#00ffcc66'
      }
    }
  },
  {
    id: 'matrix-terminal',
    name: 'Matrix Terminal',
    accentColor: '#00ff66',
    secondaryColor: '#008f11',
    bg: '#040804',
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '005511', fontStyle: 'italic' },
        { token: 'keyword', foreground: '33ff77', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'aaffcc' },
        { token: 'string', foreground: '00ffaa' },
        { token: 'number', foreground: '99ff33' },
        { token: 'type', foreground: '55ff99' },
        { token: 'delimiter', foreground: '00bb44' },
        { token: 'operator', foreground: '33ff77' },
        { token: 'function', foreground: '00ff55', fontStyle: 'bold' }
      ],
      colors: {
        'editor.background': '#030804f0',
        'editor.foreground': '#aaffcc',
        'editorCursor.foreground': '#00ff66',
        'editor.lineHighlightBackground': '#07200788',
        'editorLineNumber.foreground': '#005522',
        'editorLineNumber.activeForeground': '#00ff66',
        'editor.selectionBackground': '#00ff6633',
        'editor.inactiveSelectionBackground': '#00ff6618',
        'editorIndentGuide.background': '#092b0f',
        'editorIndentGuide.activeBackground': '#00ff6655'
      }
    }
  },
  {
    id: 'synthwave-84',
    name: 'Synthwave 80s',
    accentColor: '#ff71ce',
    secondaryColor: '#01cdfe',
    bg: '#140c24',
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6c587c', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff71ce', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'fbf5ff' },
        { token: 'string', foreground: '01cdfe' },
        { token: 'number', foreground: '05ffa1' },
        { token: 'type', foreground: 'b967ff' },
        { token: 'delimiter', foreground: 'fffb96' },
        { token: 'operator', foreground: 'ff71ce' },
        { token: 'function', foreground: '05ffa1', fontStyle: 'bold' }
      ],
      colors: {
        'editor.background': '#130922f0',
        'editor.foreground': '#fbf5ff',
        'editorCursor.foreground': '#ff71ce',
        'editor.lineHighlightBackground': '#2c164788',
        'editorLineNumber.foreground': '#593a80',
        'editorLineNumber.activeForeground': '#ff71ce',
        'editor.selectionBackground': '#ff71ce44',
        'editor.inactiveSelectionBackground': '#ff71ce20',
        'editorIndentGuide.background': '#2e194a',
        'editorIndentGuide.activeBackground': '#ff71ce66'
      }
    }
  },
  {
    id: 'solar-flare-rpg',
    name: 'Solar Flare RPG',
    accentColor: '#ffaa00',
    secondaryColor: '#ff4500',
    bg: '#180e06',
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '784e2d', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ffaa00', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'fff2e0' },
        { token: 'string', foreground: 'ff5722' },
        { token: 'number', foreground: 'ffd54f' },
        { token: 'type', foreground: 'ff8a65' },
        { token: 'delimiter', foreground: 'ffb74d' },
        { token: 'operator', foreground: 'ff7043' },
        { token: 'function', foreground: 'ffc107', fontStyle: 'bold' }
      ],
      colors: {
        'editor.background': '#150904f0',
        'editor.foreground': '#fff2e0',
        'editorCursor.foreground': '#ffaa00',
        'editor.lineHighlightBackground': '#30150588',
        'editorLineNumber.foreground': '#6c3514',
        'editorLineNumber.activeForeground': '#ffaa00',
        'editor.selectionBackground': '#ffaa0044',
        'editor.inactiveSelectionBackground': '#ffaa0022',
        'editorIndentGuide.background': '#3b1c09',
        'editorIndentGuide.activeBackground': '#ffaa0066'
      }
    }
  },
  {
    id: 'deep-space-ice',
    name: 'Deep Space Ice',
    accentColor: '#00d2ff',
    secondaryColor: '#3a7bd5',
    bg: '#060d1a',
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '416788', fontStyle: 'italic' },
        { token: 'keyword', foreground: '00d2ff', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'e0f7fa' },
        { token: 'string', foreground: '80deea' },
        { token: 'number', foreground: '64ffda' },
        { token: 'type', foreground: '4fc3f7' },
        { token: 'delimiter', foreground: '81d4fa' },
        { token: 'operator', foreground: '00e5ff' },
        { token: 'function', foreground: '00b0ff', fontStyle: 'bold' }
      ],
      colors: {
        'editor.background': '#060e1af2',
        'editor.foreground': '#e0f7fa',
        'editorCursor.foreground': '#00d2ff',
        'editor.lineHighlightBackground': '#0e244488',
        'editorLineNumber.foreground': '#2c4b75',
        'editorLineNumber.activeForeground': '#00d2ff',
        'editor.selectionBackground': '#00d2ff33',
        'editor.inactiveSelectionBackground': '#00d2ff18',
        'editorIndentGuide.background': '#112b4d',
        'editorIndentGuide.activeBackground': '#00d2ff66'
      }
    }
  },
  {
    id: 'vs-dark',
    name: 'Obsidian Classic',
    accentColor: '#9cdcfe',
    secondaryColor: '#4ec9b0',
    bg: '#1e1e1e',
    monacoTheme: {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {}
    }
  }
];

export const registerCustomThemes = (monaco) => {
  if (!monaco) return;
  THEMES.forEach((theme) => {
    if (theme.id !== 'vs-dark') {
      try {
        monaco.editor.defineTheme(theme.id, theme.monacoTheme);
      } catch (e) {
        console.error('Failed to define theme', theme.id, e);
      }
    }
  });
};
