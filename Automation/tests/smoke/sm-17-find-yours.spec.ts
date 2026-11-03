import { test, expect } from '../../fixtures/test';
import { PRODUCTS } from '../../fixtures/site';

/** SM-17. Сторінка /find-yours: блоки вибору і Add to bag (ECM-1700). */
test('SM-17 Find yours → Add to bag', { tag: ['@p1', '@smoke'] }, async ({ findYours, cartPopup }) => {
  await findYours.open();
  await expect(findYours.heading).toHaveText(/which wowcube is the best one/i);
  await expect(findYours.chooseCube).toBeVisible();

  await findYours.rubiksAddToBag.click();
  await cartPopup.expectOpenWith(PRODUCTS.rubiks.title, 1);
});
