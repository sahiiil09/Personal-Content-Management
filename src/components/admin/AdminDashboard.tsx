import React, { useState } from 'react';
import { 
  Plus, 
  UploadCloud, 
  FileText, 
  Code2, 
  Globe, 
  FolderPlus, 
  ShieldCheck, 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Lock, 
  Layers, 
  HardDrive, 
  TrendingUp,
  FileSpreadsheet,
  Settings,
  RefreshCw,
  ExternalLink,
  Presentation,
  Folder
} from 'lucide-react';
import { ContentItem, Category, ContentType } from '../../types';
import { formatBytes } from '../../services/contentService';
import { getDriveTypeLabel } from '../../services/driveService';

interface AdminDashboardProps {
  content: ContentItem[];
  categories: Category[];
  onOpenEditor: (type?: ContentType, editItem?: ContentItem) => void;
  onOpenCategories: () => void;
  onOpenRules: () => void;
  onOpenConfig: () => void;
  onPreview: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
  onTogglePublish: (item: ContentItem) => void;
  onResetData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  content,
  categories,
  onOpenEditor,
  onOpenCategories,
  onOpenRules,
  onOpenConfig,
  onPreview,
  onDelete,
  onTogglePublish,
  onResetData,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Compute Metrics
  const totalItems = content.length;
  const publishedItems = content.filter((i) => i.published).length;
  const draftItems = totalItems - publishedItems;
  const totalFiles = content.filter((i) => i.type === 'file').length;
  const totalDrive = content.filter((i) => i.type === 'drive').length;
  const totalNotes = content.filter((i) => i.type === 'note').length;
  const totalCode = content.filter((i) => i.type === 'code').length;
  const totalSocial = content.filter((i) => i.type === 'social').length;

  const totalStorageBytes = content.reduce((acc, item) => acc + (item.fileData?.fileSize || 0), 0);

  // Filter content for management table
  const filteredContent = content.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div id="admin-dashboard-container" className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Header & Primary Action Buttons */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
                Admin Control Center
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
                Manage your digital assets. Direct upload to Cloudinary Free or index Google Drive resources.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Group */}
        <div className="flex flex-wrap items-center gap-2 pt-2 xl:pt-0">
          {/* Option 1: Direct File Upload */}
          <button
            id="admin-upload-file-btn"
            onClick={() => onOpenEditor('file')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-950/40 transition-all hover:scale-102"
          >
            <UploadCloud className="w-4 h-4" />
            <span>1. Upload File (Cloudinary)</span>
          </button>

          {/* Option 2: Add Google Drive File */}
          <button
            id="admin-add-drive-btn"
            onClick={() => onOpenEditor('drive')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-lg shadow-sky-950/40 transition-all hover:scale-102"
          >
            <ExternalLink className="w-4 h-4" />
            <span>2. Google Drive File</span>
          </button>

          <button
            id="admin-add-note-btn"
            onClick={() => onOpenEditor('note')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-950/40 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Note</span>
          </button>

          <button
            id="admin-add-code-btn"
            onClick={() => onOpenEditor('code')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition-all"
          >
            <Code2 className="w-4 h-4" />
            <span>Code</span>
          </button>

          <button
            id="admin-manage-cats-btn"
            onClick={onOpenCategories}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-xs transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Categories</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <span className="text-[11px] font-medium text-zinc-400 block">Total Items</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-zinc-100">{totalItems}</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <span className="text-[11px] font-medium text-emerald-400 block">Published</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-400">{publishedItems}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <span className="text-[11px] font-medium text-rose-400 block">Direct Files</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-zinc-100">{totalFiles}</span>
            <UploadCloud className="w-4 h-4 text-rose-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <span className="text-[11px] font-medium text-sky-400 block">Google Drive</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-sky-300">{totalDrive}</span>
            <ExternalLink className="w-4 h-4 text-sky-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <span className="text-[11px] font-medium text-emerald-400 block">Code & Notes</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-zinc-100">{totalCode + totalNotes}</span>
            <Code2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <span className="text-[11px] font-medium text-purple-400 block">Cloudinary Footprint</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold text-zinc-100 truncate">{formatBytes(totalStorageBytes)}</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Content Management Table / Card List Section */}
      <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 overflow-hidden shadow-xl">
        
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-zinc-100">Content Inventory & Access Control</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-800 text-zinc-400">
              {filteredContent.length} entries
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-search-inventory"
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter entries..."
                className="w-full sm:w-auto pl-8 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[180px]"
              />
            </div>

            <select
              id="admin-type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-medium focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="file">Uploaded Files (Cloudinary)</option>
              <option value="drive">Google Drive Files</option>
              <option value="note">Notes Only</option>
              <option value="code">Code Only</option>
              <option value="social">Social Links</option>
            </select>
          </div>
        </div>

        {/* Mobile Card List View (Fluid on screens < md) */}
        <div className="block md:hidden divide-y divide-zinc-800/80">
          {filteredContent.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No items found matching your criteria.
            </div>
          ) : (
            filteredContent.map((item) => (
              <div key={item.id} className="p-4 space-y-3 bg-zinc-900/40 hover:bg-zinc-850/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {item.type === 'drive' ? (
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          Drive: {item.driveData?.docType || 'File'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {item.type} {item.fileData?.format ? `(${item.fileData.format})` : ''}
                        </span>
                      )}
                      <span className="text-[11px] text-zinc-400 capitalize truncate">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-zinc-100 text-sm truncate">{item.title}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <button
                      id={`mobile-toggle-pub-row-${item.id}`}
                      onClick={() => onTogglePublish(item)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        item.published
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.published ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`mobile-row-preview-${item.id}`}
                      onClick={() => onPreview(item)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      id={`mobile-row-edit-${item.id}`}
                      onClick={() => onOpenEditor(item.type, item)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      id={`mobile-row-delete-${item.id}`}
                      onClick={() => onDelete(item)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-900/60 text-zinc-400 hover:text-rose-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop / Tablet Inventory Table (Hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/60 border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Title & Details</th>
                <th className="p-4">Type / Source</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Downloads</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredContent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    No items found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredContent.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="p-4 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-zinc-100 truncate text-sm">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {item.description}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {item.type === 'drive' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                          <ExternalLink className="w-3 h-3" />
                          <span>Google {item.driveData?.docType || 'Drive'}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {item.type} {item.fileData?.format ? `(${item.fileData.format})` : ''}
                        </span>
                      )}
                    </td>

                    <td className="p-4 whitespace-nowrap capitalize text-zinc-400 font-medium">
                      {item.category}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <button
                        id={`toggle-pub-row-${item.id}`}
                        onClick={() => onTogglePublish(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                          item.published
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                        }`}
                      >
                        {item.published ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Unpublished</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="p-4 whitespace-nowrap text-zinc-400">
                      {item.allowDownload ? (
                        <span className="text-emerald-400 font-medium">Enabled</span>
                      ) : (
                        <span className="text-zinc-500">Restricted</span>
                      )}
                    </td>

                    <td className="p-4 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`row-preview-${item.id}`}
                          onClick={() => onPreview(item)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          title="Preview Item"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`row-edit-${item.id}`}
                          onClick={() => onOpenEditor(item.type, item)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`row-delete-${item.id}`}
                          onClick={() => onDelete(item)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/60 text-zinc-400 hover:text-rose-300 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Architecture & Security Rules Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Storage Architecture & Security Policy</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Direct uploads hosted on Cloudinary Free (Zero Blaze needed) + Google Drive external resources + Firebase Firestore metadata database + Firebase Auth.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onOpenConfig}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-sky-400" />
            <span>Firebase Engine</span>
          </button>
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Security Rules</span>
          </button>
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 text-xs font-medium border border-zinc-800 transition-colors"
            title="Clear all stored items"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Clear Content</span>
          </button>
        </div>
      </div>

    </div>
  );
};
