// Start the app on port 3019. Uses mocked accounts and never changes production data.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const baseURL = process.env.AUDIT_BASE_URL || 'http://localhost:3019';

async function setup(browser, role, { loggedIn = true, mobile = false, failProfile = false, empty = false } = {}) {
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 } });
  const page = await context.newPage();
  const state = { loggedIn, failProfile, enabled: true, failPreference: false, streams: 0, newEvent: false, readAt: '1970-01-01T00:00:00.000Z' };
  const user = { id: 'audit', _id: 'audit', name: 'Account Audit', email: 'audit@example.test', role };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const older = new Date(Date.now() - 60_000).toISOString();
  const newer = new Date(Date.now() - 1_000).toISOString();
  const destination = `/dashboard/${role}/${role === 'technician' ? 'requests' : 'bookings'}`;
  function snapshot() {
    const items = empty ? [] : [{ id: 'old', title: 'Request accepted', message: 'Existing repair', createdAt: older, href: destination }];
    if (state.newEvent) items.unshift({ id: 'new', title: 'New repair request', message: 'Live repair order', createdAt: newer, href: destination });
    return { enabled: state.enabled, readAt: state.readAt, unreadCount: items.filter(item => item.createdAt > state.readAt).length, items };
  }
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const p = url.pathname;
    if (p === '/_next/image') return route.abort();
    if (p.includes('/api/auth/get-session')) return route.fulfill({ json: !state.loggedIn ? null : {
      session: { id: 'session', token: 'session', userId: user.id, expiresAt: '2099-01-01T00:00:00.000Z' },
      user: { ...user, emailVerified: true, createdAt: older, updatedAt: older },
    } });
    if (p.includes('/api/auth/sign-in/email') || p.includes('/api/auth/sign-up/email')) {
      state.loggedIn = true;
      return route.fulfill({ json: { token: 'session', user } });
    }
    if (p === '/api/jwt') return route.fulfill({ json: { token: 'audit-token' } });
    if (p === '/api/users/me') {
      await new Promise(resolve => setTimeout(resolve, 350));
      return route.fulfill(state.failProfile ? { status: 503, json: { message: 'Account temporarily unavailable' } } : { json: user });
    }
    if (p === '/api/notifications') return route.fulfill({ json: snapshot() });
    if (p === '/api/notifications/stream') {
      state.streams++;
      assert.equal(request.headers().authorization, 'Bearer audit-token');
      return route.fulfill({ contentType: 'text/event-stream', body: `: heartbeat\n\nevent: notifications\ndata: ${JSON.stringify(snapshot())}\n\n` });
    }
    if (p === '/api/notifications/preferences') {
      if (state.failPreference) return route.fulfill({ status: 500, json: { message: 'Preference save failed for audit' } });
      state.enabled = request.postDataJSON().enabled;
      return route.fulfill({ json: snapshot() });
    }
    if (p === '/api/notifications/read') {
      state.readAt = request.postDataJSON().readAt;
      return route.fulfill({ json: snapshot() });
    }
    if (p.startsWith('/api/')) {
      if (p.includes('/stats')) return route.fulfill({ json: { totalRequests: 0, activeJobs: 0, completedJobs: 0, totalServices: 0, approvedServices: 0, pendingRequests: 0, totalUsers: 0, totalBookings: 0, totalRevenue: 0 } });
      return route.fulfill({ json: [] });
    }
    return route.continue();
  });
  return { page, context, state, errors };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const role of ['admin', 'customer', 'technician']) {
      // Existing sessions (including social sign-in callbacks) leave the login page.
      let fixture = await setup(browser, role);
      await fixture.page.goto(`${baseURL}/sign-in`);
      await fixture.page.waitForURL(`${baseURL}/dashboard/${role}`);
      await fixture.page.getByRole('button', { name: /^Notifications/ }).click();
      const orderLink = fixture.page.getByRole('link').filter({ hasText: 'Existing repair' });
      await orderLink.waitFor();
      assert.equal(await orderLink.getAttribute('href'), `/dashboard/${role}/${role === 'technician' ? 'requests' : 'bookings'}`);
      assert.deepEqual(fixture.errors, []);
      await fixture.context.close();

      fixture = await setup(browser, role, { loggedIn: false });
      await fixture.page.goto(`${baseURL}/sign-in?redirect=%2Fdashboard%2Fprofile`);
      await fixture.page.locator('#email').fill('audit@example.test');
      await fixture.page.locator('#password').fill('ExamplePassword');
      await fixture.page.getByRole('button', { name: 'Sign In', exact: true }).click();
      await fixture.page.waitForURL(`${baseURL}/dashboard/profile`);
      await fixture.page.locator('#profile-image').waitFor();
      await fixture.page.waitForTimeout(500);
      assert.ok(fixture.page.url().endsWith('/dashboard/profile'), 'Delayed profile loading must not bounce back to sign-in');
      assert.deepEqual(fixture.errors, []);
      await fixture.context.close();
      console.log(`PASS ${role}: existing-session redirect and email login with delayed profile`);
    }

    for (const role of ['customer', 'technician']) {
      const fixture = await setup(browser, role, { loggedIn: false });
      await fixture.page.goto(`${baseURL}/sign-up`);
      await fixture.page.locator('#name').fill('Account Audit');
      await fixture.page.locator('#email').fill('audit@example.test');
      await fixture.page.locator('#password').fill('ExamplePassword');
      if (role === 'technician') await fixture.page.getByRole('button', { name: 'technician', exact: true }).click();
      await fixture.page.getByRole('button', { name: 'Sign Up', exact: true }).click();
      await fixture.page.waitForURL(`${baseURL}/dashboard/${role}`);
      assert.deepEqual(fixture.errors, []);
      await fixture.context.close();
      console.log(`PASS ${role}: registration synchronizes account before dashboard navigation`);
    }

    const failure = await setup(browser, 'customer', { failProfile: true });
    await failure.page.goto(`${baseURL}/dashboard/profile`);
    await failure.page.getByRole('button', { name: 'Retry loading account', exact: true }).waitFor();
    failure.state.failProfile = false;
    await failure.page.getByRole('button', { name: 'Retry loading account', exact: true }).click();
    await failure.page.locator('#profile-image').waitFor();
    await failure.context.close();
    console.log('PASS account sync failure: visible error and successful retry');

    for (const mobile of [false, true]) {
      const { page, context, state, errors } = await setup(browser, 'technician', { mobile });
      await page.goto(`${baseURL}/dashboard/profile`);
      const bell = page.getByRole('button', { name: /^Notifications/ });
      await bell.waitFor();
      await bell.click();
      await page.getByText('Existing repair', { exact: true }).waitFor();
      const toggle = page.getByRole('switch', { name: 'Live order alerts', exact: true });
      assert.equal(await toggle.getAttribute('aria-checked'), 'true');
      const popover = page.getByRole('dialog');
      const bounds = await popover.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= page.viewportSize().width);
      state.newEvent = true;
      await page.getByRole('link').filter({ hasText: 'Live repair order' }).waitFor({ timeout: 10_000 });
      assert.equal(await page.getByRole('link').filter({ hasText: 'Live repair order' }).getAttribute('href'), '/dashboard/technician/requests');
      await page.getByRole('button', { name: 'Mark all as read', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('button[aria-label="Notifications"]'));
      state.failPreference = true;
      await toggle.click();
      await page.getByText('Preference save failed for audit', { exact: true }).waitFor();
      assert.equal(await toggle.getAttribute('aria-checked'), 'true');
      state.failPreference = false;
      await toggle.click();
      await page.getByText('Alerts are paused. Turn them on to receive live updates.', { exact: true }).waitFor();
      const count = state.streams;
      await page.waitForTimeout(2_500);
      assert.equal(state.streams, count, 'Toggle off must stop the live stream');
      await page.reload();
      await page.getByRole('button', { name: /^Notifications/ }).click();
      const restoredToggle = page.getByRole('switch', { name: 'Live order alerts', exact: true });
      await page.waitForFunction(() => document.querySelector('#live-notifications')?.getAttribute('aria-checked') === 'false');
      await restoredToggle.click();
      await page.waitForFunction(() => document.querySelector('#live-notifications')?.getAttribute('aria-checked') === 'true');
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`PASS notifications ${mobile ? 'mobile' : 'desktop'}: live event, unread/read, preference error, pause, persisted preference, resume`);
    }
    const empty = await setup(browser, 'customer', { empty: true });
    await empty.page.goto(`${baseURL}/dashboard/profile`);
    await empty.page.getByRole('button', { name: /^Notifications/ }).click();
    await empty.page.getByText('No notifications yet. New requests and order updates will appear here.', { exact: true }).waitFor();
    await empty.context.close();
    console.log('PASS empty notification feed');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
