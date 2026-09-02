import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ExternalLink, Download, FileText, AlertCircle } from 'lucide-react';
import { ContentItem } from '../../types';
import { formatBytes } from '../../services/contentService';

interface PdfViewerProps {
  item: ContentItem;
  allowDownload: boolean;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ item, allowDownload }) => {
  const [zoom, setZoom] = useState<number>(100);
  const [hasError, setHasError] = useState<boolean>(false);

  const pdfUrl = item.fileData?.downloadUrl || '';
  const fileName = item.fileData?.fileName || item.title;
  const fileSize = item.fileData?.fileSize ? formatBytes(item.fileData.fileSize) : '';

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  return (
    <div id="pdf-viewer-container" className="flex flex-col h-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
      {/* Viewer Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-300">
        <div className="flex items-center gap-2 font-medium truncate max-w-xs sm:max-w-md">
          <FileText className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate text-zinc-200">{fileName}</span>
          {fileSize && <span className="text-zinc-500 text-[11px]">({fileSize})</span>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
            <button
              id="pdf-zoom-out"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-1.5 hover:bg-zinc-700 rounded text-zinc-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-zinc-300">{zoom}%</span>
            <button
              id="pdf-zoom-in"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="p-1.5 hover:bg-zinc-700 rounded text-zinc-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="pdf-zoom-reset"
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-zinc-700 rounded text-zinc-300 transition-colors ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <a
            id="pdf-open-new-tab"
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open Raw</span>
          </a>

          {allowDownload && (
            <a
              id="pdf-download-btn"
              href={pdfUrl}
              download={item.fileData?.originalName || fileName}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          )}
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="relative flex-1 w-full min-h-[500px] overflow-auto bg-zinc-950 flex items-center justify-center p-2">
        {hasError ? (
          <div className="text-center p-8 max-w-md">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-90" />
            <h4 className="text-base font-semibold text-zinc-200">Embedded PDF Preview Blocked by Browser</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Your browser may restrict inline PDF rendering for cross-origin or local files. You can open the full document directly in a new tab.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-900/30 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Full PDF Reader
              </a>
            </div>
          </div>
        ) : (
          <div 
            className="w-full h-full flex justify-center items-center transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            <iframe
              id="pdf-frame"
              src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-[650px] rounded-lg shadow-2xl border border-zinc-800 bg-white"
              title={item.title}
              onError={() => setHasError(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
