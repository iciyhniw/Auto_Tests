import { test, expect } from '../../fixtures/test';
import { MORE_MENU_DESKTOP, MORE_MENU_MOBILE } from '../../fixtures/site';

/**
 * Внутрішні посилання хедера і футера ведуть на існуючі сторінки (HTTP < 400).
 * Перевіряємо HTTP-запитом, без браузера, тому достатньо одного проєкту.
 */
test('Посилання хедера і футера відкриваються', { tag: ['@functional', '@p1'] }, async ({ page, footer, isMobile }) => {
  test.skip(isMobile, 'Посилання ті самі, достатньо перевірити на desktop');

  await page.goto('/support');
  await expect(footer.root).toBeAttached();
  const menuPaths: string[] = [...MORE_MENU_DESKTOP, ...MORE_MENU_MOBILE].map((item) => item.path);
  const paths = new Set<string>([...menuPaths, ...(await footer.internalPaths())]);

  const broken: string[] = [];
  for (const path of paths) {
    const response = await page.request.get(path, { maxRedirects: 5 });
    if (response.status() >= 400) broken.push(`${response.status()} ${path}`);
  }
  expect(broken, 'Посилання на неіснуючі сторінки').toEqual([]);
});
