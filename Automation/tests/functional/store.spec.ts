import { test, expect } from '../../fixtures/test';
import { STORE_SEARCH_PHRASES } from '../../fixtures/site';

/** Магазин ігор: пошук, підказки, історія, сторінка результатів, підменю. */
test.describe('Store', { tag: ['@functional', '@p1'] }, () => {
  test.use({ hidePromoBanner: true });

  test('нічого не знайдено → підказки, клік по підказці шукає', async ({ store }) => {
    await store.open();
    await store.search('zzqxw');
    await expect(store.nothingFound).toHaveText('Oops, nothing found');
    await expect(store.phrases).toHaveText([...STORE_SEARCH_PHRASES]);

    await store.phrase('Rope').click();
    await expect(store.searchInput).toHaveValue('Rope');
    await expect(store.result(/cut the rope/i)).toBeVisible();
  });

  test('Esc закриває пошук', async ({ store }) => {
    await store.open();
    await store.search('Cut');
    await store.searchInput.press('Escape');
    await expect(store.searchInput).toBeHidden();
    await expect(store.searchButton).toBeVisible();
  });

  test('запит зберігається в історії пошуку', async ({ page, store }) => {
    await store.open();
    await store.search('Cut');
    await store.result(/cut the rope/i).click();
    await expect(page).toHaveURL(/\/store\/cut/);

    await store.open();
    await store.openSearch();
    await expect(store.historyItems.filter({ hasText: 'Cut' })).toBeVisible();
  });

  test('сторінка результатів /store/search', async ({ page, store }) => {
    await page.goto('/store/search?q=rope');
    await expect(store.resultsHeading).toHaveText(/you searched for:\s*rope/i);
    await expect(store.resultCards.filter({ hasText: /cut the rope/i }).first()).toBeVisible();
  });

  test('сторінка результатів: нічого не знайдено', async ({ page }) => {
    await page.goto('/store/search?q=zzqxw');
    await expect(page.locator('.search-page__nothing-found-label')).toHaveText('Nothing found');
  });

  test('пункт підменю прокручує до свого розділу', async ({ page, store }) => {
    await store.open();
    const item = store.subnavItems.first();
    const href = (await item.getAttribute('href')) ?? '';
    expect(href, 'пункт підменю має бути якорем #…').toMatch(/^#.+/);
    await item.click();
    await expect(page.locator(href)).toBeInViewport();
  });
});
