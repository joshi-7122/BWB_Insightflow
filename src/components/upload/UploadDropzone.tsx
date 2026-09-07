import React, { useState, useRef } from 'react';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES, MAX_FILES_PER_ANALYSIS } from '@/lib/constants';
import { Upload, FileSpreadsheet, FileImage, FileText, X, AlertCircle, CheckCircle2, File as FileIcon, Clipboard, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface SelectedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  error?: string;
}

interface UploadDropzoneProps {
  files: SelectedFile[];
  onFilesChange: (files: SelectedFile[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  files,
  onFilesChange,
  onAnalyze,
  isAnalyzing,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processIncomingFiles = (incomingFiles: FileList | File[]) => {
    const fileArray = Array.from(incomingFiles);
    const newSelectedFiles: SelectedFile[] = [];

    for (const file of fileArray) {
      if (files.length + newSelectedFiles.length >= MAX_FILES_PER_ANALYSIS) {
        break;
      }

      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      let error: string | undefined;

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        error = `Unsupported format "${ext}". Supported: ${ALLOWED_EXTENSIONS.join(', ')}`;
      } else if (file.size > MAX_FILE_SIZE_BYTES) {
        error = `File exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
      } else if (file.size === 0) {
        error = 'File is empty (0 bytes).';
      }

      let previewUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }

      newSelectedFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type || ext,
        previewUrl,
        error,
      });
    }

    onFilesChange([...files, ...newSelectedFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return <FileText className="w-5 h-5 text-sky-400" />;
    if (['xlsx', 'xls'].includes(ext || '')) return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) return <FileImage className="w-5 h-5 text-amber-400" />;
    return <FileIcon className="w-5 h-5 text-slate-400" />;
  };

  const hasValidFiles = files.length > 0 && files.some((f) => !f.error);

  return (
    <div className="space-y-6">
      {/* Stitch Luminous Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/5 hover:bg-indigo-500/10'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processIncomingFiles(e.target.files);
          }}
        />

        <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform">
          <Upload className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight">
          Upload Data for Analysis
        </h3>
        <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Drag and drop CSVs, Excel files, PDFs, or dashboard screenshots to start automated analysis.
        </p>

        {/* Stitch Quick Actions Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </Button>

          <span className="text-xs text-slate-500 font-mono">or</span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.readText().then((clipText) => {
                  if (clipText.trim()) {
                    const blob = new Blob([clipText], { type: 'text/csv' });
                    const file = new File([blob], 'pasted_dataset.csv', { type: 'text/csv' });
                    processIncomingFiles([file]);
                  }
                }).catch(() => {});
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-900/80 text-xs font-medium text-slate-300 hover:text-white hover:border-indigo-500/50 transition-colors inline-flex items-center gap-1.5"
              title="Paste CSV text from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
              <span>Paste Text</span>
            </button>

            <button
              type="button"
              onClick={() => {
                alert('Database connectors (PostgreSQL, Supabase) active via backend configuration.');
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-900/80 text-xs font-medium text-slate-300 hover:text-white hover:border-indigo-500/50 transition-colors inline-flex items-center gap-1.5"
              title="Connect Database"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Connect DB</span>
            </button>
          </div>
        </div>

        {/* Format pills with Space Grotesk font-mono-label */}
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
          {['CSV', 'XLSX', 'PNG', 'JPG', 'WebP'].map((format) => (
            <span
              key={format}
              className="px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 font-mono-label text-[11px]"
            >
              .{format.toLowerCase()}
            </span>
          ))}
          <span className="px-2.5 py-0.5 text-slate-500 font-mono-label text-[11px]">Max {MAX_FILE_SIZE_MB}MB</span>
        </div>
      </div>

      {/* Selected File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
            <span>Selected Files ({files.length}/{MAX_FILES_PER_ANALYSIS})</span>
            {files.length > 1 && (
              <button
                type="button"
                onClick={() => onFilesChange([])}
                className="text-slate-500 hover:text-rose-400 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3.5 rounded-xl glass-card relative group ${
                  item.error ? 'border-rose-500/40 bg-rose-500/5' : ''
                }`}
              >
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                    {getFileIcon(item.name)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate font-mono-label">{item.name}</p>
                  <p className="text-xs text-slate-400 font-mono-label">
                    {(item.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {item.error && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      <span>{item.error}</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(item.id);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar */}
      {files.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            size="lg"
            variant="primary"
            onClick={onAnalyze}
            disabled={!hasValidFiles || isAnalyzing}
            isLoading={isAnalyzing}
            rightIcon={<CheckCircle2 className="w-5 h-5" />}
          >
            Analyze Data with AI
          </Button>
        </div>
      )}
    </div>
  );
};
