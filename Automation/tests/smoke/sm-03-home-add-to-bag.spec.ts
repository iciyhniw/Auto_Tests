import { test, expect } from '../../fixtures/test';
import { PRODUCTS, TEXT } from '../../fixtures/site';

/**
 * SM-03. Головна: кнопка Get WOWCube → блок вибору → покупка.
 * Головна в A/B-тесті (Convert, 3 варіанти), тому перевіряємо кожен варіант окремо:
 *  - A: #get веде на картки товарів («Choose your WOWCube»), з них — на сторінку товару;
 *  - B і C: #get веде на блок вибору версії і кількості.
 */
test.describe('SM-03 Головна: Get WOWCube → вибір товару', { tag: ['@p0', '@smoke'] }, () => {
  test.describe('варіант A', () => {
    test.use({ homepageVariant: 'A' });

    test('картка товару → сторінка товару', async ({ page, home, product }) => {
      await home.open();
      await expect(home.main).toHaveClass(/variant-a/);

      await home.heroCta.click();
      await expect(home.getAnchor).toBeInViewport({ ratio: 0.05 });
      await expect(home.showcaseHeading(TEXT.homeShowcaseTitle.A)).toBeVisible();
      await expect(home.chooseSection, 'у варіанті A блок з кількістю має бути схований').toBeHidden();

      const href = await home.openFirstShowcaseProduct();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(product.title).toBeVisible();
    });
  });

  for (const variant of ['B', 'C'] as const) {
    test.describe(`варіант ${variant}`, () => {
      test.use({ homepageVariant: variant });

      test('версія і кількість → Add to bag', async ({ home, cartPopup }) => {
        await home.open();
        await expect(home.main).toHaveClass(new RegExp(`variant-${variant.toLowerCase()}`));

        await home.heroCta.click();
        // Сторінка прокручується до блоку; заголовок може опинитись вище краю екрана — достатньо, що блок видно
        await expect(home.chooseSection).toBeInViewport();

        await home.addEditionToBag(PRODUCTS.base, 2);

        await cartPopup.expectOpenWith(PRODUCTS.base.title, 2);
        await expect(cartPopup.checkoutButton).toBeEnabled();
      });
    });
  }
});
