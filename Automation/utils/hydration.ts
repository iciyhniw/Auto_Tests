import { expect, type Page } from '@playwright/test';

/**
 * Чекає, поки Vue «оживить» сторінку (hydration).
 * Сайт рендериться на сервері (SSR): кнопки видно одразу, але до hydration кліки по них нічого не роблять.
 * Ознака завершення — клас `mounted` на хедері (AppHeader.vue, onMounted).
 */
export async function waitForHydration(page: Page): Promise<void> {
  await expect(page.locator('.header-root header'), 'сторінка не завершила hydration (JS не запустився)').toHaveClass(
    /\bmounted\b/,
    { timeout: 20_000 },
  );
}
