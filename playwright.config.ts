import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/** Runs against the production build served under the real /kkb/ base path. */
export default defineConfig({
  testDir: 'e2e',
  testIgnore: ['**/screenshots.spec.ts', '**/demo-video.spec.ts'],
  fullyParallel: true,
  // The main flow runs axe several times; a generous budget avoids flakes on slower machines.
  timeout: 90_000,
  workers: process.env.CI ? 1 : 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}/kkb/`,
    ...devices['Pixel 7'],
    viewport: { width: 375, height: 812 },
    permissions: ['clipboard-read', 'clipboard-write'],
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'mobile-chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/kkb/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
