import { expect, type Locator, type Page } from '@playwright/test';
import { exactText } from '../utils/text';

/** Ширина, нижче якої сайт показує бургер-меню замість навігації в хедері (класи window-less-1160). */
export const BURGER_BREAKPOINT = 1160;

/**
 * Хедер (components/common/headers/AppHeader.vue).
 * Desktop: .nav > .nav-menu (Shop All, Games & Apps, News, More), More відкриває .dropdown з колонками посилань.
 * < 1160 px: бургер (.burger) відкриває шторку .new-era-menu-curtain; «More» в ній — підменю з кнопкою «назад».
 * Іконки: кошик a.cart[aria-label="Open cart page"] (+ .indicator, коли в кошику щось є), профіль .profile.
 */
export class Header {
  readonly root: Locator;
  /** Сам хедер (header.header). .header-root — обгортка з нульовою висотою, її не сфотографувати. */
  readonly bar: Locator;
  readonly logo: Locator;
  readonly nav: Locator;
  readonly dropdown: Locator;
  readonly burger: Locator;
  readonly mobileMenu: Locator;
  readonly mobileMenuBack: Locator;
  readonly cartButton: Locator;
  readonly cartIndicator: Locator;
  readonly profileButton: Locator;
  /** «Buy Now» у хедері головної (лише >= 1160 px) — одразу веде в checkout з WOWCube Base. */
  readonly buyNowButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('.header-root');
    this.bar = this.root.locator('header.header');
    this.logo = this.root.locator('.logo a');
    this.nav = this.root.locator('.nav .nav-menu');
    this.dropdown = this.root.locator('.dropdown');
    this.burger = this.root.locator('.burger');
    this.mobileMenu = page.locator('.new-era-menu-curtain').filter({ visible: true });
    this.mobileMenuBack = this.mobileMenu.locator('.new-era-menu-curtain__back-button');
    this.cartButton = this.root.getByRole('button', { name: 'Open cart page' });
    this.cartIndicator = this.cartButton.locator('.indicator');
    this.profileButton = this.root.locator('.profile');
    this.buyNowButton = this.root.getByRole('button', { name: 'Buy Now', exact: true });
  }

  /** true, якщо навігація схована в бургер-меню. */
  isBurgerLayout(): boolean {
    return (this.page.viewportSize()?.width ?? 1440) < BURGER_BREAKPOINT;
  }

  navLink(name: string): Locator {
    return this.nav.locator('.link').filter({ hasText: exactText(name) });
  }

  async openMobileMenu(): Promise<void> {
    await this.burger.click();
    await expect(this.mobileMenu).toBeVisible();
  }

  mobileMenuLink(name: string): Locator {
    return this.mobileMenu
      .locator('.menu-link')
      .filter({ hasText: exactText(name) })
      .filter({ visible: true })
      .getByText(name, { exact: true })
      .first();
  }

  /** Перехід за пунктом головного меню — і на десктопі, і через бургер на телефоні. */
  async navigate(name: string): Promise<void> {
    if (this.isBurgerLayout()) {
      await this.openMobileMenu();
      await this.mobileMenuLink(name).click();
    } else {
      await this.navLink(name).click();
    }
  }

  /** Відкриває «More»: dropdown на desktop або підменю в бургер-шторці. Повертає контейнер з посиланнями. */
  async openMore(): Promise<Locator> {
    if (this.isBurgerLayout()) {
      await this.openMobileMenu();
      await this.mobileMenuLink('More').click();
      await expect(this.mobileMenuBack).toBeVisible();
      return this.mobileMenu;
    }
    await this.navLink('More').click();
    await expect(this.dropdown).toBeVisible();
    return this.dropdown;
  }

  /** Посилання всередині відкритого «More». */
  moreLink(container: Locator, name: string): Locator {
    return container.getByRole('link', { name, exact: true }).filter({ visible: true }).first();
  }
}
