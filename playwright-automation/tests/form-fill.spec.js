const { test, expect } = require('@playwright/test');
const FormPage = require('../pages/FormPage');
const { generateJapaneseUser } = require('../utils/generator');

test.describe('Form Automation Test Suite', () => {
  test('should fill out and submit the form with random Japanese identity', async ({ page }) => {
    const formPage = new FormPage(page);

    const { fullName, email, gender, age, area, occupation } = generateJapaneseUser();
    console.log(`Name: ${fullName} | Email: ${email} | Gender: ${gender} | Age: ${age} | Area: ${area} | Job: ${occupation}`);

    await formPage.open(process.env.BASE_URL);

    await formPage.fillForm(fullName, email, gender, age, area, occupation);


  });
});
