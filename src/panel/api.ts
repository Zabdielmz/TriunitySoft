export interface Submission {
  id: string
  name: string
  email: string
  message: string
  category: string
  read: boolean
  createdAt: string
}

export interface NotifyEmail {
  id: string
  email: string
}

export interface SessionInfo {
  username: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      ...init,
      headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    })
  } catch {
    throw new Error('Sin conexión con el servidor')
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Error ${response.status}`)
  }
  return (await response.json()) as T
}

export const api = {
  session: () => request<SessionInfo>('/api/auth/session'),
  login: (username: string, password: string) =>
    request<{ ok: true; username: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
  submissions: () => request<{ submissions: Submission[] }>('/api/admin/submissions'),
  markRead: (id: string, read: boolean) =>
    request<{ ok: true }>('/api/admin/submissions', {
      method: 'PATCH',
      body: JSON.stringify({ id, read }),
    }),
  notifyEmails: () => request<{ emails: NotifyEmail[] }>('/api/admin/notify'),
  addNotifyEmail: (email: string) =>
    request<{ ok: true }>('/api/admin/notify', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  removeNotifyEmail: (id: string) =>
    request<{ ok: true }>(`/api/admin/notify?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
}
