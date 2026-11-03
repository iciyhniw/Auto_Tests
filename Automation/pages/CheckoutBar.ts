import type { Locator, Page } from '@playwright/test';

/**
 * Закріплена нижня панель кошика (components/cart/UserBagCheckoutBar.vue) — на головній і на PDP.
 * З'являється (клас .visible) після прокрутки > 150 px.
 *  - > 767 px: .user-bag-checkout-bar — лише коли в кошику щось є: назва товару / «N items», сума, Checkout.
 *  - <= 767 px: .user-bag-checkout-bar-mobile — з товарами: назва / «Subtotal», сума, Checkout;
 *    порожній кошик: ціна WOWCube Base, стара ціна, Affirm і «Buy now».
 * На PDP вужче 1200 px замість неї — власна панель сторінки товару (.sticky-bar, див. ProductPage).
 */
export class CheckoutBar {
  readonly desktop: Locator;
  readonly mobile: Locator;

  constructor(private readonly page: Page) {
    this.desktop = page.locator('.user-bag-checkout-bar');
    this.mobile = page.locator('.user-bag-checkout-bar-mobile');
  }

  /** Панель для поточної ширини екрана. */
  get bar(): Locator {
    return (this.page.viewportSize()?.width ?? 1440) > 767 ? this.desktop : this.mobile;
  }

  get label(): Locator {
    return this.bar.locator('.user-bag-checkout-bar__price p, .summary .row span').first();
  }

  get total(): Locator {
    return this.bar.locator('.price__new, .summary .row span:last-child').first();
  }

  get checkoutButton(): Locator {
    return this.bar.getByRole('button', { name: 'Checkout', exact: true });
  }

  get buyNowButton(): Locator {
    return this.bar.getByRole('button', { name: /buy now/i });
  }
}
