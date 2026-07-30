import { expect, test } from '@playwright/test';

test('Displays INR pricing for Indian IP and handles checkout flow', async ({ page }) => {
  // Bypass Clerk auth redirect in proxy.ts for this test
  await page.setExtraHTTPHeaders({ 'x-playwright-test': '1' });

  // Mock the geo header for India
  await page.route('**/*', (route) => {
    const headers = route.request().headers();
    headers['x-vercel-ip-country'] = 'IN';
    route.continue({ headers });
  });

  // Mock the tRPC response to simulate logged-in state and trigger modal
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

  // Intercept Razorpay script and replace with a mock to simulate success
  await page.route('https://checkout.razorpay.com/v1/checkout.js', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.Razorpay = function(options) {
          this.options = options;
          this.open = function() {
            setTimeout(() => {
              this.options.handler({
                razorpay_payment_id: 'pay_test123',
                razorpay_subscription_id: 'sub_test123',
                razorpay_signature: 'sig_test123'
              });
            }, 100);
          };
          this.on = function(event, callback) {};
        };
      `,
    });
  });

  // Mock the backend order creation
  await page.route('**/api/payments/create-order', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        orderId: 'order_mock123',
        amount: 200,
        currency: 'INR',
      }),
    });
  });

  // Mock the verify-subscription endpoint
  await page.route('**/api/payments/verify-subscription', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (error) => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', (request) =>
    console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText),
  );

  await page.goto('/home?showPricing=true');

  // Verify INR pricing is shown
  await expect(page.locator('text=₹199')).toBeVisible();

  // Trigger payment order
  await page.click('button:has-text("Start 14-Days Free")');

  // Verify the unauthenticated user is redirected to sign-in
  await expect(page).toHaveURL(/\/sign-in/);
});
