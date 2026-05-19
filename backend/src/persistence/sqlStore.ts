import { mkdirSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import type { Business, CircleChannel, CircleMessage, Comment, Post, Society, User } from '../../../shared/src/models';
import { haversineKm } from '../../../shared/src/geo';
import type { RepositoryBundle } from '../types/repositories';

export class SqlStore implements RepositoryBundle {
  private readonly db: Database.Database;

  constructor() {
    const dataDir = path.resolve(process.cwd(), '../data');
    mkdirSync(dataDir, { recursive: true });
    this.db = new Database(path.join(dataDir, 'app.db'));
    this.db.pragma('journal_mode = WAL');
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        city TEXT NOT NULL,
        locality TEXT NOT NULL,
        pincode TEXT,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        isVerified INTEGER NOT NULL,
        createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        content TEXT NOT NULL,
        imageUrl TEXT,
        pollOptions TEXT,
        tags TEXT,
        city TEXT NOT NULL,
        locality TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        createdAt TEXT NOT NULL,
        upvotes INTEGER NOT NULL,
        commentsCount INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        postId TEXT NOT NULL,
        userId TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS businesses (
        id TEXT PRIMARY KEY,
        ownerUserId TEXT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        shortDescription TEXT NOT NULL,
        city TEXT NOT NULL,
        locality TEXT NOT NULL,
        address TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        phone TEXT NOT NULL,
        whatsapp TEXT,
        imageUrl TEXT,
        avgRating REAL NOT NULL,
        createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS societies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        locality TEXT NOT NULL,
        accessCode TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS society_members (
        societyId TEXT NOT NULL,
        userId TEXT NOT NULL,
        PRIMARY KEY (societyId, userId)
      );
      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        societyId TEXT NOT NULL,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        channelId TEXT NOT NULL,
        userId TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);
  }

  private toPost(row: Record<string, unknown>): Post {
    return {
      id: String(row.id),
      userId: String(row.userId),
      content: String(row.content),
      imageUrl: row.imageUrl ? String(row.imageUrl) : undefined,
      pollOptions: row.pollOptions ? JSON.parse(String(row.pollOptions)) : undefined,
      tags: row.tags ? JSON.parse(String(row.tags)) : undefined,
      city: String(row.city),
      locality: String(row.locality),
      lat: Number(row.lat),
      lng: Number(row.lng),
      createdAt: String(row.createdAt),
      upvotes: Number(row.upvotes),
      commentsCount: Number(row.commentsCount)
    };
  }

  users = {
    create: async (user: User): Promise<User> => {
      this.db
        .prepare(
          `INSERT INTO users (id, name, phone, city, locality, pincode, lat, lng, isVerified, createdAt)
           VALUES (@id, @name, @phone, @city, @locality, @pincode, @lat, @lng, @isVerified, @createdAt)`
        )
        .run({ ...user, isVerified: user.isVerified ? 1 : 0 });
      return user;
    },
    findById: async (id: string): Promise<User | null> => {
      const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown> | undefined;
      if (!row) {
        return null;
      }
      return { ...row, lat: Number(row.lat), lng: Number(row.lng), isVerified: Number(row.isVerified) === 1 } as User;
    },
    findByPhone: async (phone: string): Promise<User | null> => {
      const row = this.db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as Record<string, unknown> | undefined;
      if (!row) {
        return null;
      }
      return { ...row, lat: Number(row.lat), lng: Number(row.lng), isVerified: Number(row.isVerified) === 1 } as User;
    },
    verify: async (id: string): Promise<User | null> => {
      this.db.prepare('UPDATE users SET isVerified = 1 WHERE id = ?').run(id);
      return this.users.findById(id);
    }
  };

  posts = {
    create: async (post: Post): Promise<Post> => {
      this.db
        .prepare(
          `INSERT INTO posts (id, userId, content, imageUrl, pollOptions, tags, city, locality, lat, lng, createdAt, upvotes, commentsCount)
           VALUES (@id, @userId, @content, @imageUrl, @pollOptions, @tags, @city, @locality, @lat, @lng, @createdAt, @upvotes, @commentsCount)`
        )
        .run({ ...post, pollOptions: JSON.stringify(post.pollOptions ?? []), tags: JSON.stringify(post.tags ?? []) });
      return post;
    },
    findById: async (id: string): Promise<Post | null> => {
      const row = this.db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as Record<string, unknown> | undefined;
      return row ? this.toPost(row) : null;
    },
    findNearby: async (lat: number, lng: number, radiusKm: number, tag?: string): Promise<Post[]> => {
      const rows = this.db.prepare('SELECT * FROM posts').all() as Record<string, unknown>[];
      return rows
        .map((row) => this.toPost(row))
        .filter((post) => haversineKm(lat, lng, post.lat, post.lng) <= radiusKm)
        .filter((post) => (!tag ? true : (post.tags ?? []).includes(tag)))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    upvote: async (postId: string): Promise<Post | null> => {
      this.db.prepare('UPDATE posts SET upvotes = upvotes + 1 WHERE id = ?').run(postId);
      return this.posts.findById(postId);
    },
    incrementComments: async (postId: string): Promise<void> => {
      this.db.prepare('UPDATE posts SET commentsCount = commentsCount + 1 WHERE id = ?').run(postId);
    }
  };

  comments = {
    create: async (comment: Comment): Promise<Comment> => {
      this.db.prepare('INSERT INTO comments (id, postId, userId, content, createdAt) VALUES (@id,@postId,@userId,@content,@createdAt)').run(comment);
      await this.posts.incrementComments(comment.postId);
      return comment;
    },
    listByPost: async (postId: string): Promise<Comment[]> => {
      const rows = this.db
        .prepare('SELECT * FROM comments WHERE postId = ? ORDER BY createdAt ASC')
        .all(postId) as Record<string, unknown>[];
      return rows.map((row) => row as unknown as Comment);
    }
  };

  businesses = {
    create: async (business: Business): Promise<Business> => {
      this.db
        .prepare(
          `INSERT INTO businesses (id, ownerUserId, name, category, shortDescription, city, locality, address, lat, lng, phone, whatsapp, imageUrl, avgRating, createdAt)
           VALUES (@id,@ownerUserId,@name,@category,@shortDescription,@city,@locality,@address,@lat,@lng,@phone,@whatsapp,@imageUrl,@avgRating,@createdAt)`
        )
        .run(business);
      return business;
    },
    findNearby: async (lat: number, lng: number, radiusKm: number, category?: string): Promise<Business[]> => {
      const rows = this.db.prepare('SELECT * FROM businesses').all() as Record<string, unknown>[];
      return rows
        .map((row) => ({ ...row, avgRating: Number(row.avgRating), lat: Number(row.lat), lng: Number(row.lng) }) as Business)
        .filter((item) => haversineKm(lat, lng, item.lat, item.lng) <= radiusKm)
        .filter((item) => (!category ? true : item.category === category))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  };

  societies = {
    create: async (society: Society): Promise<Society> => {
      this.db
        .prepare(
          'INSERT INTO societies (id, name, city, locality, accessCode, lat, lng, createdAt) VALUES (@id,@name,@city,@locality,@accessCode,@lat,@lng,@createdAt)'
        )
        .run(society);
      return society;
    },
    findById: async (id: string): Promise<Society | null> => {
      const row = this.db.prepare('SELECT * FROM societies WHERE id = ?').get(id) as Record<string, unknown> | undefined;
      return row ? ({ ...row, lat: Number(row.lat), lng: Number(row.lng) } as Society) : null;
    },
    findByLocality: async (city: string, locality: string): Promise<Society[]> => {
      const rows = this.db
        .prepare('SELECT * FROM societies WHERE city = ? AND locality = ? ORDER BY createdAt DESC')
        .all(city, locality) as Record<string, unknown>[];
      return rows.map((row) => ({ ...row, lat: Number(row.lat), lng: Number(row.lng) } as Society));
    },
    join: async (societyId: string, userId: string): Promise<void> => {
      this.db.prepare('INSERT OR IGNORE INTO society_members (societyId, userId) VALUES (?, ?)').run(societyId, userId);
    },
    listJoinedByUser: async (userId: string): Promise<Society[]> => {
      const rows = this.db
        .prepare(
          `SELECT s.* FROM societies s
           INNER JOIN society_members m ON m.societyId = s.id
           WHERE m.userId = ?
           ORDER BY s.createdAt DESC`
        )
        .all(userId) as Record<string, unknown>[];
      return rows.map((row) => ({ ...row, lat: Number(row.lat), lng: Number(row.lng) } as Society));
    }
  };

  channels = {
    create: async (channel: CircleChannel): Promise<CircleChannel> => {
      this.db.prepare('INSERT INTO channels (id, societyId, name, createdAt) VALUES (@id,@societyId,@name,@createdAt)').run(channel);
      return channel;
    },
    listBySociety: async (societyId: string): Promise<CircleChannel[]> => {
      const rows = this.db
        .prepare('SELECT * FROM channels WHERE societyId = ? ORDER BY createdAt ASC')
        .all(societyId) as Record<string, unknown>[];
      return rows.map((row) => row as unknown as CircleChannel);
    }
  };

  messages = {
    create: async (message: CircleMessage): Promise<CircleMessage> => {
      this.db
        .prepare('INSERT INTO messages (id, channelId, userId, content, createdAt) VALUES (@id,@channelId,@userId,@content,@createdAt)')
        .run(message);
      return message;
    },
    listByChannel: async (channelId: string, limit: number, before?: string): Promise<CircleMessage[]> => {
      const rows = before
        ? this.db
            .prepare(
              'SELECT * FROM messages WHERE channelId = ? AND createdAt < ? ORDER BY createdAt DESC LIMIT ?'
            )
            .all(channelId, before, limit)
        : this.db.prepare('SELECT * FROM messages WHERE channelId = ? ORDER BY createdAt DESC LIMIT ?').all(channelId, limit);
      return (rows as Record<string, unknown>[]).map((row) => row as unknown as CircleMessage).reverse();
    }
  };
}
