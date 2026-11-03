import { test, expect } from '../../fixtures/test';
import { PRODUCTS, STORAGE } from '../../fixtures/site';
import { getSessionJson, getSessionStorage } from '../../utils/storage';
import { discountCodesOf, waitForStorefrontRequest } from '../../utils/shopify';
import { expectCheckout, stubCheckout } from '../../utils/checkout';

/**
 * Промокоди з URL і короткі посилання /go (common/url-actions.ts, pages/go, middleware/save-coupon.ts).
 * Коди вигадані: перевіряємо, що сайт їх передає в Shopify, а не що Shopify дає знижку.
 */
test.describe('Промокоди і посилання /go', { tag: ['@functional', '@p1'] }, () => {
  test.use({ hidePromoBanner: true });

  test.beforeEach(async ({ page }) => {
    await stubCheckout(page);
  });

  test('усі ?coupon= з адреси зберігаються', async ({ page }) => {
    await page.goto('/support?coupon=QA_ONE&coupon=QA_TWO');
    await expect.poll(() => getSessionJson<string[]>(page, STORAGE.coupon)).toEqual(['QA_ONE', 'QA_TWO']);
  });

  test('промокод застосовується до вже створеного кошика', async ({ page, product, cartPopup }) => {
    await product.open(PRODUCTS.travelCase.handle);
    await product.addToBag();
    await cartPopup.expectOpenWith(PRODUCTS.travelCase.title, 1);

    const code = 'QA_EXISTING_CART';
    const request = waitForStorefrontRequest(page, code);
    await page.goto(`/cart?coupon=${code}`);
    expect(discountCodesOf(await request)).toContain(code);
  });

  test('після переходу в checkout збережені промокоди очищаються', async ({ page, product, cartPopup }) => {
    const code = 'QA_CLEARED';
    await page.goto(`/product/${PRODUCTS.travelCase.handle}?coupon=${code}`);
    await expect(product.title).toBeVisible();
    await product.addToBag();
    await cartPopup.expectOpenWith(PRODUCTS.travelCase.title, 1);

    await cartPopup.checkoutButton.click();
    await expectCheckout(page);
    // Повертаємось на сайт у тій самій вкладці (sessionStorage зберігається) — але без ?coupon= в адресі
    await page.goto('/support');
    expect(await getSessionStorage(page, STORAGE.coupon)).toBeNull();
  });

  test('/go?action=buy-rubiks веде в checkout', async ({ page }) => {
    await page.goto('/go?action=buy-rubiks', { waitUntil: 'commit' });
    await expectCheckout(page);
  });

  const fallbacks = [
    { name: 'без action', url: '/go' },
    { name: 'buy-product без handle', url: '/go?action=buy-product' },
    { name: 'неіснуючий товар', url: '/go?action=buy-product&handle=qa-nonexistent-product' },
    { name: 'buy-product-variant без variant_id', url: '/go?action=buy-product-variant' },
  ];
  for (const { name, url } of fallbacks) {
    test(`/go ${name} → головна`, async ({ page, baseURL }) => {
      await page.goto(url, { waitUntil: 'commit' });
      await expect(page).toHaveURL(new URL('/', baseURL).toString(), { timeout: 30_000 });
      await expect(page.locator('main.ab-test')).toBeAttached();
    });
  }
});
