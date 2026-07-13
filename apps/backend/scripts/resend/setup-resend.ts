import { Resend } from 'resend';

/**
 * Setup script for Resend Email infrastructure.
 * Run this locally via `npx tsx setup-resend.ts` after setting environment variables.
 *
 * Required env vars:
 * - RESEND_AUTOMATION_API_KEY (full access)
 * - DOMAIN_NAME (e.g., 'soouls.in')
 */

async function main() {
  const apiKey = process.env.RESEND_AUTOMATION_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Error: RESEND_API_KEY or RESEND_AUTOMATION_API_KEY is missing.');
    process.exit(1);
  }

  const resend = new Resend(apiKey);
  const domainName = process.env.DOMAIN_NAME || 'soouls.in';

  console.log(`🚀 Starting Resend infrastructure setup for ${domainName}...`);

  // 1. Verify/Create Domain
  console.log('\n🌐 1. Setting up Domain...');
  const { data: domains, error: listError } = await resend.domains.list();
  if (listError) {
    console.error('Failed to list domains:', listError);
  } else {
    const domainExists = domains?.data?.some((d) => d.name === domainName);
    if (domainExists) {
      console.log(`✅ Domain ${domainName} already configured in Resend.`);
    } else {
      console.log(`➕ Creating domain ${domainName}...`);
      const { data: newDomain, error: createError } = await resend.domains.create({
        name: domainName,
      });
      if (createError) {
        console.error('Failed to create domain:', createError);
      } else {
        console.log(
          `✅ Domain created: ${newDomain?.id}. Please add the DNS records shown in the dashboard to verify the domain.`,
        );
      }
    }
  }

  // 2. Setup Events
  console.log('\n📡 2. Setting up Events...');
  const signupEventName = 'user.signed_up';

  const { data: eventsList } = await resend.events.list();
  const eventExists = eventsList?.data?.some((e) => e.name === signupEventName);

  if (eventExists) {
    console.log(`✅ Event '${signupEventName}' already exists.`);
  } else {
    console.log(`➕ Creating event '${signupEventName}'...`);
    const { data: eventResult, error: eventError } = await resend.events.create({
      name: signupEventName,
      schema: {
        userId: 'string',
        clerkId: 'string',
        email: 'string',
        firstName: 'string',
        lastName: 'string',
        phoneNumber: 'string',
        isWaitlistUser: 'boolean',
        billingTier: 'string',
        marketingEmailOptIn: 'boolean',
        transactionalEmailOptIn: 'boolean',
        appUrl: 'string',
        dashboardUrl: 'string',
        calendlyLink: 'string',
        calendly_link: 'string',
        supportEmail: 'string',
        source: 'string',
        signedUpAt: 'string',
      },
    });

    if (eventError) {
      console.error('Failed to create event:', eventError);
    } else {
      console.log(`✅ Event created: ${eventResult?.id}`);
    }
  }

  console.log('\n🎉 Setup finished! To complete automation setup:');
  console.log('1. Go to https://resend.com/automations');
  console.log('2. Create an automation triggered by the `user.signed_up` event');
  console.log(
    '3. Use the schema variables (e.g., {{firstName}}) to personalize the onboarding sequence.',
  );
}

main().catch((error) => {
  console.error('Unhandled setup error:', error);
  process.exit(1);
});
