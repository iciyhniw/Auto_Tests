import type { Locator, Page } from '@playwright/test';

/** Сторінка помилки (pages/_error): «404 Not found», кнопка View Games → /store. */
export class ErrorPage {
  readonly root: Locator;
  readonly message: Locator;
  readonly viewGamesLink: Locator;

  constructor(page: Page) {
    this.root = page.locator('.error-page');
    this.message = this.root.locator('.error-page__message');
    this.viewGamesLink = this.root.locator('a.error-page__button');
  }
}
