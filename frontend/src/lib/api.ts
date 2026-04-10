/**
 * API client for communicating with the Laravel backend.
 * Provides centralized error handling, auth headers, and typed responses.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface TaskResponse {
  message: string;
  task: Task;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const error: ApiError = {
      message: data.message || 'An unexpected error occurred.',
      errors: data.errors,
      status: response.status,
    };
    throw error;
  }

  return data as T;
}

// ---- Auth API ----

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  await apiRequest('/logout', { method: 'POST' });
}

export async function getMe(): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('/me');
}

// ---- Tasks API ----

export async function getTasks(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}): Promise<PaginatedResponse<Task>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));
  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  return apiRequest<PaginatedResponse<Task>>(`/tasks${query ? `?${query}` : ''}`);
}

export async function createTask(data: {
  title: string;
  description?: string;
  status?: string;
}): Promise<TaskResponse> {
  return apiRequest<TaskResponse>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTask(
  id: number,
  data: Partial<{ title: string; description: string; status: string }>
): Promise<TaskResponse> {
  return apiRequest<TaskResponse>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTask(id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/tasks/${id}`, {
    method: 'DELETE',
  });
}
