import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Code2, 
  Globe, 
  Link as LinkIcon, 
  Check, 
  AlertCircle, 
  Lock, 
  Download, 
  Layers,
  Sparkles,
  RefreshCw,
  FileCheck,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Folder,
  FileSpreadsheet,
  Presentation,
  Info
} from 'lucide-react';
import { 
  ContentType, 
  ContentItem, 
  Category, 
  CodeLanguage, 
  SocialPlatform, 
  UploadProgressInfo,
  GoogleDriveData
} from '../../types';
import { 
  contentService, 
  formatBytes, 
  getFileFormatFromFilename 
} from '../../services/contentService';
import { 
  validateFileTypeAndSize, 
  SUPPORTED_FILE_EXTENSIONS,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET
} from '../../services/cloudinaryService';
import { 
  parseGoogleDriveUrl, 
  getDriveTypeLabel, 
  ParsedGoogleDriveResource 
} from '../../services/driveService';
import { useToast } from '../ui/Toast';

interface ContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ContentType;
  editingItem?: ContentItem | null;
  categories: Category[];
  onSaved: (item: ContentItem) => void;
}

export const ContentEditorModal: React.FC<ContentEditorModalProps> = ({
  isOpen,
  onClose,
  initialType = 'file',
  editingItem,
  categories,
  onSaved,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const [contentType, setContentType] = useState<ContentType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]?.slug || 'resources');
  const [tagsInput, setTagsInput] = useState('');
  const [published, setPublished] = useState(true);
  const [allowDownload, setAllowDownload] = useState(true);

  // File Upload State (Cloudinary Free)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Google Drive State (Optional Externally Hosted File)
  const [driveUrl, setDriveUrl] = useState('');
  const [parsedDrive, setParsedDrive] = useState<ParsedGoogleDriveResource | null>(null);

  // Note State
  const [noteContent, setNoteContent] = useState('');

  // Code State
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('typescript');
  const [customLanguage, setCustomLanguage] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  // Social Link State
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>('github');
  const [socialUrl, setSocialUrl] = useState('');
  const [customPlatformName, setCustomPlatformName] = useState('');

  // External Link State
  const [externalUrl, setExternalUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate fields if editing
  useEffect(() => {
    if (editingItem) {
      setContentType(editingItem.type);
      setTitle(editingItem.title);
      setDescription(editingItem.description);
      setCategory(editingItem.category);
      setTagsInput(editingItem.tags.join(', '));
      setPublished(editingItem.published);
      setAllowDownload(editingItem.allowDownload ?? true);
      setReplacementFile(null);

      if (editingItem.driveData) {
        setDriveUrl(editingItem.driveData.originalUrl);
        setParsedDrive(parseGoogleDriveUrl(editingItem.driveData.originalUrl));
      } else if (editingItem.linkData?.url && editingItem.type === 'drive') {
        setDriveUrl(editingItem.linkData.url);
        setParsedDrive(parseGoogleDriveUrl(editingItem.linkData.url));
      }

      if (editingItem.noteData) {
        setNoteContent(editingItem.noteData.content || '');
      }
      if (editingItem.codeData) {
        setCodeLanguage(editingItem.codeData.language);
        setCustomLanguage(editingItem.codeData.customLanguage || '');
        setCodeSnippet(editingItem.codeData.code || '');
        setRepoUrl(editingItem.codeData.repoUrl || '');
        setDemoUrl(editingItem.codeData.demoUrl || '');
      }
      if (editingItem.socialData) {
        setSocialPlatform(editingItem.socialData.platform);
        setSocialUrl(editingItem.socialData.url);
        setCustomPlatformName(editingItem.socialData.customPlatformName || '');
      }
      if (editingItem.linkData) {
        setExternalUrl(editingItem.linkData.url);
      }
    } else {
      setContentType(initialType);
      resetForm();
    }
  }, [editingItem, initialType, isOpen]);

  // Real-time parse Google Drive URL when typing
  useEffect(() => {
    if (contentType === 'drive' && driveUrl.trim()) {
      const parsed = parseGoogleDriveUrl(driveUrl.trim());
      setParsedDrive(parsed);
      if (parsed.isValid && !title && !editingItem) {
        const defaultName = getDriveTypeLabel(parsed.docType);
        setTitle(defaultName);
        if (!description) {
          setDescription(`External Google Drive resource (${defaultName})`);
        }
      }
    } else if (contentType === 'drive' && !driveUrl.trim()) {
      setParsedDrive(null);
    }
  }, [driveUrl, contentType]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(categories[0]?.slug || 'resources');
    setTagsInput('');
    setPublished(true);
    setAllowDownload(true);
    setSelectedFile(null);
    setReplacementFile(null);
    setUploadProgress(null);
    setDriveUrl('');
    setParsedDrive(null);
    setNoteContent('');
    setCodeSnippet('');
    setRepoUrl('');
    setDemoUrl('');
    setSocialUrl('');
    setExternalUrl('');
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePickedFile(file);
    }
  };

  const handleReplacementFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFileTypeAndSize(file);
      if (!validation.isValid) {
        toast.error('Invalid Replacement File', validation.error || 'Unsupported file type or size');
        return;
      }
      setReplacementFile(file);
      toast.info('Replacement Selected', `"${file.name}" will replace the current file.`);
    }
  };

  const handlePickedFile = (file: File) => {
    const validation = validateFileTypeAndSize(file);
    if (!validation.isValid) {
      toast.error('Unsupported File', validation.error || 'Please select a supported file type under 100MB.');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    if (!description) {
      setDescription(`Uploaded ${file.name} (${formatBytes(file.size)})`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handlePickedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Validation Error', 'Please enter a title for the content.');
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setIsSubmitting(true);

    try {
      if (editingItem) {
        // Handle file replacement if admin picked a replacement file
        if (editingItem.type === 'file' && replacementFile) {
          await contentService.replaceFile(
            editingItem.id,
            replacementFile,
            (progress) => setUploadProgress(progress)
          );
        }

        // Updating existing item metadata
        const updates: Partial<ContentItem> = {
          title,
          description,
          category,
          tags: parsedTags,
          published,
          allowDownload,
        };

        if (contentType === 'drive') {
          const parsed = parseGoogleDriveUrl(driveUrl);
          updates.driveData = {
            fileId: parsed.fileId,
            originalUrl: driveUrl,
            embedUrl: parsed.embedUrl,
            viewUrl: parsed.viewUrl,
            downloadUrl: parsed.downloadUrl,
            docType: parsed.docType,
            mimeTypeHint: parsed.mimeTypeHint,
          };
          updates.linkData = {
            url: parsed.viewUrl,
            embedUrl: parsed.embedUrl,
            provider: 'drive',
          };
        } else if (contentType === 'note') {
          updates.noteData = {
            content: noteContent,
            readingTimeMinutes: Math.ceil(noteContent.split(/\s+/).length / 200),
          };
        } else if (contentType === 'code') {
          updates.codeData = {
            language: codeLanguage,
            customLanguage: customLanguage || undefined,
            code: codeSnippet,
            repoUrl: repoUrl || undefined,
            demoUrl: demoUrl || undefined,
          };
        } else if (contentType === 'social') {
          updates.socialData = {
            platform: socialPlatform,
            url: socialUrl,
            customPlatformName: customPlatformName || undefined,
          };
        } else if (contentType === 'link') {
          updates.linkData = {
            url: externalUrl,
          };
        }

        await contentService.updateContent(editingItem.id, updates);
        toast.success('Updated successfully', `"${title}" has been updated.`);
        onSaved({ ...editingItem, ...updates } as ContentItem);
        onClose();
      } else {
        // Creating new item
        if (contentType === 'file') {
          // Direct Upload -> Cloudinary Free
          if (!selectedFile) {
            toast.error('File required', 'Please select a file to upload.');
            setIsSubmitting(false);
            return;
          }

          const uploadedItem = await contentService.uploadFile(
            selectedFile,
            {
              title,
              description,
              category,
              tags: parsedTags,
              published,
              allowDownload,
            },
            (progressInfo) => {
              setUploadProgress(progressInfo);
            }
          );

          toast.success('File Uploaded', `"${title}" stored via Cloudinary & indexed in Firestore.`);
          onSaved(uploadedItem);
          onClose();
        } else if (contentType === 'drive') {
          // Existing Google Drive File -> Google Drive URL
          if (!driveUrl.trim()) {
            toast.error('Drive URL required', 'Please enter a valid Google Drive file or document link.');
            setIsSubmitting(false);
            return;
          }

          const parsed = parseGoogleDriveUrl(driveUrl.trim());
          if (!parsed.isValid) {
            toast.error('Invalid URL', parsed.error || 'Please enter a valid Google Drive URL.');
            setIsSubmitting(false);
            return;
          }

          const driveItem = await contentService.addGoogleDriveContent({
            title,
            description,
            category,
            tags: parsedTags,
            published,
            allowDownload,
            googleDriveUrl: driveUrl.trim(),
            parsedDrive: parsed,
          });

          toast.success('Google Drive Resource Added', `"${title}" indexed in Firestore database.`);
          onSaved(driveItem);
          onClose();
        } else {
          // Non-file creation (Notes, Code snippets, Links)
          const newItemPayload: any = {
            title,
            description,
            type: contentType,
            category,
            tags: parsedTags,
            published,
            allowDownload,
          };

          if (contentType === 'note') {
            newItemPayload.noteData = {
              content: noteContent,
              readingTimeMinutes: Math.max(1, Math.ceil(noteContent.split(/\s+/).length / 200)),
            };
          } else if (contentType === 'code') {
            newItemPayload.codeData = {
              language: codeLanguage,
              customLanguage: customLanguage || undefined,
              code: codeSnippet,
              repoUrl: repoUrl || undefined,
              demoUrl: demoUrl || undefined,
            };
          } else if (contentType === 'social') {
            newItemPayload.socialData = {
              platform: socialPlatform,
              url: socialUrl,
              customPlatformName: customPlatformName || undefined,
            };
          } else if (contentType === 'link') {
            newItemPayload.linkData = {
              url: externalUrl,
            };
          }

          const savedItem = await contentService.addContent(newItemPayload);
          toast.success('Content Created', `"${title}" has been saved to Firestore.`);
          onSaved(savedItem);
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error('Operation Failed', err.message || 'Could not save content item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="content-editor-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="content-editor-modal"
        className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100 animate-scaleUp my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-zinc-950 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 truncate">
                {editingItem ? 'Edit Content Entry' : 'Add Library Asset'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="truncate">Cloudinary Free (Direct) & Google Drive (External) + Firestore</span>
              </div>
            </div>
          </div>
          <button
            id="editor-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Type Selector Tabs (Both options prominently displayed) */}
        {!editingItem && (
          <div className="px-4 sm:px-6 pt-3 pb-2 bg-zinc-900 border-b border-zinc-800/80 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
            {/* Option 1: Direct File Upload */}
            <button
              type="button"
              onClick={() => setContentType('file')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                contentType === 'file'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-rose-300" />
              <span>1. Upload File (Cloudinary)</span>
            </button>

            {/* Option 2: Add Google Drive File */}
            <button
              type="button"
              onClick={() => setContentType('drive')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                contentType === 'drive'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-950/40'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ExternalLink className="w-4 h-4 text-sky-300" />
              <span>2. Google Drive File</span>
            </button>

            <button
              type="button"
              onClick={() => setContentType('note')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                contentType === 'note'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Note</span>
            </button>

            <button
              type="button"
              onClick={() => setContentType('code')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                contentType === 'code'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Code</span>
            </button>

            <button
              type="button"
              onClick={() => setContentType('social')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                contentType === 'social'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Social Link</span>
            </button>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* OPTION 1: Direct File Upload Dropzone (Cloudinary Free) */}
          {contentType === 'file' && !editingItem && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-300">
                  Select File to Upload via Cloudinary Free
                </label>
                <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Preset: {CLOUDINARY_UPLOAD_PRESET}
                </span>
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                  isDragging
                    ? 'border-rose-500 bg-rose-500/10'
                    : selectedFile
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-zinc-700/80 hover:border-zinc-600 bg-zinc-950/50 hover:bg-zinc-950'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-sm text-zinc-100">{selectedFile.name}</span>
                    <span className="text-xs text-zinc-400 mt-0.5 font-mono">
                      {formatBytes(selectedFile.size)} • Verified Format ({getFileFormatFromFilename(selectedFile.name).toUpperCase()})
                    </span>
                    <span className="text-[11px] text-indigo-400 underline mt-2">Click or drop to replace file</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="p-3 rounded-2xl bg-zinc-800 text-zinc-400 mb-3">
                      <UploadCloud className="w-8 h-8 text-rose-400" />
                    </div>
                    <span className="font-semibold text-sm text-zinc-200">
                      Click to browse or drop file here
                    </span>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                      PDF, DOCX, XLSX, PPTX, TXT, Images (PNG/JPG/SVG), ZIP, Source Code up to 100MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OPTION 2: Google Drive File Input & Preview Box */}
          {contentType === 'drive' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/20 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                  <ExternalLink className="w-4 h-4" />
                  <span>Google Drive File / Document Integration (Optional File Source)</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Paste a link to any file, Google Doc, Google Sheet, Google Slide, or shared folder from Google Drive. Metadata is saved in Firestore, and the resource will be previewable in the public library.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Google Drive or Google Docs URL *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="e.g. https://drive.google.com/file/d/1A2B3C.../view or https://docs.google.com/document/d/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Real-time Parsed Drive Status Card */}
              {parsedDrive && (
                <div className={`p-4 rounded-2xl border ${
                  parsedDrive.isValid ? 'bg-zinc-950/80 border-sky-500/30' : 'bg-rose-950/20 border-rose-500/30'
                }`}>
                  {parsedDrive.isValid ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {parsedDrive.docType === 'document' && <FileText className="w-4 h-4" />}
                            {parsedDrive.docType === 'spreadsheet' && <FileSpreadsheet className="w-4 h-4" />}
                            {parsedDrive.docType === 'presentation' && <Presentation className="w-4 h-4" />}
                            {parsedDrive.docType === 'folder' && <Folder className="w-4 h-4" />}
                            {['file', 'pdf'].includes(parsedDrive.docType) && <ExternalLink className="w-4 h-4" />}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-zinc-100 block">
                              Detected: {getDriveTypeLabel(parsedDrive.docType)}
                            </span>
                            {parsedDrive.fileId && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                ID: {parsedDrive.fileId}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Valid Drive Link
                        </span>
                      </div>

                      {/* Google Drive Permissions notice */}
                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-2 text-[11px] text-zinc-300">
                        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-amber-300">Access Note:</strong> In Google Drive, ensure sharing is set to <strong>"Anyone with the link can view"</strong> so public visitors can preview it directly. Private files will require the viewer to request access via Google.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-rose-300">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{parsedDrive.error || 'Please paste a valid Google Drive or Google Docs URL.'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Replace file input if editing existing file */}
          {editingItem && editingItem.type === 'file' && (
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Replace Current File</span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Current: {editingItem.fileData?.originalFilename} ({formatBytes(editingItem.fileData?.fileSize || 0)})
                </span>
              </div>
              <input
                ref={replaceFileInputRef}
                type="file"
                onChange={handleReplacementFileChange}
                className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
              />
            </div>
          )}

          {/* Progress Bar for Uploads */}
          {uploadProgress && (
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-indigo-300">Uploading to Cloudinary Free...</span>
                <span className="text-indigo-400 font-bold">{uploadProgress.progress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Common Fields: Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descriptive title..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Common Fields: Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary or description..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Type-Specific Editors */}
          {contentType === 'note' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Note Content (Markdown supported) *
              </label>
              <textarea
                rows={8}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your markdown or text note here..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          {contentType === 'code' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Language
                  </label>
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value as CodeLanguage)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono focus:outline-none"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="sql">SQL</option>
                    <option value="json">JSON</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                    <option value="java">Java</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Custom Language Label
                  </label>
                  <input
                    type="text"
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    placeholder="e.g. Rust, Go, Swift"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Source Code Snippet *
                </label>
                <textarea
                  rows={8}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="// Paste your code snippet here..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-300 placeholder-zinc-600 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    GitHub / Repo URL
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {contentType === 'social' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Social Platform
                  </label>
                  <select
                    value={socialPlatform}
                    onChange={(e) => setSocialPlatform(e.target.value as SocialPlatform)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none"
                  >
                    <option value="github">GitHub</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="telegram">Telegram</option>
                    <option value="website">Personal Website</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Profile / Resource URL *
                  </label>
                  <input
                    type="url"
                    value={socialUrl}
                    onChange={(e) => setSocialUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {contentType === 'link' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Destination URL *
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://example.com/..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs font-mono"
              />
            </div>
          )}

          {/* Category & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs capitalize focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. guide, architecture, 2026"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs"
              />
            </div>
          </div>

          {/* Toggles: Published & Allow Download */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">Published to Public</span>
                <span className="text-[11px] text-zinc-400">Visible to public library visitors</span>
              </div>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">Allow Direct Download</span>
                <span className="text-[11px] text-zinc-400">Visitors can download original asset</span>
              </div>
              <input
                type="checkbox"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-950/40 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Firestore...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingItem ? 'Save Updates' : 'Save to Firestore'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
