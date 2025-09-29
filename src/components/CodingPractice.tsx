import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';

const STARTER_SNIPPETS = {
  javascript: `// JavaScript Example\nconsole.log("Hello, world!");`,
  python: `# Python Example\nprint("Hello, world!")`,
};

const LANGUAGE_OPTIONS = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
];

/**
 * CodingPractice component provides an interactive code editor and runner for JavaScript and Python.
 * Users can select a language, write code, run it, and see the output instantly.
 */
export default function CodingPractice() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(STARTER_SNIPPETS['javascript']);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);

  /**
   * Handle language selection change. Resets code and output for the new language.
   */
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(STARTER_SNIPPETS[lang]);
    setOutput('');
  };

  /**
   * Run the code in the selected language by sending it to the backend API.
   * Shows output or error in the output area and as a toast.
   */
  const handleRun = async () => {
    setLoading(true);
    setOutput('');
    try {
  const res = await axios.post('http://localhost:5050/execute-code', {
        code,
        language,
      });
      setOutput(res.data.output || res.data.error || 'No output');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error executing code';
      setOutput(errorMsg);
      toast.error(errorMsg);
    }
    setLoading(false);
  };

  /**
   * Reset the code editor to the starter snippet for the current language.
   */
  const handleReset = () => {
    setCode(STARTER_SNIPPETS[language]);
    setOutput('');
  };

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 24 }}>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="inline-flex gap-2">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleLanguageChange({ target: { value: opt.value } })}
              className={
                `px-4 py-2 rounded-xl font-medium transition focus:cs-focus outline-none
                ${language === opt.value
                  ? 'bg-cs-primary text-cs-on-primary border-2 border-cs-primary shadow-sm'
                  : 'bg-cs-surface text-cs-on-surface border border-cs-outline hover:bg-cs-surface-variant'}
                `
              }
              aria-pressed={language === opt.value}
              aria-label={`Select ${opt.label} language`}
              tabIndex={0}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button onClick={handleRun} disabled={loading} style={{ marginLeft: 8 }} aria-label="Run code" tabIndex={0}>
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <svg width="18" height="18" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#fff" style={{ marginRight: 4 }}>
                <g fill="none" fillRule="evenodd">
                  <g transform="translate(1 1)" strokeWidth="2">
                    <circle strokeOpacity=".3" cx="18" cy="18" r="18" />
                    <path d="M36 18c0-9.94-8.06-18-18-18">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 18 18"
                        to="360 18 18"
                        dur="1s"
                        repeatCount="indefinite" />
                    </path>
                  </g>
                </g>
              </svg>
              Running...
            </span>
          ) : 'Run'}
        </button>
        <button onClick={handleReset} disabled={loading} style={{ marginLeft: 8 }} aria-label="Reset code" tabIndex={0}>
          Reset
        </button>
      </div>
      <MonacoEditor
        height="300px"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={(val) => setCode(val)}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
        }}
        onMount={(editor) => (editorRef.current = editor)}
      />
      <div style={{
        background: '#18181b',
        color: '#f1f5f9',
        padding: 16,
        marginTop: 16,
        borderRadius: 6,
        minHeight: 80,
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
      }}>
        <strong>Output:</strong>
        <div>{output}</div>
      </div>
    </div>
  );
}
