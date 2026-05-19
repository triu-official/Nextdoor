import type { CircleChannel, CircleMessage, Society } from '../../../shared/src/models';
import { apiFetch } from './client';

export async function listSocieties(city: string, locality: string): Promise<{ items: Society[] }> {
  const query = new URLSearchParams({ city, locality });
  return apiFetch(`/api/societies?${query.toString()}`);
}

export async function listJoinedSocieties(userId: string): Promise<{ items: Society[] }> {
  const query = new URLSearchParams({ userId });
  return apiFetch(`/api/societies?${query.toString()}`);
}

export async function createSociety(data: {
  name: string;
  city: string;
  locality: string;
  accessCode: string;
}): Promise<{ society: Society }> {
  return apiFetch('/api/societies', { method: 'POST', body: JSON.stringify(data) });
}

export async function joinSociety(societyId: string, data: { userId: string; accessCode: string }): Promise<{ joined: boolean }> {
  return apiFetch(`/api/societies/${societyId}/join`, { method: 'POST', body: JSON.stringify(data) });
}

export async function listChannels(societyId: string): Promise<{ items: CircleChannel[] }> {
  return apiFetch(`/api/channels/${societyId}`);
}

export async function createChannel(data: { societyId: string; name: string }): Promise<{ channel: CircleChannel }> {
  return apiFetch('/api/channels', { method: 'POST', body: JSON.stringify(data) });
}

export async function listMessages(channelId: string): Promise<{ items: CircleMessage[] }> {
  return apiFetch(`/api/messages/${channelId}?limit=100`);
}

export async function createMessage(channelId: string, data: { userId: string; content: string }): Promise<{ message: CircleMessage }> {
  return apiFetch(`/api/messages/${channelId}`, { method: 'POST', body: JSON.stringify(data) });
}
