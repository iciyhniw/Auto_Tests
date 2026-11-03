import { test, expect } from '../../fixtures/test';
import { PRODUCTS } from '../../fixtures/site';
import { exactText } from '../../utils/text';

/** SM-05. Shop All → картка (Learn more) → PDP (breadcrumbs, ціна) → Add to bag → бічний кошик. */
test('SM-05 Shop All → PDP → Add to bag', { tag: ['@p0', '@smoke'] }, async ({ page, shopAll, product, cartPopup }) => {
  const { cardName, handle, title } = PRODUCTS.base;

  await shopAll.open();
  const cardPrice = (await shopAll.cardPrice(cardName).innerText()).trim();
  await shopAll.openProduct(cardName, handle);

  await expect(page).toHaveURL(new RegExp(`/product/${handle}$`));
  await expect(product.title).toHaveText(exactText(title));
  if (await product.breadcrumbs.first().isVisible()) {
    // Breadcrumbs є лише >= 768 px
    await expect(product.crumb('Home')).toHaveAttribute('href', '/');
    await expect(product.crumb('Shop All')).toHaveAttribute('href', '/buy');
  }
  await expect(product.price, 'ціна на PDP відрізняється від ціни в картці Shop All').toHaveText(cardPrice);

  await product.addToBag();
  await cartPopup.expectOpenWith(title, 1);
});
