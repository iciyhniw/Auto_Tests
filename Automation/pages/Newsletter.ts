import type { Locator, Page } from '@playwright/test';

/**
 * Блок підписки на розсилку внизу головної (components/pages/new-era-light/Subscribe.vue).
 * США (wowcube_country_override ?? /visitor/info) — «Here is your free shipping», інші — «Subscribe for updates».
 * Валідація: «Enter your email» / «Enter a valid email address». Успіх — «You're in» з адресою.
 * Помилка сервера — «Something went wrong. Try again or write to hello@wowcube.com».
 */
export class Newsletter {
  readonly root: Locator;
  readonly heading: Locator;
  readonly email: Locator;
  readonly submit: Locator;
  readonly field: Locator;
  readonly error: Locator;
  readonly successTitle: Locator;
  readonly submittedEmail: Locator;
  readonly legalLinks: Locator;

  constructor(page: Page) {
    this.root = page.locator('section.subscribe');
    this.heading = this.root.getByRole('heading', { level: 2 });
    this.email = this.root.locator('input[name="email"]');
    this.submit = this.root.getByRole('button', { name: 'Subscribe' });
    this.field = this.root.locator('label.textfield');
    this.error = this.root.locator('.field-message');
    this.successTitle = this.root.locator('h2.title');
    this.submittedEmail = this.root.locator('.submitted-email');
    this.legalLinks = this.root.locator('.legal a');
  }

  async scrollIntoView(): Promise<void> {
    await this.root.scrollIntoViewIfNeeded();
  }
}
