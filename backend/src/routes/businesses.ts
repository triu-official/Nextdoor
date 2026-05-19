import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import type { Business } from '../../../shared/src/models';
import { getLocalityCoordinates } from '../../../shared/src/geo';
import type { RepositoryBundle } from '../types/repositories';

export function businessRouter(repos: RepositoryBundle): Router {
  const router = Router();

  router.get('/businesses', async (req, res) => {
    const payload = z
      .object({
        userId: z.string().min(1),
        category: z.string().optional(),
        radiusKm: z.coerce.number().positive().optional()
      })
      .parse(req.query);
    const user = await repos.users.findById(payload.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const items = await repos.businesses.findNearby(user.lat, user.lng, payload.radiusKm ?? 3, payload.category);
    return res.json({ items });
  });

  router.post('/businesses', async (req, res, next) => {
    try {
      const payload = z
        .object({
          ownerUserId: z.string().optional(),
          name: z.string().min(2),
          category: z.string().min(2),
          shortDescription: z.string().min(2),
          city: z.string().min(2),
          locality: z.string().min(2),
          address: z.string().min(2),
          lat: z.number().optional(),
          lng: z.number().optional(),
          phone: z.string().min(8),
          whatsapp: z.string().optional(),
          imageUrl: z.string().url().optional(),
          avgRating: z.number().min(0).max(5).default(4)
        })
        .parse(req.body);

      const location = payload.lat && payload.lng ? { lat: payload.lat, lng: payload.lng } : getLocalityCoordinates(payload.city, payload.locality);
      if (!location) {
        return res.status(400).json({ error: 'Unknown city/locality' });
      }

      const business: Business = {
        id: nanoid(),
        ownerUserId: payload.ownerUserId,
        name: payload.name,
        category: payload.category,
        shortDescription: payload.shortDescription,
        city: payload.city,
        locality: payload.locality,
        address: payload.address,
        lat: location.lat,
        lng: location.lng,
        phone: payload.phone,
        whatsapp: payload.whatsapp,
        imageUrl: payload.imageUrl,
        avgRating: payload.avgRating,
        createdAt: new Date().toISOString()
      };

      const created = await repos.businesses.create(business);
      return res.status(201).json({ business: created });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
