/** Екранує спецсимволи для RegExp. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Точний збіг тексту елемента (без урахування регістру і пробілів по краях). */
export function exactText(value: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(value)}\\s*$`, 'i');
}

/** Частковий збіг тексту без урахування регістру. */
export function containsText(value: string): RegExp {
  return new RegExp(escapeRegExp(value), 'i');
}

/** "$1,197.00" -> 1197 */
export function parsePrice(text: string): number {
  const match = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`Не вдалося розібрати ціну з "${text}"`);
  return Number(match[1]);
}

/** true, якщо масив відсортований за зростанням / спаданням. */
export function isSorted(values: number[], direction: 'asc' | 'desc'): boolean {
  return values.every((value, i) => i === 0 || (direction === 'asc' ? values[i - 1] <= value : values[i - 1] >= value));
}
