import { test, expect } from '../../fixtures/test';
import { SEO_PAGES } from '../../fixtures/site';
import { escapeRegExp } from '../../utils/text';

/** SEO: title, description, og:url сторінок (customOptions.seo у +Page.vue, common/seo.ts). */
test.describe('SEO', { tag: ['@functional', '@p2'] }, () => {
  for (const { path, title, description } of SEO_PAGES) {
    test(`${path}`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'Мета-теги однакові на всіх екранах');
      await page.goto(path);
      await expect(page).toHaveTitle(title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', new RegExp(`^${escapeRegExp(description)}`));
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /^https:\/\//);
    });
  }
});

