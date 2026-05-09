import { EntriesService } from '../src/entries/entries.service';
import { HomeService } from '../src/home/home.service';
import { RedisService } from '../src/redis/redis.service';

const userId = process.argv[2];

if (!userId) {
  console.error('Usage: bun apps/backend/scripts/check-home-flow.ts <user-id>');
  process.exit(1);
}

const redis = new RedisService();
redis.onModuleInit();

const entries = new EntriesService(redis);
const home = new HomeService(entries, redis);

const insights = await home.getInsights(userId);
console.log({
  insightsEntryCount: insights.overview.entryCount,
  thoughtThemes: insights.thoughtThemes.length,
  canvasFolders: insights.canvasFolders.length,
});

const clusterData = await home.getClusters(userId);
console.log({
  clusters: clusterData.items.length,
  folders: clusterData.folders.length,
  entryCounts: clusterData.items.map((item) => ({
    name: item.name,
    entryCount: item.entryCount,
    source: item.source,
  })),
});

const entryList = await entries.getAllEntries(userId, 1, 0);
const firstEntryId = entryList.items[0]?.id;
if (firstEntryId) {
  const canvas = await home.getEntryCanvas(userId, firstEntryId);
  console.log({
    canvasEntryId: canvas.entryId,
    canvasCards: canvas.cards.length,
    canvasConnections: canvas.connections.length,
    canvasSource: canvas.source,
  });
}

await redis.onModuleDestroy();
