import type { Business, CircleChannel, CircleMessage, Comment, Post, Society, User } from '../../../shared/src/models';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  verify(id: string): Promise<User | null>;
}

export interface IPostRepository {
  create(post: Post): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  findNearby(lat: number, lng: number, radiusKm: number, tag?: string): Promise<Post[]>;
  upvote(postId: string): Promise<Post | null>;
  incrementComments(postId: string): Promise<void>;
}

export interface ICommentRepository {
  create(comment: Comment): Promise<Comment>;
  listByPost(postId: string): Promise<Comment[]>;
}

export interface IBusinessRepository {
  create(business: Business): Promise<Business>;
  findNearby(lat: number, lng: number, radiusKm: number, category?: string): Promise<Business[]>;
}

export interface ISocietyRepository {
  create(society: Society): Promise<Society>;
  findById(id: string): Promise<Society | null>;
  findByLocality(city: string, locality: string): Promise<Society[]>;
  join(societyId: string, userId: string): Promise<void>;
  listJoinedByUser(userId: string): Promise<Society[]>;
}

export interface ICircleChannelRepository {
  create(channel: CircleChannel): Promise<CircleChannel>;
  listBySociety(societyId: string): Promise<CircleChannel[]>;
}

export interface ICircleMessageRepository {
  create(message: CircleMessage): Promise<CircleMessage>;
  listByChannel(channelId: string, limit: number, before?: string): Promise<CircleMessage[]>;
}

export interface RepositoryBundle {
  users: IUserRepository;
  posts: IPostRepository;
  comments: ICommentRepository;
  businesses: IBusinessRepository;
  societies: ISocietyRepository;
  channels: ICircleChannelRepository;
  messages: ICircleMessageRepository;
}
