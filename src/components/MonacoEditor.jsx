import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

if (typeof window !== 'undefined' && !window.MonacoEnvironment) {
  window.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') return new jsonWorker();
      if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
      if (label === 'html' || label === 'handlebars') return new htmlWorker();
      if (label === 'typescript' || label === 'javascript') return new tsWorker();
      return new editorWorker();
    }
  };
}

monaco.editor.defineTheme('editor-theme', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
    { token: 'keyword', foreground: '00ffcc', fontStyle: 'bold' },
    { token: 'string', foreground: 'ff007f' },
    { token: 'number', foreground: 'ffe600' },
    { token: 'function', foreground: '00e5ff', fontStyle: 'bold' }
  ],
  colors: {
    'editor.background': '#0c0d18',
    'editor.foreground': '#f8f8f2',
    'editorCursor.foreground': '#00ffcc',
    'editor.lineHighlightBackground': '#181b3088',
    'editorLineNumber.foreground': '#4f5b82',
    'editorLineNumber.activeForeground': '#00ffcc',
    'editor.selectionBackground': '#ff007f44'
  }
});

export const MonacoEditor = ({ language = 'javascript', value = '', onChange, onRun, readOnly = false }) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value,
      language,
      theme: 'editor-theme',
      readOnly,
      automaticLayout: true,
      fontSize: 15,
      fontFamily: "'Fira Code', 'Share Tech Mono', Consolas, monospace",
      minimap: { enabled: true },
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      padding: { top: 12, bottom: 12 }
    });

    editorRef.current = editor;

    editor.onDidChangeModelContent(() => {
      if (isInternalChange.current) return;
      if (onChange) onChange(editor.getValue());
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRunRef.current) onRunRef.current();
    });

    return () => editor.dispose();
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.getValue() === value) return;
    isInternalChange.current = true;
    editorRef.current.setValue(value ?? '');
    // push cursor to top so the manual is readable
    editorRef.current.setScrollTop(0);
    editorRef.current.setPosition({ lineNumber: 1, column: 1 });
    isInternalChange.current = false;
  }, [value]);

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) monaco.editor.setModelLanguage(model, language);
    }
  }, [language]);

  useEffect(() => {
    editorRef.current?.updateOptions({ readOnly });
  }, [readOnly]);

  return <div ref={containerRef} className="monaco-container" />;
};
