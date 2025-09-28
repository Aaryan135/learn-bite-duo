import React, { useState, useRef } from 'react';
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

export default function CodingPractice() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(STARTER_SNIPPETS['javascript']);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(STARTER_SNIPPETS[lang]);
    setOutput('');
  };

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
      setOutput(err.response?.data?.error || 'Error executing code');
    }
    setLoading(false);
  };

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
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button onClick={handleRun} disabled={loading} style={{ marginLeft: 8 }}>
          {loading ? 'Running...' : 'Run'}
        </button>
        <button onClick={handleReset} disabled={loading} style={{ marginLeft: 8 }}>
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
