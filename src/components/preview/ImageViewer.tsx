import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download, Image as ImageIcon, Maximize, ExternalLink } from 'lucide-react';
import { ContentItem } from '../../types';
import { formatBytes } from '../../services/contentService';

interface ImageViewerProps {
  item: ContentItem;
  allowDownload: boolean;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ item, allowDownload }) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  const imageUrl = item.fileData?.downloadUrl || '';
  const fileName = item.fileData?.fileName || item.title;
  const fileSize = item.fileData?.fileSize ? formatBytes(item.fileData.fileSize) : '';

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  return (
    <div id="image-viewer-container" className="flex flex-col h-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
      {/* Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2 text-zinc-300 truncate max-w-sm">
          <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate font-medium text-zinc-100">{fileName}</span>
          {fileSize && <span className="text-zinc-500">({fileSize})</span>}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
            <button
              id="img-zoom-out"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-1.5 hover:bg-zinc-700 rounded text-zinc-300 disabled:opacity-40 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-zinc-300">{zoom}%</span>
            <button
              id="img-zoom-in"
              onClick={handleZoomIn}
              disabled={zoom >= 250}
              className="p-1.5 hover:bg-zinc-700 rounded text-zinc-300 disabled:opacity-40 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="img-rotate"
              onClick={handleRotate}
              className="p-1.5 hover:bg-zinc-700 rounded text-zinc-300 transition-colors"
              title="Rotate 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <a
            id="img-open-tab"
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Full Image</span>
          </a>

          {allowDownload && (
            <a
              id="img-download-btn"
              href={imageUrl}
              download={fileName}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          )}
        </div>
      </div>

      {/* Image Stage */}
      <div className="relative flex-1 min-h-[450px] max-h-[600px] overflow-auto flex items-center justify-center p-6 bg-zinc-950/80 pattern-grid">
        <img
          id="preview-image-element"
          src={imageUrl}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="max-h-[550px] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200 select-none"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
          }}
        />
      </div>
    </div>
  );
};
