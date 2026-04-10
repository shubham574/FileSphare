'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropZoneProps {
  acceptedFiles: string;
  multiple: boolean;
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
}

export default function DropZone({
  acceptedFiles,
  multiple,
  onFilesSelected,
  selectedFiles,
}: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (dropped: File[]) => {
      setDragActive(false);
      if (multiple) {
        onFilesSelected([...selectedFiles, ...dropped]);
      } else {
        onFilesSelected(dropped.slice(0, 1));
      }
    },
    [multiple, selectedFiles, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: acceptedFiles
      .split(',')
      .reduce((acc, ext) => {
        const mime = extToMime(ext.trim());
        if (mime) acc[mime] = [ext.trim()];
        return acc;
      }, {} as Record<string, string[]>),
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeFile = (index: number) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    onFilesSelected(updated);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive || dragActive
            ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
            : 'border-white/20 hover:border-violet-400/60 hover:bg-white/5'
          }
        `}
      >
        <input {...getInputProps()} />

        {/* Animated background dots */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          {isDragActive && (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 animate-pulse" />
          )}
        </div>

        <div className="relative space-y-4">
          {/* Upload icon */}
          <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragActive ? 'bg-violet-500/30 scale-110' : 'bg-white/10'}`}>
            <svg
              className={`w-8 h-8 transition-colors ${isDragActive ? 'text-violet-400' : 'text-slate-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {isDragActive ? (
            <p className="text-violet-300 font-semibold text-lg animate-bounce-gentle">
              Drop your {multiple ? 'files' : 'file'} here!
            </p>
          ) : (
            <>
              <div>
                <p className="text-white font-semibold text-lg">
                  Drop {multiple ? 'files' : 'a file'} here, or{' '}
                  <span className="text-violet-400 hover:text-violet-300 underline underline-offset-4 decoration-dotted">
                    browse
                  </span>
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Accepted: {acceptedFiles} · Max 100MB{multiple ? ' per file' : ''}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          <p className="text-slate-400 text-sm font-medium">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
          </p>
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            >
              {/* File icon */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">
                  {file.name.endsWith('.pdf')
                    ? '📄'
                    : file.name.endsWith('.docx')
                    ? '📝'
                    : '🖼️'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                <p className="text-slate-500 text-xs">{formatSize(file.size)}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-slate-500 hover:text-red-400 transition-colors p-1 hover:bg-red-500/10 rounded-lg"
                aria-label={`Remove ${file.name}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function extToMime(ext: string): string {
  const map: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  return map[ext] || 'application/octet-stream';
}
