const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const baseURL = process.env.AUDIT_BASE_URL || 'http://localhost:3019';
const output = path.resolve(__dirname, '../.responsive-review');
fs.mkdirSync(output, { recursive: true });
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
const photo = { name: 'private-name-should-never-appear.png', mimeType: 'image/png', buffer: pixel };
const results = [];
async function contextFor(browser, role, size) {
  const context = await browser.newContext({ viewport: size });
  if (role) await context.addCookies([{ name: 'audit_role', value: role, url: baseURL }]);
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.pathname === '/_next/image' || ['i.ibb.co', 'images.unsplash.com'].includes(url.hostname)
      ? route.fulfill({ contentType: 'image/png', body: pixel }) : route.continue();
  });
  return context;
}
async function bounds(page, locator, label) {
  await locator.waitFor();
  await page.waitForTimeout(220);
  const r = await locator.boundingBox();
  const size = page.viewportSize();
  assert.ok(r && r.x >= -1 && r.y >= -1 && r.x + r.width <= size.width + 1 && r.y + r.height <= size.height + 1, `${label} must fit ${size.width}x${size.height}: ${JSON.stringify(r)}`);
  await page.screenshot({ path: path.join(output, `${size.width}x${size.height}-${label.replace(/[^a-z0-9]/gi, '_')}.png`), fullPage: false });
  results.push({ width: size.width, height: size.height, interaction: label, status: 'pass' });
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const size of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 844, height: 390 }]) {
      for (const role of ['admin', 'customer', 'technician']) {
        const context = await contextFor(browser, role, size);
        const page = await context.newPage();
        await page.goto(`${baseURL}/dashboard/profile`);
        await page.locator('#profile-image').waitFor({ state: 'attached' });
        await page.getByRole('button', { name: 'Open account menu', exact: true }).click();
        await bounds(page, page.getByRole('menu'), `${role}-account-menu`);
        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: /^Notifications/ }).click();
        await bounds(page, page.getByRole('dialog'), `${role}-notifications`);
        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: 'Open dashboard navigation', exact: true }).click();
        const drawer = page.getByRole('dialog');
        await bounds(page, drawer, `${role}-navigation`);
        await drawer.getByRole('link', { name: 'Update Profile', exact: true }).click();
        await drawer.waitFor({ state: 'hidden' });
        await page.getByRole('button', { name: 'Open dashboard navigation', exact: true }).click();
        await page.setViewportSize({ width: 1366, height: 900 });
        await drawer.waitFor({ state: 'hidden' });
        await page.setViewportSize(size);
        // Native input stays available to assistive tools but its filename is never visible.
        const chooser = page.waitForEvent('filechooser');
        await page.getByRole('button', { name: 'Change photo', exact: true }).click();
        await (await chooser).setFiles(photo);
        await page.getByText('New photo ready to save', { exact: true }).waitFor();
        assert.equal(await page.getByText(photo.name, { exact: false }).count(), 0);
        assert.equal(await page.locator('#profile-image').evaluate(input => getComputedStyle(input).position), 'absolute');
        await page.getByRole('button', { name: 'Discard selected photo', exact: true }).click();
        assert.equal(await page.locator('#profile-image').evaluate(input => input.files.length), 0);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await context.close();
      }

      const tech = await contextFor(browser, 'technician', size);
      const page = await tech.newPage();
      await page.goto(`${baseURL}/dashboard/technician/my-services`);
      await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
      await bounds(page, page.getByRole('dialog'), 'edit-service');
      await page.locator('#edit-image').setInputFiles(photo);
      await page.getByText('New photo ready to save', { exact: true }).waitFor();
      assert.equal(await page.getByText(photo.name, { exact: false }).count(), 0);
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Delete', exact: true }).first().click();
      await bounds(page, page.getByRole('dialog'), 'delete-service');
      await page.keyboard.press('Escape');
      await page.goto(`${baseURL}/dashboard/technician/requests`);
      await page.getByRole('button', { name: 'Mark Completed', exact: true }).click();
      await bounds(page, page.getByRole('dialog'), 'complete-job');
      await page.keyboard.press('Escape');
      await page.goto(`${baseURL}/dashboard/technician/add-service`);
      await page.locator('#image').setInputFiles(photo);
      assert.equal(await page.getByText(photo.name, { exact: false }).count(), 0);
      await page.getByRole('combobox').first().click();
      await bounds(page, page.getByRole('listbox'), 'category-select');
      await page.keyboard.press('Escape');
      await tech.close();

      const customer = await contextFor(browser, 'customer', size);
      const customerPage = await customer.newPage();
      await customerPage.goto(`${baseURL}/services/507f1f77bcf86cd799439011`);
      await customerPage.getByRole('button', { name: 'Request Repair', exact: true }).click();
      await bounds(customerPage, customerPage.getByRole('dialog'), 'request-repair');
      await customerPage.keyboard.press('Escape');
      await customerPage.goto(`${baseURL}/dashboard/customer/bookings`);
      await customerPage.getByRole('button', { name: 'Cancel', exact: true }).first().click();
      await bounds(customerPage, customerPage.getByRole('dialog'), 'cancel-booking');
      await customerPage.keyboard.press('Escape');
      await customerPage.getByRole('button', { name: 'Rate this job', exact: true }).click();
      await bounds(customerPage, customerPage.getByRole('dialog'), 'rate-job');
      await customerPage.keyboard.press('Escape');
      await customerPage.getByRole('button', { name: 'Show booking details', exact: true }).first().click();
      assert.ok(await customerPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await customer.close();

      if (size.width < 768) {
        const guest = await contextFor(browser, null, size);
        const guestPage = await guest.newPage();
        await guestPage.goto(`${baseURL}/`);
        await guestPage.getByRole('button', { name: 'Open navigation menu', exact: true }).click();
        await bounds(guestPage, guestPage.getByRole('dialog'), 'public-navigation');
        await guestPage.getByRole('dialog').getByRole('link', { name: 'Services', exact: true }).click();
        await guestPage.getByRole('dialog').waitFor({ state: 'hidden' });
        await guestPage.waitForURL('**/services');
        await guest.close();
      }
      const states = await contextFor(browser, null, size);
      const statePage = await states.newPage();
      await statePage.goto(`${baseURL}/services?search=audit-slow`, { waitUntil: 'commit' });
      await statePage.locator('[data-slot="skeleton"]').first().waitFor();
      assert.ok(await statePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Loading skeletons must fit');
      results.push({ ...size, interaction: 'services-loading-state', status: 'pass' });
      await statePage.getByRole('heading', { name: 'Browse Services', exact: true }).waitFor();
      await statePage.goto(`${baseURL}/services?search=audit-error`);
      await statePage.getByRole('heading', { name: 'Something went wrong', exact: true }).waitFor();
      assert.ok(await statePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Error page must fit');
      results.push({ ...size, interaction: 'error-boundary-state', status: 'pass' });
      await states.close();
      console.log(`PASS interactions ${size.width}x${size.height}`);
    }
  } finally { await browser.close(); fs.writeFileSync(path.join(output, 'interactions.json'), JSON.stringify(results, null, 2)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
