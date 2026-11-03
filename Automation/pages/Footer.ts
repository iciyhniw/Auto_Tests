import type { Locator, Page } from '@playwright/test';

/** Футер (MainFooter). Частина посилань продубльована для різних ширин — беремо видимі. */
export class Footer {
  readonly root: Locator;
  readonly links: Locator;

  constructor(page: Page) {
    this.root = page.locator('footer');
    this.links = this.root.locator('a[href]').filter({ visible: true });
  }

  /** Унікальні внутрішні адреси (/...) з футера. */
  async internalPaths(): Promise<string[]> {
    const hrefs = await this.root.locator('a[href^="/"]').evaluateAll((links) =>
      links.map((a) => a.getAttribute('href') ?? ''),
    );
    return [...new Set(hrefs.filter(Boolean))];
  }
}
