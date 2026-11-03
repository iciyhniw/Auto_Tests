import { expect, type Locator, type Page } from '@playwright/test';
import { expectNoHorizontalOverflow } from '../utils/layout';
import { Selectbox } from '../utils/selectbox';
import { exactText } from '../utils/text';
import { waitForSavedCart } from '../utils/cart';
import { waitForHydration } from '../utils/hydration';

/** Ширина, з якої ціна і кнопки показуються в правому блоці (.aside), а не в нижній панелі. */
export const PDP_ASIDE_BREAKPOINT = 1200;

/**
 * Сторінка товару /product/{handle} (pages/product/@slug).
 * Права картка (Info.vue): назва, тег «SOLD OUT» / «NN% OFF», ціна й стара ціна (>= 1200 px),
 * «Availability: Ready to ship | Sold out | Coming soon», Add to bag з кількістю 1–30 (>= 1200 px), Buy Now / Notify Me.
 * < 1200 px: .sticky-bar з ціною і Add to bag (для доступних товарів).
 * Акордеони: About this bundle/product, Features, Specifications, Pre-installed Games, FAQ — відкриті за замовчуванням.
 * Невідомий handle → 404.
 */
export class ProductPage {
  readonly card: Locator;
  readonly title: Locator;
  readonly tag: Locator;
  readonly price: Locator;
  readonly oldPrice: Locator;
  readonly availability: Locator;
  readonly quantitySelect: Selectbox;
  readonly addToBagButton: Locator;
  readonly buyNowButton: Locator;
  readonly notifyMeButton: Locator;
  readonly stickyBar: Locator;
  readonly breadcrumbs: Locator;
  readonly currentCrumb: Locator;
  /** Перемикач між товарами тієї ж підкатегорії (ECM-1907). */
  readonly subcategoryLinks: Locator;
  readonly accordions: Locator;
  readonly suggestions: Locator;

  constructor(private readonly page: Page) {
    this.card = page.locator('.aside .card').first();
    this.title = this.card.locator('.title-container .new-era-h4, .header .new-era-h4').first();
    this.tag = this.card.locator('.title-container .tag');
    this.price = page.locator('.aside .price-container .price, .sticky-bar .price').filter({ visible: true }).first();
    this.oldPrice = page.locator('.aside .old-price, .sticky-bar .old-price').filter({ visible: true }).first();
    this.availability = this.card.locator('.availability span').last();
    this.quantitySelect = new Selectbox(page.locator('.aside .add-to-bag-control .add-to-cart-select'));
    this.addToBagButton = page
      .locator('.aside .add-to-bag-control, .sticky-bar')
      .getByRole('button', { name: 'Add to bag', exact: true })
      .filter({ visible: true })
      .first();
    this.buyNowButton = this.card.locator('.action-button').filter({ hasText: /buy now/i }).filter({ visible: true });
    this.notifyMeButton = page.getByRole('button', { name: 'Notify Me', exact: true }).filter({ visible: true }).first();
    this.stickyBar = page.locator('.sticky-bar');
    this.breadcrumbs = page.locator('.breadcrumbs .crumb');
    this.currentCrumb = page.locator('.breadcrumbs .crumb.current');
    this.subcategoryLinks = page.locator('a.bundle').filter({ visible: true });
    this.accordions = page.locator('.accordion');
    this.suggestions = page.locator('.suggestions');
  }

  async open(handle: string): Promise<void> {
    await this.page.goto(`/product/${handle}`);
    await expect(this.title).toBeVisible();
    await waitForHydration(this.page);
  }

  isAsideLayout(): boolean {
    return (this.page.viewportSize()?.width ?? 1440) >= PDP_ASIDE_BREAKPOINT;
  }

  /**
   * Add to bag товару. Спершу чекаємо, поки завантажиться збережений кошик (інакше сайт створить новий —
   * баг сайту, див. README, розділ 9). На вужчих екранах кнопка в закріпленій панелі — перевіряємо ширину сторінки.
   */
  async addToBag(): Promise<void> {
    await waitForSavedCart(this.page);
    if (!this.isAsideLayout()) {
      await expectNoHorizontalOverflow(this.page);
    }
    await this.addToBagButton.click();
  }

  accordion(header: string | RegExp): Locator {
    return this.accordions.filter({ has: this.page.locator('button.header', { hasText: header }) });
  }

  accordionBody(header: string | RegExp): Locator {
    return this.accordion(header).locator('.body');
  }

  crumb(text: string): Locator {
    return this.breadcrumbs.filter({ hasText: exactText(text) }).first();
  }

  /** Кнопка Add to bag у картці блоку «You may also like». */
  suggestionAddToBag(name: string): Locator {
    return this.suggestions
      .locator('div')
      .filter({ has: this.page.getByText(name, { exact: true }) })
      .filter({ has: this.page.getByRole('button', { name: 'Add to bag', exact: true }) })
      .last()
      .getByRole('button', { name: 'Add to bag', exact: true });
  }
}
