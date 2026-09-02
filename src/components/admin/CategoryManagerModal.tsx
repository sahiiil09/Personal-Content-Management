import React, { useState } from 'react';
import { X, Plus, Trash2, FolderPlus, Check, Folder } from 'lucide-react';
import { Category } from '../../types';
import { contentService } from '../../services/contentService';
import { useToast } from '../ui/Toast';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCategoriesUpdated: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onCategoriesUpdated,
}) => {
  const toast = useToast();
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSubmitting(true);
    try {
      await contentService.addCategory({
        name: newCatName.trim(),
        slug: newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: newCatDesc.trim() || undefined,
        displayOrder: categories.length + 1,
      });

      toast.success('Category Added', `Created category "${newCatName}"`);
      setNewCatName('');
      setNewCatDesc('');
      onCategoriesUpdated();
    } catch (e: any) {
      toast.error('Error', e.message || 'Could not create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (id === 'cat-all') {
      toast.error('Restricted', 'Cannot delete default category');
      return;
    }

    try {
      await contentService.deleteCategory(id);
      toast.success('Category Removed', `Deleted "${name}"`);
      onCategoriesUpdated();
    } catch (e: any) {
      toast.error('Error', e.message || 'Could not delete category');
    }
  };

  return (
    <div
      id="category-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="category-modal-box"
        className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-zinc-100 relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Manage Content Categories</h2>
            <p className="text-xs text-zinc-400">Organize your digital library assets</p>
          </div>
        </div>

        {/* Existing Categories List */}
        <div className="space-y-2 max-h-56 overflow-y-auto mb-6 pr-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <Folder className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="font-semibold text-zinc-200">{cat.name}</span>
                  <span className="text-[10px] text-zinc-500 block font-mono">slug: {cat.slug}</span>
                </div>
              </div>

              {cat.id !== 'cat-all' && (
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add New Category Form */}
        <form onSubmit={handleAddCategory} className="space-y-3 pt-4 border-t border-zinc-800">
          <h3 className="text-xs font-semibold text-zinc-300">Create Custom Category</h3>
          <div className="space-y-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category Name (e.g. AI Research, Cheat Sheets)"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Short Description (Optional)"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newCatName.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </form>
      </div>
    </div>
  );
};
