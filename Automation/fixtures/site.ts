/**
 * Дані сайту, на які спираються тести: адреси, handles товарів, ключі storage, тексти.
 * Звірено з кодом сайту (wowcube/backend → packages/apps/website, гілка develop) і з alpha.
 * Якщо на alpha змінився каталог чи тексти — правити тут, а не в тестах.
 */

/** Ключі localStorage / sessionStorage сайту (src/common/local-storage.ts). */
export const STORAGE = {
  /** localStorage: id кошика Shopify */
  cartId: 'cartId',
  /** sessionStorage: промокоди з ?coupon= — JSON-масив рядків */
  coupon: 'coupon',
  /** localStorage: блокування lead-gen попапів { blockedUntil: <timestamp> } (30 днів після показу/відправки) */
  leadGen: 'wowcube_lead_gen',
  /** sessionStorage: стан lead-gen у сесії { engagement: { shown, dismissedAt }, exit: { shown } } */
  leadGenSession: 'wowcube_lead_gen_session',
  /** localStorage: примусова країна відвідувача, напр. "US" (перекриває /visitor/info) */
  countryOverride: 'wowcube_country_override',
  /** sessionStorage: handles товарів, на які гість підписався через Notify Me */
  notifyMeHandles: 'notify_me_handles',
  /** localStorage: історія пошуку в магазині ігор */
  searchHistory: 'searchHistory',
} as const;

/** Lead-gen попапи (src/common/lead-gen.ts). */
export const LEAD_GEN = {
  /** Engagement-попап з'являється через 15 с або після прокрутки 50% сторінки */
  pageGuardMs: 15_000,
  /** Exit-попап — не раніше ніж через 30 с після закриття engagement-попапу */
  exitDelayAfterEngagementMs: 30_000,
  engagementPromoCode: 'TWISTTOSHIP',
  exitPromoCode: 'WOW10',
} as const;

/** Сторінки для SM-01. */
export const KEY_PAGES = [
  '/',
  '/buy',
  '/product/wowcube-base',
  '/cart',
  '/find-yours',
  '/reviews',
  '/store',
  '/news',
  '/support',
  '/contact',
] as const;

/** SEO-заголовки й описи сторінок (customOptions.seo у +Page.vue). */
export const SEO_PAGES = [
  {
    path: '/',
    title: 'WOWCube®: The Cube-Shaped Gaming Console You Twist to Play',
    description: 'WOWCube® is a cube-shaped gaming console with a screen on every side.',
  },
  {
    path: '/buy',
    title: 'Buy WOWCube®: Order the Cube Gaming Console',
    description: 'Order your WOWCube® — the cube-shaped gaming console you play by twisting.',
  },
  { path: '/find-yours', title: 'Find Your WOWCube', description: 'Find the WOWCube that fits you best.' },
  {
    path: '/reviews',
    title: 'WOWCube Reviews from YouTube, TikTok, Instagram and customers',
    description: 'What people are saying about WOWCube on YouTube, TikTok, Instagram and other platforms.',
  },
  {
    path: '/store',
    title: 'WOWCube® App Store: 3D Puzzle Games, Arcades & Apps',
    description: 'Browse the official WOWCube® app store',
  },
] as const;

export type Product = { handle: string; cardName: string; title: string };

/** Стабільні товари для тестів (cardName — заголовок картки на /buy, title — назва на PDP і в кошику). */
export const PRODUCTS = {
  /** DEFAULT_CUBE_PRODUCT — його купують кнопки Buy Now / Buy WOWCube на головній */
  base: { handle: 'wowcube-base', cardName: 'WOWCube', title: 'WOWCube Base' },
  /** RUBIKS_CUBE_PRODUCT_HANDLE — /go?action=buy-rubiks */
  rubiks: { handle: 'wowcube-bundle', cardName: "Rubik's® WOWCube", title: "Rubik's® WOWCube" },
  travelCase: { handle: 'travel-case-for-wowcube', cardName: 'Travel Case', title: 'Travel Case' },
  fabricCase: { handle: 'fabric-case', cardName: 'Fabric Case', title: 'Fabric Case' },
  /** Sold out на alpha — для Notify Me */
  blackEdition: { handle: 'black-edition', cardName: 'Black Edition', title: 'Black Edition' },
  giftCard300: { handle: 'gift-card-300', cardName: 'WOW Card', title: 'WOW Card' },
} as const satisfies Record<string, Product>;

/** Підкатегорії товарів (перемикач на PDP). */
export const SUBCATEGORIES = {
  cubes: [
    'wowcube-mystery',
    'wowcube-base',
    'wowcube-bundle',
    'wowcube-ultimate',
    'eco-cube',
    'black-edition',
    'cut-the-rope',
    'space-invaders',
  ],
  accessories: ['travel-case-for-wowcube', 'fabric-case', 'protective-color-silicon-bumpers', 'extra-dock-and-charger'],
  giftCards: ['gift-card-300', 'gift-card-500', 'gift-card-1000'],
} as const;

/** Розділи /buy з заголовком і якорем (id секції = handle з адмінки). */
export const SHOP_SECTIONS = [
  { id: 'shop-wowcubes', title: 'WOWCubes' },
  { id: 'shop-accessories', title: 'Accessories' },
  { id: 'shop-cubecoin-cards', title: 'Cubecoin cards' },
  { id: 'shop-gift-cards', title: 'Gift Cards' },
] as const;

/** Блоки з картками на /buy, всередині яких працює сортування (сортується кожен блок окремо). */
export const SHOP_CARD_BLOCKS = [
  'shop-wowcubes',
  'shop-wowcubes-second-row',
  'shop-accessories',
  'shop-cubecoin-cards',
  'shop-gift-cards',
] as const;

/** Головне меню хедера (src/common/menu/index.ts). */
export const HEADER_NAV = [
  { name: 'Shop All', path: '/buy' },
  { name: 'Games & Apps', path: '/store' },
  { name: 'News', path: '/news' },
] as const;

/** Пункти «More» у хедері на desktop (primaryMenu, src/common/menu/index.ts). */
export const MORE_MENU_DESKTOP = [
  { name: 'Shop All', path: '/buy' },
  { name: 'How To Use', path: '/support' },
  { name: 'Tech Specs', path: '/specs' },
  { name: 'Creative Tools', path: '/tools' },
  { name: 'Explore DevKit', path: '/devkit' },
  { name: 'Developer Grants', path: '/grants' },
  { name: 'Story & Team', path: '/story' },
  { name: 'Presskit', path: '/presskit' },
  { name: 'Contact Us', path: '/contact' },
  { name: 'Support', path: '/support' },
  { name: 'Reviews', path: '/reviews' },
  { name: 'Privacy & Legal', path: '/privacy' },
] as const;

/** Пункти «More» у бургер-меню (curtainMenu): без «How To Use», «Explore Devkit» з малої k, інший порядок. */
export const MORE_MENU_MOBILE = [
  { name: 'Shop All', path: '/buy' },
  { name: 'Presskit', path: '/presskit' },
  { name: 'Privacy & Legal', path: '/privacy' },
  { name: 'Creative Tools', path: '/tools' },
  { name: 'Explore Devkit', path: '/devkit' },
  { name: 'Developer Grants', path: '/grants' },
  { name: 'Tech Specs', path: '/specs' },
  { name: 'Support', path: '/support' },
  { name: 'Story & Team', path: '/story' },
  { name: 'Reviews', path: '/reviews' },
  { name: 'Contact Us', path: '/contact' },
] as const;

/** Фрази-підказки в пошуку магазину, коли нічого не знайдено (StoreSubNav.vue). */
export const STORE_SEARCH_PHRASES = ['Rope', 'Pipes', 'Space'] as const;

/** Тексти сайту, які перевіряють тести. */
export const TEXT = {
  cartEmpty: 'Your bag is empty',
  cartPopupAdded: 'Added to bag',
  cartPopupEmpty: 'Bag is empty',
  taxesHint: 'Taxes and shipping calculated at checkout',
  homeShowcaseTitle: { A: 'Choose your WOWCube', B: 'Meet the WOWCube family', C: 'Meet the WOWCube family' },
  newsletter: {
    usTitle: /here is your\s+free shipping/i,
    intlTitle: 'Subscribe for updates',
    emptyEmail: 'Enter your email',
    invalidEmail: 'Enter a valid email address',
    success: "You're in",
    serverError: /something went wrong/i,
  },
  notifyMe: {
    heading: "Get notified when it's back",
    emptyEmail: 'Type your email',
    invalidEmail: 'Incorrect email',
    success: "You're in!",
    submitError: 'Something went wrong. Please try again.',
  },
  engagement: { heading: /who are you getting\s+wowcube for/i, invalidEmail: 'Incorrect email' },
  exitIntent: { heading: 'Try your luck', subtitle: 'Twist the WOWCube to see what you win' },
  availability: { available: 'Ready to ship', soldOut: 'Sold out', comingSoon: 'Coming soon' },
} as const;

/** Адреса Shopify checkout (на alpha — dev store під паролем). */
export const CHECKOUT_URL_RE = new RegExp(
  process.env.CHECKOUT_URL_PATTERN?.trim() || 'myshopify\\.com|shop\\.wowcube\\.com|checkout\\.shopify\\.com',
);

/** Запити до Shopify Storefront API (кошик, промокоди). */
export const STOREFRONT_GRAPHQL_RE = /\/api\/[\d-]+\/graphql\.json/;

/** API трекінгу: підписка на розсилку, Notify Me, теги Customer.io. У тестах завжди підмінюється. */
export const TRACK_API_RE = /\/track\/(subscribe|event|tag)(\/|\?|$)/;

/** Endpoint промо-банера над хедером (керується з адмінки; на alpha його вантажить браузер). */
export const BANNERS_ENDPOINT = '**/api/v3/pages/web.website-banners.json';

/**
 * Сторонні сервіси, які блокуються в тестах: аналітика, чат, Customer.io, Convert.
 * Affirm і YouTube не блокуємо — від них залежить вигляд сторінок.
 */
export const THIRD_PARTY_HOSTS = [
  'googletagmanager.com',
  'google-analytics.com',
  'doubleclick.net',
  'customer.io',
  'zdassets.com',
  'zendesk.com',
  'convertexperiments.com',
  'cloudflareinsights.com',
] as const;

/**
 * JS-помилки сторінки, які спричиняє саме блокування сторонніх сервісів у тестах
 * (сайт пише «Failed to load Zendesk», коли чат заблоковано). На реальних користувачів не впливають.
 */
export const IGNORED_PAGE_ERRORS: RegExp[] = [/zendesk/i];

/** Тестова пошта. Форми з нею відправляються лише тоді, коли API трекінгу підмінене (TrackApiMock). */
export const TEST_EMAIL = 'qa.autotest@example.com';

/**
 * ECM-2168 / ECM-2169: ширина контейнера як на головній (src/styles/main.scss → .container-next).
 * Вміст 1000 px (поля по 10 px), а на екранах від 1740 px — 1200 px (поля по 20 px).
 * У задачі сказано «1700 px», у коді — 1740 px; тести перевіряють за кодом.
 */
export const CONTAINER = {
  wideBreakpoint: 1740,
  content: { regular: 1000, wide: 1200 },
  gutter: { regular: 10, wide: 20 },
  /** Старі контейнери з common-styles (.container-1080, .container-1360…) мають поля по 20 px */
  legacyGutter: 20,
  /** Свідомо ширші блоки: відеохедер головної (Hero.vue, container-1360) — він і на головній такий */
  allowedWider: ['.hero'],
} as const;

/**
 * Сторінки, які мають використовувати контейнер головної (ECM-2169).
 * Не входять: сторінка товару (окрема задача), /cart (свої розміри), сторінки профілю (потрібен вхід),
 * /accessories, /mobile, /order-agreement (редіректи), /new-tabs, /tournaments (404).
 */
export const CONTAINER_PAGES = [
  '/',
  '/buy',
  '/find-yours',
  '/reviews',
  '/support',
  '/contact',
  '/specs',
  '/story',
  '/tools',
  '/devkit',
  '/grants',
  '/presskit',
  '/exchange',
  '/qr',
  '/quick-start',
  '/full-guide',
  '/how-to-play',
  '/how-to-return',
  '/install-games',
  '/wowcube-library',
  '/studio-promo',
  '/store',
  '/store/cuttherope',
  '/store/search?q=rope',
  '/news',
  '/blog',
  '/events',
  '/awards',
  '/games-releases',
  '/partnerships',
  '/publications',
  '/privacy',
  '/terms-of-service',
  '/card-terms',
  '/limited-warranty',
  '/patents',
  '/trademarks',
  '/referral-program',
  '/return-policy',
  '/shipping-policy',
] as const;
