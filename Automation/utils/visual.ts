import type { Page } from '@playwright/test';

/**
 * Готує сторінку до скриншота: чекає мережу і шрифти, ховає те, що змінюється само по собі
 * (смуги прокрутки, відео, віджет Affirm з персональним текстом, нижні панелі з цінами).
 */
export async function prepareForScreenshot(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content: `
      ::-webkit-scrollbar { display: none !important; }
      video, iframe { visibility: hidden !important; }
      .affirm-widget, .price-options, .affirm-as-low-as { visibility: hidden !important; }
      /* нижні закріплені панелі з цінами перекривають блоки внизу екрана */
      .user-bag-checkout-bar, .user-bag-checkout-bar-mobile { display: none !important; }
    `,
  });
}
