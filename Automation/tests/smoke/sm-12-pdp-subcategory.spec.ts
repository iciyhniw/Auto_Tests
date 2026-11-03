import { test, expect } from '../../fixtures/test';
import { PRODUCTS, SUBCATEGORIES } from '../../fixtures/site';

/** SM-12. На PDP є перемикач між товарами тієї ж підкатегорії (ECM-1907). */
test.describe('SM-12 PDP: товари тієї ж підкатегорії', { tag: ['@p1', '@smoke'] }, () => {
  const cases = [
    { name: 'куб', handle: PRODUCTS.base.handle, group: SUBCATEGORIES.cubes },
    { name: 'аксесуар', handle: PRODUCTS.travelCase.handle, group: SUBCATEGORIES.accessories },
    { name: 'gift card', handle: PRODUCTS.giftCard300.handle, group: SUBCATEGORIES.giftCards },
  ];

  for (const { name, handle, group } of cases) {
    test(name, async ({ page, product }) => {
      await product.open(handle);
      // Перемикач малюється не одразу — чекаємо, а потім читаємо посилання
      await expect(product.subcategoryLinks.first()).toBeVisible();
      const hrefs = await product.subcategoryLinks.evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));
      expect(hrefs.length, 'перемикач підкатегорії порожній').toBeGreaterThan(1);
      const allowed: string[] = group.map((h) => `/product/${h}`);
      for (const href of hrefs) {
        expect(allowed, `у перемикачі товар з іншої підкатегорії: ${href}`).toContain(href);
      }

      await expect(product.subcategoryLinks.and(page.locator('.active'))).toHaveAttribute('href', `/product/${handle}`);

      const other = hrefs.find((href) => href !== `/product/${handle}`)!;
      await product.subcategoryLinks.and(page.locator(`[href="${other}"]`)).first().click();
      await expect(page).toHaveURL(new RegExp(`${other}$`));
      await expect(product.subcategoryLinks.and(page.locator('.active'))).toHaveAttribute('href', other);
    });
  }
});
