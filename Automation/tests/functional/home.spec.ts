import { test, expect } from '../../fixtures/test';
import { STOREFRONT_GRAPHQL_RE, TEXT } from '../../fixtures/site';
import { expectCheckout, stubCheckout } from '../../utils/checkout';
import { waitForStorefrontRequest } from '../../utils/shopify';
import { waitForHydration } from '../../utils/hydration';

/** Головна: варіанти A/B-тесту і кнопки, що ведуть одразу в checkout. */
test.describe('Головна', { tag: ['@functional', '@p1'] }, () => {
  test.use({ hidePromoBanner: true });

  test.describe('варіант A', () => {
    test.use({ homepageVariant: 'A' });
    test('показує картки «Choose your WOWCube», ховає блок вибору і порівняння', async ({ home }) => {
      await home.open();
      await expect(home.showcaseHeading(TEXT.homeShowcaseTitle.A)).toBeVisible();
      await expect(home.showcase).toHaveAttribute('id', 'get');
      await expect(home.chooseSection).toBeHidden();
      await expect(home.bundleComparison).toBeHidden();
    });
  });

  for (const variant of ['B', 'C'] as const) {
    test.describe(`варіант ${variant}`, () => {
      test.use({ homepageVariant: variant });
      test('показує «Meet the WOWCube family» і блок вибору з якорем #get', async ({ home }) => {
        await home.open();
        await expect(home.showcaseHeading(TEXT.homeShowcaseTitle[variant])).toBeVisible();
        await expect(home.chooseSection).toBeVisible();
        await expect(home.chooseSection).toHaveAttribute('id', 'get');
      });
    });
  }

  test('Buy Now у хедері веде в checkout', async ({ page, home, header }) => {
    test.skip(header.isBurgerLayout(), 'Кнопка є лише на ширині >= 1160 px');
    await stubCheckout(page);
    await home.open();
    // home.open() чекає hydration і завантаження товарів — інакше клік мовчки ігнорується (баг сайту, перевіряє окремий тест нижче)

    const cartCreated = waitForStorefrontRequest(page, 'CreateCart', 10_000).catch(() => null);
    await header.buyNowButton.click();
    expect(await cartCreated, 'клік по Buy Now у хедері не запустив покупку: сайт не надіслав CreateCart у Shopify').not.toBeNull();
    await expectCheckout(page);
  });

  test('фінальний CTA: ціна «From $…» і Buy WOWCube веде в checkout', async ({ page, home }) => {
    await stubCheckout(page);
    await home.open();
    await home.ctaBanner.scrollIntoViewIfNeeded();
    await expect(home.ctaBanner).toContainText(/Get your own\s*WOWCube System/);
    await expect(home.ctaPrice).toBeVisible();
    await home.ctaBuyButton.click();
    await expectCheckout(page);
  });

  test('Buy Now у хедері, натиснута одразу після завантаження, запускає покупку', async ({
    page,
    header,
  }) => {
    test.skip(header.isBurgerLayout(), 'Кнопка є лише на ширині >= 1160 px');
    await stubCheckout(page);

    // Список товарів із Shopify приходить на 3 с пізніше — як на повільному інтернеті
    await page.route(STOREFRONT_GRAPHQL_RE, async (route) => {
      if ((route.request().postData() ?? '').includes('GetAllProducts')) {
        await new Promise((resolve) => setTimeout(resolve, 3_000));
      }
      await route.fallback();
    });

    await page.goto('/');
    await waitForHydration(page);

    // Правильна поведінка: або кнопка неактивна, поки товар вантажиться (тоді клік дочекається),
    // або клік таки запускає покупку, щойно товар завантажився
    const cartCreated = waitForStorefrontRequest(page, 'CreateCart', 15_000).catch(() => null);
    await header.buyNowButton.click();
    expect(await cartCreated, 'клік по Buy Now пропав: покупка не почалась').not.toBeNull();
  });
});
