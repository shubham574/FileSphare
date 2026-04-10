import mongoose, { Schema, Document } from 'mongoose';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type JobTool =
  | 'merge'
  | 'split'
  | 'compress'
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'jpg-to-pdf'
  | 'pdf-to-jpg'
  | 'rotate'
  | 'watermark'
  | 'page-numbers';

export interface IJob extends Document {
  jobId: string;
  tool: JobTool;
  status: JobStatus;
  inputFiles: string[];
  outputFile?: string;
  downloadUrl?: string;
  error?: string;
  options?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    tool: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    inputFiles: [{ type: String }],
    outputFile: { type: String },
    downloadUrl: { type: String },
    error: { type: String },
    options: { type: Schema.Types.Mixed },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour TTL
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>('Job', JobSchema);
