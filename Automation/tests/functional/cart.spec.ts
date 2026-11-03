import { test, expect } from '../../fixtures/test';
import { PRODUCTS, STOREFRONT_GRAPHQL_RE, TEXT } from '../../fixtures/site';
import { waitForStorefrontRequest } from '../../utils/shopify';
import { parsePrice } from '../../utils/text';
import { scrollToY } from '../../utils/layout';

/** Кошик: бічна панель, сторінка /cart, підсумки, збереження між перезавантаженнями. */
test.describe('Кошик', { tag: ['@functional', '@p1'] }, () => {
  test.use({ hidePromoBanner: true });

  test('порожній кошик', async ({ cart }) => {
    await cart.open();
    await expect(cart.emptyHeading).toBeVisible();
    await expect(cart.items).toHaveCount(0);
  });

  test('бічна панель: кількість, підсумок і видалення', async ({ product, cartPopup }) => {
    const { handle, title } = PRODUCTS.travelCase;
    await product.open(handle);
    await product.addToBag();
    await cartPopup.expectOpenWith(title, 1);
    await expect(cartPopup.heading).toHaveText(TEXT.cartPopupAdded);

    const unit = parsePrice(await cartPopup.linePrice(title).innerText());
    await expect(cartPopup.decreaseButton(title), '− має бути неактивним при кількості 1').toBeDisabled();
    await expect.poll(async () => parsePrice(await cartPopup.subtotal.innerText())).toBeCloseTo(unit, 2);

    await cartPopup.increaseButton(title).click();
    await expect(cartPopup.quantity(title)).toHaveText('2');
    await expect.poll(async () => parsePrice(await cartPopup.subtotal.innerText())).toBeCloseTo(unit * 2, 2);

    await cartPopup.removeButton(title).click();
    await expect(cartPopup.heading).toHaveText(TEXT.cartPopupEmpty);
    await expect(cartPopup.checkoutButton).toBeDisabled();
  });

  test('заголовок рахує рядки, підсумок = сума рядків', async ({ page, product, cartPopup, cart }) => {
    await product.open(PRODUCTS.travelCase.handle);
    await product.addToBag();
    await cartPopup.expectOpenWith(PRODUCTS.travelCase.title, 1);
    await cartPopup.close();

    await product.open(PRODUCTS.fabricCase.handle);
    // Додавання в наявний кошик іде в Shopify із затримкою 400 мс (debounce) — чекаємо, поки збережеться
    const saved = waitForStorefrontRequest(page, 'AddCartLines');
    await product.addToBag();
    await cartPopup.expectOpenWith(PRODUCTS.fabricCase.title, 1);
    await expect(cartPopup.items).toHaveCount(2);
    await (await saved).response();

    await cart.open();
    await expect(cart.heading).toHaveText('2 items in your bag');
    await cart.increase(PRODUCTS.fabricCase.title);
    await expect(cart.quantity(PRODUCTS.fabricCase.title)).toHaveText('2');
    // Заголовок рахує рядки, а не штуки
    await expect(cart.heading).toHaveText('2 items in your bag');

    if ((page.viewportSize()?.width ?? 1440) >= 1200) {
      await expect
        .poll(async () => {
          const lines = await cart.items.locator('.tools .price').allInnerTexts();
          const sum = lines.map(parsePrice).reduce((a, b) => a + b, 0);
          return Math.abs(sum - parsePrice(await cart.subtotal.innerText()));
        }, { message: 'Subtotal не дорівнює сумі рядків' })
        .toBeLessThan(0.01);
    }
  });

  test('кошик зберігається після перезавантаження сторінки', async ({ page, product, cartPopup, cart }) => {
    await product.open(PRODUCTS.travelCase.handle);
    await product.addToBag();
    await cartPopup.expectOpenWith(PRODUCTS.travelCase.title, 1);

    await cart.open();
    await expect(cart.item(PRODUCTS.travelCase.title)).toBeVisible();
    await page.reload();
    await expect(cart.item(PRODUCTS.travelCase.title)).toBeVisible();
    await expect(cart.title(PRODUCTS.travelCase.title)).toHaveAttribute('href', `/product/${PRODUCTS.travelCase.handle}`);
  });

  test('нижня панель з кошиком на сторінці товару', async ({ page, product, cartPopup, checkoutBar }) => {
    await product.open(PRODUCTS.travelCase.handle);
    test.skip(!product.isAsideLayout(), 'Вужче 1200 px на PDP замість неї панель товару (.sticky-bar)');

    await product.addToBag();
    await cartPopup.expectOpenWith(PRODUCTS.travelCase.title, 1);
    await cartPopup.close();

    await scrollToY(page, 600);
    await expect(checkoutBar.desktop).toHaveClass(/visible/);
    await expect(checkoutBar.label).toHaveText(PRODUCTS.travelCase.title);
    await expect(checkoutBar.checkoutButton).toBeEnabled();
  });

  test('товар, доданий одразу після відкриття сторінки, не затирає кошик', async ({
    page,
    product,
    cartPopup,
    cart,
  }) => {
    await product.open(PRODUCTS.travelCase.handle);
    await product.addToBag();
    await cartPopup.expectOpenWith(PRODUCTS.travelCase.title, 1);

    // Сповільнюємо завантаження збереженого кошика на 3 с — як на повільному мобільному інтернеті
    await page.route(STOREFRONT_GRAPHQL_RE, async (route) => {
      if ((route.request().postData() ?? '').includes('GetCartById')) {
        await new Promise((resolve) => setTimeout(resolve, 3_000));
      }
      await route.fallback();
    });
    await product.open(PRODUCTS.fabricCase.handle);
    // Тиснемо одразу, без очікування кошика (product.addToBag() чекав би)
    await product.addToBagButton.click();
    await cartPopup.expectOpenWith(PRODUCTS.fabricCase.title, 1);
    await page.unroute(STOREFRONT_GRAPHQL_RE);

    await cart.open();
    await expect(cart.item(PRODUCTS.fabricCase.title)).toBeVisible();
    await expect(cart.item(PRODUCTS.travelCase.title), 'перший товар зник із кошика').toBeVisible({ timeout: 10_000 });
  });

  test('підказка про податки написана латиницею', async ({ product, cartPopup }) => {
    await product.open(PRODUCTS.travelCase.handle);
    await product.addToBag();
    await cartPopup.expectOpenWith(PRODUCTS.travelCase.title, 1);
    await expect(cartPopup.hint).toHaveText(TEXT.taxesHint, { timeout: 5_000 });
  });

  test('View bag одразу після додавання в наявний кошик показує всі товари', async ({
    page,
    product,
    cartPopup,
    cart,
  }) => {
    await product.open(PRODUCTS.base.handle);
    await product.addToBag();
    await cartPopup.expectOpenWith(PRODUCTS.base.title, 1);
    await cartPopup.close();

    // Другий товар — у вже створений кошик (оптимістичне оновлення + запис у Shopify через 400 мс)
    await product.suggestionAddToBag(PRODUCTS.travelCase.title).click();
    await cartPopup.expectOpenWith(PRODUCTS.travelCase.title, 1);
    await cartPopup.viewBagButton.click();

    await expect(page).toHaveURL(/\/cart\/?$/);
    await expect(cart.item(PRODUCTS.base.title)).toBeVisible();
    await expect(cart.item(PRODUCTS.travelCase.title), 'другий товар не потрапив у кошик').toBeVisible();
    await expect(cart.heading).toHaveText('2 items in your bag');
  });
});
