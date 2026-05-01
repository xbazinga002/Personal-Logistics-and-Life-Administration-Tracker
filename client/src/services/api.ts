import type { Item, Category, Tag, Notification, DashboardSummary } from '../types';

const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// Auth
export const auth = {
  register: (email: string, password: string) =>
    request<{ token: string; userId: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; userId: string; email: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
};

// Items
export const items = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Item[]>(`/items${qs}`);
  },
  get: (id: string) => request<Item>(`/items/${id}`),
  create: (data: Partial<Item> & { tag_ids?: string[] }) =>
    request<Item>('/items', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Item> & { tag_ids?: string[] }) =>
    request<Item>(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/items/${id}`, { method: 'DELETE' }),
  complete: (id: string) =>
    request<{ completedItem: Item; nextItem: Item | null }>(`/items/${id}/complete`, { method: 'POST' }),
};

// Dashboard
export const dashboard = {
  summary: () => request<DashboardSummary>('/dashboard/summary'),
};

// Categories
export const categories = {
  list: () => request<Category[]>('/categories'),
  create: (name: string) => request<Category>('/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  delete: (id: string) => request<void>(`/categories/${id}`, { method: 'DELETE' }),
};

// Tags
export const tags = {
  list: () => request<Tag[]>('/tags'),
  create: (name: string) => request<Tag>('/tags', { method: 'POST', body: JSON.stringify({ name }) }),
  delete: (id: string) => request<void>(`/tags/${id}`, { method: 'DELETE' }),
};

// Notifications
export const notifications = {
  list: (unreadOnly = false) =>
    request<{ notifications: Notification[]; unreadCount: number }>(
      `/notifications${unreadOnly ? '?unread=true' : ''}`
    ),
  markRead: (id: string) => request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => request<{ success: boolean }>('/notifications/read-all', { method: 'PUT' }),
};
