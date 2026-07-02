const { chromium } = require('playwright');
require('dotenv').config();

async function inspectDropdownsOnPage(page, pageNum) {
  console.log(`\n${'='.repeat(60)}\nPAGE ${pageNum} — DEEP INSPECT\n${'='.repeat(60)}`);

  // Check if inputs on this page are inside listitem questions
  const listitems = await page.locator('[role="listitem"]').all();
  console.log(`\n[QUESTIONS (listitems)] count=${listitems.length}`);
  for (let i = 0; i < listitems.length; i++) {
    const heading = await listitems[i].locator('[role="heading"]').first().textContent().catch(() => '');
    if (!heading.trim()) continue;
    console.log(`\n  Q${i}: "${heading.trim().substring(0, 70)}"`);

    // Check input types inside
    const inputs = await listitems[i].locator('input').all();
    const textareas = await listitems[i].locator('textarea').all();
    const selects = await listitems[i].locator('select').all();
    const listboxes = await listitems[i].locator('[role="listbox"]').all();
    const radios = await listitems[i].locator('[role="radio"]').all();
    const checkboxes = await listitems[i].locator('[role="checkbox"]').all();

    if (inputs.length) {
      for (const inp of inputs) {
        const type = await inp.getAttribute('type').catch(() => '');
        const ariaLabel = await inp.getAttribute('aria-label').catch(() => '');
        console.log(`    → input type="${type}" aria-label="${ariaLabel}"`);
      }
    }
    if (textareas.length) console.log(`    → ${textareas.length} textarea(s)`);
    if (selects.length) {
      for (const sel of selects) {
        const options = await sel.locator('option').all();
        const vals = [];
        for (const opt of options) vals.push(await opt.textContent().catch(() => ''));
        console.log(`    → select options=[${vals.join(', ')}]`);
      }
    }
    if (listboxes.length) console.log(`    → ${listboxes.length} listbox(es)`);
    if (radios.length) console.log(`    → ${radios.length} radio(s)`);
    if (checkboxes.length) console.log(`    → ${checkboxes.length} checkbox(es)`);
  }

  // Log raw select elements with options
  const selects = await page.locator('select').all();
  console.log(`\n[ALL SELECT ELEMENTS] count=${selects.length}`);
  for (let i = 0; i < selects.length; i++) {
    const options = await selects[i].locator('option').all();
    const vals = [];
    for (const opt of options) vals.push(await opt.textContent().catch(() => ''));
    console.log(`  select[${i}]: options=[${vals.join(' | ')}]`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL);
  await page.waitForTimeout(2000);

  // Navigate through page 1 quickly
  await page.locator('//*[@id="mG61Hd"]/div[2]/div/div[2]/div[1]/div/div/div[2]/div/div[1]/div/div[1]/input').fill('山田 太郎');
  await page.locator('//*[@id="mG61Hd"]/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div[1]/div/div[1]/input').fill('test@example.com');
  await page.locator('[role="radio"][aria-label="男性"]').click();
  await page.locator('[role="radio"][aria-label="30代"]').click();
  await page.locator('[role="radio"][aria-label="ベトナム南部"]').click();
  await page.locator('[role="radio"][aria-label="学生"]').click();
  await page.locator('[role="button"][jsname="OCpkoe"]').click();
  await page.waitForTimeout(1500);

  // Deep inspect page 2
  await inspectDropdownsOnPage(page, 2);
  await page.locator('[role="button"][jsname="OCpkoe"]').click();
  await page.waitForTimeout(1500);

  // Deep inspect page 3
  await inspectDropdownsOnPage(page, 3);
  await page.locator('[role="button"][jsname="OCpkoe"]').click();
  await page.waitForTimeout(1500);

  // Deep inspect page 4
  await inspectDropdownsOnPage(page, 4);

  await browser.close();
})();
