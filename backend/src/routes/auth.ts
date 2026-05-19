import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { generateOtp, getLocalityCoordinates, localitySeed } from '../../../shared/src/geo';
import type { RepositoryBundle } from '../types/repositories';
import type { User } from '../../../shared/src/models';

export function authRouter(repos: RepositoryBundle, otpStore: Map<string, string>): Router {
  const router = Router();
  const authLimiter = rateLimit({
    windowMs: 60_000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Please try again later.' }
  });

  const signUpSchema = z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    city: z.string().min(2),
    locality: z.string().min(2),
    pincode: z.string().optional()
  });

  router.post('/signup', async (req, res, next) => {
    try {
      const payload = signUpSchema.parse(req.body);
      const existing = await repos.users.findByPhone(payload.phone);
      if (existing) {
        return res.status(409).json({ error: 'Phone already registered' });
      }

      const location = getLocalityCoordinates(payload.city, payload.locality);
      if (!location) {
        return res.status(400).json({ error: 'Unknown city/locality', supportedLocalities: localitySeed });
      }

      const user: User = {
        id: nanoid(),
        name: payload.name,
        phone: payload.phone,
        city: payload.city,
        locality: payload.locality,
        pincode: payload.pincode,
        lat: location.lat,
        lng: location.lng,
        isVerified: false,
        createdAt: new Date().toISOString()
      };

      const created = await repos.users.create(user);
      const otp = generateOtp();
      otpStore.set(created.id, otp);
      return res.status(201).json({ user: created, otp });
    } catch (error) {
      return next(error);
    }
  });

  const verifySchema = z.object({ userId: z.string().min(1), otp: z.string().min(4) });

  router.post('/verify', authLimiter, async (req, res, next) => {
    try {
      const payload = verifySchema.parse(req.body);
      const expected = otpStore.get(payload.userId);
      if (!expected || expected !== payload.otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
      const user = await repos.users.verify(payload.userId);
      otpStore.delete(payload.userId);
      return res.json({ user });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/request-otp', authLimiter, async (req, res, next) => {
    try {
      const payload = z.object({ userId: z.string().min(1) }).parse(req.body);
      const user = await repos.users.findById(payload.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const otp = generateOtp();
      otpStore.set(user.id, otp);
      return res.json({ otp });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/users/:id', async (req, res) => {
    const user = await repos.users.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  });

  return router;
}
