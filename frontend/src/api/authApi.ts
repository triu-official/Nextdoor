import type { User } from '../../../shared/src/models';
import { apiFetch } from './client';

export async function signUp(data: {
  name: string;
  phone: string;
  city: string;
  locality: string;
  pincode?: string;
}): Promise<{ user: User; otp: string }> {
  return apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) });
}

export async function verifyOtp(data: { userId: string; otp: string }): Promise<{ user: User }> {
  return apiFetch('/api/auth/verify', { method: 'POST', body: JSON.stringify(data) });
}

export async function getUser(userId: string): Promise<{ user: User }> {
  return apiFetch(`/api/users/${userId}`);
}
