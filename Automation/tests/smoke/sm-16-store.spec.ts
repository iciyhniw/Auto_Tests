import { test, expect } from '../../fixtures/test';

/** SM-16. Магазин ігор: пошук і сторінка гри. */
test('SM-16 Store: пошук і сторінка гри', { tag: ['@p1', '@smoke'] }, async ({ page, store }) => {
  await store.open();
  await store.search('Cut');

  const result = store.result(/cut the rope/i);
  await expect(result).toBeVisible();
  await result.click();

  // На alpha і prod slug гри різний (cuttherope, cut-the-rope-oct…), тому перевіряємо лише початок
  await expect(page).toHaveURL(/\/store\/cut/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/cut the rope/i);
  await expect(page.getByRole('tab', { name: 'About', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /CC\$/ }).first()).toBeVisible();
});
