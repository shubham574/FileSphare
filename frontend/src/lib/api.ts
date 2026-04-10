const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface JobResponse {
  success: boolean;
  jobId: string;
  status: string;
  statusUrl: string;
  downloadUrl: string;
  message: string;
  error?: string;
}

export interface StatusResponse {
  success: boolean;
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  tool: string;
  error?: string;
  fileName?: string;
  downloadUrl?: string;
}

export async function submitJob(
  endpoint: string,
  formData: FormData
): Promise<JobResponse> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Server error: ${res.status}`);
  }

  return res.json();
}

export async function pollStatus(jobId: string): Promise<StatusResponse> {
  const res = await fetch(`${API_BASE}/api/status/${jobId}`);
  if (!res.ok) {
    throw new Error(`Status fetch failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Returns the same-origin Next.js proxy URL for a given job.
 * This ensures <a download="filename.pdf"> works correctly in all browsers.
 */
export function getProxyDownloadUrl(jobId: string): string {
  return `/api/download/${jobId}`;
}

export async function waitForJob(
  jobId: string,
  onProgress?: (status: StatusResponse) => void,
  intervalMs = 1500,
  timeoutMs = 120000
): Promise<StatusResponse> {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error('Job timed out after 2 minutes.'));
        return;
      }

      try {
        const status = await pollStatus(jobId);
        onProgress?.(status);

        if (status.status === 'completed') {
          clearInterval(interval);
          resolve(status);
        } else if (status.status === 'failed') {
          clearInterval(interval);
          reject(new Error(status.error || 'Processing failed.'));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, intervalMs);
  });
}
