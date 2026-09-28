import { defineConfig } from '@playwright/test';
import base from './playwright.config';

/** `npm run screenshots`: captures the README images into docs/screenshots/. */
export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: ['**/screenshots.spec.ts', '**/demo-video.spec.ts'],
  workers: 1,
  use: {
    ...base.use,
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  },
});
