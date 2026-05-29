import fs from 'node:fs/promises';
import path from 'node:path';

// Local-first JSON storage
const baseDir = path.resolve(process.cwd(), '../data');

export class JsonStore<T extends { id: string }> {
  private collectionPath: string;

  constructor(collectionName: string) {
    this.collectionPath = path.join(baseDir, `${collectionName}/${collectionName}.json`);
  }

  private async ensureFile() {
    try {
      await fs.access(this.collectionPath);
    } catch {
      await fs.mkdir(path.dirname(this.collectionPath), { recursive: true });
      await fs.writeFile(this.collectionPath, '[]', 'utf8');
    }
  }

  async readAll(): Promise<T[]> {
    await this.ensureFile();
    const data = await fs.readFile(this.collectionPath, 'utf8');
    return JSON.parse(data);
  }

  async writeAll(data: T[]): Promise<void> {
    await this.ensureFile();
    await fs.writeFile(this.collectionPath, JSON.stringify(data, null, 2), 'utf8');
  }

  async findById(id: string): Promise<T | null> {
    const all = await this.readAll();
    return all.find((item) => item.id === id) || null;
  }

  async insert(item: T): Promise<T> {
    const all = await this.readAll();
    all.push(item);
    await this.writeAll(all);
    return item;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const all = await this.readAll();
    const index = all.findIndex((item) => item.id === id);
    if (index === -1) return null;
    all[index] = { ...all[index], ...updates };
    await this.writeAll(all);
    return all[index];
  }
}

export const usersDb = new JsonStore<any>('users');
export const postsDb = new JsonStore<any>('posts');
export const businessesDb = new JsonStore<any>('businesses');
export const commentsDb = new JsonStore<any>('comments');
export const societiesDb = new JsonStore<any>('societies');
export const channelsDb = new JsonStore<any>('channels');
export const messagesDb = new JsonStore<any>('messages');
