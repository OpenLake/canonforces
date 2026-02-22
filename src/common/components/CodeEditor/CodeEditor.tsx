import React, { useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import Language from './Language';
import Output from './Output';
import styles from './Editor.module.css';

// Define types for better type safety
type TestCase = {
  input: string;
  output: string;
};

type SubmissionResult = {
  status: string;
  message: string;
  results?: Array<{
    status: string;
    // ... other properties per test case
  }>;
} | null;

type Props = {
  id: string;
  language: string;
  codeValue: string;
  onLanguageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // This prop comes from [id].tsx
  onCodeChange: (value: string | undefined) => void; // This prop comes from [id].tsx
  output: string | null;
  isRunning: boolean;
  submissionResult: SubmissionResult;
  testCases: TestCase[];
  problemData?: any;
  onRun?: () => void;
  onSubmit?: () => void;
};

const CodeEditor = ({
  id,
  language,
  codeValue,
  onLanguageChange,
  onCodeChange,
  output,
  isRunning,
  submissionResult,
  testCases,
  problemData,
  onRun,
  onSubmit,
}: Props) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const editorRef = useRef(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  const resetCode = () => {
    // This is now complex, as state is in the parent.
    // For the Hacktoberfest issue, we can leave this as-is
    // or call a prop `onResetCode` if we added one.
    // Let's just log it for now.
    console.log('Reset button clicked - state is in parent.');
  };

  return (
    <div
      className={`${styles.editorWrapper} ${isFullscreen ? styles.fullscreen : ''
        }`}
    >
      {/* Editor Header */}
      <div className={styles.editorHeader}>
        <div className={styles.headerLeft}>
          {/*
            This Language component just DISPLAYS the language.
            The *actual* selector is in the parent ([id].tsx).
          */}
          <Language
            language={language}
            onSelect={(lang: string) => {
              // Create a synthetic event to match the parent's expected type
              const syntheticEvent = {
                target: { value: lang },
              } as React.ChangeEvent<HTMLSelectElement>;
              onLanguageChange(syntheticEvent);
            }}
          />
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.iconButton}
            onClick={resetCode}
            title="Reset Code"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* This is the main content area with the split layout */}
      <div className={styles.mainContent}>
        {/* Editor Pane */}
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
            theme="vs-dark"
            // --- USE PROPS FOR LANGUAGE, VALUE, ONCHANGE ---
            language={language}
            value={codeValue}
            onChange={onCodeChange}
          />
        </div>

        {/* Output Pane */}
        <div className={styles.outputSection}>
          {/* --- PASS PROPS DOWN TO OUTPUT --- */}
          <Output
            output={output}
            isRunning={isRunning}
            submissionResult={submissionResult}
            testCases={testCases}
            id={id}
            language={language}
            value={codeValue}
            problemData={problemData}
            onRun={onRun}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
