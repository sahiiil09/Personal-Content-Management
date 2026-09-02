/**
 * Google Drive Integration Service
 * Helper methods for parsing, validating, embedding, and managing Google Drive resources.
 * 
 * Note: Storage Architecture:
 * - Direct Uploads: Cloudinary Free (Zero Blaze Required)
 * - Externally Hosted Files: Google Drive URLs (Optional file source)
 * - Metadata & Database: Firebase Firestore
 * - Authentication: Firebase Auth
 */

export interface ParsedGoogleDriveResource {
  isValid: boolean;
  fileId?: string;
  originalUrl: string;
  embedUrl?: string;
  viewUrl: string;
  downloadUrl?: string;
  docType: 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'folder' | 'file';
  mimeTypeHint?: string;
  error?: string;
}

/**
 * Extracts Google Drive ID and metadata from various Google Drive / Google Docs URL formats.
 */
export function parseGoogleDriveUrl(rawUrl: string): ParsedGoogleDriveResource {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      originalUrl: '',
      viewUrl: '',
      docType: 'file',
      error: 'Please enter a valid Google Drive URL.',
    };
  }

  const url = rawUrl.trim();

  // Pattern 1: Google Docs Document
  // https://docs.google.com/document/d/DOC_ID/edit
  const docMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/i);
  if (docMatch && docMatch[1]) {
    const fileId = docMatch[1];
    return {
      isValid: true,
      fileId,
      originalUrl: url,
      embedUrl: `https://docs.google.com/document/d/${fileId}/preview`,
      viewUrl: `https://docs.google.com/document/d/${fileId}/view`,
      downloadUrl: `https://docs.google.com/document/d/${fileId}/export?format=pdf`,
      docType: 'document',
      mimeTypeHint: 'application/vnd.google-apps.document',
    };
  }

  // Pattern 2: Google Sheets Spreadsheet
  // https://docs.google.com/spreadsheets/d/SHEET_ID/edit
  const sheetMatch = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/i);
  if (sheetMatch && sheetMatch[1]) {
    const fileId = sheetMatch[1];
    return {
      isValid: true,
      fileId,
      originalUrl: url,
      embedUrl: `https://docs.google.com/spreadsheets/d/${fileId}/preview`,
      viewUrl: `https://docs.google.com/spreadsheets/d/${fileId}/view`,
      downloadUrl: `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`,
      docType: 'spreadsheet',
      mimeTypeHint: 'application/vnd.google-apps.spreadsheet',
    };
  }

  // Pattern 3: Google Slides Presentation
  // https://docs.google.com/presentation/d/PRESENTATION_ID/edit
  const presentationMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/i);
  if (presentationMatch && presentationMatch[1]) {
    const fileId = presentationMatch[1];
    return {
      isValid: true,
      fileId,
      originalUrl: url,
      embedUrl: `https://docs.google.com/presentation/d/${fileId}/preview`,
      viewUrl: `https://docs.google.com/presentation/d/${fileId}/view`,
      downloadUrl: `https://docs.google.com/presentation/d/${fileId}/export/pdf`,
      docType: 'presentation',
      mimeTypeHint: 'application/vnd.google-apps.presentation',
    };
  }

  // Pattern 4: Google Drive Folder
  // https://drive.google.com/drive/folders/FOLDER_ID
  const folderMatch = url.match(/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/i);
  if (folderMatch && folderMatch[1]) {
    const folderId = folderMatch[1];
    return {
      isValid: true,
      fileId: folderId,
      originalUrl: url,
      embedUrl: `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`,
      viewUrl: `https://drive.google.com/drive/folders/${folderId}`,
      docType: 'folder',
      mimeTypeHint: 'application/vnd.google-apps.folder',
    };
  }

  // Pattern 5: Standard Google Drive File
  // https://drive.google.com/file/d/FILE_ID/view
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/uc?id=FILE_ID
  let fileId = '';
  const standardFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (standardFileMatch && standardFileMatch[1]) {
    fileId = standardFileMatch[1];
  } else {
    const paramMatch = url.match(/drive\.google\.com\/(?:open|uc)\?id=([a-zA-Z0-9_-]+)/i);
    if (paramMatch && paramMatch[1]) {
      fileId = paramMatch[1];
    }
  }

  if (fileId) {
    // Check if the URL indicates PDF or other hints
    const isPdf = url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('pdf');
    return {
      isValid: true,
      fileId,
      originalUrl: url,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      viewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      docType: isPdf ? 'pdf' : 'file',
    };
  }

  // If it's a generic google.com or docs.google.com link
  if (url.includes('google.com')) {
    return {
      isValid: true,
      originalUrl: url,
      viewUrl: url,
      docType: 'file',
    };
  }

  return {
    isValid: false,
    originalUrl: url,
    viewUrl: url,
    docType: 'file',
    error: 'Unrecognized Google Drive URL. Please paste a link from Google Drive or Google Docs.',
  };
}

/**
 * Returns a human-friendly label for the Google Drive resource type.
 */
export function getDriveTypeLabel(docType: ParsedGoogleDriveResource['docType']): string {
  switch (docType) {
    case 'document':
      return 'Google Doc';
    case 'spreadsheet':
      return 'Google Sheet';
    case 'presentation':
      return 'Google Slides';
    case 'pdf':
      return 'Google Drive PDF';
    case 'folder':
      return 'Google Drive Folder';
    case 'file':
    default:
      return 'Google Drive File';
  }
}
