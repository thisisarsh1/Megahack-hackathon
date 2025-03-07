"use client"
import { useState } from "react";
import { executeCode } from "@/app/api/editor/api";
import { useRouter, usePathname } from "next/navigation";

const Output = ({ editorRef, language, hideSubmit = false, onRun, className = '' }) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isVideoCallPage = pathname.startsWith('/VideoCall/');

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    
    try {
      setIsLoading(true);
      const { run: result } = await executeCode(language, sourceCode);
      setOutput(result.output.split("\n"));
      result.stderr ? setIsError(true) : setIsError(false);
    } catch (error) {
      console.error(error);
      setIsError(true);
      setOutput([error.message || "Unable to run code"]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const sourceCode = editorRef.current.getValue();
      if (!sourceCode) return;

      // Run the code one last time
      await runCode();

      // Create timestamp for the filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${language}_${timestamp}.txt`;

      // Create a blob with the code content
      const blob = new Blob([sourceCode], { type: 'text/plain' });

      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(link.href);

      // Save to logs folder using fetch API
      const formData = new FormData();
      formData.append('file', blob, fileName);
      
      const response = await fetch('/api/savelog', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to save log file');
      }

      // Navigate to results with the completed status
      router.push(`/coding/results?status=completed`);
    } catch (error) {
      console.error('Error saving code:', error);
      setIsError(true);
      setOutput(['Failed to save code file']);
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg text-neutral-200">Output</div>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2
              ${isLoading 
                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50' 
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
              }`}
            disabled={isLoading}
            onClick={runCode}
            data-run-button
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <span>Run Code</span>
                <span className="text-xs opacity-60 ml-2">⌘R</span>
              </>
            )}
          </button>
          {!hideSubmit && !isVideoCallPage && (
            <button
              className="px-4 py-2 rounded-lg border transition-colors bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              Submit
            </button>
          )}
        </div>
      </div>
      <div
        className={`h-[calc(100vh-280px)] p-4 font-mono text-sm rounded-lg border overflow-auto
          ${isError 
            ? 'border-red-500/50 bg-red-500/10 text-red-400' 
            : 'border-neutral-700 bg-neutral-800/50 text-neutral-200'
          }`}
      >
        {output ? (
          output.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap mb-1">
              {line}
            </div>
          ))
        ) : (
          <div className="text-neutral-400">
            Click "Run Code" to see the output here
          </div>
        )}
      </div>
    </div>
  );
};

export default Output;
