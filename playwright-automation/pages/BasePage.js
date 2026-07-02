class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigateTo(path) {
    await this.page.goto(path);
  }

  async fillField(selector, value) {
    await this.page.locator(selector).fill(value);
  }

  async clickElement(selector) {
    await this.page.locator(selector).click();
  }

  async selectRadio(value) {
    await this.page.locator(`[role="radio"][aria-label="${value}"]`).click();
  }
}

module.exports = BasePage;
