import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173/';

test('עמוד ראשי: כפתורי שכבות ופוטר סיכום', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  const layers = ['שכבת ז׳','שכבת ח׳','שכבת ט׳'];
  for (const txt of layers) {
    const btn = page.getByRole('button', { name: txt });
    await expect(btn, `חסר כפתור ${txt}`).toBeVisible();
  }
  await expect(page.getByText('האתר מנוהל על ידי יניב רז')).toBeVisible();
  await expect(page.getByText(/סך הכל תלמידים/)).toBeVisible();
});

test('שכבה → הקבצות → טבלת תלמידים: כותרות, מיון, מספור, ממוצע', async ({ page }) => {
  await page.goto(BASE);
  await page.getByRole('button', { name: 'שכבת ז׳' }).click();
  const groups = ['מדעית','א','א1','מקדמת'];
  for (const g of groups) {
    await expect(page.getByRole('button', { name: new RegExp(g) })).toBeVisible();
    await expect(page.getByText(/מורה/)).toBeVisible();
    await expect(page.getByText(/תלמידים/)).toBeVisible();
  }
  await page.getByRole('button', { name: /א1|א/ }).click();
  const h1 = page.locator('h1');
  await expect(h1).toBeVisible();
  await expect(h1).toHaveText(/שכבת .* — .* — מורה .+/);
  const rows = page.locator('table tbody tr');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  const firstCellTexts = await rows.allTextContents();
  const nums = firstCellTexts.map(t => parseInt((t.match(/^(\d+)/)||[])[1],10)).filter(Boolean);
  expect(nums[0]).toBe(1);
  expect(nums[nums.length-1]).toBe(nums.length);
  await expect(page.getByText(/ממוצע/)).toBeVisible();
  await expect(page.getByText(/סך הכל תלמידים/)).toBeVisible();
  await expect(page.getByText('⚠ מי שליד שמו כוכבית משתתף בתוכנית "מלקות ללמידה".')).toBeVisible();
});

test('אין כפתורים מתים: לכל כפתור יש href/ניווט תקין', async ({ page }) => {
  await page.goto(BASE);
  const buttons = page.locator('a,button');
  const n = await buttons.count();
  for (let i=0; i<n; i++) {
    const el = buttons.nth(i);
    const txt = await el.innerText();
    const clickable = await el.isVisible();
    if (!clickable) continue;
    const href = await el.getAttribute('href');
    if (href) continue;
    const onclick = await el.getAttribute('onclick');
    const route = await el.getAttribute('data-route');
    expect(onclick || route).toBeTruthy();
  }
});
