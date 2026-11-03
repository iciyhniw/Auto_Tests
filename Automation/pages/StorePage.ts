import { expect, type Locator, type Page } from '@playwright/test';
import { waitForHydration } from '../utils/hydration';

/**
 * Магазин ігор /store (pages/store, components/pages/store/showcases/StoreSubNav.vue).
 * Підменю .store-subnav: кнопка Search (aria-label «Search» / «Close search»), пункти-якорі на секції.
 * Пошук: від 2 символів — випадаючий список .store-subnav__drop-down-item; нічого — «Oops, nothing found»
 * і фрази Rope / Pipes / Space; порожнє поле — історія пошуку (останні 5). Esc закриває пошук.
 * Сторінка результатів: /store/search?q=<запит> — «You searched for: <запит>», картки .search-page__cube-app.
 * Сторінка гри: /store/<slug> — h1, вкладки role="tab" (About, Leaderboard), ціна в CC$.
 */
export class StorePage {
  readonly subnav: Locator;
  readonly subnavItems: Locator;
  readonly searchButton: Locator;
  readonly closeSearchButton: Locator;
  readonly searchInput: Locator;
  readonly searchResults: Locator;
  readonly nothingFound: Locator;
  readonly phrases: Locator;
  readonly historyItems: Locator;
  readonly resultsHeading: Locator;
  readonly resultsQuery: Locator;
  readonly resultCards: Locator;

  constructor(private readonly page: Page) {
    this.subnav = page.locator('.store-subnav').first();
    this.subnavItems = this.subnav.locator('.store-subnav__item');
    this.searchButton = this.subnav.getByRole('button', { name: 'Search', exact: true });
    this.closeSearchButton = this.subnav.getByRole('button', { name: 'Close search', exact: true });
    this.searchInput = this.subnav.locator('.store-subnav__input');
    this.searchResults = this.subnav.locator('.store-subnav__drop-down-item');
    this.nothingFound = this.subnav.locator('.store-subnav__drop-down-empty');
    this.phrases = this.subnav.locator('.store-subnav__phrase');
    this.historyItems = this.subnav.locator('.store-subnav__history-item');
    this.resultsHeading = page.locator('.search-page__heading');
    this.resultsQuery = page.locator('.search-page__query');
    this.resultCards = page.locator('.search-page__cube-app');
  }

  async open(): Promise<void> {
    await this.page.goto('/store');
    await waitForHydration(this.page);
    await expect(this.subnav).toBeVisible();
  }

  async openSearch(): Promise<void> {
    await this.searchButton.click();
    await expect(this.searchInput).toBeFocused();
  }

  async search(query: string): Promise<void> {
    await this.openSearch();
    await this.searchInput.pressSequentially(query, { delay: 50 });
  }

  result(name: RegExp): Locator {
    return this.searchResults.filter({ hasText: name }).first();
  }

  phrase(text: string): Locator {
    return this.phrases.filter({ hasText: text });
  }
}
