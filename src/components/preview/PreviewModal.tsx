import React, { useState } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Download, 
  Share2, 
  ExternalLink, 
  Check, 
  Tag, 
  Calendar, 
  Lock, 
  Globe, 
  Eye
} from 'lucide-react';
import { ContentItem } from '../../types';
import { PdfViewer } from './PdfViewer';
import { CodeViewer } from './CodeViewer';
import { NotesViewer } from './NotesViewer';
import { ImageViewer } from './ImageViewer';
import { OfficeViewer } from './OfficeViewer';
import { DriveViewer } from './DriveViewer';

interface PreviewModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  item,
  isOpen,
  onClose,
  isAdmin,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!isOpen || !item) return null;

  const handleCopyShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/#item-${item.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.warn('Share copy error:', e);
    }
  };

  // Determine which viewer to render based on content type and file format
  const renderViewerBody = () => {
    // 1. Google Drive resources (Docs, Sheets, Slides, Drive PDFs, Folders, Shared Files)
    if (item.type === 'drive' || item.driveData || (item.linkData?.provider === 'drive')) {
      return <DriveViewer item={item} allowDownload={item.allowDownload} />;
    }

    if (item.type === 'file') {
      const format = item.fileData?.format || 'other';

      if (format === 'pdf') {
        return <PdfViewer item={item} allowDownload={item.allowDownload} />;
      }
      if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(format)) {
        return <ImageViewer item={item} allowDownload={item.allowDownload} />;
      }
      if (['txt', 'html', 'css', 'js', 'json'].includes(format) && item.fileData?.textPreviewContent) {
        return <CodeViewer item={item} allowDownload={item.allowDownload} />;
      }
      return <OfficeViewer item={item} allowDownload={item.allowDownload} />;
    }

    if (item.type === 'code') {
      return <CodeViewer item={item} allowDownload={item.allowDownload} />;
    }

    if (item.type === 'note') {
      return <NotesViewer item={item} />;
    }

    if (item.type === 'social') {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-900/80 rounded-2xl border border-zinc-800">
          <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
            <Globe className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-zinc-100">{item.title}</h3>
          <p className="text-sm text-zinc-400 max-w-md mt-2 mb-6">{item.description}</p>
          <a
            href={item.socialData?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-950/40 flex items-center gap-2 transition-all"
          >
            <span>Visit {item.socialData?.customPlatformName || item.socialData?.platform || 'Profile'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      );
    }

    if (item.type === 'link') {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-900/80 rounded-2xl border border-zinc-800">
          <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
            <ExternalLink className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-zinc-100">{item.title}</h3>
          <p className="text-sm text-zinc-400 max-w-md mt-2 mb-6">{item.description}</p>
          <a
            href={item.linkData?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition-all"
          >
            <span>Open External Resource</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      id="preview-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="preview-modal-container"
        className={`bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 text-zinc-100 ${
          isFullscreen
            ? 'w-full h-full rounded-none fixed inset-0 z-50'
            : 'w-full max-w-5xl max-h-[92vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-zinc-950/70 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
                {item.type}
              </span>
              {item.published ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <Globe className="w-3 h-3" /> Published
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <Lock className="w-3 h-3" /> Private Draft
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 truncate">{item.title}</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="preview-share-btn"
              onClick={handleCopyShare}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Copy share link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              id="preview-fullscreen-toggle"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors hidden sm:flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              id="preview-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950/40">
          {renderViewerBody()}

          {/* Item Meta Footer */}
          <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                Created {new Date(item.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-500" />
                Category: <strong className="text-zinc-200 capitalize">{item.category}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 italic">
                {item.allowDownload ? 'Direct downloads allowed' : 'View-only access mode'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
