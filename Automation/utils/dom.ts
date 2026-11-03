import type { Locator } from '@playwright/test';

/**
 * Клік з попереднім прокручуванням елемента в центр екрана.
 * Потрібно там, де закріплені панелі (sticky-bar) перекривають низ екрана.
 */
export async function clickCentered(locator: Locator): Promise<void> {
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }));
  await locator.click();
}

/** Висота елемента в пікселях (для перевірки, що акордеон згорнувся). */
export async function heightOf(locator: Locator): Promise<number> {
  return locator.evaluate((el) => el.getBoundingClientRect().height);
}
