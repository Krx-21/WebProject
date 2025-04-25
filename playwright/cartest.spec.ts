import { Button } from '@mui/material';
import { test, expect } from '@playwright/test';   
import path from 'path';


//test provider manage cars add new car
test('should navigate to the Manage Cars page', async ({ page }) => {
  await page.goto('https://web-project-delta-nine.vercel.app');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('suda.sangthong@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Cars' }).click();
  await expect(page).toHaveURL('https://web-project-delta-nine.vercel.app/admin/cars');
  await page.getByRole('button', { name: 'Add New Car' }).click();
  await expect(page).toHaveURL('https://web-project-delta-nine.vercel.app/admin/cars/new');
  await page.getByRole('textbox', { name: 'Brand' }).click();
  await page.getByRole('textbox', { name: 'Brand' }).fill('Toyota');
  await page.getByRole('textbox', { name: 'Brand' }).press('Tab');
  await page.getByRole('textbox', { name: 'Model' }).fill('X5');
  await page.getByRole('textbox', { name: 'Car Description' }).click();
  await page.getByRole('textbox', { name: 'Car Description' }).fill('good car');
  await page.getByRole('button', { name: 'Create Car' }).click();
  await page.goto('https://web-project-delta-nine.vercel.app/admin/cars');
  await page.getByRole('button', { name: 'Add New Car' }).click();
  await page.goto('https://web-project-delta-nine.vercel.app/admin/cars');
});

//test provider manage cars edit car
test('should navigate to the Edit Car page', async ({ page }) => {
  await page.goto('https://web-project-delta-nine.vercel.app');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('suda.sangthong@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Cars' }).click();
  await expect(page).toHaveURL('https://web-project-delta-nine.vercel.app/admin/cars');
  await page.locator('.rounded-lg > div:nth-child(4) > button').first().click();
  await page.getByRole('textbox', { name: 'Car Description' }).click();
  await page.getByRole('textbox', { name: 'Car Description' }).fill('bad car');
  await page.getByRole('button', { name: 'Update Car' }).click();
  page.on('dialog', async (dialog) => {
    console.log('OK', dialog.message()); // แสดงข้อความจาก popup
    await dialog.accept(); // กดปุ่ม "ตกลง"
  });
  await page.goto('https://web-project-delta-nine.vercel.app/admin/cars');  
});

//test admin manage cars add new car
test('admin should navigate to the Manage Cars page', async ({ page }) => {
  await page.goto('https://web-project-delta-nine.vercel.app');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('suda.sangthong@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Cars' }).click();
  await expect(page).toHaveURL('https://web-project-delta-nine.vercel.app/admin/cars');
  await page.getByRole('button', { name: 'Add New Car' }).click();
  await expect(page).toHaveURL('https://web-project-delta-nine.vercel.app/admin/cars/new');
  await page.getByRole('textbox', { name: 'Brand' }).click();
  await page.getByRole('textbox', { name: 'Brand' }).fill('Toyota');
  await page.getByRole('textbox', { name: 'Brand' }).press('Tab');
  await page.getByRole('textbox', { name: 'Model' }).fill('X5');
  await page.getByRole('textbox', { name: 'Car Description' }).click();
  await page.getByRole('textbox', { name: 'Car Description' }).fill('good car');
  await page.getByRole('button', { name: 'Create Car' }).click();
  await page.goto('https://web-project-delta-nine.vercel.app/admin/cars');
  await page.getByRole('button', { name: 'Add New Car' }).click();
  await page.goto('https://web-project-delta-nine.vercel.app/admin/cars');
});

//test provider manage cars edit car
test('admin should navigate to the Edit Car page', async ({ page }) => {
  await page.goto('https://web-project-delta-nine.vercel.app');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('suda.sangthong@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Cars' }).click();
  await expect(page).toHaveURL('https://web-project-delta-nine.vercel.app/admin/cars');
  await page.locator('.rounded-lg > div:nth-child(4) > button').first().click();
  await page.getByRole('textbox', { name: 'Car Description' }).click();
  await page.getByRole('textbox', { name: 'Car Description' }).fill('bad car');
  await page.getByRole('button', { name: 'Update Car' }).click();
  page.on('dialog', async (dialog) => {
    console.log('OK', dialog.message()); 
    await dialog.accept(); 
  });
  await page.goto('https://web-project-delta-nine.vercel.app/admin/cars');  
});

//test provider manage cars delete car
test('should navigate to the Delete Car page', async ({ page }) => {
  await page.goto('https://web-project-delta-nine.vercel.app');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('anan.panit@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Cars' }).click();
  await expect(page).toHaveURL('https://web-project-delta-nine.vercel.app/admin/cars');
  await page.locator('.rounded-lg > div:nth-child(4) > button:nth-child(2)').first().click();
  page.on('dialog', async (dialog) => {
    console.log('OK', dialog.message()); 
    await dialog.accept(); 
  });
  await page.goto('https://web-project-delta-nine.vercel.app/admin/cars');
  await expect(page.locator('.rounded-lg > div:nth-child(4) > button:nth-child(2)')).not.toBeVisible();
});

//test admin manage cars delete car
test('admin should navigate to the Delete Car page', async ({ page }) => {
  await page.goto('https://web-project-delta-nine.vercel.app');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('anan.panit@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Manage Cars' }).click();
  await expect(page).toHaveURL('https://web-project-delta-nine.vercel.app/admin/cars');
  await page.locator('.rounded-lg > div:nth-child(4) > button:nth-child(2)').first().click();
  page.on('dialog', async (dialog) => {
    console.log('OK', dialog.message()); 
    await dialog.accept(); 
  });
  await page.goto('https://web-project-delta-nine.vercel.app/admin/cars');
  await expect(page.locator('.rounded-lg > div:nth-child(4) > button:nth-child(2)')).not.toBeVisible();
});

//test everyone get all cars
test('should navigate to the All Cars page', async ({ page }) => {
  await page.goto('https://web-project-delta-nine.vercel.app');
  await page.getByRole('link', { name: 'Cars', exact: true }).click();
  await expect(page).toHaveURL('https://web-project-delta-nine.vercel.app/cars');
  await expect(page.getByRole('link', {  name: 'No Image ฿2,800/day SUV Nissan Terra 2022 ปิยะนุช ยูสคาร์ Diesel 7 seats View' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'No Image ฿2,500/day Van' })).toBeVisible();
});





//test dark mode & light mode
test.describe('Theme mode switch (Dark/Light)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://web-project-delta-nine.vercel.app'); // แก้ URL ตามโปรเจกต์ของคุณ
    });
  
    test('should toggle to dark mode and back to light mode', async ({ page }) => {
      const toggleButton = page.getByRole('button', { name: 'Toggle dark mode' });
      // ตรวจสอบ Light Mode
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(249, 250, 251)'); // อาจต้องเปลี่ยนตามจริง
  
      // คลิกเพื่อเปิด Dark Mode
      await toggleButton.click();
  
      // ตรวจสอบ Dark Mode
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(17, 24, 39)'); // ตัวอย่างสี dark
  
      // คลิกกลับไป Light Mode
      await toggleButton.click();
  
      // ตรวจสอบว่าเปลี่ยนกลับ Light Mode แล้ว
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(249, 250, 251)');
    });
  });



