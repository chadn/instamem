import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
// Dynamic output directories based on timestamp and potential results
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
const outputSuffix = process.env.PLAYWRIGHT_OUTPUT_SUFFIX || timestamp

export default defineConfig({
    testDir: '../e2e/tests',
    outputDir: `../e2e/artifacts/test-results-${outputSuffix}`,
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html', { 
            outputFolder: `../e2e/artifacts/playwright-report-${outputSuffix}`,
            open: 'never' // Don't auto-open the HTML report
        }],
        ['list'] // Also use list reporter for terminal output
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',

        /* Screenshot on failure */
        screenshot: 'only-on-failure',

        /* Use headless mode by default (bundled browsers) */
        headless: true,

        /* Consider increasing timeout for slower operations */
        actionTimeout: 1000,
        navigationTimeout: 3000,
    },

    /* Set up environment variables for testing */
    globalSetup: require.resolve('./global-setup.ts'),

    /* Configure projects - Chromium-first with optional cross-browser */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                headless: true,
            },
        },

        // Cross-browser testing available via PLAYWRIGHT_BROWSERS environment variable
        // Usage: PLAYWRIGHT_BROWSERS=firefox,webkit,mobile npm run test:e2e
        ...(process.env.PLAYWRIGHT_BROWSERS?.includes('firefox')
            ? [
                  {
                      name: 'firefox',
                      use: {
                          ...devices['Desktop Firefox'],
                          headless: true,
                      },
                  },
              ]
            : []),

        ...(process.env.PLAYWRIGHT_BROWSERS?.includes('webkit')
            ? [
                  {
                      name: 'webkit',
                      use: {
                          ...devices['Desktop Safari'],
                          headless: true,
                      },
                  },
              ]
            : []),

        ...(process.env.PLAYWRIGHT_BROWSERS?.includes('mobile')
            ? [
                  {
                      name: 'Mobile Chrome',
                      use: {
                          ...devices['Pixel 5'],
                          headless: true,
                      },
                  },
                  {
                      name: 'Mobile Safari',
                      use: {
                          ...devices['iPhone 12'],
                          headless: true,
                      },
                  },
              ]
            : []),
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        stdout: 'ignore',
        stderr: 'pipe',
        timeout: 120000, // 2 minutes for Next.js to start
    },
})
