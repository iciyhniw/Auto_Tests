import { test as base } from '@playwright/test';
import { BANNERS_ENDPOINT, IGNORED_PAGE_ERRORS, STORAGE, THIRD_PARTY_HOSTS, TRACK_API_RE } from './site';
import { NO_BANNER_PAGE, TrackApiMock } from './mocks';
import { Header } from '../pages/Header';
import { Footer } from '../pages/Footer';
import { PromoBanner } from '../pages/PromoBanner';
import { HomePage } from '../pages/HomePage';
import { ShopAllPage } from '../pages/ShopAllPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPopup } from '../pages/CartPopup';
import { CartPage } from '../pages/CartPage';
import { CheckoutBar } from '../pages/CheckoutBar';
import { Newsletter } from '../pages/Newsletter';
import { StorePage } from '../pages/StorePage';
import { ReviewsPage } from '../pages/ReviewsPage';
import { FindYoursPage } from '../pages/FindYoursPage';
import { ErrorPage } from '../pages/ErrorPage';
import { AuthScreen } from '../pages/AuthScreen';
import { EngagementPopup, ExitIntentPopup, NotifyMeModal } from '../pages/Modals';

export type HomepageVariant = 'A' | 'B' | 'C';

type Options = {
  /** Варіант A/B-тесту головної (window.wc_test_variant_homepage_sections). */
  homepageVariant: HomepageVariant;
  /** Блокувати аналітику, чат Zendesk, Customer.io і Convert. */
  blockThirdParty: boolean;
  /** Не показувати lead-gen попапи (engagement і exit-intent). */
  blockLeadGenPopups: boolean;
  /** Примусова країна відвідувача, напр. 'US'. null — країна за IP. */
  countryOverride: string | null;
  /**
   * Сховати промо-банер над хедером (банер керується з адмінки і часто змінюється: таймери, ширина).
   * За замовчуванням схований; SM-01 перевіряє сторінки з реальним банером.
   */
  hidePromoBanner: boolean;
};

type Fixtures = {
  /** Підмінене API трекінгу: відповіді сервера і що саме надіслав сайт. */
  trackApi: TrackApiMock;
  /** Неперехоплені JS-помилки сторінки (крім спричинених блокуванням сторонніх сервісів). */
  pageErrors: string[];

  header: Header;
  footer: Footer;
  promoBanner: PromoBanner;
  home: HomePage;
  shopAll: ShopAllPage;
  product: ProductPage;
  cartPopup: CartPopup;
  cart: CartPage;
  checkoutBar: CheckoutBar;
  newsletter: Newsletter;
  store: StorePage;
  reviews: ReviewsPage;
  findYours: FindYoursPage;
  errorPage: ErrorPage;
  authScreen: AuthScreen;
  notifyMe: NotifyMeModal;
  engagementPopup: EngagementPopup;
  exitPopup: ExitIntentPopup;
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const test = base.extend<Options & Fixtures>({
  homepageVariant: [(process.env.HOMEPAGE_VARIANT?.trim() || 'A').toUpperCase() as HomepageVariant, { option: true }],
  blockThirdParty: [process.env.BLOCK_THIRD_PARTY?.trim() !== 'false', { option: true }],
  blockLeadGenPopups: [true, { option: true }],
  countryOverride: [process.env.COUNTRY_OVERRIDE?.trim() || null, { option: true }],
  hidePromoBanner: [process.env.HIDE_PROMO_BANNER?.trim() !== 'false', { option: true }],

  // eslint-disable-next-line no-empty-pattern
  trackApi: async ({}, use) => use(new TrackApiMock()),

  // Кожен тест отримує чистий браузерний контекст (порожній кошик, без cookies).
  // Тут же налаштовуємо його так, щоб сайт поводився передбачувано і безпечно.
  context: async (
    { context, homepageVariant, blockThirdParty, blockLeadGenPopups, countryOverride, hidePromoBanner, trackApi },
    use,
  ) => {
    // Підписки й трекінг ніколи не йдуть на реальний сервер (див. fixtures/mocks.ts)
    await context.route((url) => TRACK_API_RE.test(url.pathname), (route) => trackApi.handle(route));

    if (blockThirdParty) {
      await context.route(
        (url) => THIRD_PARTY_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)),
        (route) => route.abort(),
      );
    }

    if (hidePromoBanner) {
      await context.route(BANNERS_ENDPOINT, (route) => route.fulfill({ json: NO_BANNER_PAGE }));
    }

    await context.addInitScript(
      ({ variant, blockPopups, country, keys, cooldown }) => {
        // Фіксуємо варіант A/B-тесту головної — сайт читає цю змінну замість Convert
        (window as unknown as Record<string, unknown>).wc_test_variant_homepage_sections = variant;
        try {
          if (blockPopups) {
            localStorage.setItem(keys.leadGen, JSON.stringify({ blockedUntil: Date.now() + cooldown }));
          }
          if (country) {
            localStorage.setItem(keys.countryOverride, country);
          }
        } catch {
          // storage недоступний (about:blank або сторонній домен) — пропускаємо
        }
      },
      {
        variant: homepageVariant,
        blockPopups: blockLeadGenPopups,
        country: countryOverride,
        keys: { leadGen: STORAGE.leadGen, countryOverride: STORAGE.countryOverride },
        cooldown: THIRTY_DAYS_MS,
      },
    );

    await use(context);
  },

  page: async ({ page, blockLeadGenPopups }, use) => {
    if (blockLeadGenPopups) {
      // Страховка: якщо engagement-попап все ж з'явився — закриваємо його через «No, thanks»
      await page.addLocatorHandler(
        page.locator('.popup-content').filter({ hasText: /who are you getting/i }),
        async (overlay) => {
          await overlay.getByText('No, thanks', { exact: true }).click();
        },
      );
    }
    await use(page);
  },

  pageErrors: async ({ page, blockThirdParty }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      if (blockThirdParty && IGNORED_PAGE_ERRORS.some((re) => re.test(error.message))) return;
      // Перший рядок стеку показує, з якого файлу помилка (сайт чи сторонній скрипт)
      const origin = error.stack?.split('\n').find((line) => line.includes('http'))?.trim() ?? '';
      errors.push(origin ? `${error.message} (${origin})` : error.message);
    });
    await use(errors);
  },

  header: async ({ page }, use) => use(new Header(page)),
  footer: async ({ page }, use) => use(new Footer(page)),
  promoBanner: async ({ page }, use) => use(new PromoBanner(page)),
  home: async ({ page }, use) => use(new HomePage(page)),
  shopAll: async ({ page }, use) => use(new ShopAllPage(page)),
  product: async ({ page }, use) => use(new ProductPage(page)),
  cartPopup: async ({ page }, use) => use(new CartPopup(page)),
  cart: async ({ page }, use) => use(new CartPage(page)),
  checkoutBar: async ({ page }, use) => use(new CheckoutBar(page)),
  newsletter: async ({ page }, use) => use(new Newsletter(page)),
  store: async ({ page }, use) => use(new StorePage(page)),
  reviews: async ({ page }, use) => use(new ReviewsPage(page)),
  findYours: async ({ page }, use) => use(new FindYoursPage(page)),
  errorPage: async ({ page }, use) => use(new ErrorPage(page)),
  authScreen: async ({ page }, use) => use(new AuthScreen(page)),
  notifyMe: async ({ page }, use) => use(new NotifyMeModal(page)),
  engagementPopup: async ({ page }, use) => use(new EngagementPopup(page)),
  exitPopup: async ({ page }, use) => use(new ExitIntentPopup(page)),
});

export { expect } from '@playwright/test';
