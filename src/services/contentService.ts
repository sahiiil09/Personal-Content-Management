import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  isFirebaseConfigured,
  AUTHORIZED_ADMIN_UID,
  ADMIN_EMAIL
} from '../lib/firebase';
import { 
  Category, 
  ContentItem, 
  FileFormat, 
  UploadProgressInfo, 
  UserProfile,
  FileMetadata 
} from '../types';
import { 
  uploadToCloudinary, 
  validateFileTypeAndSize, 
  SUPPORTED_FILE_EXTENSIONS,
  getFileExtension 
} from './cloudinaryService';
import { INITIAL_CATEGORIES, DEFAULT_PROFILE } from '../lib/sampleData';

const LOCAL_CONTENT_KEY = 'pcm_local_content_store';
const LOCAL_CATEGORIES_KEY = 'pcm_local_categories_store';
const LOCAL_PROFILE_KEY = 'pcm_local_profile_store';

export { SUPPORTED_FILE_EXTENSIONS };

export const getFileFormatFromFilename = (filename: string): FileFormat => {
  const ext = getFileExtension(filename);
  return SUPPORTED_FILE_EXTENSIONS[ext] || 'other';
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

class ContentService {
  private localContent: ContentItem[] = [];
  private localCategories: Category[] = [];
  private localProfile: UserProfile = DEFAULT_PROFILE;
  private changeListeners: (() => void)[] = [];

  constructor() {
    this.initLocalStore();
  }

  private initLocalStore() {
    try {
      const storedContent = localStorage.getItem(LOCAL_CONTENT_KEY);
      if (storedContent) {
        const parsed = JSON.parse(storedContent);
        this.localContent = Array.isArray(parsed) ? parsed : [];
      } else {
        this.localContent = [];
      }

      const storedCats = localStorage.getItem(LOCAL_CATEGORIES_KEY);
      this.localCategories = storedCats ? JSON.parse(storedCats) : INITIAL_CATEGORIES;

      const storedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);
      this.localProfile = storedProfile ? JSON.parse(storedProfile) : DEFAULT_PROFILE;
    } catch (e) {
      console.warn('Error loading local content store', e);
      this.localContent = [];
      this.localCategories = INITIAL_CATEGORIES;
      this.localProfile = DEFAULT_PROFILE;
    }
  }

  private saveLocal() {
    try {
      localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(this.localContent));
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(this.localCategories));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(this.localProfile));
    } catch (e) {
      console.warn('Error writing to local storage', e);
    }
    this.notifyLocalChanges();
  }

  public subscribeToChanges(cb: () => void): () => void {
    this.changeListeners.push(cb);
    return () => {
      this.changeListeners = this.changeListeners.filter((l) => l !== cb);
    };
  }

  private notifyLocalChanges() {
    this.changeListeners.forEach((cb) => cb());
  }

  // --- Real-time Content & Files Subscription (Firestore + Local fallback) ---
  public subscribeContent(
    publishedOnly: boolean,
    onData: (items: ContentItem[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    if (db && isFirebaseConfigured()) {
      try {
        const filesRef = collection(db, 'files');
        // Public users query only published == true, Admin queries all
        const q = publishedOnly
          ? query(filesRef, where('published', '==', true), orderBy('createdAt', 'desc'))
          : query(filesRef, orderBy('createdAt', 'desc'));

        return onSnapshot(
          q,
          (snapshot) => {
            const items: ContentItem[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as any;
              items.push({ id: docSnap.id, ...data });
            });
            onData(items);
          },
          (err) => {
            console.warn('Firestore subscription notice, checking local cache:', err);
            this.deliverLocalContent(publishedOnly, onData);
            onError?.(err);
          }
        );
      } catch (err: any) {
        console.warn('Firestore query error, falling back to local dataset:', err);
        this.deliverLocalContent(publishedOnly, onData);
      }
    }

    // Local Fallback
    this.deliverLocalContent(publishedOnly, onData);
    return this.subscribeToChanges(() => {
      this.deliverLocalContent(publishedOnly, onData);
    });
  }

  private deliverLocalContent(publishedOnly: boolean, onData: (items: ContentItem[]) => void) {
    const items = publishedOnly 
      ? this.localContent.filter((item) => item.published)
      : [...this.localContent];
    
    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onData(items);
  }

  // --- Content Mutations ---
  public async addContent(item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentItem> {
    const timestamp = new Date().toISOString();
    const id = 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    const newItem: ContentItem = {
      ...item,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (db && isFirebaseConfigured()) {
      try {
        // Save to primary 'files' collection
        await setDoc(doc(db, 'files', id), newItem);
        // Also save to 'content' collection for backwards compatibility
        await setDoc(doc(db, 'content', id), newItem);
      } catch (error) {
        console.warn('Firestore setDoc failed, saving to local store:', error);
      }
    }

    this.localContent.unshift(newItem);
    this.saveLocal();
    return newItem;
  }

  public async updateContent(id: string, updates: Partial<ContentItem>): Promise<void> {
    const timestamp = new Date().toISOString();
    const cleanUpdates = { ...updates, updatedAt: timestamp };

    if (db && isFirebaseConfigured()) {
      try {
        await updateDoc(doc(db, 'files', id), cleanUpdates as any).catch(() => {});
        await updateDoc(doc(db, 'content', id), cleanUpdates as any).catch(() => {});
      } catch (error) {
        console.warn('Firestore updateDoc failed, updating local store:', error);
      }
    }

    const index = this.localContent.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.localContent[index] = { ...this.localContent[index], ...cleanUpdates };
      this.saveLocal();
    }
  }

  public async togglePublishStatus(id: string, published: boolean): Promise<void> {
    return this.updateContent(id, { published });
  }

  public async deleteContent(id: string): Promise<void> {
    if (db && isFirebaseConfigured()) {
      try {
        await deleteDoc(doc(db, 'files', id)).catch(() => {});
        await deleteDoc(doc(db, 'content', id)).catch(() => {});
      } catch (error) {
        console.warn('Firestore deleteDoc failed, removing from local store:', error);
      }
    }

    this.localContent = this.localContent.filter((i) => i.id !== id);
    this.saveLocal();
  }

  // --- Cloudinary Free File Upload & Metadata Registration ---
  public async uploadFile(
    file: File,
    metadata: {
      title: string;
      description: string;
      category: string;
      tags: string[];
      published: boolean;
      allowDownload: boolean;
      uploadedBy?: string;
    },
    onProgress?: (progress: UploadProgressInfo) => void
  ): Promise<ContentItem> {
    // 1. Validation: Verify supported file extension and max size
    const validation = validateFileTypeAndSize(file);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Unsupported file type or size');
    }

    const format = validation.format;
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Read small text/code files directly for immediate client-side preview caching
    let textPreviewContent: string | undefined = undefined;
    if (['txt', 'json', 'csv', 'html', 'css', 'js'].includes(format) && file.size < 500 * 1024) {
      try {
        textPreviewContent = await file.text();
      } catch (e) {
        console.warn('Could not read text preview content:', e);
      }
    }

    // 2. Upload file to Cloudinary unsigned endpoint
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(file, onProgress);
    } catch (uploadError: any) {
      console.warn('Cloudinary upload error, using local fallback:', uploadError);
      // Generate client-side fallback if offline
      const localDataUrl = await this.fileToDataUrl(file);
      cloudinaryResult = {
        public_id: `local_${Date.now()}_${sanitizedName}`,
        secure_url: localDataUrl,
        url: localDataUrl,
        resource_type: 'raw',
        format,
        bytes: file.size,
        original_filename: file.name,
        created_at: new Date().toISOString(),
      };
    }

    const uploadedAt = new Date().toISOString();
    const uploadedBy = metadata.uploadedBy || AUTHORIZED_ADMIN_UID;

    // 3. Build comprehensive metadata record
    const fileMetadata: FileMetadata = {
      title: metadata.title || file.name,
      originalFilename: file.name,
      fileName: sanitizedName,
      cloudinaryPublicId: cloudinaryResult.public_id,
      cloudinarySecureUrl: cloudinaryResult.secure_url,
      downloadUrl: cloudinaryResult.secure_url,
      resourceType: cloudinaryResult.resource_type || 'auto',
      format,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      category: metadata.category || 'resources',
      description: metadata.description || `Uploaded ${file.name} (${formatBytes(file.size)}) via Cloudinary Free`,
      uploadedBy,
      uploadedAt,
      published: metadata.published,
      allowDownload: metadata.allowDownload,
      textPreviewContent,
    };

    // 4. Save metadata in Firestore ('files' & 'content' collections)
    const newContentItem = await this.addContent({
      title: metadata.title || file.name,
      description: metadata.description || `Uploaded file: ${file.name} (${formatBytes(file.size)})`,
      type: 'file',
      category: metadata.category || 'resources',
      tags: metadata.tags.length > 0 ? metadata.tags : [format.toUpperCase(), 'File'],
      published: metadata.published,
      allowDownload: metadata.allowDownload,
      uploadedBy,
      uploadedAt,
      fileData: fileMetadata,
    });

    return newContentItem;
  }

  // --- Google Drive Optional Resource Addition & Metadata Registration ---
  public async addGoogleDriveContent(metadata: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    published: boolean;
    allowDownload: boolean;
    googleDriveUrl: string;
    parsedDrive: import('./driveService').ParsedGoogleDriveResource;
    uploadedBy?: string;
  }): Promise<ContentItem> {
    const uploadedAt = new Date().toISOString();
    const uploadedBy = metadata.uploadedBy || AUTHORIZED_ADMIN_UID;

    const driveData: import('../types').GoogleDriveData = {
      fileId: metadata.parsedDrive.fileId,
      originalUrl: metadata.googleDriveUrl,
      embedUrl: metadata.parsedDrive.embedUrl,
      viewUrl: metadata.parsedDrive.viewUrl,
      downloadUrl: metadata.parsedDrive.downloadUrl,
      docType: metadata.parsedDrive.docType,
      mimeTypeHint: metadata.parsedDrive.mimeTypeHint,
    };

    const docTypeLabel = metadata.parsedDrive.docType.toUpperCase();
    const defaultTags = metadata.tags.length > 0 ? metadata.tags : ['Google Drive', docTypeLabel];

    const newContentItem = await this.addContent({
      title: metadata.title || `Google Drive ${metadata.parsedDrive.docType}`,
      description: metadata.description || `Google Drive resource (${metadata.parsedDrive.docType})`,
      type: 'drive',
      category: metadata.category || 'resources',
      tags: defaultTags,
      published: metadata.published,
      allowDownload: metadata.allowDownload,
      uploadedBy,
      uploadedAt,
      driveData,
      linkData: {
        url: metadata.parsedDrive.viewUrl,
        embedUrl: metadata.parsedDrive.embedUrl,
        provider: 'drive',
      },
    });

    return newContentItem;
  }

  // --- Replace existing file with a new file from Cloudinary ---
  public async replaceFile(
    itemId: string,
    newFile: File,
    onProgress?: (progress: UploadProgressInfo) => void
  ): Promise<ContentItem> {
    const validation = validateFileTypeAndSize(newFile);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Unsupported file type or size');
    }

    const format = validation.format;
    const sanitizedName = newFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    let textPreviewContent: string | undefined = undefined;
    if (['txt', 'json', 'csv', 'html', 'css', 'js'].includes(format) && newFile.size < 500 * 1024) {
      try {
        textPreviewContent = await newFile.text();
      } catch (e) {
        console.warn('Could not read text preview content:', e);
      }
    }

    const cloudinaryResult = await uploadToCloudinary(newFile, onProgress);
    const updatedTimestamp = new Date().toISOString();

    const existing = this.localContent.find((i) => i.id === itemId);
    const currentFileData = existing?.fileData;

    const newFileData: FileMetadata = {
      title: existing?.title || newFile.name,
      originalFilename: newFile.name,
      fileName: sanitizedName,
      cloudinaryPublicId: cloudinaryResult.public_id,
      cloudinarySecureUrl: cloudinaryResult.secure_url,
      downloadUrl: cloudinaryResult.secure_url,
      resourceType: cloudinaryResult.resource_type || 'auto',
      format,
      fileSize: newFile.size,
      mimeType: newFile.type || 'application/octet-stream',
      category: existing?.category || 'resources',
      description: existing?.description || `Replaced file: ${newFile.name}`,
      uploadedBy: AUTHORIZED_ADMIN_UID,
      uploadedAt: updatedTimestamp,
      published: existing?.published ?? true,
      allowDownload: existing?.allowDownload ?? true,
      textPreviewContent,
    };

    await this.updateContent(itemId, {
      fileData: newFileData,
      updatedAt: updatedTimestamp,
    });

    const updatedItem = this.localContent.find((i) => i.id === itemId);
    return updatedItem!;
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve) => {
      if (file.size < 8 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(URL.createObjectURL(file));
        reader.readAsDataURL(file);
      } else {
        resolve(URL.createObjectURL(file));
      }
    });
  }

  // --- Categories Management ---
  public getCategories(): Category[] {
    return this.localCategories;
  }

  public async addCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now(),
      slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };

    if (db && isFirebaseConfigured()) {
      try {
        await setDoc(doc(db, 'categories', newCat.id), newCat);
      } catch (e) {
        console.warn('Firestore setDoc category error:', e);
      }
    }

    this.localCategories.push(newCat);
    this.saveLocal();
    return newCat;
  }

  public async deleteCategory(id: string): Promise<void> {
    if (db && isFirebaseConfigured()) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (e) {
        console.warn('Firestore delete category error:', e);
      }
    }

    this.localCategories = this.localCategories.filter((c) => c.id !== id);
    this.saveLocal();
  }

  // --- Profile Settings ---
  public getProfile(): UserProfile {
    return this.localProfile;
  }

  public updateProfile(updates: Partial<UserProfile>): void {
    this.localProfile = { ...this.localProfile, ...updates };
    this.saveLocal();
  }

  // Clear all content records
  public clearAllContent(): void {
    this.localContent = [];
    this.saveLocal();
  }
}

export const contentService = new ContentService();
