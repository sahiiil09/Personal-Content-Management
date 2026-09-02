import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Copy, 
  Check, 
  Database, 
  Cloud, 
  BookOpen, 
  Lock, 
  ExternalLink,
  Zap
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import { AUTHORIZED_ADMIN_UID, ADMIN_EMAIL } from '../../lib/firebase';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../services/cloudinaryService';

interface SecurityRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityRulesModal: React.FC<SecurityRulesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'firestore' | 'cloudinary' | 'guide'>('firestore');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if user is the authorized administrator
    function isAdmin() {
      return request.auth != null && (
        request.auth.uid == "${AUTHORIZED_ADMIN_UID}" ||
        request.auth.token.email == "${ADMIN_EMAIL}" ||
        request.auth.token.admin == true ||
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
    }

    // Files metadata collection:
    // Public users can read published files only.
    // Admin has full create, read, update, delete permissions.
    match /files/{fileId} {
      allow read: if resource.data.published == true || isAdmin();
      allow write: if isAdmin();
    }

    // Main content collection (files, notes, code snippets, links):
    // Public users can read published content only.
    // Admin has full create, read, update, delete permissions.
    match /content/{contentId} {
      allow read: if resource.data.published == true || isAdmin();
      allow write: if isAdmin();
    }

    // Categories: Public can read, admin can modify
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Social links: Public can read published links, admin can modify
    match /socialLinks/{linkId} {
      allow read: if resource.data.published == true || isAdmin();
      allow write: if isAdmin();
    }

    // Specialized notes & source code collections:
    match /notes/{noteId} {
      allow read: if resource.data.published == true || isAdmin();
      allow write: if isAdmin();
    }

    match /sourceCodes/{codeId} {
      allow read: if resource.data.published == true || isAdmin();
      allow write: if isAdmin();
    }

    // User settings & Admin accounts: Strictly admin only
    match /settings/{settingId} {
      allow read, write: if isAdmin();
    }

    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }
  }
}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success('Copied to Clipboard', `${label} copied.`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      id="rules-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="rules-modal-box"
        className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                Security Architecture & Cloudinary Storage Rules
              </h2>
              <p className="text-xs text-zinc-400">
                Firebase Auth + Firestore Metadata + Cloudinary Free Storage (No Blaze required)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('firestore')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'firestore'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>firestore.rules</span>
          </button>

          <button
            onClick={() => setActiveTab('cloudinary')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'cloudinary'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloudinary Storage Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'guide'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Setup & Architecture Guide</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/60">
          {activeTab === 'firestore' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-300 font-medium">
                    Strict UID Authorization (<code className="text-emerald-300 font-mono">{AUTHORIZED_ADMIN_UID}</code>)
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Public users can only read content where <code className="text-amber-300 font-mono">published == true</code>.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(firestoreRules, 'Firestore Rules')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors shrink-0"
                >
                  {copied === 'Firestore Rules' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Rules</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-amber-300 font-mono text-xs overflow-x-auto leading-relaxed">
                <code>{firestoreRules}</code>
              </pre>
            </div>
          )}

          {activeTab === 'cloudinary' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/20 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
                  <Zap className="w-4 h-4" />
                  <span>Cloudinary Free Direct Unsigned Architecture</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Files are uploaded directly to Cloudinary using an unsigned upload preset. No Cloudinary API Secret is required or stored in frontend code.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block font-mono">Cloud Name</span>
                    <strong className="text-xs text-zinc-200 font-mono">{CLOUDINARY_CLOUD_NAME}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block font-mono">Upload Preset (Unsigned)</span>
                    <strong className="text-xs text-emerald-400 font-mono">{CLOUDINARY_UPLOAD_PRESET}</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <h4 className="font-semibold text-zinc-100">Upload & Authorization Sequence:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-400">
                  <li>Admin logs in with Firebase Authentication (UID: <code className="text-indigo-300">{AUTHORIZED_ADMIN_UID}</code>).</li>
                  <li>Admin picks a file (PDF, DOCX, TXT, PNG, JPG, ZIP, Code, etc.).</li>
                  <li>Client validates file extension and size (&le; 100MB).</li>
                  <li>Browser uploads directly to Cloudinary via unsigned preset with progress feedback.</li>
                  <li>Cloudinary returns <code className="text-zinc-200">public_id</code>, <code className="text-zinc-200">secure_url</code>, format, and bytes.</li>
                  <li>Metadata is saved to Firestore <code className="text-amber-300">files</code> collection.</li>
                  <li>Public visitors can only view content if <code className="text-emerald-300">published == true</code>.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-zinc-300">
              <div className="border border-zinc-800 p-4 rounded-2xl bg-zinc-900/60 space-y-3">
                <h3 className="text-sm font-bold text-zinc-100">
                  Zero-Blaze Production Setup
                </h3>
                <ul className="space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-zinc-200">1. Firebase Authentication:</strong> Enable Email/Password or Google login in Firebase Console.
                  </li>
                  <li>
                    <strong className="text-zinc-200">2. Firestore Database:</strong> Create Firestore database and paste the security rules from the <em>firestore.rules</em> tab.
                  </li>
                  <li>
                    <strong className="text-zinc-200">3. Cloudinary Account:</strong> Ensure Cloud Name <code className="text-sky-300">{CLOUDINARY_CLOUD_NAME}</code> and unsigned preset <code className="text-sky-300">{CLOUDINARY_UPLOAD_PRESET}</code> are active.
                  </li>
                  <li>
                    <strong className="text-zinc-200">4. Google Drive Integration (Optional):</strong> Paste links to Google Drive files or Google Docs. Sharing is managed by Google Drive permissions without requiring Firebase Storage.
                  </li>
                  <li>
                    <strong className="text-zinc-200">5. Admin UID Authorization:</strong> UID <code className="text-indigo-300 font-mono">{AUTHORIZED_ADMIN_UID}</code> is pre-authorized for all admin capabilities.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
