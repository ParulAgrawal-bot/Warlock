// theme.js

/**
 * Base color palette for the coding game editor theme.
 * Pure data only – no editor library dependencies.
 */
export const colors = {
  // Core UI
  background: '#0b0f19',
  surface: '#0f1724',
  surfaceElevated: '#151b2b',
  border: '#1f2937',
  borderStrong: '#374151',

  // Text
  textPrimary: '#e6e6e6',
  textSecondary: '#93c5fd',
  textMuted: '#64748b',
  textOnAccent: '#0b0f19',

  // Accents (game branding)
  accentPrimary: '#00e5ff',   // cyan
  accentSecondary: '#ff79c6', // pink
  accentTertiary: '#8be9fd',  // light blue

  // Semantic
  success: '#50fa7b',         // green
  warning: '#f1fa8c',         // yellow
  error: '#ff5555',           // red
  info: '#7fd3ff',            // light cyan

  // Syntax highlighting tokens (generic names)
  syntax: {
    comment: '#6a7d8f',
    string: '#a5d6ff',
    keyword: '#ff79c6',
    operator: '#8be9fd',
    type: '#8be9fd',
    function: '#50fa7b',
    number: '#ffb86c',
    constant: '#ffb86c',
    variable: '#f8f8f2',
    parameter: '#f1fa8c',
    tag: '#ff79c6',
    attributeName: '#50fa7b',
    attributeValue: '#a5d6ff',
    invalid: '#ff5555',
  },

  // Editor-specific UI colors (library-agnostic)
  editor: {
    background: '#0b0f19',
    foreground: '#e6e6e6',
    lineHighlight: '#151b2b',
    selection: '#1f3a5f',
    cursor: '#00e5ff',
    lineNumber: '#4a5568',
    lineNumberActive: '#93c5fd',
    bracketMatchBg: '#1e3a5f',
    bracketMatchBorder: '#00e5ff',
    indentGuide: '#1f2937',
    indentGuideActive: '#374151',
    findMatch: '#2a4365',
    findMatchHighlight: '#1e3a5f',
  },

  // Panels / widgets (if your editor has them)
  panels: {
    background: '#0f1724',
    border: '#1f2937',
    foreground: '#cbd5e1',
    highlight: '#00e5ff',
    selectedBackground: '#1e3a5f',
  },

  // Terminal / console (optional)
  terminal: {
    background: '#0b0f19',
    foreground: '#e6e6e6',
    black: '#0b0f19',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#8be9fd',
    magenta: '#ff79c6',
    cyan: '#00e5ff',
    white: '#f8f8f2',
  },
};

/**
 * Generate CSS variables for this theme.
 * Call once and inject into a <style> tag or a CSS file.
 *
 * Example:
 *   const css = generateCssVariables('game-editor');
 *   // then put `css` into a <style> element
 */
export function generateCssVariables(scopeClass = 'game-editor-theme') {
  const flat = {};

  // Core colors
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === 'string') {
      flat[key] = value;
    }
  }

  // Nested groups -> dotted names
  function flattenGroup(group, prefix) {
    const result = {};
    for (const [key, value] of Object.entries(group)) {
      if (typeof value === 'string') {
        result[`${prefix}-${key}`] = value;
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(result, flattenGroup(value, `${prefix}-${key}`));
      }
    }
    return result;
  }

  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === 'object' && value !== null) {
      Object.assign(flat, flattenGroup(value, key));
    }
  }

  // Build CSS
  const lines = [`:root, .${scopeClass} {`];
  for (const [key, value] of Object.entries(flat)) {
    const varName = `--game-${toKebabCase(key)}`;
    lines.push(`  ${varName}: ${value};`);
  }
  lines.push('}');

  return lines.join('\n');
}

/**
 * Convert camelCase to kebab-case for CSS variable names.
 */
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Return a theme object ready to be consumed by your editor layer.
 * This is just structured data; your code decides how to use it.
 *
 * Example usage:
 *   const theme = getTheme();
 *   editorElement.style.backgroundColor = theme.colors.editor.background;
 */
export function getTheme() {
  return {
    name: 'Game Editor Dark',
    kind: 'dark',
    colors,
  };
}

/**
 * Default export: the full theme object.
 *
 * Example:
 *   import theme from './theme.js';
 *   console.log(theme.colors.editor.background);
 */
export default  {
  name: 'Game Editor Dark',
  kind: 'dark',
  colors,
  generateCssVariables,
  getTheme,
};