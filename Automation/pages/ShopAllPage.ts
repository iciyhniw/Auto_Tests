import { expect, type Locator, type Page } from '@playwright/test';
import { exactText, parsePrice } from '../utils/text';
import { revealInCarousel } from '../utils/carousel';
import { Selectbox } from '../utils/selectbox';
import { waitForHydration } from '../utils/hydration';

export type SortDirection = 'Ascending' | 'Descending';

/**
 * Сторінка /buy (pages/buy/+Page.vue, components/pages/buy/*, components/product-listing/ProductCard.vue).
 * Секції section#<handle> з h2; якорі: >= 768 px — a.anchor (href /buy/#<handle>), вужче — Selectbox .anchors-select.
 * Сортування за ціною: >= 768 px — Selectbox .select «Sort by price» з хрестиком скидання; вужче — .select-mobile (іконка фільтра).
 * Сортується кожен блок окремо (sortProducts у pages/buy/utils.ts).
 * Картки: desktop — сітка .card.card-grid; телефон — каруселі .slide .card (Learn more схований, відкривається тапом).
 * Кнопка картки: Buy Now (одразу checkout) або Notify Me / Subscribed для sold out.
 */
export class ShopAllPage {
  readonly cards: Locator;
  readonly anchors: Locator;
  readonly anchorsSelect: Selectbox;
  readonly sortSelect: Selectbox;

  constructor(private readonly page: Page) {
    // Невидимі копії карток є в DOM завжди — беремо лише видимі
    this.cards = page.locator('.card').filter({ visible: true }).filter({ has: page.locator('h3') });
    this.anchors = page.locator('a.anchor');
    this.anchorsSelect = new Selectbox(page.locator('.anchors-select'));
    // Є дві копії (desktop і .select-mobile) — беремо видиму
    this.sortSelect = new Selectbox(page.locator('.selectbox.select').filter({ visible: true }).first());
  }

  async open(hash = ''): Promise<void> {
    await this.page.goto(`/buy${hash}`);
    await expect(this.page.locator('#shop-wowcubes')).toBeVisible();
    await waitForHydration(this.page);
  }

  section(id: string): Locator {
    return this.page.locator(`section#${id}`);
  }

  card(name: string): Locator {
    return this.cards.filter({ has: this.page.locator('h3', { hasText: exactText(name) }) });
  }

  cardPrice(name: string): Locator {
    return this.card(name).locator('.product-price .current');
  }

  actionButton(name: string): Locator {
    return this.card(name).locator('.action-button');
  }

  soldOutCards(): Locator {
    return this.cards.filter({ has: this.page.locator('.badge', { hasText: /sold out/i }) });
  }

  /** Блок (#shop-…), у якому лежить картка. */
  blockOf(name: string): Locator {
    return this.page.locator('[id^="shop-"]').filter({ has: this.card(name) }).first();
  }

  /** Робить картку видимою на екрані (на телефоні — гортає карусель). */
  async revealCard(name: string): Promise<void> {
    await revealInCarousel(this.card(name), this.blockOf(name));
  }

  /** Відкриває сторінку товару з картки: Learn more на десктопі або тап по картці на телефоні. */
  async openProduct(name: string, handle: string): Promise<void> {
    await this.revealCard(name);
    const card = this.card(name);
    const learnMore = card.getByRole('link', { name: 'Learn more' });
    if (await learnMore.isVisible()) {
      await learnMore.click();
    } else {
      await card.locator(`a.card-link[href="/product/${handle}"]`).click();
    }
  }

  async sortBy(direction: SortDirection): Promise<void> {
    await this.sortSelect.select(direction);
  }

  /** Перехід до розділу: якір на desktop, випадаючий список на телефоні. */
  async jumpTo(title: string): Promise<void> {
    if (await this.anchors.first().isVisible()) {
      await this.anchors.filter({ hasText: exactText(title) }).click();
    } else {
      await this.anchorsSelect.select(title);
    }
  }

  /** Назви видимих карток у блоці, у порядку відображення. */
  async blockNames(blockId: string): Promise<string[]> {
    await expect(this.page.locator(`#${blockId} .card`).filter({ visible: true }).first()).toBeVisible();
    const names = await this.page.locator(`#${blockId} .card`).filter({ visible: true }).locator('h3').allInnerTexts();
    return names.map((n) => n.trim());
  }

  /** Поточні ціни видимих карток у блоці, у порядку відображення. */
  async blockPrices(blockId: string): Promise<number[]> {
    await expect(this.page.locator(`#${blockId} .card`).filter({ visible: true }).first()).toBeVisible();
    const texts = await this.page
      .locator(`#${blockId} .card`)
      .filter({ visible: true })
      .locator('.product-price .current')
      .allInnerTexts();
    return texts.map(parsePrice);
  }
}
