import { test, expect } from '../../fixtures/test';
import { PRODUCTS, TEST_EMAIL, TEXT } from '../../fixtures/site';

/**
 * Notify Me для товару Sold Out: валідація і відправка.
 * API трекінгу підмінене (fixtures/mocks.ts) — реальної підписки немає.
 */
test.describe('Notify Me: відправка', { tag: ['@functional', '@p1'] }, () => {
  test.use({ hidePromoBanner: true });
  const { handle } = PRODUCTS.blackEdition;

  test.beforeEach(async ({ product, notifyMe }) => {
    await product.open(handle);
    await product.notifyMeButton.click();
    await expect(notifyMe.heading).toBeVisible();
  });

  test('невалідний email', async ({ notifyMe, trackApi }) => {
    await notifyMe.email.fill('qa-invalid@');
    await notifyMe.submitButton.click();
    await expect(notifyMe.fieldMessage).toHaveText(TEXT.notifyMe.invalidEmail);
    expect(trackApi.calls).toHaveLength(0);
  });

  test('успішна підписка → «Subscribed»', async ({ page, notifyMe, trackApi }) => {
    await notifyMe.email.fill(TEST_EMAIL);
    await notifyMe.submitButton.click();

    await expect(notifyMe.successHeading).toBeVisible();
    const [call] = trackApi.callsTo('event');
    expect(call, 'сайт не надіслав подію підписки').toBeTruthy();
    expect(call.body).toMatchObject({
      email: TEST_EMAIL,
      name: 'notify_me_subscribed',
      data: { kind: 'product', identifier: handle },
    });

    await notifyMe.backToSiteButton.click();
    await expect(notifyMe.root).toBeHidden();
    const button = page.getByRole('button', { name: 'Subscribed' }).filter({ visible: true }).first();
    await expect(button).toHaveText(/subscribed/i);
    await expect(button).toBeDisabled();
  });

  test('помилка сервера', async ({ notifyMe, trackApi }) => {
    trackApi.fail();
    await notifyMe.email.fill(TEST_EMAIL);
    await notifyMe.submitButton.click();
    await expect(notifyMe.fieldMessage).toHaveText(TEXT.notifyMe.submitError);
    await expect(notifyMe.successHeading).toHaveCount(0);
  });
});
