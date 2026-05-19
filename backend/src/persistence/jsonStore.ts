import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Business, CircleChannel, CircleMessage, Comment, Post, Society, User } from '../../../shared/src/models';
import { haversineKm } from '../../../shared/src/geo';
import type { RepositoryBundle } from '../types/repositories';

type DbShape = {
  users: User[];
  posts: Post[];
  comments: Comment[];
  businesses: Business[];
  societies: Society[];
  channels: CircleChannel[];
  messages: CircleMessage[];
  societyMembers: Array<{ societyId: string; userId: string }>;
};

const files: Record<keyof DbShape, string> = {
  users: 'users.json',
  posts: 'posts.json',
  comments: 'comments.json',
  businesses: 'businesses.json',
  societies: 'societies.json',
  channels: 'channels.json',
  messages: 'messages.json',
  societyMembers: 'societyMembers.json'
};

export class JsonStore implements RepositoryBundle {
  private readonly dbDir = path.resolve(process.cwd(), '../data/json');
  private data: DbShape = {
    users: [],
    posts: [],
    comments: [],
    businesses: [],
    societies: [],
    channels: [],
    messages: [],
    societyMembers: []
  };

  private writeQueue = Promise.resolve();

  async init(): Promise<void> {
    await fs.mkdir(this.dbDir, { recursive: true });
    await Promise.all(
      Object.entries(files).map(async ([key, fileName]) => {
        const filePath = path.join(this.dbDir, fileName);
        try {
          await fs.access(filePath);
        } catch {
          await fs.writeFile(filePath, '[]', 'utf8');
        }
        const content = await fs.readFile(filePath, 'utf8');
        (this.data as Record<string, unknown>)[key] = JSON.parse(content);
      })
    );
  }

  private enqueueFlush(): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      await Promise.all(
        Object.entries(files).map(([key, fileName]) =>
          fs.writeFile(path.join(this.dbDir, fileName), JSON.stringify((this.data as Record<string, unknown>)[key], null, 2), 'utf8')
        )
      );
    });
    return this.writeQueue;
  }

  users = {
    create: async (user: User): Promise<User> => {
      this.data.users.push(user);
      await this.enqueueFlush();
      return user;
    },
    findById: async (id: string): Promise<User | null> => this.data.users.find((item) => item.id === id) ?? null,
    findByPhone: async (phone: string): Promise<User | null> => this.data.users.find((item) => item.phone === phone) ?? null,
    verify: async (id: string): Promise<User | null> => {
      const user = this.data.users.find((item) => item.id === id);
      if (!user) {
        return null;
      }
      user.isVerified = true;
      await this.enqueueFlush();
      return user;
    }
  };

  posts = {
    create: async (post: Post): Promise<Post> => {
      this.data.posts.push(post);
      await this.enqueueFlush();
      return post;
    },
    findById: async (id: string): Promise<Post | null> => this.data.posts.find((item) => item.id === id) ?? null,
    findNearby: async (lat: number, lng: number, radiusKm: number, tag?: string): Promise<Post[]> => {
      return this.data.posts
        .filter((post) => haversineKm(lat, lng, post.lat, post.lng) <= radiusKm)
        .filter((post) => (!tag ? true : (post.tags ?? []).includes(tag)))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    upvote: async (postId: string): Promise<Post | null> => {
      const post = this.data.posts.find((item) => item.id === postId);
      if (!post) {
        return null;
      }
      post.upvotes += 1;
      await this.enqueueFlush();
      return post;
    },
    incrementComments: async (postId: string): Promise<void> => {
      const post = this.data.posts.find((item) => item.id === postId);
      if (post) {
        post.commentsCount += 1;
        await this.enqueueFlush();
      }
    }
  };

  comments = {
    create: async (comment: Comment): Promise<Comment> => {
      this.data.comments.push(comment);
      await this.posts.incrementComments(comment.postId);
      await this.enqueueFlush();
      return comment;
    },
    listByPost: async (postId: string): Promise<Comment[]> =>
      this.data.comments.filter((item) => item.postId === postId).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  };

  businesses = {
    create: async (business: Business): Promise<Business> => {
      this.data.businesses.push(business);
      await this.enqueueFlush();
      return business;
    },
    findNearby: async (lat: number, lng: number, radiusKm: number, category?: string): Promise<Business[]> => {
      return this.data.businesses
        .filter((item) => haversineKm(lat, lng, item.lat, item.lng) <= radiusKm)
        .filter((item) => (!category ? true : item.category === category))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  };

  societies = {
    create: async (society: Society): Promise<Society> => {
      this.data.societies.push(society);
      await this.enqueueFlush();
      return society;
    },
    findById: async (id: string): Promise<Society | null> => this.data.societies.find((item) => item.id === id) ?? null,
    findByLocality: async (city: string, locality: string): Promise<Society[]> =>
      this.data.societies.filter((item) => item.city === city && item.locality === locality),
    join: async (societyId: string, userId: string): Promise<void> => {
      const exists = this.data.societyMembers.some((item) => item.societyId === societyId && item.userId === userId);
      if (!exists) {
        this.data.societyMembers.push({ societyId, userId });
        await this.enqueueFlush();
      }
    },
    listJoinedByUser: async (userId: string): Promise<Society[]> => {
      const ids = new Set(this.data.societyMembers.filter((item) => item.userId === userId).map((item) => item.societyId));
      return this.data.societies.filter((item) => ids.has(item.id));
    }
  };

  channels = {
    create: async (channel: CircleChannel): Promise<CircleChannel> => {
      this.data.channels.push(channel);
      await this.enqueueFlush();
      return channel;
    },
    listBySociety: async (societyId: string): Promise<CircleChannel[]> =>
      this.data.channels.filter((item) => item.societyId === societyId).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  };

  messages = {
    create: async (message: CircleMessage): Promise<CircleMessage> => {
      this.data.messages.push(message);
      await this.enqueueFlush();
      return message;
    },
    listByChannel: async (channelId: string, limit: number, before?: string): Promise<CircleMessage[]> => {
      let items = this.data.messages.filter((item) => item.channelId === channelId);
      if (before) {
        items = items.filter((item) => item.createdAt < before);
      }
      return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit).reverse();
    }
  };
}
