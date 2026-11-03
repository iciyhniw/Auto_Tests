import { test, expect } from '../../fixtures/test';
import { MORE_MENU_DESKTOP, MORE_MENU_MOBILE, PRODUCTS, STORAGE } from '../../fixtures/site';

/** Хедер: меню «More», логотип, індикатор кошика, вхід. */
test.describe('Хедер', { tag: ['@functional', '@p1'] }, () => {
  test.use({ hidePromoBanner: true });

  test('«More» містить усі пункти і веде на сторінку', async ({ page, header }) => {
    await page.goto('/support');
    const more = await header.openMore();
    const items = header.isBurgerLayout() ? MORE_MENU_MOBILE : MORE_MENU_DESKTOP;
    for (const { name } of items) {
      await expect(header.moreLink(more, name), `у «More» немає пункту «${name}»`).toBeVisible();
    }
    await header.moreLink(more, 'Reviews').click();
    await expect(page).toHaveURL(/\/reviews\/?$/);
  });

  test('логотип веде на головну', async ({ page, header }) => {
    await page.goto('/support');
    await header.logo.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('індикатор кошика з’являється після додавання товару і зникає після видалення', async ({
    page,
    header,
    product,
    cartPopup,
  }) => {
    await product.open(PRODUCTS.travelCase.handle);
    await expect(header.cartIndicator).toHaveCount(0);

    await product.addToBag();
    await cartPopup.expectOpenWith(PRODUCTS.travelCase.title, 1);
    await expect(header.cartIndicator).toBeVisible();
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE.cartId)).toBeTruthy();

    await cartPopup.removeButton(PRODUCTS.travelCase.title).click();
    await expect(cartPopup.heading).toHaveText('Bag is empty');
    await expect(header.cartIndicator).toHaveCount(0);
  });

  test('іконка профілю відкриває екран входу', async ({ page, header, authScreen }) => {
    await page.goto('/support');
    await header.profileButton.click();
    await expect(authScreen.heading).toBeVisible();
    await expect(authScreen.googleButton).toBeVisible();
    await expect(authScreen.appleButton).toBeVisible();
    await expect(authScreen.emailButton).toBeVisible();
  });

  test('/?action=login відкриває екран входу і прибирає параметр з адреси', async ({ page, authScreen }) => {
    await page.goto('/?action=login');
    await expect(authScreen.heading).toBeVisible();
    await expect(page).not.toHaveURL(/action=login/);
  });
});
