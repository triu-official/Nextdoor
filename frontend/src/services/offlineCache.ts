import { openDB } from 'idb'
import type { DBSchema } from 'idb'

interface LocalDB extends DBSchema {
  drafts: {
    key: string;
    value: {
      id: string;
      content: string;
      createdAt: string;
    };
  };
  cachedPosts: {
    key: string;
    value: {
      id: string;
      content: string;
      userId: string;
      createdAt: string;
    };
  };
}

let dbPromise = openDB<LocalDB>('saltedhash-local', 1, {
  upgrade(db) {
    db.createObjectStore('drafts', { keyPath: '$id' })
    db.createObjectStore('cachedPosts', { keyPath: '$id' })
  }
})

export const offlineCache = {
  async saveDraft(draft: any) {
    const db = await dbPromise;
    await db.put('drafts', draft);
  },

  async getDrafts() {
    const db = await dbPromise;
    return db.getAll('drafts');
  },

  async removeDraft(id: string) {
    const db = await dbPromise;
    await db.delete('drafts', id);
  },

  async cachePosts(posts: any[]) {
    const db = await dbPromise;
    const tx = db.transaction('cachedPosts', 'readwrite');
    posts.forEach(post => tx.store.put(post));
    await tx.done;
  },

  async getCachedPosts() {
    const db = await dbPromise;
    return db.getAll('cachedPosts');
  }
}
