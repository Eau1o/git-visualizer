const { chromium } = require('/home/admin_wsl/.nvm/versions/node/v22.18.0/lib/node_modules/@playwright/cli/node_modules/playwright-core');

const URL = 'http://172.23.229.156:5173/';

async function snapshot(page, name) {
  const html = await page.evaluate(() => document.body.innerText.substring(0, 800));
  console.log(`\n=== ${name} ===`);
  console.log(`Page text:\n${html}\n`);
}

async function ss(page, path) {
  try { await page.screenshot({ path, timeout: 3000 }); }
  catch(e) { console.log(`  Screenshot skip: ${path}`); }
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function clickCommand(page, label) {
  const terminal = page.locator('div.bg-terminal');
  const btn = terminal.locator('button', { hasText: label });
  const visible = await btn.isVisible();
  const enabled = await btn.isEnabled();
  console.log(`Terminal button "${label}": visible=${visible}, enabled=${enabled}`);
  if (visible && enabled) {
    await btn.click();
    return true;
  }
  return false;
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/admin_wsl/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome',
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => {
    pageErrors.push(err.message);
    console.log('  🔥 PAGE ERROR:', err.message);
  });

  console.log('=== Starting Git Visualizer Test ===\n');

  // Block Google Fonts to avoid timeouts
  await page.route('**/fonts.googleapis.com/**', route => route.abort());
  await page.route('**/fonts.gstatic.com/**', route => route.abort());

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await wait(1000);
  await snapshot(page, 'Initial Load');
  await ss(page, '/tmp/test-00-initial.png');

  // Step 1: git init
  console.log('--- Step 1: git init ---');
  let ok = await clickCommand(page, 'git init');
  if (ok) {
    console.log('  Clicked init, waiting 500ms...');
    await wait(500);
    await ss(page, '/tmp/test-01a-playing.png');
    const textNow = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log(`  After 500ms:\n${textNow}`);
    console.log('  Waiting 3.5s for full animation + step delay...');
    await wait(3500);
  }
  await snapshot(page, 'After init (3.5s)');
  await ss(page, '/tmp/test-01-after-init.png');

  // Diagnostic: check step states via CSS classes
  const stepDiag = await page.evaluate(() => {
    const steps = document.querySelectorAll('aside:first-of-type button, aside button');
    const result = [];
    steps.forEach((b, i) => {
      const text = (b.textContent || '').replace(/\s+/g, ' ').trim().substring(0, 50);
      const cls = b.className.replace(/transition-all duration-\d+/g, '').trim();
      result.push(`  [${i}] "${text}" → ${cls.substring(0, 80)}`);
    });
    return result.join('\n');
  });
  console.log(`Step panel:\n${stepDiag}`);

  // Step 2: git add
  console.log('--- Step 2: git add ---');
  ok = await clickCommand(page, 'git add');
  if (ok) {
    await wait(3500);
  }
  await snapshot(page, 'After add');
  await ss(page, '/tmp/test-02-after-add.png');

  // Step 3: git commit
  console.log('--- Step 3: git commit ---');
  ok = await clickCommand(page, 'git commit');
  if (ok) {
    await wait(3500);
  }
  await snapshot(page, 'After commit');
  await ss(page, '/tmp/test-03-after-commit.png');

  // Step 4: git add (for new files)
  console.log('--- Step 4: git add ---');
  ok = await clickCommand(page, 'git add');
  if (ok) {
    await wait(3500);
  }
  await snapshot(page, 'After 2nd add');
  await ss(page, '/tmp/test-04-after-2nd-add.png');

  // Step 5: git commit
  console.log('--- Step 5: git commit ---');
  ok = await clickCommand(page, 'git commit');
  if (ok) {
    await wait(3500);
  }
  await snapshot(page, 'After 2nd commit');
  await ss(page, '/tmp/test-05-after-2nd-commit.png');

  // Step 6: git status
  console.log('--- Step 6: git status ---');
  ok = await clickCommand(page, 'git status');
  if (ok) await wait(500);
  await snapshot(page, 'After status');

  // Step 7: git log
  console.log('--- Step 7: git log ---');
  ok = await clickCommand(page, 'git log');
  if (ok) await wait(500);
  await snapshot(page, 'After log (final)');

  await ss(page, '/tmp/test-final.png');

  console.log('\n=== Console errors ===');
  for (const err of consoleErrors) {
    console.log(`  ERROR: ${err}`);
  }
  if (consoleErrors.length === 0) console.log('  None found ✅');

  console.log('\n=== Page errors ===');
  for (const err of pageErrors) {
    console.log(`  🔥 ${err}`);
  }
  if (pageErrors.length === 0) console.log('  None found ✅');

  console.log('\n=== Test Complete ===');
  await browser.close();
}

run().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
