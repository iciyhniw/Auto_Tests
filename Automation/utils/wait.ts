import { expect, type Locator } from '@playwright/test';

/**
 * Перевіряє, що елемент НЕ з'являється протягом заданого часу.
 * Це єдиний виняток із правила «без фіксованих очікувань»: довести, що чогось не сталося,
 * можна лише почекавши. Використовувати з коротким інтервалом і лише для негативних перевірок.
 */
export async function expectStaysHidden(locator: Locator, durationMs = 3_000, message?: string): Promise<void> {
  const deadline = Date.now() + durationMs;
  while (Date.now() < deadline) {
    expect(await locator.isVisible(), message ?? 'елемент з’явився, хоча не мав').toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}
