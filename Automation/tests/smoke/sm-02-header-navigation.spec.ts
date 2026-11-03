import { test, expect } from '../../fixtures/test';
import { HEADER_NAV } from '../../fixtures/site';
import { escapeRegExp } from '../../utils/text';

/** SM-02. Навігація хедера: desktop — посилання, < 1160 px — бургер-меню; іконка кошика веде на /cart. */
test.describe('SM-02 Навігація хедера', { tag: ['@p0', '@smoke'] }, () => {
  for (const { name, path } of HEADER_NAV) {
    test(`пункт «${name}»`, async ({ page, header }) => {
      await page.goto('/support');
      await header.navigate(name);
      await expect(page).toHaveURL(new RegExp(`${escapeRegExp(path)}/?([?#].*)?$`));
      if (header.isBurgerLayout()) {
        await expect(header.mobileMenu).toBeHidden();
      }
    });
  }

  test('іконка кошика веде на /cart', async ({ page, header }) => {
    await page.goto('/support');
    await header.cartButton.click();
    await expect(page).toHaveURL(/\/cart\/?$/);
  });
});
