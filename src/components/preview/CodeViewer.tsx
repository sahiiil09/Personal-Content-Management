import React, { useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-bash';
import { Copy, Check, Code2, Download, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { ContentItem } from '../../types';

interface CodeViewerProps {
  item: ContentItem;
  allowDownload: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ item, allowDownload }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const rawCode = item.codeData?.code || item.fileData?.textPreviewContent || '';
  const language = item.codeData?.language || item.fileData?.format || 'javascript';
  const customLang = item.codeData?.customLanguage;

  useEffect(() => {
    Prism.highlightAll();
  }, [rawCode, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard copy error:', e);
    }
  };

  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([rawCode], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const lineCount = rawCode.split('\n').length;

  return (
    <div id="code-viewer-container" className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-zinc-800 font-mono text-sm">
      {/* Code Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#181818] border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5 mr-1">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-300 font-medium uppercase tracking-wider text-[10px] border border-emerald-500/20">
              {customLang || language}
            </span>
            <span className="text-zinc-500 text-[11px] font-sans">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'} • {rawCode.length} chars
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {item.codeData?.repoUrl && (
            <a
              id="code-repo-link"
              href={item.codeData.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors font-sans text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Repository</span>
            </a>
          )}

          {allowDownload && (
            <button
              id="code-download-btn"
              onClick={handleDownloadCode}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors font-sans text-xs"
              title="Download Source Code File"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          )}

          <button
            id="code-copy-btn"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all shadow-sm ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area with line numbers */}
      <div className="relative flex-1 overflow-auto max-h-[600px] p-4 bg-[#141414] text-zinc-100 selection:bg-emerald-500/30">
        <pre className="!bg-transparent !p-0 !m-0 font-mono text-[13px] leading-relaxed">
          <code className={`language-${language}`}>{rawCode}</code>
        </pre>
      </div>
    </div>
  );
};
