import { expect, test } from '@playwright/test';

test('Blocks access to premium features when trial expires', async ({ page }) => {
  // Bypass Clerk auth redirect in proxy.ts for this test
  await page.setExtraHTTPHeaders({ 'x-playwright-test': '1' });

  // In a real test suite, you'd seed the database here with a user
  // whose trialEndsAt is in the past, and who is on a free plan.
  // Then log them in.

  // For now, we mock the tRPC response to simulate an expired trial.
  await page.route('**/api/trpc/private.home.getOnboardingStatus*', async (route) => {
    const json = {
      result: {
        data: {
          completed: true,
          planType: 'free',
          subscriptionStatus: 'free',
          trialDaysLeft: 0,
          isTrialActive: false,
        },
      },
    };
    await route.fulfill({ json });
  });

  await page.goto('/home/insights'); // Assuming this route uses PremiumWrapper

  // In Insights page, the main content is wrapped in PremiumWrapper.
  // Wait for PremiumWrapper to finish loading (it adds the .group class)
  await page.waitForSelector('.group');

  // We need to click it to trigger the soft paywall modal.
  await page.locator('.group').click({ force: true });

  // Verify the paywall pop-up is shown
  await expect(page.locator('text=Choose your depth')).toBeVisible();
  await expect(
    page.locator('text=Start 14-Days Free').or(page.locator('text=Extend Premium')),
  ).toBeVisible();
});
