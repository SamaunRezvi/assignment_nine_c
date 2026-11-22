// Uploads a tiny test pixel using .env.local; never prints the API key.
// Run: node --env-file=.env.local scripts/check-image-host.cjs
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');

function load(filename) {
  const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/lib', filename), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const context = { exports: {}, process, FormData, fetch, require: name => load(`${name.replace('./', '')}.ts`) };
  vm.runInNewContext(source, context);
  return context.exports;
}

(async () => {
  const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
  const url = await load('imgbb.ts').uploadToImgBB(new File([pixel], 'fixmate-upload-check.png', { type: 'image/png' }));
  const response = await fetch(url);
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
    throw new Error('Uploaded image could not be loaded');
  }
  console.log('PASS: configured ImgBB key uploads an image and the hosted image loads.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
