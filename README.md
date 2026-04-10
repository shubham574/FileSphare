# FileSphare

A full-stack PDF tools web application with 10 PDF processing features, built with:

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB (job tracking)
- **Queue**: Bull + Redis (async processing)
- **PDF Engine**: pdf-lib, sharp, mammoth, pdfkit, docx

---

## 🚀 Quick Start

### Prerequisites

| Tool | Required | Notes |
|------|----------|-------|
| Node.js | ✅ v18+ | [Download](https://nodejs.org) |
| Docker Desktop | ✅ | For MongoDB + Redis |
| npm | ✅ Comes with Node | |

### 1. Start MongoDB + Redis

```bash
docker-compose up -d
```

### 2. Start the Backend

```bash
cd backend
npm run dev
```

Backend runs at: **http://localhost:5000**

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 📁 Project Structure

```
iLovePDF/
├── docker-compose.yml          # MongoDB + Redis services
├── frontend/                   # Next.js 14 app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── [tool]/page.tsx # Dynamic tool page
│   │   │   ├── globals.css
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ToolCard.tsx
│   │   │   ├── DropZone.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── ToolPageWrapper.tsx
│   │   └── lib/
│   │       ├── tools.ts        # Tool definitions
│   │       └── api.ts          # API client
│   └── .env.local
│
└── backend/                    # Express + TypeScript API
    ├── src/
    │   ├── app.ts              # Entry point
    │   ├── config/index.ts
    │   ├── routes/index.ts     # All 10 tool routes
    │   ├── controllers/pdf.controller.ts
    │   ├── services/           # PDF processing logic
    │   ├── middleware/         # Upload, rate limit, error handler
    │   ├── queues/             # Bull queue + worker
    │   ├── models/             # MongoDB Job model
    │   └── utils/             # Logger, cleanup, validator
    ├── uploads/                # Temp uploaded files
    ├── outputs/                # Processed results
    └── .env
```

---

## 🔧 Available PDF Tools

| Tool | Endpoint | Description |
|------|----------|-------------|
| Merge PDF | `POST /api/merge` | Combine multiple PDFs |
| Split PDF | `POST /api/split` | Split by page, range, or interval |
| Compress PDF | `POST /api/compress` | Reduce file size |
| PDF to Word | `POST /api/pdf-to-word` | Extract text to DOCX |
| Word to PDF | `POST /api/word-to-pdf` | DOCX → PDF |
| JPG to PDF | `POST /api/jpg-to-pdf` | Images → PDF |
| PDF to JPG | `POST /api/pdf-to-jpg` | Extract pages as images |
| Rotate PDF | `POST /api/rotate` | Rotate by 90/180/270° |
| Add Watermark | `POST /api/watermark` | Stamp text on pages |
| Page Numbers | `POST /api/page-numbers` | Add page numbers |

### Job Lifecycle

```
POST /api/{tool}           → 202 { jobId, statusUrl }
GET  /api/status/:jobId    → { status: 'pending|processing|completed|failed' }
GET  /api/download/:jobId  → file download
GET  /api/health           → health check
```

---

## 🧪 Test with curl

```bash
# Health check
curl http://localhost:5000/api/health

# Merge PDFs
curl -X POST http://localhost:5000/api/merge \
  -F "files=@doc1.pdf" \
  -F "files=@doc2.pdf"

# Split PDF (extract all pages)
curl -X POST http://localhost:5000/api/split \
  -F "file=@document.pdf" \
  -F "mode=all"

# Add watermark
curl -X POST http://localhost:5000/api/watermark \
  -F "file=@document.pdf" \
  -F "text=CONFIDENTIAL" \
  -F "opacity=0.2"
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/ilovepdf
REDIS_HOST=localhost
REDIS_PORT=6379
MAX_FILE_SIZE_MB=100
UPLOAD_DIR=uploads
OUTPUT_DIR=outputs
CLEANUP_INTERVAL_MINUTES=60
FILE_TTL_MINUTES=60
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🔒 Security Features

- **Helmet** — HTTP security headers
- **CORS** — Locked to frontend origin
- **Rate limiting** — 30 req/min global, 10 uploads/min
- **File type validation** — Magic byte checks (not just extensions)
- **File size limit** — 100MB per upload
- **Auto-cleanup** — Files deleted after 1 hour

---

## 📦 Dependencies

### Backend
- `pdf-lib` — PDF manipulation (merge, split, rotate, watermark, page numbers)
- `sharp` — Image processing (JPG→PDF)
- `mammoth` — DOCX→HTML conversion
- `pdfkit` — PDF creation (Word→PDF)
- `docx` — DOCX generation (PDF→Word)
- `pdf-parse` — Text extraction from PDFs
- `bull` + `ioredis` — Job queue with Redis
- `mongoose` — MongoDB ODM

---

## 🚀 Production Deployment

### Frontend → Vercel

```bash
cd frontend
npx vercel deploy --prod
```

Set env var: `NEXT_PUBLIC_API_URL=https://your-backend.render.com`

### Backend → Render

1. Push repo to GitHub
2. Create new Web Service on Render
3. Root directory: `backend`
4. Build command: `npm install && npm run build`
5. Start command: `node dist/app.js`
6. Add environment variables from `.env`
7. Add a Redis service (Render has built-in Redis)
8. Add MongoDB Atlas URI

---

## 🔁 Future Improvements

- [ ] User authentication + job history
- [ ] Real-time progress via WebSockets
- [ ] OCR (pdf text recognition)
- [ ] Cloud storage (S3/GCS)
- [ ] Better PDF→JPG using Ghostscript
- [ ] E-signature support
- [ ] PDF form filling
