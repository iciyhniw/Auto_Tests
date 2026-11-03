import { test, expect } from '../../fixtures/test';
import { TEST_EMAIL, TEXT } from '../../fixtures/site';

/**
 * Підписка на розсилку: відправка форми. API трекінгу підмінене (fixtures/mocks.ts),
 * тому реальної підписки немає — перевіряємо, що сайт надіслав і як показав відповідь.
 */
test.describe('Newsletter: відправка', { tag: ['@functional', '@p1'] }, () => {
  test.use({ hidePromoBanner: true });

  test('успішна підписка', async ({ home, newsletter, trackApi }) => {
    await home.open();
    await newsletter.scrollIntoView();
    await newsletter.email.fill(TEST_EMAIL);
    await newsletter.submit.click();

    await expect(newsletter.successTitle).toHaveText(TEXT.newsletter.success);
    await expect(newsletter.submittedEmail).toHaveText(TEST_EMAIL);

    const [call] = trackApi.callsTo('subscribe');
    expect(call, 'сайт не надіслав запит на підписку').toBeTruthy();
    expect(call.body).toMatchObject({ email: TEST_EMAIL, tags: ['newsletter.homepage'] });
  });

  test('помилка сервера показується під полем', async ({ home, newsletter, trackApi }) => {
    trackApi.fail();
    await home.open();
    await newsletter.scrollIntoView();
    await newsletter.email.fill(TEST_EMAIL);
    await newsletter.submit.click();

    await expect(newsletter.error).toHaveText(TEXT.newsletter.serverError);
    await expect(newsletter.field).toHaveClass(/error/);
    await expect(newsletter.successTitle).toHaveCount(0);
  });

  test('посилання на умови і політику конфіденційності', async ({ home, newsletter }) => {
    await home.open();
    await expect(newsletter.legalLinks.filter({ hasText: 'Terms of Service' })).toHaveAttribute('href', '/terms-of-service');
    await expect(newsletter.legalLinks.filter({ hasText: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
  });
});
