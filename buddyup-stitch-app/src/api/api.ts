import * as SecureStore from 'expo-secure-store';
import type {
  User, Activity, Conversation, Message, Notification,
  Event, EventTicket, FriendRequest, Interest, AuthResponse,
} from './types';

export { API_BASE } from './client';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

// ─── Token storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'buddyup_jwt';

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const AUTH_BASE =
    process.env.EXPO_PUBLIC_API_BASE_URL
      ? process.env.EXPO_PUBLIC_API_BASE_URL.replace('/api/v1', '')
      : 'http://localhost:8080';
  return fetch(`${AUTH_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers as object) },
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await saveToken(data.token);
  return data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  await saveToken(data.token);
  return data;
}

export async function getMe(): Promise<User> {
  const token = await getToken();
  const AUTH_BASE =
    process.env.EXPO_PUBLIC_API_BASE_URL
      ? process.env.EXPO_PUBLIC_API_BASE_URL.replace('/api/v1', '')
      : 'http://localhost:8080';
  const res = await fetch(`${AUTH_BASE}/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getProfile = (): Promise<User> =>
  apiFetch('/profile');

export const updateProfile = (data: { name?: string; bio?: string; location?: string }): Promise<User> =>
  apiFetch('/profile', { method: 'PUT', body: JSON.stringify(data) });

// ─── Interests ────────────────────────────────────────────────────────────────

export const getInterests = (): Promise<Interest[]> =>
  apiFetch('/interests');

export const updateUserInterests = (interestIds: number[]): Promise<User> =>
  apiFetch('/interests', { method: 'PUT', body: JSON.stringify({ interestIds }) });

// ─── Activities ───────────────────────────────────────────────────────────────

export const getActivities = (category?: string): Promise<Activity[]> =>
  apiFetch(`/activities${category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''}`);

export const getActivity = (id: number): Promise<Activity> =>
  apiFetch(`/activities/${id}`);

export const createActivity = (data: {
  title: string;
  description: string;
  category: string;
  location: string;
}): Promise<Activity> =>
  apiFetch('/activities', { method: 'POST', body: JSON.stringify(data) });

export const joinActivity = (id: number): Promise<{ message: string }> =>
  apiFetch(`/activities/${id}/join`, { method: 'POST' });

// ─── Events & Tickets ─────────────────────────────────────────────────────────

export const getEvents = (): Promise<Event[]> =>
  apiFetch('/events');

export const getEvent = (id: number): Promise<Event> =>
  apiFetch(`/events/${id}`);

export const getMyTickets = (): Promise<EventTicket[]> =>
  apiFetch('/tickets');

export const getTicket = (ticketId: string): Promise<EventTicket> =>
  apiFetch(`/tickets/${ticketId}`);

// ─── Conversations & Messages ─────────────────────────────────────────────────

export const getConversations = (): Promise<Conversation[]> =>
  apiFetch('/conversations');

export const getMessages = (): Promise<Message[]> =>
  apiFetch('/messages');

export const sendMessage = (receiverId: number, content: string): Promise<Message> =>
  apiFetch('/messages', { method: 'POST', body: JSON.stringify({ receiverId, content }) });

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotifications = (): Promise<Notification[]> =>
  apiFetch('/notifications');

export const markNotificationsRead = (): Promise<{ message: string }> =>
  apiFetch('/notifications/read', { method: 'PUT' });

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const getLeaderboard = (): Promise<User[]> =>
  apiFetch('/leaderboard');

// ─── Friends & Suggestions ────────────────────────────────────────────────────

export const getFriends = (): Promise<User[]> =>
  apiFetch('/friends');

export const getUsers = (): Promise<User[]> =>
  apiFetch('/users');

export const getFriendSuggestions = (): Promise<User[]> =>
  apiFetch('/friend-suggestions');

export const getFriendRequests = (): Promise<FriendRequest[]> =>
  apiFetch('/friend-requests');

export const sendFriendRequest = (receiverId: number): Promise<FriendRequest> =>
  apiFetch('/friend-requests', { method: 'POST', body: JSON.stringify({ receiverId }) });

export const respondFriendRequest = (
  id: number,
  action: 'accept' | 'ignore',
): Promise<{ message: string }> =>
  apiFetch(`/friend-requests/${id}`, { method: 'PUT', body: JSON.stringify({ action }) });
