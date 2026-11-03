import { test, expect } from '../../fixtures/test';
import { TEST_EMAIL } from '../../fixtures/site';
import { scrollToFraction } from '../../utils/layout';

/**
 * SM-18. Welcome (engagement) попап lead-gen (ECM-1957):
 * з'являється після прокрутки 50% сторінки (або через 15 с), Claim Offer активна без відповіді на опитування.
 * Форму НЕ відправляємо (вона йде напряму в Customer.io) — закриваємо через «No, thanks».
 */
test.describe('SM-18 Welcome-попап', { tag: ['@p1', '@smoke'] }, () => {
  test.use({ blockLeadGenPopups: false, countryOverride: 'US' });

  test('показується і закривається', async ({ page, home, engagementPopup }) => {
    await home.open();
    await scrollToFraction(page, 0.6);

    await expect(engagementPopup.heading).toBeVisible({ timeout: 25_000 });
    await expect(engagementPopup.audienceOptions).toHaveCount(4);
    await expect(engagementPopup.claimOfferButton).toBeDisabled();

    await engagementPopup.email.fill(TEST_EMAIL);
    await expect(engagementPopup.claimOfferButton, 'опитування має бути необов’язковим').toBeEnabled();

    await engagementPopup.noThanksButton.click();
    await expect(engagementPopup.root).toBeHidden();
  });
});
