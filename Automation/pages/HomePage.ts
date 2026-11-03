import { expect, type Locator, type Page } from '@playwright/test';
import { exactText } from '../utils/text';
import { revealInCarousel } from '../utils/carousel';
import { Selectbox } from '../utils/selectbox';
import { waitForHydration } from '../utils/hydration';
import { STOREFRONT_GRAPHQL_RE } from '../fixtures/site';

/**
 * Головна (pages/index/+Page.vue).
 * <main class="ab-test variant-a|b|c"> — A/B-тест секцій; поки варіант не визначено — клас pending.
 *  - A: #get = .product-showcase-sections («Choose your WOWCube»); legacy-блок і .bundle-comparison сховані.
 *  - B/C: #get = .product-showcase-section-legacy (вибір версії й кількості); showcase — «Meet the WOWCube family».
 * Внизу: CTA «Get your own WOWCube System» / «From $…» / Buy WOWCube (одразу checkout), блок підписки, футер.
 */
export class HomePage {
  readonly main: Locator;
  readonly heroCta: Locator;
  /** Якір #get — куди веде кнопка Get WOWCube. */
  readonly getAnchor: Locator;
  /** Картки товарів (Buy Now / Learn more). У варіанті A саме сюди веде #get. */
  readonly showcase: Locator;
  readonly bundleComparison: Locator;
  /**
   * Блок вибору версії і кількості (варіанти B і C).
   * Desktop: вкладки версій (.selector-item) + один блок кількості й Add to bag.
   * Телефон: карусель карток (.mobile .card), у кожній — своя кількість і Add to bag.
   */
  readonly chooseSection: Locator;
  readonly chooseMobile: Locator;
  readonly ctaBanner: Locator;
  readonly ctaBuyButton: Locator;
  readonly ctaPrice: Locator;

  constructor(private readonly page: Page) {
    this.main = page.locator('main.ab-test');
    // У DOM дві такі кнопки (для різних ширин), беремо видиму
    this.heroCta = page.getByRole('link', { name: 'Get WOWCube' }).filter({ visible: true }).first();
    this.getAnchor = page.locator('#get');
    this.showcase = page.locator('.product-showcase-sections');
    this.bundleComparison = page.locator('.bundle-comparison');
    this.chooseSection = page.locator('.product-showcase-section-legacy');
    this.chooseMobile = this.chooseSection.locator('.mobile');
    this.ctaBanner = page.locator('.cta-banner');
    this.ctaBuyButton = this.ctaBanner.getByRole('button', { name: 'Buy WOWCube' });
    this.ctaPrice = this.ctaBanner.getByText(/^\s*From \$\d/);
  }

  /**
   * Відкриває головну і чекає, поки вона стане робочою: hydration, список товарів із Shopify (GetAllProducts)
   * і варіант A/B-тесту. Без товарів Buy Now / Buy WOWCube мовчки нічого не роблять (баг сайту, див. README, розділ 9).
   */
  async open(path = '/'): Promise<void> {
    const productsLoaded = this.page
      .waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          STOREFRONT_GRAPHQL_RE.test(response.url()) &&
          (response.request().postData() ?? '').includes('GetAllProducts'),
        { timeout: 30_000 },
      )
      .catch(() => null);
    await this.page.goto(path);
    await waitForHydration(this.page);
    await productsLoaded;
    await this.waitForAbTest();
  }

  /** Чекає, поки A/B-тест визначить варіант і покаже секції (клас pending зникне). */
  async waitForAbTest(): Promise<void> {
    await expect(this.main, 'A/B-тест головної не завершився — секції не показані').toHaveClass(/variant-[abc]/, {
      timeout: 20_000,
    });
  }

  /**
   * Відкриває першу картку блоку showcase так, як це зробить людина:
   * Learn more на десктопі (саму картку там перекривають бейджі), тап по картці на телефоні.
   * Повертає адресу сторінки товару.
   */
  async openFirstShowcaseProduct(): Promise<string> {
    const learnMore = this.showcase.getByRole('link', { name: 'Learn more' }).filter({ visible: true }).first();
    const link = (await learnMore.isVisible())
      ? learnMore
      : this.showcase.locator('a.card-link[href^="/product/"]').filter({ visible: true }).first();
    const href = (await link.getAttribute('href')) ?? '';
    await link.click();
    return href;
  }

  /** Заголовок блоку showcase: «Choose your WOWCube» (A) або «Meet the WOWCube family» (B/C). */
  showcaseHeading(text: string): Locator {
    return this.showcase.getByText(text, { exact: true }).first();
  }

  editionTab(name: string): Locator {
    return this.chooseSection.locator('.selector-item').filter({ hasText: exactText(name) });
  }

  /** Вибір версії, кількості й Add to bag у блоці вибору (варіанти B/C, desktop і телефон). */
  async addEditionToBag(edition: { cardName: string; title: string }, quantity: number): Promise<void> {
    await expect(this.chooseSection).toBeVisible();

    if (await this.chooseMobile.isVisible()) {
      const card = this.chooseMobile
        .locator('.card')
        .filter({ has: this.page.locator('.title', { hasText: exactText(edition.title) }) });
      await revealInCarousel(card, this.chooseMobile);
      await new Selectbox(card.locator('.add-to-cart-select')).select(String(quantity));
      await card.getByRole('button', { name: 'Add to bag', exact: true }).click();
      return;
    }

    const tab = this.editionTab(edition.cardName);
    await tab.scrollIntoViewIfNeeded();
    await tab.click();
    await expect(tab).toHaveClass(/active/);
    const select = new Selectbox(this.chooseSection.locator('.add-to-cart-select').filter({ visible: true }).first());
    await select.select(String(quantity));
    await expect(select.selected).toHaveText(String(quantity));
    await this.chooseSection.getByRole('button', { name: 'Add to bag', exact: true }).filter({ visible: true }).first().click();
  }
}
