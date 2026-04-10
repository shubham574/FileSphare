# iLovePDF Clone — Full-Stack Implementation Plan

## Overview

Build a production-grade PDF tools web application with 10 PDF processing features, similar to [ilovepdf.com](https://www.ilovepdf.com/). The stack is **Next.js (frontend)** + **Node.js/Express (backend)** + **MongoDB (database)** + **Bull/Redis (job queues)**.

---

## User Review Required

> [!IMPORTANT]
> Before execution begins, confirm the following design decisions:
> - Redis is required for the Bull queue system. It must be installed locally (or via Docker) for the queue to work. Should I include a `docker-compose.yml` for local dev?
> - For PDF processing, I'll use `pdf-lib` (merge/split/rotate/watermark/page numbers) and `libreoffice` (Word↔PDF conversion). LibreOffice must be installed on the machine or server. Is that acceptable, or should I use a cloud API like CloudConvert for conversions?
> - For image processing (JPG↔PDF), I'll use `sharp` + `pdf-lib`. This should work cross-platform.
> - MongoDB: Do you have a local MongoDB or a cloud URI (MongoDB Atlas)? I'll default to `mongodb://localhost:27017/ilovepdf`.

> [!WARNING]
> Some tools (Word↔PDF) require system-level dependencies (LibreOffice). If you prefer a pure Node.js solution, I can use `docx-pdf` or a paid API, but quality may be lower.

---

## Proposed Folder Structure

```
iLovePDF/
├── frontend/          # Next.js app
│   ├── app/
│   │   ├── page.tsx              # Dashboard (tool grid)
│   │   ├── [tool]/page.tsx       # Dynamic tool page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ToolCard.tsx
│   │   ├── DropZone.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Navbar.tsx
│   ├── lib/
│   │   └── api.ts                # Axios client
│   ├── public/
│   └── next.config.js
│
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/               # One route file per tool
│   │   │   ├── merge.route.ts
│   │   │   ├── split.route.ts
│   │   │   ├── compress.route.ts
│   │   │   ├── pdfToWord.route.ts
│   │   │   ├── wordToPdf.route.ts
│   │   │   ├── jpgToPdf.route.ts
│   │   │   ├── pdfToJpg.route.ts
│   │   │   ├── rotate.route.ts
│   │   │   ├── watermark.route.ts
│   │   │   └── pageNumbers.route.ts
│   │   ├── controllers/          # Business logic wiring
│   │   ├── services/             # PDF processing core
│   │   │   ├── merge.service.ts
│   │   │   ├── split.service.ts
│   │   │   ├── compress.service.ts
│   │   │   ├── pdfToWord.service.ts
│   │   │   ├── wordToPdf.service.ts
│   │   │   ├── jpgToPdf.service.ts
│   │   │   ├── pdfToJpg.service.ts
│   │   │   ├── rotate.service.ts
│   │   │   ├── watermark.service.ts
│   │   │   └── pageNumbers.service.ts
│   │   ├── middleware/
│   │   │   ├── upload.ts         # Multer config
│   │   │   ├── rateLimiter.ts
│   │   │   ├── validate.ts
│   │   │   └── errorHandler.ts
│   │   ├── queues/
│   │   │   ├── pdfQueue.ts       # Bull queue definition
│   │   │   └── worker.ts         # Queue workers
│   │   ├── models/
│   │   │   └── Job.model.ts      # MongoDB job tracking
│   │   ├── utils/
│   │   │   ├── cleanup.ts        # Temp file deletion
│   │   │   ├── logger.ts         # Winston logger
│   │   │   └── fileValidator.ts
│   │   ├── config/
│   │   │   └── index.ts          # Env config
│   │   └── app.ts                # Express app entry
│   ├── uploads/                  # Temp storage
│   ├── outputs/                  # Processed files
│   └── package.json
│
└── docker-compose.yml            # MongoDB + Redis (dev)
```

---

## Proposed Changes

### Phase 1 — Project Scaffolding

#### [NEW] `docker-compose.yml`
MongoDB + Redis services for local development via Docker.

#### [NEW] `backend/` — Express App
Full Express server with TypeScript using `ts-node-dev` for dev mode.

#### [NEW] `frontend/` — Next.js App
Next.js 14 with App Router, TypeScript, and Tailwind CSS (only component used is for this project, explicitly scoped).

---

### Phase 2 — Backend APIs

10 REST endpoints (POST), each following the pattern:
```
POST /api/merge       → multipart/form-data → PDFs → merged.pdf
POST /api/split       → PDF + splitOptions  → zip of split PDFs
POST /api/compress    → PDF + quality       → compressed.pdf
POST /api/pdf-to-word → PDF                → .docx
POST /api/word-to-pdf → .docx              → .pdf
POST /api/jpg-to-pdf  → images[]           → .pdf
POST /api/pdf-to-jpg  → PDF                → zip of JPGs
POST /api/rotate      → PDF + degrees      → rotated.pdf
POST /api/watermark   → PDF + watermark opts → watermarked.pdf
POST /api/page-numbers→ PDF + style opts   → numbered.pdf
```

All responses include a `downloadUrl` that serves the processed file via:
```
GET /api/download/:jobId
```

---

### Phase 3 — PDF Processing Services

| Tool | Library |
|------|---------|
| Merge PDF | `pdf-lib` |
| Split PDF | `pdf-lib` |
| Compress PDF | `ghostscript` (CLI) or `pdf-lib` lossy options |
| PDF to Word | `libreoffice` CLI or `pdf2docx` (python subprocess) |
| Word to PDF | `libreoffice` CLI |
| JPG to PDF | `pdf-lib` + `sharp` |
| PDF to JPG | `pdf-poppler` or `pdfjs-dist` + `canvas` |
| Rotate PDF | `pdf-lib` |
| Add Watermark | `pdf-lib` |
| Add Page Numbers | `pdf-lib` |

---

### Phase 4 — Queue System

- **Bull** + **Redis** for async job processing
- Jobs are queued, workers process them, MongoDB tracks state
- Polling/webhook informs frontend when done
- Auto-cleanup of temp files after 1 hour (cron job)

---

### Phase 5 — Frontend UI

- **Dashboard**: Grid of 10 tool cards with icons and descriptions
- **Tool Page**: Drag-and-drop upload → options panel → process button → progress bar → download button
- Fully responsive, dark/light mode, smooth animations
- Design inspiration: ilovepdf.com but with a modern dark premium aesthetic

---

### Phase 6 — Security

- `helmet` — HTTP security headers
- `express-rate-limit` — per-IP rate limiting (10 req/min per endpoint)
- File type validation (magic bytes, not just extension)
- File size limit: 100MB per upload
- CORS configured for frontend origin only

---

## Verification Plan

### Automated Tests
- API smoke tests with `curl` for each endpoint
- Check output files are valid (non-zero byte size)
- Frontend builds without errors: `npm run build`
- Backend lints: `npm run lint`

### Manual Verification
- Drag & drop a PDF → merge → download → verify PDF opens
- Upload a DOCX → convert to PDF → verify output
- Confirm progress bar updates during processing
- Verify cleanup: temp files deleted after job completes

---

## Open Questions

> [!IMPORTANT]
> 1. **Docker**: Should I include `docker-compose.yml` for MongoDB + Redis? (Recommended for local dev)
> 2. **LibreOffice**: Do you have LibreOffice installed for Word↔PDF conversion? If not, should I use a different approach (e.g., `mammoth` for DOCX→HTML→PDF)?
> 3. **MongoDB**: Local or Atlas? I'll default to local (`mongodb://localhost:27017/ilovepdf`)
> 4. **Deployment**: Should I scaffold deployment configs for Vercel (frontend) + Render (backend) now, or focus on local-first?
> 5. **Auth**: Should I add user accounts (sign up/login) for saving job history, or keep it fully anonymous for now?
