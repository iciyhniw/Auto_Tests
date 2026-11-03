import { test } from './test';

/**
 * Відомі баги сайту. Тест, що їх зачіпає, позначається як «очікуване падіння» (test.fail):
 * поки баг є — тест зелений у звіті з позначкою expected failure;
 * коли баг виправлять — Playwright повідомить «expected to fail, but passed», і запис треба прибрати.
 *
 * Формат опису: 'ECM-XXXX: що не так (де в коді)'. Без тікета — просто опис.
 */
/**
 * Зараз порожньо: усі баги сайту підсвічуються червоним.
 * Баг додається сюди ЛИШЕ на прохання Тараса (власника тестів), не автоматично.
 * Приклад запису:
 *   taxesCyrillicT: 'ECM-1234: у «Тaxes…» перша літера кирилична (components/cart/PopupCart.vue)',
 */
export const KNOWN_ISSUES = {} as const satisfies Record<string, string>;

export type KnownIssue = keyof typeof KNOWN_ISSUES;

/**
 * Тег тестів на відомі баги. У HTML-звіті — окрема категорія: клік по тегу «known-issue»
 * або пошук `@known-issue`. Підсумок по них друкує reporters/known-issues-reporter.ts.
 */
export const KNOWN_ISSUE_TAG = '@known-issue';

/** Тип анотації з описом бага (видно в деталях тесту у звіті і в підсумку known-issues-reporter). */
export const KNOWN_ISSUE_ANNOTATION = 'known issue';

/**
 * Позначити поточний тест як очікуване падіння через відомий баг.
 * Тест обов'язково має бути оголошений з тегом KNOWN_ISSUE_TAG — інакше він не потрапить у категорію звіту.
 */
export function knownIssue(issue: KnownIssue, condition = true): void {
  const info = test.info();
  if (!info.tags.includes(KNOWN_ISSUE_TAG)) {
    throw new Error(
      `Тест із knownIssue('${issue}') має бути оголошений з тегом ${KNOWN_ISSUE_TAG}: test('…', { tag: KNOWN_ISSUE_TAG }, …)`,
    );
  }
  if (!condition) return;
  info.annotations.push({ type: KNOWN_ISSUE_ANNOTATION, description: `${issue}: ${KNOWN_ISSUES[issue]}` });
  test.fail(true, KNOWN_ISSUES[issue]);
}

/**
 * Відомі проблеми окремих сторінок для SM-01 (відкриття сторінок).
 * Формат: '/buy': 'ECM-1234: короткий опис'
 */
export const PAGE_KNOWN_ISSUES: Record<string, string> = {};
