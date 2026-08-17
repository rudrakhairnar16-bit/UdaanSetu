const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('udaan_token', token);
    } else {
      localStorage.removeItem('udaan_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = typeof window !== 'undefined' ? localStorage.getItem('udaan_token') : null;
    }
    return this.token;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
    if (res.status === 401) {
      this.setToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      throw new Error('Session expired. Please log in again.');
    }
    if (!res.ok) {
      const body = await res.text();
      let msg = `Error ${res.status}`;
      try {
        const json = JSON.parse(body);
        msg = json.detail || msg;
      } catch {}
      throw new Error(msg);
    }
    return res.json();
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: any): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: any): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  async upload(path: string, formData: FormData): Promise<any> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(body || 'Upload failed');
    }
    return res.json();
  }
}

export const api = new ApiClient();
