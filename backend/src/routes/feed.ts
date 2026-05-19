import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import type { Comment, Post } from '../../../shared/src/models';
import type { RepositoryBundle } from '../types/repositories';

export function feedRouter(repos: RepositoryBundle): Router {
  const router = Router();

  router.get('/feed', async (req, res) => {
    const parsed = z
      .object({
        userId: z.string().min(1),
        radiusKm: z.coerce.number().positive().optional(),
        tag: z.string().optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(50).optional()
      })
      .parse(req.query);

    const user = await repos.users.findById(parsed.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const radiusKm = parsed.radiusKm ?? 3;
    const page = parsed.page ?? 1;
    const limit = parsed.limit ?? 20;

    const all = await repos.posts.findNearby(user.lat, user.lng, radiusKm, parsed.tag);
    const items = all.slice((page - 1) * limit, page * limit);
    const itemsWithAuthors = await Promise.all(
      items.map(async (post) => {
        const author = await repos.users.findById(post.userId);
        return { ...post, authorName: author?.name ?? 'Neighbor' };
      })
    );
    return res.json({ items: itemsWithAuthors, page, total: all.length });
  });

  router.post('/posts', async (req, res, next) => {
    try {
      const payload = z
        .object({
          userId: z.string().min(1),
          content: z.string().min(1),
          imageUrl: z.string().url().optional(),
          tags: z.array(z.string()).optional(),
          pollOptions: z.array(z.string()).optional()
        })
        .parse(req.body);

      const user = await repos.users.findById(payload.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const post: Post = {
        id: nanoid(),
        userId: user.id,
        content: payload.content,
        imageUrl: payload.imageUrl,
        tags: payload.tags,
        pollOptions: payload.pollOptions,
        city: user.city,
        locality: user.locality,
        lat: user.lat,
        lng: user.lng,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        commentsCount: 0
      };
      const created = await repos.posts.create(post);
      return res.status(201).json({ post: created });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/posts/:postId/upvote', async (req, res) => {
    const post = await repos.posts.upvote(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.json({ post });
  });

  router.get('/posts/:postId/comments', async (req, res) => {
    const comments = await repos.comments.listByPost(req.params.postId);
    return res.json({ items: comments });
  });

  router.post('/posts/:postId/comments', async (req, res, next) => {
    try {
      const payload = z.object({ userId: z.string().min(1), content: z.string().min(1) }).parse(req.body);
      const user = await repos.users.findById(payload.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const comment: Comment = {
        id: nanoid(),
        postId: req.params.postId,
        userId: payload.userId,
        content: payload.content,
        createdAt: new Date().toISOString()
      };
      const created = await repos.comments.create(comment);
      return res.status(201).json({ comment: created });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
