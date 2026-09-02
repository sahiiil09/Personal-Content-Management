import { CloudinaryUploadResponse, FileFormat, UploadProgressInfo } from '../types';

export const CLOUDINARY_CLOUD_NAME = 'y8qpum1q';
export const CLOUDINARY_UPLOAD_PRESET = 'my-app-uploads';
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

// 100MB maximum file size for Cloudinary Free unsigned tier
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

export const SUPPORTED_FILE_EXTENSIONS: Record<string, FileFormat> = {
  pdf: 'pdf',
  doc: 'doc',
  docx: 'docx',
  txt: 'txt',
  png: 'png',
  jpg: 'jpg',
  jpeg: 'jpeg',
  webp: 'webp',
  svg: 'svg',
  zip: 'zip',
  html: 'html',
  htm: 'html',
  css: 'css',
  js: 'js',
  javascript: 'js',
  json: 'json',
  csv: 'csv',
  ppt: 'ppt',
  pptx: 'pptx',
  xls: 'xls',
  xlsx: 'xlsx',
};

export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts.pop()?.toLowerCase() || '';
};

export const validateFileTypeAndSize = (file: File): { isValid: boolean; error?: string; format: FileFormat } => {
  const ext = getFileExtension(file.name);
  const format = SUPPORTED_FILE_EXTENSIONS[ext];

  if (!format) {
    const supportedList = Object.keys(SUPPORTED_FILE_EXTENSIONS)
      .map((e) => e.toUpperCase())
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(', ');
    return {
      isValid: false,
      error: `Unsupported file format ".${ext || 'unknown'}". Supported formats: ${supportedList}`,
      format: 'other',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size (${sizeInMB} MB) exceeds the 100MB maximum upload limit.`,
      format,
    };
  }

  return {
    isValid: true,
    format,
  };
};

export const uploadToCloudinary = (
  file: File,
  onProgress?: (progress: UploadProgressInfo) => void
): Promise<CloudinaryUploadResponse> => {
  return new Promise((resolve, reject) => {
    // 1. Validation check
    const validation = validateFileTypeAndSize(file);
    if (!validation.isValid) {
      const err = new Error(validation.error || 'Invalid file');
      onProgress?.({
        progress: 0,
        fileName: file.name,
        bytesTransferred: 0,
        totalBytes: file.size,
        status: 'error',
        errorMessage: err.message,
      });
      return reject(err);
    }

    // 2. Prepare FormData for unsigned Cloudinary upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress?.({
          progress: percent,
          fileName: file.name,
          bytesTransferred: event.loaded,
          totalBytes: event.total,
          status: 'uploading',
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
          onProgress?.({
            progress: 100,
            fileName: file.name,
            bytesTransferred: file.size,
            totalBytes: file.size,
            status: 'completed',
          });
          resolve(response);
        } catch (e: any) {
          const parseErr = new Error(`Failed to parse Cloudinary response: ${e.message}`);
          onProgress?.({
            progress: 0,
            fileName: file.name,
            bytesTransferred: 0,
            totalBytes: file.size,
            status: 'error',
            errorMessage: parseErr.message,
          });
          reject(parseErr);
        }
      } else {
        let errorMsg = `Cloudinary Upload Failed (HTTP ${xhr.status})`;
        try {
          const errData = JSON.parse(xhr.responseText);
          if (errData.error?.message) {
            errorMsg = `Cloudinary Error: ${errData.error.message}`;
          }
        } catch (_) {}
        const error = new Error(errorMsg);
        onProgress?.({
          progress: 0,
          fileName: file.name,
          bytesTransferred: 0,
          totalBytes: file.size,
          status: 'error',
          errorMessage: error.message,
        });
        reject(error);
      }
    };

    xhr.onerror = () => {
      const error = new Error('Network error during upload to Cloudinary. Please check your internet connection.');
      onProgress?.({
        progress: 0,
        fileName: file.name,
        bytesTransferred: 0,
        totalBytes: file.size,
        status: 'error',
        errorMessage: error.message,
      });
      reject(error);
    };

    xhr.send(formData);
  });
};
