const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL);
  await page.waitForTimeout(2000);

  // Navigate to page 3
  const nameXpath = '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[1]/div/div/div[2]/div/div[1]/div/div[1]/input';
  const emailXpath = '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div[1]/div/div[1]/input';
  await page.locator(nameXpath).fill('山田 太郎');
  await page.locator(emailXpath).fill('test@test.com');
  await page.locator('[role="radio"][aria-label="男性"]').click();
  await page.locator('[role="radio"][aria-label="30代"]').click();
  await page.locator('[role="radio"][aria-label="ベトナム南部"]').click();
  await page.locator('[role="radio"][aria-label="学生"]').click();
  await page.locator('[role="button"][jsname="OCpkoe"]').click();
  await page.waitForTimeout(1500);
  await page.locator('[role="button"][jsname="OCpkoe"]').click();
  await page.waitForTimeout(1500);

  // Inspect all interactive elements on page 3
  const checkboxes = await page.locator('[role="checkbox"]').all();
  console.log(`Checkboxes: ${checkboxes.length}`);
  for (let i = 0; i < Math.min(checkboxes.length, 5); i++) {
    const label = await checkboxes[i].getAttribute('aria-label');
    console.log(`  checkbox[${i}]: ${label}`);
  }

  // Get all listitem questions with their titles
  const questions = await page.locator('[role="listitem"]').all();
  console.log(`\nTotal questions/listitems: ${questions.length}`);
  for (let i = 0; i < questions.length; i++) {
    const heading = await questions[i].locator('[role="heading"]').first().textContent().catch(() => '');
    if (heading) console.log(`  Q${i}: ${heading.trim().substring(0, 80)}`);
  }

  await browser.close();
})();
