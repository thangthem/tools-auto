const BasePage = require('./BasePage');

class FormPage extends BasePage {
  constructor(page) {
    super(page);
    this.nameXPath = '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[1]/div/div/div[2]/div/div[1]/div/div[1]/input';
    this.emailXPath = '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div[1]/div/div[1]/input';
    this.nextBtn = '[role="button"][jsname="OCpkoe"]';
    this.submitBtn = '[role="button"][jsname="M2UYVd"]';
  }

  async open(url) {
    await this.navigateTo(url);
    await this.page.waitForTimeout(2000);
  }

  // Page 1: specific selectors for name/email + radio groups
  async fillPage1({ fullName, email, gender, age, area, occupation }) {
    await this.page.locator(this.nameXPath).fill(fullName);
    await this.page.locator(this.emailXPath).fill(email);
    await this.selectRadio(gender);
    await this.selectRadio(age);
    await this.selectRadio(area);
    await this.selectRadio(occupation);
  }

  // Helper: get heading text from a listitem via evaluate() — no Playwright timeout
  async _getHeading(itemHandle) {
    return itemHandle.evaluate(el => {
      return el.querySelector('[role="heading"]')?.textContent?.trim() ?? '';
    }).catch(() => '');
  }

  // Fill textarea elements (long-answer questions)
  async fillTextareas(generateAIAnswer) {
    const listitems = await this.page.locator('[role="listitem"]').all();
    for (const item of listitems) {
      const heading = await this._getHeading(item);
      if (!heading) continue;
      const tas = await item.locator('textarea').all();
      for (const ta of tas) {
        if (!await ta.isVisible().catch(() => false)) continue;
        const answer = await generateAIAnswer(heading);
        await ta.fill(answer).catch(() => { });
        await this.page.waitForTimeout(200);
      }
    }
  }

  // Fill short-answer input[type="text"] inside question listitems
  // Skips "Câu trả lời khác" (Other-option inputs attached to radio groups)
  async fillTextInputs(generateAIAnswer) {
    const listitems = await this.page.locator('[role="listitem"]').all();
    for (const item of listitems) {
      const heading = await this._getHeading(item);
      if (!heading) continue; // not a question container

      const inputs = await item.locator('input[type="text"]').all();
      for (const input of inputs) {
        // Skip "Câu trả lời khác" (Other) inputs on radio groups
        const ariaLabel = await input.getAttribute('aria-label').catch(() => '');
        if (ariaLabel === 'Câu trả lời khác') continue;
        if (!await input.isVisible().catch(() => false)) continue;

        const answer = await generateAIAnswer(heading);
        // Use short timeout so a non-actionable input fails fast instead of waiting 30s
        await input.fill(answer, { timeout: 5000 }).catch(e =>
          console.warn(`[TextInput] Skip "${heading.substring(0, 40)}": ${e.message.split('\n')[0]}`)
        );
        await this.page.waitForTimeout(200);
      }
    }
  }

  // Click each listbox dropdown and pick a random valid option
  async fillListboxes() {
    const listitems = await this.page.locator('[role="listitem"]').all();
    for (const item of listitems) {
      const listboxCount = await item.locator('[role="listbox"]').count();
      if (!listboxCount) continue;

      const listbox = item.locator('[role="listbox"]').first();
      if (!await listbox.isVisible().catch(() => false)) continue;

      const heading = await this._getHeading(item);

      // Click to open the dropdown
      await listbox.click();
      await this.page.waitForTimeout(700);

      // Run everything inside evaluate() to avoid race condition between
      // isVisible() check and click() — both happen synchronously in browser
      const chosen = await this.page.evaluate(() => {
        const opts = [...document.querySelectorAll('[role="option"]')].filter(el => {
          const r = el.getBoundingClientRect();
          // Must be inside the viewport and have real dimensions
          return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < window.innerHeight;
        });
        const valid = opts.filter(el => {
          // Filter by data-value: placeholder "Chọn" always has data-value=""
          const val = (el.getAttribute('data-value') || '').trim();
          return val !== '';
        });
        if (!valid.length) return null;
        const pick = valid[Math.floor(Math.random() * valid.length)];
        pick.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return pick.textContent.trim();
      });

      if (chosen) {
        console.log(`[Listbox] "${heading.substring(0, 40)}" → "${chosen}"`);
      } else {
        console.warn(`[Listbox] No visible options for: ${heading.substring(0, 40)}`);
        await this.page.keyboard.press('Escape');
      }
      await this.page.waitForTimeout(400);
    }
  }

  // Select random option in every radio group
  async fillRadios() {
    const groups = await this.page.locator('[role="radiogroup"]').all();
    for (const group of groups) {
      const radios = await group.locator('[role="radio"]').all();
      if (!radios.length) continue;
      const choice = radios[Math.floor(Math.random() * radios.length)];
      if (await choice.isVisible().catch(() => false)) {
        await choice.click();
        await this.page.waitForTimeout(200);
      }
    }
  }

  // Select 1–3 random checkboxes per group
  async fillCheckboxes() {
    const groups = await this.page.locator('[role="group"]').all();
    for (const group of groups) {
      const boxes = await group.locator('[role="checkbox"]').all();
      if (!boxes.length) continue;
      const count = Math.floor(Math.random() * Math.min(3, boxes.length)) + 1;
      const shuffled = [...boxes].sort(() => Math.random() - 0.5).slice(0, count);
      for (const box of shuffled) {
        if (await box.isVisible().catch(() => false)) {
          await box.click();
          await this.page.waitForTimeout(150);
        }
      }
    }
  }

  // Select a specific option in a listbox matched by heading keyword
  // headingContains: partial match for the question heading
  // optionContains:  partial match for the option text/data-value
  async selectListboxOption(headingContains, optionContains) {
    const listitems = await this.page.locator('[role="listitem"]').all();
    for (const item of listitems) {
      const heading = await this._getHeading(item);
      if (!heading.includes(headingContains)) continue;

      const listbox = item.locator('[role="listbox"]').first();
      if (!await listbox.isVisible().catch(() => false)) continue;

      await listbox.click();
      await this.page.waitForTimeout(700);

      const chosen = await this.page.evaluate((keyword) => {
        // No viewport constraint — search all rendered options regardless of scroll position
        const opts = [...document.querySelectorAll('[role="option"]')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });
        const match = opts.find(el =>
          (el.getAttribute('data-value') || '').includes(keyword) ||
          el.textContent.includes(keyword)
        );
        if (!match) return null;
        match.scrollIntoView({ block: 'nearest', behavior: 'instant' });
        match.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return match.textContent.trim();
      }, optionContains);

      if (chosen) {
        console.log(`[Override] "${headingContains}" → "${chosen}"`);
      } else {
        console.warn(`[Override] Option containing "${optionContains}" not found in "${headingContains}"`);
        await this.page.keyboard.press('Escape');
      }
      await this.page.waitForTimeout(400);
      return;
    }
    console.warn(`[Override] Listbox with heading "${headingContains}" not found`);
  }

  // Generic handler for pages 2–5
  async fillCurrentPage(generateAIAnswer) {
    await this.fillTextareas(generateAIAnswer);
    await this.fillTextInputs(generateAIAnswer);
    await this.fillRadios();
    await this.fillCheckboxes();
    await this.fillListboxes();
  }

  async clickNext() {
    await this.page.locator(this.nextBtn).click();
    await this.page.waitForTimeout(1500);
  }

  async isLastPage() {
    if (await this.page.locator(this.submitBtn).count() > 0) return true;
    return (await this.page.locator('[role="button"]:has-text("送信")').count()) > 0;
  }

  async submit() {
    const byJsname = this.page.locator(this.submitBtn);
    if (await byJsname.count() > 0) {
      await byJsname.click();
    } else {
      await this.page.locator('[role="button"]:has-text("送信")').click();
    }
    await this.page.waitForTimeout(2000);
  }

  async fillForm(fullName, email, gender, age, area, occupation) {
    const { generateAIAnswer } = require('../utils/generator');
    const { logSubmission } = require('../utils/logger');

    await this.fillPage1({ fullName, email, gender, age, area, occupation });
    await this.clickNext();

    while (!(await this.isLastPage())) {
      await this.fillCurrentPage(generateAIAnswer);
      await this.selectListboxOption('第一希望', 'B-9');
      await this.clickNext();
    }

    await this.fillCurrentPage(generateAIAnswer);
    await this.selectListboxOption('第一希望', 'B-9');
    await this.submit();
    logSubmission(fullName, email);
  }
}

module.exports = FormPage;
