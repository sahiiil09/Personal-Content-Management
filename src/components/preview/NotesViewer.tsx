import React, { useState } from 'react';
import { BookOpen, Clock, Copy, Check, Tag } from 'lucide-react';
import { ContentItem } from '../../types';

interface NotesViewerProps {
  item: ContentItem;
}

export const NotesViewer: React.FC<NotesViewerProps> = ({ item }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const content = item.noteData?.content || item.description || '';
  const readingTime = item.noteData?.readingTimeMinutes || Math.ceil(content.split(/\s+/).length / 200);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy error:', e);
    }
  };

  // Lightweight markdown renderer helper to display rich notes beautifully
  const renderFormattedMarkdown = (markdown: string) => {
    const lines = markdown.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = '';

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="my-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLang = line.replace('```', '').trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-6 mb-3 tracking-tight border-b border-zinc-800 pb-2">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl sm:text-2xl font-semibold text-zinc-200 mt-5 mb-2 tracking-tight">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg font-medium text-amber-300 mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="my-4 pl-4 border-l-4 border-amber-500/60 text-zinc-300 italic bg-amber-500/5 py-2 pr-3 rounded-r-lg">
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} className="text-zinc-300 ml-5 list-disc leading-relaxed my-1">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
      } else if (line.trim() === '---') {
        elements.push(<hr key={index} className="my-6 border-zinc-800" />);
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />);
      } else {
        elements.push(
          <p key={index} className="text-zinc-300 text-sm sm:text-base leading-relaxed my-2">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div id="notes-viewer-container" className="flex flex-col h-full bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-800">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Note & Article</span>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readingTime} min read
              </span>
              <span>•</span>
              <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <button
          id="notes-copy-btn"
          onClick={handleCopyText}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 border border-zinc-700'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied Text</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Note</span>
            </>
          )}
        </button>
      </div>

      {/* Reader Body */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 max-h-[600px] text-zinc-200 bg-zinc-900/60">
        <div className="max-w-3xl mx-auto">
          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                >
                  <Tag className="w-3 h-3 text-amber-400" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Formatted Content */}
          <div className="prose prose-invert max-w-none">
            {renderFormattedMarkdown(content)}
          </div>
        </div>
      </div>
    </div>
  );
};
