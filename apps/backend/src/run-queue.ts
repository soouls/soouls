import { db } from '@soouls/database';
import { messageCampaigns } from '@soouls/database/schema';
import { inArray, eq } from 'drizzle-orm';
import { Queue } from 'bullmq';

async function main() {
  // Use the same Redis connection string the app uses
  const connection = {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  };

  const notificationQueue = new Queue('notifications', { connection });

  // Get all campaigns that failed, are partially sent, or stuck
  const campaignsToRun = await db
    .select()
    .from(messageCampaigns)
    .where(inArray(messageCampaigns.status, ['failed', 'partially_sent', 'queued', 'stopped']));

  if (campaignsToRun.length === 0) {
    console.log('No failed or pending campaigns found.');
  }

  for (const campaign of campaignsToRun) {
    console.log(`Re-queueing campaign: [${campaign.id}] ${campaign.title}`);
    
    // Update status to queued
    await db
      .update(messageCampaigns)
      .set({ status: 'queued', updatedAt: new Date() })
      .where(eq(messageCampaigns.id, campaign.id));

    // Add to bullmq
    await notificationQueue.add(
      'dispatchCampaign',
      { campaignId: campaign.id },
      {
        jobId: `campaign_dispatch_${campaign.id}_retry_${Date.now()}`,
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
  }

  console.log('All campaigns queued for delivery!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
