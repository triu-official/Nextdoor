import type { Comment, Post } from '../../../shared/src/models';
import { apiFetch } from './client';

export type FeedPost = Post & { authorName?: string };

export async function getFeed(userId: string, radiusKm: number, tag?: string): Promise<{ items: FeedPost[] }> {
  const query = new URLSearchParams({ userId, radiusKm: String(radiusKm) });
  if (tag) {
    query.set('tag', tag);
  }
  return apiFetch(`/api/feed?${query.toString()}`);
}

export async function createPost(data: {
  userId: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
}): Promise<{ post: Post }> {
  return apiFetch('/api/posts', { method: 'POST', body: JSON.stringify(data) });
}

export async function upvotePost(postId: string): Promise<{ post: Post }> {
  return apiFetch(`/api/posts/${postId}/upvote`, { method: 'POST' });
}

export async function getComments(postId: string): Promise<{ items: Comment[] }> {
  return apiFetch(`/api/posts/${postId}/comments`);
}

export async function addComment(postId: string, data: { userId: string; content: string }): Promise<{ comment: Comment }> {
  return apiFetch(`/api/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(data) });
}
