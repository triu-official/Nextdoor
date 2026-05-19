import type { RepositoryBundle } from '../types/repositories';
import { JsonStore } from './jsonStore';
import { SqlStore } from './sqlStore';

let cache: RepositoryBundle | null = null;

export async function createRepositories(mode: string): Promise<RepositoryBundle> {
  if (cache) {
    return cache;
  }

  if (mode === 'sql') {
    cache = new SqlStore();
    return cache;
  }

  const store = new JsonStore();
  await store.init();
  cache = store;
  return cache;
}
