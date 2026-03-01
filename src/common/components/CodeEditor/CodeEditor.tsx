import React, { useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import Language from './Language';
import Output from './Output';
import styles from './Editor.module.css';
import ReactMarkdown from 'react-markdown';
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
  onVerify?: () => void;
  isVerifying?: boolean;
  aiHints?: [string, string, string] | null;
  hintLevel?: number;
  isFetchingHint?: boolean;
  onGetHint?: () => void;
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
  onVerify,
  isVerifying,
  aiHints,
  hintLevel,
  isFetchingHint,
  onGetHint,
}: Props) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = React.useState(false);
  const editorRef = useRef(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  const resetCode = () => {
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
            onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
            title="Toggle AI Hints"
            style={{ color: isAiSidebarOpen ? '#fcd34d' : '#ccc', display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '8px', paddingRight: '8px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
            </svg>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>AI Help ✨</span>
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

      <div className={styles.mainContent}>
        <div className={styles.editorStack}>
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
              language={language}
              value={codeValue}
              onChange={onCodeChange}
            />
          </div>

          <div className={styles.outputSection}>
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
              onVerify={onVerify}
              isVerifying={isVerifying}
              aiHints={aiHints}
              hintLevel={hintLevel}
              isFetchingHint={isFetchingHint}
              onGetHint={onGetHint}
            />
          </div>
        </div>

        {/* AI Sidebar */}
        <div className={isAiSidebarOpen ? styles.aiSidebar : styles.aiSidebarHidden}>
          <div className={styles.aiSidebarHeader}>
            <h3 className={styles.aiSidebarTitle}>🤖 AI Assistance</h3>
            <button className={styles.aiSidebarClose} onClick={() => setIsAiSidebarOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {hintLevel !== undefined && hintLevel < 3 && (
              <button
                onClick={onGetHint}
                disabled={isFetchingHint}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, width: '100%' }}
              >
                {isFetchingHint ? 'Thinking...' : "Reveal Hint " + (hintLevel + 1) + " (Reduces Reward) ✨"}
              </button>
            )}

            <p style={{ color: '#9ca3af', fontSize: '0.85em', marginTop: '0' }}>Hints reveal progressively.</p>

            {hintLevel === 0 && !isFetchingHint && (
              <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #4b5563', borderRadius: '8px', color: '#9ca3af', fontSize: '0.9em' }}>
                Click the button above to get your first AI hint! (Note: Using hints will reduce the coins earned when submitting)
              </div>
            )}

            {isFetchingHint && hintLevel === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', borderRadius: '8px', background: '#374151', animation: 'pulse 1.5s infinite', color: '#9ca3af' }}>
                Analyzing your code...
              </div>
            )}

            {aiHints && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {hintLevel !== undefined && hintLevel >= 1 && (
                  <div className={styles.aiHintBox}>
                    <h4 style={{ color: '#38bdf8' }}>Hint 1: Topic</h4>
                    <div className={styles.aiHintText}>
                      <ReactMarkdown>{aiHints[0]}</ReactMarkdown>
                    </div>
                  </div>
                )}
                {hintLevel !== undefined && hintLevel >= 2 && (
                  <div className={styles.aiHintBox}>
                    <h4 style={{ color: '#f472b6' }}>Hint 2: Error Approach</h4>
                    <div className={styles.aiHintText}>
                      <ReactMarkdown>{aiHints[1]}</ReactMarkdown>
                    </div>
                  </div>
                )}
                {hintLevel !== undefined && hintLevel >= 3 && (
                  <div className={styles.aiHintBox}>
                    <h4 style={{ color: '#4ade80' }}>Hint 3: Full Solution</h4>
                    <div className={styles.aiHintText}>
                      <ReactMarkdown>{aiHints[2]}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
