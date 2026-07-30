# Glossary

- **Payment Provider**: The system uses **Razorpay** exclusively for all transactions, handling both domestic (INR) and international (USD) payments.
- **Geolocation**: Determined automatically via Vercel/Next.js edge headers (`x-vercel-ip-country`) to set the appropriate currency (INR for India, USD for the rest of the world) before the user even reaches the checkout.
- **Free Trial**: A 14-day trial starts automatically when the user signs up.
- **Paywall**: Once the 14-day trial ends, access to restricted features becomes a "hard wall". A pop-up prompts the user to upgrade, and they cannot bypass it.
- **Testing**: End-to-end user flows, including geolocation spoofing and checkout processes, are tested via **Playwright**.
