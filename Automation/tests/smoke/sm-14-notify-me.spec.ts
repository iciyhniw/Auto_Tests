import { test, expect } from '../../fixtures/test';
import { PRODUCTS, TEST_EMAIL, TEXT } from '../../fixtures/site';

/** SM-14. Sold out: замість покупки — Notify Me з формою підписки (ECM-1171). */
test.describe('SM-14 Sold out: Notify Me', { tag: ['@p1', '@smoke'] }, () => {
  test('у Shop All', async ({ shopAll, notifyMe }) => {
    await shopAll.open();
    await shopAll.revealCard(PRODUCTS.blackEdition.cardName);
    const card = shopAll.card(PRODUCTS.blackEdition.cardName);
    await expect(card.getByRole('button', { name: 'Buy Now', exact: true })).toHaveCount(0);

    await card.getByRole('button', { name: 'Notify Me', exact: true }).click();
    await expect(notifyMe.heading).toBeVisible();
    await expect(notifyMe.submitButton, 'кнопка має бути неактивна, поки поле порожнє').toBeDisabled();

    await notifyMe.email.fill(TEST_EMAIL);
    await expect(notifyMe.submitButton).toBeEnabled();
    await notifyMe.close();
  });

  test('на сторінці товару', async ({ product }) => {
    await product.open(PRODUCTS.blackEdition.handle);
    await expect(product.tag).toHaveText(/sold out/i);
    await expect(product.availability).toHaveText(TEXT.availability.soldOut);
    await expect(product.notifyMeButton).toBeVisible();
    await expect(product.addToBagButton).toHaveCount(0);
  });
});
