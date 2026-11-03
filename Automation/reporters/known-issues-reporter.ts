import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';

const TAG = '@known-issue';
const ANNOTATION = 'known issue';

type Row = { issue: string; test: string; project: string; state: 'present' | 'fixed' | 'error' };

/**
 * Окремий підсумок по тестах на відомі баги (тег @known-issue) наприкінці прогону:
 *  - «ще є»       — тест упав, як і очікувалось: баг досі на сайті;
 *  - «ВИПРАВЛЕНО» — тест пройшов: баг полагодили, запис із fixtures/known-issues.ts треба прибрати;
 *  - «помилка»    — тест не дійшов до перевірки (таймаут, збій) — подивитись у звіті.
 * У HTML-звіті ці тести — окрема категорія: клік по тегу «known-issue».
 */
class KnownIssuesReporter implements Reporter {
  /** Ключ — id тесту; повтор (retry) замінює попередній результат. */
  private readonly rows = new Map<string, Row>();

  printsToStdio(): boolean {
    return false;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (!test.tags.includes(TAG)) return;

    const annotations = [...(result.annotations ?? []), ...test.annotations];
    const issue = annotations.find((a) => a.type === ANNOTATION)?.description ?? '(опис не знайдено)';
    const state: Row['state'] = result.status === 'failed' ? 'present' : result.status === 'passed' ? 'fixed' : 'error';

    this.rows.set(test.id, {
      issue,
      test: test.titlePath().slice(3).join(' › '),
      project: test.parent.project()?.name ?? '',
      state,
    });
  }

  onEnd(_result: FullResult): void {
    const rows = [...this.rows.values()];
    if (rows.length === 0) return;

    const label = { present: 'ще є      ', fixed: 'ВИПРАВЛЕНО', error: 'помилка   ' } as const;
    const lines = [
      '',
      `Відомі баги (${TAG}): ${rows.length} запусків — у HTML-звіті клікніть тег «known-issue»`,
      ...rows
        .sort((a, b) => a.issue.localeCompare(b.issue) || a.project.localeCompare(b.project))
        .map((row) => `  ${label[row.state]}  [${row.project}] ${row.test}\n               ${row.issue}`),
    ];
    const fixed = rows.filter((row) => row.state === 'fixed').length;
    if (fixed > 0) {
      lines.push(`  ⚠ ${fixed} — схоже, баг виправили: приберіть запис із fixtures/known-issues.ts і knownIssue(...) з тесту.`);
    }
    console.log(lines.join('\n'));
  }
}

export default KnownIssuesReporter;
