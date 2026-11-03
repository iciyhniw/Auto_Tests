import { expect, type Locator } from '@playwright/test';

/** true, якщо елемент повністю видно по горизонталі. */
async function isInViewportX(item: Locator): Promise<boolean> {
  return item.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.left >= -1 && rect.right <= window.innerWidth + 1;
  });
}

/**
 * На телефоні картки товарів — у каруселі (embla, transform), і прокрутка сторінки їх не показує.
 * Гортаємо карусель кнопкою «Next slide» у межах scope, поки елемент не стане видно.
 */
export async function revealInCarousel(item: Locator, scope: Locator, maxClicks = 12): Promise<void> {
  await item.scrollIntoViewIfNeeded().catch(() => undefined);
  for (let i = 0; i < maxClicks; i++) {
    if (await isInViewportX(item)) return;
    const left = await item.evaluate((el) => el.getBoundingClientRect().left);
    await scope.getByRole('button', { name: 'Next slide' }).filter({ visible: true }).last().click();
    await expect.poll(() => item.evaluate((el) => el.getBoundingClientRect().left)).not.toBe(left);
  }
}
