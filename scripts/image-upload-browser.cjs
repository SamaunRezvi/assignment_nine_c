// Run against `npm run dev -- -p 3019` with Playwright available.
// PLAYWRIGHT_MODULE can point to an existing Playwright installation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

const baseURL = process.env.AUDIT_BASE_URL || 'http://localhost:3019';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
const uploadFile = { name: 'photo.png', mimeType: 'image/png', buffer: png };
const savedImage = 'https://i.ibb.co/audit/saved.png';

async function scenario(browser, role, mobile = false) {
  const context = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 } } : {});
  const page = await context.newPage();
  let user = { _id: 'audit-user', name: 'Image Audit', email: 'audit@example.test', role };
  let services = [{
    _id: '507f1f77bcf86cd799439011', title: 'Audit repair', category: 'Smartphone',
    description: 'Repair description', basePrice: 25, estimatedDuration: '2 hours',
    serviceMode: 'Home Visit', serviceArea: 'Dhaka', image: savedImage,
    technicianName: user.name, technicianEmail: user.email, approvalStatus: 'pending',
    isAvailable: true, createdAt: new Date().toISOString(),
  }];
  let uploadCount = 0;
  let writes = [];
  let failUpload = false;
  let uploadError = 'Profile upload rejected for audit';
  let failSave = false;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const json = data => route.fulfill({ json: data });
    if (url.hostname === 'i.ibb.co' || url.pathname === '/_next/image') {
      return route.fulfill({ contentType: 'image/png', body: png });
    }
    if (url.hostname === 'api.imgbb.com') {
      uploadCount++;
      assert.match(request.postDataBuffer().toString(), /photo\.png/);
      if (failUpload) return route.fulfill({ status: 400, json: { success: false, error: { message: uploadError } } });
      return json({ success: true, data: { url: savedImage } });
    }
    if (url.pathname.includes('/api/auth/get-session')) return json({
      session: { id: 'session', token: 'token', userId: user._id, expiresAt: '2099-01-01T00:00:00.000Z' },
      user: { ...user, id: user._id, emailVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    });
    if (url.pathname === '/api/jwt') return json({ token: 'audit-token' });
    if (url.pathname === '/api/users/me') return json(user);
    if (url.pathname === '/api/users/profile') {
      const body = request.postDataJSON();
      writes.push(body);
      if (failSave) return route.fulfill({ status: 500, json: { message: 'Save rejected for audit' } });
      user = { ...user, ...body };
      return json(user);
    }
    if (url.pathname === '/api/services/mine/list') return json(services);
    if (url.pathname.startsWith('/api/services') && ['POST', 'PATCH'].includes(request.method())) {
      const body = request.postDataJSON();
      writes.push(body);
      if (failSave) return route.fulfill({ status: 500, json: { message: 'Save rejected for audit' } });
      if (request.method() === 'POST') services.push({ ...services[0], ...body, _id: '507f1f77bcf86cd799439012' });
      else services[0] = { ...services[0], ...body };
      return json({ message: 'Saved' });
    }
    return route.continue();
  });

  await page.goto(`${baseURL}/dashboard/profile`);
  const profileFile = page.locator('#profile-image');
  await profileFile.waitFor();
  await profileFile.setInputFiles(uploadFile);
  await page.locator('img[src^="blob:"]').waitFor();
  await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
  await page.getByText('Profile updated successfully', { exact: true }).waitFor();
  assert.equal(writes.at(-1).image, savedImage);
  await page.waitForFunction(() => document.querySelector('#profile-image').files.length === 0);
  const countAfterSave = uploadCount;
  await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
  await page.waitForTimeout(300);
  assert.equal(uploadCount, countAfterSave, 'Saving text must not upload the same photo again');
  assert.equal(writes.at(-1).image, undefined);
  await page.reload();
  await page.locator('#profile-image').waitFor();
  await page.locator(`form img[src="${savedImage}"]`).waitFor();

  // Invalid selections are rejected before uploading.
  await profileFile.setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') });
  await page.getByText('Choose a JPG, PNG, WebP, or GIF image.', { exact: true }).waitFor();
  assert.equal(await profileFile.evaluate(input => input.files.length), 0);
  await profileFile.setInputFiles({ name: 'empty.png', mimeType: 'image/png', buffer: Buffer.alloc(0) });
  await page.getByText('This image is empty. Choose another file.', { exact: true }).waitFor();
  await profileFile.setInputFiles({ name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(10 * 1024 * 1024 + 1) });
  await page.getByText('Choose an image smaller than 10 MB.', { exact: true }).waitFor();
  assert.equal(uploadCount, countAfterSave);

  failUpload = true;
  await profileFile.setInputFiles(uploadFile);
  const previousWrites = writes.length;
  await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
  await page.getByText(uploadError, { exact: true }).waitFor();
  assert.equal(writes.length, previousWrites, 'Failed upload must not save a profile');
  failUpload = false;

  if (role === 'technician') {
    await page.goto(`${baseURL}/dashboard/technician/add-service`);
    await page.locator('#title').fill('New image repair');
    const selects = page.getByRole('combobox');
    await selects.nth(0).click();
    await page.getByRole('option', { name: 'Smartphone', exact: true }).click();
    await selects.nth(1).click();
    await page.getByRole('option', { name: 'Home Visit', exact: true }).click();
    await page.locator('#description').fill('Image upload audit');
    await page.locator('#basePrice').fill('30');
    await page.locator('#estimatedDuration').fill('1 hour');
    await page.locator('#serviceArea').fill('Dhaka');
    await page.locator('#image').setInputFiles(uploadFile);
    await page.locator('img[src^="blob:"]').waitFor();
    failUpload = true;
    uploadError = 'Add upload rejected for audit';
    const beforeAdd = writes.length;
    await page.getByRole('button', { name: 'Add Service', exact: true }).click();
    await page.getByText(uploadError, { exact: true }).waitFor();
    assert.equal(writes.length, beforeAdd);
    failUpload = false;
    await page.getByRole('button', { name: 'Add Service', exact: true }).click();
    await page.waitForURL('**/dashboard/technician/my-services');
    assert.equal(writes.at(-1).image, savedImage);

    await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
    const dialog = page.getByRole('dialog');
    await dialog.locator(`img[src="${savedImage}"]`).waitFor();
    const bounds = await dialog.boundingBox();
    assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= page.viewportSize().height, 'Edit form must fit in the viewport');
    // Saving other fields preserves the existing image.
    const beforeEditUpload = uploadCount;
    await dialog.getByRole('button', { name: 'Save Changes', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(uploadCount, beforeEditUpload);
    assert.equal(writes.at(-1).image, undefined);
    await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
    await dialog.locator('#edit-image').setInputFiles(uploadFile);
    await dialog.locator('img[src^="blob:"]').waitFor();
    failUpload = true;
    uploadError = 'Edit upload rejected for audit';
    const beforeFailedEdit = writes.length;
    await dialog.getByRole('button', { name: 'Save Changes', exact: true }).click();
    await page.getByText(uploadError, { exact: true }).waitFor();
    assert.equal(writes.length, beforeFailedEdit);
    failUpload = false;
    failSave = true;
    await dialog.getByRole('button', { name: 'Save Changes', exact: true }).click();
    await page.getByText('Save rejected for audit', { exact: true }).waitFor();
    assert.equal(await dialog.isVisible(), true, 'Failed save keeps the form open');
    failSave = false;
    await dialog.getByRole('button', { name: 'Save Changes', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(writes.at(-1).image, savedImage);
    await page.reload();
    await page.getByRole('button', { name: 'Edit', exact: true }).first().waitFor();
  }
  assert.deepEqual(errors, [], 'No browser runtime errors');
  console.log(`PASS ${role}${mobile ? ' mobile' : ''}: profile preview, save, reload, validation, upload failures${role === 'technician' ? ', add/edit preview and persistence, save failures' : ''}`);
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const role of ['admin', 'customer', 'technician']) await scenario(browser, role);
    await scenario(browser, 'technician', true);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
