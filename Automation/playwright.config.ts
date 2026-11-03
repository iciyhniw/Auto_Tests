import { defineConfig, devices } from '@playwright/test';

// Підхоплюємо змінні з файлу .env, якщо він є (потрібен Node.js 20.12+).
try {
  process.loadEnvFile('.env');
} catch {
  // .env не обов'язковий — працюють значення за замовчуванням
}

/**
 * Сайт, на якому йдуть тести. За замовчуванням — alpha (там гілка develop, з якою звірені селектори).
 * Локально піднятий сайт: BASE_URL=http://localhost:5173
 */
const BASE_URL = process.env.BASE_URL?.trim() || 'https://wowcube.com';
const isCI = !!process.env.CI;

// Visual-прогін пише результати і звіт в окремі папки, щоб не затерти результати npm test
const isVisualRun = process.argv.some((arg) => arg.includes('visual'));

const desktop = { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } };
const mobile = { ...devices['Pixel 7'] };
const tablet = {
  ...devices['Desktop Chrome'],
  viewport: { width: 820, height: 1180 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
  userAgent: devices['Galaxy Tab S4'].userAgent,
};

export default defineConfig({
  testDir: './tests',
  // alpha буває повільною, тому запас по часу більший за стандартний
  timeout: 90_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      // 1% пікселів може відрізнятись (антиаліасинг шрифтів), анімації і курсор вимкнені
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },
  // Еталонні скриншоти: tests/__screenshots__/<файл>/<проєкт>/<назва>-<ОС>.png
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{projectName}/{arg}-{platform}{ext}',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : 3,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: isVisualRun ? 'playwright-report-visual' : 'playwright-report' }],
    // Окремий підсумок по відомих багах (тег @known-issue) наприкінці прогону
    ['./reporters/known-issues-reporter.ts'],
  ],
  use: {
    baseURL: BASE_URL,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },
  projects: [
    // Звичайні прогони (npm test): smoke + functional
    { name: 'desktop', testIgnore: '**/visual/**', use: desktop },
    { name: 'mobile', testIgnore: '**/visual/**', use: mobile },
    // Планшет — лише відкриття сторінок (SM-01)
    { name: 'tablet', testMatch: /smoke[\\/]sm-01-.*\.spec\.ts/, use: tablet },

    // Візуальні порівняння — окремо: npm run test:visual (еталони: npm run test:visual:update)
    { name: 'visual-desktop', testMatch: /visual[\\/].*\.spec\.ts/, outputDir: 'test-results-visual', use: desktop },
    { name: 'visual-mobile', testMatch: /visual[\\/].*\.spec\.ts/, outputDir: 'test-results-visual', use: mobile },
  ],
});
