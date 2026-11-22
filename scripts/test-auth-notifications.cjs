const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(name) {
  const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/lib', `${name}.ts`), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const context = { exports: {}, TextDecoder, require: name => load(name.replace('./', '')) };
  vm.runInNewContext(source, context);
  return context.exports;
}

test('redirects preserve safe destinations and enforce the account role', () => {
  const { authRedirect } = load('auth-redirect');
  for (const role of ['admin', 'customer', 'technician']) {
    for (const bad of [null, 'https://example.com', '//example.com', '/\\example.com', '/sign-in', '/sign-up', '/dashboard/administrator']) {
      assert.equal(authRedirect(bad, role), `/dashboard/${role}`);
    }
    assert.equal(authRedirect('/dashboard/profile', role), '/dashboard/profile');
    assert.equal(authRedirect(`/dashboard/${role}/details`, role), `/dashboard/${role}/details`);
    assert.equal(authRedirect('/services/repair?booking=true', role), '/services/repair?booking=true');
  }
  assert.equal(authRedirect('/dashboard/admin', 'customer'), '/dashboard/customer');
});

test('notification stream parses split UTF-8 frames, CRLF and heartbeats exactly once', async () => {
  const { consumeNotifications } = load('notification-stream');
  const snapshot = { enabled: true, unreadCount: 1, readAt: '1970-01-01', items: [{ id: 'event', title: 'নতুন অর্ডার' }] };
  const bytes = new TextEncoder().encode(`: heartbeat\r\n\r\nevent: notifications\r\ndata: ${JSON.stringify(snapshot)}\r\n\n`);
  const response = new Response(new ReadableStream({
    start(controller) {
      for (let i = 0; i < bytes.length; i += 3) controller.enqueue(bytes.slice(i, i + 3));
      controller.close();
    },
  }), { headers: { 'Content-Type': 'text/event-stream' } });
  const received = [];
  await consumeNotifications(response, data => received.push(JSON.parse(JSON.stringify(data))));
  assert.deepEqual(received, [snapshot]);
  assert.equal(response.body.locked, false);
});

test('notification stream rejects authentication failures and malformed data', async () => {
  const { consumeNotifications } = load('notification-stream');
  await assert.rejects(consumeNotifications(new Response('Unauthorized', { status: 401 }), () => {}), /unavailable/);
  const response = new Response('data: invalid-json\n\n', { headers: { 'Content-Type': 'text/event-stream' } });
  await assert.rejects(consumeNotifications(response, () => {}));
  assert.equal(response.body.locked, false);
});
