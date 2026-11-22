const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const baseURL = process.env.AUDIT_BASE_URL || 'http://localhost:3019';
const output = path.resolve(__dirname, '../.responsive-review');
fs.mkdirSync(output, { recursive: true });
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const app = path.resolve(__dirname, '../src/app');
const routes = walk(app).filter(file => path.basename(file) === 'page.tsx').map(file => '/' + path.relative(app, path.dirname(file)).split(path.sep).filter(part => part && !part.startsWith('(')).join('/'));
const cases = routes.flatMap(route => {
  const actual = route.replace('[id]', '507f1f77bcf86cd799439011').replace('[email]', 'technician%40example.test');
  const role = /\/dashboard\/(admin|customer|technician)/.exec(route)?.[1] || (route.startsWith('/payment/') ? 'customer' : null);
  return route === '/dashboard/profile' ? ['admin', 'customer', 'technician'].map(role => ({ route: actual, role })) : [{ route: actual, role }];
});
cases.push(
  { route: '/services?search=empty', role: null },
  { route: '/services/missing', role: null },
  { route: '/technicians/missing', role: null },
  { route: '/unknown-page', role: null },
  { route: '/payment/success?session_id=invalid', role: 'customer' },
  { route: '/payment/success?session_id=cs_audit', role: 'customer' },
);
const widths = process.env.AUDIT_WIDTHS ? process.env.AUDIT_WIDTHS.split(',').map(Number) : [320, 390, 768, 1024, 1366, 1920];
const results = [];

async function metrics(page) {
  return page.evaluate(() => {
    const viewport = innerWidth;
    const rect = element => { const r = element.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; };
    const aside = document.querySelector('aside');
    const main = document.querySelector('main');
    const sidebar = aside && getComputedStyle(aside).display !== 'none' ? rect(aside) : null;
    return {
      width: viewport, overflow: Math.max(0, document.documentElement.scrollWidth - viewport),
      font: getComputedStyle(document.body).fontFamily,
      sidebarOverlap: !!(sidebar && main && rect(main).left < sidebar.right - 1),
      offenders: [...document.querySelectorAll('body *')].filter(element => {
        const style = getComputedStyle(element), r = element.getBoundingClientRect();
        if (style.position === 'fixed' || style.display === 'none' || !r.width || style.visibility === 'hidden') return false;
        if (element.closest('[data-slot="table-container"], [data-slot="dropdown-menu-content"]')) return false;
        return r.right > viewport + 2 || r.left < -2;
      }).slice(0, 8).map(element => ({ tag: element.tagName, className: String(element.className).slice(0, 150), text: element.textContent?.slice(0, 70) })),
    };
  });
}

async function contextFor(browser, role, width) {
  const context = await browser.newContext({ viewport: { width, height: width === 768 ? 1024 : 900 } });
  if (role) await context.addCookies([{ name: 'audit_role', value: role, url: baseURL }]);
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/_next/image' || ['i.ibb.co', 'images.unsplash.com'].includes(url.hostname)) return route.fulfill({ contentType: 'image/png', body: pixel });
    return route.continue();
  });
  return context;
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of widths) {
      for (const testCase of cases) {
        const context = await contextFor(browser, testCase.role, width);
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        try {
          await page.goto(baseURL + testCase.route, { waitUntil: 'domcontentloaded' });
          await page.locator('h1').first().waitFor({ timeout: 15_000 });
          assert.equal(new URL(page.url()).pathname, new URL(baseURL + testCase.route).pathname, 'Page must not redirect to another route');
          await page.waitForTimeout(150);
          await page.evaluate(() => document.fonts.ready);
          const result = { route: testCase.route, role: testCase.role || 'guest', ...await metrics(page), errors };
          assert.ok(!result.font.includes('Times New Roman'), 'The application font must resolve on the body');
          const needsScreenshot = result.overflow || result.sidebarOverlap || (width === 390 && ['/', '/dashboard/profile', '/dashboard/technician/requests'].includes(testCase.route));
          if (needsScreenshot) await page.screenshot({ path: path.join(output, `${width}-${testCase.role || 'guest'}-${testCase.route.replace(/[^a-z0-9]/gi, '_')}.png`), fullPage: true });
          results.push(result);
          console.log(`${result.overflow || result.sidebarOverlap || errors.length ? 'FAIL' : 'PASS'} ${width} ${result.role} ${testCase.route} overflow=${result.overflow} overlap=${result.sidebarOverlap}`);
        } catch (error) {
          results.push({ route: testCase.route, role: testCase.role || 'guest', width, error: error.message });
          console.log(`FAIL ${width} ${testCase.route}: ${error.message.split('\n')[0]}`);
        } finally { await context.close(); }
      }
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(output, 'pages.json'), JSON.stringify({ discoveredRoutes: routes, results }, null, 2));
  console.log(`Covered ${routes.length} source routes, ${cases.length} page/role/state cases at ${widths.length} sizes.`);
  const failures = results.filter(result => result.error || result.overflow || result.sidebarOverlap || result.errors?.length);
  if (failures.length) console.log(JSON.stringify(failures, null, 2));
  assert.equal(failures.length, 0, `${failures.length} responsive failures; see .responsive-review/pages.json`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
