import { expect, type Page } from '@playwright/test';
import { CHECKOUT_URL_RE } from '../fixtures/site';

/**
 * Перехоплює перехід на Shopify checkout і віддає замість нього порожню сторінку-заглушку.
 * Сам кошик у Shopify створюється по-справжньому (запити до Storefront API не чіпаємо),
 * а от сторінку checkout (на alpha вона під паролем) не вантажимо — тест швидший і стабільніший.
 * Справжній перехід перевіряє лише SM-08.
 */
export async function stubCheckout(page: Page): Promise<void> {
  await page.route(CHECKOUT_URL_RE, async (route) => {
    if (route.request().isNavigationRequest()) {
      await route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>QA checkout stub</title><h1>QA checkout stub</h1>' });
      return;
    }
    await route.fallback();
  });
}

/** Чекає, що браузер перейшов на checkout. Повертає адресу checkout. */
export async function expectCheckout(page: Page, timeout = 45_000): Promise<URL> {
  await page.waitForURL(CHECKOUT_URL_RE, { waitUntil: 'commit', timeout });
  const url = new URL(page.url());
  expect(url.protocol, 'checkout має бути по https').toBe('https:');
  return url;
}
