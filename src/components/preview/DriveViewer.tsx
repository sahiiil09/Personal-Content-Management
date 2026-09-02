import React, { useState } from 'react';
import { 
  ExternalLink, 
  Download, 
  ShieldAlert, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Folder, 
  FileCode, 
  Lock, 
  Globe, 
  Sparkles,
  Info,
  RefreshCw,
  Eye,
  Layers
} from 'lucide-react';
import { ContentItem } from '../../types';
import { getDriveTypeLabel } from '../../services/driveService';

interface DriveViewerProps {
  item: ContentItem;
  allowDownload: boolean;
}

export const DriveViewer: React.FC<DriveViewerProps> = ({ item, allowDownload }) => {
  const [iframeError, setIframeError] = useState(false);
  const [viewMode, setViewMode] = useState<'embed' | 'info'>('embed');
  const [iframeKey, setIframeKey] = useState(1);

  const driveData = item.driveData;
  const originalUrl = driveData?.originalUrl || item.linkData?.url || '';
  const embedUrl = driveData?.embedUrl || (originalUrl.includes('/view') ? originalUrl.replace('/view', '/preview') : originalUrl);
  const viewUrl = driveData?.viewUrl || originalUrl;
  const downloadUrl = driveData?.downloadUrl;
  const docType = driveData?.docType || 'file';

  const getTypeIcon = () => {
    switch (docType) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'presentation':
        return <Presentation className="w-5 h-5 text-amber-400" />;
      case 'folder':
        return <Folder className="w-5 h-5 text-indigo-400" />;
      case 'pdf':
        return <FileCode className="w-5 h-5 text-rose-400" />;
      default:
        return <Globe className="w-5 h-5 text-sky-400" />;
    }
  };

  const getDocTypeBadgeStyle = () => {
    switch (docType) {
      case 'document':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'spreadsheet':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'presentation':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'folder':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'pdf':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    }
  };

  return (
    <div id="drive-viewer-root" className="flex flex-col h-full space-y-4">
      {/* Top Action & Status Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 shrink-0">
            {getTypeIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${getDocTypeBadgeStyle()}`}>
                {getDriveTypeLabel(docType)}
              </span>
              <span className="text-xs text-zinc-400 font-medium truncate hidden xs:inline">
                Google Drive Hosted
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-semibold truncate mt-0.5">
              {item.title}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
            <button
              onClick={() => setViewMode('embed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
                viewMode === 'embed'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Interactive Preview
            </button>
            <button
              onClick={() => setViewMode('info')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
                viewMode === 'info'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Details & Access
            </button>
          </div>

          <a
            id="drive-open-external-btn"
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-950/40 transition-all"
            title="Open in Google Drive (new tab)"
          >
            <span>Open in Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {allowDownload && downloadUrl && (
            <a
              id="drive-download-direct-btn"
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
              title="Download from Google Drive"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
        </div>
      </div>

      {/* Permission & Privacy Notification Banner */}
      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200/90">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-amber-300">
            Google Drive Permissions & Access
          </p>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            Google Drive files are hosted on Google servers. For visitors to preview directly, ensure the Drive file sharing is set to <strong className="text-white">"Anyone with the link can view"</strong>. If a file is private, viewers can click <strong className="text-white">"Open in Drive"</strong> to request permission or sign in with their Google account.
          </p>
        </div>
      </div>

      {/* Main Viewport */}
      {viewMode === 'embed' ? (
        <div className="relative w-full h-[550px] sm:h-[650px] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-inner flex flex-col">
          {embedUrl ? (
            <iframe
              key={iframeKey}
              src={embedUrl}
              title={item.title}
              className="w-full h-full border-0 bg-zinc-950"
              allow="autoplay"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
              onError={() => setIframeError(true)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <ShieldAlert className="w-10 h-10 text-amber-400 mb-3" />
              <h4 className="text-base font-bold text-zinc-200">Embedded preview not directly available</h4>
              <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-4">
                This Google Drive resource cannot be displayed in an iframe. Click below to open directly.
              </p>
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2"
              >
                <span>Open in Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Quick Refresh / Direct Fallback Bar */}
          <div className="p-2.5 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 px-4">
            <span className="text-[11px]">
              If preview does not load or asks for sign-in:
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIframeKey((prev) => prev + 1)}
                className="flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reload Frame</span>
              </button>
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
              >
                <span>Open Direct</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* Details & Access View */
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">{item.title}</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Google Drive Details
              </span>
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Resource Type:</span>
                  <span className="font-semibold text-zinc-200">{getDriveTypeLabel(docType)}</span>
                </div>
                {driveData?.fileId && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Google Drive ID:</span>
                    <span className="font-mono text-zinc-300 text-[11px] truncate max-w-[160px]">{driveData.fileId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-500">Hosting:</span>
                  <span className="text-sky-400 font-medium">Google Cloud / Drive</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Direct Download:</span>
                  <span className={item.allowDownload ? 'text-emerald-400' : 'text-zinc-400'}>
                    {item.allowDownload ? 'Allowed' : 'View-Only Mode'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Permission Management
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                To update who can see this document:
              </p>
              <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
                <li>Open the file in Google Drive.</li>
                <li>Click <strong className="text-zinc-200">Share</strong> at top right.</li>
                <li>Under General Access, choose <strong className="text-zinc-200">"Anyone with the link"</strong> (Viewer).</li>
                <li>Save changes in Google Drive.</li>
              </ol>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-lg shadow-sky-950/40 transition-all"
            >
              <span>Open in Google Drive</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {allowDownload && downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download via Drive</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
