import type { Locator, Page } from '@playwright/test';
import { containsText } from '../utils/text';
import { clickCentered } from '../utils/dom';
import { waitForHydration } from '../utils/hydration';

/**
 * Сторінка /cart (pages/cart/+Page.vue).
 * h1: «1 item in your bag» / «N items in your bag» / «Your bag is empty» (N — кількість РЯДКІВ, не штук).
 * Рядок: .product з a.product-title, Quantity (− неактивна при 1), .price = ціна × кількість, Remove (ButtonLink).
 * Order summary (Subtotal, Checkout) — лише >= 1200 px; вужче Checkout у нижній панелі .user-bag-checkout-bar-mobile.
 */
export class CartPage {
  readonly heading: Locator;
  readonly items: Locator;
  readonly emptyHeading: Locator;
  readonly summary: Locator;
  readonly subtotal: Locator;
  readonly taxesHint: Locator;
  readonly checkoutButton: Locator;
  readonly suggestions: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    // .product є і в бічній панелі; рядки сторінки кошика відрізняє посилання a.product-title
    this.items = page.locator('.product').filter({ has: page.locator('a.product-title') });
    this.emptyHeading = page.getByRole('heading', { level: 1, name: 'Your bag is empty' });
    this.summary = page.locator('.summary');
    this.subtotal = this.summary.locator('.row').filter({ hasText: 'Subtotal' }).locator('span').last();
    this.taxesHint = this.summary.locator('.shipping');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout', exact: true }).filter({ visible: true }).first();
    this.suggestions = page.locator('.suggestions');
  }

  async open(): Promise<void> {
    await this.page.goto('/cart');
    await waitForHydration(this.page);
  }

  item(name: string): Locator {
    return this.items.filter({ has: this.page.locator('a.product-title', { hasText: containsText(name) }) });
  }

  title(name: string): Locator {
    return this.item(name).locator('a.product-title');
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
    return this.item(name).locator('.tools .price');
  }

  removeButton(name: string): Locator {
    return this.item(name).getByText('Remove', { exact: true });
  }

  // На телефоні низ екрана закриває панель із Checkout, тому клікаємо з прокруткою в центр
  async increase(name: string): Promise<void> {
    await clickCentered(this.increaseButton(name));
  }

  async decrease(name: string): Promise<void> {
    await clickCentered(this.decreaseButton(name));
  }

  async remove(name: string): Promise<void> {
    await clickCentered(this.removeButton(name));
  }
}
