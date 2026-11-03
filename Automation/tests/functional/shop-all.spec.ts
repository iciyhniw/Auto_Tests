import { test, expect } from '../../fixtures/test';
import { PRODUCTS, SHOP_SECTIONS } from '../../fixtures/site';
import { expectCheckout, stubCheckout } from '../../utils/checkout';

/** /buy: якорі розділів, скидання сортування, посилання карток, Buy Now. */
test.describe('Shop All', { tag: ['@functional', '@p1'] }, () => {
  test.use({ hidePromoBanner: true });

  test('перехід до розділу через якір / список', async ({ shopAll }) => {
    await shopAll.open();
    const target = SHOP_SECTIONS[1];
    await shopAll.jumpTo(target.title);
    await expect(shopAll.section(target.id).getByRole('heading', { level: 2 })).toBeInViewport();
  });

  test('посилання з якорем відкриває сторінку одразу на розділі', async ({ page, shopAll }) => {
    const target = SHOP_SECTIONS[3];
    await page.goto(`/buy#${target.id}`);
    await expect(shopAll.section(target.id).getByRole('heading', { level: 2 })).toBeInViewport();
  });

  test('скидання сортування повертає початковий порядок', async ({ shopAll }) => {
    await shopAll.open();
    test.skip(!(await shopAll.anchors.first().isVisible()), 'Хрестик скидання є лише на ширині >= 768 px');

    const block = 'shop-accessories';
    const original = await shopAll.blockNames(block);
    await shopAll.sortBy('Descending');
    await expect.poll(() => shopAll.blockNames(block)).not.toEqual(original);

    await shopAll.sortSelect.clear();
    await expect.poll(() => shopAll.blockNames(block)).toEqual(original);
  });

  test('кожна картка веде на сторінку свого товару', async ({ page, shopAll }) => {
    await shopAll.open();
    const hrefs = await page.locator('section a.card-link').evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));
    expect(hrefs.length).toBeGreaterThan(5);
    for (const href of hrefs) {
      expect(href, 'посилання картки має вести на /product/<handle>').toMatch(/^\/product\/[\w-]+$/);
    }
  });

  test('Buy Now у картці веде одразу в checkout', async ({ page, shopAll }) => {
    await stubCheckout(page);
    await shopAll.open();
    await shopAll.revealCard(PRODUCTS.travelCase.cardName);
    await expect(shopAll.actionButton(PRODUCTS.travelCase.cardName)).toHaveText(/buy now/i);
    await shopAll.actionButton(PRODUCTS.travelCase.cardName).click();
    await expectCheckout(page);
  });
});
