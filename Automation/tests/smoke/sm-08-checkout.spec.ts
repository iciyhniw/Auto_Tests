import { test, expect } from '../../fixtures/test';
import { CHECKOUT_URL_RE, PRODUCTS } from '../../fixtures/site';

/**
 * SM-08. Кошик → Checkout веде в Shopify (справжній перехід, без заглушки).
 * На alpha dev store закритий паролем, тому перевіряємо лише перехід на домен checkout.
 */
test('SM-08 Checkout: перехід у Shopify', { tag: ['@p0', '@smoke'] }, async ({ page, product, cartPopup, cart }) => {
  await product.open(PRODUCTS.travelCase.handle);
  await product.addToBag();
  await cartPopup.expectOpenWith(PRODUCTS.travelCase.title);

  await cartPopup.viewBagButton.click();
  await expect(cart.item(PRODUCTS.travelCase.title)).toBeVisible();

  await cart.checkoutButton.click();
  await page.waitForURL(CHECKOUT_URL_RE, { waitUntil: 'commit', timeout: 45_000 });
});
