import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Queue } from 'bullmq';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL not set');
}

const emailQueue = new Queue('email', {
  connection: { url: redisUrl },
});

async function main() {
  const to = 'test@example.com';
  const userId = randomUUID(); // mock user ID for test

  const emails = [
    {
      templateName: 'welcome',
      subject: 'Welcome to Soouls',
      data: { name: 'Test User' },
    },
    {
      templateName: 'verify-email',
      subject: 'Verify your email address',
      data: { verifyUrl: 'https://soouls.in/verify?token=test' },
    },
    {
      templateName: 'password-reset',
      subject: 'Reset your password',
      data: { resetUrl: 'https://soouls.in/reset-password?token=test' },
    },
    {
      templateName: 'password-changed',
      subject: 'Password Changed',
      data: {},
    },
  ] as const;

  console.log(`Enqueuing ${emails.length} test emails to ${to}...`);

  for (const email of emails) {
    const idempotencyKey = `test-${email.templateName}-${Date.now()}`;
    await emailQueue.add(
      'send-email',
      {
        templateName: email.templateName,
        to,
        idempotencyKey,
        data: email.data,
        userId,
        subject: email.subject,
      },
      {
        jobId: idempotencyKey,
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
    console.log(`Enqueued ${email.templateName} with key ${idempotencyKey}`);
  }

  console.log('Finished enqueuing jobs.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
