# WOWCube Web — автотести UI

Автотести сайту на Playwright + TypeScript. Три набори:

| Набір | Папка | Що перевіряє |
| --- | --- | --- |
| **Smoke** | `tests/smoke/` | 18 критичних сценаріїв SM-01…SM-18: сторінки відкриваються, покупка, кошик, checkout |
| **Functional** | `tests/functional/` | Детальна поведінка за областями: кошик, сторінка товару, промокоди і `/go`, підписка, Notify Me, lead-gen попапи, пошук у магазині, меню, SEO, посилання |
| **Visual** | `tests/visual/` | Порівняння скриншотів стабільних частин (хедер, футер, кошик, 404, форми) з еталонами |

Smoke і functional запускаються разом на desktop (1440 px) і телефоні (Pixel 7); SM-01 ще й на планшеті.
Visual — окремою командою.

Тести написані за кодом сайту (`wowcube/backend` → `packages/apps/website`, гілка develop), тому за
замовчуванням ідуть на **https://alpha.wowcube.dev**, де розгорнута саме ця гілка.

---

## 1. Що встановити один раз

1. **Node.js 22 LTS** — https://nodejs.org → «LTS». Перевірка: `node -v` → `v20.12` або новіше.
2. (Рекомендовано) **VS Code** і розширення **Playwright Test for VSCode**.

## 2. Перший запуск

Термінал у папці `Automation` (VS Code: File → Open Folder → `Automation`, потім Terminal → New Terminal):

```bat
npm install
npx playwright install chromium
npm test
```

Звіт після прогону: `npm run report`.

## 3. Команди

| Команда | Що робить |
| --- | --- |
| `npm test` | Smoke + functional, desktop і телефон (+ планшет для SM-01) |
| `npm run test:smoke` | Лише smoke |
| `npm run test:functional` | Лише functional |
| `npm run test:p0` / `npm run test:p1` | За пріоритетом |
| `npm run test:desktop` / `npm run test:mobile` | Лише один розмір екрана |
| `npm run test:visual` | Візуальні порівняння |
| `npm run test:visual:update` | Створити / оновити еталонні скриншоти |
| `npm run test:headed` | Desktop з видимим браузером, по одному тесту |
| `npm run test:ui` | UI-режим: запуск кліком, крок за кроком |
| `npm run report` | HTML-звіт останнього прогону |
| `npm run test:known` | Лише тести на відомі баги (тег `@known-issue`) |
| `npm run report:visual` | HTML-звіт останнього visual-прогону (він зберігається окремо і не затирає звіт `npm test`) |
| `npm run typecheck` | Перевірити TypeScript без запуску |

Один файл або один тест:

```bat
npx playwright test tests/functional/cart.spec.ts --project=desktop
npx playwright test sm-07 --project=desktop --headed
npx playwright test -g "промокод"
```

## 4. Де запускати: alpha, локальний сайт, prod

Змінна `BASE_URL` у файлі `.env` (`copy .env.example .env`) або разово в терміналі.

| Сайт | `BASE_URL` | Коли |
| --- | --- | --- |
| alpha | `https://alpha.wowcube.dev` (за замовчуванням) | Основний прогін |
| Локальний | `http://localhost:5173` | Перевірити зміни розробників до деплою (сайт піднятий з `TARGET=alpha`) |
| prod | `https://wowcube.com` | Лише smoke і лише свідомо (див. нижче) |

Разово, без `.env` (діє до закриття вікна терміналу):

- PowerShell (термінал VS Code): `$env:BASE_URL="http://localhost:5173"; npm test`
- cmd: `set "BASE_URL=http://localhost:5173" && npm test`

Повернути як було — закрити термінал або `Remove-Item Env:BASE_URL` (PowerShell) / `set BASE_URL=` (cmd).

> **prod.** Тести створюють кошики в бойовому Shopify і відкривають checkout (без оплати).
> Код prod (гілка master) може відрізнятися від develop, тому частина тестів там падає не через баги.
> Запуск: `$env:BASE_URL="https://wowcube.com"; npm run test:smoke`.

## 5. Інші налаштування `.env`

| Змінна | За замовчуванням | Навіщо |
| --- | --- | --- |
| `HOMEPAGE_VARIANT` | `A` | Варіант A/B-тесту головної (A, B, C). Тести, яким важливий варіант, задають його самі |
| `BLOCK_THIRD_PARTY` | `true` | Блокувати аналітику, чат, Customer.io, Convert |
| `COUNTRY_OVERRIDE` | порожньо | Примусова країна, напр. `US` |
| `HIDE_PROMO_BANNER` | `true` | Промо-банер з адмінки схований (таймери й ширина банера заважають клікам). SM-01 і тести банера завжди з реальним. `false` — показувати всюди |
| `CHECKOUT_URL_PATTERN` | `myshopify\.com\|shop\.wowcube\.com\|checkout\.shopify\.com` | Як розпізнати Shopify checkout |

## 6. Що тести роблять і чого не роблять (безпека)

- Кожен тест стартує в чистому браузері: порожній кошик, без cookies. Тести незалежні.
- **Підписки не доходять до сервера.** Запити підписки на розсилку і Notify Me тести перехоплюють і
  відповідають самі (успіх або помилка). Так перевіряється вся форма, але реальних підписок і листів немає.
- **Lead-gen попапи не відправляються** — вони пишуть напряму в Customer.io, перехопити це не можна.
- **Оплати немає.** Перехід у checkout перевіряється підміненою сторінкою; справжній перехід — лише SM-08.
- Аналітика, чат Zendesk, Customer.io і Convert блокуються.
- Варіант A/B-тесту головної фіксується, lead-gen попапи вимкнені (крім тестів, які їх перевіряють).
- Таймери сайту (попап через 15 с) тести «перемотують» (`page.clock`), а не чекають.

## 7. Візуальні тести

Тест робить скриншот частини сторінки і порівнює з еталоном (`tests/__screenshots__/…`).
Допускається до 1% різних пікселів; анімації вимкнені; ціни, рекомендації і віджет Affirm замасковані.

1. Перший раз еталонів немає — створіть їх: `npm run test:visual:update`.
2. Перегляньте створені PNG у `tests/__screenshots__` — це має бути правильний вигляд сайту.
3. Далі `npm run test:visual`. Якщо щось змінилось — у звіті буде «Expected / Actual / Diff».
4. Зміна дизайну погоджена → знову `npm run test:visual:update`.

Еталони прив'язані до ОС (`-win32.png`): шрифти на Windows і Linux малюються по-різному.

## 8. Як читати результат

- ✓ — пройшов, ✘ — впав, `-` — пропущений (наприклад, тест лише для телефона на desktop).
- «expected to fail» у звіті — тест на **відомий баг** (`fixtures/known-issues.ts`). Він зелений, поки баг є.
  Коли баг виправлять, тест стане червоним з «expected to fail, but passed» — тоді запис прибрати.
- Для тесту, що впав, у звіті є скриншот, відео і **trace** (усі кроки, DOM, мережа).

## 9. Баги сайту і known issues

Зараз **усі баги сайту підсвічуються червоним** — список `fixtures/known-issues.ts` порожній.
Баг переноситься в known issues лише тоді, коли про це скаже Тарас.

Як працює known issue (коли буде потрібно):

- Запис у `fixtures/known-issues.ts`, у тесті — тег і виклик:
  `test('…', { tag: KNOWN_ISSUE_TAG }, async () => { knownIssue('ключ'); … })`.
- Такий тест зелений з позначкою «expected to fail», поки баг є; коли виправлять — червоний «expected to fail, but passed».
- У HTML-звіті: пошук `@known-issue`; у терміналі — окремий блок «Відомі баги»; запуск лише їх — `npm run test:known`.

### Баги, які зараз ловлять тести (27.10.2026, alpha)

| Баг | Тест |
| --- | --- |
| Застарілий HTML на /buy, /support, /news, /store, /product/…: посилання на `src_pages_client.Blzvhdk3.js` і CSS, яких уже немає (404). Схоже на кеш CDN після деплою | SM-01 |
| Кирилична «Т» у «Taxes and shipping calculated at checkout» (PopupCart.vue, cart/Summary.vue, CartLayout.vue) | functional/cart — «підказка про податки…» |
| Кошик губиться: Add to bag до завантаження збереженого кошика створює новий (`useUserBag.ts`, `if (!cart.value) createCart`) | functional/cart — «товар, доданий одразу…» |
| View bag одразу після Add to bag показує застарілий кошик — новий товар видно лише після перезавантаження (`useUserBag.ts → goToCart`) | functional/cart — «View bag одразу…» |
| Buy Now на головній ігнорує клік, поки не завантажився список товарів (`useDefaultProductPurchase.ts`, `if (!product) return`) | functional/home — «Buy Now у хедері, натиснута одразу…» |
| /specs: блок «Full Specifications» на старому контейнері `container-1080` (1080 px замість 1000/1200) — ECM-2169 | functional/layout-container — `/specs` |
| /wowcube-library: блок «Download wowconnect ble library» на `container-1000` — на екранах від 1740 px вужчий за решту (1000 замість 1200) — ECM-2169 | functional/layout-container — `/wowcube-library` |
| Лого й іконки хедера не вирівняні з краями вмісту (хедер на `container-1360`) — ECM-2291 | functional/layout-container — «ECM-2291 лого і іконки…» |

Спостереження без тестів:

- Якщо Shopify не створив кошик (помилка сервера), бічна панель показує «Bag is empty» без повідомлення про помилку.
- Меню «More» на телефоні не має «How To Use», а «Explore Devkit» написано інакше, ніж на desktop.
- Сторінки рендеряться на сервері: до запуску JS (hydration) кнопки видно, але кліки нічого не роблять.
  Тести чекають hydration (utils/hydration.ts), а на головній — ще й завантаження товарів.

## 10. Структура

```text
Automation/
  playwright.config.ts   проєкти desktop / mobile / tablet / visual-desktop / visual-mobile
  fixtures/
    test.ts              test з фікстурами: Page Objects, блокування, A/B, країна, підміна API
    site.ts              дані сайту: товари, меню, тексти, ключі storage
    mocks.ts             підміна API підписок, тестовий промо-банер
    known-issues.ts      відомі баги
  pages/                 Page Objects (усі селектори тут)
  utils/                 хелпери (selectbox, checkout, shopify, storage, layout, …)
  tests/
    smoke/               sm-01 … sm-18
    functional/          cart, product, shop-all, promo-codes, newsletter, notify-me, lead-gen, store, header,
                         layout-container (ECM-2168: ширина контейнера на всіх сторінках), …
    visual/              скриншот-порівняння
    __screenshots__/     еталони visual (створюються командою)
  CLAUDE.md              правила проєкту для Claude
```

## 11. Як додавати тести з Claude

Відкрийте папку в Claude і опишіть сценарій (кроки, очікуваний результат) або дайте номер ECM.
Claude прочитає `CLAUDE.md`, знайде потрібний компонент у коді сайту (`C:\dev\wowcube-backend`) і
напише тест у тому ж стилі. Потім: `npx playwright test <файл> --headed`.
