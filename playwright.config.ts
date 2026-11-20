import { defineConfig, devices } from '@playwright/test';

const port = 4180;
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 60_000,
  workers: 2,
  use: {
    ...devices['Desktop Chrome'],
    ...(process.env.PLAYWRIGHT_BROWSER_CHANNEL ? { channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL } : {}),
    baseURL: 'http://127.0.0.1:' + port,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/preview.mjs',
    url: 'http://127.0.0.1:' + port,
    timeout: 30_000,
    reuseExistingServer: true,
  },
});
