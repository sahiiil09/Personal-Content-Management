import React from 'react';
import { 
  Layers, 
  BookOpen, 
  Code2, 
  FileText, 
  FolderGit2, 
  Globe, 
  Sparkles, 
  Archive,
  Compass
} from 'lucide-react';
import { Category } from '../types';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  countsByCategory: Record<string, number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  countsByCategory,
}) => {
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'all':
        return <Layers className="w-3.5 h-3.5" />;
      case 'notes':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'source-code':
        return <Code2 className="w-3.5 h-3.5" />;
      case 'pdfs':
        return <FileText className="w-3.5 h-3.5" />;
      case 'documents':
        return <FolderGit2 className="w-3.5 h-3.5" />;
      case 'social':
        return <Globe className="w-3.5 h-3.5" />;
      case 'projects':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'resources':
        return <Archive className="w-3.5 h-3.5" />;
      default:
        return <Compass className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-2">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          const count = countsByCategory[cat.slug] ?? 0;

          return (
            <button
              key={cat.id}
              id={`cat-nav-${cat.slug}`}
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isSelected
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-md scale-100 font-bold'
                  : 'bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-800'
              }`}
            >
              <span className={isSelected ? 'text-zinc-950' : 'text-zinc-400'}>
                {getCategoryIcon(cat.slug)}
              </span>
              <span>{cat.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected
                    ? 'bg-zinc-950 text-zinc-100'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
