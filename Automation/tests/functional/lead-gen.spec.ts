import { test, expect } from '../../fixtures/test';
import { LEAD_GEN, STORAGE, TEXT } from '../../fixtures/site';
import { scrollToFraction } from '../../utils/layout';
import { getSessionJson } from '../../utils/storage';
import { expectStaysHidden } from '../../utils/wait';

type LeadGenSession = { engagement?: { shown?: boolean; dismissedAt?: number }; exit?: { shown?: boolean } };

/**
 * Lead-gen попапи (components/lead-gen, common/lead-gen.ts).
 *  - Engagement: після 15 с або прокрутки 50%, раз на сесію; не на /cart.
 *  - Exit-intent: лише якщо engagement закрили >= 30 с тому; desktop — курсор вийшов за верх вікна,
 *    телефон — прокрутка до низу (95%) або повернення нагору після прокрутки на екран.
 * Форми НЕ відправляються: відправка йде напряму в Customer.io з браузера, її не підмінити.
 */
test.describe('Lead-gen попапи', { tag: ['@functional', '@p1'] }, () => {
  test.use({ blockLeadGenPopups: false, hidePromoBanner: true });

  test('engagement: варіанти відповіді і валідація email', async ({ page, engagementPopup, trackApi }) => {
    await page.goto('/support');
    await scrollToFraction(page, 0.6);
    await expect(engagementPopup.heading).toBeVisible({ timeout: 25_000 });

    await expect(engagementPopup.audienceOptions).toHaveText(['Myself', 'My kids', 'A teen', 'A gift']);
    await engagementPopup.option('My kids').click();
    await expect(engagementPopup.option('My kids')).toHaveClass(/selected/);
    await engagementPopup.option('My kids').click();
    await expect(engagementPopup.option('My kids')).not.toHaveClass(/selected/);

    // Форма без novalidate: явно невалідну адресу зупиняє сам браузер (type="email")
    await engagementPopup.email.fill('qa-invalid@');
    await engagementPopup.claimOfferButton.click();
    expect(await engagementPopup.email.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(false);

    // Адресу без домену верхнього рівня браузер пропускає, а валідація сайту (RE_EMAIL) — ні
    await engagementPopup.email.fill('qa@invalid');
    await engagementPopup.claimOfferButton.click();
    await expect(engagementPopup.fieldMessage).toHaveText(TEXT.engagement.invalidEmail);
    expect(trackApi.calls).toHaveLength(0);
  });

  test('engagement: після «No, thanks» більше не показується в цій сесії', async ({ page, engagementPopup }) => {
    await page.goto('/support');
    await scrollToFraction(page, 0.6);
    await expect(engagementPopup.heading).toBeVisible({ timeout: 25_000 });
    await engagementPopup.noThanksButton.click();
    await expect(engagementPopup.root).toBeHidden();

    const session = await getSessionJson<LeadGenSession>(page, STORAGE.leadGenSession);
    expect(session?.engagement?.shown).toBe(true);
    expect(session?.engagement?.dismissedAt).toBeGreaterThan(0);

    await page.reload();
    await scrollToFraction(page, 0.6);
    await expectStaysHidden(engagementPopup.root, 3_000, 'engagement-попап показався вдруге в тій самій сесії');
  });

  test('engagement не показується на сторінці кошика', async ({ page, engagementPopup }) => {
    await page.clock.install();
    await page.goto('/cart');
    await page.clock.fastForward(LEAD_GEN.pageGuardMs + 1_000);
    await expectStaysHidden(engagementPopup.root, 3_000, 'engagement-попап показався на /cart');

    // Контроль: на звичайній сторінці той самий таймер попап показує
    await page.goto('/support');
    await page.clock.fastForward(LEAD_GEN.pageGuardMs + 1_000);
    await expect(engagementPopup.heading).toBeVisible();
  });

  test.describe('exit-intent', () => {
    // Engagement уже показали й закрили 31 с тому — exit-попап дозволений
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(
        ({ key, delay }) => {
          sessionStorage.setItem(key, JSON.stringify({ engagement: { shown: true, dismissedAt: Date.now() - delay - 1_000 } }));
        },
        { key: STORAGE.leadGenSession, delay: LEAD_GEN.exitDelayAfterEngagementMs },
      );
    });

    test('з’являється при спробі піти зі сторінки і закривається', async ({ page, exitPopup, isMobile }) => {
      await page.goto('/support');
      await scrollToFraction(page, 0.6); // проходимо «page guard» (50% сторінки)

      if (isMobile) {
        await scrollToFraction(page, 1);
      } else {
        // Курсор вийшов за верхній край вікна (useExitIntentTrigger.ts: mouseout з clientY <= 0).
        // «Page guard» зараховує прокрутку асинхронно, тому повторюємо, доки попап не з'явиться.
        await expect(async () => {
          await page.evaluate(() =>
            document.dispatchEvent(new MouseEvent('mouseout', { clientY: -1, relatedTarget: null, bubbles: true })),
          );
          await expect(exitPopup.heading).toBeVisible({ timeout: 1_000 });
        }).toPass({ timeout: 15_000 });
      }

      await expect(exitPopup.heading).toBeVisible();
      await expect(exitPopup.subtitle).toHaveText(TEXT.exitIntent.subtitle);

      await exitPopup.close();
      // Після показу exit-попапу всі lead-gen попапи блокуються на 30 днів
      const blockedUntil = await page.evaluate(
        (key) => (JSON.parse(localStorage.getItem(key) ?? '{}') as { blockedUntil?: number }).blockedUntil ?? 0,
        STORAGE.leadGen,
      );
      expect(blockedUntil).toBeGreaterThan(Date.now() + 29 * 24 * 60 * 60 * 1000);
    });
  });
});
