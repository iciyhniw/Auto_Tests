import { test, expect } from '../../fixtures/test';
import { BANNERS_ENDPOINT } from '../../fixtures/site';
import { buildBannerPage, NO_BANNER_PAGE } from '../../fixtures/mocks';
import { isProduction } from '../../utils/env';

/**
 * Промо-банер над хедером (packages/modules/website-banner).
 * Відповідь адмінки підмінюємо своєю — так тест не залежить від того, яка акція зараз активна.
 * На prod банер приходить уже в HTML із сервера, тому підміна там не працює — тест пропускається.
 */
test.describe('Промо-банер', { tag: ['@functional', '@p2'] }, () => {
  test.beforeEach(async ({ baseURL }) => {
    test.skip(isProduction(baseURL), 'На prod банер рендериться на сервері');
  });

  test('показує банер з адмінки, кнопку і закривається хрестиком', async ({ page, promoBanner }) => {
    await page.route(BANNERS_ENDPOINT, (route) =>
      route.fulfill({ json: buildBannerPage({ title: 'QA test banner', buttonLabel: 'QA Shop now', buttonUrl: '/buy' }) }),
    );
    await page.goto('/support');

    await expect(promoBanner.title).toHaveText('QA test banner');
    await expect(promoBanner.button).toHaveText('QA Shop now');
    await expect(promoBanner.button).toHaveAttribute('href', '/buy');

    await promoBanner.closeButton.click();
    await expect(promoBanner.root).toBeHidden();
  });

  test('без активного банера сторінка без банера', async ({ page, promoBanner, header }) => {
    await page.route(BANNERS_ENDPOINT, (route) => route.fulfill({ json: NO_BANNER_PAGE }));
    await page.goto('/support');
    await expect(header.bar).toBeVisible();
    await expect(promoBanner.root).toHaveCount(0);
  });
});
