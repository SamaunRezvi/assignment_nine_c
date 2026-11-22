const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadModule(filename, globals = {}) {
  const filePath = path.resolve(__dirname, '../src/lib', filename);
  const source = ts.transpileModule(fs.readFileSync(filePath, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const context = {
    exports: {}, FormData,
    require: name => loadModule(`${name.replace('./', '')}.ts`, globals),
    ...globals,
  };
  vm.runInNewContext(source, context, { filename });
  return context.exports;
}

const validFile = () => new File(['image bytes'], 'photo.png', { type: 'image/png' });
const { getImageValidationError, MAX_IMAGE_SIZE } = loadModule('image-validation.ts');

test('validates image type, empty files, and size before upload', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp', 'image/gif']) {
    assert.equal(getImageValidationError(new File(['image'], 'photo', { type })), null);
  }
  assert.match(getImageValidationError(new File(['text'], 'file.txt', { type: 'text/plain' })), /Choose a JPG/);
  assert.match(getImageValidationError(new File([], 'photo.png', { type: 'image/png' })), /empty/);
  assert.equal(getImageValidationError({ type: 'image/png', size: MAX_IMAGE_SIZE }), null);
  assert.match(getImageValidationError({ type: 'image/png', size: MAX_IMAGE_SIZE + 1 }), /10 MB/);
});

function uploader(fetchImpl, key = 'test-key') {
  return loadModule('imgbb.ts', {
    process: { env: { NEXT_PUBLIC_IMGBB_API_KEY: key } }, fetch: fetchImpl,
  }).uploadToImgBB;
}

test('does not call the provider for invalid files or missing configuration', async () => {
  const upload = uploader(() => assert.fail('Unexpected network call'), '');
  await assert.rejects(upload(validFile()), /unavailable/);
  await assert.rejects(upload(new File(['text'], 'file.txt', { type: 'text/plain' })), /Choose a JPG/);
});

test('uploads multipart data and returns the hosted image URL', async () => {
  const file = validFile();
  const upload = uploader(async (url, options) => {
    assert.equal(new URL(url).searchParams.get('key'), 'key & value');
    assert.equal(options.method, 'POST');
    assert.equal(options.body.get('image'), file);
    return { ok: true, json: async () => ({ success: true, data: { url: 'https://i.ibb.co/test/photo.png' } }) };
  }, ' key & value ');
  assert.equal(await upload(file), 'https://i.ibb.co/test/photo.png');
});

test('reports provider, invalid response, and connection failures', async () => {
  const cases = [
    [{ ok: false, json: async () => ({ error: { message: 'Invalid API key' } }) }, /Invalid API key/],
    [{ ok: true, json: async () => ({ success: true, data: {} }) }, /Image upload failed/],
    [{ ok: false, json: async () => { throw new Error('Not JSON'); } }, /Image upload failed/],
  ];
  for (const [response, expected] of cases) {
    await assert.rejects(uploader(async () => response)(validFile()), expected);
  }
  await assert.rejects(uploader(async () => { throw new Error('offline'); })(validFile()), /Check your connection/);
});
