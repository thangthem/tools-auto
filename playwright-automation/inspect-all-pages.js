const { chromium } = require('playwright');
require('dotenv').config();

async function inspectPage(page, pageNum) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`PAGE ${pageNum}`);
  console.log('='.repeat(60));

  // Text inputs
  const inputs = await page.locator('input[type="text"], input:not([type])').all();
  console.log(`\n[TEXT INPUTS] count=${inputs.length}`);
  for (let i = 0; i < inputs.length; i++) {
    const placeholder = await inputs[i].getAttribute('placeholder').catch(() => '');
    const ariaLabel = await inputs[i].getAttribute('aria-label').catch(() => '');
    const isVisible = await inputs[i].isVisible().catch(() => false);
    console.log(`  input[${i}]: placeholder="${placeholder}" aria-label="${ariaLabel}" visible=${isVisible}`);
  }

  // Textareas
  const textareas = await page.locator('textarea').all();
  console.log(`\n[TEXTAREAS] count=${textareas.length}`);
  for (let i = 0; i < textareas.length; i++) {
    const isVisible = await textareas[i].isVisible().catch(() => false);
    const questionText = await textareas[i].evaluate(el => {
      const item = el.closest('[role="listitem"]');
      const heading = item?.querySelector('[role="heading"]');
      return heading?.textContent?.trim() ?? '(no heading)';
    }).catch(() => '');
    console.log(`  textarea[${i}]: visible=${isVisible} question="${questionText.substring(0, 80)}"`);
  }

  // Radio groups
  const radioGroups = await page.locator('[role="radiogroup"]').all();
  console.log(`\n[RADIO GROUPS] count=${radioGroups.length}`);
  for (let i = 0; i < radioGroups.length; i++) {
    const radios = await radioGroups[i].locator('[role="radio"]').all();
    const labels = [];
    for (const r of radios) {
      labels.push(await r.getAttribute('aria-label').catch(() => '?'));
    }
    console.log(`  radiogroup[${i}]: options=[${labels.join(', ')}]`);
  }

  // Checkbox groups
  const checkboxGroups = await page.locator('[role="group"]').all();
  console.log(`\n[CHECKBOX GROUPS (role=group)] count=${checkboxGroups.length}`);
  for (let i = 0; i < checkboxGroups.length; i++) {
    const boxes = await checkboxGroups[i].locator('[role="checkbox"]').all();
    if (!boxes.length) continue;
    const labels = [];
    for (const b of boxes) {
      labels.push(await b.getAttribute('aria-label').catch(() => '?'));
    }
    const questionText = await checkboxGroups[i].evaluate(el => {
      const item = el.closest('[role="listitem"]');
      const heading = item?.querySelector('[role="heading"]');
      return heading?.textContent?.trim() ?? '(no heading)';
    }).catch(() => '');
    console.log(`  group[${i}] question="${questionText.substring(0, 60)}":`);
    console.log(`    options=[${labels.slice(0, 5).join(', ')}${labels.length > 5 ? '...' : ''}]`);
  }

  // Dropdowns / listboxes
  const dropdowns = await page.locator('[role="listbox"], select').all();
  console.log(`\n[DROPDOWNS] count=${dropdowns.length}`);

  // All buttons
  const buttons = await page.locator('[role="button"]').all();
  console.log(`\n[BUTTONS] count=${buttons.length}`);
  for (const btn of buttons) {
    const text = await btn.textContent().catch(() => '');
    const jsname = await btn.getAttribute('jsname').catch(() => '');
    console.log(`  button: text="${text.trim().substring(0, 40)}" jsname="${jsname}"`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL);
  await page.waitForTimeout(2000);

  // Inspect page 1
  await inspectPage(page, 1);

  // Fill page 1 minimally to navigate
  await page.locator('//*[@id="mG61Hd"]/div[2]/div/div[2]/div[1]/div/div/div[2]/div/div[1]/div/div[1]/input').fill('山田 太郎');
  await page.locator('//*[@id="mG61Hd"]/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div[1]/div/div[1]/input').fill('test@example.com');
  await page.locator('[role="radio"][aria-label="男性"]').click();
  await page.locator('[role="radio"][aria-label="30代"]').click();
  await page.locator('[role="radio"][aria-label="ベトナム南部"]').click();
  await page.locator('[role="radio"][aria-label="学生"]').click();
  await page.locator('[role="button"][jsname="OCpkoe"]').click();
  await page.waitForTimeout(1500);

  // Inspect page 2
  await inspectPage(page, 2);
  await page.locator('[role="button"][jsname="OCpkoe"]').click();
  await page.waitForTimeout(1500);

  // Inspect page 3
  await inspectPage(page, 3);
  await page.locator('[role="button"][jsname="OCpkoe"]').click();
  await page.waitForTimeout(1500);

  // Inspect page 4
  await inspectPage(page, 4);
  await page.locator('[role="button"][jsname="OCpkoe"]').click();
  await page.waitForTimeout(1500);

  // Inspect page 5
  await inspectPage(page, 5);

  await browser.close();
})();
