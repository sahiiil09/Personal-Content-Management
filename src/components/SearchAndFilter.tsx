import React from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  FileText, 
  Code, 
  FolderGit2, 
  Globe, 
  ArrowUpDown,
  Tag as TagIcon
} from 'lucide-react';
import { ContentType, FilterState } from '../types';

interface SearchAndFilterProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  availableTags: string[];
  totalResults: number;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  filters,
  onFilterChange,
  availableTags,
  totalResults,
}) => {
  const contentTypes: { label: string; value: ContentType | 'all'; icon?: React.ReactNode }[] = [
    { label: 'All Items', value: 'all' },
    { label: 'Files', value: 'file' },
    { label: 'Google Drive', value: 'drive' },
    { label: 'Notes', value: 'note' },
    { label: 'Code', value: 'code' },
    { label: 'Social', value: 'social' },
    { label: 'Links', value: 'link' },
  ];

  return (
    <div id="search-filter-section" className="space-y-3 sm:space-y-4 mb-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search notes, files, source code, tags, algorithms..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all shadow-inner"
          />
          {filters.searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content Type Filter Pills + Sort Controls */}
        <div className="flex items-center justify-between md:justify-end gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            {contentTypes.map((t) => (
              <button
                key={t.value}
                id={`filter-type-${t.value}`}
                onClick={() => onFilterChange({ selectedType: t.value })}
                className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filters.selectedType === t.value
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0 ml-auto md:ml-0">
            <select
              id="sort-select"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="appearance-none pl-7 pr-7 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title (A-Z)</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Selected Tag or Tag Cloud */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1 mr-1">
            <TagIcon className="w-3 h-3" /> Popular Tags:
          </span>

          {filters.selectedTag && (
            <button
              id="clear-tag-filter"
              onClick={() => onFilterChange({ selectedTag: null })}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500 text-white shadow-sm"
            >
              <span>{filters.selectedTag}</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {availableTags.slice(0, 10).map((tag) => (
            <button
              key={tag}
              id={`tag-pill-${tag}`}
              onClick={() => onFilterChange({ selectedTag: filters.selectedTag === tag ? null : tag })}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors border ${
                filters.selectedTag === tag
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border-zinc-800/80 hover:bg-zinc-800'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
