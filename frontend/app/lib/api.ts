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

// SIH26136 — Startup Procurement API methods
export const challenges = {
  list: (params?: string) => api.get<any[]>(`/challenges${params ? `?${params}` : ''}`),
  get: (id: number) => api.get<any>(`/challenges/${id}`),
  create: (data: any) => api.post<any>('/challenges', data),
  update: (id: number, data: any) => api.patch<any>(`/challenges/${id}`, data),
  delete: (id: number) => api.delete<any>(`/challenges/${id}`),
  validate: (id: number) => api.post<any>(`/challenges/${id}/validate`),
  publish: (id: number) => api.post<any>(`/challenges/${id}/publish`),
  my: () => api.get<any[]>('/challenges/my'),
};

export const departments = {
  list: (params?: string) => api.get<any[]>(`/departments${params ? `?${params}` : ''}`),
  get: (id: number) => api.get<any>(`/departments/${id}`),
  create: (data: any) => api.post<any>('/departments', data),
  update: (id: number, data: any) => api.patch<any>(`/departments/${id}`, data),
  delete: (id: number) => api.delete<any>(`/departments/${id}`),
};

export const pilots = {
  list: (params?: string) => api.get<any[]>(`/pilots${params ? `?${params}` : ''}`),
  get: (id: number) => api.get<any>(`/pilots/${id}`),
  create: (data: any) => api.post<any>('/pilots', data),
  update: (id: number, data: any) => api.patch<any>(`/pilots/${id}`, data),
  delete: (id: number) => api.delete<any>(`/pilots/${id}`),
  start: (id: number) => api.post<any>(`/pilots/${id}/start`),
  approve: (id: number) => api.post<any>(`/pilots/${id}/approve`),
  complete: (id: number) => api.post<any>(`/pilots/${id}/complete`),
  milestones: (pilotId: number) => api.get<any[]>(`/pilots/${pilotId}/milestones`),
  createMilestone: (pilotId: number, data: any) => api.post<any>(`/pilots/${pilotId}/milestones`, data),
  approveMilestone: (milestoneId: number) => api.post<any>(`/pilots/milestones/${milestoneId}/approve`),
  completeMilestone: (milestoneId: number) => api.post<any>(`/pilots/milestones/${milestoneId}/complete`),
};

export const payments = {
  list: (params?: string) => api.get<any[]>(`/payments${params ? `?${params}` : ''}`),
  get: (id: number) => api.get<any>(`/payments/${id}`),
  create: (data: any) => api.post<any>('/payments', data),
  update: (id: number, data: any) => api.patch<any>(`/payments/${id}`, data),
  process: (id: number) => api.post<any>(`/payments/${id}/process`),
  complete: (id: number) => api.post<any>(`/payments/${id}/complete`),
  delete: (id: number) => api.delete<any>(`/payments/${id}`),
};

export const evaluations = {
  list: (params?: string) => api.get<any[]>(`/evaluations${params ? `?${params}` : ''}`),
  get: (id: number) => api.get<any>(`/evaluations/${id}`),
  create: (data: any) => api.post<any>('/evaluations', data),
  update: (id: number, data: any) => api.patch<any>(`/evaluations/${id}`, data),
  delete: (id: number) => api.delete<any>(`/evaluations/${id}`),
};

export const scaleUpDecisions = {
  list: (params?: string) => api.get<any[]>(`/scale-up-decisions${params ? `?${params}` : ''}`),
  get: (id: number) => api.get<any>(`/scale-up-decisions/${id}`),
  create: (data: any) => api.post<any>('/scale-up-decisions', data),
  update: (id: number, data: any) => api.patch<any>(`/scale-up-decisions/${id}`, data),
  delete: (id: number) => api.delete<any>(`/scale-up-decisions/${id}`),
};

export const templates = {
  list: (params?: string) => api.get<any[]>(`/templates${params ? `?${params}` : ''}`),
  get: (id: number) => api.get<any>(`/templates/${id}`),
  create: (data: any) => api.post<any>('/templates', data),
  update: (id: number, data: any) => api.patch<any>(`/templates/${id}`, data),
  delete: (id: number) => api.delete<any>(`/templates/${id}`),
};

export const ai = {
  matchStartups: (challengeId: number, topK?: number) => api.get<any>(`/ai/match-startup/${challengeId}${topK ? `?top_k=${topK}` : ''}`),
  pilotRisk: (pilotId: number) => api.get<any>(`/ai/pilot-risk/${pilotId}`),
  scalePredict: (pilotId: number) => api.get<any>(`/ai/scale-predict/${pilotId}`),
  challengeDraft: (data: any) => api.post<any>('/ai/challenge-draft', data),
};

export const analytics = {
  maharashtra: () => api.get<any>('/analytics/maharashtra'),
  pipelineFunnel: () => api.get<Record<string, number>>('/analytics/pipeline-funnel'),
  tat: () => api.get<Record<string, number>>('/analytics/tat'),
};

export const applications = {
  list: (params?: string) => api.get<any[]>(`/applications${params ? `?${params}` : ''}`),
  get: (id: number) => api.get<any>(`/applications/${id}`),
  create: (data: any) => api.post<any>('/applications', data),
  update: (id: number, data: any) => api.patch<any>(`/applications/${id}`, data),
  submit: (id: number) => api.post<any>(`/applications/${id}/submit`),
  delete: (id: number) => api.delete<any>(`/applications/${id}`),
  eligibilityCheck: (id: number) => api.post<any>(`/applications/${id}/eligibility-check`),
  eligibilityOverride: (id: number, reason: string) => api.post<any>(`/applications/${id}/eligibility-override?reason=${reason}`),
  coi: (id: number, data: any) => api.post<any>(`/applications/${id}/coi`, data),
};

export const validations = {
  list: () => api.get<any[]>('/validations'),
  get: (id: number) => api.get<any>(`/validations/${id}`),
  create: (pilotId: number, data: any) => api.post<any>(`/validations?pilot_id=${pilotId}`, data),
  update: (id: number, data: any) => api.patch<any>(`/validations/${id}`, data),
  delete: (id: number) => api.delete<any>(`/validations/${id}`),
  pilotMetrics: (pilotId: number) => api.get<any[]>(`/validations/pilot/${pilotId}/metrics`),
  createMetric: (pilotId: number, data: any) => api.post<any>(`/validations/pilot/${pilotId}/metrics`, data),
  pilotEvidence: (pilotId: number) => api.get<any[]>(`/validations/pilot/${pilotId}/evidence`),
  createEvidence: (pilotId: number, data: any) => api.post<any>(`/validations/pilot/${pilotId}/evidence`, data),
};

export const procurements = {
  list: () => api.get<any[]>('/procurements'),
  get: (id: number) => api.get<any>(`/procurements/${id}`),
  create: (pilotId: number, data?: any) => api.post<any>(`/procurements?pilot_id=${pilotId}`, data),
  update: (id: number, data: any) => api.patch<any>(`/procurements/${id}`, data),
  approve: (id: number) => api.post<any>(`/procurements/${id}/approve`),
  delete: (id: number) => api.delete<any>(`/procurements/${id}`),
};

export const grievances = {
  list: (status?: string) => api.get<any[]>(`/grievances${status ? `?status=${status}` : ''}`),
  get: (id: number) => api.get<any>(`/grievances/${id}`),
  create: (data: any) => api.post<any>('/grievances', data),
  update: (id: number, data: any) => api.patch<any>(`/grievances/${id}`, data),
  delete: (id: number) => api.delete<any>(`/grievances/${id}`),
};
