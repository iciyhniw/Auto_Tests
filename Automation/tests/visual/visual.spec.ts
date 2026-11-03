import { test, expect } from '../../fixtures/test';
import { PRODUCTS } from '../../fixtures/site';
import { prepareForScreenshot } from '../../utils/visual';

/**
 * Візуальні порівняння: скриншот частини сторінки порівнюється з еталоном (tests/__screenshots__).
 * Запуск: npm run test:visual. Перший запуск / після погоджених змін дизайну: npm run test:visual:update.
 * Беремо лише стабільні частини сайту: каталог, ціни й акції змінюються з адмінки і дали б хибні падіння.
 */
test.describe('Visual', { tag: ['@visual'] }, () => {
  test.use({ hidePromoBanner: true, countryOverride: 'DE', homepageVariant: 'A' });

  test('хедер', async ({ page, header }) => {
    await page.goto('/support');
    await prepareForScreenshot(page);
    await expect(header.bar).toHaveScreenshot('header.png');
  });

  test('меню «More» / бургер-меню', async ({ page, header }) => {
    await page.goto('/support');
    const menu = await header.openMore();
    await prepareForScreenshot(page);
    await expect(menu).toHaveScreenshot('more-menu.png');
  });

  test('футер', async ({ page, footer }) => {
    await page.goto('/support');
    await footer.root.scrollIntoViewIfNeeded();
    await prepareForScreenshot(page);
    await expect(footer.root).toHaveScreenshot('footer.png');
  });

  test('порожній кошик', async ({ page, cart }) => {
    await cart.open();
    await expect(cart.emptyHeading).toBeVisible();
    await prepareForScreenshot(page);
    // Рекомендації під кошиком залежать від каталогу — маскуємо
    await expect(page).toHaveScreenshot('cart-empty.png', { mask: [cart.suggestions] });
  });

  test('сторінка 404', async ({ page, errorPage }) => {
    await page.goto('/qa-nonexistent-page');
    await expect(errorPage.root).toBeVisible();
    await prepareForScreenshot(page);
    await expect(errorPage.root).toHaveScreenshot('error-404.png');
  });

  test('блок підписки (не США)', async ({ page, home, newsletter }) => {
    await home.open();
    await newsletter.scrollIntoView();
    await prepareForScreenshot(page);
    await expect(newsletter.root).toHaveScreenshot('newsletter-intl.png');
  });

  test('форма Notify Me', async ({ page, product, notifyMe }) => {
    await product.open(PRODUCTS.blackEdition.handle);
    await product.notifyMeButton.click();
    await expect(notifyMe.heading).toBeVisible();
    await prepareForScreenshot(page);
    await expect(notifyMe.root).toHaveScreenshot('notify-me.png');
  });

  test('бічна панель кошика', async ({ page, product, cartPopup }) => {
    await product.open(PRODUCTS.travelCase.handle);
    await product.addToBag();
    await cartPopup.expectOpenWith(PRODUCTS.travelCase.title, 1);
    await prepareForScreenshot(page);
    // Ціни і рекомендації змінюються з адмінки — маскуємо
    await expect(cartPopup.root).toHaveScreenshot('cart-popup.png', {
      mask: [cartPopup.suggestions, cartPopup.root.locator('.price'), cartPopup.subtotal],
    });
  });
});
