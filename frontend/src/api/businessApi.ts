import type { Business } from '../../../shared/src/models';
import { apiFetch } from './client';

export async function getBusinesses(userId: string, radiusKm: number, category?: string): Promise<{ items: Business[] }> {
  const query = new URLSearchParams({ userId, radiusKm: String(radiusKm) });
  if (category) {
    query.set('category', category);
  }
  return apiFetch(`/api/businesses?${query.toString()}`);
}

export async function createBusiness(data: Omit<Business, 'id' | 'createdAt'>): Promise<{ business: Business }> {
  return apiFetch('/api/businesses', { method: 'POST', body: JSON.stringify(data) });
}
