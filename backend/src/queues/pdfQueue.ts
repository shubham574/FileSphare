import Bull from 'bull';
import { config } from '../config';

const redisOptions = {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
  },
};

export interface PdfJobData {
  jobId: string;
  tool: string;
  inputFiles: string[];
  options?: Record<string, any>;
}

export const pdfQueue = new Bull<PdfJobData>('pdf-processing', redisOptions);

pdfQueue.on('error', (err) => {
  // graceful — queue errors are non-fatal when Redis is unavailable
  console.error('[Queue] Bull error:', err.message);
});
