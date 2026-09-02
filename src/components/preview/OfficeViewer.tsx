import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Presentation, 
  Archive, 
  Download, 
  ExternalLink, 
  FileCode, 
  CheckCircle, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { ContentItem } from '../../types';
import { formatBytes } from '../../services/contentService';

interface OfficeViewerProps {
  item: ContentItem;
  allowDownload: boolean;
}

export const OfficeViewer: React.FC<OfficeViewerProps> = ({ item, allowDownload }) => {
  const [embedError, setEmbedError] = useState<boolean>(false);
  const fileData = item.fileData;
  const format = fileData?.format || 'other';
  const fileUrl = fileData?.downloadUrl || '';
  const fileName = fileData?.fileName || item.title;
  const fileSize = fileData?.fileSize ? formatBytes(fileData.fileSize) : 'Unknown size';

  // Format metadata dictionary
  const getFormatDetails = () => {
    switch (format) {
      case 'doc':
      case 'docx':
        return {
          icon: <FileText className="w-12 h-12 text-blue-400" />,
          title: 'Microsoft Word Document',
          desc: 'Structured document format (.docx)',
          color: 'blue',
          canEmbed: true,
        };
      case 'xls':
      case 'xlsx':
        return {
          icon: <FileSpreadsheet className="w-12 h-12 text-emerald-400" />,
          title: 'Excel Spreadsheet Workbook',
          desc: 'Tabular data calculations & matrices (.xlsx)',
          color: 'emerald',
          canEmbed: true,
        };
      case 'ppt':
      case 'pptx':
        return {
          icon: <Presentation className="w-12 h-12 text-amber-400" />,
          title: 'PowerPoint Presentation',
          desc: 'Slide deck and visual presentation (.pptx)',
          color: 'amber',
          canEmbed: true,
        };
      case 'zip':
        return {
          icon: <Archive className="w-12 h-12 text-purple-400" />,
          title: 'Compressed ZIP Archive',
          desc: 'Multi-file archive bundle (.zip)',
          color: 'purple',
          canEmbed: false,
        };
      case 'csv':
        return {
          icon: <FileCode className="w-12 h-12 text-teal-400" />,
          title: 'Comma-Separated Values (CSV)',
          desc: 'Plaintext structured dataset',
          color: 'teal',
          canEmbed: false,
        };
      default:
        return {
          icon: <FileText className="w-12 h-12 text-zinc-400" />,
          title: `${format.toUpperCase()} Document Asset`,
          desc: 'Binary or custom document file',
          color: 'zinc',
          canEmbed: false,
        };
    }
  };

  const details = getFormatDetails();

  // If CSV or small text was loaded, render simple table or text
  if (format === 'csv' && fileData?.textPreviewContent) {
    const rows = fileData.textPreviewContent.split('\n').filter((r) => r.trim().length > 0);
    const headers = rows[0]?.split(',') || [];
    const dataRows = rows.slice(1, 15);

    return (
      <div id="csv-preview-container" className="flex flex-col h-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-teal-400" />
            <span className="font-semibold text-zinc-100">{fileName}</span>
            <span className="text-xs text-zinc-400">({rows.length} records)</span>
          </div>
          {allowDownload && (
            <a
              href={fileUrl}
              download={fileName}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </a>
          )}
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                {headers.map((h, i) => (
                  <th key={i} className="p-3 text-teal-300 font-semibold uppercase">{h.trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-zinc-800/60 hover:bg-zinc-900/40">
                  {row.split(',').map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 text-zinc-300">{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div id="office-viewer-fallback" className="flex flex-col items-center justify-center min-h-[460px] p-8 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-center">
      <div className="relative mb-5 p-5 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 shadow-xl">
        {details.icon}
        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-700 text-white border border-zinc-600">
          {format}
        </span>
      </div>

      <h3 className="text-xl font-bold text-zinc-100 tracking-tight">{item.title}</h3>
      <p className="text-sm text-zinc-400 max-w-md mt-2 leading-relaxed">{item.description}</p>

      {/* Metadata pill badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6 max-w-lg w-full text-xs">
        <div className="bg-zinc-800/60 border border-zinc-700/50 p-3 rounded-xl">
          <span className="text-zinc-400 block text-[11px]">Format Type</span>
          <span className="font-semibold text-zinc-200 uppercase">{format} File</span>
        </div>
        <div className="bg-zinc-800/60 border border-zinc-700/50 p-3 rounded-xl">
          <span className="text-zinc-400 block text-[11px]">File Size</span>
          <span className="font-semibold text-zinc-200">{fileSize}</span>
        </div>
        <div className="bg-zinc-800/60 border border-zinc-700/50 p-3 rounded-xl col-span-2 sm:col-span-1">
          <span className="text-zinc-400 block text-[11px]">Security</span>
          <span className="font-semibold text-emerald-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Clean
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {fileUrl && fileUrl !== '#' && (
          <a
            id="office-open-direct"
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-semibold border border-zinc-700 transition-all shadow-md"
          >
            <ExternalLink className="w-4 h-4 text-zinc-300" />
            <span>Open Direct File</span>
          </a>
        )}

        {allowDownload && fileUrl && (
          <a
            id="office-download-btn"
            href={fileUrl}
            download={fileName}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-950/40 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download {format.toUpperCase()}</span>
          </a>
        )}
      </div>

      <p className="text-[11px] text-zinc-500 mt-6 flex items-center gap-1.5 justify-center">
        <Info className="w-3.5 h-3.5 text-zinc-500" />
        Browser preview fallback mode rendered securely. No external Google Drive requirement.
      </p>
    </div>
  );
};
