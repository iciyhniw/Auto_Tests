import type { Page, Request } from '@playwright/test';
import { STOREFRONT_GRAPHQL_RE } from '../fixtures/site';

/**
 * Чекає на POST-запит до Shopify Storefront API, тіло якого містить заданий текст
 * (промокод, назву мутації тощо). Викликати ДО дії, яка цей запит породжує.
 */
export function waitForStorefrontRequest(page: Page, contains: string, timeout = 30_000): Promise<Request> {
  return page.waitForRequest(
    (req) =>
      req.method() === 'POST' && STOREFRONT_GRAPHQL_RE.test(req.url()) && (req.postData() ?? '').includes(contains),
    { timeout },
  );
}

/** Промокоди (discountCodes), які сайт передав у Shopify в цьому запиті. */
export function discountCodesOf(request: Request): string[] {
  try {
    const body = request.postDataJSON() as { variables?: Record<string, unknown> };
    const found = new Set<string>();
    const walk = (value: unknown): void => {
      if (!value || typeof value !== 'object') return;
      for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        // CreateCart: input.discountCodes; ApplyCartDiscountCode: $codes
        if ((key === 'discountCodes' || key === 'codes') && Array.isArray(nested)) {
          nested.filter((v): v is string => typeof v === 'string').forEach((v) => found.add(v));
        } else {
          walk(nested);
        }
      }
    };
    walk(body.variables);
    return [...found];
  } catch {
    return [];
  }
}
