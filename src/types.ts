/**
 * Core Types for Personal Content Management & Digital Library
 * Architecture: Firebase Auth + Firebase Firestore + Cloudinary Free Storage
 */

export type ContentType = 
  | 'file'
  | 'drive'
  | 'note'
  | 'code'
  | 'social'
  | 'link';

export type FileFormat = 
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'txt'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'webp'
  | 'svg'
  | 'zip'
  | 'html'
  | 'css'
  | 'js'
  | 'json'
  | 'csv'
  | 'ppt'
  | 'pptx'
  | 'xls'
  | 'xlsx'
  | 'other';

export type GoogleDriveDocType = 
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'pdf'
  | 'folder'
  | 'file';

export interface GoogleDriveData {
  fileId?: string;
  originalUrl: string;
  embedUrl?: string;
  viewUrl: string;
  downloadUrl?: string;
  docType: GoogleDriveDocType;
  mimeTypeHint?: string;
}

export type CodeLanguage = 
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'python'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'php'
  | 'sql'
  | 'json'
  | 'xml'
  | 'markdown'
  | 'shell'
  | 'other';

export type SocialPlatform = 
  | 'github'
  | 'linkedin'
  | 'twitter'
  | 'youtube'
  | 'instagram'
  | 'telegram'
  | 'facebook'
  | 'whatsapp'
  | 'website'
  | 'custom';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder: number;
}

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  resource_type: string;
  format: string;
  bytes: number;
  original_filename: string;
  created_at: string;
  [key: string]: any;
}

export interface FileMetadata {
  title: string;
  originalFilename: string;
  fileName: string;
  cloudinaryPublicId: string;
  cloudinarySecureUrl: string;
  downloadUrl: string; // alias for preview/download compatibility
  resourceType: string;
  format: FileFormat;
  fileSize: number; // in bytes
  mimeType: string;
  category: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
  published: boolean;
  allowDownload: boolean;
  textPreviewContent?: string; // Direct cache for fast code/text/csv rendering
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  category: string; // Category slug or id
  tags: string[];
  published: boolean;
  featured?: boolean;
  allowDownload: boolean; // Setting to allow/restrict public direct download
  displayOrder?: number;
  uploadedBy?: string;
  uploadedAt?: string;
  createdAt: string; // ISO 8601 string or timestamp
  updatedAt: string;

  // File specific metadata (Stored in Firestore files & content collections)
  fileData?: FileMetadata;

  // Google Drive specific metadata (External Google Drive resource)
  driveData?: GoogleDriveData;

  // Note specific metadata
  noteData?: {
    content: string; // Rich markdown or text content
    readingTimeMinutes?: number;
  };

  // Source code specific metadata
  codeData?: {
    language: CodeLanguage;
    customLanguage?: string;
    code: string;
    repoUrl?: string;
    demoUrl?: string;
  };

  // Social link metadata
  socialData?: {
    platform: SocialPlatform;
    url: string;
    customPlatformName?: string;
    iconName?: string;
  };

  // External Link / Video metadata
  linkData?: {
    url: string;
    embedUrl?: string;
    provider?: 'youtube' | 'loom' | 'drive' | 'general';
  };
}

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  title: string;
  url: string;
  customPlatformName?: string;
  published: boolean;
  displayOrder: number;
}

export interface UserProfile {
  name: string;
  handle: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  location?: string;
  emailContact?: string;
  adminEmail: string;
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: string; // 'all' or category slug
  selectedType: ContentType | 'all';
  selectedTag: string | null;
  sortBy: 'newest' | 'oldest' | 'title' | 'popular';
  publishedOnly: boolean; // True for public mode, toggleable in admin
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
}

export interface UploadProgressInfo {
  progress: number;
  fileName: string;
  bytesTransferred: number;
  totalBytes: number;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}
