import { expect, type Locator, type Page } from '@playwright/test';
import { waitForHydration } from '../utils/hydration';

/**
 * Сторінка /find-yours (pages/find-yours): h1 «Which WOWCube is the best one?»,
 * section.choose-cube (картки з Buy Now / Learn more), section.rubiks-bundle (Add to bag / Buy Now),
 * фінальний CTA .pre-order-cta «From $…» + Buy WOWCube (checkout з WOWCube Base).
 */
export class FindYoursPage {
  readonly heading: Locator;
  readonly chooseCube: Locator;
  readonly rubiksBundle: Locator;
  readonly rubiksAddToBag: Locator;
  readonly rubiksBuyNow: Locator;
  readonly finalCta: Locator;
  readonly finalCtaBuy: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.chooseCube = page.locator('section.choose-cube');
    this.rubiksBundle = page.locator('section.rubiks-bundle');
    this.rubiksAddToBag = this.rubiksBundle.getByRole('button', { name: 'Add to bag', exact: true });
    this.rubiksBuyNow = this.rubiksBundle.getByRole('button', { name: 'Buy Now', exact: true });
    this.finalCta = page.locator('section.pre-order-cta');
    this.finalCtaBuy = this.finalCta.getByRole('button', { name: 'Buy WOWCube' });
  }

  async open(): Promise<void> {
    await this.page.goto('/find-yours');
    await expect(this.heading).toBeVisible();
    await waitForHydration(this.page);
  }
}
