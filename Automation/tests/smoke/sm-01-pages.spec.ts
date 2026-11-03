import { test, expect } from '../../fixtures/test';
import { KEY_PAGES } from '../../fixtures/site';
import { KNOWN_ISSUE_ANNOTATION, KNOWN_ISSUE_TAG, PAGE_KNOWN_ISSUES } from '../../fixtures/known-issues';
import { pageWidths } from '../../utils/layout';

/**
 * SM-01. Ключові сторінки відкриваються: HTTP < 400, є хедер і футер,
 * JS/CSS сайту завантажились, сторінка не ширша за екран, немає неперехоплених JS-помилок.
 */
test.describe('SM-01 Ключові сторінки відкриваються', { tag: ['@p0', '@smoke'] }, () => {
  // Сторінки перевіряємо такими, як їх бачить відвідувач — з реальним промо-банером
  test.use({ hidePromoBanner: false });

  for (const path of KEY_PAGES) {
    const issue = PAGE_KNOWN_ISSUES[path];
    test(`${path}`, { tag: issue ? [KNOWN_ISSUE_TAG] : [] }, async ({ page, baseURL, pageErrors }) => {
      if (issue) {
        test.info().annotations.push({ type: KNOWN_ISSUE_ANNOTATION, description: `${path}: ${issue}` });
        test.fail(true, issue);
      }

      const origin = new URL(baseURL!).origin;
      const failedAssets: string[] = [];
      page.on('response', (response) => {
        const url = response.url();
        if (url.startsWith(`${origin}/assets/`) && response.status() >= 400) {
          failedAssets.push(`${response.status()} ${url}`);
        }
      });

      const response = await page.goto(path);
      expect(response, `сторінка ${path} не відповіла`).not.toBeNull();
      expect(response!.status(), `HTTP-статус ${path}`).toBeLessThan(400);

      await expect(page.locator('.header-root')).toBeAttached();
      await expect(page.locator('footer')).toBeAttached();

      // Даємо час довантажитись JS-чанкам; відео й аналітика можуть не дати networkidle — це нормально
      await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);

      expect(failedAssets, 'Файли сайту (JS/CSS) не завантажились (404/5xx)').toEqual([]);

      const { pageWidth, screenWidth } = await pageWidths(page);
      expect(pageWidth, `Сторінка ширша за екран (${pageWidth} > ${screenWidth} px) — горизонтальний скрол`).toBeLessThanOrEqual(
        screenWidth,
      );

      expect.soft(pageErrors, 'Неперехоплені JS-помилки на сторінці').toEqual([]);
    });
  }
});
