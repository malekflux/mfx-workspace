import type { IncomingMessage, ServerResponse } from 'node:http';

type VercelRequest = IncomingMessage & { body?: unknown };

function readBody(body: unknown) {
  if (typeof body === 'string') return JSON.parse(body) as unknown;
  if (Buffer.isBuffer(body)) return JSON.parse(body.toString()) as unknown;
  return body;
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'text/plain', Allow: 'POST' }).end('POST required');
    return;
  }

  try {
    const payload = readBody(req.body) as { html?: unknown } | undefined;
    const html = payload?.html;
    if (typeof html !== 'string' || !html.includes('proposal-container')) {
      res.writeHead(400, { 'Content-Type': 'text/plain' }).end('Invalid MFx document');
      return;
    }
    if (Buffer.byteLength(html, 'utf8') > 6 * 1024 * 1024) {
      res.writeHead(413, { 'Content-Type': 'text/plain' }).end('Document exceeds 6MB. Reduce logo size.');
      return;
    }

    const { renderPDF } = await import('../server/pdf.js');
    const pdf = await renderPDF(html);
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="MFx-document.pdf"',
      'Cache-Control': 'no-store',
    });
    res.end(Buffer.from(pdf));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' }).end(error instanceof Error ? error.message : 'PDF export failed');
  }
}

export const config = { maxDuration: 60 };
