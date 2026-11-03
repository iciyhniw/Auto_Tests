import { test, expect } from '../../fixtures/test';
import { TEXT } from '../../fixtures/site';

/** SM-13. Підписка на розсилку на головній: валідація і гео-версії блоку (ECM-2081, ECM-2137, ECM-2138). */
test.describe('SM-13 Newsletter', { tag: ['@p1', '@smoke'] }, () => {
  test('валідація порожнього і невалідного email', async ({ home, newsletter, trackApi }) => {
    await home.open();
    await newsletter.scrollIntoView();

    await newsletter.submit.click();
    await expect(newsletter.field).toHaveClass(/error/);
    await expect(newsletter.error).toHaveText(TEXT.newsletter.emptyEmail);

    await newsletter.email.fill('qa-invalid@');
    await newsletter.submit.click();
    await expect(newsletter.error).toHaveText(TEXT.newsletter.invalidEmail);
    expect(trackApi.callsTo('subscribe'), 'невалідна форма не повинна відправлятись').toHaveLength(0);
  });

  test.describe('для США', () => {
    test.use({ countryOverride: 'US' });
    test('версія з безкоштовною доставкою', async ({ home, newsletter }) => {
      await home.open();
      await expect(newsletter.heading).toHaveText(TEXT.newsletter.usTitle);
    });
  });

  test.describe('поза США', () => {
    test.use({ countryOverride: 'DE' });
    test('стандартна версія', async ({ home, newsletter }) => {
      await home.open();
      await expect(newsletter.heading).toHaveText(TEXT.newsletter.intlTitle);
    });
  });
});
