import { test, expect } from '../../fixtures/test';
import { expectNoHorizontalOverflow, scrollToY } from '../../utils/layout';
import { expectCheckout, stubCheckout } from '../../utils/checkout';

/**
 * SM-09. Телефон, порожній кошик: після прокрутки головної (> 150 px) з'являється панель
 * з ціною WOWCube Base, старою ціною і віджетом Affirm; «Buy now» веде на покупку (ECM-2087).
 */
test('SM-09 Mobile sticky-бар на головній', { tag: ['@p0', '@smoke'] }, async ({ page, home, checkoutBar, isMobile }) => {
  test.skip(!isMobile, 'Панель з «Buy now» є лише на телефоні');
  await stubCheckout(page);

  await home.open();
  await scrollToY(page, 600);

  const bar = checkoutBar.mobile;
  await expect(bar).toHaveClass(/visible/);
  await expect(bar).toBeVisible();
  await expect(bar.locator('.price')).toHaveText(/^\$\d/);
  await expect(bar.locator('.old-price')).toHaveText(/^\$\d/);
  // Текст Affirm підставляє їхній скрипт (не для всіх країн), тому перевіряємо лише наявність віджета
  await expect(bar.locator('.affirm-widget')).toBeAttached();

  await expectNoHorizontalOverflow(page);
  await checkoutBar.buyNowButton.click();
  await expectCheckout(page);
});
