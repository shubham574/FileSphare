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
  progress?: number;
}

/**
 * Submits a job using XMLHttpRequest to support upload progress tracking.
 */
export async function submitJob(
  endpoint: string,
  formData: FormData,
  onUploadProgress?: (progress: number) => void
): Promise<JobResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}${endpoint}`);

    // Track upload progress
    if (onUploadProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onUploadProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          reject(new Error('Failed to parse server response.'));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error || `Server error: ${xhr.status}`));
        } catch (e) {
          reject(new Error(`Server error: ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error occurred during upload.'));
    xhr.send(formData);
  });
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
 */
export function getProxyDownloadUrl(jobId: string): string {
  return `/api/download/${jobId}`;
}

export async function waitForJob(
  jobId: string,
  onProgress?: (status: StatusResponse) => void,
  intervalMs = 1500,
  timeoutMs = 300000 // Increased to 5 mins for video processing
): Promise<StatusResponse> {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error('Job timed out. Processing is taking longer than expected.'));
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
