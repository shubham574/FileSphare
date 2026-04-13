import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { config } from '../config';

// Ensure upload directory exists
if (!fs.existsSync(config.files.uploadDir)) {
  fs.mkdirSync(config.files.uploadDir, { recursive: true });
}
if (!fs.existsSync(config.files.outputDir)) {
  fs.mkdirSync(config.files.outputDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.files.uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: any,
  cb: multer.FileFilterCallback
) => {
  const allowed = [
    '.pdf', '.docx', 
    '.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif',
    '.mp4', '.webm', '.mov', '.avi', '.mkv'
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${ext}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.files.maxSizeMb * 1024 * 1024,
  },
});
