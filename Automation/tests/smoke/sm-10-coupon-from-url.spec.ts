import { test, expect } from '../../fixtures/test';
import { PRODUCTS, STORAGE } from '../../fixtures/site';
import { getSessionJson } from '../../utils/storage';
import { discountCodesOf, waitForStorefrontRequest } from '../../utils/shopify';

/**
 * SM-10. Промокод із URL (?coupon=) зберігається і передається в кошик Shopify (ECM-2083).
 * Код вигаданий: перевіряємо, що сайт його передає, а не що Shopify дає знижку.
 */
test('SM-10 Промокод з URL потрапляє в кошик', { tag: ['@p0', '@smoke'] }, async ({ page, product }) => {
  const code = 'QAAUTOTEST10';

  await page.goto(`/product/${PRODUCTS.travelCase.handle}?coupon=${code}`);
  await expect(product.title).toBeVisible();
  await expect
    .poll(() => getSessionJson<string[]>(page, STORAGE.coupon), { message: 'код із ?coupon= не збережено в sessionStorage' })
    .toEqual([code]);

  const cartRequest = waitForStorefrontRequest(page, code);
  await product.addToBag();
  expect(discountCodesOf(await cartRequest)).toContain(code);
});
