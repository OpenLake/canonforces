import React from 'react';
import { CODE_SNIPPETS } from '../../../constants/boilerplate';
import { Editor } from '@monaco-editor/react';
import { useState, useEffect, useRef } from 'react';
import Language from './Language';
import Output from './Output';
import styles from './Editor.module.css'
type Props = {
  id: string;
  problemData?: any;
};

const CodeEditor = ({ id, problemData }: Props) => {
  const [language, setLanguage] = useState<string>('python');
  const [value, setValue] = useState(CODE_SNIPPETS[language as keyof typeof CODE_SNIPPETS]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState('vs-dark');
  const editorRef = useRef(null);

  const onSelect = (lang: string) => {
    setLanguage(lang);
    setValue(CODE_SNIPPETS[lang as keyof typeof CODE_SNIPPETS]);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  const resetCode = () => {
    setValue(CODE_SNIPPETS[language as keyof typeof CODE_SNIPPETS]);
  };

  return (
    <div className={`${styles.editorWrapper} ${isFullscreen ? styles.fullscreen : ''}`}>
      {/* Editor Header */}
      <div className={styles.editorHeader}>
        <div className={styles.headerLeft}>
          <Language language={language} onSelect={onSelect} />
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.iconButton}
            onClick={resetCode}
            title="Reset Code"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          <button
            className={styles.iconButton}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className={styles.editorSection}>
        <Editor
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 1.6,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            cursorStyle: 'line',
            cursorBlinking: 'smooth',
            renderLineHighlight: 'all',
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorSurroundingLines: 0,
            cursorSurroundingLinesStyle: 'default',
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 12,
              horizontalScrollbarSize: 12,
            },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
          }}
          height="100%"
          theme={theme}
          language={language}
          value={value}
          onChange={(value) => setValue(value ?? "")}
        />
      </div>

      {/* Output Section */}
      <div className={styles.outputSection}>
        <Output 
          id={id} 
          language={language} 
          value={value}
          problemData={problemData}
        />
      </div>
    </div>
  );
};

export default CodeEditor;