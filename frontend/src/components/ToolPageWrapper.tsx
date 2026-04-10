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
  const [completedJob, setCompletedJob] = useState<{ jobId: string; fileName: string } | null>(null);
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
      const job = await submitJob(tool.endpoint, formData);
      setStatus('pending');

      const result = await waitForJob(
        job.jobId,
        (s: StatusResponse) => {
          if (s.status === 'processing') setStatus('processing');
          else if (s.status === 'pending') setStatus('pending');
        }
      );

      setCompletedJob({
        jobId: result.jobId,
        fileName: result.fileName || `${tool.id}.pdf`,
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
    setCompletedJob(null);
    setError(null);
  };

  const isProcessing = ['uploading', 'pending', 'processing'].includes(status);

  return (
    <div className="min-h-screen px-4 py-12">
      {/* Background orbs */}
      <div className="fixed top-32 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-32 right-1/4 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Tools
        </Link>

        {/* Tool Header */}
        <div className="mb-10">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.gradient} text-3xl shadow-xl mb-4`}>
            {tool.icon}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{tool.name}</h1>
          <p className="text-slate-400 leading-relaxed">{tool.description}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8 backdrop-blur-sm">

          {/* Drop Zone — hide once processing/completed */}
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
            <div className="space-y-5 border-t border-white/10 pt-6">
              <h3 className="text-white font-semibold text-sm uppercase tracking-widest">Options</h3>
              {tool.options.map((opt) => (
                <div key={opt.key} className="space-y-2">
                  <label
                    htmlFor={`opt-${opt.key}`}
                    className="block text-slate-300 text-sm font-medium"
                  >
                    {opt.label}
                    {opt.type === 'range' && (
                      <span className="ml-2 text-violet-400">
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
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/60 transition-all"
                    >
                      {opt.options?.map((o) => (
                        <option key={o.value} value={o.value} className="bg-[#1a1f2e]">
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
                      className="w-full accent-violet-500"
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
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-slate-600"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Progress */}
          {status !== 'idle' && (
            <ProgressBar status={status} />
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-fade-in">
              <p className="text-red-400 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'completed' && completedJob ? (
              <>
                {/*
                  Download link uses the Next.js API proxy (/api/download/:jobId) which
                  is same-origin — the `download` attribute works perfectly with proper filename.
                */}
                <a
                  href={getProxyDownloadUrl(completedJob.jobId)}
                  download={completedJob.fileName}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r ${tool.gradient} text-white font-semibold text-lg shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download {completedJob.fileName}
                </a>

                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 font-medium transition-all"
                >
                  Process Another File
                </button>
              </>
            ) : (
              <button
                onClick={handleProcess}
                disabled={isProcessing || selectedFiles.length === 0}
                className={`
                  w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all
                  ${isProcessing || selectedFiles.length === 0
                    ? 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                    : `bg-gradient-to-r ${tool.gradient} text-white shadow-lg hover:opacity-90 active:scale-[0.98] hover:shadow-xl`
                  }
                `}
              >
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>{tool.icon}</span>
                    {tool.name}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-600 text-sm">
          <svg className="w-4 h-4 text-green-500/60" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Your files are automatically deleted after 1 hour
        </div>
      </div>
    </div>
  );
}
