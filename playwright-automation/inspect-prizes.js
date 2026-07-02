require('dotenv').config();
const { chromium } = require('playwright');
const { generateJapaneseUser, generateAIAnswer } = require('./utils/generator');
const FormPage = require('./pages/FormPage');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const formPage = new FormPage(page);

  const user = generateJapaneseUser();
  console.log('User:', user.fullName);

  await formPage.open(process.env.BASE_URL);
  await formPage.fillPage1(user);
  await formPage.clickNext();

  let pageNum = 2;
  while (true) {
    // Log prize options on this page BEFORE filling
    const listitems = await page.locator('[role="listitem"]').all();
    for (const item of listitems) {
      const heading = await item.evaluate(el => el.querySelector('[role="heading"]')?.textContent?.trim() ?? '');
      if (!heading.includes('第一希望') && !heading.includes('第二希望')) continue;

      const listbox = item.locator('[role="listbox"]').first();
      if (!await listbox.isVisible().catch(() => false)) continue;

      await listbox.click();
      await page.waitForTimeout(800);
      const options = await page.evaluate(() =>
        [...document.querySelectorAll('[role="option"]')]
          .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
          .map(el => el.textContent.trim())
      );
      console.log(`\n=== [Page ${pageNum}] ${heading} ===`);
      options.forEach(o => console.log(' ', o));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }

    const isLast = await page.locator('[role="button"][jsname="M2UYVd"]').count() > 0
      || await page.locator('[role="button"]:has-text("送信")').count() > 0;

    // Fill the page (needed to advance)
    await formPage.fillCurrentPage(generateAIAnswer);

    if (isLast) { console.log('\nLast page — stopping before submit.'); break; }

    await formPage.clickNext();
    if (++pageNum > 20) break;
  }

  await browser.close();
  console.log('Done.');
})();
