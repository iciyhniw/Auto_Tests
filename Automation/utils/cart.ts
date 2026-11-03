import { expect, type Page } from '@playwright/test';
import { STORAGE } from '../fixtures/site';

/**
 * Якщо в браузері вже є кошик (localStorage cartId), чекає, поки сайт його завантажить із Shopify.
 * Ознака — індикатор на іконці кошика в хедері (показується, коли в кошику є товари).
 * Потрібно перед Add to bag на щойно відкритій сторінці: поки кошик не завантажено, сайт створює НОВИЙ кошик
 * і попередні товари губляться (баг сайту, див. README, розділ 9).
 */
export async function waitForSavedCart(page: Page): Promise<void> {
  const hasSavedCart = await page.evaluate((key) => Boolean(localStorage.getItem(key)), STORAGE.cartId);
  if (!hasSavedCart) return;
  // Кошик може бути порожнім (усе видалили) — тоді індикатора не буде, і чекати марно
  await expect(page.locator('.header-root a.cart .indicator'))
    .toBeVisible({ timeout: 10_000 })
    .catch(() => undefined);
}
