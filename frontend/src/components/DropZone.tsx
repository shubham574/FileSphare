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
      .reduce((acc, item) => {
        const trimmed = item.trim();
        if (trimmed.includes('/')) {
          // It's already a MIME type or wildcard (e.g., video/*)
          acc[trimmed] = [];
        } else {
          const mime = extToMime(trimmed);
          if (mime) {
            if (!acc[mime]) acc[mime] = [];
            acc[mime].push(trimmed);
          }
        }
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
    <div className="space-y-8">
      {/* Upload Area */}
      <div className="relative group" {...getRootProps()}>
        <input {...getInputProps()} />
        <div className={`absolute -inset-1 bg-gradient-to-r from-primary to-secondary-container rounded-[2rem] blur transition duration-1000 md:group-hover:duration-200 ${isDragActive ? 'opacity-40' : 'opacity-20 md:group-hover:opacity-30'}`}></div>
        
        <div className={`relative flex flex-col items-center justify-center p-12 md:p-20 bg-surface-container-lowest border-2 border-dashed rounded-[2rem] cursor-pointer transition-colors ${isDragActive ? 'border-primary' : 'border-outline-variant hover:border-primary'}`}>
          <div className={`w-20 h-20 flex items-center justify-center rounded-full mb-6 transition-colors ${isDragActive ? 'bg-primary text-on-primary' : 'bg-primary-fixed text-primary'}`}>
            <span className="material-symbols-outlined text-4xl">upload_file</span>
          </div>
          
          <button type="button" className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-bold text-lg mb-4 hover:shadow-xl transition-all active:scale-95 pointer-events-none">
            {isDragActive ? 'Drop files now' : 'Select Files'}
          </button>
          
          <p className="text-on-surface-variant text-sm font-medium">or drag and drop files here</p>
          
          <div className="mt-8 flex gap-4 text-xs font-label uppercase tracking-widest text-outline flex-wrap justify-center">
            <span>Max 50MB</span>
            <span className="w-1 h-1 bg-outline-variant rounded-full self-center"></span>
            <span>Secure SSL</span>
            <span className="w-1 h-1 bg-outline-variant rounded-full self-center"></span>
            <span>Auto-delete in 1h</span>
          </div>
        </div>
      </div>

      {/* Selected Files List (Queue) */}
      {selectedFiles.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Queue ({selectedFiles.length} file{selectedFiles.length !== 1 && 's'})</h2>
              <p className="text-on-surface-variant text-sm">Review your selected files.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="bg-surface-container-high p-4 rounded-xl flex flex-col gap-3 group relative hover:shadow-md transition-shadow animate-fade-in">
                <div className="aspect-[3/4] bg-surface-container-lowest rounded-lg border border-outline-variant/20 overflow-hidden flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                  <span className="material-symbols-outlined text-6xl text-primary/40 relative z-10">
                    {file.name.endsWith('.pdf') ? 'picture_as_pdf' : 'image'}
                  </span>
                  
                  <div className="absolute top-2 right-2 flex gap-1 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-error shadow-sm hover:bg-error hover:text-white transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-on-surface truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs text-on-surface-variant">{formatSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
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
    '.avif': 'image/avif',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}
