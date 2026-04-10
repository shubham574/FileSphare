import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Proxy the file download from the backend through Next.js.
 * This makes it a same-origin download so <a download="filename"> works correctly.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const backendUrl = `${BACKEND}/api/download/${jobId}`;

  let backendRes: Response;
  try {
    backendRes = await fetch(backendUrl, { cache: 'no-store' });
  } catch (_err) {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }

  if (!backendRes.ok) {
    const text = await backendRes.text().catch(() => 'Error');
    return NextResponse.json({ error: text }, { status: backendRes.status });
  }

  const blob = await backendRes.arrayBuffer();
  const contentType =
    backendRes.headers.get('Content-Type') || 'application/octet-stream';
  const contentDisposition =
    backendRes.headers.get('Content-Disposition') || 'attachment';

  return new NextResponse(blob, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': contentDisposition,
      'Content-Length': String(blob.byteLength),
      'Cache-Control': 'no-store',
    },
  });
}
