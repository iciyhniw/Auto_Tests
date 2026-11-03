import { expect, type Locator, type Page } from '@playwright/test';
import { TEXT } from '../fixtures/site';

/**
 * Спільна основа форм у модальних вікнах.
 * Desktop показує їх у Modal (.modal-portal), телефон (< 768 px) — у нижній шторці (.curtain),
 * але вміст в обох випадках — .popup-content.
 */
class PopupForm {
  readonly root: Locator;
  readonly email: Locator;
  readonly closeButton: Locator;
  readonly fieldMessage: Locator;

  constructor(protected readonly page: Page, text: RegExp | string) {
    this.root = page.locator('.popup-content').filter({ visible: true }).filter({ hasText: text });
    this.email = this.root.locator('input[name="email"]');
    this.closeButton = this.root.locator('button.close');
    this.fieldMessage = this.root.locator('.field-message, .error-message');
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await expect(this.root).toBeHidden();
  }
}

/**
 * «Get notified when it's back» — Notify Me для товарів Sold Out (components/product-notify).
 * Notify me неактивна, поки поле порожнє. Валідація: «Incorrect email». Успіх — «You're in!» + «Back to site».
 * Після підписки кнопка товару стає «Subscribed» (sessionStorage notify_me_handles).
 */
export class NotifyMeModal extends PopupForm {
  readonly heading: Locator;
  readonly submitButton: Locator;
  readonly successHeading: Locator;
  readonly backToSiteButton: Locator;

  constructor(page: Page) {
    super(page, /get notified when it.s back|you're in!|something went wrong/i);
    this.heading = this.root.getByRole('heading', { name: /get notified when it.s back/i });
    this.submitButton = this.root.getByRole('button', { name: 'Notify me' });
    this.successHeading = this.root.getByRole('heading', { name: TEXT.notifyMe.success });
    this.backToSiteButton = this.root.getByRole('button', { name: 'Back to site' });
  }
}

/**
 * Engagement-попап lead-gen (components/lead-gen/EngagementPopupContent.vue):
 * «Who are you getting WOWCube for?», 4 варіанти (Myself, My kids, A teen, A gift), email,
 * Claim Offer (неактивна без email), No, thanks. Валідація — «Incorrect email».
 * Відправку НЕ робимо: вона йде в Customer.io напряму з браузера.
 */
export class EngagementPopup extends PopupForm {
  readonly heading: Locator;
  readonly audienceOptions: Locator;
  readonly claimOfferButton: Locator;
  readonly noThanksButton: Locator;

  constructor(page: Page) {
    super(page, /who are you getting/i);
    this.heading = this.root.getByRole('heading', { name: TEXT.engagement.heading });
    this.audienceOptions = this.root.locator('.audience-options .option');
    this.claimOfferButton = this.root.getByRole('button', { name: 'Claim Offer' });
    this.noThanksButton = this.root.getByText('No, thanks', { exact: true });
  }

  option(label: string): Locator {
    return this.audienceOptions.filter({ hasText: label });
  }
}

/** Exit-intent попап (ExitIntentPopupContent.vue): «Try your luck» і слайдер «Slide to twist». */
export class ExitIntentPopup extends PopupForm {
  readonly heading: Locator;
  readonly subtitle: Locator;

  constructor(page: Page) {
    super(page, TEXT.exitIntent.heading);
    this.heading = this.root.getByRole('heading', { name: TEXT.exitIntent.heading });
    this.subtitle = this.root.locator('.subtitle');
  }
}
