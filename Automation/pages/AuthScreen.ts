import type { Locator, Page } from '@playwright/test';

/** Екран входу (vue-auth-kit): відкривається іконкою профілю або /?action=login. */
export class AuthScreen {
  readonly heading: Locator;
  readonly googleButton: Locator;
  readonly appleButton: Locator;
  readonly emailButton: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: /sign in\s*to your account/i });
    this.googleButton = page.getByRole('button', { name: 'Sign in with Google' });
    this.appleButton = page.getByRole('button', { name: 'Sign in with Apple' });
    this.emailButton = page.getByRole('button', { name: 'Sign in via email' });
  }
}
