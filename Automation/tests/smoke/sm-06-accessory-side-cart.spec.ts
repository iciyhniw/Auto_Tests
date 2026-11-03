import { test, expect } from '../../fixtures/test';
import { PRODUCTS } from '../../fixtures/site';

/** SM-06. Add to bag для аксесуара теж відкриває бічний кошик, і в ньому всі додані товари (ECM-2039). */
test('SM-06 Аксесуар відкриває бічний кошик', { tag: ['@p0', '@smoke'] }, async ({ product, cartPopup }) => {
  await product.open(PRODUCTS.base.handle);
  await product.addToBag();
  await cartPopup.expectOpenWith(PRODUCTS.base.title, 1);
  await cartPopup.close();

  await product.suggestionAddToBag(PRODUCTS.travelCase.title).click();

  await cartPopup.expectOpenWith(PRODUCTS.travelCase.title, 1);
  await expect(cartPopup.item(PRODUCTS.base.title), 'у панелі немає раніше доданого куба').toBeVisible();
  await expect(cartPopup.items).toHaveCount(2);
});
