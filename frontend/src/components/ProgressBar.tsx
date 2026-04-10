'use client';

interface ProgressBarProps {
  status: 'idle' | 'uploading' | 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
}

const statusConfig = {
  idle: { label: '', color: '', show: false },
  uploading: { label: 'Uploading files...', color: 'from-blue-500 to-cyan-500', show: true },
  pending: { label: 'Queued, waiting to process...', color: 'from-yellow-500 to-amber-500', show: true },
  processing: { label: 'Processing your PDF...', color: 'from-violet-500 to-indigo-500', show: true },
  completed: { label: 'Done! Your file is ready.', color: 'from-green-500 to-emerald-500', show: true },
  failed: { label: 'Processing failed.', color: 'from-red-500 to-rose-500', show: true },
};

const statusIcons = {
  idle: null,
  uploading: '☁️',
  pending: '⏳',
  processing: '⚙️',
  completed: '✅',
  failed: '❌',
};

export default function ProgressBar({ status, progress }: ProgressBarProps) {
  const cfg = statusConfig[status];
  if (!cfg.show) return null;

  // Determine animation progress value
  const isIndeterminate = status === 'processing' || status === 'pending';
  const progressValue =
    status === 'completed' ? 100 :
    status === 'uploading' ? (progress || 60) :
    status === 'pending' ? 30 :
    status === 'processing' ? 65 :
    status === 'failed' ? 100 : 0;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Status text */}
      <div className="flex items-center gap-2">
        <span className="text-lg" role="img" aria-label={status}>
          {statusIcons[status]}
        </span>
        <span className={`text-sm font-medium ${status === 'failed' ? 'text-red-400' : status === 'completed' ? 'text-green-400' : 'text-slate-300'}`}>
          {cfg.label}
        </span>
        {isIndeterminate && (
          <div className="flex gap-1 ml-1">
            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${cfg.color} rounded-full transition-all duration-700 ease-out ${isIndeterminate ? 'animate-pulse' : ''}`}
          style={{ width: `${progressValue}%` }}
        />
      </div>
    </div>
  );
}
