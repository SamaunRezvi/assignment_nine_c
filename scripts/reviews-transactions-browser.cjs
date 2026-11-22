// Mocked customer/technician sessions share booking data; no production writes.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const baseURL = process.env.AUDIT_BASE_URL || 'http://localhost:3019';

function fixture() {
  const booking = {
    _id: '507f1f77bcf86cd799439011', serviceId: 'service', serviceTitle: 'Laptop Motherboard Diagnosis', serviceImage: 'https://i.ibb.co/audit/photo.png',
    customerName: 'Tanvir Ahmed', customerEmail: 'customer@example.test', customerPhone: '01722366777',
    technicianName: 'Rafiq Hasan', technicianEmail: 'tech@example.test', address: 'Daffodil International University, Ashulia, Savar, Dhaka',
    preferredDate: '2026-11-23', problemDescription: 'iPhone 16 Pro Max - Display issue.', status: 'completed', paymentStatus: 'paid',
    finalAmount: 60, basePrice: 60, createdAt: new Date().toISOString(), statusHistory: [], category: 'Laptop & PC',
  };
  const payment = { _id: 'p1', serviceTitle: booking.serviceTitle, customerName: booking.customerName, technicianName: booking.technicianName, amount: 60, currency: 'usd', transactionId: 'pi_test_payment', paidAt: new Date().toISOString() };
  return { booking, legacy: { ...booking, _id: 'legacy', customerName: 'Legacy Customer', rating: 4, review: 'Previously saved feedback' }, payments: [payment, { ...payment, _id: 'p2', amount: 20, transactionId: 'pi_seed_demo_transaction' }], failBookings: false, failPayments: false, enabled: true, event: null };
}

async function open(browser, role, state, mobile = false) {
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 } });
  const page = await context.newPage();
  const user = { _id: role, id: role, email: role === 'technician' ? 'tech@example.test' : `${role}@example.test`, role, name: role === 'customer' ? 'Tanvir Ahmed' : 'Audit User' };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const p = url.pathname;
    const json = data => route.fulfill({ json: data });
    if (p === '/_next/image') return route.abort();
    if (p.includes('/api/auth/get-session')) return json({ session: { id: 'session', token: 'token', userId: user.id, expiresAt: '2099-01-01T00:00:00.000Z' }, user: { ...user, emailVerified: true, createdAt: state.booking.createdAt, updatedAt: state.booking.createdAt } });
    if (p === '/api/jwt') return json({ token: 'audit-token' });
    if (p === '/api/users/me') return json(user);
    if (p === '/api/bookings/technician') {
      if (state.failBookings) return route.fulfill({ status: 503, json: { message: 'Temporary booking error' } });
      const filter = url.searchParams.get('status');
      const data = [state.booking, state.legacy].filter(booking => !filter || booking.status === filter);
      return json(data);
    }
    if (p === '/api/bookings/my') return json([state.booking]);
    if (p.endsWith('/rating') && request.method() === 'PATCH') {
      const body = request.postDataJSON();
      const ratedAt = new Date().toISOString();
      Object.assign(state.booking, { ...body, ratedAt });
      state.event = { id: 'rated-event', title: 'New customer feedback', message: `Tanvir Ahmed rated Laptop Motherboard Diagnosis ${body.rating}/5: ${body.review}`, createdAt: ratedAt, href: '/dashboard/technician/requests' };
      return json({ message: 'Thank you for your feedback' });
    }
    if (p.startsWith('/api/notifications')) {
      const snapshot = { enabled: state.enabled, readAt: '1970-01-01T00:00:00.000Z', unreadCount: state.event ? 1 : 0, items: state.event ? [state.event] : [] };
      if (p.endsWith('/stream')) return route.fulfill({ contentType: 'text/event-stream', body: `event: notifications\ndata: ${JSON.stringify(snapshot)}\n\n` });
      return json(snapshot);
    }
    if (p === '/api/admin/payments') {
      if (state.failPayments) return route.fulfill({ status: 503, json: { message: 'Temporary payment error' } });
      return json({ payments: state.payments, totalRevenue: state.payments.reduce((sum, item) => sum + item.amount, 0) });
    }
    return route.continue();
  });
  return { context, page, errors };
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const mobile of [false, true]) {
      const state = fixture();
      state.enabled = !mobile; // Table updates must work with live alerts paused.
      const tech = await open(browser, 'technician', state, mobile);
      const customer = await open(browser, 'customer', state, mobile);
      await tech.page.goto(`${baseURL}/dashboard/technician/requests`);
      await tech.page.getByText('Awaiting customer feedback', { exact: true }).waitFor();
      await tech.page.getByText('Previously saved feedback', { exact: true }).waitFor();
      await customer.page.goto(`${baseURL}/dashboard/customer/bookings`);
      await customer.page.getByRole('button', { name: 'Rate this job', exact: true }).click();
      await customer.page.getByRole('button', { name: 'Rate 5 stars', exact: true }).click();
      await customer.page.locator('#review').fill('He actually done a good job. Highly recommended.');
      await customer.page.getByRole('button', { name: 'Submit Rating', exact: true }).click();
      await customer.page.getByRole('dialog').waitFor({ state: 'hidden' });
      await tech.page.bringToFront();
      await tech.page.getByRole('cell', { name: /He actually done a good job/ }).waitFor({ timeout: 12_000 });
      await tech.page.getByRole('img', { name: 'Customer rating 5 out of 5 stars', exact: true }).waitFor();
      if (state.enabled) await tech.page.getByText('New customer feedback', { exact: true }).waitFor({ timeout: 10_000 });
      state.failBookings = true;
      const requestError = tech.page.getByRole('alert').filter({ hasText: 'Could not load the latest requests.' });
      await requestError.waitFor({ timeout: 10_000 });
      assert.equal(await tech.page.getByText('Previously saved feedback', { exact: true }).isVisible(), true);
      state.failBookings = false;
      await tech.page.getByRole('button', { name: 'Retry', exact: true }).click();
      await requestError.waitFor({ state: 'hidden' });
      await tech.page.getByRole('combobox').click();
      await tech.page.getByRole('option', { name: 'Requested', exact: true }).click();
      await tech.page.getByText('No requests in this filter', { exact: true }).waitFor();
      await tech.page.getByRole('combobox').click();
      await tech.page.getByRole('option', { name: 'Completed', exact: true }).click();
      await tech.page.getByText('Previously saved feedback', { exact: true }).waitFor();
      assert.ok(await tech.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Mobile document must not overflow horizontally');
      assert.deepEqual(tech.errors, []);
      assert.deepEqual(customer.errors, []);
      await tech.context.close();
      await customer.context.close();
      console.log(`PASS review ${mobile ? 'mobile, alerts off' : 'desktop, alerts on'}: customer submits, technician sees stars and text without reload, legacy feedback, filter, error recovery`);
    }

    const state = fixture();
    state.failPayments = true;
    const admin = await open(browser, 'admin', state);
    await admin.page.goto(`${baseURL}/dashboard/admin/transactions`);
    await admin.page.getByRole('alert').waitFor();
    assert.equal(await admin.page.getByText('$0.00', { exact: true }).count(), 0);
    state.failPayments = false;
    await admin.page.getByRole('button', { name: 'Retry', exact: true }).click();
    await admin.page.getByText('$80.00', { exact: true }).waitFor();
    await admin.page.getByRole('cell', { name: 'pi_seed_demo_transaction', exact: true }).waitFor();
    state.payments.push({ ...state.payments[0], _id: 'p3', amount: 40, transactionId: 'pi_new_payment' });
    await admin.page.getByRole('cell', { name: 'pi_new_payment', exact: true }).waitFor({ timeout: 12_000 });
    await admin.page.getByText('$120.00', { exact: true }).waitFor();
    assert.equal(await admin.page.getByRole('columnheader').count(), 6);
    assert.deepEqual(admin.errors, []);
    await admin.context.close();
    console.log('PASS transactions: initial error and retry, actual fields, demo record retained, new payment and revenue update without reload');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
