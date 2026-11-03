import { test, expect } from '../../fixtures/test';
import { PRODUCTS } from '../../fixtures/site';
import { parsePrice } from '../../utils/text';

/** SM-07. Кошик: збільшення і зменшення кількості, перерахунок ціни, видалення. */
test('SM-07 Кошик: кількість і видалення', { tag: ['@p0', '@smoke'] }, async ({ page, product, cartPopup, cart }) => {
  const { handle, title } = PRODUCTS.travelCase;

  await product.open(handle);
  const unitPrice = parsePrice(await product.price.innerText());
  await product.addToBag();
  await cartPopup.expectOpenWith(title, 1);

  await cartPopup.viewBagButton.click();
  await expect(page).toHaveURL(/\/cart\/?$/);
  await expect(cart.heading).toHaveText('1 item in your bag');
  await expect(cart.quantity(title)).toHaveText('1');

  await cart.increase(title);
  await expect(cart.quantity(title)).toHaveText('2');
  await expect
    .poll(async () => parsePrice(await cart.linePrice(title).innerText()), { message: 'ціна рядка не перерахувалась' })
    .toBeCloseTo(unitPrice * 2, 2);

  await cart.decrease(title);
  await expect(cart.quantity(title)).toHaveText('1');

  await cart.remove(title);
  await expect(cart.emptyHeading).toBeVisible();
});
