import type { Page } from '@playwright/test';

export async function getLocalStorage(page: Page, key: string): Promise<string | null> {
  return page.evaluate((k) => localStorage.getItem(k), key);
}

export async function getSessionStorage(page: Page, key: string): Promise<string | null> {
  return page.evaluate((k) => sessionStorage.getItem(k), key);
}

/** JSON із sessionStorage або null. */
export async function getSessionJson<T>(page: Page, key: string): Promise<T | null> {
  const raw = await getSessionStorage(page, key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
