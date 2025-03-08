"use client"
import { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { Code, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { CODE_SNIPPETS } from "@/constants/constants";
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";

const LearningCodeEditor = ({ isOpen, onClose, editorRef }) => {
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [showOutput, setShowOutput] = useState(false);

  const onMount = (editor) => {
    if (editorRef) {
      editorRef.current = editor;
    }
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };

  // Initialize with default code
  useEffect(() => {
    setValue(CODE_SNIPPETS[language]);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header with tabs */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowOutput(false)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
              !showOutput 
                ? 'bg-neutral-700/50 text-neutral-200' 
                : 'text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Editor</span>
          </button>
          <button
            onClick={() => setShowOutput(true)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
              showOutput 
                ? 'bg-neutral-700/50 text-neutral-200' 
                : 'text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Output</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSelector language={language} onSelect={onSelect} />
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ x: showOutput ? '-50%' : '0%' }}
          transition={{ type: "tween", duration: 0.3 }}
          className="relative w-[200%] h-full flex"
        >
          {/* Editor Panel */}
          <div className="w-1/2 h-full p-4">
            <div className="h-full border border-neutral-700 rounded-lg overflow-hidden">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={value}
                onChange={(value) => setValue(value)}
                onMount={onMount}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  lineNumbers: "on",
                  roundedSelection: false,
                  padding: { top: 16, bottom: 16 },
                  cursorStyle: "line",
                  tabSize: 2,
                  wordWrap: "on",
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="w-1/2 h-full p-4">
            <Output 
              editorRef={editorRef}
              language={language}
              value={value}
              hideSubmit={true}
              onRun={() => setShowOutput(true)}
              className="h-full"
            />
          </div>
        </motion.div>
      </div>

      {/* Run button */}
      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={() => {
            const outputComponent = document.querySelector('[data-run-button]');
            if (outputComponent) {
              outputComponent.click();
            }
            setShowOutput(true);
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-200 rounded-lg transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Run Code</span>
          <span className="text-xs opacity-60 ml-2">⌘R</span>
        </button>
      </div>
    </div>
  );
};

export default LearningCodeEditor; 