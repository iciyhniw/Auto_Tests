import type { Locator, Page } from '@playwright/test';

/**
 * Промо-банер над хедером (packages/modules/website-banner, WebsiteBanner.vue).
 * Дані — /api/v3/pages/web.website-banners.json; на alpha їх вантажить браузер, тому відповідь можна підмінити.
 * Закриття хрестиком діє до перезавантаження сторінки (стан у пам'яті).
 */
export class PromoBanner {
  readonly root: Locator;
  readonly title: Locator;
  readonly button: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('.website-banner');
    this.title = this.root.locator('.content .title');
    this.button = this.root.locator('a.button');
    this.closeButton = this.root.locator('button.close');
  }
}
