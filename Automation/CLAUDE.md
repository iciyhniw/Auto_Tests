# WOWCube Web — UI-автотести

UI-тести сайту wowcube.com (основне середовище — https://alpha.wowcube.dev, локально — http://localhost:5173).
Стек: Playwright + TypeScript, Page Object Model.
Код сайту (лише читати!): `C:\dev\wowcube-backend\packages\apps\website\src` (Vue 3 + Vike), банер — `packages/modules/website-banner`.
Селектори і тексти в тестах звірені з цим кодом (гілка develop). Перед новим тестом — знайти компонент у коді.

## Набори тестів

- `tests/smoke/sm-XX-*.spec.ts` — 18 smoke-сценаріїв SM-01…SM-18 (документ «WOWCube Web — smoke-сценарії для UI-автоматизації»). Теги `@smoke` + `@p0`/`@p1`.
- `tests/functional/*.spec.ts` — функціональні перевірки за областями (header, cart, product, shop-all, promo-codes, newsletter, notify-me, lead-gen, store, promo-banner, seo, links). Теги `@functional` + `@p1`/`@p2`.
- `tests/visual/*.spec.ts` — скриншот-порівняння стабільних частин. Окремі проєкти `visual-desktop` / `visual-mobile`, у `npm test` не входять. Еталони: `tests/__screenshots__/` (оновлює людина: `npm run test:visual:update`).

## Команди

- `npm test` — smoke + functional (desktop, mobile; tablet лише SM-01)
- `npm run test:smoke`, `npm run test:functional`, `npm run test:visual`
- `npm run test:p0` / `npm run test:p1`
- `npx playwright test tests/functional/cart.spec.ts --project=desktop` — один файл
- `npm run typecheck` — перевірка TypeScript

## Структура

- `fixtures/test.ts` — розширений `test`: опції, підміна API, Page Objects. Тести імпортують `test`/`expect` ЛИШЕ звідси.
- `fixtures/site.ts` — дані сайту: товари, підкатегорії, меню, тексти, ключі storage, regex.
- `fixtures/mocks.ts` — `TrackApiMock` (API підписок) і конфіг тестового промо-банера.
- `fixtures/known-issues.ts` — відомі баги (`knownIssue('key')` → test.fail з описом).
- `pages/*.ts` — Page Objects і компоненти (Header, CartPopup, CheckoutBar, Newsletter, Modals…). Усі селектори тут.
- `utils/` — хелпери: text, selectbox, checkout, shopify, storage, layout, carousel, dom, wait, visual, env.

## Правила

- Назва smoke-тесту починається з ID (`SM-07 …`). Functional — `describe` за областю, назва тесту — що перевіряємо.
- Селектори: спершу `getByRole` / `getByText`, далі семантичні класи з коду сайту (`.cart-popup`, `.header-root`, `.sticky-bar`). `data-testid` на сайті немає. Не використовувати `data-v-*` і позиційні XPath.
- У DOM часто є приховані дублікати (картки на /buy, кнопки для різних ширин) — `filter({ visible: true })`.
- Ніяких `waitForTimeout`; лише web-first `expect`, `expect.poll`, `waitForURL`, `waitForRequest`. Виняток — `expectStaysHidden` (utils/wait.ts) для доведення, що щось НЕ з'явилось.
- Таймери сайту (15 с lead-gen тощо) — через `page.clock`, не чекати реально.
- API трекінгу (`/track/subscribe|event|tag`) ЗАВЖДИ підмінене фікстурою — форми newsletter і Notify Me можна відправляти. `trackApi.calls` — що надіслав сайт, `trackApi.fail()` — відповідь 500.
- Lead-gen форми (engagement, exit) НЕ відправляти: вони йдуть напряму в Customer.io з браузера.
- Реальну оплату не робити. Перехід у checkout: `stubCheckout(page)` + `expectCheckout(page)` (utils/checkout.ts). Справжній перехід — лише SM-08.
- Промо-банер з адмінки схований за замовчуванням (`hidePromoBanner: true`); SM-01 ставить `false`, щоб перевіряти сторінки як їх бачить відвідувач.
- Сайт SSR: до hydration кнопки видимі, але не працюють. `open()` у Page Objects чекає `waitForHydration` (клас `mounted` на хедері); після `page.goto` напряму — викликати його самому перед кліками.
- Add to bag на новій сторінці — лише через `product.addToBag()`: він чекає завантаження збереженого кошика (utils/cart.ts).
- Кожен тест незалежний: свій чистий контекст, порожній кошик. Не покладатися на порядок тестів.
- Знайдено баг сайту → тест лишається червоним (не послаблювати перевірку). У `fixtures/known-issues.ts` баг додається ЛИШЕ коли Тарас прямо попросить; тоді — тест з тегом `KNOWN_ISSUE_TAG` і `knownIssue('ключ')` на початку. Зараз список порожній.
- Змінився каталог чи тексти на alpha — правити `fixtures/site.ts` або Page Object, а не тест.

## Фікстури (fixtures/test.ts)

- `homepageVariant` (A|B|C) — `window.wc_test_variant_homepage_sections` через `addInitScript`; Convert заблоковано.
- `blockThirdParty` (true) — abort для GA, Customer.io, Zendesk, Convert, Cloudflare Insights. Affirm і YouTube не блокуються.
- `blockLeadGenPopups` (true) — localStorage `wowcube_lead_gen = { blockedUntil }` + `addLocatorHandler` на «No, thanks».
- `hidePromoBanner` — підміняє `/api/v3/pages/web.website-banners.json` порожнім банером.
- `countryOverride` — localStorage `wowcube_country_override` (впливає на блок підписки).
- `trackApi` — `TrackApiMock`; `pageErrors` — неперехоплені JS-помилки з місцем виникнення.
- Перевизначення: `test.use({ countryOverride: 'US', blockLeadGenPopups: false })`.

## Що треба знати про сайт (з коду)

- SPA (Vike). Кошик — Shopify Storefront API (`/api/<версія>/graphql.json`), id кошика в localStorage `cartId`.
- `?coupon=` на будь-якій сторінці → sessionStorage `coupon` (JSON-масив). Коди йдуть у createCart / cartDiscountCodesUpdate; очищаються при переході в checkout.
- `/go?action=buy-product&handle=…|buy-product-variant&variant_id=…|buy-rubiks` → одразу checkout; без/з невірними параметрами → редірект на `/`. `?action=login` на будь-якій сторінці відкриває вхід.
- Головна: `<main class="ab-test variant-x">`, поки варіант не визначено — `pending`. A: `#get` = `.product-showcase-sections` («Choose your WOWCube»), legacy-блок і `.bundle-comparison` сховані. B/C: `#get` = `.product-showcase-section-legacy`, showcase — «Meet the WOWCube family».
- Кнопки Buy Now (хедер >= 1160, картки /buy, PDP) і Buy WOWCube (CTA) — одразу checkout; Add to bag — бічна панель.
- Бічний кошик `.cart-popup` (не відкривається на /cart). «−» неактивний при 1. Заголовок «Added to bag» / «Bag is empty».
- /cart: h1 «N items in your bag» рахує РЯДКИ. Order summary лише >= 1200 px.
- Нижня панель `UserBagCheckoutBar`: > 767 px — `.user-bag-checkout-bar` (лише з товарами), <= 767 — `.user-bag-checkout-bar-mobile` (з товарами: Checkout; порожній кошик: Buy now WOWCube Base). З'являється після прокрутки > 150 px (клас `visible`).
- PDP: >= 1200 px ціна, кількість (1–30), Add to bag, Buy Now у `.aside`; вужче — `.sticky-bar`. Тег «NN% OFF» = floor((old−new)/old·100). Availability: Ready to ship / Sold out / Coming soon. Акордеони відкриті за замовчуванням. Невідомий handle → 404.
- /buy: секції `section#<handle>`, якорі `a.anchor` (>= 768) або Selectbox `.anchors-select`; сортування — Selectbox `.select` (desktop, з хрестиком скидання) / `.select-mobile`. Сортується кожен блок окремо.
- Selectbox (vue-ui-kit): `.selectbox__label` відкриває, пункти `.selectbox__drop-down-item` (у DOM з opacity 0), `.selectbox__remove-icon` скидає — див. utils/selectbox.ts.
- Форми в модалках — `.popup-content` (desktop: Modal, < 768: шторка `.curtain`).
- Lead-gen: engagement після 15 с або 50% прокрутки, раз на сесію (sessionStorage `wowcube_lead_gen_session`), не на /cart. Exit — через >= 30 с після закриття engagement; desktop: mouseout за верх вікна, телефон: прокрутка до 95% або повернення нагору. Показ exit блокує все на 30 днів.
- Newsletter: США — «Here is your free shipping», інші — «Subscribe for updates». Помилки: «Enter your email», «Enter a valid email address».
- Notify Me: кнопка неактивна з порожнім полем; «Incorrect email»; успіх «You're in!», після — кнопка «Subscribed».
- Хедер: < 1160 px бургер → шторка `.new-era-menu-curtain`, «More» — підменю з кнопкою «назад». Desktop «More» → `.dropdown`. Індикатор кошика `.indicator`.
- Store: пошук від 2 символів, «Oops, nothing found» + фрази Rope/Pipes/Space, історія (5 останніх), Esc закриває. `/store/search?q=`.
- Контейнер (ECM-2168/2169): `.container-next` — вміст 1000 px (поля 10), від 1740 px — 1200 px (поля 20). Старі `.container-<N>` з common-styles мають поля 20. Перевіряє tests/functional/layout-container.spec.ts за списком `CONTAINER_PAGES` (fixtures/site.ts). Хедер і футер поки на `container-1360` (ECM-2291).
- Промо-банер: на alpha дані вантажить браузер (можна підмінити), на prod — сервер.
- Закріплені панелі внизу перекривають контент: клікати через `clickCentered` (utils/dom.ts). Картки на телефоні — каруселі: `revealInCarousel`.
