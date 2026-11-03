/** true, якщо тести йдуть на бойовий сайт (wowcube.com). */
export function isProduction(baseURL: string | undefined): boolean {
  if (!baseURL) return false;
  const host = new URL(baseURL).hostname;
  return host === 'wowcube.com' || host === 'www.wowcube.com';
}
