import React, { useState } from 'react';
import { 
  Shield, 
  Layers, 
  Search, 
  LogIn, 
  LogOut, 
  BookOpen, 
  Sparkles,
  Database,
  Lock,
  Menu,
  X
} from 'lucide-react';
import { AdminUserState } from '../services/authService';

interface NavbarProps {
  currentView: 'public' | 'admin';
  onViewChange: (view: 'public' | 'admin') => void;
  authState: AdminUserState;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenRules: () => void;
  onOpenConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  authState,
  onOpenLogin,
  onLogout,
  onOpenRules,
  onOpenConfig,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            onClick={() => {
              onViewChange('public');
              setMobileMenuOpen(false);
            }}
            className="cursor-pointer flex items-center gap-2 sm:gap-2.5 group shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base md:text-lg tracking-tight text-zinc-100 group-hover:text-white transition-colors truncate">
                  Digital Library
                </span>
                <span className="hidden xs:inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 -mt-0.5 hidden sm:block truncate">Personal Content & Notes</p>
            </div>
          </div>
        </div>

        {/* Desktop & Tablet Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium">
            <button
              id="nav-public-tab"
              onClick={() => {
                onViewChange('public');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all text-xs ${
                currentView === 'public'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Library</span>
              <span className="sm:hidden">Public</span>
            </button>

            <button
              id="nav-admin-tab"
              onClick={() => {
                if (authState.isAdmin) {
                  onViewChange('admin');
                  setMobileMenuOpen(false);
                } else {
                  onOpenLogin();
                }
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all text-xs ${
                currentView === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Admin Panel</span>
              <span className="sm:hidden">Admin</span>
              {!authState.isAdmin && <Lock className="w-3 h-3 text-zinc-500" />}
            </button>
          </div>

          {/* Quick Config & Security Rules Buttons (Strictly Admin Only) */}
          {authState.isAdmin && (
            <>
              <button
                id="nav-rules-btn"
                onClick={onOpenRules}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 text-xs transition-colors"
                title="Firebase Security Rules & Deployment Docs"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rules</span>
              </button>

              <button
                id="nav-config-btn"
                onClick={onOpenConfig}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 text-xs transition-colors"
                title="Firebase Database & Storage Settings"
              >
                <Database className="w-3.5 h-3.5 text-sky-400" />
                <span>Firebase Engine</span>
              </button>
            </>
          )}

          {/* Authentication Badge / Login Button */}
          {authState.isAdmin ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-indigo-950/60 border border-indigo-800/40 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-indigo-200 font-medium truncate max-w-[140px]">
                  {authState.displayName || authState.email?.split('@')[0]}
                </span>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-semibold">
                  ADMIN
                </span>
              </div>

              <button
                id="nav-logout-btn"
                onClick={onLogout}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-300 border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs"
                title="Sign Out of Admin Mode"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              id="nav-login-btn"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-950/40 transition-all shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            id="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-fadeIn">
          {authState.isAdmin && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/30 text-xs mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="text-indigo-200 font-medium truncate">
                Admin: {authState.email}
              </span>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-semibold ml-auto">
                ADMIN
              </span>
            </div>
          )}

          {authState.isAdmin ? (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onOpenRules();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors"
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Security Rules</span>
              </button>

              <button
                onClick={() => {
                  onOpenConfig();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors"
              >
                <Database className="w-4 h-4 text-sky-400" />
                <span>Firebase Engine</span>
              </button>
            </div>
          ) : (
            <div className="pt-1">
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Admin Login</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

