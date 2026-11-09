import { defineConfig } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  // Reduced motion keeps the hero animation from making screenshots vary between runs.
  use: { baseURL: `http://localhost:${PORT}`, contextOptions: { reducedMotion: 'reduce' } },
  // Tests run against the production build served by Express, the same setup as Cloud Run.
  // Blank email settings make sure a test run can never send a real message.
  webServer: {
    command: 'npm run build && node server/index.js',
    url: `http://localhost:${PORT}/api/profile`,
    reuseExistingServer: false,
    env: { PORT: String(PORT), RESEND_API_KEY: '', CONTACT_TO_EMAIL: '' },
  },
  projects: [
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
});
