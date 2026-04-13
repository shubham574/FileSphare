import { pdfQueue, PdfJobData } from './pdfQueue';
import { Job } from '../models/Job.model';
import { logger } from '../utils/logger';
import { deleteFiles } from '../utils/cleanup';

// Services
import { mergePdfs } from '../services/merge.service';
import { splitPdf } from '../services/split.service';
import { compressPdf } from '../services/compress.service';
import { rotatePdf } from '../services/rotate.service';
import { addWatermark } from '../services/watermark.service';
import { addPageNumbers } from '../services/pageNumbers.service';
import { jpgToPdf } from '../services/jpgToPdf.service';
import { pdfToJpg } from '../services/pdfToJpg.service';
import { pdfToWord } from '../services/pdfToWord.service';
import { wordToPdf } from '../services/wordToPdf.service';
import { addHeaderFooter } from '../services/headerFooter.service';
import { config } from '../config';

const toolServiceMap: Record<string, (data: PdfJobData) => Promise<string>> = {
  merge: (data) => mergePdfs(data.inputFiles),
  split: (data) => splitPdf(data.inputFiles[0], data.options),
  compress: async (data) => (await compressPdf(data.inputFiles[0], data.options)).outputPath,
  rotate: (data) => rotatePdf(data.inputFiles[0], data.options),
  watermark: (data) => addWatermark(data.inputFiles[0], data.options),
  'page-numbers': (data) => addPageNumbers(data.inputFiles[0], data.options),
  'jpg-to-pdf': (data) => jpgToPdf(data.inputFiles),
  'pdf-to-jpg': (data) => pdfToJpg(data.inputFiles[0]),
  'pdf-to-word': (data) => pdfToWord(data.inputFiles[0]),
  'word-to-pdf': (data) => wordToPdf(data.inputFiles[0]),
  'header-footer': (data) => addHeaderFooter(data.inputFiles[0], data.options),
};

pdfQueue.process(async (bullJob) => {
  const data: PdfJobData = bullJob.data;
  const { jobId, tool, inputFiles } = data;

  logger.info(`[Worker] Starting job ${jobId} — tool: ${tool}`);

  // Update status to processing
  await Job.findOneAndUpdate({ jobId }, { status: 'processing' });

  try {
    const serviceFn = toolServiceMap[tool];
    if (!serviceFn) throw new Error(`Unknown tool: ${tool}`);

    const outputFile = await serviceFn(data);
    const fileName = outputFile.split(/[/\\]/).pop()!;
    const downloadUrl = `/api/download/${jobId}`;

    await Job.findOneAndUpdate(
      { jobId },
      { status: 'completed', outputFile, downloadUrl }
    );

    logger.info(`[Worker] Job ${jobId} completed → ${fileName}`);

    // Cleanup input files after short delay
    setTimeout(() => deleteFiles(inputFiles), 5000);

    return { outputFile, downloadUrl };
  } catch (err: any) {
    const message = err.message || 'Processing failed';
    logger.error(`[Worker] Job ${jobId} failed: ${message}`);

    await Job.findOneAndUpdate({ jobId }, { status: 'failed', error: message });

    // Cleanup inputs on failure too
    deleteFiles(inputFiles);
    throw err;
  }
});

logger.info('[Worker] PDF queue worker registered');
