import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { getLocalityCoordinates } from '../../../shared/src/geo';
import type { CircleChannel, CircleMessage, Society } from '../../../shared/src/models';
import type { RepositoryBundle } from '../types/repositories';

export function circlesRouter(repos: RepositoryBundle): Router {
  const router = Router();

  router.get('/societies', async (req, res) => {
    const payload = z.object({ city: z.string().optional(), locality: z.string().optional(), userId: z.string().optional() }).parse(req.query);
    if (payload.userId) {
      const joined = await repos.societies.listJoinedByUser(payload.userId);
      return res.json({ items: joined });
    }
    if (!payload.city || !payload.locality) {
      return res.status(400).json({ error: 'city and locality are required unless userId is provided' });
    }
    const items = await repos.societies.findByLocality(payload.city, payload.locality);
    return res.json({ items });
  });

  router.post('/societies', async (req, res, next) => {
    try {
      const payload = z
        .object({
          name: z.string().min(2),
          city: z.string().min(2),
          locality: z.string().min(2),
          accessCode: z.string().min(3)
        })
        .parse(req.body);
      const location = getLocalityCoordinates(payload.city, payload.locality);
      if (!location) {
        return res.status(400).json({ error: 'Unknown city/locality' });
      }

      const society: Society = {
        id: nanoid(),
        name: payload.name,
        city: payload.city,
        locality: payload.locality,
        accessCode: payload.accessCode,
        lat: location.lat,
        lng: location.lng,
        createdAt: new Date().toISOString()
      };
      const created = await repos.societies.create(society);
      await repos.channels.create({ id: nanoid(), societyId: created.id, name: 'Maintenance', createdAt: new Date().toISOString() });
      await repos.channels.create({ id: nanoid(), societyId: created.id, name: 'Security', createdAt: new Date().toISOString() });
      return res.status(201).json({ society: created });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/societies/:societyId/join', async (req, res, next) => {
    try {
      const payload = z.object({ userId: z.string().min(1), accessCode: z.string().min(3) }).parse(req.body);
      const society = await repos.societies.findById(req.params.societyId);
      if (!society) {
        return res.status(404).json({ error: 'Society not found' });
      }
      if (society.accessCode !== payload.accessCode) {
        return res.status(400).json({ error: 'Invalid access code' });
      }
      await repos.societies.join(society.id, payload.userId);
      return res.json({ joined: true });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/channels/:societyId', async (req, res) => {
    const items = await repos.channels.listBySociety(req.params.societyId);
    return res.json({ items });
  });

  router.post('/channels', async (req, res, next) => {
    try {
      const payload = z.object({ societyId: z.string().min(1), name: z.string().min(2) }).parse(req.body);
      const channel: CircleChannel = {
        id: nanoid(),
        societyId: payload.societyId,
        name: payload.name,
        createdAt: new Date().toISOString()
      };
      const created = await repos.channels.create(channel);
      return res.status(201).json({ channel: created });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/messages/:channelId', async (req, res) => {
    const query = z.object({ limit: z.coerce.number().int().positive().max(200).optional(), before: z.string().optional() }).parse(req.query);
    const items = await repos.messages.listByChannel(req.params.channelId, query.limit ?? 50, query.before);
    return res.json({ items });
  });

  router.post('/messages/:channelId', async (req, res, next) => {
    try {
      const payload = z.object({ userId: z.string().min(1), content: z.string().min(1) }).parse(req.body);
      const message: CircleMessage = {
        id: nanoid(),
        channelId: req.params.channelId,
        userId: payload.userId,
        content: payload.content,
        createdAt: new Date().toISOString()
      };
      const created = await repos.messages.create(message);
      return res.status(201).json({ message: created });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
