import React from 'react';
import { 
  FileText, 
  Code2, 
  BookOpen, 
  Globe, 
  ExternalLink, 
  Eye, 
  Download, 
  Tag, 
  Calendar, 
  Lock, 
  CheckCircle, 
  FileSpreadsheet, 
  Presentation, 
  Archive, 
  Image as ImageIcon,
  Edit2,
  Trash2,
  Share2
} from 'lucide-react';
import { ContentItem } from '../types';
import { formatBytes } from '../services/contentService';

interface ContentCardProps {
  item: ContentItem;
  onPreview: (item: ContentItem) => void;
  isAdmin: boolean;
  onEdit?: (item: ContentItem) => void;
  onDelete?: (item: ContentItem) => void;
  onTogglePublish?: (item: ContentItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  onPreview,
  isAdmin,
  onEdit,
  onDelete,
  onTogglePublish,
}) => {
  const getTypeBadge = () => {
    switch (item.type) {
      case 'file': {
        const format = item.fileData?.format || 'other';
        let colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        let icon = <FileText className="w-3.5 h-3.5" />;

        if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(format)) {
          colorClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
          icon = <ImageIcon className="w-3.5 h-3.5" />;
        } else if (['xls', 'xlsx', 'csv'].includes(format)) {
          colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
          icon = <FileSpreadsheet className="w-3.5 h-3.5" />;
        } else if (['ppt', 'pptx'].includes(format)) {
          colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
          icon = <Presentation className="w-3.5 h-3.5" />;
        } else if (format === 'zip') {
          colorClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
          icon = <Archive className="w-3.5 h-3.5" />;
        }

        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider border ${colorClass}`}>
            {icon}
            <span>{format}</span>
          </span>
        );
      }
      case 'drive': {
        const docType = item.driveData?.docType || 'file';
        let badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
        let icon = <ExternalLink className="w-3.5 h-3.5" />;
        let label = 'Drive File';

        if (docType === 'document') {
          badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
          icon = <FileText className="w-3.5 h-3.5" />;
          label = 'Doc';
        } else if (docType === 'spreadsheet') {
          badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
          icon = <FileSpreadsheet className="w-3.5 h-3.5" />;
          label = 'Sheet';
        } else if (docType === 'presentation') {
          badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
          icon = <Presentation className="w-3.5 h-3.5" />;
          label = 'Slides';
        } else if (docType === 'folder') {
          badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
          icon = <Archive className="w-3.5 h-3.5" />;
          label = 'Folder';
        } else if (docType === 'pdf') {
          badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
          icon = <FileText className="w-3.5 h-3.5" />;
          label = 'Drive PDF';
        }

        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider border ${badgeColor}`}>
            {icon}
            <span>{label}</span>
          </span>
        );
      }
      case 'code':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Code2 className="w-3.5 h-3.5" />
            <span>{item.codeData?.customLanguage || item.codeData?.language || 'Code'}</span>
          </span>
        );
      case 'note':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Note</span>
          </span>
        );
      case 'social':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Globe className="w-3.5 h-3.5" />
            <span>{item.socialData?.platform || 'Social'}</span>
          </span>
        );
      case 'link':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Link</span>
          </span>
        );
    }
  };

  const fileSize = item.fileData?.fileSize ? formatBytes(item.fileData.fileSize) : null;
  const isImage = item.type === 'file' && ['png', 'jpg', 'jpeg', 'webp'].includes(item.fileData?.format || '');

  return (
    <div
      id={`content-card-${item.id}`}
      className="group relative flex flex-col justify-between rounded-2xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700/80 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5"
    >
      <div>
        {/* Top Badges & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {getTypeBadge()}
            {item.category && (
              <span className="text-[11px] font-medium text-zinc-400 capitalize">
                {item.category.replace('-', ' ')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                id={`card-toggle-publish-${item.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePublish?.(item);
                }}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-colors ${
                  item.published
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                }`}
                title="Toggle Publish Status"
              >
                {item.published ? 'Published' : 'Draft'}
              </button>
            )}

            {!isAdmin && !item.published && (
              <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Draft
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail Preview for Images */}
        {isImage && item.fileData?.downloadUrl && (
          <div 
            onClick={() => onPreview(item)}
            className="cursor-pointer mb-3.5 h-36 w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80 relative group/thumb"
          >
            <img
              src={item.fileData.downloadUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
              <span className="px-3 py-1.5 rounded-lg bg-black/75 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                <Eye className="w-3.5 h-3.5" /> Preview
              </span>
            </div>
          </div>
        )}

        {/* Code Preview Excerpt */}
        {item.type === 'code' && item.codeData?.code && (
          <div 
            onClick={() => onPreview(item)}
            className="cursor-pointer mb-3.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 font-mono text-[11px] text-emerald-400/90 overflow-hidden max-h-24 relative select-none"
          >
            <pre className="overflow-hidden leading-tight">
              <code>{item.codeData.code.slice(0, 140)}...</code>
            </pre>
            <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
          </div>
        )}

        {/* Title */}
        <h3 
          onClick={() => onPreview(item)}
          className="cursor-pointer text-base font-semibold text-zinc-100 group-hover:text-indigo-400 transition-colors line-clamp-2 tracking-tight"
        >
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
          {item.description}
        </p>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/40"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-[10px] text-zinc-500 self-center">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3.5 border-t border-zinc-800/70 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          {fileSize && <span>• {fileSize}</span>}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <>
              <button
                id={`card-edit-btn-${item.id}`}
                onClick={() => onEdit?.(item)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                title="Edit Item"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                id={`card-delete-btn-${item.id}`}
                onClick={() => onDelete?.(item)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/60 text-zinc-400 hover:text-rose-300 transition-colors"
                title="Delete Item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Download button if allowed (Direct Cloudinary upload or Google Drive export) */}
          {item.allowDownload && (
            item.fileData?.downloadUrl && item.fileData.downloadUrl !== '#' ? (
              <a
                id={`card-download-btn-${item.id}`}
                href={item.fileData.downloadUrl}
                download={item.fileData.originalFilename || item.fileData.fileName}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                title="Download File"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            ) : (item.type === 'drive' && item.driveData?.downloadUrl) ? (
              <a
                id={`card-drive-download-btn-${item.id}`}
                href={item.driveData.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                title="Download from Google Drive"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            ) : null
          )}

          {/* Direct Drive link if type is drive */}
          {item.type === 'drive' && item.driveData?.viewUrl && (
            <a
              id={`card-open-drive-btn-${item.id}`}
              href={item.driveData.viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-sky-900/50 text-zinc-300 hover:text-sky-300 transition-colors"
              title="Open in Google Drive"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Primary View / Preview Button */}
          <button
            id={`card-preview-btn-${item.id}`}
            onClick={() => onPreview(item)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-indigo-600 text-zinc-200 hover:text-white font-medium text-xs transition-all shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
