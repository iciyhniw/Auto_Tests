import { test, expect } from '../../fixtures/test';
import { SHOP_CARD_BLOCKS, SHOP_SECTIONS } from '../../fixtures/site';
import { isSorted } from '../../utils/text';

/** SM-04. Shop All: розділи, sold out товари, сортування за ціною. */
test.describe('SM-04 Shop All', { tag: ['@p0', '@smoke'] }, () => {
  test('видно 4 розділи з заголовками', async ({ shopAll }) => {
    await shopAll.open();
    for (const { id, title } of SHOP_SECTIONS) {
      await expect(shopAll.section(id).getByRole('heading', { level: 2 })).toHaveText(title);
    }
  });

  test('sold out товари мають Notify Me замість Buy Now', async ({ shopAll }) => {
    await shopAll.open();
    const soldOut = shopAll.soldOutCards();
    const count = await soldOut.count();
    test.skip(count === 0, 'Зараз на сайті немає товарів Sold Out');

    for (let i = 0; i < count; i++) {
      const card = soldOut.nth(i);
      await expect(card.locator('.action-button')).toHaveText(/notify me|subscribed/i);
      await expect(card.getByRole('button', { name: 'Buy Now', exact: true })).toHaveCount(0);
    }
  });

  test('сортування за ціною всередині кожного блоку', async ({ shopAll }) => {
    await shopAll.open();

    for (const [direction, order] of [
      ['Ascending', 'asc'],
      ['Descending', 'desc'],
    ] as const) {
      await shopAll.sortBy(direction);
      for (const block of SHOP_CARD_BLOCKS) {
        await expect
          .poll(async () => isSorted(await shopAll.blockPrices(block), order), {
            message: `${direction}: ціни в блоці #${block} не відсортовані`,
          })
          .toBe(true);
      }
    }
  });
});
