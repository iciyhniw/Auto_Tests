import type { Route } from '@playwright/test';
import { TRACK_API_RE } from './site';

export type TrackEndpoint = 'subscribe' | 'event' | 'tag';

export interface TrackCall {
  endpoint: TrackEndpoint;
  url: string;
  body: unknown;
}

/**
 * Підміна API трекінгу (/track/subscribe, /track/event, /track/tag).
 * Через нього сайт підписує на розсилку і на Notify Me (далі — Customer.io).
 * У тестах реальні запити НІКОЛИ не йдуть на сервер: відповідаємо самі й запам'ятовуємо, що сайт надіслав.
 * Так можна перевірити і успішну відправку форми, і помилку сервера — без реальних підписок.
 */
export class TrackApiMock {
  readonly calls: TrackCall[] = [];
  private failing = false;

  /** Наступні запити отримають 500 — сайт має показати помилку. */
  fail(): void {
    this.failing = true;
  }

  /** Повернутись до успішних відповідей { ok: true }. */
  succeed(): void {
    this.failing = false;
  }

  callsTo(endpoint: TrackEndpoint): TrackCall[] {
    return this.calls.filter((call) => call.endpoint === endpoint);
  }

  async handle(route: Route): Promise<void> {
    const request = route.request();
    const endpoint = (request.url().match(TRACK_API_RE)?.[1] ?? 'event') as TrackEndpoint;
    let body: unknown = request.postData();
    try {
      body = request.postDataJSON();
    } catch {
      // тіло не JSON — лишаємо як текст
    }
    this.calls.push({ endpoint, url: request.url(), body });

    if (this.failing) {
      await route.fulfill({ status: 500, json: { error: { code: 'QA_MOCK', message: 'Mocked server error' } } });
      return;
    }
    await route.fulfill({ status: 200, json: { ok: true } });
  }
}

/** Мінімальна конфігурація промо-банера у форматі адмінки (packages/modules/website-banner/src/types.ts). */
export function buildBannerPage(banner: { title: string; buttonLabel: string; buttonUrl: string }) {
  return {
    activeId: 'qa-banner',
    banners: {
      'qa-banner': {
        name: 'QA banner',
        layout: {
          slots: { left: null, beforeButton: null, right: null },
          rowBehavior: 'block',
          containerMaxWidth: 1080,
          shrinkHero: null,
        },
        background: { type: 'color', value: '#6E44FF' },
        foreground: '#FFFFFF',
        title: banner.title,
        subtitle: null,
        text: null,
        image: null,
        button: { label: banner.buttonLabel, url: banner.buttonUrl },
        promoCode: null,
        timing: null,
        linkEntireBanner: false,
      },
    },
  };
}

/** Відповідь «банера немає». */
export const NO_BANNER_PAGE = { activeId: null, banners: {} };
