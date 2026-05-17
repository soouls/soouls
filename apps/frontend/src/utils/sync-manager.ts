import { get, set } from 'idb-keyval';

export interface PendingSyncEntry {
  id: string; // Unique client-generated UUID (acts as idempotency key!)
  content: string; // Encrypted or plain JSON block structure
  type: 'entry' | 'task';
  createdAt: string;
}

export interface QuarantinedSyncEntry extends PendingSyncEntry {
  quarantinedAt: string;
  errorMessage: string;
}

export const SYNC_QUEUE_KEY = 'soouls_sync_queue';
export const LOCAL_ENTRIES_KEY = 'soouls_local_entries';
export const QUARANTINE_QUEUE_KEY = 'soouls_sync_quarantine';

/**
 * Caches an entry locally and enqueues it in the synchronization queue.
 * Safe to be executed completely offline.
 */
export async function saveEntryOffline(entry: PendingSyncEntry): Promise<void> {
  // 1. Update the local rendering cache so it updates on screen instantly
  const localEntries = (await get<PendingSyncEntry[]>(LOCAL_ENTRIES_KEY)) || [];
  const updatedLocal = [entry, ...localEntries.filter((e) => e.id !== entry.id)];
  await set(LOCAL_ENTRIES_KEY, updatedLocal);

  // 2. Push to sync queue
  const queue = (await get<PendingSyncEntry[]>(SYNC_QUEUE_KEY)) || [];
  const updatedQueue = [...queue.filter((e) => e.id !== entry.id), entry];
  await set(SYNC_QUEUE_KEY, updatedQueue);
}

/**
 * Quarantine a poisoned or invalid entry to prevent it from stalling the queue.
 */
export async function saveToQuarantine(
  entry: PendingSyncEntry,
  errorMessage: string,
): Promise<void> {
  const quarantine = (await get<QuarantinedSyncEntry[]>(QUARANTINE_QUEUE_KEY)) || [];
  const quarantinedEntry: QuarantinedSyncEntry = {
    ...entry,
    quarantinedAt: new Date().toISOString(),
    errorMessage,
  };
  await set(QUARANTINE_QUEUE_KEY, [
    ...quarantine.filter((e) => e.id !== entry.id),
    quarantinedEntry,
  ]);
}

/**
 * Drains the IndexedDB sync queue and flushes it to the server.
 * Handles Clerk token checks, session expirations, and quarantined errors safely.
 */
export async function syncOfflineQueue(
  upsertSyncMutation: { mutateAsync: (variables: any) => Promise<any> },
  getToken: () => Promise<string | null>,
  onSessionExpired?: () => void,
): Promise<{
  success: boolean;
  processedCount: number;
  failedCount: number;
  retryCount: number;
  error?: string;
}> {
  const queue = await get<PendingSyncEntry[]>(SYNC_QUEUE_KEY);
  if (!queue || queue.length === 0) {
    return { success: true, processedCount: 0, failedCount: 0, retryCount: 0 };
  }

  // 🛡️ 1. Pre-flight Authentication & Expiration Check
  let token: string | null = null;
  try {
    token = await getToken();
  } catch (error) {
    console.error('[Sync] Clerk pre-flight token refresh failed:', error);
  }

  if (!token) {
    console.warn('[Sync] User session invalid or expired. Postponing offline sync.');
    if (onSessionExpired) {
      onSessionExpired();
    }
    return {
      success: false,
      processedCount: 0,
      failedCount: 0,
      retryCount: queue.length,
      error: 'UNAUTHORIZED',
    };
  }

  const remainingQueue: PendingSyncEntry[] = [];
  let processedCount = 0;
  let quarantinedCount = 0;

  // 🔄 2. Process queue items safely
  for (const entry of queue) {
    try {
      // Send to server (upsertSync is idempotent because it accepts UUID id!)
      await upsertSyncMutation.mutateAsync({
        id: entry.id, // Idempotency check: Client-generated UUID
        content: entry.content,
        type: entry.type,
        finalize: true, // Trigger AI engine insights & analysis
      });

      processedCount++;
    } catch (error: any) {
      console.error(`[Sync] Failed for entry ${entry.id}:`, error);

      const trpcCode = error.shape?.data?.code || error.code;
      const httpStatus = error.status || error.shape?.data?.httpStatus;

      // Case A: Token expired mid-loop or user was logged out
      if (trpcCode === 'UNAUTHORIZED' || httpStatus === 401) {
        console.error('[Sync] Unauthorized response mid-sync. Pausing queue.');
        const currentIndex = queue.indexOf(entry);
        remainingQueue.push(...queue.slice(currentIndex));
        if (onSessionExpired) {
          onSessionExpired();
        }
        break;
      }

      // Case B: Validation error or client data bad request (Poisoned entry)
      if (trpcCode === 'BAD_REQUEST' || httpStatus === 400 || trpcCode === 'PARSE_ERROR') {
        console.warn(`[Sync] Quarantine poisoned entry ${entry.id} to unblock queue.`);
        await saveToQuarantine(entry, error.message || 'Validation failed');
        quarantinedCount++;
      } else {
        // Case C: Temporary Network drop or Server Error -> Retry later
        remainingQueue.push(entry);
      }
    }
  }

  // 🗃️ 3. Save remaining retryable items back to the sync queue
  await set(SYNC_QUEUE_KEY, remainingQueue);

  return {
    success: true,
    processedCount,
    failedCount: quarantinedCount,
    retryCount: remainingQueue.length,
  };
}
