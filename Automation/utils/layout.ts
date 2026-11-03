import { expect, type Page } from '@playwright/test';

/** Ширина сторінки і ширина екрана. */
export async function pageWidths(page: Page): Promise<{ pageWidth: number; screenWidth: number }> {
  return page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    screenWidth: document.documentElement.clientWidth,
  }));
}

/**
 * Перевіряє, що сторінка не ширша за екран.
 * Якщо ширша, мобільний браузер зменшує сторінку, і натискання на закріплені панелі
 * (sticky-bar) промахуються — тест упав би з незрозумілим таймаутом. Краще впасти тут, з причиною.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  // Промо-банер приходить окремим запитом — даємо сторінці довантажитись
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => undefined);
  const { pageWidth, screenWidth } = await pageWidths(page);
  expect(
    pageWidth,
    `Сторінка ширша за екран (${pageWidth} > ${screenWidth} px): горизонтальний скрол, на телефоні натискання промахуються`,
  ).toBeLessThanOrEqual(screenWidth);
}

/** Прокрутка сторінки до позиції в пікселях. */
export async function scrollToY(page: Page, y: number): Promise<void> {
  await page.evaluate((top) => window.scrollTo(0, top), y);
}

/** Прокрутка на частку висоти сторінки (0.5 = половина, 1 = до кінця). */
export async function scrollToFraction(page: Page, fraction: number): Promise<void> {
  await page.evaluate((f) => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, Math.round(total * f));
  }, fraction);
}

export type ContainerBox = {
  /** Клас контейнера: container-next, container-1080… */
  cls: string;
  /** Короткий опис елемента для звіту */
  element: string;
  /** Ширина вмісту (без стандартних полів контейнера) */
  contentWidth: number;
  /** Лівий край вмісту від лівого краю сторінки */
  contentLeft: number;
};

/**
 * Усі видимі контейнери в контенті сторінки (без хедера, футера, нижньої панелі, банера, модалок).
 * Ширину вмісту рахуємо як ширину блока мінус СТАНДАРТНІ поля контейнера: окремі блоки (картки юридичних сторінок,
 * «Download WOWCube Connect») мають власні відступи всередині, але зовнішні межі в них — як у контейнера.
 */
export async function measureContainers(
  page: Page,
  options: { gutterNext: number; legacyGutter: number; exclude: readonly string[] },
): Promise<ContainerBox[]> {
  return page.evaluate(({ gutterNext, legacyGutter, exclude }) => {
    const skip = ['header', 'footer', '.header-root', '.user-bag-checkout-bar', '.user-bag-checkout-bar-mobile', '.website-banner', '.main-layout-overlay', ...exclude].join(', ');
    const boxes: { cls: string; element: string; contentWidth: number; contentLeft: number }[] = [];
    document.querySelectorAll<HTMLElement>('[class*="container-"]').forEach((el) => {
      const cls = Array.from(el.classList).find((c) => /^container-(next|\d+)$/.test(c));
      if (!cls || el.closest(skip)) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const gutter = cls === 'container-next' ? gutterNext : legacyGutter;
      const extra = Array.from(el.classList).filter((c) => c !== cls).slice(0, 2).join('.');
      boxes.push({
        cls,
        element: `${el.tagName.toLowerCase()}${extra ? `.${extra}` : ''}`,
        contentWidth: Math.round(rect.width - 2 * gutter),
        contentLeft: Math.round(rect.left + window.scrollX + gutter),
      });
    });
    return boxes;
  }, options);
}
