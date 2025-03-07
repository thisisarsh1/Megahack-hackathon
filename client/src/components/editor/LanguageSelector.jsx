"use client"
import { useState } from "react";
import { LANGUAGE_VERSIONS } from "@/constants/constants";

const languages = Object.entries(LANGUAGE_VERSIONS);

const LanguageSelector = ({ language, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative mb-4">
      <div className="text-lg mb-2 text-neutral-200">Language:</div>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg flex items-center justify-between w-40"
        >
          <span>{language}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
            {languages.map(([lang, version]) => (
              <button
                key={lang}
                className={`w-full px-4 py-2 text-left hover:bg-neutral-700 transition-colors ${
                  lang === language 
                    ? 'text-cyan-400 bg-neutral-700' 
                    : 'text-neutral-200'
                }`}
                onClick={() => {
                  onSelect(lang);
                  setIsOpen(false);
                }}
              >
                <span>{lang}</span>
                <span className="text-sm text-neutral-400 ml-2">({version})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;
