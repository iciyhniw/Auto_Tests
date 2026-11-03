import { test, expect } from '../../fixtures/test';
import { PRODUCTS } from '../../fixtures/site';
import { discountCodesOf, waitForStorefrontRequest } from '../../utils/shopify';
import { expectCheckout, stubCheckout } from '../../utils/checkout';

/** SM-11. Пряме посилання /go?action=buy-product веде одразу на покупку (ECM-2083). */
test.describe('SM-11 Пряме buy-посилання /go', { tag: ['@p0', '@smoke'] }, () => {
  test.beforeEach(async ({ page }) => {
    await stubCheckout(page);
  });

  test('без промокоду', async ({ page }) => {
    await page.goto(`/go?action=buy-product&handle=${PRODUCTS.base.handle}`, { waitUntil: 'commit' });
    await expectCheckout(page);
  });

  test('із промокодом', async ({ page }) => {
    const code = 'QAAUTOTEST11';
    const cartRequest = waitForStorefrontRequest(page, code);

    await page.goto(`/go?action=buy-product&handle=${PRODUCTS.base.handle}&coupon=${code}`, { waitUntil: 'commit' });
    expect(discountCodesOf(await cartRequest)).toContain(code);
    await expectCheckout(page);
  });
});
