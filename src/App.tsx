import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  HeroSection 
} from './components/HeroSection';
import { 
  CategoryNav 
} from './components/CategoryNav';
import { 
  SearchAndFilter 
} from './components/SearchAndFilter';
import { 
  ContentCard 
} from './components/ContentCard';
import { 
  PreviewModal 
} from './components/preview/PreviewModal';
import { 
  AdminDashboard 
} from './components/admin/AdminDashboard';
import { 
  ContentEditorModal 
} from './components/admin/ContentEditorModal';
import { 
  CategoryManagerModal 
} from './components/admin/CategoryManagerModal';
import { 
  SecurityRulesModal 
} from './components/admin/SecurityRulesModal';
import { 
  FirebaseConfigModal 
} from './components/admin/FirebaseConfigModal';
import { 
  LoginModal 
} from './components/auth/LoginModal';
import { 
  ToastProvider, 
  useToast 
} from './components/ui/Toast';
import { 
  ConfirmDialog 
} from './components/ui/ConfirmDialog';
import { 
  ContentItem, 
  Category, 
  FilterState, 
  ContentType, 
  UserProfile 
} from './types';
import { 
  contentService 
} from './services/contentService';
import { 
  authService, 
  AdminUserState 
} from './services/authService';
import { 
  BookOpen, 
  FolderOpen, 
  Plus, 
  Shield, 
  Layers, 
  Sparkles 
} from 'lucide-react';

function AppContent() {
  const toast = useToast();

  // Navigation & Authentication State
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [authState, setAuthState] = useState<AdminUserState>(authService.getCurrentState());

  // Data Store State
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>(contentService.getCategories());
  const [profile, setProfile] = useState<UserProfile>(contentService.getProfile());

  // Search & Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: 'all',
    selectedType: 'all',
    selectedTag: null,
    sortBy: 'newest',
    publishedOnly: true,
  });

  // Modal States
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editorInitialType, setEditorInitialType] = useState<ContentType>('file');
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Auth Subscriber
  useEffect(() => {
    const unsubAuth = authService.subscribe((state) => {
      setAuthState(state);
      if (!state.isAdmin && currentView === 'admin') {
        setCurrentView('public');
      }
    });
    return () => unsubAuth();
  }, [currentView]);

  // Content Realtime Subscriber
  useEffect(() => {
    // When in admin mode, fetch all items including unpublished drafts
    // When in public mode, only fetch published items
    const publishedOnly = currentView === 'public';
    const unsubContent = contentService.subscribeContent(publishedOnly, (items) => {
      setAllContent(items);
    });

    return () => unsubContent();
  }, [currentView]);

  // Refresh categories & profile
  const refreshCategories = useCallback(() => {
    setCategories(contentService.getCategories());
  }, []);

  // Filter & Search computation
  const filteredContent = useMemo(() => {
    return allContent.filter((item) => {
      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesCode = item.codeData?.code?.toLowerCase().includes(q) ?? false;
        const matchesNote = item.noteData?.content?.toLowerCase().includes(q) ?? false;

        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesCategory && !matchesCode && !matchesNote) {
          return false;
        }
      }

      // 2. Category
      if (filters.selectedCategory !== 'all') {
        if (item.category !== filters.selectedCategory) {
          return false;
        }
      }

      // 3. Type
      if (filters.selectedType !== 'all') {
        if (item.type !== filters.selectedType) {
          return false;
        }
      }

      // 4. Tag
      if (filters.selectedTag) {
        if (!item.tags.includes(filters.selectedTag)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (filters.sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (filters.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [allContent, filters]);

  // Compute category count breakdown
  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: allContent.length };
    categories.forEach((cat) => {
      if (cat.slug !== 'all') {
        counts[cat.slug] = allContent.filter((i) => i.category === cat.slug).length;
      }
    });
    return counts;
  }, [allContent, categories]);

  // Compute unique available tags
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    allContent.forEach((item) => {
      item.tags.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [allContent]);

  // Social items for hero
  const socialLinks = useMemo(() => {
    return allContent.filter((i) => i.type === 'social' && i.published);
  }, [allContent]);

  // Handlers
  const handleOpenPreview = (item: ContentItem) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  const handleOpenCreateEditor = (type: ContentType = 'file') => {
    setEditingItem(null);
    setEditorInitialType(type);
    setIsEditorOpen(true);
  };

  const handleOpenEditEditor = (item: ContentItem) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleTogglePublish = async (item: ContentItem) => {
    const nextStatus = !item.published;
    try {
      await contentService.togglePublishStatus(item.id, nextStatus);
      toast.success(
        nextStatus ? 'Item Published' : 'Item Unpublished',
        `"${item.title}" is now ${nextStatus ? 'visible to public visitors' : 'hidden from public view'}.`
      );
    } catch (e: any) {
      toast.error('Publish Error', e.message || 'Could not update publication state.');
    }
  };

  const handleDeleteItem = (item: ContentItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Library Asset?',
      message: `Are you sure you want to permanently delete "${item.title}"? If it has an associated Storage file, it will be removed from Cloud Storage.`,
      onConfirm: async () => {
        try {
          await contentService.deleteContent(item.id);
          toast.success('Deleted', `"${item.title}" was removed.`);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (e: any) {
          toast.error('Delete Failed', e.message);
        }
      },
    });
  };

  const handleClearAllContent = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear Content Repository?',
      message: 'This will remove all stored documents, notes, files, and source code records from the local repository.',
      onConfirm: () => {
        contentService.clearAllContent();
        toast.info('Repository Cleared', 'All content records have been cleared.');
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleLogout = async () => {
    await authService.logout();
    toast.info('Signed Out', 'You have returned to public viewer mode.');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 font-sans flex flex-col">
      
      {/* Top Application Bar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        authState={authState}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenRules={() => {
          if (authState.isAdmin) {
            setIsRulesModalOpen(true);
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        onOpenConfig={() => {
          if (authState.isAdmin) {
            setIsConfigModalOpen(true);
          } else {
            setIsLoginModalOpen(true);
          }
        }}
      />

      {/* Main Viewport */}
      <main className="flex-1">
        {currentView === 'public' ? (
          <div>
            {/* Creator Profile / Hero Header */}
            <HeroSection
              profile={profile}
              totalPublished={allContent.length}
              totalNotes={allContent.filter((i) => i.type === 'note').length}
              totalCode={allContent.filter((i) => i.type === 'code').length}
              totalFiles={allContent.filter((i) => i.type === 'file' || i.type === 'drive').length}
              socialLinks={socialLinks}
              onSelectType={(type) => setFilters((prev) => ({ ...prev, selectedType: type }))}
            />

            {/* Public Content Explorer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
              
              {/* Category Nav Ribbon */}
              <CategoryNav
                categories={categories}
                selectedCategory={filters.selectedCategory}
                onSelectCategory={(slug) => setFilters((prev) => ({ ...prev, selectedCategory: slug }))}
                countsByCategory={countsByCategory}
              />

              {/* Global Search & Filters */}
              <SearchAndFilter
                filters={filters}
                onFilterChange={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
                availableTags={availableTags}
                totalResults={filteredContent.length}
              />

              {/* Content Grid */}
              {filteredContent.length === 0 ? (
                <div className="text-center py-16 px-4 bg-zinc-900/40 rounded-3xl border border-zinc-800/80">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-200">No published items found</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                    Try adjusting your search criteria, clearing selected tags, or switching categories.
                  </p>
                  <button
                    onClick={() => setFilters({
                      searchQuery: '',
                      selectedCategory: 'all',
                      selectedType: 'all',
                      selectedTag: null,
                      sortBy: 'newest',
                      publishedOnly: true,
                    })}
                    className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {filteredContent.map((item) => (
                    <ContentCard
                      key={item.id}
                      item={item}
                      onPreview={handleOpenPreview}
                      isAdmin={authState.isAdmin}
                      onEdit={handleOpenEditEditor}
                      onDelete={handleDeleteItem}
                      onTogglePublish={handleTogglePublish}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Admin Mode Dashboard */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminDashboard
              content={allContent}
              categories={categories}
              onOpenEditor={handleOpenCreateEditor}
              onOpenCategories={() => setIsCategoryModalOpen(true)}
              onOpenRules={() => setIsRulesModalOpen(true)}
              onOpenConfig={() => setIsConfigModalOpen(true)}
              onPreview={handleOpenPreview}
              onDelete={handleDeleteItem}
              onTogglePublish={handleTogglePublish}
              onResetData={handleClearAllContent}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 px-4 sm:px-6 text-xs text-zinc-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-zinc-400 font-medium">{profile.name} • Personal Content Management</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Security Policy
            </button>
            <span>•</span>
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Firebase Engine
            </button>
            <span>•</span>
            <span>Zero-Trust Access Control</span>
          </div>
        </div>
      </footer>

      {/* Reusable Multi-Format Preview Modal */}
      <PreviewModal
        item={previewItem}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        isAdmin={authState.isAdmin}
      />

      {/* Admin Content Editor Modal */}
      <ContentEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialType={editorInitialType}
        editingItem={editingItem}
        categories={categories}
        onSaved={() => {
          // Handled via reactivity
        }}
      />

      {/* Admin Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCategoriesUpdated={refreshCategories}
      />

      {/* Security Rules & Documentation Modal (Admin Only) */}
      {authState.isAdmin && (
        <SecurityRulesModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
        />
      )}

      {/* Firebase Config Modal (Admin Only) */}
      {authState.isAdmin && (
        <FirebaseConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
        />
      )}

      {/* Admin Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setCurrentView('admin');
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
