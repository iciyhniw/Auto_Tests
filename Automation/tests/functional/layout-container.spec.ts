import { test, expect } from '../../fixtures/test';
import { CONTAINER, CONTAINER_PAGES } from '../../fixtures/site';
import { measureContainers } from '../../utils/layout';
import { waitForHydration } from '../../utils/hydration';
import type { Page } from '@playwright/test';

/**
 * ECM-2168 / ECM-2169: на всіх сторінках (крім товару, кошика і профілю) вміст обмежений контейнером головної:
 * 1000 px на екранах до 1740 px і 1200 px від 1740 px, по центру.
 * Перевіряємо на 1440 і 1920 px — саме там різниця між старим і новим контейнером помітна.
 */

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

/** Очікувані межі вмісту для поточного розміру вікна. */
async function expectedContent(page: Page) {
  const { innerWidth, clientWidth } = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  const wide = innerWidth >= CONTAINER.wideBreakpoint;
  const gutter = wide ? CONTAINER.gutter.wide : CONTAINER.gutter.regular;
  const width = Math.min(wide ? CONTAINER.content.wide : CONTAINER.content.regular, clientWidth - 2 * gutter);
  return { width, left: Math.round((clientWidth - width) / 2), gutter };
}

async function openStable(page: Page, path: string): Promise<void> {
  const response = await page.goto(path);
  expect(response?.status(), `${path} не відкрилась`).toBeLessThan(400);
  await waitForHydration(page);
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
}

test.describe('ECM-2168 Ширина контейнера як на головній', { tag: ['@functional', '@p2', '@layout'] }, () => {
  test.use({ hidePromoBanner: true });

  test.beforeEach(async ({ isMobile }) => {
    test.skip(isMobile, 'Правило стосується ширших екранів; на телефоні контейнер на всю ширину з полями 10 px');
  });

  for (const path of CONTAINER_PAGES) {
    test(`${path}`, async ({ page }) => {
      const problems: string[] = [];

      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        if (viewport === VIEWPORTS[0]) await openStable(page, path);
        // Після зміни розміру даємо сторінці два кадри на перерахунок верстки
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

        const expected = await expectedContent(page);
        const boxes = await measureContainers(page, {
          gutterNext: expected.gutter,
          legacyGutter: CONTAINER.legacyGutter,
          exclude: CONTAINER.allowedWider,
        });

        if (!boxes.some((box) => box.cls === 'container-next')) {
          problems.push(`${viewport.width}px: на сторінці немає контейнера головної (.container-next)`);
        }
        for (const box of boxes) {
          if (Math.abs(box.contentWidth - expected.width) > 1 || Math.abs(box.contentLeft - expected.left) > 1) {
            problems.push(
              `${viewport.width}px: ${box.cls} <${box.element}> — вміст ${box.contentWidth}px від ${box.contentLeft}px, ` +
                `очікувалось ${expected.width}px від ${expected.left}px`,
            );
          }
        }
      }

      expect([...new Set(problems)], `${path}: блоки не по ширині контейнера головної`).toEqual([]);
    });
  }

  test('ECM-2291 лого і іконки хедера на одній лінії з краями вмісту', async ({ page, header }) => {
    const problems: string[] = [];
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      if (viewport === VIEWPORTS[0]) await openStable(page, '/support');
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

      const expected = await expectedContent(page);
      const logo = await header.logo.boundingBox();
      const icons = await header.root.locator('.icons').boundingBox();
      if (!logo || !icons) {
        problems.push(`${viewport.width}px: не знайдено лого або іконки хедера`);
        continue;
      }
      const contentRight = expected.left + expected.width;
      if (Math.abs(logo.x - expected.left) > 2) {
        problems.push(`${viewport.width}px: лого починається з ${Math.round(logo.x)}px, вміст — з ${expected.left}px`);
      }
      if (Math.abs(icons.x + icons.width - contentRight) > 2) {
        problems.push(`${viewport.width}px: іконки закінчуються на ${Math.round(icons.x + icons.width)}px, вміст — на ${contentRight}px`);
      }
    }
    expect(problems, 'Хедер не вирівняний з контейнером головної').toEqual([]);
  });
});
