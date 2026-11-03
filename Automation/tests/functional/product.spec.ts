import { test, expect } from '../../fixtures/test';
import { PRODUCTS, TEXT } from '../../fixtures/site';
import { parsePrice } from '../../utils/text';
import { heightOf } from '../../utils/dom';
import { expectCheckout, stubCheckout } from '../../utils/checkout';

/** Сторінка товару: наявність, знижка, кількість, Buy Now, акордеони, 404. */
test.describe('Сторінка товару', { tag: ['@functional', '@p1'] }, () => {
  test.use({ hidePromoBanner: true });

  test('доступний товар: «Ready to ship» і кнопка Add to bag', async ({ product }) => {
    await product.open(PRODUCTS.base.handle);
    await expect(product.availability).toHaveText(TEXT.availability.available);
    await expect(product.addToBagButton).toBeVisible();
    await expect(product.notifyMeButton).toHaveCount(0);
  });

  test('бейдж знижки відповідає старій і новій ціні', async ({ product }) => {
    await product.open(PRODUCTS.base.handle);
    test.skip((await product.oldPrice.count()) === 0, 'Зараз на товар немає знижки');

    const price = parsePrice(await product.price.innerText());
    const oldPrice = parsePrice(await product.oldPrice.innerText());
    expect(oldPrice, 'стара ціна має бути більшою за нову').toBeGreaterThan(price);
    // Формула сайту: floor((old - new) / old * 100) — getProductDiscount у common/shopify-products.ts
    const discount = Math.floor(((oldPrice - price) / oldPrice) * 100);
    await expect(product.tag).toHaveText(`${discount}% OFF`);
  });

  test('вибрана кількість потрапляє в кошик', async ({ product, cartPopup }) => {
    await product.open(PRODUCTS.travelCase.handle);
    test.skip(!product.isAsideLayout(), 'Вибір кількості є лише на ширині >= 1200 px');

    await product.quantitySelect.select('3');
    await expect(product.quantitySelect.selected).toHaveText('3');
    await product.addToBag();
    await cartPopup.expectOpenWith(PRODUCTS.travelCase.title, 3);
  });

  test('Buy Now веде одразу в checkout', async ({ page, product }) => {
    await stubCheckout(page);
    await product.open(PRODUCTS.travelCase.handle);
    test.skip(!product.isAsideLayout(), 'Для доступних товарів Buy Now є лише на ширині >= 1200 px');

    await product.buyNowButton.click();
    await expectCheckout(page);
  });

  test('акордеони куба відкриті і згортаються', async ({ product }) => {
    await product.open(PRODUCTS.base.handle);
    for (const header of ['About this bundle', 'Features', 'Specifications', 'Pre-installed Games', 'Frequently asked questions']) {
      await expect(product.accordion(header), `немає акордеона «${header}»`).toHaveClass(/opened/);
    }

    const specs = product.accordionBody('Specifications');
    await expect(specs).toContainText('In the box');
    await product.accordion('Specifications').locator('button.header').click();
    await expect(product.accordion('Specifications')).not.toHaveClass(/opened/);
    await expect.poll(() => heightOf(specs), { message: 'акордеон не згорнувся' }).toBe(0);

    await product.accordion('Specifications').locator('button.header').click();
    await expect(product.accordion('Specifications')).toHaveClass(/opened/);
    await expect.poll(() => heightOf(specs)).toBeGreaterThan(0);
  });

  test('аксесуар: «About this product» без характеристик куба', async ({ product }) => {
    await product.open(PRODUCTS.travelCase.handle);
    await expect(product.accordion('About this product')).toBeVisible();
    await expect(product.accordion('Specifications')).toHaveCount(0);
  });

  test('breadcrumbs: Home → Shop All → підкатегорія', async ({ product }) => {
    await product.open(PRODUCTS.base.handle);
    test.skip(!(await product.breadcrumbs.first().isVisible()), 'Breadcrumbs є лише на ширині >= 768 px');
    await expect(product.crumb('Home')).toHaveAttribute('href', '/');
    await expect(product.crumb('Shop All')).toHaveAttribute('href', '/buy');
    await expect(product.currentCrumb).toHaveText('WOWCubes');
  });

  test('неіснуючий товар → 404 і кнопка View Games', async ({ page, errorPage }) => {
    const response = await page.goto('/product/qa-nonexistent-product');
    expect(response?.status()).toBe(404);
    await expect(errorPage.message).toHaveText(/404/);
    await expect(errorPage.viewGamesLink).toHaveAttribute('href', '/store');
  });
});
