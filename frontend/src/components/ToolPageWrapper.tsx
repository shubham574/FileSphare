'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Tool } from '@/lib/tools';
import DropZone from '@/components/DropZone';
import ProgressBar from '@/components/ProgressBar';
import { submitJob, waitForJob, getProxyDownloadUrl, StatusResponse } from '@/lib/api';

interface ToolPageWrapperProps {
  tool: Tool;
}

type ProcessStatus = 'idle' | 'uploading' | 'pending' | 'processing' | 'completed' | 'failed';

export default function ToolPageWrapper({ tool }: ToolPageWrapperProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [totalProgress, setTotalProgress] = useState(0);
  const [completedJob, setCompletedJob] = useState<{ jobId: string; fileName: string; meta?: any } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<Record<string, string | number>>(() => {
    const defaults: Record<string, string | number> = {};
    tool.options?.forEach((opt) => {
      defaults[opt.key] = opt.defaultValue;
    });
    return defaults;
  });

  const handleProcess = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file.');
      return;
    }

    setError(null);
    setCompletedJob(null);
    setStatus('uploading');

    const formData = new FormData();
    if (tool.multiple) {
      selectedFiles.forEach((file) => formData.append('files', file));
    } else {
      formData.append('file', selectedFiles[0]);
    }
    Object.entries(options).forEach(([key, val]) => formData.append(key, String(val)));

    try {
      const job = await submitJob(tool.endpoint, formData, (progress) => {
        setTotalProgress(Math.round(progress * 0.5)); // Upload is first 50%
      });
      setStatus('pending');
      setTotalProgress(50); // Upload complete

      const result = await waitForJob(
        job.jobId,
        (s: StatusResponse) => {
          if (s.status === 'processing') {
            setStatus('processing');
            if (s.progress !== undefined) {
              setTotalProgress(50 + Math.round(s.progress * 0.5)); // Processing is second 50%
            }
          } else if (s.status === 'pending') {
            setStatus('pending');
          }
        }
      );

      // We expect the backend might send 'metadata' inside the response if we implemented it, 
      // but if not we just use empty object. Note: we need to cast or just store any.
      const resultAny = result as any;

      setCompletedJob({
        jobId: result.jobId,
        fileName: result.fileName || `${tool.id}.pdf`,
        meta: resultAny.metadata || null
      });
      setStatus('completed');
    } catch (err: any) {
      setStatus('failed');
      setError(err.message || 'Something went wrong. Please try again.');
    }
  }, [selectedFiles, tool, options]);

  const handleReset = () => {
    setSelectedFiles([]);
    setStatus('idle');
    setTotalProgress(0);
    setCompletedJob(null);
    setError(null);
  };

  const isProcessing = ['uploading', 'pending', 'processing'].includes(status);

  return (
    <main className="pt-24 pb-20 min-h-screen">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-secondary-container/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mb-12">
        {/* Tool Header */}
        <div className="text-center mb-10 relative">
          <Link
            href="/"
            className="absolute left-0 top-1.5 hidden md:inline-flex items-center gap-2 text-outline hover:text-primary transition-colors text-sm font-semibold tracking-wider group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            ALL TOOLS
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4">{tool.name}</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">{tool.description}</p>
        </div>

        {/* Drop Zone Area — hide once processing/completed */}
        {(status === 'idle' || status === 'failed') && (
          <DropZone
            acceptedFiles={tool.acceptedFiles}
            multiple={tool.multiple}
            onFilesSelected={setSelectedFiles}
            selectedFiles={selectedFiles}
          />
        )}

        {/* Tool Options */}
        {tool.options && tool.options.length > 0 && (status === 'idle' || status === 'failed') && (
          <section className="mt-12 bg-surface-container-high p-8 rounded-3xl animate-fade-in border border-outline-variant/20">
            <h3 className="text-on-surface font-bold text-lg mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">settings</span>
              Tool Options
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tool.options.map((opt) => (
                <div key={opt.key} className="space-y-3">
                  <label
                    htmlFor={`opt-${opt.key}`}
                    className="block text-on-surface text-sm font-medium"
                  >
                    {opt.label}
                    {opt.type === 'range' && (
                      <span className="ml-2 text-primary font-bold">
                        {typeof options[opt.key] === 'number'
                          ? (options[opt.key] as number).toFixed(2)
                          : options[opt.key]}
                      </span>
                    )}
                  </label>

                  {opt.type === 'select' ? (
                    <select
                      id={`opt-${opt.key}`}
                      value={String(options[opt.key])}
                      onChange={(e) =>
                        setOptions((prev) => ({ ...prev, [opt.key]: e.target.value }))
                      }
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    >
                      {opt.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : opt.type === 'range' ? (
                    <input
                      id={`opt-${opt.key}`}
                      type="range"
                      min={opt.min ?? 0}
                      max={opt.max ?? 1}
                      step={0.05}
                      value={Number(options[opt.key])}
                      onChange={(e) =>
                        setOptions((prev) => ({ ...prev, [opt.key]: parseFloat(e.target.value) }))
                      }
                      className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  ) : (
                    <input
                      id={`opt-${opt.key}`}
                      type={opt.type}
                      value={String(options[opt.key])}
                      min={opt.min}
                      max={opt.max}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          [opt.key]: opt.type === 'number' ? Number(e.target.value) : e.target.value,
                        }))
                      }
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Process Section */}
        {status !== 'idle' && status !== 'completed' && (
          <section className="mt-12 max-w-xl mx-auto flex flex-col items-center gap-6">
            <ProgressBar status={status} progress={totalProgress} toolName={tool.name} />
            
            {status === 'failed' && (
               <div className="bg-error-container border border-error/30 rounded-xl p-4 animate-fade-in w-full text-center">
                 <p className="text-on-error-container text-sm font-medium">{error}</p>
                 <button onClick={handleReset} className="mt-4 text-error font-bold hover:underline">Try Again</button>
               </div>
            )}
          </section>
        )}

        {/* Final Trigger Button (only visible when idle or failed and files selected) */}
        {(status === 'idle' || status === 'failed') && selectedFiles.length > 0 && (
           <section className="mt-12 max-w-xl mx-auto text-center animate-fade-in">
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full bg-secondary-container text-on-secondary-container py-5 rounded-xl font-bold text-xl hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                  <span className="material-symbols-outlined">{tool.icon.length > 2 ? tool.icon : 'bolt'}</span>
                  {tool.name}
              </button>
           </section>
        )}
      </div>

      {/* Results Section (Success State) */}
      {status === 'completed' && completedJob && (
        <section className="max-w-4xl mx-auto px-6 mt-12 animate-fade-in">
          <div className="glass-panel p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 border border-white">
            <div className="w-24 h-24 bg-tertiary-fixed-dim rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined-fill text-tertiary text-5xl">verified</span>
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-2xl font-bold text-on-surface mb-1">Your file is ready!</h3>
              <p className="text-on-surface-variant flex flex-col sm:flex-row gap-x-3 gap-y-1 items-center md:items-start font-medium">
                <span className="truncate max-w-[200px] sm:max-w-xs">{completedJob.fileName}</span>
                {completedJob.meta?.outputSize && (
                  <span className="text-tertiary bg-tertiary-fixed text-xs px-2 py-0.5 rounded-full">
                    {Math.round(completedJob.meta.outputSize / 1024)} KB
                    {completedJob.meta.reductionPercent > 0 && ` (-${completedJob.meta.reductionPercent}%)`}
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button
                onClick={handleReset}
                className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-xl font-semibold hover:bg-surface-dim transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-lg">refresh</span> Start Over
              </button>
              <a
                href={getProxyDownloadUrl(completedJob.jobId)}
                download={completedJob.fileName}
                className="bg-primary text-on-primary px-10 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span className="material-symbols-outlined">download</span> Download
              </a>
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
