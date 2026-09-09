import {defineConfig, devices} from '@playwright/test';

/** Port the `preview` script serves the production build on. */
const previewUrl = 'http://localhost:4173';

const isContinuousIntegration = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  forbidOnly: isContinuousIntegration,
  retries: isContinuousIntegration ? 1 : 0,
  reporter: isContinuousIntegration ? [['list'], ['html', {open: 'never'}]] : [['list']],
  use: {
    baseURL: previewUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome']}},
    {name: 'firefox', use: {...devices['Desktop Firefox']}},
    {name: 'webkit', use: {...devices['Desktop Safari']}}
  ],
  webServer: {
    command: 'bun run preview',
    url: previewUrl,
    reuseExistingServer: !isContinuousIntegration,
    // The command builds the application before serving it.
    timeout: 180_000
  }
});
