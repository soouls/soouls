import { Queue } from 'bullmq';
import postgres from 'postgres';

async function main() {
  const dbUrl =
    'postgresql://neondb_owner:npg_MrSnAKQ23DGF@ep-aged-feather-a1jp54mb-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  const redisUrl =
    'rediss://default:gQAAAAAAAR-vAAIncDJhNDQ5MjllOTVjMmQ0ODU5OGVjZWUzMjcwZTU3ZjNjNXAyNzM2NDc@fast-gannet-73647.upstash.io:6379';

  console.log('Connecting to database...');
  const sql = postgres(dbUrl);

  console.log('Connecting to redis for queue...');
  const notificationQueue = new Queue('notifications', { connection: { url: redisUrl } });

  try {
    const campaignsToRun = await sql`
      SELECT id, title, status FROM message_campaigns 
      WHERE status IN ('failed', 'partially_sent', 'draft', 'sending')
    `;

    if (campaignsToRun.length === 0) {
      console.log('No failed or pending campaigns found.');
    }

    for (const campaign of campaignsToRun) {
      console.log(`Re-queueing campaign: [${campaign.id}] ${campaign.title}`);

      // Update status to sending
      await sql`UPDATE message_campaigns SET status = 'sending', updated_at = NOW() WHERE id = ${campaign.id}`;

      // Add to bullmq
      await notificationQueue.add(
        'dispatchCampaign',
        { campaignId: campaign.id },
        {
          jobId: `campaign_dispatch_${campaign.id}_retry_${Date.now()}`,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }
    console.log('All campaigns queued for delivery!');
  } finally {
    await sql.end();
    await notificationQueue.close();
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
