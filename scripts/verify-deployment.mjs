import assert from 'node:assert/strict';
import fs from 'node:fs';
import { build } from 'esbuild';

await build({
  entryPoints: ['api/pdf.ts'],
  outfile: 'verification/modules/vercel-pdf.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
});

const { default: handler } = await import('../verification/modules/vercel-pdf.mjs');
const html = fs.readFileSync('verification/invoice-en.html', 'utf8');
let status = 0;
let headers = {};
let output = Buffer.alloc(0);
const response = {
  writeHead(code, nextHeaders = {}) { status = code; headers = nextHeaders; return this; },
  end(value = '') { output = Buffer.isBuffer(value) ? value : Buffer.from(value); return this; },
};

await handler({ method: 'POST', body: { html } }, response);
assert.equal(status, 200, output.toString());
assert.match(String(headers['Content-Type']), /application\/pdf/);
assert.equal(output.subarray(0, 4).toString(), '%PDF');
assert.ok(output.length > 10_000);
console.log(`PASS deployable /api/pdf function: ${output.length} bytes, ${output.subarray(0, 4)}`);
