import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3000'

test('admin create promotion', async ({ page }, testInfo) => {
  testInfo.setTimeout(60000);
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('chaiwat.duangdee@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  await expect(page.url()).toBe(`${baseURL}/admin/promotions`);
  await page.getByRole('button', { name: 'Create New Promotion' }).click();
  await expect(page.url()).toBe(`${baseURL}/admin/promotions/new`);
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('admin create promotion 1');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('admin create promotion ');
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).click();
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).fill('022');
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).fill('0200');
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).fill('01700');
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).click();
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).fill('4');
  await page.getByLabel('Select Provider').selectOption('6809bcb851d2828667fa50ae');
  await page.getByRole('textbox', { name: 'Select start date' }).click();
  await page.getByRole('option', { name: 'Choose Friday, April 25th,' }).click();
  await page.getByRole('textbox', { name: 'Select end date' }).click();
  await page.getByRole('option', { name: 'Choose Saturday, May 3rd,' }).click();
  await page.getByRole('button', { name: 'Create Promotion' }).click();
  await expect(page.url()).toBe(`${baseURL}/admin/promotions`);
  
  await expect(page.getByRole('heading', { name: 'admin create promotion 1' })).toBeVisible();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Are you sure you want to delete this promotion?'); 
    await dialog.accept(); 
  });
  await page.getByRole('button', { name: 'Delete' }).nth(2).click();
  await expect(page.getByRole('heading', { name: 'admin create promotion 1' })).toBeHidden();
  const found = await page.getByRole('heading', { name: 'admin create promotion 1' });
  expect(!found).toBe(false);
});



test('admin create promotion missing field' ,async ({ page }, testInfo) => {
  testInfo.setTimeout(60000);
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('chaiwat.duangdee@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions`);
  await page.getByRole('button', { name: 'Create New Promotion' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions/new`);
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('admin create promotion');
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).click();
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).fill('0110');
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).fill('0200');
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).fill('01500');
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).click();
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).fill('5');
  await page.getByLabel('Select Provider').selectOption('6809bcf551d2828667fa50b5');
  await page.getByRole('textbox', { name: 'Select start date' }).click();
  await page.getByRole('option', { name: 'Choose Tuesday, April 29th,' }).click();
  await page.getByRole('textbox', { name: 'Select end date' }).click();
  await page.getByRole('option', { name: 'Choose Saturday, May 3rd,' }).click();
  await page.getByRole('button', { name: 'Create Promotion' }).click();
  const isValid = await page.getByRole('textbox', { name: 'Description' }).evaluate((input: HTMLInputElement) => input.checkValidity());
  expect(!!isValid).toBe(false);
})




test(`admin create promotion provider doesn't exist` , async ({page}) => {
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('chaiwat.duangdee@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions`);
  await page.getByRole('button', { name: 'Create New Promotion' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions/new`);
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('admin create promotion');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('admin create promotion');
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).click();
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).fill('0110');
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).fill('0200');
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).fill('01500');
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).click();
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).fill('5');
  const found = await page.$('select[name="provider"] >> option[value="6803d1137380cd769971ce98"]');
  expect(!found).toBe(true);
})


test('admin create promotion over discount percentege' , async ({page}) => {
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('chaiwat.duangdee@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions`);
  await page.getByRole('button', { name: 'Create New Promotion' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions/new`);
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('admin create promotion');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('admin create promotion');
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).click();
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).fill('0110');
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).fill('0200');
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).fill('01500');
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).click();
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).fill('5');
  await page.getByLabel('Select Provider').selectOption('6809bcf551d2828667fa50b5');
  await page.getByRole('textbox', { name: 'Select start date' }).click();
  await page.getByRole('option', { name: 'Choose Tuesday, April 29th,' }).click();
  await page.getByRole('textbox', { name: 'Select end date' }).click();
  await page.getByRole('option', { name: 'Choose Saturday, May 3rd,' }).click();
  await page.getByRole('button', { name: 'Create Promotion' }).click();
  const isValid = await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).evaluate((input: HTMLInputElement) => input.checkValidity());
  expect(isValid).toBe(false);
})

test('admin delete promotion', async ({ page }, testInfo) => {
  testInfo.setTimeout(60000);
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('anan.panit@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions`);
  await page.getByRole('button', { name: 'Create New Promotion' }).click();
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('admin create promotion for delete');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('admin create promotion for delete');
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).click();
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).fill('020');
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).fill('0200');
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).fill('01500');
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).click();
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).fill('4');
  await page.getByLabel('Select Provider').selectOption('6809bcf551d2828667fa50b5');
  await page.getByRole('textbox', { name: 'Select start date' }).click();
  await page.getByRole('option', { name: 'Choose Friday, April 25th,' }).click();
  await page.getByRole('textbox', { name: 'Select end date' }).click();
  await page.getByRole('option', { name: 'Choose Saturday, May 3rd,' }).click();
  await page.getByRole('button', { name: 'Create Promotion' }).click();
  await expect(page.getByRole('heading', { name: 'admin create promotion for delete' })).toBeVisible();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Are you sure you want to delete this promotion?'); 
    await dialog.accept(); 
  });
  await page.getByRole('button', { name: 'Delete' }).nth(2).click();
  await expect(page.getByRole('heading', { name: 'admin create promotion for delete' })).toBeHidden();
});

test(`admin delete promotion but change his mind`, async ({ page }) => {
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('anan.panit@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions`);
  await expect(page.getByRole('heading', { name: 'firstTime' })).toBeVisible();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Are you sure you want to delete this promotion?'); 
    await dialog.dismiss(); 
  });
  await page.getByRole('button', { name: 'Delete' }).nth(0).click();
  await expect(page.getByRole('heading', { name: 'firstTime' })).toBeVisible();
});


test('admin edit promotion', async ({ page }, testInfo) => {
  testInfo.setTimeout(60000);
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('chaiwat.duangdee@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  await page.getByRole('button', { name: 'Create New Promotion' }).click();
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('admin edit promotion');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('admin edit promotion');
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).click();
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).fill('020');
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).fill('0200');
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).fill('01500');
  await page.getByLabel('Select Provider').selectOption('6809bcf551d2828667fa50b5');
  await page.getByRole('textbox', { name: 'Select start date' }).click();
  await page.getByRole('option', { name: 'Choose Friday, April 25th,' }).click();
  await page.getByRole('textbox', { name: 'Select end date' }).click();
  await page.getByRole('button', { name: 'Next Month' }).click();
  await page.getByRole('option', { name: 'Choose Thursday, May 22nd,' }).click();
  await page.getByRole('button', { name: 'Create Promotion' }).click();
  expect(page.getByRole('heading', { name:'admin edit promotion'})).toBeVisible();
  await page.getByRole('button', { name: 'Edit' }).nth(2).click();
  await page.getByRole('textbox', { name: 'Title' }).click();

  await page.getByRole('textbox', { name: 'Title' }).fill('admin edit promotion law na ja');
  await page.getByRole('button', { name: 'Update Promotion' }).click();
  expect(page.getByRole('heading', { name:'admin edit promotion law na ja'})).toBeVisible();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Are you sure you want to delete this promotion?'); 
    await dialog.accept(); 
  });
  await page.getByRole('button', { name: 'Delete' }).nth(2).click();
});

// test(`admin edit promotion that doesn't exist`, async ({ page }) => {
//   await page.goto(`${baseURL}/login`);
//   await page.getByRole('textbox', { name: 'Email Address' }).click();
//   await page.getByRole('textbox', { name: 'Email Address' }).fill('anan.panit@example.com');
//   await page.getByRole('textbox', { name: 'Password' }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('password123');
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('link', { name: 'Manage Promotions' }).click();
//   expect(page.url()).toBe(`${baseURL}/admin/promotions`);
//   const editButton = page.getByTestId('edit-btn-abc123test');
//   const isVisible = await editButton.isVisible().catch(() => false);
//   expect(isVisible).toBe(false);
// });

test('admin edit promotion missing field', async ({ page }, testInfo) => {
  testInfo.setTimeout(60000);
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('chaiwat.duangdee@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  await page.getByRole('button', { name: 'Edit' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('');
  await page.getByRole('button', { name: 'Update Promotion' }).click();
  const isValid = await page.getByRole('textbox', { name: 'Title' }).evaluate((input: HTMLInputElement) => input.checkValidity());
  expect(isValid).toBe(false);
});


test('provider create promotion', async ({ page }, testInfo) => {
  testInfo.setTimeout(60000);
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('piyanuch.singthong@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions`);
  await page.getByRole('button', { name: 'Create New Promotion' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions/new`);
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('provider create promotion 1');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('provider create promotion ');
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).click();
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).fill('022');
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).fill('0200');
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).fill('01700');
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).click();
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).fill('4');
  await page.getByRole('textbox', { name: 'Select start date' }).click();
  await page.getByRole('option', { name: 'Choose Friday, April 25th,' }).click();
  await page.getByRole('textbox', { name: 'Select end date' }).click();
  await page.getByRole('option', { name: 'Choose Saturday, May 3rd,' }).click();
  await page.getByRole('button', { name: 'Create Promotion' }).click();
  await expect(page.url()).toBe(`${baseURL}/admin/promotions`);
  await expect(page.getByRole('heading', { name: 'provider create promotion 1' })).toBeVisible();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Are you sure you want to delete this promotion?'); 
    await dialog.accept(); 
  });
  await page.getByRole('button', { name: 'Delete' }).nth(2).click();
  await expect(page.getByRole('heading', { name: 'provider create promotion 1' })).toBeHidden();
});

test('provider create promotion missing field' , async ({page}) => {
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('piyanuch.singthong@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions`);
  await page.getByRole('button', { name: 'Create New Promotion' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions/new`);
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('provider create promotion');
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).click();
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).fill('0110');
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).fill('0200');
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).fill('01500');
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).click();
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).fill('5');
  await page.getByRole('textbox', { name: 'Select start date' }).click();
  await page.getByRole('option', { name: 'Choose Tuesday, April 29th,' }).click();
  await page.getByRole('textbox', { name: 'Select end date' }).click();
  await page.getByRole('option', { name: 'Choose Saturday, May 3rd,' }).click();
  await page.getByRole('button', { name: 'Create Promotion' }).click();
  const isValid = await page.getByRole('textbox', { name: 'Description' }).evaluate((input: HTMLInputElement) => input.checkValidity());
  expect(!!isValid).toBe(false);
})


test(`provider create promotion provider doesn't exist` , async ({page}) => {
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('piyanuch.singthong@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions`);
  await page.getByRole('button', { name: 'Create New Promotion' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions/new`);
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('provider create promotion');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('provider create promotion');
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).click();
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).fill('0110');
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).fill('0200');
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).fill('01500');
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).click();
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).fill('5');
  const found = await page.$('select[name="provider"] >> option[value="6803d1137380cd769971ce98"]');
  expect(!found).toBe(true);
})


test('provider create promotion invalid field value' , async ({page}) => {
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('piyanuch.singthong@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions`);
  await page.getByRole('button', { name: 'Create New Promotion' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions/new`);
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('provider create promotion');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('provider create promotion');
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).click();
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).fill('0110');
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).fill('0200');
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).fill('01500');
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).click();
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).fill('5');
  await page.getByRole('textbox', { name: 'Select start date' }).click();
  await page.getByRole('option', { name: 'Choose Tuesday, April 29th,' }).click();
  await page.getByRole('textbox', { name: 'Select end date' }).click();
  await page.getByRole('option', { name: 'Choose Saturday, May 3rd,' }).click();
  await page.getByRole('button', { name: 'Create Promotion' }).click();
  const isValid = await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).evaluate((input: HTMLInputElement) => input.checkValidity());
  expect(isValid).toBe(false);
})


test('provider delete promotion', async ({ page }, testInfo) => {
  testInfo.setTimeout(60000);
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('piyanuch.singthong@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  expect(page.url()).toBe(`${baseURL}/admin/promotions`);
  await page.getByRole('button', { name: 'Create New Promotion' }).click();
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('provider create promotion for delete');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('provider create promotion for delete');
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).click();
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).fill('020');
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).fill('0200');
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).fill('01500');
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).click();
  await page.getByRole('spinbutton', { name: 'Available Quantity' }).fill('4');
  await page.getByRole('textbox', { name: 'Select start date' }).click();
  await page.getByRole('option', { name: 'Choose Friday, April 25th,' }).click();
  await page.getByRole('textbox', { name: 'Select end date' }).click();
  await page.getByRole('option', { name: 'Choose Saturday, May 3rd,' }).click();
  await page.getByRole('button', { name: 'Create Promotion' }).click();
  await expect(page.getByRole('heading', { name: 'provider create promotion for delete' })).toBeVisible();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Are you sure you want to delete this promotion?'); 
    await dialog.accept(); 
  });
  await page.getByRole('button', { name: 'Delete' }).nth(2).click();
  await expect(page.getByRole('heading', { name: 'provider create promotion for delete' })).toBeHidden();
});

test(`provider delete promotion that doesn't belong to them`, async ({ page }) => {
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('piyanuch.singthong@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Are you sure you want to delete this promotion?');
    await dialog.accept();
  
    page.once('dialog', async (secondDialog) => {
      expect(secondDialog.message()).toContain('You are not authorized to delete this promotion.');
      await secondDialog.accept();
    });
  });
  await page.getByRole('button', { name: 'Delete' }).nth(1).click();
});


test('provider edit promotion', async ({ page }, testInfo) => {
  testInfo.setTimeout(60000);
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('teerasak.kaewsai@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();
  await page.getByRole('button', { name: 'Create New Promotion' }).click();
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('provider edit promotion');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('provider edit promotion');
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).click();
  await page.getByRole('spinbutton', { name: 'Discount Percentage (%)' }).fill('020');
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Max Discount Amount (฿)' }).fill('0200');
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).click();
  await page.getByRole('spinbutton', { name: 'Min Purchase Amount (฿)' }).fill('01500');
  await page.getByRole('textbox', { name: 'Select start date' }).click();
  await page.getByRole('option', { name: 'Choose Friday, April 25th,' }).click();
  await page.getByRole('textbox', { name: 'Select end date' }).click();
  await page.getByRole('button', { name: 'Next Month' }).click();
  await page.getByRole('option', { name: 'Choose Thursday, May 22nd,' }).click();
  await page.getByRole('button', { name: 'Create Promotion' }).click();
  expect(page.getByRole('heading', { name:'provider edit promotion'})).toBeVisible();
  await page.getByRole('button', { name: 'Edit' }).nth(2).click();
  await page.getByRole('textbox', { name: 'Title' }).click();

  await page.getByRole('textbox', { name: 'Title' }).fill('provider edit promotion law na ja');
  await page.getByRole('button', { name: 'Update Promotion' }).click();
  expect(page.getByRole('heading', { name:'provider edit promotion law na ja'})).toBeVisible();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Are you sure you want to delete this promotion?'); 
    await dialog.accept(); 
  });
  await page.getByRole('button', { name: 'Delete' }).nth(2).click();
});

test('provider edit promotion that doesnat belong to them', async ({ page }, testInfo) => {
  testInfo.setTimeout(60000);
  await page.goto(`${baseURL}/login`);
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('teerasak.kaewsai@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Promotions' }).click();

  await page.getByRole('button', { name: 'Edit' }).nth(0).click();
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('provider gona edit promotion ');
  await page.getByRole('button', { name: 'Update Promotion' }).click();
  expect(page.getByText('You are not authorized to update this promotion.')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  expect(page.getByRole('heading', { name:'firstTime'})).toBeVisible();
});




