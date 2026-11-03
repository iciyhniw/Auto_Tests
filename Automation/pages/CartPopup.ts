import { expect, type Locator, type Page } from '@playwright/test';
import { containsText } from '../utils/text';

/**
 * Бічна панель кошика (components/cart/PopupCart.vue), відкривається після Add to bag.
 * Шторка праворуч (на екранах < 515 px — знизу). На сторінці /cart не відкривається.
 * Рядок товару: .products .product (h3 назва, .price, .quantity з −/+, Remove — ButtonLink).
 */
export class CartPopup {
  readonly root: Locator;
  readonly heading: Locator;
  readonly items: Locator;
  readonly closeButton: Locator;
  readonly subtotal: Locator;
  readonly viewBagButton: Locator;
  readonly checkoutButton: Locator;
  readonly hint: Locator;
  readonly suggestions: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('.cart-popup');
    this.heading = this.root.locator('.header p').first();
    this.items = this.root.locator('.products .product');
    this.closeButton = this.root.locator('.header button.close');
    this.subtotal = this.root.locator('.footer .row').filter({ hasText: 'Subtotal' }).locator('span').last();
    this.viewBagButton = this.root.getByRole('button', { name: 'View bag' });
    this.checkoutButton = this.root.getByRole('button', { name: 'Checkout' });
    this.hint = this.root.locator('.footer .hint');
    this.suggestions = this.root.locator('.suggestions');
  }

  item(name: string): Locator {
    return this.items.filter({ has: this.page.locator('h3', { hasText: containsText(name) }) });
  }

  quantity(name: string): Locator {
    return this.item(name).locator('.quantity .value');
  }

  increaseButton(name: string): Locator {
    return this.item(name).locator('.quantity button').last();
  }

  decreaseButton(name: string): Locator {
    return this.item(name).locator('.quantity button').first();
  }

  linePrice(name: string): Locator {
    return this.item(name).locator('.price');
  }

  removeButton(name: string): Locator {
    return this.item(name).getByText('Remove', { exact: true });
  }

  /** Панель відкрита і містить товар (за потреби — з потрібною кількістю). */
  async expectOpenWith(name: string, quantity?: number): Promise<void> {
    await expect(this.root, 'бічна панель кошика не відкрилась').toBeVisible();
    await expect(this.item(name), `у бічній панелі немає «${name}»`).toBeVisible();
    if (quantity !== undefined) {
      await expect(this.quantity(name)).toHaveText(String(quantity));
    }
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await expect(this.root).toBeHidden();
  }
}
