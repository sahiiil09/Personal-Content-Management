import React, { useState } from 'react';
import { X, Database, ShieldCheck, Check, AlertCircle, Save, RefreshCw, Key, Cloud } from 'lucide-react';
import { 
  getActiveFirebaseConfig, 
  saveCustomFirebaseConfig, 
  clearCustomFirebaseConfig, 
  isFirebaseConfigured, 
  ADMIN_EMAIL,
  AUTHORIZED_ADMIN_UID
} from '../../lib/firebase';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../services/cloudinaryService';
import { FirebaseConfig } from '../../types';
import { useToast } from '../ui/Toast';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const toast = useToast();
  const current = getActiveFirebaseConfig();

  const [apiKey, setApiKey] = useState(current.apiKey || '');
  const [authDomain, setAuthDomain] = useState(current.authDomain || '');
  const [projectId, setProjectId] = useState(current.projectId || '');
  const [messagingSenderId, setMessagingSenderId] = useState(current.messagingSenderId || '');
  const [appId, setAppId] = useState(current.appId || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !projectId) {
      toast.error('Validation Error', 'API Key and Project ID are required.');
      return;
    }

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    saveCustomFirebaseConfig(config);
    toast.success('Configuration Saved', 'Connected to live Firebase instance (Auth & Firestore)!');
    onClose();
  };

  const handleReset = () => {
    clearCustomFirebaseConfig();
    toast.info('Reset to Default', 'Using standard environment configuration.');
    onClose();
  };

  const isConnected = isFirebaseConfigured();

  return (
    <div
      id="firebase-config-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="firebase-config-box"
        className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-zinc-100 relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Backend & Cloud Storage Status</h2>
            <p className="text-xs text-zinc-400">Firebase Auth & Firestore + Cloudinary Free</p>
          </div>
        </div>

        {/* Status Banner */}
        <div
          className={`p-3.5 rounded-2xl border mb-4 flex items-center justify-between text-xs ${
            isConnected
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'
              }`}
            />
            <span className="font-semibold">
              {isConnected ? `Live Firebase Connected (${current.projectId})` : 'Local High-Speed Cache Active'}
            </span>
          </div>
          <span className="text-[11px] font-mono opacity-80 truncate max-w-[150px]">UID: {AUTHORIZED_ADMIN_UID.substring(0, 10)}...</span>
        </div>

        {/* Cloudinary Integration Banner */}
        <div className="p-3.5 rounded-2xl border border-sky-500/20 bg-sky-950/30 mb-4 flex items-center justify-between text-xs text-sky-200">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-sky-400" />
            <div>
              <span className="font-semibold block">Cloudinary Free (Zero Blaze Required)</span>
              <span className="text-[11px] text-sky-300/80 font-mono">Preset: {CLOUDINARY_UPLOAD_PRESET} • Cloud: {CLOUDINARY_CLOUD_NAME}</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-medium border border-emerald-500/30">
            Unsigned
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Firebase Project ID
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="e.g. my-content-app-12345"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Web API Key (apiKey)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="project.firebaseapp.com"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                App ID
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:12345:web:abcdef"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800 gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors"
            >
              Reset
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-md shadow-sky-950/40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Connect</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
