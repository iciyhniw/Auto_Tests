import { expect, type Locator } from '@playwright/test';
import { exactText } from './text';

/**
 * Випадаючий список сайту (vue-ui-kit Selectbox):
 *   .selectbox(.opened) > .selectbox__label (.selectbox__option — вибране значення, .selectbox__remove-icon — скинути)
 *                       > .selectbox__drop-down > .selectbox__drop-down-item (пункти)
 * Пункти є в DOM і коли список закритий (opacity 0), тому спершу відкриваємо.
 */
export class Selectbox {
  readonly selected: Locator;
  readonly items: Locator;
  readonly removeIcon: Locator;

  constructor(readonly root: Locator) {
    this.selected = root.locator('.selectbox__option');
    this.items = root.locator('.selectbox__drop-down-item');
    this.removeIcon = root.locator('.selectbox__remove-icon');
  }

  async open(): Promise<void> {
    await this.root.locator('.selectbox__label').click();
    await expect(this.root).toHaveClass(/opened/);
  }

  async select(label: string): Promise<void> {
    await this.open();
    await this.items.filter({ hasText: exactText(label) }).click();
  }

  /** Скинути вибір (хрестик; є лише там, де список «isRemovable»). */
  async clear(): Promise<void> {
    await this.removeIcon.click();
  }

  async options(): Promise<string[]> {
    return (await this.items.allInnerTexts()).map((t) => t.trim());
  }
}
