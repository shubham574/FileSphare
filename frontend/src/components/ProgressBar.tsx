'use client';

interface ProgressBarProps {
  status: 'idle' | 'uploading' | 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  toolName?: string;
}

const statusConfig = {
  idle: { label: '', show: false },
  uploading: { label: 'Uploading files...', show: true },
  pending: { label: 'Queued, waiting to process...', show: true },
  processing: { label: 'Processing...', show: true },
  completed: { label: 'Done! Your file is ready.', show: true },
  failed: { label: 'Processing failed.', show: true },
};

export default function ProgressBar({ status, progress, toolName }: ProgressBarProps) {
  const cfg = statusConfig[status];
  if (!cfg.show) return null;

  // Determine animation progress value
  const isIndeterminate = status === 'processing' || status === 'pending';
  let progressValue = progress || 0;
  
  if (status === 'completed' || status === 'failed') {
    progressValue = 100;
  }
  
  // Ensure we show at least a sliver of progress once started
  if (status !== 'idle' && progressValue === 0) progressValue = 2;

  let displayLabel = cfg.label;
  if (status === 'processing' && toolName) {
      displayLabel = `${toolName.replace(' PDF', '')}ing files...`;
  }

  return (
    <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm border border-outline-variant/10 text-center animate-fade-in w-full">
      <div className="mb-4">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className={status === 'failed' ? 'text-error font-bold' : 'text-on-surface'}>
            {displayLabel}
          </span>
          {status !== 'failed' && status !== 'completed' && (
            <span className="text-primary">{progressValue}%</span>
          )}
        </div>
        
        <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
                status === 'failed' 
                ? 'bg-error' 
                : status === 'completed' 
                ? 'bg-tertiary text-on-tertiary' 
                : 'bg-gradient-to-r from-primary to-secondary-container animate-pulse'
            }`}
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>
    </div>
  );
}
