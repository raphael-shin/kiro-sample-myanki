import { db } from '@/db/MyAnkiDB';
import type { OfflineAction } from '@/db/MyAnkiDB';

export class OfflineSyncService {
  async queueOfflineAction(action: Omit<OfflineAction, 'id'>): Promise<void> {
    await db.offlineQueue.add(action);
  }

  async getPendingActions(): Promise<OfflineAction[]> {
    return await db.offlineQueue.toArray();
  }

  async syncPendingActions(): Promise<void> {
    const pendingActions = await this.getPendingActions();
    
    if (pendingActions.length === 0) {
      return;
    }

    // Process actions (in a real app, this would sync with a server)
    await db.transaction('rw', [db.offlineQueue], async () => {
      // For now, just clear the queue since we're offline-only
      await db.offlineQueue.clear();
    });
  }

  async hasPendingActions(): Promise<boolean> {
    const count = await db.offlineQueue.count();
    return count > 0;
  }
}
